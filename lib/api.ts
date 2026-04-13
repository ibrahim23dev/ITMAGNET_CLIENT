import api from './axios';
import { ApiError } from './api-service';
import type {
  AuthPayload,
  Comment,
  Ticket,
  TicketListResponse,
  User,
  AiSuggestion,
  AnalyticsSnapshot,
  AiClassifyResult,
  AiSummarizeResult,
} from '@/types';

/**
 * Helper function to extract typed data from API response
 * Handles different response structures from backend
 */
const extractData = <T,>(response: any): T => {
  // Handle null/undefined
  if (!response) return response;
  
  // If response is already the data we want (direct response)
  if (Array.isArray(response)) {
    return response as T;
  }
  
  // Nested data structures
  if (response?.data?.data) return response.data.data as T;
  if (response?.data) return response.data as T;
  
  // Return as-is
  return response as T;
};

/**
 * Authentication API endpoints
 */
export const authApi = {
  login: async (payload: AuthPayload) => {
    try {
      const response = await api.post<any>('/auth/login', payload);
      const data = extractData<{ user: User; accessToken: string; refreshToken: string }>(response);
      
      // Validate we got the expected data structure
      if (!data.accessToken) {
        throw new Error('No access token in response');
      }
      
      return data;
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  register: async (payload: AuthPayload) => {
    try {
      const response = await api.post<any>('/auth/register', payload);
      const data = extractData<{ user: User; accessToken: string; refreshToken: string }>(response);
      
      if (!data.accessToken) {
        throw new Error('No access token in response');
      }
      
      return data;
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Logout errors are not critical
      console.warn('Logout error:', error);
    }
  },

  me: async () => {
    try {
      const response = await api.get<any>('/auth/me');
      return extractData<User>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  refreshToken: async (refreshToken: string) => {
    try {
      const response = await api.post<any>('/auth/refresh', {
        refreshToken,
      });
      return extractData<{ accessToken: string; refreshToken: string }>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get<any>('/auth/verify');
      return extractData<{ valid: boolean }>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },
};

/**
 * Ticket API endpoints with full CRUD operations
 */
export const ticketApi = {
  list: async (params?: Record<string, string | number | undefined>) => {
    try {
      const response = await api.get<any>('/tickets', { params });
      const data = extractData<any>(response);

      // Handle both paginated and simple array responses
      if (Array.isArray(data)) {
        return {
          tickets: data.map((t: any) => ({ ...t, id: t._id || t.id })),
          meta: { page: 1, limit: data.length, total: data.length },
        };
      }

      return {
        tickets: (data.tickets || []).map((t: any) => ({ ...t, id: t._id || t.id })),
        meta: data.meta || { page: 1, limit: 10, total: 0 },
      };
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  get: async (id: string) => {
    try {
      const response = await api.get<any>(`/tickets/${id}`);
      const data = extractData<Ticket>(response);
      return { ...data, id: data._id || data.id };
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  create: async (payload: Partial<Ticket>) => {
    try {
      const response = await api.post<any>('/tickets', payload);
      const data = extractData<Ticket>(response);
      return { ...data, id: data._id || data.id };
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  update: async (id: string, payload: Partial<Ticket>) => {
    try {
      const response = await api.patch<any>(`/tickets/${id}`, payload);
      const data = extractData<Ticket>(response);
      return { ...data, id: data._id || data.id };
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  assign: async (id: string, agentId: string) => {
    try {
      const response = await api.patch<any>(`/tickets/${id}/assign`, { agentId });
      const data = extractData<Ticket>(response);
      return { ...data, id: data._id || data.id };
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  delete: async (id: string) => {
    try {
      await api.delete(`/tickets/${id}`);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  stats: async () => {
    try {
      const response = await api.get<any>('/analytics/kpi');
      return extractData<AnalyticsSnapshot>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  search: async (query: string, filters?: Record<string, any>) => {
    try {
      const response = await api.get<any>('/tickets/search', {
        params: { q: query, ...filters },
      });
      const data = extractData<Ticket[]>(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },
};

/**
 * Analytics API endpoints
 */
export const analyticsApi = {
  kpi: async () => {
    try {
      const response = await api.get<any>('/analytics/kpi');
      return extractData<AnalyticsSnapshot>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  realtime: async () => {
    try {
      const response = await api.get<any>('/analytics/realtime');
      return extractData<any>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  historical: async (params?: Record<string, any>) => {
    try {
      const response = await api.get<any>('/analytics/historical', { params });
      return extractData<any>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  poll: async () => {
    try {
      const response = await api.get<any>('/analytics/realtime/poll');
      return extractData<any>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },
};

/**
 * Comment API endpoints
 */
export const commentApi = {
  list: async (ticketId: string) => {
    try {
      const response = await api.get<any>(`/tickets/${ticketId}/comments`);
      return extractData<Comment[]>(response) || [];
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  create: async (ticketId: string, payload: { body: string }) => {
    try {
      const response = await api.post<any>(`/tickets/${ticketId}/comments`, payload);
      return extractData<Comment>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  update: async (commentId: string, payload: Partial<Comment>) => {
    try {
      const response = await api.patch<any>(`/comments/${commentId}`, payload);
      return extractData<Comment>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  remove: async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },
};

/**
 * AI API endpoints for intelligent features
 */
export const aiApi = {
  classify: async (payload: { text: string; title?: string | null }) => {
    try {
      const response = await api.post<any>('/ai/classify', payload);
      // Response structure: { success, message, data: { classification: {...} } }
      const result = response?.data || response;
      const classificationData = result?.data?.classification || result?.classification || {};
      
      return {
        success: result?.success ?? true,
        classification: {
          category: classificationData?.category || 'general',
          categoryConfidence: classificationData?.categoryConfidence ?? 0,
          priority: classificationData?.priority || 'medium',
          priorityConfidence: classificationData?.priorityConfidence ?? 0,
          suggestedTags: classificationData?.suggestedTags || []
        },
        timestamp: result?.timestamp
      };
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  summarize: async (payload: { ticketId: string; text: string }) => {
    try {
      const response = await api.post<any>('/ai/summarize', payload);
      // Response structure: { success, message, data: { summary, tokens } }
      const result = response?.data || response;
      const summaryData = result?.data || result;
      
      return {
        ticketId: payload.ticketId,
        summary: summaryData?.summary || summaryData?.text || '',
        commentCount: summaryData?.tokens || 0,
        timestamp: result?.timestamp
      };
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  suggestReply: async (payload: { ticketId: string; tone?: string; includeRag?: boolean }) => {
    try {
      const response = await api.post<any>('/ai/suggest-reply', payload);
      // Response structure: { success, message, data: { ticketId, suggestedReply, tone, ragContextUsed, similarTicketsFound } }
      const result = response?.data || response;
      const replyData = result?.data || result;
      
      return {
        success: result?.success ?? true,
        ticketId: replyData?.ticketId || payload.ticketId,
        suggestedReply: replyData?.suggestedReply || '',
        tone: replyData?.tone || payload.tone || 'professional',
        ragContextUsed: replyData?.ragContextUsed ?? false,
        similarTicketsFound: replyData?.similarTicketsFound ?? 0,
        timestamp: result?.timestamp
      };
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  search: async (payload: { query: string }) => {
    try {
      const response = await api.post<any>('/ai/search', payload);
      const data = extractData<any>(response);
      
      // Ensure we return an array
      if (Array.isArray(data)) {
        return data;
      }
      if (Array.isArray(data?.results)) {
        return data.results;
      }
      if (Array.isArray(data?.data)) {
        return data.data;
      }
      
      return [];
    } catch (error) {
      console.error('AI Search error:', error);
      throw ApiError.from(error as any);
    }
  },

  agentWorkflow: async (payload: { ticketId: string }) => {
    try {
      const response = await api.post('/ai/agent-workflow', payload);
      return extractData<any>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  feedback: async (payload: { ticketId: string; rating: number; comment?: string }) => {
    try {
      const response = await api.post('/ai/feedback', payload);
      return extractData<any>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },
};

/**
 * User management API endpoints
 */
export const userApi = {
  list: async (params?: Record<string, any>) => {
    try {
      const response = await api.get<any>('/auth/users', { params });
      return extractData<User[]>(response) || [];
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  get: async (id: string) => {
    try {
      const response = await api.get<any>(`/users/${id}`);
      return extractData<User>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  update: async (payload: Partial<User>) => {
    try {
      const response = await api.patch<any>('/auth/me', payload);
      return extractData<User>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  toggleStatus: async (id: string) => {
    try {
      const response = await api.patch<any>(`/auth/users/${id}/toggle-status`);
      return extractData<any>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  remove: async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await api.post('/auth/change-password', payload);
      return extractData<any>(response);
    } catch (error) {
      throw ApiError.from(error as any);
    }
  },
};

