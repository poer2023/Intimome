import React, { useState, useEffect, useCallback } from 'react';
import { SessionLog, ActivityType, MoodType } from '../shared/types';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchLogs } from '../services/logsService';
import { PositionIcon } from '../components/PositionIcons';
import {
    Activity,
    Heart,
    Zap,
    Calendar,
    MapPin,
    ChevronRight,
    X,
    Trash2,
    Filter,
    Search,
    Pencil
} from 'lucide-react';

interface HistoryPageProps {
    onCreateFirst: () => void;
    onDeleteLog: (logId: string) => Promise<boolean>;
    onEditLog?: (log: SessionLog) => void;
}

interface Filters {
    mood?: string;
    search?: string;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
    onCreateFirst,
    onDeleteLog,
    onEditLog
}) => {
    const { t, language } = useLanguage();
    const [logs, setLogs] = useState<SessionLog[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedLog, setSelectedLog] = useState<SessionLog | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter state
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>({});
    const [searchInput, setSearchInput] = useState('');

    const ITEMS_PER_PAGE = 15;

    // Fetch logs with filters
    const loadLogs = useCallback(async (pageNum: number, append = false) => {
        if (append) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }

        try {
            const { logs: data, pagination } = await fetchLogs(pageNum, ITEMS_PER_PAGE, filters);
            if (append) {
                setLogs(prev => [...prev, ...data]);
            } else {
                setLogs(data);
            }
            setPage(pageNum);
            setHasMore(pagination.hasMore);
            setTotal(pagination.total);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [filters]);

    useEffect(() => {
        loadLogs(1);
    }, [loadLogs]);

    const handleLoadMore = () => {
        if (isLoadingMore || !hasMore) return;
        loadLogs(page + 1, true);
    };

    const handleApplyFilters = () => {
        setFilters(prev => ({
            ...prev,
            search: searchInput.trim() || undefined
        }));
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearchInput('');
        setShowFilters(false);
    };

    const handleMoodFilter = (mood: string) => {
        setFilters(prev => ({
            ...prev,
            mood: prev.mood === mood ? undefined : mood
        }));
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

    const handleDelete = async () => {
        if (!selectedLog) return;
        setIsDeleting(true);
        const success = await onDeleteLog(selectedLog.id);
        setIsDeleting(false);
        if (success) {
            setLogs(prev => prev.filter(log => log.id !== selectedLog.id));
            setTotal(prev => prev - 1);
            setSelectedLog(null);
            setShowDeleteConfirm(false);
        }
    };

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

    const moodOptions = Object.values(MoodType);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in pb-40 px-1">
                <header className="flex justify-between items-center py-4 px-1 animate-slide-up relative z-30">
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">History</h1>
                </header>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-40 px-1">
            <header className="flex justify-between items-center py-4 px-1 animate-slide-up relative z-30">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">History</h1>
                <div className="flex items-center gap-2">
                    {total > 0 && (
                        <span className="text-sm font-medium text-slate-400">{total} {t.entries}</span>
                    )}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-xl transition-all ${hasActiveFilters ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <Filter size={18} />
                    </button>
                </div>
            </header>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white rounded-2xl p-4 shadow-subtle border border-slate-100 space-y-4 animate-slide-up">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder={language === 'zh' ? '搜索备注或伴侣名...' : 'Search notes or partner...'}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-sm border border-transparent focus:border-brand-500 focus:bg-white outline-none transition-all"
                        />
                    </div>

                    {/* Mood Filter */}
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {language === 'zh' ? '心情' : 'Mood'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {moodOptions.map(mood => (
                                <button
                                    key={mood}
                                    onClick={() => handleMoodFilter(mood)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filters.mood === mood
                                        ? 'bg-brand-500 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {t.mood[mood]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleClearFilters}
                            className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                        >
                            {language === 'zh' ? '清除' : 'Clear'}
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            className="flex-1 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors"
                        >
                            {language === 'zh' ? '应用' : 'Apply'}
                        </button>
                    </div>
                </div>
            )}

            {logs.length === 0 ? (
                <div className="text-slate-400 text-center py-20 bg-white rounded-[24px] border border-slate-100 border-dashed">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={24} className="text-slate-300" />
                    </div>
                    <p className="text-base font-medium text-slate-600">
                        {hasActiveFilters ? (language === 'zh' ? '没有匹配的记录' : 'No matching records') : t.noLogs}
                    </p>
                    {hasActiveFilters ? (
                        <button
                            onClick={handleClearFilters}
                            className="mt-6 text-brand-600 font-bold hover:text-brand-700 text-sm"
                        >
                            {language === 'zh' ? '清除筛选' : 'Clear Filters'}
                        </button>
                    ) : (
                        <button
                            onClick={onCreateFirst}
                            className="mt-6 text-brand-600 font-bold hover:text-brand-700 text-sm"
                        >
                            {t.createFirst} &rarr;
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {logs.map((log) => (
                        <div
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            className="bg-white p-4 rounded-[20px] shadow-subtle border border-slate-100 hover:shadow-elevation hover:border-brand-100 transition-all cursor-pointer flex items-center gap-4 group"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getLogColor(log)} transition-transform group-hover:scale-105`}>
                                {getLogIcon(log)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-lg font-bold text-slate-800 tracking-tight">{formatShortDate(log.date)}</span>
                                    <span className="text-sm font-medium text-slate-400">at {formatTime(log.date)}</span>
                                    {log.tags?.includes('QuickCapture') && (
                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                            <Zap size={10} />
                                            {t.pendingDetails}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                    <span className="text-slate-700">{t.mood[log.mood]}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span>{log.durationMinutes} {t.min}</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                        </div>
                    ))}

                    {hasMore && (
                        <button
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoadingMore ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full"></div>
                                    加载中...
                                </>
                            ) : (
                                <>加载更多</>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {selectedLog && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedLog(null)}
                >
                    <div
                        className="bg-white rounded-[32px] w-full max-w-[360px] max-h-[85vh] shadow-2xl animate-modal-slide-up relative overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="absolute top-4 left-4 bg-slate-50 hover:bg-red-50 p-2 rounded-full transition-colors active:scale-90 z-10 group"
                            title={t.deleteEntry}
                        >
                            <Trash2 size={16} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                        </button>

                        {onEditLog && (
                            <button
                                onClick={() => {
                                    setSelectedLog(null);
                                    onEditLog(selectedLog);
                                }}
                                className="absolute top-4 left-14 bg-slate-50 hover:bg-brand-50 p-2 rounded-full transition-colors active:scale-90 z-10 group"
                                title={language === 'zh' ? '编辑' : 'Edit'}
                            >
                                <Pencil size={16} className="text-slate-400 group-hover:text-brand-500 transition-colors" />
                            </button>
                        )}

                        <button
                            onClick={() => setSelectedLog(null)}
                            className="absolute top-4 right-4 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors active:scale-90 z-10"
                        >
                            <X size={18} className="text-slate-500" />
                        </button>

                        <div className="pt-12 pb-8 px-6 text-center overflow-y-auto flex-1">
                            <h2 className="text-2xl font-bold text-slate-900 mb-1 font-serif tracking-tight animate-slide-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
                                {selectedLog.type === ActivityType.SOLO ? t.solo : (selectedLog.partnerName || t.partner)}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mb-8 animate-slide-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
                                {formatDate(selectedLog.date)}
                            </p>

                            <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 py-6 mb-8 animate-slide-up delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
                                <div>
                                    <div className="text-xl font-bold text-slate-900 tracking-tight">{selectedLog.durationMinutes}m</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{t.duration}</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-slate-900 tracking-tight truncate px-1">{t.mood[selectedLog.mood]}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{t.vibe}</div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-slate-900 tracking-tight">{selectedLog.rating}/5</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{t.rating}</div>
                                </div>
                            </div>

                            <div className="space-y-4 text-left animate-slide-up delay-300 opacity-0" style={{ animationFillMode: 'forwards' }}>
                                <div className="bg-slate-50 rounded-[20px] p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t.locationLabel}</div>
                                        <div className="text-sm font-bold text-slate-800">{t.location[selectedLog.location]}</div>
                                    </div>
                                </div>

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

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setShowDeleteConfirm(false)}
                >
                    <div
                        className="bg-white rounded-[24px] w-full max-w-[320px] p-6 shadow-2xl animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">{t.deleteConfirmTitle}</h3>
                        <p className="text-sm text-slate-500 mb-6 text-center">{t.deleteConfirmMessage}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                {t.deleteNo}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? t.deleting : t.deleteYes}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
