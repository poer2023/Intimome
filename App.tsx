import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link, Navigate, Outlet } from 'react-router-dom';
import { ActivityType, SessionLog, AnalysisResponse } from './types';
import { LogEntryForm } from './components/LogEntryForm';
import { StatsChart } from './components/StatsChart';
import { PositionIcon } from './components/PositionIcons';
import { generateInsights } from './services/geminiService';
import { fetchLogs, saveLog } from './services/logsService';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import {
  Plus,
  Activity,
  History,
  BrainCircuit,
  Calendar,
  MapPin,
  Sparkles,
  Heart,
  Zap,
  TrendingUp,
  ShieldCheck,
  Leaf,
  Trophy,
  Globe,
  Clock,
  Star,
  X,
  Smile
} from 'lucide-react';

type NavTarget = 'dashboard' | 'log' | 'history';

const DashboardView = ({
  logs,
  t,
  getFavoritePosition,
  handleGenerateInsight,
  loadingInsight,
  insight,
  onLogClick,
  onHistoryClick
}: {
  logs: SessionLog[];
  t: ReturnType<typeof useLanguage>['t'];
  getFavoritePosition: () => string;
  handleGenerateInsight: () => Promise<void>;
  loadingInsight: boolean;
  insight: AnalysisResponse | null;
  onLogClick: () => void;
  onHistoryClick: () => void;
}) => (
  <div className="space-y-6 animate-slide-up pb-24 max-w-2xl mx-auto">

    {/* Quick Actions Component */}
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={onLogClick}
        className="bg-rose-600 hover:bg-rose-700 text-white p-5 rounded-2xl shadow-lg shadow-rose-200 transition-all transform hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-2 group"
      >
        <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
          <Plus size={24} className="text-white" />
        </div>
        <span className="font-bold text-sm">{t.newLog}</span>
      </button>

      <button
        onClick={onHistoryClick}
        className="bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-700 p-5 rounded-2xl shadow-sm transition-all flex flex-col items-center justify-center gap-2 group"
      >
        <div className="bg-slate-100 p-3 rounded-full group-hover:bg-rose-100 transition-colors">
          <History size={24} className="text-slate-500 group-hover:text-rose-600 transition-colors" />
        </div>
        <span className="font-bold text-sm">{t.history}</span>
      </button>
    </div>

    {/* Refined Stats Row */}
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col justify-center items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.totalEntries}</span>
        <span className="text-2xl font-serif font-medium text-slate-800">{logs.length}</span>
      </div>
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col justify-center items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.avgDuration}</span>
        <span className="text-2xl font-serif font-medium text-slate-800 flex items-baseline gap-1">
          {logs.length > 0 ? Math.round(logs.reduce((a, b) => a + b.durationMinutes, 0) / logs.length) : 0}
          <span className="text-xs font-sans font-medium text-slate-400">{t.min}</span>
        </span>
      </div>
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-8 h-8 bg-rose-50 rounded-bl-xl"></div>
        <Trophy size={14} className="absolute top-1.5 right-1.5 text-rose-200" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.topPosition}</span>
        <span className="text-sm font-bold text-rose-700 truncate w-full px-1">{getFavoritePosition()}</span>
      </div>
    </div>

    {/* Enhanced AI Insight Section */}
    <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-white rounded-3xl p-6 shadow-sm border border-rose-100/50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-100 rounded-full blur-2xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-lg shadow-sm">
              <BrainCircuit size={18} className="text-rose-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">{t.aiTitle}</h3>
          </div>
          <button
            onClick={handleGenerateInsight}
            disabled={loadingInsight}
            className="text-[10px] font-bold bg-white text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1"
          >
            {loadingInsight ? <Sparkles size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {loadingInsight ? t.analyzing : t.updateAnalysis}
          </button>
        </div>

        {insight ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50 space-y-3">
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {insight.summary}
            </p>
            <div className="h-px bg-rose-100/50 w-full"></div>
            <div className="flex gap-3 items-start">
              <Zap size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-slate-600 italic">"{insight.wellnessTip}"</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-500 text-xs mb-3 max-w-[200px] mx-auto leading-relaxed">
              {t.aiDesc}
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Charts Section */}
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={18} className="text-rose-600" />
        <h3 className="text-sm font-bold text-slate-800">{t.chartsTitle}</h3>
      </div>
      <StatsChart data={logs} />
    </div>
  </div>
);

const HistoryView = ({
  logs,
  t,
  onCreateFirst
}: {
  logs: SessionLog[];
  t: ReturnType<typeof useLanguage>['t'];
  onCreateFirst: () => void;
}) => {
  const [selectedLog, setSelectedLog] = useState<SessionLog | null>(null);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

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
            onClick={onCreateFirst}
            className="mt-6 text-rose-600 font-bold hover:text-rose-700 text-sm"
          >
            {t.createFirst} &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-200 transition-all group cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${log.type === ActivityType.SOLO ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                    {log.type === ActivityType.SOLO ? 'S' : 'P'}
                  </div>
                  <div>
                    <div className="text-slate-800 text-base font-bold font-serif">
                      {log.type === ActivityType.SOLO ? t.activity[ActivityType.SOLO] : `${log.partnerName || t.activity[ActivityType.PARTNER]}`}
                    </div>
                    <div className="text-slate-400 text-xs font-medium mt-1 flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(log.date)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatTime(log.date)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{log.durationMinutes} {t.min}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < log.rating ? "text-rose-400 fill-rose-400" : "text-slate-200"} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded">
                    {t.mood[log.mood]}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  <MapPin size={10} /> {t.location[log.location]}
                </div>
                {log.positions.slice(0, 2).map(p => (
                  <span key={p} className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 px-2 py-1 rounded border border-rose-100">{t.position[p]}</span>
                ))}
                {log.positions.length > 2 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100">+{log.positions.length - 2}</span>
                )}
                {log.orgasmReached && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-pink-600 px-2 py-1 rounded border border-pink-100 flex items-center gap-1">
                    <Heart size={10} fill="currentColor" /> {t.climaxReached}
                  </span>
                )}
              </div>

              {log.notes && (
                <p className="mt-3 text-xs text-slate-400 italic truncate">"{log.notes}"</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6 rounded-t-2xl text-white relative">
              <button
                onClick={() => setSelectedLog(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold">
                  {selectedLog.type === ActivityType.SOLO ? 'S' : 'P'}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif">
                    {selectedLog.type === ActivityType.SOLO ? t.activity[ActivityType.SOLO] : `${selectedLog.partnerName || t.activity[ActivityType.PARTNER]}`}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">
                    {formatDate(selectedLog.date)} • {formatTime(selectedLog.date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <Clock size={16} className="text-rose-500 mx-auto mb-1" />
                  <span className="text-lg font-bold text-slate-800">{selectedLog.durationMinutes}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t.min}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <Smile size={16} className="text-rose-500 mx-auto mb-1" />
                  <span className="text-sm font-bold text-slate-800">{t.mood[selectedLog.mood]}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t.theVibe}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <div className="flex justify-center gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className={i < selectedLog.rating ? "text-rose-400 fill-rose-400" : "text-slate-200"} />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-slate-800">{selectedLog.rating}/5</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t.satisfaction}</span>
                </div>
              </div>

              {/* Location & Positions with Animations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Text Info */}
                <div className="space-y-4">
                  {/* Location */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.where}</h4>
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin size={16} className="text-rose-500" />
                      <span className="font-medium">{t.location[selectedLog.location]}</span>
                    </div>
                  </div>

                  {/* Positions */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.positions}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLog.positions.map(p => (
                        <span key={p} className="text-xs font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full border border-rose-100">{t.position[p]}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Position Animations */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-end items-start">
                  {selectedLog.positions.map(p => (
                    <div key={p} className="flex flex-col items-center gap-1">
                      <PositionIcon position={p} className="w-16 h-16" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">{t.position[p]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {selectedLog.tags && selectedLog.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.highlights}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLog.tags.map(tagId => {
                      const label = t.tags[tagId as keyof typeof t.tags] || tagId;
                      return (
                        <span key={tagId} className="text-xs font-bold bg-pink-50 text-pink-600 px-3 py-1.5 rounded-full border border-pink-100">
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Orgasm Status */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedLog.orgasmReached ? 'bg-pink-100 text-pink-600' : 'bg-slate-200 text-slate-400'}`}>
                  <Heart size={18} fill={selectedLog.orgasmReached ? "currentColor" : "none"} />
                </div>
                <span className="font-medium text-slate-700">
                  {selectedLog.orgasmReached ? t.climaxReached : t.noClimax}
                </span>
              </div>

              {/* Notes */}
              {selectedLog.notes && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.notes}</h4>
                  <p className="text-slate-600 text-sm bg-slate-50 p-4 rounded-xl italic">"{selectedLog.notes}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LogView = ({
  t,
  onSave,
  onCancel
}: {
  t: ReturnType<typeof useLanguage>['t'];
  onSave: (log: SessionLog) => void;
  onCancel: () => void;
}) => (
  <div className="max-w-2xl mx-auto">
    <div className="flex items-center gap-4 mb-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-800 font-serif">{t.newEntryTitle}</h2>
    </div>
    <LogEntryForm onSave={onSave} onCancel={onCancel} />
  </div>
);

const AuthPage = ({ mode }: { mode: 'login' | 'register' }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const from = (location.state as { from?: string } | undefined)?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = mode === 'login' ? login : register;
    const result = await action(username.trim(), password);
    if (!result.success) {
      setMessage(result.message || '操作失败');
      return;
    }
    setMessage(null);
    navigate(from, { replace: true });
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-serif font-bold text-slate-800 mb-3">
        {mode === 'login' ? '登录' : '注册'}
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        仅支持用户名和密码，暂无邮箱验证。
      </p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">用户名</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
            placeholder="输入用户名"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
            placeholder="至少 6 位"
            minLength={6}
            required
          />
        </div>
        {message && <div className="text-sm text-rose-500">{message}</div>}
        <button
          type="submit"
          className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg font-bold transition-colors"
        >
          {mode === 'login' ? '登录' : '注册'}
        </button>
      </form>
      <div className="mt-4 text-sm text-slate-500">
        {mode === 'login' ? (
          <>
            没有账号？{' '}
            <Link to="/auth/register" className="text-rose-600 font-bold hover:text-rose-700">
              去注册
            </Link>
          </>
        ) : (
          <>
            已有账号？{' '}
            <Link to="/auth/login" className="text-rose-600 font-bold hover:text-rose-700">
              去登录
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

const RequireAuth = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
};

const AppShell = () => {
  const { t, language, setLanguage } = useLanguage();
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [insight, setInsight] = useState<AnalysisResponse | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Load logs from D1 database
  useEffect(() => {
    if (!user) {
      setLogs([]);
      return;
    }
    setLoadingLogs(true);
    fetchLogs(user.username)
      .then(data => setLogs(data))
      .catch(e => console.error('Failed to load logs', e))
      .finally(() => setLoadingLogs(false));
  }, [user]);

  // Save log to D1 database
  const handleSaveLog = async (newLog: SessionLog) => {
    if (!user) return;
    const success = await saveLog(user.username, newLog);
    if (success) {
      setLogs([newLog, ...logs]);
    }
    navigate('/');
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

  const getFavoritePosition = () => {
    if (logs.length === 0) return '-';
    const posCounts: Record<string, number> = {};
    logs.forEach(l => l.positions.forEach(p => {
      const label = t.position[p] || p;
      posCounts[label] = (posCounts[label] || 0) + 1;
    }));
    const sorted = Object.entries(posCounts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : '-';
  };

  const handleLogout = () => {
    setLogs([]);
    setInsight(null);
    logout();
    navigate('/auth/login');
  };

  const activeNav = (path: string): NavTarget => {
    if (path.startsWith('/history')) return 'history';
    if (path.startsWith('/log')) return 'log';
    return 'dashboard';
  };

  const current = activeNav(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 bg-noise text-slate-900 selection:bg-rose-100 selection:text-rose-900 pb-20">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-600 rounded-xl flex items-center justify-center shadow-md shadow-rose-200">
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
            {user && (
              <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full border border-rose-100">
                <span className="text-xs font-semibold">@{user.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold hover:text-rose-900"
                >
                  退出
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/auth/login" element={<AuthPage mode="login" />} />
          <Route path="/auth/register" element={<AuthPage mode="register" />} />

          <Route element={<RequireAuth />}>
            <Route
              path="/"
              element={
                <DashboardView
                  logs={logs}
                  t={t}
                  getFavoritePosition={getFavoritePosition}
                  handleGenerateInsight={handleGenerateInsight}
                  loadingInsight={loadingInsight}
                  insight={insight}
                  onLogClick={() => navigate('/log')}
                  onHistoryClick={() => navigate('/history')}
                />
              }
            />
            <Route
              path="/log"
              element={<LogView t={t} onSave={handleSaveLog} onCancel={() => navigate('/')} />}
            />
            <Route
              path="/history"
              element={<HistoryView logs={logs} t={t} onCreateFirst={() => navigate('/log')} />}
            />
          </Route>
        </Routes>
      </main>

      {user && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full px-2 py-2 shadow-2xl shadow-slate-300/50 flex items-center gap-2 z-50">
          <Link
            to="/"
            className={`p-3 rounded-full transition-all ${current === 'dashboard' ? 'bg-rose-50 text-rose-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <Activity size={20} />
          </Link>

          <Link
            to="/log"
            className="bg-rose-600 hover:bg-rose-700 text-white p-3.5 rounded-full shadow-lg shadow-rose-200 transition-transform hover:scale-105 active:scale-95 mx-2"
          >
            <Plus size={22} />
          </Link>

          <Link
            to="/history"
            className={`p-3 rounded-full transition-all ${current === 'history' ? 'bg-rose-50 text-rose-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <History size={20} />
          </Link>
        </nav>
      )}
    </div>
  );
};

const App = () => (
  <LanguageProvider>
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  </LanguageProvider>
);

export default App;
