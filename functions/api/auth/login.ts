interface Env {
    DB: D1Database;
    SESSIONS: KVNamespace;
}

import { buildSessionCookie, createSession } from '../_auth';
import { ensureSchema } from '../_schema';

// Hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const inputHash = await hashPassword(password);
    return inputHash === hash;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    try {
        await ensureSchema(env.DB);
        const body = await request.json() as { username?: string; password?: string };
        const { username, password } = body || {};

        if (!username || !password) {
            return new Response(
                JSON.stringify({ success: false, message: '用户名和密码必填' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const user = await env.DB.prepare(
            'SELECT id, username, password FROM users WHERE username = ?'
        ).bind(username).first<{ id: number; username: string; password: string }>();

        if (!user) {
            return new Response(
                JSON.stringify({ success: false, message: '用户名或密码错误' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const valid = await verifyPassword(password, user.password);
        if (!valid) {
            return new Response(
                JSON.stringify({ success: false, message: '用户名或密码错误' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const sessionId = await createSession(env, {
            userId: user.id,
            username: user.username,
            displayName: user.username,
            provider: 'local'
        });

        return new Response(
            JSON.stringify({ success: true, user: { username: user.username, displayName: user.username, provider: 'local' } }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': buildSessionCookie(sessionId, request.url),
                }
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        return new Response(
            JSON.stringify({ success: false, message: '登录失败' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
