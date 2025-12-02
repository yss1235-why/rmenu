import { createContext, useContext } from 'react';
import { ThemeConfig, defaultTheme } from './config';

export * from './config';

// Theme Context
interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  isDark: boolean;
  toggleDark: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  setTheme: () => {},
  isDark: false,
  toggleDark: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Generate CSS variables from theme config
export const generateCSSVariables = (theme: ThemeConfig, isDark: boolean): string => {
  const colors = isDark ? theme.colors.dark : theme.colors.light;

  return `
    :root {
      --background: ${colors.background};
      --foreground: ${colors.foreground};
      --card: ${colors.card};
      --card-foreground: ${colors.cardForeground};
      --popover: ${colors.card};
      --popover-foreground: ${colors.cardForeground};
      --primary: ${colors.primary};
      --primary-foreground: ${colors.primaryForeground};
      --secondary: ${colors.secondary};
      --secondary-foreground: ${colors.secondaryForeground};
      --muted: ${colors.muted};
      --muted-foreground: ${colors.mutedForeground};
      --accent: ${colors.accent};
      --accent-foreground: ${colors.accentForeground};
      --destructive: ${colors.destructive};
      --destructive-foreground: ${colors.destructiveForeground};
      --border: ${colors.border};
      --input: ${colors.input};
      --ring: ${colors.ring};
      --radius: ${theme.borderRadius.lg};
      --font-sans: ${theme.typography.fontFamily.sans};
      --font-serif: ${theme.typography.fontFamily.serif};
      --font-mono: ${theme.typography.fontFamily.mono};
      --splash-bg: ${theme.splash.backgroundColor};
      --splash-text: ${theme.splash.textColor};
    }
  `;
};
