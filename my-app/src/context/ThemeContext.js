import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('oms_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    return 'dark'; // Dark mode by default
  });

  useEffect(() => {
    try {
      localStorage.setItem('oms_theme', theme);
    } catch (e) {
      // Ignore localStorage errors
    }

    // Apply attributes and classes to html and body
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute('data-theme', theme);
    body.setAttribute('data-theme', theme);

    if (theme === 'light') {
      root.classList.remove('theme-dark');
      root.classList.add('theme-light');
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
      root.style.colorScheme = 'light';
    } else {
      root.classList.remove('theme-light');
      root.classList.add('theme-dark');
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
      root.style.colorScheme = 'dark';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
