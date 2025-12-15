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
    created_at: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    const auth = await requireAuth(env, request);
    if ('response' in auth) return auth.response;
    const { userId, username } = auth.session;

    try {
        await ensureSchema(env.DB);

        const url = new URL(request.url);
        const format = url.searchParams.get('format') || 'json';

        // Fetch all logs for this user
        const result = await env.DB.prepare(
            'SELECT * FROM session_logs WHERE user_id = ? ORDER BY date DESC'
        ).bind(userId).all<SessionLogRow>();

        const logs = result.results || [];

        if (format === 'csv') {
            // Generate CSV
            const headers = [
                'id', 'date', 'duration_minutes', 'type', 'partner_name',
                'location', 'positions', 'rating', 'mood', 'tags', 'notes',
                'orgasm_reached', 'created_at'
            ];

            const rows = logs.map(log => [
                log.id,
                log.date,
                log.duration_minutes,
                log.type,
                log.partner_name || '',
                log.location,
                log.positions,
                log.rating,
                log.mood,
                log.tags || '',
                (log.notes || '').replace(/"/g, '""'),
                log.orgasm_reached,
                log.created_at
            ].map(v => `"${v}"`).join(','));

            const csv = [headers.join(','), ...rows].join('\n');
            const timestamp = new Date().toISOString().split('T')[0];

            return new Response(csv, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="intimdiary-export-${timestamp}.csv"`
                }
            });
        }

        // Default: JSON format
        const exportData = {
            exportedAt: new Date().toISOString(),
            username,
            totalLogs: logs.length,
            logs: logs.map(log => ({
                id: log.id,
                date: log.date,
                durationMinutes: log.duration_minutes,
                type: log.type,
                partnerName: log.partner_name || undefined,
                location: log.location,
                positions: JSON.parse(log.positions),
                rating: log.rating,
                mood: log.mood,
                tags: log.tags ? JSON.parse(log.tags) : undefined,
                notes: log.notes || undefined,
                orgasmReached: log.orgasm_reached === 1,
                createdAt: log.created_at
            }))
        };

        const timestamp = new Date().toISOString().split('T')[0];

        return new Response(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Disposition': `attachment; filename="intimdiary-export-${timestamp}.json"`
            }
        });
    } catch (error) {
        console.error('Export error:', error);
        return new Response(
            JSON.stringify({ success: false, message: '导出失败' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
