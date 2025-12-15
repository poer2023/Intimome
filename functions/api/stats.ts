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

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    const auth = await requireAuth(env, request);
    if ('response' in auth) return auth.response;
    const { userId } = auth.session;

    try {
        await ensureSchema(env.DB);

        // Fetch all logs for this user
        const result = await env.DB.prepare(
            'SELECT * FROM session_logs WHERE user_id = ? ORDER BY date DESC'
        ).bind(userId).all<SessionLogRow>();

        const allLogs = result.results || [];

        if (allLogs.length === 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    data: {
                        totalSessions: 0,
                        avgDuration: 0,
                        avgRating: 0,
                        orgasmRate: 0,
                        thisWeekCount: 0,
                        lastWeekCount: 0,
                        favoritePosition: '-',
                        recentLogs: []
                    }
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Calculate statistics
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const thisWeekLogs = allLogs.filter(log => new Date(log.date) >= oneWeekAgo);
        const lastWeekLogs = allLogs.filter(log => {
            const d = new Date(log.date);
            return d >= twoWeeksAgo && d < oneWeekAgo;
        });

        const totalDuration = allLogs.reduce((sum, log) => sum + log.duration_minutes, 0);
        const totalRating = allLogs.reduce((sum, log) => sum + log.rating, 0);
        const orgasmCount = allLogs.filter(log => log.orgasm_reached === 1).length;

        // Find favorite position
        const positionCounts: Record<string, number> = {};
        allLogs.forEach(log => {
            try {
                const positions = JSON.parse(log.positions) as string[];
                positions.forEach(pos => {
                    positionCounts[pos] = (positionCounts[pos] || 0) + 1;
                });
            } catch { }
        });
        const favoritePosition = Object.entries(positionCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

        // Recent logs (latest 7)
        const recentLogs = allLogs.slice(0, 7).map(log => ({
            id: log.id,
            date: log.date,
            durationMinutes: log.duration_minutes,
            type: log.type,
            partnerName: log.partner_name || undefined,
            location: log.location,
            positions: JSON.parse(log.positions),
            rating: log.rating,
            mood: log.mood,
            orgasmReached: log.orgasm_reached === 1
        }));

        const stats = {
            totalSessions: allLogs.length,
            avgDuration: Math.round(totalDuration / allLogs.length),
            avgRating: +(totalRating / allLogs.length).toFixed(1),
            orgasmRate: Math.round((orgasmCount / allLogs.length) * 100),
            thisWeekCount: thisWeekLogs.length,
            lastWeekCount: lastWeekLogs.length,
            favoritePosition,
            recentLogs
        };

        return new Response(
            JSON.stringify({ success: true, data: stats }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Stats error:', error);
        return new Response(
            JSON.stringify({ success: false, message: '获取统计失败' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
