import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

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
      const token = await SecureStore.getItemAsync('kobara_session_token');
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
        // Architecture placeholder for refresh token logic
        const refreshToken = await SecureStore.getItemAsync('kobara_refresh_token');
        if (refreshToken) {
          // TODO: Call API to refresh token, save new token, and retry request
          // const newTokens = await refreshSession(refreshToken);
          // await SecureStore.setItemAsync('kobara_session_token', newTokens.token);
          // originalRequest.headers.Authorization = `Bearer ${newTokens.token}`;
          // return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Failed to refresh token', refreshError);
        // Fallback: Logout user or redirect to auth screen
      }
    }
    
    return Promise.reject(error);
  }
);
