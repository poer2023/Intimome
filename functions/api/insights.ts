interface Env {
    DB: D1Database;
    OPENROUTER_API_KEY: string;
    OPENROUTER_MODEL?: string;
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

interface InsightsRequest {
    language: 'en' | 'zh';
}

// Helper to count occurrences and get top N
function getTopN(items: string[], n: number): string[] {
    const counts: Record<string, number> = {};
    items.forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([key]) => key);
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    const auth = await requireAuth(env, request);
    if ('response' in auth) return auth.response;
    const { userId } = auth.session;

    if (!env.OPENROUTER_API_KEY) {
        return new Response(
            JSON.stringify({ success: false, message: '未配置 OPENROUTER_API_KEY' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        await ensureSchema(env.DB);
        const body = await request.json() as InsightsRequest;
        const { language } = body;

        // Fetch user's logs from database
        const result = await env.DB.prepare(
            'SELECT * FROM session_logs WHERE user_id = ? ORDER BY date DESC'
        ).bind(userId).all<SessionLogRow>();

        const allLogs = result.results || [];

        if (allLogs.length < 3) {
            return new Response(
                JSON.stringify({ success: false, message: language === 'zh' ? '请至少记录3次活动' : 'Please log at least 3 sessions' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Calculate statistics
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const thisWeekLogs = allLogs.filter(log => new Date(log.date) >= oneWeekAgo);
        const lastWeekLogs = allLogs.filter(log => {
            const d = new Date(log.date);
            return d >= twoWeeksAgo && d < oneWeekAgo;
        });
        const thisMonthLogs = allLogs.filter(log => new Date(log.date) >= oneMonthAgo);

        const totalDuration = allLogs.reduce((sum, log) => sum + log.duration_minutes, 0);
        const totalRating = allLogs.reduce((sum, log) => sum + log.rating, 0);
        const orgasmCount = allLogs.filter(log => log.orgasm_reached === 1).length;

        // Recent 7 sessions for rating trend
        const recent7 = allLogs.slice(0, 7);
        const recent7AvgRating = recent7.length > 0
            ? recent7.reduce((sum, log) => sum + log.rating, 0) / recent7.length
            : 0;

        // Collect all positions, moods, locations
        const allPositions = allLogs.flatMap(log => {
            try { return JSON.parse(log.positions) as string[]; } catch { return []; }
        });
        const allMoods = allLogs.map(log => log.mood);
        const allLocations = allLogs.map(log => log.location);

        const stats = {
            totalSessions: allLogs.length,
            avgDuration: Math.round(totalDuration / allLogs.length),
            avgRating: (totalRating / allLogs.length).toFixed(1),
            orgasmRate: Math.round((orgasmCount / allLogs.length) * 100),
            thisWeekCount: thisWeekLogs.length,
            lastWeekCount: lastWeekLogs.length,
            thisMonthCount: thisMonthLogs.length,
            recentAvgRating: recent7AvgRating.toFixed(1),
            topPositions: getTopN(allPositions, 3),
            topMoods: getTopN(allMoods, 3),
            topLocations: getTopN(allLocations, 3),
        };

        // Prepare recent logs for context (last 10, anonymized)
        const recentLogs = allLogs.slice(0, 10).map(log => ({
            daysAgo: Math.round((now.getTime() - new Date(log.date).getTime()) / (24 * 60 * 60 * 1000)),
            duration: log.duration_minutes,
            type: log.type,
            mood: log.mood,
            rating: log.rating,
            location: log.location,
            positions: (() => { try { return JSON.parse(log.positions); } catch { return []; } })(),
            orgasm: log.orgasm_reached === 1,
        }));

        const langInstruction = language === 'zh' ? '简体中文' : 'English';

        const prompt = `你是一位专业、温暖、积极的亲密关系健康顾问。请基于以下数据提供个性化洞察。

## 数据概览
- 总记录: ${stats.totalSessions}条
- 平均时长: ${stats.avgDuration}分钟
- 总体满意度: ${stats.avgRating}/5
- 近7次满意度: ${stats.recentAvgRating}/5
- 高潮达成率: ${stats.orgasmRate}%

## 频率对比
- 本周: ${stats.thisWeekCount}次
- 上周: ${stats.lastWeekCount}次
- 近30天: ${stats.thisMonthCount}次

## 偏好分析
- 最常用体位: ${stats.topPositions.join(', ') || '暂无'}
- 常见氛围: ${stats.topMoods.join(', ') || '暂无'}
- 常用地点: ${stats.topLocations.join(', ') || '暂无'}

## 近期10条记录
${JSON.stringify(recentLogs, null, 2)}

---

请分析以上数据，用${langInstruction}回复，提供以下5个维度的洞察:

1. **frequencyInsight**: 频率趋势分析（本周vs上周，是否有变化？1-2句话）
2. **satisfactionInsight**: 满意度分析（趋势如何？什么因素可能影响满意度？1-2句话）
3. **diversityTip**: 多样性建议（体位/地点是否单一？给一个具体的探索建议）
4. **personalizedTip**: 个性化建议（基于数据的1个具体、可操作的亲密建议）
5. **encouragement**: 鼓励语（1句积极正面的肯定或鼓励）

保持语气：专业、温暖、支持性、性积极。避免说教，聚焦于洞察和建议。

返回严格的JSON格式:
{
  "frequencyInsight": "...",
  "satisfactionInsight": "...",
  "diversityTip": "...",
  "personalizedTip": "...",
  "encouragement": "..."
}`;

        const model = env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
        const openrouterResponse = await fetch(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': new URL(request.url).origin,
                    'X-Title': 'IntimDiary',
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: 'You are a professional, warm, supportive, sex-positive intimacy wellness coach. Always respond in valid JSON format.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                }),
            }
        );

        if (!openrouterResponse.ok) {
            const errText = await openrouterResponse.text().catch(() => '');
            throw new Error(`OpenRouter API error: ${openrouterResponse.status} ${errText}`);
        }

        const openrouterData = await openrouterResponse.json() as {
            choices?: Array<{ message?: { content?: string } }>;
        };

        const text = openrouterData?.choices?.[0]?.message?.content;
        if (!text) throw new Error('Empty AI response');

        // Clean potential markdown code blocks
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanedText);

        return new Response(
            JSON.stringify({ success: true, data: parsed }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Insight error:', error);
        return new Response(
            JSON.stringify({ success: false, message: '生成分析失败' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
