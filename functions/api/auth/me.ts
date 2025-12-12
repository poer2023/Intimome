import { requireAuth } from '../_auth';

interface Env {
  SESSIONS: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const auth = await requireAuth(env, request);
  if ('response' in auth) return auth.response;
  const { session } = auth;

  return new Response(
    JSON.stringify({
      success: true,
      user: {
        username: session.username,
        email: session.email,
        displayName: session.displayName || session.username,
        provider: session.provider,
      }
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
