import { buildSessionCookie, createSession } from '../_auth';
import { ensureSchema } from '../_schema';

interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  GOOGLE_CLIENT_ID: string;
}

type GoogleTokenInfo = {
  sub: string;
  aud: string;
  email?: string;
  email_verified?: string;
  name?: string;
  picture?: string;
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  try {
    await ensureSchema(env.DB);
    const body = await request.json() as { credential?: string };
    const credential = body?.credential;
    if (!credential) {
      return new Response(
        JSON.stringify({ success: false, message: '缺少 credential' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!verifyRes.ok) {
      return new Response(
        JSON.stringify({ success: false, message: 'Google token 校验失败' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const info = await verifyRes.json() as GoogleTokenInfo;
    if (env.GOOGLE_CLIENT_ID && info.aud !== env.GOOGLE_CLIENT_ID) {
      return new Response(
        JSON.stringify({ success: false, message: '无效的 Google Client' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const googleSub = info.sub;
    const email = info.email;
    const baseDisplayName = (info.name || '').trim();
    const displayName = baseDisplayName
      || (email ? email.split('@')[0] : '')
      || `google_${googleSub.slice(0, 8)}`;
    const username = email || `google_${googleSub.slice(0, 12)}`;

    let user = await env.DB.prepare(
      'SELECT id, username FROM users WHERE google_sub = ?'
    ).bind(googleSub).first<{ id: number; username: string }>();

    if (!user && email) {
      const existing = await env.DB.prepare(
        'SELECT id, username FROM users WHERE username = ?'
      ).bind(email).first<{ id: number; username: string }>();
      if (existing) {
        await env.DB.prepare(
          'UPDATE users SET google_sub = ?, email = COALESCE(email, ?), picture_url = COALESCE(picture_url, ?) WHERE id = ?'
        ).bind(
          googleSub,
          email,
          info.picture || null,
          existing.id
        ).run();
        user = existing;
      }
    }

    if (!user) {
      await env.DB.prepare(
        'INSERT INTO users (username, password, google_sub, email, picture_url) VALUES (?, ?, ?, ?, ?)'
      ).bind(
        username,
        '',
        googleSub,
        email || null,
        info.picture || null
      ).run();

      user = await env.DB.prepare(
        'SELECT id, username FROM users WHERE google_sub = ?'
      ).bind(googleSub).first<{ id: number; username: string }>();
    }

    if (!user) throw new Error('Failed to create or find user');

    const sessionId = await createSession(env, {
      userId: user.id,
      username: user.username,
      email,
      displayName,
      provider: 'google',
    });

    return new Response(
      JSON.stringify({ success: true, user: { username: user.username, email, displayName, provider: 'google' } }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': buildSessionCookie(sessionId, request.url),
        }
      }
    );
  } catch (error) {
    console.error('Google login error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Google 登录失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
