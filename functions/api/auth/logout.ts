import { clearSessionCookie, destroySession, getSessionId } from '../_auth';

interface Env {
  SESSIONS: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  try {
    const sessionId = getSessionId(request);
    if (sessionId) {
      await destroySession(env, sessionId);
    }
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': clearSessionCookie(request.url),
        }
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ success: false, message: '退出失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
