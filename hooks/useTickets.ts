'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { ticketApi } from '@/lib/api';
import type { Ticket, TicketListResponse } from '@/types';

/**
 * Fetch paginated tickets with optional filters
 * @param params Pagination and filter parameters (limit, page, status, priority, etc)
 * @returns React Query result with typed TicketListResponse
 * @throws Error with descriptive message if request fails
 */
export const useTicketsQuery = (params?: Record<string, string | number | undefined>): UseQueryResult<TicketListResponse, Error> => {
  return useQuery<TicketListResponse, Error>({
    queryKey: ['tickets', params],
    queryFn: async () => {
      try {
        const response = await ticketApi.list(params);
        const data = response.data?.data;
        if (!data || !Array.isArray(data.tickets)) {
          throw new Error('Invalid response structure: expected tickets array');
        }
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to fetch tickets');
      }
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
};

/**
 * Fetch a single ticket by ID with full details
 * @param ticketId Unique ticket identifier
 * @returns React Query result with typed Ticket
 * @throws Error with descriptive message if request fails
 */
export const useTicketQuery = (ticketId: string): UseQueryResult<Ticket, Error> => {
  return useQuery<Ticket, Error>({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      try {
        const response = await ticketApi.get(ticketId);
        const data = response.data?.data;
        if (!data || !data.id) {
          throw new Error('Invalid response structure: expected ticket object');
        }
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to fetch ticket');
      }
    },
    enabled: Boolean(ticketId),
    retry: 1,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch ticket statistics and analytics
 * @returns React Query result with analytics data
 */
export const useTicketStatsQuery = () => {
  return useQuery({
    queryKey: ['ticket-stats'],
    queryFn: async () => {
      const response = await ticketApi.stats();
      return response.data?.data;
    },
    retry: 1,
    staleTime: 60000, // 1 minute for stats
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new ticket
 * @returns Mutation hook with create function and state
 */
export const useCreateTicket = (): UseMutationResult<Ticket, Error, Partial<Ticket>> => {
  return useMutation({
    mutationFn: async (payload: Partial<Ticket>) => {
      const response = await ticketApi.create(payload);
      return response.data?.data;
    },
  });
};

/**
 * Update an existing ticket
 * @returns Mutation hook with update function and state
 */
export const useUpdateTicket = (): UseMutationResult<Ticket, Error, { id: string, payload: Partial<Ticket> }> => {
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await ticketApi.update(id, payload);
      return response.data?.data;
    },
  });
};
