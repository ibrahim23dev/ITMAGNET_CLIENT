'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import type { AiSuggestion } from '@/types';

/**
 * Get AI-generated summary of a ticket
 * @param ticketId Ticket identifier
 * @returns React Query result with AI summary
 */
export const useAiSummary = (ticketId: string): UseQueryResult<{ summary: string }, Error> => {
  return useQuery({
    queryKey: ['ai-summary', ticketId],
    queryFn: async () => {
      try {
        const response = await aiApi.summarize({ ticketId });
        return response.data || { summary: '' };
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to generate summary');
      }
    },
    enabled: Boolean(ticketId),
    retry: 1,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Generate AI-suggested reply with optional tone and RAG context
 * @returns Mutation hook with reply generation function
 */
export const useAiReply = (): UseMutationResult<{ data: AiSuggestion }, Error, { ticketId: string; tone?: string; includeRag?: boolean }> => {
  return useMutation({
    mutationFn: async (payload: { ticketId: string; tone?: string; includeRag?: boolean }) => {
      try {
        const response = await aiApi.suggestReply(payload);
        return response.data;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to generate reply');
      }
    },
  });
};

/**
 * Perform semantic search using AI
 * @returns Mutation hook with search function
 */
export const useAiSearch = (): UseMutationResult<{ data: Array<{ id: string; title: string; description?: string; snippet?: string; score?: number }> }, Error, { query: string }> => {
  return useMutation({
    mutationFn: async (payload: { query: string }) => {
      try {
        const response = await aiApi.search(payload);
        return response.data || { data: [] };
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Search failed');
      }
    },
  });
};

/**
 * Execute AI agent workflow for ticket
 * @returns Mutation hook with workflow function
 */
export const useAiAgentWorkflow = (): UseMutationResult<any, Error, { ticketId: string }> => {
  return useMutation({
    mutationFn: async (payload: { ticketId: string }) => {
      try {
        const response = await aiApi.agentWorkflow(payload);
        return response.data;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Agent workflow failed');
      }
    },
  });
};
