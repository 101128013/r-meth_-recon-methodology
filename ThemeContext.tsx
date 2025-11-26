import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  dark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ dark: true, toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('rmeth:theme');
      if (saved !== null) return saved === 'dark';
    } catch (e) {
      // localStorage may be unavailable in some contexts
    }
    // default to dark
    return true;
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (dark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('rmeth:theme', dark ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to set theme', e);
    }
  }, [dark]);

  const toggle = () => setDark((s) => !s);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};
