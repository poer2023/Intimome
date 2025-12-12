import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateTimePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (date: Date) => void;
    onClear?: () => void;
    initialDate?: Date;
    title?: string;
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    onClear,
    initialDate,
    title = "Selected Date"
}) => {
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

    // Time Logic
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const updateTime = (type: 'hour' | 'minute', val: number) => {
        const newDate = new Date(currentDate);
        if (type === 'hour') newDate.setHours(val);
        else newDate.setMinutes(val);
        setCurrentDate(newDate);
    };

    // Scroll logic for time picker could be complex to get "wheel" feel, 
    // for now implementing as direct selection lists with active highlighting
    // Attempting to simulate scroll wheel with centered active item

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-20 animate-fade-in">
            <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
                        <div className="text-xl font-bold text-slate-900 font-serif">
                            {currentDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-lg font-bold text-brand-500 font-mono mt-0.5">
                            {currentDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Calendar */}
                    <div className="p-6 pb-2">
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                                <ChevronLeft size={20} />
                            </button>
                            <h4 className="text-base font-bold text-slate-800">
                                {viewMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </h4>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className="text-center text-xs font-bold text-slate-300 mb-2">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-2">
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

                    <div className="h-px bg-slate-100 mx-6 my-2" />

                    {/* Time Picker - Scroll Wheel Simulation */}
                    <div className="px-6 py-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">TIME</h4>
                        <div className="flex items-center justify-center h-32 relative gap-4">
                            {/* Hour Column */}
                            <div className="h-full w-20 overflow-y-auto snap-y snap-mandatory no-scrollbar text-center py-[48px]"
                                onScroll={(e) => {
                                    const el = e.currentTarget;
                                    const itemHeight = 32;
                                    const index = Math.round(el.scrollTop / itemHeight);
                                    // This is simplified; ideally we'd use IoO or click to select
                                }}>
                                {hours.map(h => (
                                    <button
                                        key={h}
                                        onClick={() => updateTime('hour', h)}
                                        className={`h-8 w-full flex items-center justify-center snap-center transition-all ${currentDate.getHours() === h
                                            ? 'text-xl font-bold text-slate-800 scale-110'
                                            : 'text-sm text-slate-300'
                                            }`}
                                    >
                                        {h.toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>

                            <span className="text-slate-300 font-bold mb-1">:</span>

                            {/* Minute Column */}
                            <div className="h-full w-20 overflow-y-auto snap-y snap-mandatory no-scrollbar text-center py-[48px]">
                                {minutes.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => updateTime('minute', m)}
                                        className={`h-8 w-full flex items-center justify-center snap-center transition-all ${currentDate.getMinutes() === m
                                            ? 'text-xl font-bold text-slate-800 scale-110'
                                            : 'text-sm text-slate-300'
                                            }`}
                                    >
                                        {m.toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>

                            {/* Highlight Overlay (Visual helper) */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="h-8 w-48 bg-slate-50/50 rounded-lg -z-10 mix-blend-multiply border border-slate-100/50"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-2 bg-white flex gap-3">
                    {onClear && (
                        <button
                            onClick={() => { onClear(); onClose(); }}
                            className="py-3 px-4 bg-slate-50 text-slate-400 rounded-xl font-semibold hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                            Clear
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
                        Today
                    </button>
                    <button
                        onClick={() => onConfirm(currentDate)}
                        className="flex-[2] py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 active:scale-95"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
