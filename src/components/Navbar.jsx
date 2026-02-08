import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import AxiosClient from '../AxiosClient';

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const { user, token, isAdmin, setUser, setToken } = useUserContext();
  const { language, setLanguage, t } = useLanguage();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch unread notifications count
  useEffect(() => {
    if (user && token) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      // Reset count when user is not logged in
      setUnreadCount(0);
    }
  }, [user, token]);

  const fetchUnreadCount = () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    
    AxiosClient.get('/notifications/unread-count')
      .then((response) => {
        setUnreadCount(response.data.count || 0);
      })
      .catch((error) => {
        // Handle 401 (unauthorized) silently - token might be expired or invalid
        // The AxiosClient interceptor will handle clearing the token and localStorage
        // The auth:logout event listener will handle clearing the state
        // So we don't need to manually clear user/token here
        if (error.response && error.response.status === 401) {
          setUnreadCount(0);
          // Don't manually clear user/token here - let AxiosClient interceptor and event listener handle it
        } else if (error.response && error.response.status === 403) {
          // 403 might be account disabled, let the interceptor handle it
          setUnreadCount(0);
        } else {
          // Network errors or other issues - just reset count, don't log out user
          setUnreadCount(0);
          // Only log if it's a real error (not network issues)
          if (error.response) {
            console.error('Error fetching unread count:', error);
          }
        }
      });
  };

  // Listen for auth logout events from AxiosClient interceptor
  useEffect(() => {
    const handleLogout = () => {
      setToken(null);
      setUser(null);
      setUnreadCount(0);
    };
    
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [setToken, setUser]);

  const handleLogout = () => {
    AxiosClient.post('/logout')
      .then(() => {
        setUser(null);
        setToken(null);
        navigate('/');
        setProfileDropdown(false);
      })
      .catch((error) => {
        console.error('Error logging out:', error);
        // Still clear local storage even if API call fails
        setUser(null);
        setToken(null);
        navigate('/');
        setProfileDropdown(false);
      });
  };

  // useEffect(() => {
  //   AxiosClient.get('/user').then(({ data }) => {
  //     console.log(data);
  //     setUser(data);
  //   });
  // }, []);

  return (
    <div className="px-5 mx-auto max-w-[1366px] max-md:max-w-[640px] max-lg:max-w-[768px] max-xl:max-w-[1280px] dark:bg-gray-900">
      <nav className="flex justify-between items-center h-[100px] relative dark:bg-gray-900">
        <div className="left flex-1 flex items-center gap-12 max-md:gap-10">
          <Link
            className="logo flex items-center font-bold text-xl max-lg:text-lg gap-2.5 hover:scale-105 transition duration-300 eas dark:text-white"
            to="/"
          >
            <img src="/public/logo.png" alt="" className="w-7" />
            <span className="max-lg:hidden max-md:block">{t('navbar.siteName')}</span>
          </Link>
          {user && (
            <Link
              href="#"
              className={`hover:scale-105 transition duration-300 ease rounded-md max-md:hidden dark:text-gray-200 ${
                location.pathname === '/' ? 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900 px-3 py-1 font-bold rounded-md' : ''
              }`}
              to="/"
            >
              {t('navbar.home')}
            </Link>
          )}
          {!user && (
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="bg-yellow-300 dark:bg-yellow-400 hover:scale-105 px-4 py-2 rounded-md font-bold transition duration-300 ease text-[#444] dark:text-gray-900 flex items-center gap-2"
              title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
            >
              <span>🌐</span>
              <span>{language === 'en' ? 'عربي' : 'English'}</span>
            </button>
          )}
          {user && (
            <Link
              href="#"
              className={`hover:scale-105 transition duration-300 ease rounded-md max-md:hidden dark:text-gray-200 ${
                location.pathname === '/about' ? 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900 px-3 py-1 font-bold rounded-md' : ''
              }`}
              to="/about"
            >
              {t('navbar.about')}
            </Link>
          )}
          {user && (
            <Link
              to="/booking-requests"
              className={`hover:scale-105 transition duration-300 ease rounded-md max-md:hidden dark:text-gray-200 ${
                location.pathname === '/booking-requests' || location.pathname.startsWith('/contracts/') 
                  ? 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900 px-3 py-1 font-bold rounded-md' : ''
              }`}
            >
              {t('navbar.bookingRequests')}
            </Link>
          )}
          {user && (
            <Link
              to="/ratings"
              className={`hover:scale-105 transition duration-300 ease rounded-md max-md:hidden dark:text-gray-200 ${
                location.pathname === '/ratings' 
                  ? 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900 px-3 py-1 font-bold rounded-md' : ''
              }`}
            >
              {t('navbar.ratings') || 'Ratings'}
            </Link>
          )}
          {user && (
            <Link
              to="/support/tickets"
              className={`hover:scale-105 transition duration-300 ease rounded-md max-md:hidden dark:text-gray-200 ${
                location.pathname.startsWith('/support') 
                  ? 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900 px-3 py-1 font-bold rounded-md' : ''
              }`}
            >
              {t('support.tickets') || 'Support'}
            </Link>
          )}
          {user && isAdmin() && (
            <Link
              to="/admin/dashboard"
              className={`px-4 py-2 hover:scale-105 transition duration-300 ease rounded-md max-md:hidden font-bold ${
                location.pathname.startsWith('/admin') 
                  ? 'bg-yellow-400 dark:bg-yellow-500 text-[#444] dark:text-gray-900' : 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900'
              }`}
            >
              Admin
            </Link>
          )}
        </div>
        <div
          className={`right md:w-2/5 flex items-center md:justify-end lg:bg-[#fcf5f3] dark:lg:bg-gray-800 h-full relative
          ${user ? '' : 'gap-12'}`}
        >
          {user ? (
            <div className="flex items-center gap-2">
              {/* Notifications Button */}
              <Link
                to="/notifications"
                className={`hover:scale-105 transition duration-300 ease rounded-md max-md:hidden relative dark:text-gray-200 p-2 ${
                  location.pathname === '/notifications' 
                    ? 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-2xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative z-[9999]" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 hover:scale-105 transition duration-300 ease rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <img
                    src={user?.avatar || '/avatar.png'}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border-2 border-yellow-300 dark:border-yellow-400"
                  />
                  {user?.name && (
                    <span className="font-bold max-md:hidden dark:text-white text-sm">{user.name}</span>
                  )}
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 dark:text-gray-200 ${profileDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              
              {profileDropdown && (
                <div className={`absolute top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[10000] overflow-hidden ${
                  language === 'ar' ? 'left-0' : 'right-0'
                }`}>
                  <div className="py-1">
                    <Link
                      to="/user/profile"
                      onClick={() => setProfileDropdown(false)}
                      className={`block px-4 py-2 text-sm text-[#444] dark:text-gray-200 hover:bg-yellow-300 dark:hover:bg-yellow-600 transition duration-300 ease ${
                        language === 'ar' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {t('navbar.profile')}
                    </Link>
                    
                    {/* Settings Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={() => setSettingsOpen(!settingsOpen)}
                      className={`block w-full px-4 py-2 text-sm text-[#444] dark:text-gray-200 hover:bg-yellow-300 dark:hover:bg-yellow-600 transition duration-300 ease ${
                        language === 'ar' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{t('navbar.settings') || 'Settings'}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${settingsOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    
                    {/* Settings Submenu */}
                    {settingsOpen && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 pl-4 border-l-2 border-yellow-300 dark:border-yellow-400">
                        {/* Dark Mode Toggle */}
                        <button
                          onClick={toggleDarkMode}
                          className={`block w-full px-4 py-2 text-sm text-[#444] dark:text-gray-200 hover:bg-yellow-300 dark:hover:bg-yellow-600 transition duration-300 ease ${
                            language === 'ar' ? 'text-right' : 'text-left'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{t('navbar.darkMode') || 'Dark Mode'}</span>
                            <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
                          </div>
                        </button>
                        
                        {/* Language Toggle */}
                        <button
                          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                          className={`block w-full px-4 py-2 text-sm text-[#444] dark:text-gray-200 hover:bg-yellow-300 dark:hover:bg-yellow-600 transition duration-300 ease ${
                            language === 'ar' ? 'text-right' : 'text-left'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{t('navbar.language') || 'Language'}</span>
                            <span className="font-semibold">{language === 'en' ? 'عربي' : 'English'}</span>
                          </div>
                        </button>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    
                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className={`block w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition duration-300 ease ${
                        language === 'ar' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {t('navbar.logout')}
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          ) : (
            <>
              <Link
                href="#"
                className={`hover:scale-105 transition duration-300 ease rounded-md max-md:hidden dark:text-gray-200 ${
                  location.pathname === '/login' ? 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900 px-3 py-1 font-bold rounded-md' : ''
                }`}
                to="/login"
              >
                {t('navbar.login')}
              </Link>
              <Link
                href="#"
                className={`px-4 py-2 hover:scale-105 transition duration-300 ease rounded-md max-md:hidden font-bold dark:text-gray-200 ${
                  location.pathname === '/signup' 
                    ? 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900' 
                    : ''
                } ${
                  language === 'ar' ? 'ml-2' : 'mr-2'
                }`}
                to="/signup"
              >
                {t('navbar.signup')}
              </Link>
            </>
          )}

          <a href="#">
            <img
              src="/public/menu.png"
              alt=""
              className={`w-9 md:hidden relative z-50 ${
                language === 'ar' ? 'mr-4' : 'ml-4'
              }`}
              onClick={() => {
                setSidebar((pre) => !pre);
              }}
            />
          </a>
        </div>
        <div
          className={`menu bg-black flex flex-col justify-center items-center 
            absolute top-0 bottom-0 gap-6 transition-all duration-1000 md:hidden
            ${language === 'ar' ? 'left-0' : 'right-0'}
            ${sidebar ? 'max-md:w-1/2' : 'w-0 overflow-hidden'}`}
        >
          {/* <a
            href="#"
            className="absolute right-3 top-3 text-3xl text-white font-bold"
            onClick={() => setSidebar(false)}
          >
            X
          </a> */}
          <a href="" className="text-white">
            {t('navbar.home')}
          </a>
          {!user && (
            <button
              onClick={() => {
                setLanguage(language === 'en' ? 'ar' : 'en');
                setSidebar(false);
              }}
              className="text-white flex items-center gap-2"
            >
              <span>🌐</span>
              <span>{language === 'en' ? 'عربي' : 'English'}</span>
            </button>
          )}
          {user && (
            <a href="" className="text-white">
              {t('navbar.about')}
            </a>
          )}
          <a href="" className="text-white">
            {t('navbar.contact')}
          </a>
          <a href="" className="text-white">
            {t('navbar.agents')}
          </a>
          <a href="" className="text-white">
            {t('navbar.signIn')}
          </a>
          <a href="" className="text-white">
            {t('navbar.signup')}
          </a>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
