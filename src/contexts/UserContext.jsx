import { createContext, useState, useContext, useEffect } from "react";
import AxiosClient from "../AxiosClient";
import { FIGMA_MODE, getMockUser } from "../config/figmaMode";
import { isFigmaRoute } from "../Lib/figmaMockData";

const userContext = createContext({
  user: null,
  setUser: () => {},
  token: null,
  setToken: () => {},
  message: null,
  setMessage: () => {},
  messageStatus: null,
  setMessageStatus: () => {},
  isAdmin: () => false,
});

export default function UserContextProvider({ children }) {
  // Safely parse user from localStorage
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem("user");
      return null;
    }
  };
  
  // In Figma mode or on /figma routes, use mock data; otherwise use stored data
  const getInitialUser = () => {
    if (FIGMA_MODE || isFigmaRoute()) {
      return getMockUser();
    }
    return getUserFromStorage();
  };
  
  const getInitialToken = () => {
    if (FIGMA_MODE || isFigmaRoute()) {
      return "mock_token_for_figma_preview";
    }
    return localStorage.getItem("ACCESS_TOKEN");
  };
  
  const [user, _setUser] = useState(getInitialUser());
  const [token, _setToken] = useState(getInitialToken());
  const [message, _setMessage] = useState(null);
  const [messageStatus, setMessageStatus] = useState(null);
  const setUser = (user) => {
    _setUser(user);
    // Don't save to localStorage in Figma mode or on /figma routes
    if (!FIGMA_MODE && !isFigmaRoute()) {
      if (user) localStorage.setItem("user", JSON.stringify(user));
      else localStorage.removeItem("user");
    }
  };
  const setMessage = (message) => {
    _setMessage(message);
    setTimeout(() => {
      _setMessage(null);
    }, 5000);
  };
  const setToken = (token) => {
    // Don't save to localStorage in Figma mode or on /figma routes
    if (!FIGMA_MODE && !isFigmaRoute()) {
      if (!token) localStorage.removeItem("ACCESS_TOKEN");
      else localStorage.setItem("ACCESS_TOKEN", token);
    }

    _setToken(token);
  };
  const isAdmin = () => {
    if (FIGMA_MODE || isFigmaRoute()) {
      // In Figma mode or on /figma routes, check if we're on admin routes
      if (typeof window !== 'undefined') {
        return window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/figma/admin');
      }
      return user && user.role === "admin";
    }
    return user && user.role === "admin";
  };
  // Listen for auth logout events from AxiosClient interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      _setUser(null);
      _setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("ACCESS_TOKEN");
    };
    
    const handleAuthDisabled = (event) => {
      _setUser(null);
      _setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("ACCESS_TOKEN");
      if (event.detail?.message) {
        setMessage(event.detail.message, 'error');
      }
    };
    
    window.addEventListener('auth:logout', handleAuthLogout);
    window.addEventListener('auth:disabled', handleAuthDisabled);
    
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
      window.removeEventListener('auth:disabled', handleAuthDisabled);
    };
  }, []);
  
  // Initialize and update user in Figma mode or on /figma routes based on route
  useEffect(() => {
    if (FIGMA_MODE || isFigmaRoute()) {
      const mockUser = getMockUser();
      // Update user if route changed (admin vs user) or if user is not set
      const isAdminRoute = typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/figma/admin'));
      const shouldBeAdmin = isAdminRoute && mockUser.role === 'admin';
      const shouldBeUser = !isAdminRoute && mockUser.role !== 'admin';
      
      if (!user || shouldBeAdmin || shouldBeUser || user.role !== mockUser.role) {
        _setUser(mockUser);
        _setToken("mock_token_for_figma_preview");
      }
    }
  }, [FIGMA_MODE]);

  // Listen to route changes in Figma mode or on /figma routes
  useEffect(() => {
    if ((FIGMA_MODE || isFigmaRoute()) && typeof window !== 'undefined') {
      const handleRouteChange = () => {
        const mockUser = getMockUser();
        if (user?.role !== mockUser.role) {
          _setUser(mockUser);
        }
      };
      
      // Listen to popstate (back/forward navigation)
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [FIGMA_MODE, user]);

  const refreshUser = async () => {
    // In Figma mode or on /figma routes, don't make API calls
    if (FIGMA_MODE || isFigmaRoute()) {
      const mockUser = getMockUser();
      setUser(mockUser);
      return;
    }
    
    if (token) {
      try {
        const response = await AxiosClient.get("/user");
        if (response.data) {
          // Check if user account is disabled
          if (response.data.status === 'disabled') {
            setUser(null);
            setToken(null);
            setMessage('Your account has been disabled. Please contact support.', 'error');
            // Redirect to login page
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            return;
          }
          setUser(response.data);
        }
      } catch (error) {
        console.error("Error refreshing user:", error);
        // If error is 403 with disabled status, handle it
        if (error.response?.status === 403 && error.response?.data?.status === 'disabled') {
          setUser(null);
          setToken(null);
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }
  };
  
  const values = {
    user,
    setUser,
    token,
    setToken,
    message,
    setMessage,
    messageStatus,
    setMessageStatus,
    isAdmin,
    refreshUser,
  };
  return <userContext.Provider value={values}>{children}</userContext.Provider>;
}

export const useUserContext = () => useContext(userContext);
