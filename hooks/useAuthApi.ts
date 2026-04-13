'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from './useAuthStore';
import { getErrorMessage, logError } from '@/lib/error-handler';
import type { AuthPayload, User } from '@/types';

/**
 * Hook for managing authentication flow
 * Handles login, registration, logout, and token refresh
 */
export const useAuthentication = () => {
  const router = useRouter();
  const authStore = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (payload: AuthPayload) => authApi.login(payload),
    onSuccess: (data) => {
      authStore.setUser(data.user);
      authStore.setToken(data.accessToken, data.refreshToken);
      router.push('/dashboard');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      logError(error, { endpoint: '/auth/login', method: 'POST' });
      throw new Error(message);
    },
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: (payload: AuthPayload) => authApi.register(payload),
    onSuccess: (data) => {
      authStore.setUser(data.user);
      authStore.setToken(data.accessToken, data.refreshToken);
      router.push('/dashboard');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      logError(error, { endpoint: '/auth/register', method: 'POST' });
      throw new Error(message);
    },
  });

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authStore.logout();
      router.push('/auth/login');
    }
  }, [authStore, router]);

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: () => {
      const refreshToken = authStore.refreshToken;
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      return authApi.refreshToken(refreshToken);
    },
    onSuccess: (data) => {
      authStore.setToken(data.accessToken, data.refreshToken);
    },
    onError: () => {
      authStore.logout();
      router.push('/auth/login');
    },
  });

  return {
    // State
    user: authStore.user,
    accessToken: authStore.accessToken,
    isAuthenticated: authStore.isAuthenticated,
    loading: authStore.loading,

    // Mutations
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    refreshToken: refreshTokenMutation.mutate,

    // Status
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isRefreshingToken: refreshTokenMutation.isPending,
    
    // Errors
    loginError: loginMutation.error ? getErrorMessage(loginMutation.error) : null,
    registerError: registerMutation.error ? getErrorMessage(registerMutation.error) : null,
  };
};

/**
 * Hook for fetching current user data
 * Uses React Query with automatic refetching
 */
export const useCurrentUser = (options?: any) => {
  const { accessToken } = useAuthStore();

  return useQuery<User, Error>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const user = await authApi.me();
      return user;
    },
    enabled: !!accessToken,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: 'stale',
    ...options,
  });
};

/**
 * Hook for verifying token validity
 */
export const useVerifyToken = () => {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: async () => {
      return authApi.verifyToken();
    },
    enabled: !!authStore.accessToken,
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook for automatically refreshing token before expiry
 */
export const useAutoRefreshToken = () => {
  const { accessToken, refreshToken } = useAuthStore();
  const authStore = useAuthStore();
  const refreshTokenMutation = useMutation({
    mutationFn: () => {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      return authApi.refreshToken(refreshToken);
    },
    onSuccess: (data) => {
      authStore.setToken(data.accessToken, data.refreshToken);
    },
    onError: () => {
      authStore.logout();
    },
  });

  // Set up periodic token refresh (every 5 minutes)
  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(() => {
      refreshTokenMutation.mutate();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [accessToken, refreshTokenMutation]);

  return refreshTokenMutation;
};
