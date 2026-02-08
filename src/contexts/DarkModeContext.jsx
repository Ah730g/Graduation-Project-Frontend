import { createContext, useState, useContext, useEffect } from 'react';

const DarkModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

export default function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const values = {
    darkMode,
    toggleDarkMode,
  };

  return (
    <DarkModeContext.Provider value={values}>{children}</DarkModeContext.Provider>
  );
}

export const useDarkMode = () => useContext(DarkModeContext);

