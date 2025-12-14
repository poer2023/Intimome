interface Env {
    DB: D1Database;
    SESSIONS: KVNamespace;
}

import { requireAuth } from './_auth';
import { ensureSchema } from './_schema';

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

// GET: Fetch paginated logs for authenticated user
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const auth = await requireAuth(env, request);
    if ('response' in auth) return auth.response;
    const { userId } = auth.session;

    try {
        await ensureSchema(env.DB);

        // Parse pagination params from URL
        const url = new URL(request.url);
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
        const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '15', 10)));
        const offset = (page - 1) * limit;

        // Get total count for this user
        const countResult = await env.DB.prepare(
            'SELECT COUNT(*) as total FROM session_logs WHERE user_id = ?'
        ).bind(userId).first<{ total: number }>();
        const total = countResult?.total || 0;

        // Get paginated logs for this user
        const result = await env.DB.prepare(
            'SELECT * FROM session_logs WHERE user_id = ? ORDER BY date DESC LIMIT ? OFFSET ?'
        ).bind(userId, limit, offset).all<SessionLogRow>();

        const logs = (result.results || []).map(rowToLog);

        return new Response(
            JSON.stringify({
                success: true,
                data: logs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: offset + logs.length < total
                }
            }),
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
    const auth = await requireAuth(env, request);
    if ('response' in auth) return auth.response;
    const { userId } = auth.session;

    try {
        await ensureSchema(env.DB);
        const body = await request.json() as { log: SessionLog };
        const { log } = body;

        if (!log) {
            return new Response(
                JSON.stringify({ success: false, message: '缺少必要参数' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Insert log
        await env.DB.prepare(`
      INSERT INTO session_logs (id, user_id, date, duration_minutes, type, partner_name, location, positions, rating, mood, tags, notes, orgasm_reached)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
            log.id,
            userId,
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
    const auth = await requireAuth(env, request);
    if ('response' in auth) return auth.response;
    const { userId } = auth.session;

    try {
        await ensureSchema(env.DB);
        const body = await request.json() as { logId: string };
        const { logId } = body;

        if (!logId) {
            return new Response(
                JSON.stringify({ success: false, message: '缺少必要参数' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Delete log (only if it belongs to this user)
        await env.DB.prepare(
            'DELETE FROM session_logs WHERE id = ? AND user_id = ?'
        ).bind(logId, userId).run();

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
