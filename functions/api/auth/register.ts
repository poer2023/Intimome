interface Env {
    DB: D1Database;
    SESSIONS: KVNamespace;
}

import { buildSessionCookie, createSession } from '../_auth';
import { ensureSchema } from '../_schema';
import { hashPasswordSecure } from '../_crypto';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '../_rateLimit';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateCheck = await checkRateLimit(env, `register:${clientIP}`, RATE_LIMITS.register);
    if (!rateCheck.allowed) {
        return new Response(
            JSON.stringify({ success: false, message: '注册请求过于频繁，请稍后再试' }),
            { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(rateCheck.resetAt - Math.floor(Date.now() / 1000)) } }
        );
    }

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

        // Input validation
        if (username.length < 3 || username.length > 32) {
            return new Response(
                JSON.stringify({ success: false, message: '用户名长度需在 3-32 字符之间' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return new Response(
                JSON.stringify({ success: false, message: '用户名只能包含字母、数字和下划线' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (password.length < 6) {
            return new Response(
                JSON.stringify({ success: false, message: '密码至少 6 位' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if user exists
        const existing = await env.DB.prepare(
            'SELECT username FROM users WHERE username = ?'
        ).bind(username).first();

        if (existing) {
            return new Response(
                JSON.stringify({ success: false, message: '用户名已存在' }),
                { status: 409, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Hash password securely with PBKDF2
        const hashedPassword = await hashPasswordSecure(password);
        await env.DB.prepare(
            'INSERT INTO users (username, password) VALUES (?, ?)'
        ).bind(username, hashedPassword).run();

        const created = await env.DB.prepare(
            'SELECT id, username FROM users WHERE username = ?'
        ).bind(username).first<{ id: number; username: string }>();

        const sessionId = created
            ? await createSession(env, {
                userId: created.id,
                username: created.username,
                displayName: created.username,
                provider: 'local'
            })
            : null;

        return new Response(
            JSON.stringify({ success: true, user: { username, displayName: username, provider: 'local' } }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    ...(sessionId ? { 'Set-Cookie': buildSessionCookie(sessionId, request.url) } : {})
                }
            }
        );
    } catch (error) {
        console.error('Register error:', error);
        return new Response(
            JSON.stringify({ success: false, message: '注册失败' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
