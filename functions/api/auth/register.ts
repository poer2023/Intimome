interface Env {
    DB: D1Database;
}

// Hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    try {
        const body = await request.json() as { username?: string; password?: string };
        const { username, password } = body || {};

        if (!username || !password) {
            return new Response(
                JSON.stringify({ success: false, message: '用户名和密码必填' }),
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

        // Hash password and insert user
        const hashedPassword = await hashPassword(password);
        await env.DB.prepare(
            'INSERT INTO users (username, password) VALUES (?, ?)'
        ).bind(username, hashedPassword).run();

        return new Response(
            JSON.stringify({ success: true, user: { username } }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Register error:', error);
        return new Response(
            JSON.stringify({ success: false, message: '注册失败' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
