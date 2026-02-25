import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * User interface representing authenticated user data
 */
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Authentication actions interface
 */
interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

/**
 * Combined store type
 */
type AuthStore = AuthState & AuthActions;

/**
 * Initial state for the auth store
 */
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

/**
 * Zustand store for authentication state management.
 * 
 * Features:
 * - User and token state management
 * - Persistent storage in localStorage
 * - Login/logout/setUser actions
 * 
 * @example
 * // Using the store in a component
 * const { user, isAuthenticated, login, logout } = useAuthStore();
 * 
 * // Login action
 * login(userData, 'jwt-token');
 * 
 * // Logout action
 * logout();
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      /**
       * Logs in a user with their data and authentication token.
       * Sets both user and token in state and marks as authenticated.
       */
      login: (user: User, token: string) => {
        // Also set token in localStorage for API client access
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', token);
        }
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      /**
       * Logs out the current user.
       * Clears all authentication data from state and localStorage.
       */
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
        }
        set({
          ...initialState,
          isLoading: false,
        });
      },

      /**
       * Updates the user data without changing authentication status.
       */
      setUser: (user: User) => {
        set({ user });
      },

      /**
       * Updates the authentication token.
       */
      setToken: (token: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', token);
        }
        set({ token });
      },

      /**
       * Sets the loading state.
       */
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      /**
       * Resets the store to initial state.
       */
      reset: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
        }
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Export types for use in other files
export type { User, AuthState, AuthActions };
