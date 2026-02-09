import axios from 'axios';
import { FIGMA_MODE } from './config/figmaMode';

// Get base URL with fallback
const getBaseURL = () => {
  const apiUrl = import.meta.env.VITE_BASE_API_URL;
  if (!apiUrl) {
    console.warn('VITE_BASE_API_URL is not set. Using default: http://localhost:8000');
    return 'http://localhost:8000/api';
  }
  return `${apiUrl}/api`;
};

const AxiosClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 seconds timeout
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
    // Check if this is a network/connection error (no response from server)
    const isNetworkError = !error.response && (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.message?.includes('Unable to connect'));
    
    // In Figma mode, provide mock responses for failed API calls
    if (FIGMA_MODE && !isNetworkError) {
      // Only suppress auth-related errors (401, 403) and provide mock data
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Return a mock successful response for GET requests to prevent redirects
        if (error.config?.method === 'get') {
          console.log('[Figma Mode] Suppressed auth error, returning mock data:', error.config.url);
          
          // Provide appropriate mock data based on endpoint
          const url = error.config.url || '';
          let mockData = null;
          
          if (url.includes('/user')) {
            mockData = { id: 1, name: 'Demo User', email: 'demo@example.com', role: 'tenant', status: 'active' };
          } else if (url.includes('/admin/dashboard')) {
            mockData = { total_users: 0, total_apartments: 0, total_rental_requests: 0, total_contracts: 0 };
          } else if (url.includes('/admin/')) {
            mockData = { data: [], meta: { current_page: 1, per_page: 15, total: 0, last_page: 1 } };
          } else if (url.includes('/booking-requests')) {
            mockData = [];
          } else if (url.includes('/notifications')) {
            mockData = [];
          } else if (url.includes('/reviews')) {
            mockData = [];
          } else if (url.includes('/support/tickets')) {
            mockData = [];
          } else if (url.includes('/contracts')) {
            mockData = [];
          } else if (url.includes('/reputation')) {
            mockData = { reputation: 0, total_reviews: 0, average_rating: 0 };
          } else {
            mockData = null;
          }
          
          return Promise.resolve({ data: mockData, status: 200 });
        }
        // For other methods, just reject silently
        return Promise.reject(error);
      }
      // For non-auth errors in Figma mode, let them pass through
      return Promise.reject(error);
    }
    
    // If it's a network error, show the actual error (even in Figma mode)
    if (isNetworkError) {
      const baseURL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:8000';
      console.error('Network Error:', {
        message: error.message,
        code: error.code,
        baseURL: baseURL,
        fullURL: `${baseURL}/api${error.config?.url || ''}`
      });
      // Enhance error message with base URL info
      if (!error.message || error.message === 'Network Error') {
        error.message = `Unable to connect to server at ${baseURL}. Please make sure the backend server is running.`;
      }
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
