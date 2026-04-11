import api from './axios';
import type { AuthPayload, Comment, Ticket, TicketListResponse, User, AiSuggestion, AnalyticsSnapshot, ApiResponse } from '@/types';

export const authApi = {
  login: (payload: AuthPayload) => 
    api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/login', payload).then(res => {
      if (!res.data.success) {
        throw new Error(res.data.message || 'Login failed');
      }
      return res;
    }),
  register: (payload: AuthPayload) => 
    api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/register', payload).then(res => {
      if (!res.data.success) {
        throw new Error(res.data.message || 'Registration failed');
      }
      return res;
    }),
  logout: () => api.post('/auth/logout'),
  me: () => 
    api.get<ApiResponse<User>>('/auth/me').then(res => {
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch user');
      }
      return res;
    }),
};

export const ticketApi = {
  list: (params?: Record<string, string | number | undefined>) => 
    api.get<ApiResponse<TicketListResponse>>('/tickets', { params }).then(res => {
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch tickets');
      }
      return res;
    }),
  get: (id: string) => 
    api.get<ApiResponse<Ticket>>(`/tickets/${id}`).then(res => {
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch ticket');
      }
      return res;
    }),
  create: (payload: Partial<Ticket>) => 
    api.post<ApiResponse<Ticket>>('/tickets', payload).then(res => {
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to create ticket');
      }
      return res;
    }),
  update: (id: string, payload: Partial<Ticket>) => 
    api.patch<ApiResponse<Ticket>>(`/tickets/${id}`, payload).then(res => {
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to update ticket');
      }
      return res;
    }),
  stats: () => 
    api.get<ApiResponse<AnalyticsSnapshot>>('/tickets/stats').then(res => {
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch stats');
      }
      return res;
    }),
};

export const commentApi = {
  list: (ticketId: string) => 
    api.get<ApiResponse<Comment[]>>(`/tickets/${ticketId}/comments`).then(res => {
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch comments');
      }
      return res;
    }),
  create: (ticketId: string, payload: { body: string }) => 
    api.post<ApiResponse<Comment>>(`/tickets/${ticketId}/comments`, payload).then(res => {
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to create comment');
      }
      return res;
    }),
  update: (commentId: string, payload: Partial<Comment>) => 
    api.patch<ApiResponse<Comment>>(`/comments/${commentId}`, payload).then(res => {
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to update comment');
      }
      return res;
    }),
  remove: (commentId: string) => api.delete(`/comments/${commentId}`),
};

export const aiApi = {
  classify: (payload: { title: string; description: string }) => api.post('/ai/classify', payload),
  summarize: (payload: { ticketId: string }) => api.post('/ai/summarize', payload),
  suggestReply: (payload: { ticketId: string; tone?: string; includeRag?: boolean }) => 
    api.post<ApiResponse<AiSuggestion>>('/ai/suggest-reply', payload).then(res => {
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to generate reply');
      }
      return res;
    }),
  search: (payload: { query: string }) => api.post('/ai/search', payload),
  agentWorkflow: (payload: { ticketId: string }) => api.post('/ai/agent-workflow', payload),
  feedback: (payload: { ticketId: string; rating: number; comment?: string }) => api.post('/ai/feedback', payload),
};
