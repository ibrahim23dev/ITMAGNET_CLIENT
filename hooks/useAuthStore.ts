'use client';

import { create } from 'zustand';
import type { User } from '@/types';
import { setCookie, removeCookie } from '@/lib/cookies';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: typeof window !== 'undefined' ? window.localStorage.getItem('itmagnet_access_token') : null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        window.localStorage.setItem('itmagnet_access_token', token);
        setCookie('itmagnet_access_token', token, 1); // 1 day expiry
      } else {
        window.localStorage.removeItem('itmagnet_access_token');
        removeCookie('itmagnet_access_token');
      }
    }
    set({ accessToken: token });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('itmagnet_access_token');
    }
    set({ user: null, accessToken: null });
  },
}));
