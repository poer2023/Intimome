import { GoogleGenAI, Type } from "@google/genai";
import { SessionLog, AnalysisResponse, Language } from '../types';

// Initialize Gemini Client
// Note: In a real production app, this should likely be proxied through a backend
// to keep the API key secure, but for this Client-side SPA demo, we use env var directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInsights = async (logs: SessionLog[], language: Language): Promise<AnalysisResponse> => {
  try {
    // Prepare anonymized data for the model
    const anonymizedData = logs.map(log => ({
      date: new Date(log.date).getDay(), // Only send day of week for patterns
      duration: log.durationMinutes,
      type: log.type,
      mood: log.mood,
      rating: log.rating,
      positions: log.positions,
    }));

    const langInstruction = language === 'zh' ? 'Simplified Chinese (Mandarin)' : 'English';

    const prompt = `
      Act as a professional, sexual wellness coach. 
      Analyze the following anonymous activity data (JSON) and provide a helpful, positive summary.
      
      IMPORTANT: Provide all response text in ${langInstruction}.

      Data: ${JSON.stringify(anonymizedData.slice(0, 20))} (Latest 20 entries)

      Return the response in strict JSON format matching this schema:
      {
        "summary": "A brief 1-sentence summary of recent activity levels.",
        "wellnessTip": "A generalized wellness tip based on the patterns (e.g. variety, connection, rest).",
        "trendInsight": "An observation about preference trends (e.g. 'You seem to prefer weekends' or 'Higher ratings associated with X')."
      }
      Keep tone clinical, supportive, and sex-positive.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            wellnessTip: { type: Type.STRING },
            trendInsight: { type: Type.STRING },
          },
          required: ['summary', 'wellnessTip', 'trendInsight'],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResponse;
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      summary: language === 'zh' ? "暂时无法生成分析。" : "Unable to generate insights at this time.",
      wellnessTip: language === 'zh' ? "专注于沟通与舒适感。" : "Focus on communication and comfort.",
      trendInsight: language === 'zh' ? "继续记录以查看更多趋势。" : "Keep logging to see more trends."
    };
  }
};