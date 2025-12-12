interface Env {
    OPENROUTER_API_KEY: string;
    OPENROUTER_MODEL?: string;
    SESSIONS: KVNamespace;
}

import { requireAuth } from './_auth';

interface InsightsRequest {
    logs: Array<{
        date: string;
        durationMinutes: number;
        type: string;
        mood: string;
        rating: number;
        positions: string[];
    }>;
    language: 'en' | 'zh';
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    const auth = await requireAuth(env, request);
    if ('response' in auth) return auth.response;

    if (!env.OPENROUTER_API_KEY) {
        return new Response(
            JSON.stringify({ success: false, message: '未配置 OPENROUTER_API_KEY' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const body = await request.json() as InsightsRequest;
        const { logs, language } = body;

        if (!Array.isArray(logs)) {
            return new Response(
                JSON.stringify({ success: false, message: '缺少日志数据' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const langInstruction = language === 'zh' ? 'Simplified Chinese (Mandarin)' : 'English';
        const anonymizedData = logs.slice(0, 20).map(log => ({
            date: new Date(log.date).getDay(),
            duration: log.durationMinutes,
            type: log.type,
            mood: log.mood,
            rating: log.rating,
            positions: log.positions,
        }));

        const prompt = `
      Act as a professional, sexual wellness coach. 
      Analyze the following anonymous activity data (JSON) and provide a helpful, positive summary.
      IMPORTANT: Provide all response text in ${langInstruction}.
      Data: ${JSON.stringify(anonymizedData)}
      Return strict JSON matching: { "summary": "", "wellnessTip": "", "trendInsight": "" }
      Keep tone clinical, supportive, and sex-positive.
    `;

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
                        { role: 'system', content: 'You are a professional, clinical, supportive, sex-positive sexual wellness coach.' },
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

        const parsed = JSON.parse(text);

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
