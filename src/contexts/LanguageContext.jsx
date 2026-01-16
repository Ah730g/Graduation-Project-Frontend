import { createContext, useState, useContext, useEffect } from 'react';
import translations from '../translations.js';

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  translateRole: (role) => role,
  translateStatus: (status) => status,
});

export default function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(
    localStorage.getItem('language') || 'en'
  );

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Update document direction for RTL support
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    // Set initial direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Translation function
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  // Helper function to translate role
  const translateRole = (role) => {
    return t(`admin.roles.${role}`) || role;
  };

  // Helper function to translate status
  const translateStatus = (status) => {
    return t(`admin.statuses.${status}`) || status;
  };

  const values = {
    language,
    setLanguage,
    t,
    translateRole,
    translateStatus,
  };

  return (
    <LanguageContext.Provider value={values}>{children}</LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

