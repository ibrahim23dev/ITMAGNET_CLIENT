import axios, { AxiosError } from 'axios';
import { getCookie, removeCookie } from './cookies';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000, // 15 second timeout
});

/**
 * Request interceptor: Inject JWT token from cookie or localStorage
 */
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Try to get token from cookie first, then fallback to localStorage
    const tokenFromCookie = getCookie('itmagnet_access_token');
    const tokenFromStorage = window.localStorage.getItem('itmagnet_access_token');
    const token = tokenFromCookie || tokenFromStorage;
    
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * Response interceptor: Handle errors and token expiration
 */
api.interceptors.response.use(
  (response) => {
    // Log API responses in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('[API Response]', response.config.method?.toUpperCase(), response.config.url, response.status, response.data);
    }
    return response;
  },
  (error: AxiosError<any>) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired - clear auth and redirect to login
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('itmagnet_access_token');
        removeCookie('itmagnet_access_token');
        // Optionally redirect to login
        // window.location.href = '/auth/login';
      }
    }

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
