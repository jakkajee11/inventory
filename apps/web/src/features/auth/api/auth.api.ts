import apiClient from '@/lib/api/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types/auth.types';

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const { data } = await apiClient.post('/auth/login', credentials);
      return data;
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (registerData: RegisterData): Promise<AuthResponse> => {
      const { data } = await apiClient.post('/auth/register', registerData);
      return data;
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      await apiClient.post('/auth/logout');
    },
  });
};

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async (): Promise<User> => {
      const { data } = await apiClient.get('/users/me');
      return data;
    },
    retry: false,
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async (refreshToken: string): Promise<{ accessToken: string }> => {
      const { data } = await apiClient.post('/auth/refresh', { refreshToken });
      return data;
    },
  });
};
