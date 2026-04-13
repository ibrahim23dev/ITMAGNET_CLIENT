/**
 * Error handling utilities for API and general errors
 */

import { ApiError } from './api-service';

export interface ErrorDetails {
  status?: number;
  message: string;
  requestId?: string;
  timestamp?: string;
  details?: any;
}

/**
 * Parse different error types into a consistent format
 */
export function parseError(error: any): ErrorDetails {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      message: error.message,
      requestId: error.requestId,
      timestamp: new Date().toISOString(),
      details: error.data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    details: error,
  };
}

/**
 * Get user-friendly error messages
 */
export function getErrorMessage(error: any): string {
  const parsed = parseError(error);

  // Map specific status codes to user-friendly messages
  const statusMessages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Your session has expired. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This action conflicts with existing data. Please try again.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable. Please try again later.',
    503: 'Service is under maintenance. Please try again later.',
  };

  if (parsed.status && statusMessages[parsed.status]) {
    return statusMessages[parsed.status];
  }

  return parsed.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const parsed = parseError(error);

  // Retryable status codes
  const retryableStatuses = [408, 429, 500, 502, 503, 504];

  if (parsed.status && retryableStatuses.includes(parsed.status)) {
    return true;
  }

  // Network errors are usually retryable
  if (!parsed.status && parsed.message) {
    const networkErrors = ['Network', 'ECONNREFUSED', 'ETIMEDOUT', 'ERR_NETWORK'];
    return networkErrors.some((err) => parsed.message.includes(err));
  }

  return false;
}

/**
 * Check if error is due to authentication
 */
export function isAuthError(error: any): boolean {
  const parsed = parseError(error);
  return parsed.status === 401 || parsed.status === 403;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  const parsed = parseError(error);
  return parsed.status === 400 || (parsed.details?.errors !== undefined);
}

/**
 * Extract validation errors into a field-based map
 */
export function extractValidationErrors(
  error: any
): Record<string, string> {
  const parsed = parseError(error);
  const fieldErrors: Record<string, string> = {};

  if (parsed.details?.errors) {
    if (Array.isArray(parsed.details.errors)) {
      parsed.details.errors.forEach((err: any) => {
        if (err.field) {
          fieldErrors[err.field] = err.message;
        }
      });
    } else if (typeof parsed.details.errors === 'object') {
      Object.assign(fieldErrors, parsed.details.errors);
    }
  }

  return fieldErrors;
}

/**
 * Log error for debugging (in development) or external service (in production)
 */
export function logError(
  error: any,
  context?: {
    endpoint?: string;
    method?: string;
    requestId?: string;
    userId?: string;
    timestamp?: string;
  }
): void {
  const parsed = parseError(error);

  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Log]', {
      ...parsed,
      context,
    });
  }

  // Send to external error tracking service in production
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // You would integrate with Sentry or similar here
    // Sentry.captureException(error, { contexts: { api: context } });
  }
}

/**
 * Create a safe async wrapper for catch blocks
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  defaultValue?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    logError(error);
    return defaultValue;
  }
}

/**
 * Create a request error handler with recovery options
 */
export function createErrorHandler(options?: {
  onAuthError?: () => void;
  onNetworkError?: () => void;
  onValidationError?: (errors: Record<string, string>) => void;
  onRetryableError?: () => void;
  onFatalError?: (error: ErrorDetails) => void;
}) {
  return (error: any) => {
    const errorDetails = parseError(error);

    if (isAuthError(error)) {
      options?.onAuthError?.();
    } else if (!errorDetails.status) {
      options?.onNetworkError?.();
    } else if (isValidationError(error)) {
      const fieldErrors = extractValidationErrors(error);
      options?.onValidationError?.(fieldErrors);
    } else if (isRetryableError(error)) {
      options?.onRetryableError?.();
    } else {
      options?.onFatalError?.(errorDetails);
    }
  };
}
