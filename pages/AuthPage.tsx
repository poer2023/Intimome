import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { GoogleSVG } from '../components/SharedComponents';

let gsiLoadPromise: Promise<void> | null = null;

function loadGoogleIdentityServices(): Promise<void> {
    const w = window as any;
    if (w.google?.accounts?.id) return Promise.resolve();

    if (gsiLoadPromise) return gsiLoadPromise;

    gsiLoadPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>('script[data-google-gsi="true"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.googleGsi = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(script);
    });

    return gsiLoadPromise;
}

interface AuthPageProps {
    mode: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
    const { t } = useLanguage();
    const { login, register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const from = (location.state as { from?: string } | undefined)?.from || '/';
    const [googleReady, setGoogleReady] = useState(false);
    const googleBtnRef = useRef<HTMLDivElement | null>(null);
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

    useEffect(() => {
        if (!googleClientId) return;
        let cancelled = false;
        setGoogleReady(false);

        loadGoogleIdentityServices()
            .then(() => {
                if (cancelled) return;

                const w = window as any;
                if (!w.google?.accounts?.id || !googleBtnRef.current) return;

                w.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: async (resp: { credential?: string }) => {
                        if (!resp.credential) {
                            setMessage('Google 登录失败');
                            return;
                        }
                        const result = await loginWithGoogle(resp.credential);
                        if (!result.success) {
                            setMessage(result.message || 'Google 登录失败');
                            return;
                        }
                        setMessage(null);
                        navigate(from, { replace: true });
                    },
                    ux_mode: 'popup',
                });

                w.google.accounts.id.renderButton(googleBtnRef.current, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'continue_with',
                    width: 400,
                });

                setGoogleReady(true);
            })
            .catch(() => {
                if (cancelled) return;
                setMessage('Google 登录加载失败');
            });

        return () => {
            cancelled = true;
        };
    }, [googleClientId, loginWithGoogle, navigate, from]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const action = mode === 'login' ? login : register;
        const result = await action(username.trim(), password);
        if (!result.success) {
            setMessage(result.message || '操作失败');
            return;
        }
        setMessage(null);
        navigate(from, { replace: true });
    };

    return (
        <div className="space-y-6 animate-fade-in pt-4 px-1 pb-40 max-w-lg mx-auto">
            <div className="py-4 px-1">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">IntimDiary.</h1>
            </div>
            <div className="bg-white rounded-[24px] p-8 shadow-subtle border border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    {mode === 'login' ? '登录' : '注册'}
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                    仅支持用户名和密码，暂无邮箱验证。
                </p>

                {googleClientId && (
                    <div className="mb-6">
                        <div className="w-full min-h-[48px] flex justify-center items-center">
                            <div className="relative w-full max-w-[400px] h-[48px] group">
                                <div
                                    ref={googleBtnRef}
                                    aria-hidden="true"
                                    className={`absolute inset-0 z-20 flex justify-center items-center opacity-0 ${!googleReady ? 'pointer-events-none' : ''} [&>div]:w-full [&>div>div]:w-full [&>div>div>div]:justify-center`}
                                />
                                <div className="absolute inset-0 z-10 pointer-events-none w-full h-full bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-3 shadow-sm transition-colors group-hover:bg-slate-50">
                                    <GoogleSVG />
                                    <span className="text-sm font-bold text-slate-700">{t.continueWithGoogle}</span>
                                    {!googleReady && <span className="text-xs text-slate-400">{t.loadingGoogleBtn}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 my-6">
                            <div className="h-px bg-slate-100 flex-1"></div>
                            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t.or}</div>
                            <div className="h-px bg-slate-100 flex-1"></div>
                        </div>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.username}</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:bg-white focus:border-brand-500 outline-none transition-all"
                            placeholder={t.enterUsername}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.password}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:bg-white focus:border-brand-500 outline-none transition-all"
                            placeholder={t.atLeast6Chars}
                            minLength={6}
                            required
                        />
                    </div>
                    {message && <div className="text-sm text-brand-500 font-medium">{message}</div>}
                    <button
                        type="submit"
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]"
                    >
                        {mode === 'login' ? t.loginTitle : t.registerTitle}
                    </button>
                </form>
                <div className="mt-6 text-sm text-slate-500 text-center">
                    {mode === 'login' ? (
                        <>
                            {t.noAccountYet}{' '}
                            <Link to="/auth/register" className="text-brand-600 font-semibold hover:text-brand-700">
                                {t.goRegister}
                            </Link>
                        </>
                    ) : (
                        <>
                            {t.alreadyHaveAccount}{' '}
                            <Link to="/auth/login" className="text-brand-600 font-semibold hover:text-brand-700">
                                {t.goLogin}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
