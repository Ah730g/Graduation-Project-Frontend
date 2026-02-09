import axios from 'axios';
import { FIGMA_MODE } from './config/figmaMode';
import { isFigmaRoute, mockListData, mockEstateInfo, mockProfileData, mockAdminDashboard, mockUsers, mockAdminPosts, mockBookingRequests, mockNotifications, mockSupportTickets, mockAdminSupportTickets, mockRentalRequests, mockContracts, mockReviews, mockIdentityVerifications, mockRatings, mockPaymentData, mockAdminReports } from './Lib/figmaMockData';

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

// Request interceptor - add token to headers and intercept /figma routes
AxiosClient.interceptors.request.use((config) => {
  // On /figma routes, intercept GET requests and return mock data directly
  if (isFigmaRoute() && config.method === 'get') {
    const url = config.url || '';
    let mockData = null;
    
    // Map URLs to mock data
    if (url.includes('/post') && !url.includes('/admin')) {
      // List posts
      const page = config.params?.page || 1;
      const perPage = config.params?.per_page || 10;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      mockData = {
        data: mockListData.slice(start, end),
        pagination: {
          current_page: page,
          per_page: perPage,
          total: mockListData.length,
          last_page: Math.ceil(mockListData.length / perPage),
          from: start + 1,
          to: Math.min(end, mockListData.length),
        }
      };
    } else if (url.includes('/post/') && !url.includes('/admin') && url.match(/\/post\/\d+$/)) {
      // Single post by ID
      mockData = mockEstateInfo;
    } else if (url.includes('/admin/dashboard')) {
      mockData = mockAdminDashboard;
    } else if (url.includes('/admin/users')) {
      mockData = { data: mockUsers, meta: { current_page: 1, per_page: 15, total: mockUsers.length, last_page: 1 } };
    } else if (url.includes('/admin/posts') || url.includes('/admin/apartments')) {
      mockData = { data: mockAdminPosts, meta: { current_page: 1, per_page: 15, total: mockAdminPosts.length, last_page: 1 } };
    } else if (url.includes('/admin/rental-requests')) {
      mockData = { data: mockRentalRequests, meta: { current_page: 1, per_page: 15, total: mockRentalRequests.length, last_page: 1 } };
    } else if (url.includes('/admin/contracts')) {
      mockData = { data: mockContracts, meta: { current_page: 1, per_page: 15, total: mockContracts.length, last_page: 1 } };
    } else if (url.includes('/admin/reviews')) {
      mockData = { data: mockReviews, meta: { current_page: 1, per_page: 15, total: mockReviews.length, last_page: 1 } };
    } else if (url.includes('/admin/identity-verifications')) {
      mockData = { data: mockIdentityVerifications, meta: { current_page: 1, per_page: 15, total: mockIdentityVerifications.length, last_page: 1 } };
    } else if (url.includes('/admin/support/tickets')) {
      mockData = { data: mockAdminSupportTickets, meta: { current_page: 1, per_page: 15, total: mockAdminSupportTickets.length, last_page: 1 } };
    } else if (url.includes('/admin/reports')) {
      mockData = mockAdminReports;
    } else if (url.includes('/booking-requests/my-requests')) {
      mockData = mockBookingRequests.myRequests;
    } else if (url.includes('/booking-requests/received')) {
      mockData = mockBookingRequests.receivedRequests;
    } else if (url.includes('/notifications')) {
      mockData = mockNotifications;
    } else if (url.includes('/support/tickets') && !url.match(/\/support\/tickets\/\d+$/)) {
      mockData = mockSupportTickets;
    } else if (url.includes('/support/tickets/')) {
      const ticketId = url.match(/\/support\/tickets\/(\d+)/)?.[1];
      mockData = mockSupportTickets.find(t => t.id === parseInt(ticketId)) || mockSupportTickets[0];
    } else if (url.includes('/reputation')) {
      mockData = mockProfileData.reputation;
    } else if (url.includes('/user') && !url.includes('/admin') && !url.includes('/users')) {
      mockData = mockProfileData.user;
    } else if (url.includes('/ratings')) {
      mockData = mockRatings;
    } else if (url.includes('/contracts/')) {
      const contractId = url.match(/\/contracts\/(\d+)/)?.[1];
      mockData = mockContracts.find(c => c.id === parseInt(contractId)) || mockContracts[0];
    } else if (url.includes('/property')) {
      mockData = [{ id: 1, name: 'Apartment' }, { id: 2, name: 'House' }, { id: 3, name: 'Studio' }];
    }
    
    // If we have mock data, return it directly without making the request
    if (mockData !== null) {
      console.log('[Figma Route] Returning mock data for:', url);
      return Promise.reject({
        isMockResponse: true,
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config,
      });
    }
  }
  
  // In Figma mode or on /figma routes, use mock token
  if (FIGMA_MODE || isFigmaRoute()) {
    config.headers.Authorization = `Bearer mock_token_for_figma_preview`;
    // Mark this request as a figma route request
    config._isFigmaRoute = isFigmaRoute();
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
  (response) => {
    // Handle mock responses from request interceptor
    if (response.config?._isFigmaRoute && isFigmaRoute()) {
      // If we're on a /figma route, we might have already returned mock data
      // This is a fallback in case the request interceptor didn't catch it
      return response;
    }
    return response;
  },
  (error) => {
    // Handle mock responses from request interceptor
    if (error.isMockResponse) {
      return Promise.resolve(error);
    }
    
    // Check if this is a network/connection error (no response from server)
    const isNetworkError = !error.response && (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.message?.includes('Unable to connect'));
    
    // In Figma mode or on /figma routes, provide mock responses
    if ((FIGMA_MODE || isFigmaRoute()) && !isNetworkError) {
      // Intercept all GET requests on /figma routes and return mock data
      if (error.config?._isFigmaRoute && error.config?.method === 'get') {
        console.log('[Figma Route] Returning mock data for:', error.config.url);
        
        const url = error.config.url || '';
        let mockData = null;
        
        // Map URLs to mock data
        if (url.includes('/post') && !url.includes('/admin')) {
          // List posts
          const page = error.config.params?.page || 1;
          const perPage = error.config.params?.per_page || 10;
          const start = (page - 1) * perPage;
          const end = start + perPage;
          mockData = {
            data: mockListData.slice(start, end),
            pagination: {
              current_page: page,
              per_page: perPage,
              total: mockListData.length,
              last_page: Math.ceil(mockListData.length / perPage),
              from: start + 1,
              to: Math.min(end, mockListData.length),
            }
          };
        } else if (url.includes('/post/') && !url.includes('/admin')) {
          // Single post
          mockData = mockEstateInfo;
        } else if (url.includes('/admin/dashboard')) {
          mockData = mockAdminDashboard;
        } else if (url.includes('/admin/users')) {
          mockData = { data: mockUsers, meta: { current_page: 1, per_page: 15, total: mockUsers.length, last_page: 1 } };
        } else if (url.includes('/admin/posts') || url.includes('/admin/apartments')) {
          mockData = { data: mockAdminPosts, meta: { current_page: 1, per_page: 15, total: mockAdminPosts.length, last_page: 1 } };
        } else if (url.includes('/admin/rental-requests')) {
          mockData = { data: mockRentalRequests, meta: { current_page: 1, per_page: 15, total: mockRentalRequests.length, last_page: 1 } };
        } else if (url.includes('/admin/contracts')) {
          mockData = { data: mockContracts, meta: { current_page: 1, per_page: 15, total: mockContracts.length, last_page: 1 } };
        } else if (url.includes('/admin/reviews')) {
          mockData = { data: mockReviews, meta: { current_page: 1, per_page: 15, total: mockReviews.length, last_page: 1 } };
        } else if (url.includes('/admin/identity-verifications')) {
          mockData = { data: mockIdentityVerifications, meta: { current_page: 1, per_page: 15, total: mockIdentityVerifications.length, last_page: 1 } };
        } else if (url.includes('/admin/support/tickets')) {
          mockData = { data: mockAdminSupportTickets, meta: { current_page: 1, per_page: 15, total: mockAdminSupportTickets.length, last_page: 1 } };
        } else if (url.includes('/admin/reports')) {
          mockData = mockAdminReports;
        } else if (url.includes('/booking-requests/my-requests')) {
          mockData = mockBookingRequests.myRequests;
        } else if (url.includes('/booking-requests/received')) {
          mockData = mockBookingRequests.receivedRequests;
        } else if (url.includes('/notifications')) {
          mockData = mockNotifications;
        } else if (url.includes('/support/tickets') && !url.match(/\/support\/tickets\/\d+$/)) {
          mockData = mockSupportTickets;
        } else if (url.includes('/support/tickets/')) {
          const ticketId = url.match(/\/support\/tickets\/(\d+)/)?.[1];
          mockData = mockSupportTickets.find(t => t.id === parseInt(ticketId)) || mockSupportTickets[0];
        } else if (url.includes('/reputation')) {
          mockData = mockProfileData.reputation;
        } else if (url.includes('/user') && !url.includes('/admin')) {
          mockData = mockProfileData.user;
        } else if (url.includes('/ratings')) {
          mockData = mockRatings;
        } else if (url.includes('/contracts/')) {
          const contractId = url.match(/\/contracts\/(\d+)/)?.[1];
          mockData = mockContracts.find(c => c.id === parseInt(contractId)) || mockContracts[0];
        } else if (url.includes('/property')) {
          mockData = [{ id: 1, name: 'Apartment' }, { id: 2, name: 'House' }, { id: 3, name: 'Studio' }];
        } else {
          // Default mock data
          mockData = { data: [], meta: { current_page: 1, per_page: 15, total: 0, last_page: 1 } };
        }
        
        return Promise.resolve({ data: mockData, status: 200 });
      }
      
      // For Figma mode (not /figma routes), handle auth errors
      if (FIGMA_MODE && error.response && (error.response.status === 401 || error.response.status === 403)) {
        if (error.config?.method === 'get') {
          console.log('[Figma Mode] Suppressed auth error, returning mock data:', error.config.url);
          return Promise.resolve({ data: null, status: 200 });
        }
        return Promise.reject(error);
      }
      
      // For non-auth errors, let them pass through
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
