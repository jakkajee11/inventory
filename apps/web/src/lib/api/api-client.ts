import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

/**
 * API Error response structure
 */
interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

/**
 * Extended axios config to include _retry flag for token refresh
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Axios instance configured for API communication.
 * 
 * Features:
 * - Base URL from NEXT_PUBLIC_API_URL environment variable
 * - Automatic Authorization header injection
 * - Request/Response interceptors for error handling
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:13101/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add Authorization header.
 * Automatically attaches the access token from localStorage if available.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling.
 * Handles common HTTP errors like 401 (Unauthorized) and network errors.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const { response } = error;

    if (response) {
      const { status, data } = response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('auth-user');
            
            // Only redirect if not already on auth pages
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
              window.location.href = '/login';
            }
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access denied:', data.message);
          break;

        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;

        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;

        default:
          console.error('API error:', data.message || 'An unexpected error occurred');
      }

      // Return a standardized error object
      return Promise.reject({
        message: data.message || 'An error occurred',
        statusCode: status,
        error: data.error,
      });
    }

    // Network error or request was not made
    if (error.request) {
      console.error('Network error: No response received');
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      });
    }

    // Something happened in setting up the request
    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      statusCode: 0,
    });
  }
);

export default apiClient;
