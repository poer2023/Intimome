interface Env {
    GEMINI_API_KEY: string;
}

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

    if (!env.GEMINI_API_KEY) {
        return new Response(
            JSON.stringify({ success: false, message: '未配置 GEMINI_API_KEY' }),
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

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                    },
                }),
            }
        );

        if (!geminiResponse.ok) {
            throw new Error(`Gemini API error: ${geminiResponse.status}`);
        }

        const geminiData = await geminiResponse.json() as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };

        const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
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
