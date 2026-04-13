import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getCookie, removeCookie, setCookie } from './cookies';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with enhanced configuration
export const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

// Track if we're already refreshing token to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request interceptor: Inject JWT token from cookie or localStorage
 * Also adds request ID for tracking and improved error handling
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // Try to get token from cookie first, then fallback to localStorage
      const tokenFromCookie = getCookie('itmagnet_access_token');
      const tokenFromStorage = window.localStorage.getItem('itmagnet_access_token');
      const token = tokenFromCookie || tokenFromStorage;

      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for better tracking
      const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      config.headers['X-Request-ID'] = requestId;
    }

    // Add timestamps for performance monitoring
    (config as any).metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle errors, token expiration, and retries
 * Automatically refreshes token on 401 response
 */
api.interceptors.response.use(
  (response) => {
    // Calculate and log response time in development
    if (process.env.NODE_ENV === 'development') {
      const duration = 
        new Date().getTime() - (response.config as any).metadata?.startTime?.getTime();
      console.debug('[API Success]', response.config.method?.toUpperCase(), response.config.url, {
        status: response.status,
        duration: `${duration}ms`,
      });
    }
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        method: originalRequest?.method?.toUpperCase(),
        url: originalRequest?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle 401 Unauthorized - Token expired, try to refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue the request if already refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const refreshToken =
          getCookie('itmagnet_refresh_token') ||
          window.localStorage.getItem('itmagnet_refresh_token');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
            timeout: 10000,
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Store new tokens
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('itmagnet_access_token', accessToken);
          setCookie('itmagnet_access_token', accessToken, 7); // 7 days
          
          if (newRefreshToken) {
            window.localStorage.setItem('itmagnet_refresh_token', newRefreshToken);
            setCookie('itmagnet_refresh_token', newRefreshToken, 30); // 30 days
          }
        }

        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('itmagnet_access_token');
          window.localStorage.removeItem('itmagnet_refresh_token');
          removeCookie('itmagnet_access_token');
          removeCookie('itmagnet_refresh_token');

          // Dispatch custom event for components to react to logout
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }

        processQueue(refreshError, null);
        isRefreshing = false;

        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - Access denied
    if (error.response?.status === 403) {
      console.error('Access denied - insufficient permissions');
    }

    // Handle 429 Too Many Requests - Rate limit
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded - please try again later');
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - please check your connection');
    }

    return Promise.reject(error);
  }
);

export default api;
