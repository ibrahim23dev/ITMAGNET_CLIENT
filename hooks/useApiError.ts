'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './useAuthStore';
import {
  parseError,
  getErrorMessage,
  isAuthError,
  isRetryableError,
  extractValidationErrors,
  logError,
} from '@/lib/error-handler';

interface ApiErrorOptions {
  onAuthError?: () => void;
  onNetworkError?: () => void;
  onValidationError?: (errors: Record<string, string>) => void;
  onError?: (message: string, error: any) => void;
  showNotification?: (message: string, type: 'error' | 'warning') => void;
}

/**
 * Hook for handling API errors consistently across the app
 */
export const useApiError = (options?: ApiErrorOptions) => {
  const router = useRouter();
  const authStore = useAuthStore();

  const handleError = useCallback(
    (error: any, context?: { endpoint?: string; method?: string }) => {
      const errorDetails = parseError(error);
      const message = getErrorMessage(error);

      // Log for debugging
      logError(error, { ...context, timestamp: new Date().toISOString() });

      // Handle authentication errors
      if (isAuthError(error)) {
        authStore.logout();
        router.push('/auth/login?reason=session_expired');
        options?.onAuthError?.();
        options?.showNotification?.(
          'Your session has expired. Please log in again.',
          'error'
        );
        return;
      }

      // Handle network errors
      if (!errorDetails.status) {
        options?.onNetworkError?.();
        options?.showNotification?.(
          'Network error. Please check your connection.',
          'warning'
        );
        return;
      }

      // Handle validation errors
      if (errorDetails.status === 400) {
        const fieldErrors = extractValidationErrors(error);
        options?.onValidationError?.(fieldErrors);
        options?.showNotification?.(message, 'error');
        return;
      }

      // Handle retryable errors
      if (isRetryableError(error)) {
        options?.showNotification?.(
          'Temporary issue. Please try again.',
          'warning'
        );
        return;
      }

      // Handle all other errors
      options?.showNotification?.(message, 'error');
      options?.onError?.(message, error);
    },
    [authStore, router, options]
  );

  return { handleError };
};
