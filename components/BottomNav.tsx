import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, History, Plus } from 'lucide-react';

export const BottomNav = () => {
    const location = useLocation();

    const activeNav = (path: string) => {
        if (path.startsWith('/history')) return 'history';
        if (path.startsWith('/log')) return 'log';
        return 'dashboard';
    };

    const current = activeNav(location.pathname);

    return (
        <nav
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-slide-up"
            role="navigation"
            aria-label="主导航"
        >
            <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xl p-1.5 rounded-full shadow-elevation ring-1 ring-slate-900/5">
                {/* Dashboard Tab */}
                <Link
                    to="/"
                    className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${current === 'dashboard'
                        ? 'text-brand-600 bg-brand-50'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                    aria-label="仪表盘"
                    aria-current={current === 'dashboard' ? 'page' : undefined}
                >
                    <Activity className="w-5 h-5" aria-hidden="true" />
                </Link>

                {/* FAB (Floating Action Button) */}
                <Link
                    to={current === 'log' ? "/" : "/log"}
                    className="relative w-14 h-14 bg-slate-900 rounded-full shadow-lg shadow-slate-900/20 flex items-center justify-center text-white hover:scale-105 transition-all duration-300 mx-1 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    aria-label={current === 'log' ? '关闭新记录' : '添加新记录'}
                >
                    <Plus
                        className={`w-6 h-6 transition-transform duration-300 ${current === 'log' ? 'rotate-45' : 'group-hover:rotate-90'}`}
                        aria-hidden="true"
                    />
                    {/* Ambient Breathe Animation */}
                    <div className="absolute inset-0 rounded-full bg-slate-900 opacity-20 animate-breathe -z-10" aria-hidden="true"></div>
                </Link>

                {/* History Tab */}
                <Link
                    to="/history"
                    className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${current === 'history'
                        ? 'text-brand-600 bg-brand-50'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                    aria-label="历史记录"
                    aria-current={current === 'history' ? 'page' : undefined}
                >
                    <History className="w-5 h-5" aria-hidden="true" />
                </Link>
            </div>
        </nav>
    );
};
