'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useLogin, useLogout, useRegister, useGetCurrentUser } from '../api/auth.api';
import type { LoginCredentials, RegisterData } from '../types/auth.types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useAuth = () => {
  const router = useRouter();
  const { user, token, login: setAuth, logout: clearAuth } = useAuthStore();

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const { data: currentUser, isLoading } = useGetCurrentUser();

  useEffect(() => {
    if (currentUser && !user) {
      setAuth(currentUser, token || '');
    }
  }, [currentUser, user, setAuth, token]);

  const login = async (credentials: LoginCredentials) => {
    const response = await loginMutation.mutateAsync(credentials);
    setAuth(response.user, response.accessToken);
    router.push('/dashboard');
    return response;
  };

  const register = async (data: RegisterData) => {
    const response = await registerMutation.mutateAsync(data);
    setAuth(response.user, response.accessToken);
    router.push('/dashboard');
    return response;
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    clearAuth();
    router.push('/login');
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    login,
    register,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};
