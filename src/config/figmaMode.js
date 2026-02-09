/**
 * Figma Mode Configuration
 * Enable this mode to allow Web-to-Figma plugins to access protected pages
 * Set VITE_FIGMA_MODE=true in .env file
 */

export const FIGMA_MODE = import.meta.env.VITE_FIGMA_MODE === 'true';

// Mock user data for regular users
export const MOCK_USER = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  role: "user",
  status: "active",
  avatar: null,
  phone: "+1234567890",
  identity_status: "approved"
};

// Mock admin user data
export const MOCK_ADMIN = {
  id: 2,
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
  status: "active",
  avatar: null,
  phone: "+1234567890",
  identity_status: "approved"
};

// Mock token for authentication
export const MOCK_TOKEN = "mock_token_for_figma_preview";

/**
 * Get appropriate mock user based on current route
 */
export const getMockUser = () => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      return MOCK_ADMIN;
    }
  }
  return MOCK_USER;
};
