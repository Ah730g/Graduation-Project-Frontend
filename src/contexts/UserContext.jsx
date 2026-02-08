import { createContext, useState, useContext, useEffect } from "react";
import AxiosClient from "../AxiosClient";

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
  
  const [user, _setUser] = useState(getUserFromStorage());
  const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const [message, _setMessage] = useState(null);
  const [messageStatus, setMessageStatus] = useState(null);
  const setUser = (user) => {
    _setUser(user);
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  };
  const setMessage = (message) => {
    _setMessage(message);
    setTimeout(() => {
      _setMessage(null);
    }, 5000);
  };
  const setToken = (token) => {
    if (!token) localStorage.removeItem("ACCESS_TOKEN");
    else localStorage.setItem("ACCESS_TOKEN", token);

    _setToken(token);
  };
  const isAdmin = () => {
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

  const refreshUser = async () => {
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
