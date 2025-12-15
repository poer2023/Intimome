export interface SessionData {
  userId: number;
  username: string;
  email?: string;
  displayName?: string;
  provider?: 'local' | 'google';
}

const SESSION_COOKIE_NAME = 'intimome_session_v1';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

type StoredSession = { value: string; expiresAt: number };
const memorySessions = new Map<string, StoredSession>();

async function sessionsGet(env: { SESSIONS?: KVNamespace }, key: string): Promise<string | null> {
  if (env.SESSIONS) return env.SESSIONS.get(key);
  const stored = memorySessions.get(key);
  if (!stored) return null;
  if (stored.expiresAt < Date.now()) {
    memorySessions.delete(key);
    return null;
  }
  return stored.value;
}

async function sessionsPut(env: { SESSIONS?: KVNamespace }, key: string, value: string, ttlSeconds: number): Promise<void> {
  if (env.SESSIONS) {
    await env.SESSIONS.put(key, value, { expirationTtl: ttlSeconds });
    return;
  }
  memorySessions.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

async function sessionsDelete(env: { SESSIONS?: KVNamespace }, key: string): Promise<void> {
  if (env.SESSIONS) {
    await env.SESSIONS.delete(key);
    return;
  }
  memorySessions.delete(key);
}

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map(part => {
      const [k, ...rest] = part.trim().split('=');
      return [k, rest.join('=')];
    }).filter(([k]) => k)
  );
}

export function getSessionId(request: Request): string | null {
  const cookies = parseCookies(request.headers.get('Cookie'));
  if (cookies[SESSION_COOKIE_NAME]) return cookies[SESSION_COOKIE_NAME];
  const auth = request.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function getSession(env: { SESSIONS?: KVNamespace }, request: Request): Promise<(SessionData & { sessionId: string }) | null> {
  const sessionId = getSessionId(request);
  if (!sessionId) return null;
  const raw = await sessionsGet(env, sessionId);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as SessionData;
    if (!data?.userId || !data?.username) return null;
    return { sessionId, ...data };
  } catch {
    return null;
  }
}

export async function createSession(env: { SESSIONS?: KVNamespace }, data: SessionData): Promise<string> {
  const sessionId = crypto.randomUUID();
  await sessionsPut(env, sessionId, JSON.stringify(data), SESSION_TTL_SECONDS);
  return sessionId;
}

function isSecureRequest(requestUrl?: string): boolean {
  if (!requestUrl) return true;
  try {
    return new URL(requestUrl).protocol === 'https:';
  } catch {
    return true;
  }
}

export function buildSessionCookie(sessionId: string, requestUrl?: string): string {
  const secureAttr = isSecureRequest(requestUrl) ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${sessionId}; HttpOnly${secureAttr}; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie(requestUrl?: string): string {
  const secureAttr = isSecureRequest(requestUrl) ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=; HttpOnly${secureAttr}; SameSite=Lax; Path=/; Max-Age=0`;
}

export async function requireAuth(env: { SESSIONS?: KVNamespace }, request: Request): Promise<{ session: SessionData & { sessionId: string } } | { response: Response }> {
  const session = await getSession(env, request);
  if (!session) {
    return {
      response: new Response(
        JSON.stringify({ success: false, message: '未登录' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }
  return { session };
}

export async function destroySession(env: { SESSIONS?: KVNamespace }, sessionId: string): Promise<void> {
  await sessionsDelete(env, sessionId);
}

// CSRF Token Management
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  const bytes = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Store CSRF token in session
 */
export async function setCsrfToken(env: { SESSIONS?: KVNamespace }, sessionId: string): Promise<string> {
  const token = generateCsrfToken();
  const csrfKey = `csrf:${sessionId}`;
  await sessionsPut(env, csrfKey, token, SESSION_TTL_SECONDS);
  return token;
}

/**
 * Get CSRF token from session
 */
export async function getCsrfToken(env: { SESSIONS?: KVNamespace }, sessionId: string): Promise<string | null> {
  const csrfKey = `csrf:${sessionId}`;
  return sessionsGet(env, csrfKey);
}

/**
 * Validate CSRF token from request header
 * Returns true if valid, false otherwise
 */
export async function validateCsrf(
  env: { SESSIONS?: KVNamespace },
  request: Request,
  sessionId: string
): Promise<boolean> {
  // Skip CSRF check for safe methods
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  const requestToken = request.headers.get('X-CSRF-Token');
  if (!requestToken) {
    return false;
  }

  const storedToken = await getCsrfToken(env, sessionId);
  if (!storedToken) {
    return false;
  }

  // Constant-time comparison
  if (requestToken.length !== storedToken.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < requestToken.length; i++) {
    result |= requestToken.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Require authentication with CSRF validation
 */
export async function requireAuthWithCsrf(
  env: { SESSIONS?: KVNamespace },
  request: Request
): Promise<{ session: SessionData & { sessionId: string }; csrfToken: string } | { response: Response }> {
  const session = await getSession(env, request);
  if (!session) {
    return {
      response: new Response(
        JSON.stringify({ success: false, message: '未登录' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  const csrfValid = await validateCsrf(env, request, session.sessionId);
  if (!csrfValid) {
    return {
      response: new Response(
        JSON.stringify({ success: false, message: 'CSRF token 无效' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  // Get or generate CSRF token for response
  let csrfToken = await getCsrfToken(env, session.sessionId);
  if (!csrfToken) {
    csrfToken = await setCsrfToken(env, session.sessionId);
  }

  return { session, csrfToken };
}

