import React, { useState, useEffect, useMemo } from 'react';
import { SessionLog } from '../shared/types';
import { useLanguage } from '../contexts/LanguageContext';
import { DateTimePickerModal } from './DateTimePicker';
import {
    Activity,
    Sparkles,
    Timer,
    CalendarClock
} from 'lucide-react';

// --- Animation Component ---
export const CountUp: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 1500, suffix = '' }) => {
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

// --- Card Component ---
export const Card: React.FC<{
    children: React.ReactNode;
    className?: string;
    title?: string;
    action?: React.ReactNode;
    onClick?: () => void
}> = ({ children, className = '', title, action, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white rounded-[var(--radius-card)] p-6 shadow-subtle border border-slate-100 ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] active:bg-slate-50 hover:border-brand-100 hover:shadow-elevation transition-all duration-200 ease-out' : ''}`}
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

// --- StatCard Component ---
export const StatCard: React.FC<{ label: string; value: string | number; sub?: string; icon: React.ReactNode; delay?: string }> = ({ label, value, sub, icon, delay = '' }) => {
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
                <div className={`font-medium text-slate-800 tracking-tight mb-0.5 truncate ${isNumber ? 'text-3xl' : 'text-xl'}`}>
                    {isNumber ? <CountUp end={value as number} /> : value}
                </div>
                <div className="text-slate-500 text-xs font-medium">{label}</div>
            </div>
        </Card>
    );
};

// --- TimerWidget Component ---
export const TimerWidget: React.FC<{
    logs: SessionLog[];
    targetDate: string | null;
    onEdit: () => void;
    onClearTarget?: () => void;
    t: ReturnType<typeof useLanguage>['t'];
}> = ({ logs, targetDate, onEdit, onClearTarget, t }) => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), targetDate ? 1000 : 60000);
        return () => clearInterval(interval);
    }, [targetDate]);

    // Auto-clear expired countdown after 2 hours
    useEffect(() => {
        if (!targetDate || !onClearTarget) return;

        const target = new Date(targetDate).getTime();
        const diff = target - now;

        if (diff <= 0) {
            // Countdown has expired, clear it after 2 hours
            const timeout = setTimeout(() => {
                onClearTarget();
            }, 7200000); // 2 hours = 7200000ms

            return () => clearTimeout(timeout);
        }
    }, [targetDate, now, onClearTarget]);

    const displayData = useMemo(() => {
        if (targetDate) {
            const target = new Date(targetDate).getTime();
            const diff = target - now;

            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                return {
                    mode: 'countdown' as const,
                    label: t.countdown || 'Countdown',
                    days,
                    hours,
                    minutes,
                    seconds,
                    icon: <CalendarClock className="w-5 h-5" />,
                    accentClass: 'text-brand-500 bg-brand-50 border-brand-100'
                };
            }

            return {
                mode: 'timesup' as const,
                label: t.happeningNow || 'Now',
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                icon: <Sparkles className="w-5 h-5" />,
                accentClass: 'text-amber-500 bg-amber-50 border-amber-100'
            };
        }

        const latestLog = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        if (latestLog) {
            const last = new Date(latestLog.date).getTime();
            const diff = now - last;
            const days = diff < 0 ? 0 : Math.floor(diff / (1000 * 60 * 60 * 24));

            return {
                mode: 'lastSession' as const,
                label: t.lastSession || 'Last Session',
                days,
                subText: days === 0 ? (t.today || 'Today') : '',
                icon: <Timer className="w-5 h-5" />,
                accentClass: 'text-brand-500 bg-brand-50 border-brand-100'
            };
        }

        return {
            mode: 'empty' as const,
            label: t.welcome || 'Welcome',
            subText: t.tapToStart || 'Tap to set timer',
            icon: <Activity className="w-5 h-5" />,
            accentClass: 'text-slate-400 bg-slate-50 border-slate-100'
        };
    }, [logs, targetDate, now, t]);

    return (
        <div onClick={onEdit} className="relative w-full rounded-[var(--radius-card)] p-6 mb-6 cursor-pointer group transition-all duration-300 bg-white border border-slate-100 shadow-elevation hover:border-brand-200 active:scale-[0.98]">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{displayData.label}</span>

                    {displayData.mode === 'countdown' || displayData.mode === 'timesup' ? (
                        <div className="flex items-baseline gap-3 text-slate-900">
                            <div className="text-center">
                                <span className="text-4xl font-light tracking-tighter">{displayData.days}</span>
                                <span className="text-xs text-slate-400 ml-1">{t.days || 'd'}</span>
                            </div>
                            <span className="text-slate-300">:</span>
                            <div className="text-center">
                                <span className="text-4xl font-light tracking-tighter">{String(displayData.hours).padStart(2, '0')}</span>
                                <span className="text-xs text-slate-400 ml-1">h</span>
                            </div>
                            <span className="text-slate-300">:</span>
                            <div className="text-center">
                                <span className="text-4xl font-light tracking-tighter">{String(displayData.minutes).padStart(2, '0')}</span>
                                <span className="text-xs text-slate-400 ml-1">m</span>
                            </div>
                            <span className="text-slate-300">:</span>
                            <div className="text-center">
                                <span className="text-4xl font-light tracking-tighter">{String(displayData.seconds).padStart(2, '0')}</span>
                                <span className="text-xs text-slate-400 ml-1">s</span>
                            </div>
                        </div>
                    ) : displayData.mode === 'lastSession' ? (
                        <div className="flex items-baseline gap-2 text-slate-900">
                            <span className="text-5xl font-light tracking-tighter">
                                <CountUp end={displayData.days} />
                            </span>
                            <span className="text-lg font-normal text-slate-500">{t.days || 'Days'}</span>
                        </div>
                    ) : (
                        <div className="text-lg text-slate-400">{displayData.subText}</div>
                    )}

                    {displayData.mode === 'lastSession' && displayData.subText && (
                        <div className="text-sm font-medium text-slate-400 mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                            {displayData.subText}
                        </div>
                    )}

                    {displayData.mode === 'timesup' && (
                        <div className="text-sm font-medium text-amber-500 mt-1">{t.timeUp || "Time's up!"}</div>
                    )}
                </div>

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${displayData.accentClass}`}>
                    {displayData.icon}
                </div>
            </div>
        </div>
    );
};

// --- TargetDateModal Component ---
export const TargetDateModal: React.FC<{ currentDate: string | null; onSave: (date: string | null) => void; onClose: () => void; t: ReturnType<typeof useLanguage>['t'] }> = ({ currentDate, onSave, onClose, t }) => {
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

// --- GoogleSVG Component ---
export const GoogleSVG = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);
