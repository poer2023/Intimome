interface Env {
    DB: D1Database;
}

interface SessionLogRow {
    id: string;
    user_id: number;
    date: string;
    duration_minutes: number;
    type: string;
    partner_name: string | null;
    location: string;
    positions: string;
    rating: number;
    mood: string;
    tags: string | null;
    notes: string | null;
    orgasm_reached: number;
}

interface SessionLog {
    id: string;
    date: string;
    durationMinutes: number;
    type: string;
    partnerName?: string;
    location: string;
    positions: string[];
    rating: number;
    mood: string;
    tags?: string[];
    notes?: string;
    orgasmReached: boolean;
}

function rowToLog(row: SessionLogRow): SessionLog {
    return {
        id: row.id,
        date: row.date,
        durationMinutes: row.duration_minutes,
        type: row.type,
        partnerName: row.partner_name || undefined,
        location: row.location,
        positions: JSON.parse(row.positions),
        rating: row.rating,
        mood: row.mood,
        tags: row.tags ? JSON.parse(row.tags) : undefined,
        notes: row.notes || undefined,
        orgasmReached: row.orgasm_reached === 1,
    };
}

// GET: Fetch all logs for authenticated user
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const url = new URL(request.url);
    const username = url.searchParams.get('username');

    if (!username) {
        return new Response(
            JSON.stringify({ success: false, message: '缺少用户名' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        // Get user ID
        const user = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username).first<{ id: number }>();

        if (!user) {
            return new Response(
                JSON.stringify({ success: false, message: '用户不存在' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get all logs for this user
        const result = await env.DB.prepare(
            'SELECT * FROM session_logs WHERE user_id = ? ORDER BY date DESC'
        ).bind(user.id).all<SessionLogRow>();

        const logs = (result.results || []).map(rowToLog);

        return new Response(
            JSON.stringify({ success: true, data: logs }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Get logs error:', error);
        return new Response(
            JSON.stringify({ success: false, message: '获取日志失败' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

// POST: Create a new log
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    try {
        const body = await request.json() as { username: string; log: SessionLog };
        const { username, log } = body;

        if (!username || !log) {
            return new Response(
                JSON.stringify({ success: false, message: '缺少必要参数' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get user ID
        const user = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username).first<{ id: number }>();

        if (!user) {
            return new Response(
                JSON.stringify({ success: false, message: '用户不存在' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Insert log
        await env.DB.prepare(`
      INSERT INTO session_logs (id, user_id, date, duration_minutes, type, partner_name, location, positions, rating, mood, tags, notes, orgasm_reached)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
            log.id,
            user.id,
            log.date,
            log.durationMinutes,
            log.type,
            log.partnerName || null,
            log.location,
            JSON.stringify(log.positions),
            log.rating,
            log.mood,
            log.tags ? JSON.stringify(log.tags) : null,
            log.notes || null,
            log.orgasmReached ? 1 : 0
        ).run();

        return new Response(
            JSON.stringify({ success: true, data: log }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Create log error:', error);
        return new Response(
            JSON.stringify({ success: false, message: '保存日志失败' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

// DELETE: Delete a log by ID
export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    try {
        const body = await request.json() as { username: string; logId: string };
        const { username, logId } = body;

        if (!username || !logId) {
            return new Response(
                JSON.stringify({ success: false, message: '缺少必要参数' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get user ID
        const user = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username).first<{ id: number }>();

        if (!user) {
            return new Response(
                JSON.stringify({ success: false, message: '用户不存在' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Delete log (only if it belongs to this user)
        await env.DB.prepare(
            'DELETE FROM session_logs WHERE id = ? AND user_id = ?'
        ).bind(logId, user.id).run();

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Delete log error:', error);
        return new Response(
            JSON.stringify({ success: false, message: '删除日志失败' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
