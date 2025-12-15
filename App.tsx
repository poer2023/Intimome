import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { SessionLog, AnalysisResponse } from './shared/types';
import { generateInsights } from './services/geminiService';
import { fetchLogs, saveLog, deleteLog, fetchCountdownTarget, saveCountdownTarget } from './services/logsService';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BottomNav } from './components/BottomNav';

// Page imports
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { LogPage } from './pages/LogPage';
import { AuthPage } from './pages/AuthPage';

type NavTarget = 'dashboard' | 'log' | 'history';

const RequireAuth = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
};

const RedirectIfAuth = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const AppShell = () => {
  const { t, language } = useLanguage();
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
      setTargetDate(null);
      return;
    }
    setLoadingLogs(true);
    Promise.all([
      fetchLogs(1, 31),
      fetchCountdownTarget()
    ])
      .then(([logsResponse, countdownData]) => {
        setLogs(logsResponse.logs);
        setTargetDate(countdownData);
      })
      .catch(e => console.error('Failed to load data', e))
      .finally(() => setLoadingLogs(false));
  }, [user]);

  const handleSetTargetDate = async (date: string | null) => {
    setTargetDate(date);
    if (user) {
      await saveCountdownTarget(date);
    }
  };

  const handleSaveLog = async (newLog: SessionLog) => {
    if (!user) return;
    const success = await saveLog(newLog);
    if (success) {
      setLogs([newLog, ...logs]);
    }
    navigate('/');
  };

  const handleDeleteLog = async (logId: string): Promise<boolean> => {
    if (!user) return false;
    const success = await deleteLog(logId);
    if (success) {
      setLogs(logs.filter(log => log.id !== logId));
    }
    return success;
  };

  const handleGenerateInsight = async () => {
    if (logs.length < 3) {
      alert(language === 'zh' ? "请至少记录3次活动后再生成分析。" : "Please log at least 3 sessions to generate insights.");
      return;
    }
    setLoadingInsight(true);
    const result = await generateInsights(language);
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
          {/* Auth routes - redirect away if already logged in */}
          <Route element={<RedirectIfAuth />}>
            <Route path="/auth/login" element={<AuthPage mode="login" />} />
            <Route path="/auth/register" element={<AuthPage mode="register" />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route
              path="/"
              element={
                <DashboardPage
                  logs={logs}
                  getFavoritePosition={getFavoritePosition}
                  handleGenerateInsight={handleGenerateInsight}
                  loadingInsight={loadingInsight}
                  insight={insight}
                  targetDate={targetDate}
                  setTargetDate={handleSetTargetDate}
                  user={user}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="/log"
              element={<LogPage onSave={handleSaveLog} onCancel={() => navigate('/')} />}
            />
            <Route
              path="/history"
              element={<HistoryPage onCreateFirst={() => navigate('/log')} onDeleteLog={handleDeleteLog} />}
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
