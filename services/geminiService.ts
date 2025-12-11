import { SessionLog, AnalysisResponse, Language } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export const generateInsights = async (logs: SessionLog[], language: Language): Promise<AnalysisResponse> => {
  try {
    const res = await fetch(`${API_BASE}/api/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs, language }),
    });
    if (!res.ok) throw new Error(`Server ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed');
    return data.data as AnalysisResponse;
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      summary: language === 'zh' ? "暂时无法生成分析。" : "Unable to generate insights at this time.",
      wellnessTip: language === 'zh' ? "专注于沟通与舒适感。" : "Focus on communication and comfort.",
      trendInsight: language === 'zh' ? "继续记录以查看更多趋势。" : "Keep logging to see more trends."
    };
  }
};
