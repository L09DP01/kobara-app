import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/useAuthStore';

// Uses local environment variable or defaults to production
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.kobara.app/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('kobara_access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from SecureStore', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (Handling Refresh Token / Errors)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors for token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('kobara_refresh_token');
        if (refreshToken) {
          const newTokens = await authService.refreshToken(refreshToken);
          await SecureStore.setItemAsync('kobara_access_token', newTokens.accessToken);
          await SecureStore.setItemAsync('kobara_refresh_token', newTokens.refreshToken);
          
          if (originalRequest.headers) {
             originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          useAuthStore.getState().logout();
        }
      } catch (refreshError: any) {
        if (refreshError.code === 'UNAUTHORIZED') {
          useAuthStore.getState().logout();
        }
      }
    }
    
    return Promise.reject(error);
  }
);
