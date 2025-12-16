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
    'w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ease-out';
  const itemActive = 'bg-slate-900 text-white shadow-lg shadow-slate-900/20';
  const itemInactive =
    'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700 active:scale-95 shadow-subtle';

  return (
    <nav
      className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
      aria-label="底部导航"
    >
      <div className="pointer-events-auto flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full px-3 py-2 shadow-elevation">
        <Link
          to="/"
          aria-label={t.dashboard}
          aria-current={active === 'dashboard' ? 'page' : undefined}
          className={`${itemBase} ${active === 'dashboard' ? itemActive : itemInactive}`}
        >
          <Home className="w-5 h-5" aria-hidden="true" />
          <span className="sr-only">{t.dashboard}</span>
        </Link>

        <Link
          to="/log"
          aria-label={t.newLog}
          aria-current={active === 'log' ? 'page' : undefined}
          className="relative w-14 h-14 bg-slate-900 rounded-full shadow-lg shadow-slate-900/20 flex items-center justify-center text-white transition-all duration-200 ease-out active:scale-95"
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

