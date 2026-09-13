'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, setToken, clearToken } from './api';
import { AdminUser } from './types';

interface AuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: AdminUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // نحاول استرجاع بيانات الأدمن من localStorage (خُزنت وقت الدخول) بدون طلب API إضافي
    const raw = localStorage.getItem('velora_admin_info');
    if (raw) {
      try {
        setAdmin(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const data = await apiRequest<LoginResponse>('/admin/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    setToken(data.accessToken);
    localStorage.setItem('velora_admin_info', JSON.stringify(data.admin));
    setAdmin(data.admin);
    router.push('/');
  }

  function logout() {
    clearToken();
    localStorage.removeItem('velora_admin_info');
    setAdmin(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
