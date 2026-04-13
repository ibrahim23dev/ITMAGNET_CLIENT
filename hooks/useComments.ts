'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { commentApi } from '@/lib/api';
import type { Comment } from '@/types';

/**
 * Get all comments for a specific ticket
 * @param ticketId Ticket identifier
 * @returns React Query result with comments array
 */
export const useCommentsQuery = (ticketId: string): UseQueryResult<Comment[], Error> => {
  return useQuery({
    queryKey: ['comments', ticketId],
    queryFn: async () => {
      try {
        const response = await commentApi.list(ticketId);
        return response;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to fetch comments');
      }
    },
    enabled: Boolean(ticketId),
    refetchInterval: 5000, 
  });
};

/**
 * Create a new comment on a ticket
 * @param ticketId Ticket identifier
 * @returns Mutation hook with comment creation function
 */
export const useCreateComment = (ticketId: string): UseMutationResult<
  any, 
  Error, 
  { body: string }
> => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { body: string }) => {
      try {
        const response = await commentApi.create(ticketId, payload);
        return response;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to create comment');
      }
    },
    onSuccess: () => {
      // Invalidate comments query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['comments', ticketId] });
    },
  });
};
