'use client';

import { create } from 'zustand';
import type { User } from '@/types';
import { setCookie, removeCookie } from '@/lib/cookies';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setToken: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken:
    typeof window !== 'undefined'
      ? window.localStorage.getItem('itmagnet_access_token')
      : null,
  refreshToken:
    typeof window !== 'undefined'
      ? window.localStorage.getItem('itmagnet_refresh_token')
      : null,
  loading: false,
  isAuthenticated:
    typeof window !== 'undefined'
      ? !!window.localStorage.getItem('itmagnet_access_token')
      : false,

  // ✅ FIXED USER SETTER
  setUser: (user) => {
    if (!user) {
      set({ user: null });
      return;
    }

    const normalizedUser: User = {
      id: (user as any)._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };

    console.log("✅ STORED USER:", normalizedUser);

    set({ user: normalizedUser });
  },

  // ✅ TOKEN SETTER
  setToken: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      if (accessToken) {
        window.localStorage.setItem('itmagnet_access_token', accessToken);
        setCookie('itmagnet_access_token', accessToken, 7);
      }

      if (refreshToken) {
        window.localStorage.setItem('itmagnet_refresh_token', refreshToken);
        setCookie('itmagnet_refresh_token', refreshToken, 30);
      }
    }

    set({
      accessToken,
      refreshToken: refreshToken || null,
      isAuthenticated: !!accessToken,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('itmagnet_access_token');
      window.localStorage.removeItem('itmagnet_refresh_token');
      removeCookie('itmagnet_access_token');
      removeCookie('itmagnet_refresh_token');
    }

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));