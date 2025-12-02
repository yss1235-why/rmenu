import { useState, useEffect, ReactNode } from 'react';
import { ThemeContext, ThemeConfig, defaultTheme, generateCSSVariables } from './index';

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeConfig;
}

export const ThemeProvider = ({ children, initialTheme }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme || defaultTheme);
  const [isDark, setIsDark] = useState(false);

  // Check for system dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply CSS variables when theme or dark mode changes
  useEffect(() => {
    const styleId = 'theme-variables';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = generateCSSVariables(theme, isDark);

    // Toggle dark class on document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, isDark]);

  const toggleDark = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
