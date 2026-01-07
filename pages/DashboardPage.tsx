import React, { useState, useMemo } from 'react';
import { SessionLog, AnalysisResponse } from '../shared/types';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, StatCard, TimerWidget, TargetDateModal } from '../components/SharedComponents';
import { StatsChart } from '../components/StatsChart';
import {
    Activity,
    Clock,
    Heart,
    Sparkles,
    TrendingUp,
    Star,
    Zap,
    ArrowRight
} from 'lucide-react';

interface DashboardPageProps {
    logs: SessionLog[];
    getFavoritePosition: () => string;
    handleGenerateInsight: () => Promise<void>;
    loadingInsight: boolean;
    insight: AnalysisResponse | null;
    targetDate: string | null;
    setTargetDate: (d: string | null) => void;
    user: { username: string; displayName?: string } | null;
    onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
    logs,
    getFavoritePosition,
    handleGenerateInsight,
    loadingInsight,
    insight,
    targetDate,
    setTargetDate,
    user,
    onLogout,
}) => {
    const { t, language, setLanguage } = useLanguage();
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
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute top-12 right-0 bg-white rounded-[var(--radius-card)] shadow-elevation border border-slate-100 p-2 min-w-[160px] animate-scale-in z-50">
                                    <div className="px-3 py-2 text-xs text-slate-400 font-medium border-b border-slate-100 mb-1">
                                        @{user?.displayName || user?.username}
                                    </div>
                                    <button
                                        onClick={() => { setShowUserMenu(false); onLogout(); }}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-[var(--radius-input)] transition-colors font-medium"
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
                <TimerWidget
                    logs={logs}
                    targetDate={targetDate}
                    onEdit={() => setShowTimerModal(true)}
                    onClearTarget={() => setTargetDate(null)}
                    t={t}
                />
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
                            <h2>{t.aiTitle}</h2>
                        </div>
                    </div>

                    {loadingInsight ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="relative w-24 h-24 mb-4">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-brand-200/50 animate-breathe" />
                                </div>
                                <div
                                    className="absolute w-5 h-5 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 shadow-lg shadow-brand-300/50"
                                    style={{
                                        animation: 'orbit 2s ease-in-out infinite',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                />
                                <div
                                    className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-pink-300 to-brand-400 shadow-lg shadow-pink-300/50"
                                    style={{
                                        animation: 'orbit 2s ease-in-out infinite reverse',
                                        animationDelay: '0.5s',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div
                                        className="w-16 h-16 rounded-full border border-brand-200/50"
                                        style={{ animation: 'pulse-ring 2s ease-out infinite' }}
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 font-medium animate-pulse">
                                {language === 'zh' ? '正在感知你们的默契...' : 'Sensing your connection...'}
                            </p>
                        </div>
                    ) : insight ? (
                        <div className="space-y-3">
                            <div className="flex gap-2 items-start">
                                <TrendingUp size={14} className="text-blue-500 shrink-0 mt-1" />
                                <p className="text-slate-600 text-sm leading-relaxed">{insight.frequencyInsight}</p>
                            </div>
                            <div className="flex gap-2 items-start">
                                <Star size={14} className="text-amber-500 shrink-0 mt-1" />
                                <p className="text-slate-600 text-sm leading-relaxed">{insight.satisfactionInsight}</p>
                            </div>
                            <div className="flex gap-2 items-start">
                                <Zap size={14} className="text-purple-500 shrink-0 mt-1" />
                                <p className="text-slate-600 text-sm leading-relaxed">{insight.diversityTip}</p>
                            </div>
                            <div className="bg-brand-50/50 rounded-[var(--radius-input)] p-3 mt-2">
                                <div className="flex gap-2 items-start">
                                    <Heart size={14} className="text-brand-500 shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium text-brand-700">{insight.personalizedTip}</p>
                                </div>
                            </div>
                            <p className="text-xs text-center font-medium text-slate-400 italic pt-2">"{insight.encouragement}"</p>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm leading-relaxed">{t.aiDesc}</p>
                    )}

                    {!loadingInsight && (
                        <div className="flex justify-end mt-4">
                            <button onClick={handleGenerateInsight} disabled={loadingInsight} className="text-xs flex items-center gap-1 text-slate-400 hover:text-brand-600 font-medium transition-colors active:scale-95">
                                {t.updateAnalysis} <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    )}
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
