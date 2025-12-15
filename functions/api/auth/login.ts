interface Env {
    DB: D1Database;
    SESSIONS: KVNamespace;
}

import { buildSessionCookie, createSession } from '../_auth';
import { ensureSchema } from '../_schema';
import { verifyPasswordSecure, isLegacyHash, hashPasswordSecure } from '../_crypto';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '../_rateLimit';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateCheck = await checkRateLimit(env, `login:${clientIP}`, RATE_LIMITS.login);
    if (!rateCheck.allowed) {
        return new Response(
            JSON.stringify({ success: false, message: '登录尝试过于频繁，请稍后再试' }),
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

        const user = await env.DB.prepare(
            'SELECT id, username, password FROM users WHERE username = ?'
        ).bind(username).first<{ id: number; username: string; password: string }>();

        if (!user) {
            return new Response(
                JSON.stringify({ success: false, message: '用户名或密码错误' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Verify password (supports both legacy SHA-256 and new PBKDF2 format)
        const valid = await verifyPasswordSecure(password, user.password);
        if (!valid) {
            return new Response(
                JSON.stringify({ success: false, message: '用户名或密码错误' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Upgrade legacy password hash to new format on successful login
        if (isLegacyHash(user.password)) {
            try {
                const newHash = await hashPasswordSecure(password);
                await env.DB.prepare(
                    'UPDATE users SET password = ? WHERE id = ?'
                ).bind(newHash, user.id).run();
                console.log(`Upgraded password hash for user ${user.id}`);
            } catch (upgradeError) {
                // Don't fail login if upgrade fails, just log it
                console.error('Password hash upgrade failed:', upgradeError);
            }
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
