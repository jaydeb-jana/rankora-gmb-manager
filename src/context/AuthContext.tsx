import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerUser } from '../types';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: CustomerUser | null;
  token: string | null;
  isLoading: boolean;
  impersonatorAdmin: CustomerUser | null;
  login: (token: string, user: CustomerUser) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  impersonateUser: (targetUser: CustomerUser) => Promise<void>;
  stopImpersonation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [impersonatorAdmin, setImpersonatorAdmin] = useState<CustomerUser | null>(() => {
    return api.getImpersonatorAdmin();
  });
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('rankora_token') || localStorage.getItem('reputepulse_token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setImpersonatorAdmin(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      if (data.user) {
        setUser(data.user);
        setImpersonatorAdmin(api.getImpersonatorAdmin());
      } else {
        localStorage.removeItem('rankora_token');
        localStorage.removeItem('reputepulse_token');
        setToken(null);
        setUser(null);
        setImpersonatorAdmin(null);
      }
    } catch {
      localStorage.removeItem('rankora_token');
      localStorage.removeItem('reputepulse_token');
      setToken(null);
      setUser(null);
      setImpersonatorAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Listen for Supabase email confirmation link or session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('rankora_token');
        localStorage.removeItem('reputepulse_token');
        localStorage.removeItem('rankora_impersonator_admin');
        localStorage.removeItem('rankora_current_user');
        setToken(null);
        setUser(null);
        setImpersonatorAdmin(null);
        return;
      }

      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        const u = session.user;
        const appUser: CustomerUser = {
          id: u.id,
          email: u.email || '',
          fullName: (u.user_metadata?.full_name || u.user_metadata?.name || 'Business Owner'),
          mobileNumber: u.user_metadata?.mobile_number || '',
          businessName: u.user_metadata?.business_name || 'My Google Business',
          isVerified: true,
          createdAt: u.created_at,
        };
        const tok = session.access_token || ('sb_token_' + btoa(JSON.stringify({ userId: u.id, email: u.email })));
        login(tok, appUser);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (newToken: string, newUser: CustomerUser) => {
    localStorage.setItem('rankora_token', newToken);
    localStorage.removeItem('reputepulse_token');
    setToken(newToken);
    setUser(newUser);
    setImpersonatorAdmin(null);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn('Logout note:', e);
    }
    localStorage.removeItem('rankora_token');
    localStorage.removeItem('reputepulse_token');
    localStorage.removeItem('rankora_impersonator_admin');
    localStorage.removeItem('rankora_current_user');

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth-token') || key.startsWith('supabase.auth'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}

    setToken(null);
    setUser(null);
    setImpersonatorAdmin(null);
  };

  const impersonateUser = async (targetUser: CustomerUser) => {
    const res = await api.impersonateUser(targetUser.id);
    if (res.success && res.user) {
      const newToken =
        localStorage.getItem('rankora_token') ||
        'sb_impersonated_' + btoa(JSON.stringify({ userId: res.user.id, email: res.user.email }));
      localStorage.setItem('rankora_token', newToken);
      localStorage.removeItem('reputepulse_token');
      setToken(newToken);
      setUser(res.user);
      setImpersonatorAdmin(
        api.getImpersonatorAdmin() || {
          id: 'admin_arventa_super',
          email: 'info@arventaventures.online',
          fullName: 'Arventa Admin',
          mobileNumber: '+91 7872490719',
          role: 'admin',
          isVerified: true,
          status: 'active',
          createdAt: new Date().toISOString(),
        }
      );
    } else {
      throw new Error(res.error || 'Failed to switch into customer account.');
    }
  };

  const stopImpersonation = async () => {
    const res = await api.stopImpersonating();
    if (res.success && res.adminUser) {
      setUser(res.adminUser);
      setImpersonatorAdmin(null);
      const newToken = localStorage.getItem('rankora_token');
      if (newToken) setToken(newToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        impersonatorAdmin,
        login,
        logout,
        refreshUser,
        impersonateUser,
        stopImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
