import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, History } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type NavKey = 'dashboard' | 'log' | 'history';

export function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();

  const active: NavKey = location.pathname.startsWith('/history')
    ? 'history'
    : location.pathname.startsWith('/log')
      ? 'log'
      : 'dashboard';

  const itemBase =
    'w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ease-out';
  const itemActive = 'bg-slate-900 text-white shadow-lg shadow-slate-900/25';
  const itemInactive =
    'bg-white/60 text-slate-500 border border-white/50 hover:bg-white/80 hover:text-slate-700 active:scale-95';

  return (
    <nav
      className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
      aria-label="底部导航"
    >
      {/* Liquid Glass Container */}
      <div
        className="pointer-events-auto flex items-center gap-3 px-3 py-2 rounded-full"
        style={{
          // Higher transparency glass effect
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.04),
            0 2px 8px rgba(0,0,0,0.02),
            inset 0 1px 1px rgba(255,255,255,0.3)
          `,
        }}
      >
        <Link
          to="/"
          aria-label={t.dashboard}
          aria-current={active === 'dashboard' ? 'page' : undefined}
          className={`${itemBase} ${active === 'dashboard' ? itemActive : itemInactive}`}
        >
          <Home className="w-5 h-5" aria-hidden="true" />
          <span className="sr-only">{t.dashboard}</span>
        </Link>

        {/* Center button with enhanced style */}
        <Link
          to="/log"
          aria-label={t.newLog}
          aria-current={active === 'log' ? 'page' : undefined}
          className="relative w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white transition-all duration-300 ease-out active:scale-95"
          style={{
            boxShadow: '0 4px 20px rgba(15,23,42,0.3), 0 2px 8px rgba(15,23,42,0.2)',
          }}
        >
          <Plus className="w-6 h-6" aria-hidden="true" />
          <span className="sr-only">{t.newLog}</span>
        </Link>

        <Link
          to="/history"
          aria-label={t.history}
          aria-current={active === 'history' ? 'page' : undefined}
          className={`${itemBase} ${active === 'history' ? itemActive : itemInactive}`}
        >
          <History className="w-5 h-5" aria-hidden="true" />
          <span className="sr-only">{t.history}</span>
        </Link>
      </div>
    </nav>
  );
}
