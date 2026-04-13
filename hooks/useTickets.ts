'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { ticketApi } from '@/lib/api';
import type { Ticket, TicketListResponse } from '@/types';
import { ApiError } from '@/lib/api-service';

/**
 * Fetch paginated tickets with optional filters
 * Includes automatic refetching and optimistic updates
 * @param params Pagination and filter parameters (limit, page, status, priority, etc)
 * @returns React Query result with typed TicketListResponse
 */
export const useTicketsQuery = (
  params?: Record<string, string | number | undefined>,
  options?: any
): UseQueryResult<TicketListResponse, Error> => {
  return useQuery<TicketListResponse, Error>({
    queryKey: ['tickets', params],
    queryFn: async () => {
      return ticketApi.list(params);
    },
    // Better retry strategy
    retry: (failureCount, error: any) => {
      // Don't retry client errors (4xx) except 429
      if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
        return false;
      }
      return failureCount < 3; // Retry up to 3 times
    },
    // Performance optimization
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    
    // Automatic background refetch
    refetchInterval: 60000, // Every 60 seconds
    refetchOnWindowFocus: 'stale',
    refetchOnReconnect: 'stale',
    refetchOnMount: 'stale',
    
    // Network state aware
    networkMode: 'always',
    
    ...options,
  });
};

/**
 * Fetch a single ticket by ID with full details
 * @param ticketId Unique ticket identifier
 * @returns React Query result with typed Ticket
 */
export const useTicketQuery = (ticketId: string): UseQueryResult<Ticket, Error> => {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async (): Promise<Ticket> => {
      return ticketApi.get(ticketId);
    },
    enabled: Boolean(ticketId),
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    networkMode: 'always',
  }) as UseQueryResult<Ticket, Error>;
};

/**
 * Fetch ticket statistics and analytics
 * Refetches more frequently than regular tickets
 * @returns React Query result with analytics data
 */
export const useTicketStatsQuery = () => {
  return useQuery({
    queryKey: ['ticket-stats'],
    queryFn: async () => {
      return ticketApi.stats();
    },
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for stats
    gcTime: 15 * 60 * 1000,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Always refetch on window focus
    networkMode: 'always',
  });
};

/**
 * Create a new ticket mutation
 * Optimistically updates the tickets list
 * @returns Mutation result for creating tickets
 */
export const useCreateTicketMutation = (): UseMutationResult<Ticket, Error, Partial<Ticket>> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => ticketApi.create(data),
    onMutate: async (newTicket) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['tickets'] });

      // Snapshot previous state
      const previousTickets = queryClient.getQueryData<TicketListResponse>(['tickets']);

      // Optimistically update
      queryClient.setQueryData<TicketListResponse>(['tickets'], (old) => {
        if (!old) return old;
        return {
          ...old,
          tickets: [{ ...newTicket, id: 'optimistic' } as Ticket, ...old.tickets],
        };
      });

      return { previousTickets };
    },
    onError: (err, newTicket, context: any) => {
      // Rollback on error
      if (context?.previousTickets) {
        queryClient.setQueryData(['tickets'], context.previousTickets);
      }
    },
    onSuccess: () => {
      // Refetch to ensure we have the real ID and complete data
      queryClient.refetchQueries({ queryKey: ['tickets'] });
      queryClient.refetchQueries({ queryKey: ['ticket-stats'] });
    },
  });
};

/**
 * Update ticket mutation with optimistic updates
 */
export const useUpdateTicketMutation = (
  ticketId: string
): UseMutationResult<Ticket, Error, Partial<Ticket>> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => ticketApi.update(ticketId, data),
    onMutate: async (updateData) => {
      await queryClient.cancelQueries({ queryKey: ['ticket', ticketId] });

      const previousTicket = queryClient.getQueryData<Ticket>(['ticket', ticketId]);

      queryClient.setQueryData<Ticket>(['ticket', ticketId], (old) => ({
        ...old,
        ...updateData,
      } as Ticket));

      return { previousTicket };
    },
    onError: (err, data, context: any) => {
      if (context?.previousTicket) {
        queryClient.setQueryData(['ticket', ticketId], context.previousTicket);
      }
    },
    onSuccess: () => {
      // Refetch related queries
      queryClient.refetchQueries({ queryKey: ['ticket', ticketId] });
      queryClient.refetchQueries({ queryKey: ['tickets'] });
      queryClient.refetchQueries({ queryKey: ['ticket-stats'] });
    },
  });
};

/**
 * Delete ticket mutation
 */
export const useDeleteTicketMutation = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId) => ticketApi.delete(ticketId),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['tickets'] });
      queryClient.refetchQueries({ queryKey: ['ticket-stats'] });
    },
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
      return response;
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
      return response;
    },
  });
};
