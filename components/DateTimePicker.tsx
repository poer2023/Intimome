import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DateTimePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (date: Date) => void;
    onClear?: () => void;
    initialDate?: Date;
    title?: string;
}

// Optimized scroll wheel - auto selects item in viewport on scroll stop
const ScrollWheel: React.FC<{
    items: number[];
    selectedValue: number;
    onSelect: (value: number) => void;
    formatValue?: (value: number) => string;
}> = ({ items, selectedValue, onSelect, formatValue = (v) => v.toString().padStart(2, '0') }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemHeight = 48; // Larger for better touch targets
    const scrollTimeoutRef = useRef<number | null>(null);
    const isMountedRef = useRef(false);

    // Scroll to selected value on mount
    useEffect(() => {
        if (containerRef.current) {
            const index = items.indexOf(selectedValue);
            if (index >= 0) {
                // Use instant scroll on mount, smooth scroll after
                containerRef.current.scrollTo({
                    top: index * itemHeight,
                    behavior: isMountedRef.current ? 'smooth' : 'instant'
                });
            }
            isMountedRef.current = true;
        }
    }, [selectedValue, items, itemHeight]);

    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        // Clear any existing timeout
        if (scrollTimeoutRef.current) {
            window.clearTimeout(scrollTimeoutRef.current);
        }

        // Wait for scroll to stop (150ms debounce)
        scrollTimeoutRef.current = window.setTimeout(() => {
            if (!containerRef.current) return;

            const scrollTop = containerRef.current.scrollTop;
            const index = Math.round(scrollTop / itemHeight);
            const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
            const targetValue = items[clampedIndex];

            // Snap scroll to center the item
            containerRef.current.scrollTo({
                top: clampedIndex * itemHeight,
                behavior: 'smooth'
            });

            // Auto-select the item in viewport
            if (targetValue !== selectedValue) {
                onSelect(targetValue);
            }
        }, 150);
    }, [items, itemHeight, onSelect, selectedValue]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                window.clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="h-[144px] w-20 overflow-y-auto snap-y snap-mandatory no-scrollbar relative"
            style={{ scrollSnapType: 'y mandatory' }}
        >
            {/* Top padding for centering (height = container height / 2 - itemHeight / 2) */}
            <div style={{ height: itemHeight }} />

            {items.map((item) => {
                const isSelected = item === selectedValue;
                return (
                    <div
                        key={item}
                        className={`h-12 flex items-center justify-center snap-center transition-all duration-150 ${isSelected
                                ? 'text-3xl font-bold text-slate-900'
                                : 'text-lg text-slate-300'
                            }`}
                        style={{ scrollSnapAlign: 'center' }}
                    >
                        {formatValue(item)}
                    </div>
                );
            })}

            {/* Bottom padding for centering */}
            <div style={{ height: itemHeight }} />
        </div>
    );
};

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    onClear,
    initialDate,
    title
}) => {
    const { language } = useLanguage();
    const [currentDate, setCurrentDate] = useState(initialDate || new Date());
    const [viewMonth, setViewMonth] = useState(new Date(currentDate));

    useEffect(() => {
        if (isOpen) {
            const d = initialDate || new Date();
            setCurrentDate(d);
            setViewMonth(d);
        }
    }, [isOpen, initialDate]);

    if (!isOpen) return null;

    // Calendar Logic
    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
    };

    const getDaysArray = () => {
        const totalDays = daysInMonth(viewMonth);
        const startDay = firstDayOfMonth(viewMonth);
        const days = [];
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= totalDays; i++) days.push(i);
        return days;
    };

    // Time arrays
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const updateTime = (type: 'hour' | 'minute', val: number) => {
        const newDate = new Date(currentDate);
        if (type === 'hour') newDate.setHours(val);
        else newDate.setMinutes(val);
        setCurrentDate(newDate);
    };

    // i18n day names
    const dayNames = language === 'zh'
        ? ['日', '一', '二', '三', '四', '五', '六']
        : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const displayTitle = title || (language === 'zh' ? '选择日期' : 'Select Date');

    // Handle confirm - apply date+time and close
    const handleConfirm = () => {
        onConfirm(currentDate);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16 animate-fade-in">
            <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{displayTitle}</h3>
                        <div className="text-xl font-bold text-slate-900 font-serif">
                            {currentDate.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-lg font-bold text-brand-500 font-mono mt-0.5">
                            {currentDate.toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Calendar */}
                    <div className="p-5 pb-2">
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                                <ChevronLeft size={20} />
                            </button>
                            <h4 className="text-base font-bold text-slate-800">
                                {viewMonth.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', year: 'numeric' })}
                            </h4>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 mb-2">
                            {dayNames.map(d => (
                                <div key={d} className="text-center text-xs font-bold text-slate-300 mb-2">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-1">
                            {getDaysArray().map((day, i) => {
                                if (day === null) return <div key={`empty-${i}`} />;
                                const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
                                const isSelected = date.getDate() === currentDate.getDate() &&
                                    date.getMonth() === currentDate.getMonth() &&
                                    date.getFullYear() === currentDate.getFullYear();
                                const isToday = new Date().toDateString() === date.toDateString();

                                return (
                                    <button
                                        key={day}
                                        onClick={() => {
                                            const newDate = new Date(currentDate);
                                            newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                                            setCurrentDate(newDate);
                                        }}
                                        className={`h-9 w-9 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all
                      ${isSelected ? 'bg-brand-500 text-white shadow-lg shadow-brand-200' :
                                                isToday ? 'bg-slate-100 text-brand-600 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 mx-5 my-2" />

                    {/* Time Picker - Auto-select on scroll */}
                    <div className="px-5 py-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                            {language === 'zh' ? '时间' : 'TIME'}
                        </h4>
                        <div className="flex items-center justify-center h-[144px] relative gap-3">
                            {/* Selection highlight bar */}
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-12 bg-slate-50 rounded-xl border border-slate-100 pointer-events-none z-0" />

                            {/* Hour Column */}
                            <div className="relative z-10">
                                <ScrollWheel
                                    items={hours}
                                    selectedValue={currentDate.getHours()}
                                    onSelect={(val) => updateTime('hour', val)}
                                />
                            </div>

                            <span className="text-slate-300 font-bold text-3xl z-10">:</span>

                            {/* Minute Column */}
                            <div className="relative z-10">
                                <ScrollWheel
                                    items={minutes}
                                    selectedValue={currentDate.getMinutes()}
                                    onSelect={(val) => updateTime('minute', val)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 pt-2 bg-white flex gap-3 border-t border-slate-50">
                    {onClear && (
                        <button
                            onClick={() => { onClear(); onClose(); }}
                            className="py-3 px-4 bg-slate-50 text-slate-400 rounded-xl font-semibold hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                            {language === 'zh' ? '清除' : 'Clear'}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            const now = new Date();
                            setCurrentDate(now);
                            setViewMonth(now);
                        }}
                        className={`flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 transition-colors ${onClear ? '' : 'flex-1'}`}
                    >
                        {language === 'zh' ? '今天' : 'Today'}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-[2] py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 active:scale-95"
                    >
                        {language === 'zh' ? '确认' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};
