import { AxiosError } from 'axios';
import api from './axios';
import type { ApiResponse } from '@/types';

/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any,
    public requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static from(error: AxiosError<any>) {
    if (error.response) {
      return new ApiError(
        error.response.status,
        error.response.data?.message || error.message,
        error.response.data,
        error.response.headers['x-request-id'] as string
      );
    }
    return new ApiError(0, error.message);
  }
}

/**
 * Generic API service handler with retry logic and error handling
 */
async function apiCall<T>(
  method: 'get' | 'post' | 'patch' | 'put' | 'delete',
  url: string,
  data?: any,
  options?: { retries?: number; retryDelay?: number; timeout?: number }
): Promise<T> {
  const { retries = 2, retryDelay = 1000 } = options || {};

  let lastError: AxiosError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await api[method]<ApiResponse<T>>(url, data);
      
      // Check if response has success flag (if API uses it)
      if (response.data && typeof response.data.success === 'boolean' && !response.data.success) {
        throw new ApiError(
          response.status,
          response.data.message || 'API returned unsuccessful status'
        );
      }

      // Return data or wrapped data
      return (response.data?.data || response.data) as T;
    } catch (error) {
      lastError = error as AxiosError;

      // Don't retry on client errors (4xx except 429) or last attempt
      if (
        (lastError.response && lastError.response.status >= 400 && lastError.response.status < 500 && lastError.response.status !== 429) ||
        attempt === retries
      ) {
        throw ApiError.from(lastError);
      }

      // Wait before retrying
      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }
  }

  throw ApiError.from(lastError!);
}

/**
 * Wrapped API methods for common operations
 */
export const apiService = {
  get: <T = any>(url: string, config?: any) => apiCall<T>('get', url, config),
  post: <T = any>(url: string, data?: any, config?: any) => apiCall<T>('post', url, data),
  patch: <T = any>(url: string, data?: any, config?: any) => apiCall<T>('patch', url, data),
  put: <T = any>(url: string, data?: any, config?: any) => apiCall<T>('put', url, data),
  delete: <T = any>(url: string, config?: any) => apiCall<T>('delete', url, config),
};

export default apiService;
