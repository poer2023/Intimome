interface Env {
  DB: D1Database;
  BACKUPS: R2Bucket;
  BACKUP_SECRET: string;
}

import { ensureSchema } from './_schema';

function unauthorized(): Response {
  return new Response(
    JSON.stringify({ success: false, message: 'Unauthorized' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  if (!env.BACKUP_SECRET) return unauthorized();
  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${env.BACKUP_SECRET}`) return unauthorized();

  try {
    await ensureSchema(env.DB);
    const users = await env.DB.prepare(
      'SELECT id, username, google_sub, email, picture_url, provider, created_at FROM users'
    ).all();
    const logs = await env.DB.prepare(
      'SELECT * FROM session_logs'
    ).all();

    const payload = {
      createdAt: new Date().toISOString(),
      users: users.results || [],
      session_logs: logs.results || [],
    };

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `backups/intimome-${stamp}.json`;

    await env.BACKUPS.put(key, JSON.stringify(payload, null, 2), {
      httpMetadata: { contentType: 'application/json' }
    });

    return new Response(
      JSON.stringify({ success: true, key }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Backup error:', error);
    return new Response(
      JSON.stringify({ success: false, message: '备份失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
