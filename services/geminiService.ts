import { AnalysisResponse, Language } from '../types';

// Use relative path for Cloudflare Pages Functions (production)
// or VITE_API_BASE for local development with Express
const API_BASE = import.meta.env.VITE_API_BASE || '';

interface InsightsApiResponse {
  success: boolean;
  data?: AnalysisResponse;
  message?: string;
}

export const generateInsights = async (language: Language): Promise<AnalysisResponse> => {
  try {
    const res = await fetch(`${API_BASE}/api/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language }),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Server ${res.status}`);
    const data = await res.json() as InsightsApiResponse;
    if (!data.success || !data.data) throw new Error(data.message || 'Failed');
    return data.data;
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      frequencyInsight: language === 'zh' ? "暂时无法生成分析。" : "Unable to generate insights at this time.",
      satisfactionInsight: language === 'zh' ? "请稍后重试。" : "Please try again later.",
      diversityTip: language === 'zh' ? "尝试探索新的体验。" : "Try exploring new experiences.",
      personalizedTip: language === 'zh' ? "专注于沟通与舒适感。" : "Focus on communication and comfort.",
      encouragement: language === 'zh' ? "继续记录，发现更多趋势！" : "Keep logging to discover more trends!"
    };
  }
};
