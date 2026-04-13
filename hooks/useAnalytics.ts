'use client';

import { useQuery } from '@tanstack/react-query';
import { ticketApi } from '@/lib/api';

export const useAnalyticsQuery = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res: any = await ticketApi.stats();

      // 🔥 FIX: সব possible case handle
      const rawData =
        res?.data?.data ||
        res?.data ||
        res ||
        {};

      console.log("🔥 RAW API DATA:", rawData);

      return {
        totalTickets: rawData.totalTickets ?? 0,
        openTickets: rawData.openTickets ?? 0,
        highPriority: rawData.ticketsByPriority?.high ?? 0,
        avgResolutionTime: rawData.avgResolutionTime ?? '0h',

        topCategories: rawData.ticketsByCategory
          ? Object.entries(rawData.ticketsByCategory).map(([key, value]) => ({
              category: key,
              count: Number(value),
            }))
          : [],

        riskTickets: [],
      };
    },

    retry: 1,
    staleTime: 5000,
    refetchInterval: 10000,
  });
};