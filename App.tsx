import React, { useState, useEffect } from 'react';
import { ActivityType, SessionLog, AnalysisResponse } from './types';
import { LogEntryForm } from './components/LogEntryForm';
import { StatsChart } from './components/StatsChart';
import { generateInsights } from './services/geminiService';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { 
  Plus, 
  Activity, 
  History, 
  BrainCircuit, 
  Lock, 
  Calendar,
  MapPin,
  Sparkles,
  Heart,
  Zap,
  TrendingUp,
  ShieldCheck,
  Leaf,
  Trophy,
  Globe
} from 'lucide-react';

enum View {
  DASHBOARD = 'dashboard',
  LOG = 'log',
  HISTORY = 'history',
}

const AppContent = () => {
  const { t, language, setLanguage } = useLanguage();
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [insight, setInsight] = useState<AnalysisResponse | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem('intimome_logs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load logs", e);
      }
    }
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem('intimome_logs', JSON.stringify(logs));
  }, [logs]);

  const handleSaveLog = (newLog: SessionLog) => {
    setLogs([newLog, ...logs]);
    setView(View.DASHBOARD);
  };

  const handleGenerateInsight = async () => {
    if (logs.length < 3) {
      alert("Please log at least 3 sessions to generate insights.");
      return;
    }
    setLoadingInsight(true);
    const result = await generateInsights(logs, language);
    setInsight(result);
    setLoadingInsight(false);
  };

  // --- Statistics Helpers ---
  const getFavoritePosition = () => {
    if (logs.length === 0) return '-';
    const posCounts: Record<string, number> = {};
    logs.forEach(l => l.positions.forEach(p => {
        // Use translated key
        const label = t.position[p] || p;
        posCounts[label] = (posCounts[label] || 0) + 1;
    }));
    // Sort by count desc
    const sorted = Object.entries(posCounts).sort((a,b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : '-';
  };

  const renderContent = () => {
    if (view === View.LOG) {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6 animate-fade-in">
             <button onClick={() => setView(View.DASHBOARD)} className="text-slate-400 hover:text-slate-600">
                &larr; {t.back}
             </button>
             <h2 className="text-3xl font-bold text-slate-800 font-serif">{t.newEntryTitle}</h2>
          </div>
          <LogEntryForm onSave={handleSaveLog} onCancel={() => setView(View.DASHBOARD)} />
        </div>
      );
    }

    if (view === View.HISTORY) {
      return (
        <div className="max-w-2xl mx-auto space-y-6 animate-slide-up pb-24">
          <div className="flex justify-between items-end mb-4">
             <h2 className="text-3xl font-bold text-slate-800 font-serif flex items-center gap-3">
                {t.history}
             </h2>
             <span className="text-slate-400 font-medium text-xs uppercase tracking-wide">{logs.length} {t.entries}</span>
          </div>
          
          {logs.length === 0 ? (
            <div className="text-slate-400 text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-slate-300" />
              </div>
              <p className="text-base font-medium text-slate-600">{t.noLogs}</p>
              <p className="text-sm">{t.startTracking}</p>
              <button 
                onClick={() => setView(View.LOG)}
                className="mt-6 text-emerald-600 font-bold hover:text-emerald-700 text-sm"
              >
                {t.createFirst} &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-3">
                {logs.map((log) => (
                <div key={log.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${log.type === ActivityType.SOLO ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                {log.type === ActivityType.SOLO ? 'S' : 'P'}
                            </div>
                            <div>
                                <div className="text-slate-800 text-base font-bold font-serif">
                                    {log.type === ActivityType.SOLO ? t.activity[ActivityType.SOLO] : `${log.partnerName || t.activity[ActivityType.PARTNER]}`}
                                </div>
                                <div className="text-slate-400 text-xs font-medium mt-1 flex items-center gap-2">
                                    <span>{new Date(log.date).toLocaleDateString()}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span>{log.durationMinutes} {t.min}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                             <div className="flex gap-0.5 mb-2">
                                {[...Array(log.rating)].map((_, i) => <Sparkles key={i} size={12} className="text-emerald-400 fill-emerald-400" />)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                         <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            <MapPin size={10} /> {t.location[log.location]}
                         </div>
                        {log.positions.map(p => (
                            <span key={p} className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100">{t.position[p]}</span>
                        ))}
                        {log.tags && log.tags.map(tagId => {
                             const label = t.tags[tagId as keyof typeof t.tags] || tagId;
                             return (
                             <span key={tagId} className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100/50 flex items-center gap-1">
                                {label}
                             </span>
                             )
                        })}
                    </div>
                </div>
                ))}
            </div>
          )}
        </div>
      );
    }

    // Dashboard View
    return (
      <div className="space-y-8 animate-slide-up pb-24 max-w-2xl mx-auto">
        
        {/* Hero Card - Organic Modern Design */}
        <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-8 text-white shadow-xl shadow-emerald-900/20 overflow-hidden isolate">
             {/* Organic Shapes */}
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400 opacity-20 rounded-full blur-3xl"></div>
             <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-400 opacity-20 rounded-full blur-3xl"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
             
             <div className="relative z-10">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                           <Leaf size={16} className="text-emerald-300" />
                           <span className="text-xs font-bold tracking-widest uppercase text-emerald-200/80">{t.heroSubtitle}</span>
                        </div>
                        <h2 className="text-3xl font-serif font-medium tracking-wide leading-tight">
                           {t.heroTitle1}<br/>{t.heroTitle2}
                        </h2>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/10">
                       <ShieldCheck size={20} className="text-emerald-100" />
                    </div>
                 </div>
                 
                 <div className="flex gap-3 mt-6">
                    <button onClick={() => setView(View.LOG)} className="bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all shadow-lg shadow-black/10 flex items-center gap-2 group">
                        <Plus size={16} className="group-hover:scale-110 transition-transform" /> {t.newLog}
                    </button>
                    <button onClick={() => setView(View.HISTORY)} className="bg-emerald-900/40 hover:bg-emerald-900/60 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors border border-emerald-700/50 backdrop-blur-sm">
                        {t.history}
                    </button>
                 </div>
             </div>
        </div>

        {/* Stats Overview - Fun Stats Added */}
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">{t.totalEntries}</div>
                <div className="text-3xl font-serif font-medium text-slate-800">{logs.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">{t.avgDuration}</div>
                <div className="text-3xl font-serif font-medium text-slate-800">
                {logs.length > 0 ? Math.round(logs.reduce((a, b) => a + b.durationMinutes, 0) / logs.length) : 0}
                <span className="text-sm text-slate-400 font-sans font-normal ml-1">{t.min}</span>
                </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <Trophy size={40} className="absolute -bottom-2 -right-2 text-emerald-100" />
                <div className="text-emerald-600/70 text-[10px] font-bold uppercase tracking-wider mb-2">{t.topPosition}</div>
                <div className="text-lg font-serif font-medium text-emerald-900 truncate leading-tight">
                 {getFavoritePosition()}
                </div>
            </div>
        </div>

        {/* AI Insight Section - Clean Tech Look */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <BrainCircuit size={16} className="text-emerald-600" /> {t.aiTitle}
                    </h3>
                    <button 
                        onClick={handleGenerateInsight}
                        disabled={loadingInsight}
                        className="text-xs bg-white text-slate-600 font-bold border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                        {loadingInsight ? t.analyzing : t.updateAnalysis}
                    </button>
                </div>
                
                {insight ? (
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                                <p className="text-slate-400 font-bold mb-2 text-[10px] uppercase">{t.aiSummary}</p>
                                <p className="text-slate-700 leading-relaxed font-medium">{insight.summary}</p>
                            </div>
                            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                                <p className="text-slate-400 font-bold mb-2 text-[10px] uppercase">{t.aiPatterns}</p>
                                <p className="text-slate-700 leading-relaxed font-medium">{insight.trendInsight}</p>
                            </div>
                        </div>
                        <div className="bg-emerald-50 text-emerald-900 p-4 rounded-xl border border-emerald-100 flex gap-3 items-start">
                            <Zap size={18} className="shrink-0 mt-0.5 text-emerald-600" />
                            <div>
                                <p className="font-bold text-[10px] uppercase text-emerald-600 mb-1">{t.aiTip}</p>
                                <p className="font-medium italic">"{insight.wellnessTip}"</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed">
                        <Sparkles size={24} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-slate-800 font-serif text-lg mb-1">{t.aiUnlock}</p>
                        <p className="text-slate-500 text-xs mb-5 max-w-xs mx-auto">
                            {t.aiDesc}
                        </p>
                        <button 
                            onClick={handleGenerateInsight} 
                            className="bg-slate-800 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200"
                        >
                            {t.aiBtn}
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Charts */}
        <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">
                {t.chartsTitle}
            </h3>
            <StatsChart data={logs} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-noise text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      {/* Top Navigation - Minimal */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
               <Activity size={16} className="text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-slate-800 tracking-tight">
              {t.appTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
            >
                <Globe size={12} /> {language === 'en' ? 'EN' : '中文'}
            </button>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                <Lock size={10} /> {t.encrypted}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Bottom Navigation (Mobile Friendly) - Floating Island */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full px-2 py-2 shadow-2xl shadow-slate-300/50 flex items-center gap-2 z-50">
        <button 
            onClick={() => setView(View.DASHBOARD)}
            className={`p-3 rounded-full transition-all ${view === View.DASHBOARD ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        >
            <Activity size={20} />
        </button>

        <button 
            onClick={() => setView(View.LOG)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-lg shadow-emerald-200 transition-transform hover:scale-105 active:scale-95 mx-2"
        >
            <Plus size={22} />
        </button>

        <button 
            onClick={() => setView(View.HISTORY)}
            className={`p-3 rounded-full transition-all ${view === View.HISTORY ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        >
            <History size={20} />
        </button>
      </nav>
    </div>
  );
};

const App = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;