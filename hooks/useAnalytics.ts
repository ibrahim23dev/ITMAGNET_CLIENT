'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { ticketApi } from '@/lib/api';
import type { AnalyticsSnapshot } from '@/types';

/**
 * Fetch dashboard analytics and metrics
 * @returns React Query result with AnalyticsSnapshot data
 * @throws Error with descriptive message if request fails
 */
export const useAnalyticsQuery = (): UseQueryResult<AnalyticsSnapshot, Error> => {
  return useQuery<AnalyticsSnapshot, Error>({
    queryKey: ['analytics'],
    queryFn: async () => {
      try {
        const response = await ticketApi.stats();
        const data = response.data?.data;
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response structure: expected analytics object');
        }
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to fetch analytics');
      }
    },
    retry: 1,
    staleTime: 60000, // 1 minute for analytics
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
