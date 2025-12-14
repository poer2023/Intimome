import { requireAuth } from './_auth';
import { ensureSchema } from './_schema';

interface Env {
    DB: D1Database;
    SESSIONS: KVNamespace;
}

// GET: Fetch countdown target for authenticated user
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const auth = await requireAuth(env, request);
    if ('response' in auth) return auth.response;
    const { userId } = auth.session;

    try {
        await ensureSchema(env.DB);
        const result = await env.DB.prepare(
            'SELECT countdown_target FROM users WHERE id = ?'
        ).bind(userId).first<{ countdown_target: string | null }>();

        return new Response(
            JSON.stringify({ success: true, data: { countdownTarget: result?.countdown_target || null } }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Get countdown error:', error);
        return new Response(
            JSON.stringify({ success: false, message: '获取倒计时失败' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

// POST: Set countdown target for authenticated user
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const auth = await requireAuth(env, request);
    if ('response' in auth) return auth.response;
    const { userId } = auth.session;

    try {
        await ensureSchema(env.DB);
        const body = await request.json() as { countdownTarget: string | null };
        const { countdownTarget } = body;

        await env.DB.prepare(
            'UPDATE users SET countdown_target = ? WHERE id = ?'
        ).bind(countdownTarget, userId).run();

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Set countdown error:', error);
        return new Response(
            JSON.stringify({ success: false, message: '设置倒计时失败' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
