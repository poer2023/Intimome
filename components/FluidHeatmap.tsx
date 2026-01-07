import React, { useMemo, useState } from 'react';
import { SessionLog } from '../shared/types';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from './SharedComponents';
import { Heart } from 'lucide-react';
import { BloomVisual, BloomLayerData, TimeFrame } from './BloomVisual';

interface FluidHeatmapProps {
    logs: SessionLog[];
}

export const FluidHeatmap: React.FC<FluidHeatmapProps> = ({ logs }) => {
    const { t, language } = useLanguage();
    const [view, setView] = useState<TimeFrame>('Week');

    // Filter logs based on view
    const filteredLogs = useMemo(() => {
        const now = new Date();
        return logs.filter(log => {
            const logDate = new Date(log.date);
            const diff = now.getTime() - logDate.getTime();
            const diffDays = diff / (1000 * 60 * 60 * 24);
            if (view === 'Week') return diffDays <= 7;
            if (view === 'Month') return diffDays <= 30;
            if (view === 'Year') return diffDays <= 365;
            return true;
        });
    }, [logs, view]);

    // Generate bloom layer data from logs
    const bloomData: BloomLayerData[] = useMemo(() => {
        const now = new Date();

        if (view === 'Week') {
            // 7 layers, one per day
            const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const dayCounts = Array(7).fill(0);

            filteredLogs.forEach(log => {
                const logDate = new Date(log.date);
                const diff = now.getTime() - logDate.getTime();
                const dayIndex = Math.min(Math.floor(diff / (1000 * 60 * 60 * 24)), 6);
                if (dayIndex >= 0 && dayIndex < 7) {
                    dayCounts[6 - dayIndex]++; // Reverse so recent is outer
                }
            });

            const maxCount = Math.max(1, ...dayCounts);
            return dayCounts.map((count, i) => ({
                id: `day-${i}`,
                intensity: Math.max(0.1, count / maxCount),
                label: dayLabels[i]
            }));
        }

        if (view === 'Month') {
            // 4-5 layers, one per week
            const weekCounts = Array(5).fill(0);

            filteredLogs.forEach(log => {
                const logDate = new Date(log.date);
                const diff = now.getTime() - logDate.getTime();
                const weekIndex = Math.min(Math.floor(diff / (1000 * 60 * 60 * 24 * 7)), 4);
                if (weekIndex >= 0 && weekIndex < 5) {
                    weekCounts[4 - weekIndex]++;
                }
            });

            const maxCount = Math.max(1, ...weekCounts);
            return weekCounts.map((count, i) => ({
                id: `week-${i}`,
                intensity: Math.max(0.15, count / maxCount),
                label: `W${i + 1}`
            }));
        }

        // Year: 12 layers, one per month
        const monthLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
        const monthCounts = Array(12).fill(0);

        filteredLogs.forEach(log => {
            const logDate = new Date(log.date);
            const diff = now.getTime() - logDate.getTime();
            const monthIndex = Math.min(Math.floor(diff / (1000 * 60 * 60 * 24 * 30)), 11);
            if (monthIndex >= 0 && monthIndex < 12) {
                monthCounts[11 - monthIndex]++;
            }
        });

        const maxCount = Math.max(1, ...monthCounts);
        return monthCounts.map((count, i) => ({
            id: `month-${i}`,
            intensity: Math.max(0.1, count / maxCount),
            label: monthLabels[i]
        }));
    }, [filteredLogs, view]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = filteredLogs.length;

        if (bloomData.length === 0) return { total, peakLabel: null };

        const peakIndex = bloomData.reduce((iMax, x, i, arr) =>
            x.intensity > arr[iMax].intensity ? i : iMax, 0);
        const peakLabel = bloomData[peakIndex]?.label || null;

        return { total, peakLabel };
    }, [filteredLogs, bloomData]);

    return (
        <Card className="overflow-hidden bg-[#FDFDFD]">
            {/* Header */}
            <div className="flex justify-between items-end mb-2">
                <h3 className="text-slate-900 font-medium text-xl tracking-tight leading-none">
                    {language === 'zh' ? '亲密绽放' : 'Intimacy Bloom'}
                </h3>

                <div className="flex space-x-4 text-[13px] font-medium text-slate-400">
                    {(['Week', 'Month', 'Year'] as TimeFrame[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setView(tab)}
                            className={`relative pb-1 transition-colors duration-300 ${view === tab ? 'text-slate-900' : 'hover:text-slate-600'
                                }`}
                        >
                            {tab}
                            {view === tab && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FF99B1] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Graphic */}
            <BloomVisual data={bloomData} timeframe={view} />

            {/* Footer */}
            <div className="flex justify-between items-center text-slate-400 text-[13px] font-medium pt-2">
                <div className="flex gap-2 items-center">
                    <span>Total {stats.total}</span>
                    {stats.peakLabel && (
                        <>
                            <span>·</span>
                            <span>Peak on {stats.peakLabel}</span>
                        </>
                    )}
                </div>

                <Heart size={16} className="text-[#FFB6C1] fill-[#FFB6C1]" />
            </div>
        </Card>
    );
};
