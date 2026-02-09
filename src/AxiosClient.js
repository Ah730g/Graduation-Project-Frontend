import axios from 'axios';
import { FIGMA_MODE } from './config/figmaMode';

const AxiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_API_URL}/api`,
});

// Request interceptor - add token to headers
AxiosClient.interceptors.request.use((config) => {
  // In Figma mode, use mock token
  if (FIGMA_MODE) {
    config.headers.Authorization = `Bearer mock_token_for_figma_preview`;
  } else {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle 401 and 403 errors globally
AxiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // In Figma mode, suppress auth errors to prevent redirects
    if (FIGMA_MODE) {
      // Return a mock successful response for common GET requests
      if (error.config?.method === 'get') {
        console.log('[Figma Mode] Suppressed API error:', error.config.url);
        return Promise.resolve({ data: null, status: 200 });
      }
      // For other methods, just reject silently
      return Promise.reject(error);
    }
    
    // Normal error handling for production
    // If we get a 401 (Unauthorized), the token is invalid or expired
    if (error.response && error.response.status === 401) {
      // Clear invalid token and user data
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('user');
      
      // Dispatch a custom event so components can react to logout
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    
    // If we get a 403 with disabled status, the account is disabled
    if (error.response && error.response.status === 403 && 
        error.response.data?.status === 'disabled') {
      // Clear token and user data
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('user');
      
      // Dispatch a custom event for disabled account
      window.dispatchEvent(new CustomEvent('auth:disabled', {
        detail: { message: error.response.data?.message || 'Your account has been disabled' }
      }));
    }
    
    return Promise.reject(error);
  }
);

export default AxiosClient;
