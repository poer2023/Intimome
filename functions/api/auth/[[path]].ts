import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Hash password using Web Crypto API (Cloudflare Workers compatible)
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

// Login endpoint
app.post('/api/auth/login', async (c) => {
    try {
        const body = await c.req.json();
        const { username, password } = body || {};

        if (!username || !password) {
            return c.json({ success: false, message: '用户名和密码必填' }, 400);
        }

        const user = await c.env.DB.prepare(
            'SELECT username, password FROM users WHERE username = ?'
        ).bind(username).first<{ username: string; password: string }>();

        if (!user) {
            return c.json({ success: false, message: '用户名或密码错误' }, 401);
        }

        const valid = await verifyPassword(password, user.password);
        if (!valid) {
            return c.json({ success: false, message: '用户名或密码错误' }, 401);
        }

        return c.json({ success: true, user: { username: user.username } });
    } catch (error) {
        console.error('Login error:', error);
        return c.json({ success: false, message: '登录失败' }, 500);
    }
});

// Register endpoint
app.post('/api/auth/register', async (c) => {
    try {
        const body = await c.req.json();
        const { username, password } = body || {};

        if (!username || !password) {
            return c.json({ success: false, message: '用户名和密码必填' }, 400);
        }

        if (password.length < 6) {
            return c.json({ success: false, message: '密码至少 6 位' }, 400);
        }

        // Check if user exists
        const existing = await c.env.DB.prepare(
            'SELECT username FROM users WHERE username = ?'
        ).bind(username).first();

        if (existing) {
            return c.json({ success: false, message: '用户名已存在' }, 409);
        }

        // Hash password and insert user
        const hashedPassword = await hashPassword(password);
        await c.env.DB.prepare(
            'INSERT INTO users (username, password) VALUES (?, ?)'
        ).bind(username, hashedPassword).run();

        return c.json({ success: true, user: { username } });
    } catch (error) {
        console.error('Register error:', error);
        return c.json({ success: false, message: '注册失败' }, 500);
    }
});

export default app;
