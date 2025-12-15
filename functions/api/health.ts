interface Env {
    DB: D1Database;
    SESSIONS: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env } = context;
    const checks: Record<string, string> = {};
    let allOk = true;

    // Check D1 Database
    try {
        const result = await env.DB.prepare('SELECT 1 as test').first();
        checks.d1 = result ? 'ok' : 'error';
    } catch (error) {
        checks.d1 = 'error';
        allOk = false;
        console.error('D1 health check failed:', error);
    }

    // Check KV
    try {
        const testKey = '__health_check__';
        await env.SESSIONS.put(testKey, 'ok', { expirationTtl: 60 });
        const value = await env.SESSIONS.get(testKey);
        checks.kv = value === 'ok' ? 'ok' : 'error';
        await env.SESSIONS.delete(testKey);
    } catch (error) {
        checks.kv = 'error';
        allOk = false;
        console.error('KV health check failed:', error);
    }

    const response = {
        status: allOk ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        checks
    };

    return new Response(
        JSON.stringify(response),
        {
            status: allOk ? 200 : 503,
            headers: { 'Content-Type': 'application/json' }
        }
    );
};
