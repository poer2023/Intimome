import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link, Navigate, Outlet } from 'react-router-dom';
import { ActivityType, SessionLog, AnalysisResponse } from './types';
import { LogEntryForm } from './components/LogEntryForm';
import { StatsChart } from './components/StatsChart';
import { PositionIcon } from './components/PositionIcons';
import { generateInsights } from './services/geminiService';
import { fetchLogs, saveLog } from './services/logsService';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BottomNav } from './components/BottomNav';
import { DateTimePickerModal } from './components/DateTimePicker';
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
  Trophy,
  Globe,
  Clock,
  Star,
  X,
  Smile,
  Timer,
  CalendarClock,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

type NavTarget = 'dashboard' | 'log' | 'history';

// --- Animation Components ---
const CountUp: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 1500, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * end));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);
  return <>{count}{suffix}</>;
};

// --- Shared Components ---
const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  onClick?: () => void
}> = ({ children, className = '', title, action, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-[24px] p-6 shadow-subtle border border-slate-100 ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] active:bg-slate-50 hover:border-brand-100 hover:shadow-elevation transition-all duration-200 ease-out' : ''}`}
  >
    {(title || action) && (
      <div className="flex justify-between items-center mb-6">
        {title && <h3 className="text-slate-900 font-semibold text-base tracking-tight">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

const StatCard: React.FC<{ label: string; value: string | number; sub?: string; icon: React.ReactNode; delay?: string }> = ({ label, value, sub, icon, delay = '' }) => {
  const isNumber = typeof value === 'number';
  return (
    <Card className={`flex flex-col justify-between h-32 relative group animate-slide-up ${delay}`}>
      <div className="flex justify-between items-start">
        <div className="text-slate-400 group-hover:text-brand-400 transition-colors duration-300">
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
        </div>
        {sub && <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{sub}</div>}
      </div>
      <div className="mt-2">
        <div className="text-3xl font-medium text-slate-800 tracking-tight mb-0.5">
          {isNumber ? <CountUp end={value as number} /> : value}
        </div>
        <div className="text-slate-500 text-xs font-medium">{label}</div>
      </div>
    </Card>
  );
};

const TimerWidget: React.FC<{
  logs: SessionLog[];
  targetDate: string | null;
  onEdit: () => void;
  t: ReturnType<typeof useLanguage>['t'];
}> = ({ logs, targetDate, onEdit, t }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const displayData = useMemo(() => {
    if (targetDate) {
      const target = new Date(targetDate).getTime();
      const diff = target - now;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return { label: t.countdown || 'Countdown', mainValue: days, unit: t.days || 'Days', subValue: `${hours}h`, icon: <CalendarClock className="w-5 h-5" />, accentClass: 'text-brand-500 bg-brand-50 border-brand-100' };
      }
      return { label: t.happeningNow || 'Now', mainValue: 0, unit: t.days || 'Days', subValue: t.timeUp || "Time's up", icon: <Sparkles className="w-5 h-5" />, accentClass: 'text-amber-500 bg-amber-50 border-amber-100' };
    }
    const latestLog = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (latestLog) {
      const last = new Date(latestLog.date).getTime();
      const diff = now - last;
      const days = diff < 0 ? 0 : Math.floor(diff / (1000 * 60 * 60 * 24));
      return { label: t.lastSession || 'Last Session', mainValue: days, unit: t.days || 'Days', subValue: days === 0 ? t.today || 'Today' : t.ago || 'Ago', icon: <Timer className="w-5 h-5" />, accentClass: 'text-brand-500 bg-brand-50 border-brand-100' };
    }
    return { label: t.welcome || 'Welcome', mainValue: '-', unit: '', subValue: t.tapToStart || 'Tap to start', icon: <Activity className="w-5 h-5" />, accentClass: 'text-slate-400 bg-slate-50 border-slate-100' };
  }, [logs, targetDate, now, t]);

  return (
    <div onClick={onEdit} className="relative w-full rounded-[28px] p-6 mb-6 cursor-pointer group transition-all duration-300 bg-white border border-slate-100 shadow-elevation hover:border-brand-200 active:scale-[0.98]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{displayData.label}</span>
          <div className="flex items-baseline gap-2 text-slate-900">
            <span className="text-5xl font-light tracking-tighter">
              {typeof displayData.mainValue === 'number' ? <CountUp end={displayData.mainValue} /> : displayData.mainValue}
            </span>
            <span className="text-lg font-normal text-slate-500">{displayData.unit}</span>
          </div>
          <div className="text-sm font-medium text-slate-400 mt-1 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${displayData.accentClass.split(' ')[0].replace('text', 'bg')}`}></span>
            {displayData.subValue}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${displayData.accentClass}`}>
          {displayData.icon}
        </div>
      </div>
    </div>
  );
};

const TargetDateModal: React.FC<{ currentDate: string | null; onSave: (date: string | null) => void; onClose: () => void; t: ReturnType<typeof useLanguage>['t'] }> = ({ currentDate, onSave, onClose, t }) => {
  return (
    <DateTimePickerModal
      isOpen={true}
      onClose={onClose}
      onConfirm={(d) => {
        const offset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
        onSave(localISOTime);
      }}
      onClear={currentDate ? () => onSave(null) : undefined}
      initialDate={currentDate ? new Date(currentDate) : new Date(Date.now() + 86400000)}
      title={t.setTimer || "Set Timer"}
    />
  );
};


const DashboardView = ({
  logs,
  t,
  getFavoritePosition,
  handleGenerateInsight,
  loadingInsight,
  insight,
  onLogClick,
  onHistoryClick,
  targetDate,
  setTargetDate,
  user,
  onLogout,
  language,
  setLanguage
}: {
  logs: SessionLog[];
  t: ReturnType<typeof useLanguage>['t'];
  getFavoritePosition: () => string;
  handleGenerateInsight: () => Promise<void>;
  loadingInsight: boolean;
  insight: AnalysisResponse | null;
  onLogClick: () => void;
  onHistoryClick: () => void;
  targetDate: string | null;
  setTargetDate: (d: string | null) => void;
  user: { username: string; displayName?: string } | null;
  onLogout: () => void;
  language: string;
  setLanguage: (lang: 'en' | 'zh') => void;
}) => {
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const stats = useMemo(() => {
    const total = logs.length;
    const avgDuration = total > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.durationMinutes, 0) / total) : 0;
    return { total, avgDuration };
  }, [logs]);

  const userInitials = user?.displayName?.slice(0, 2).toUpperCase() || user?.username?.slice(0, 2).toUpperCase() || 'JD';

  return (
    <div className="space-y-6 animate-fade-in pb-40 px-1 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center py-4 px-1 animate-slide-up relative z-30">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">IntimDiary.</h1>
        <div className="flex items-center gap-2 relative">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all active:scale-95 shadow-subtle text-xs font-bold"
          >
            {language === 'en' ? 'EN' : '中'}
          </button>
          {/* User Avatar */}
          <div className="relative z-40">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 hover:bg-brand-100 transition-all active:scale-95 shadow-subtle relative z-10"
            >
              <span className="text-xs font-bold">{userInitials}</span>
            </button>
            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop to close on click outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-elevation border border-slate-100 p-2 min-w-[160px] animate-scale-in z-50">
                  <div className="px-3 py-2 text-xs text-slate-400 font-medium border-b border-slate-100 mb-1">
                    @{user?.displayName || user?.username}
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); onLogout(); }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                  >
                    退出登录
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Timer Widget */}
      <div className="animate-slide-up">
        <TimerWidget logs={logs} targetDate={targetDate} onEdit={() => setShowTimerModal(true)} t={t} />
      </div>

      {/* Stats Grid using StatCard */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label={t.totalEntries} value={stats.total} icon={<Activity />} delay="delay-100" />
        <StatCard label={t.avgDuration} value={stats.avgDuration} sub={t.min} icon={<Clock />} delay="delay-150" />
        <div className="col-span-2 md:col-span-1">
          <StatCard label={t.topPosition} value={getFavoritePosition()} icon={<Heart />} delay="delay-200" />
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="animate-slide-up delay-300">
        <Card className="bg-gradient-to-br from-brand-50/50 via-white to-white">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-brand-700 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <h3>{t.aiTitle}</h3>
            </div>
          </div>
          {insight ? (
            <div className="space-y-3">
              <p className="text-slate-600 text-sm leading-relaxed">{insight.summary}</p>
              <div className="flex gap-3 items-start">
                <Zap size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-slate-600 italic">"{insight.wellnessTip}"</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm leading-relaxed">{t.aiDesc}</p>
          )}
          <div className="flex justify-end mt-4">
            <button onClick={handleGenerateInsight} disabled={loadingInsight} className="text-xs flex items-center gap-1 text-slate-400 hover:text-brand-600 font-medium transition-colors active:scale-95">
              {loadingInsight ? t.analyzing : t.updateAnalysis} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="space-y-5 pt-6 animate-slide-up delay-300">
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="w-4 h-4 text-brand-400" />
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analytics</h2>
        </div>
        <StatsChart data={logs} />
      </div>

      {/* Timer Modal */}
      {showTimerModal && (
        <TargetDateModal currentDate={targetDate} onSave={setTargetDate} onClose={() => setShowTimerModal(false)} t={t} />
      )}
    </div>
  );
};


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
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', weekday: 'long' });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getLogIcon = (log: SessionLog) => {
    if (log.type === ActivityType.SOLO) return <Zap className="w-6 h-6" />;
    if (log.partnerName) return <Heart className="w-6 h-6" />;
    return <Activity className="w-6 h-6" />;
  };

  const getLogColor = (log: SessionLog) => {
    if (log.type === ActivityType.SOLO) return 'text-amber-500 bg-amber-50';
    if (log.partnerName) return 'text-brand-500 bg-brand-50';
    return 'text-indigo-500 bg-indigo-50';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-40 px-1">
      {/* Header */}
      <header className="flex justify-between items-center py-4 px-1 animate-slide-up relative z-30">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">History</h1>
      </header>

      {logs.length === 0 ? (
        <div className="text-slate-400 text-center py-20 bg-white rounded-[24px] border border-slate-100 border-dashed">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={24} className="text-slate-300" />
          </div>
          <p className="text-base font-medium text-slate-600">{t.noLogs}</p>
          <button
            onClick={onCreateFirst}
            className="mt-6 text-brand-600 font-bold hover:text-brand-700 text-sm"
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
              className="bg-white p-4 rounded-[20px] shadow-subtle border border-slate-100 hover:shadow-elevation hover:border-brand-100 transition-all cursor-pointer flex items-center gap-4 group"
            >
              {/* Icon Container */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getLogColor(log)} transition-transform group-hover:scale-105`}>
                {getLogIcon(log)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-lg font-bold text-slate-800 tracking-tight">{formatShortDate(log.date)}</span>
                  <span className="text-sm font-medium text-slate-400">at {formatTime(log.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <span className="text-slate-700">{t.mood[log.mood]}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{log.durationMinutes} {t.min}</span>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-[32px] w-full max-w-[360px] shadow-2xl animate-modal-slide-up relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors active:scale-90 z-10"
            >
              <X size={18} className="text-slate-500" />
            </button>

            <div className="pt-10 pb-8 px-6 text-center">
              {/* Header Icon */}
              <div
                className={`w-16 h-16 rounded-[20px] flex items-center justify-center mx-auto mb-4 bg-white shadow-elevation border border-slate-100 ${getLogColor(selectedLog).replace('bg-', 'text-').replace('text-', 'text-')} animate-slide-up delay-100 opacity-0`}
                style={{ animationFillMode: 'forwards' }}
              >
                {getLogIcon(selectedLog)}
              </div>

              {/* Title & Date */}
              <h2 className="text-2xl font-bold text-slate-900 mb-1 font-serif tracking-tight">
                {selectedLog.type === ActivityType.SOLO ? 'Solo' : 'Partner'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mb-8">
                {formatDate(selectedLog.date)}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 py-6 mb-8 animate-slide-up delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div>
                  <div className="text-xl font-bold text-slate-900 tracking-tight">{selectedLog.durationMinutes}m</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Duration</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 tracking-tight truncate px-1">{t.mood[selectedLog.mood]}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Vibe</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900 tracking-tight">{selectedLog.rating}/5</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Rating</div>
                </div>
              </div>

              {/* Info Sections */}
              <div className="space-y-4 text-left animate-slide-up delay-300 opacity-0" style={{ animationFillMode: 'forwards' }}>
                {/* Location */}
                <div className="bg-slate-50 rounded-[20px] p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Location</div>
                    <div className="text-sm font-bold text-slate-800">{t.location[selectedLog.location]}</div>
                  </div>
                </div>

                {/* Positions */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{t.positions}</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedLog.positions.map(p => (
                      <div key={p} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                        <div className="w-12 h-12 mb-2">
                          <PositionIcon position={p} className="w-full h-full" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">
                          {t.position[p]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
  <div className="pb-32 animate-slide-up px-1">
    <div className="py-4 px-1 mb-2">
      <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{t.newEntryTitle}</h1>
    </div>
    <LogEntryForm onSave={onSave} onCancel={onCancel} />
  </div>
);

const GoogleSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AuthPage = ({ mode }: { mode: 'login' | 'register' }) => {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const from = (location.state as { from?: string } | undefined)?.from || '/';
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!googleClientId || !googleBtnRef.current) return;
    const w = window as any;
    if (!w.google?.accounts?.id) return;

    w.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (resp: { credential?: string }) => {
        if (!resp.credential) {
          setMessage('Google 登录失败');
          return;
        }
        const result = await loginWithGoogle(resp.credential);
        if (!result.success) {
          setMessage(result.message || 'Google 登录失败');
          return;
        }
        setMessage(null);
        navigate(from, { replace: true });
      }
    });

    w.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      width: '100%',
    });
  }, [googleClientId, loginWithGoogle, navigate, from]);



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
    <div className="space-y-6 animate-fade-in pt-4 px-1 pb-40 max-w-lg mx-auto">
      <div className="py-4 px-1">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">IntimDiary.</h1>
      </div>
      <div className="bg-white rounded-[24px] p-8 shadow-subtle border border-slate-100">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          {mode === 'login' ? '登录' : '注册'}
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          仅支持用户名和密码，暂无邮箱验证。
        </p>

        {googleClientId && (
          <div className="mb-6">
            <div className="relative w-full h-[48px] rounded-xl overflow-hidden group hover:border-slate-300 transition-colors">
              {/* Custom Visual Button */}
              <div className="absolute inset-0 w-full h-full bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-3 shadow-sm pointer-events-none group-hover:bg-slate-50 transition-colors">
                <GoogleSVG />
                <span className="text-sm font-bold text-slate-700">通过 Google 继续</span>
              </div>

              {/* Functional Invisible Overlay */}
              <div
                ref={googleBtnRef}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                style={{ transform: 'scale(1.05)' }} // Slight scale to ensure edge clicks are caught
              ></div>
            </div>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-slate-100 flex-1"></div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">OR</div>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">用户名</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:bg-white focus:border-brand-500 outline-none transition-all"
              placeholder="输入用户名"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:bg-white focus:border-brand-500 outline-none transition-all"
              placeholder="至少 6 位"
              minLength={6}
              required
            />
          </div>
          {message && <div className="text-sm text-brand-500 font-medium">{message}</div>}
          <button
            type="submit"
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]"
          >
            {mode === 'login' ? '登录' : '注册'}
          </button>
        </form>
        <div className="mt-6 text-sm text-slate-500 text-center">
          {mode === 'login' ? (
            <>
              没有账号？{' '}
              <Link to="/auth/register" className="text-brand-600 font-semibold hover:text-brand-700">
                去注册
              </Link>
            </>
          ) : (
            <>
              已有账号？{' '}
              <Link to="/auth/login" className="text-brand-600 font-semibold hover:text-brand-700">
                去登录
              </Link>
            </>
          )}
        </div>
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
  const [targetDate, setTargetDate] = useState<string | null>(null);
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
    fetchLogs()
      .then(data => setLogs(data))
      .catch(e => console.error('Failed to load logs', e))
      .finally(() => setLoadingLogs(false));
  }, [user]);

  // Save log to D1 database
  const handleSaveLog = async (newLog: SessionLog) => {
    if (!user) return;
    const success = await saveLog(newLog);
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
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-brand-100 selection:text-brand-900 pb-32">
      <main className="max-w-lg mx-auto px-5 pt-6 pb-8 no-scrollbar h-full overflow-y-auto">
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
                  targetDate={targetDate}
                  setTargetDate={setTargetDate}
                  user={user}
                  onLogout={handleLogout}
                  language={language}
                  setLanguage={setLanguage}
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

      {user && <BottomNav />}
    </div>
  );
};

const App = () => (
  <LanguageProvider>
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  </LanguageProvider>
);

export default App;
