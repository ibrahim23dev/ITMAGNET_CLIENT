'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { aiApi, ticketApi } from '@/lib/api';
import type { AiSuggestion, AiSummarizeResult, ApiResponse, Ticket } from '@/types';

/**
 * Get AI-generated summary of a ticket
 * @param ticketId Ticket identifier
 * @returns React Query result with AI summary
 */
export const useAiSummary = (ticketId: string, text?: string): UseQueryResult<AiSummarizeResult, Error> => {
  return useQuery({
    queryKey: ['ai-summary', ticketId, text],
    queryFn: async () => {
      try {
        const resolvedText =
          text?.trim() ||
          (await (async () => {
            const ticket = await ticketApi.get(ticketId);
            return [ticket.title, ticket.description].filter(Boolean).join('\n\n');
          })());

        const response = await aiApi.summarize({ ticketId, text: resolvedText });
        return response;
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
export const useAiReply = (): UseMutationResult<AiSuggestion, Error, { ticketId: string; tone?: string; includeRag?: boolean }> => {
  return useMutation({
    mutationFn: async (payload: { ticketId: string; tone?: string; includeRag?: boolean }) => {
      try {
        const response = await aiApi.suggestReply(payload);
        return response;
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
export const useAiSearch = (): UseMutationResult<Array<{ id: string; title: string; description?: string; snippet?: string; score?: number }>, Error, { query: string }> => {
  return useMutation({
    mutationFn: async (payload: { query: string }) => {
      try {
        const response = await aiApi.search(payload);
        
        // Handle various response formats
        if (Array.isArray(response)) {
          return response.map((item: any) => ({
            id: item.id || item._id || `result-${Math.random()}`,
            title: item.title || item.name || 'Untitled',
            description: item.description || item.body || '',
            snippet: item.snippet || item.excerpt || item.summary || '',
            score: typeof item.score === 'number' ? item.score : 0.95
          }));
        }
        
        if (response?.results && Array.isArray(response.results)) {
          return response.results.map((item: any) => ({
            id: item.id || item._id || `result-${Math.random()}`,
            title: item.title || item.name || 'Untitled',
            description: item.description || item.body || '',
            snippet: item.snippet || item.excerpt || item.summary || '',
            score: typeof item.score === 'number' ? item.score : 0.95
          }));
        }

        if (response?.data && Array.isArray(response.data)) {
          return response.data.map((item: any) => ({
            id: item.id || item._id || `result-${Math.random()}`,
            title: item.title || item.name || 'Untitled',
            description: item.description || item.body || '',
            snippet: item.snippet || item.excerpt || item.summary || '',
            score: typeof item.score === 'number' ? item.score : 0.95
          }));
        }

        return [];
      } catch (error) {
        console.error('AI Search error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Search failed - please try again');
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
        return response;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Agent workflow failed');
      }
    },
  });
};
