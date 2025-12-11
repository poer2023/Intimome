import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthUser = { username: string };

type AuthContextValue = {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
};

const CURRENT_USER_KEY = 'intimome_current_user_v1';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        if (parsed?.username) setUser(parsed);
      }
    } catch (e) {
      console.error('Failed to load current user', e);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data?.message || '用户名或密码错误' };
    }
    const authUser = { username: data.user.username };
    setUser(authUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
    return { success: true };
  };

  const register = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data?.message || '注册失败' };
    }
    const authUser = { username: data.user.username };
    setUser(authUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
