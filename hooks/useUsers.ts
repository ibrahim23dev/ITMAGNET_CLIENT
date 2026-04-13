'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api';
import type { User } from '@/types';

export const useUsersQuery = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await userApi.list(params);
      return response;
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<User>) => 
      userApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
    },
  });
};
