import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthUser = { username: string; displayName?: string; email?: string; provider?: 'local' | 'google' };

type AuthContextValue = {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
};
// Use relative path for Cloudflare Pages Functions (production)
// or VITE_API_BASE for local development with Express
const API_BASE = import.meta.env.VITE_API_BASE || '';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
      .then(async res => {
        if (!res.ok) return null;
        const ct = res.headers.get('Content-Type') || '';
        if (!ct.includes('application/json')) return null;
        return res.json();
      })
      .then(data => {
        if (data?.success && data.user?.username) {
          setUser(data.user as AuthUser);
        }
      })
      .catch(e => console.error('Failed to load session user', e));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data?.message || '用户名或密码错误' };
    }
    const authUser = {
      username: data.user.username,
      displayName: data.user.displayName || data.user.username,
      email: data.user.email,
      provider: data.user.provider
    } as AuthUser;
    setUser(authUser);
    return { success: true };
  };

  const register = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data?.message || '注册失败' };
    }
    const authUser = {
      username: data.user.username,
      displayName: data.user.displayName || data.user.username,
      email: data.user.email,
      provider: data.user.provider
    } as AuthUser;
    setUser(authUser);
    return { success: true };
  };

  const loginWithGoogle = async (credential: string) => {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data?.message || 'Google 登录失败' };
    }
    const authUser = {
      username: data.user.username,
      displayName: data.user.displayName || data.user.username,
      email: data.user.email,
      provider: 'google'
    } as AuthUser;
    setUser(authUser);
    return { success: true };
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout request failed', e);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
