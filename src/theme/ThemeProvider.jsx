import React, { createContext, useContext, useEffect, useState } from 'react';
import { lightTheme, darkTheme, typography, spacing, shadows, radius, breakpoints, animations, zIndex } from './index';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const theme = isDarkMode ? darkTheme : lightTheme;
    const root = document.documentElement;

    // Apply colors
    Object.entries(theme).forEach(([key, value]) => {
      // CamelCase to kebab-case for CSS variables
      const cssKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });

    // Apply typography
    root.style.setProperty('--font-primary', typography.fontPrimary);
    Object.entries(typography.size).forEach(([key, value]) => root.style.setProperty(`--font-size-${key}`, value));
    
    // Apply spacing
    Object.entries(spacing).forEach(([key, value]) => root.style.setProperty(`--spacing-${key}`, value));
    
    // Apply radius
    Object.entries(radius).forEach(([key, value]) => root.style.setProperty(`--radius-${key}`, value));
    
    // Apply shadows
    Object.entries(shadows).forEach(([key, value]) => root.style.setProperty(`--shadow-${key}`, value));

    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme: isDarkMode ? darkTheme : lightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
