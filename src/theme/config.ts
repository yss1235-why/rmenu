// Theme Configuration
// This file controls the entire look and feel of the restaurant app
// Edit values here to completely transform the design

export interface ThemeConfig {
  // Restaurant Identity
  restaurant: {
    name: string;
    tagline: string;
    logo?: string;
  };

  // Color Scheme
  colors: {
    // Light mode
    light: {
      primary: string;
      primaryForeground: string;
      secondary: string;
      secondaryForeground: string;
      background: string;
      foreground: string;
      card: string;
      cardForeground: string;
      muted: string;
      mutedForeground: string;
      accent: string;
      accentForeground: string;
      destructive: string;
      destructiveForeground: string;
      border: string;
      input: string;
      ring: string;
      // Status colors
      success: string;
      successForeground: string;
      warning: string;
      warningForeground: string;
      info: string;
      infoForeground: string;
    };
    // Dark mode
    dark: {
      primary: string;
      primaryForeground: string;
      secondary: string;
      secondaryForeground: string;
      background: string;
      foreground: string;
      card: string;
      cardForeground: string;
      muted: string;
      mutedForeground: string;
      accent: string;
      accentForeground: string;
      destructive: string;
      destructiveForeground: string;
      border: string;
      input: string;
      ring: string;
      // Status colors
      success: string;
      successForeground: string;
      warning: string;
      warningForeground: string;
      info: string;
      infoForeground: string;
    };
  };
  // Typography
  typography: {
    fontFamily: {
      sans: string;
      serif: string;
      mono: string;
    };
    fontSizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
  };

  // Border Radius
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };

  // Shadows
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  // Animation durations
  animations: {
    fast: string;
    normal: string;
    slow: string;
  };

  // Layout
  layout: {
    maxWidth: string;
    headerHeight: string;
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };

  // Splash Screen
  splash: {
    backgroundColor: string;
    textColor: string;
    duration: number; // in milliseconds
  };
}

// Default theme - Elegant Modern Restaurant
export const defaultTheme: ThemeConfig = {
  restaurant: {
    name: 'Flavor Haven',
    tagline: 'Digital Menu',
    logo: undefined,
  },

  colors: {
    light: {
      primary: '243 75% 58%',
      primaryForeground: '225 100% 96%',
      secondary: '0 0% 32%',
      secondaryForeground: '0 0% 98%',
      background: '0 0% 96%',
      foreground: '0 0% 9%',
      card: '0 0% 98%',
      cardForeground: '0 0% 9%',
      muted: '0 0% 63%',
      mutedForeground: '0 0% 9%',
      accent: '250 100% 97%',
      accentForeground: '258 89% 66%',
      destructive: '0 72% 50%',
      destructiveForeground: '0 85% 97%',
      border: '0 0% 83%',
      input: '0 0% 83%',
      ring: '243 75% 58%',
      // Status colors
      success: '142 76% 36%',
      successForeground: '142 76% 97%',
      warning: '38 92% 50%',
      warningForeground: '38 92% 97%',
      info: '217 91% 60%',
      infoForeground: '217 91% 97%',
    },
    dark: {
    dark: {
      primary: '234 89% 73%',
      primaryForeground: '243 47% 20%',
      secondary: '0 0% 45%',
      secondaryForeground: '0 0% 98%',
      background: '0 0% 9%',
      foreground: '0 0% 98%',
      card: '0 0% 14%',
      cardForeground: '0 0% 98%',
      muted: '0 0% 45%',
      mutedForeground: '0 0% 98%',
      accent: '261 72% 22%',
      accentForeground: '255 91% 76%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 85% 97%',
      border: '0 0% 32%',
      input: '0 0% 32%',
     ring: '234 89% 73%',
      // Status colors
      success: '142 71% 45%',
      successForeground: '142 76% 10%',
      warning: '38 92% 50%',
      warningForeground: '38 92% 10%',
      info: '217 91% 65%',
      infoForeground: '217 91% 10%',
    },
  },

  typography: {
    fontFamily: {
      sans: "'Lato', ui-sans-serif, system-ui, sans-serif",
      serif: "'EB Garamond', ui-serif, Georgia, serif",
      mono: "'Fira Code', ui-monospace, monospace",
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },

  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },

  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  layout: {
    maxWidth: '1280px',
    headerHeight: '4rem',
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
  },

  splash: {
    backgroundColor: '243 75% 58%',
    textColor: '225 100% 96%',
    duration: 2000,
  },
};

// Alternative themes for different restaurant styles

export const rusticTheme: ThemeConfig = {
  ...defaultTheme,
  restaurant: {
    name: 'The Rustic Table',
    tagline: 'Farm to Fork',
  },
  colors: {
    light: {
      ...defaultTheme.colors.light,
      primary: '24 70% 45%',
      primaryForeground: '36 45% 95%',
      background: '36 33% 94%',
      card: '36 33% 97%',
      accent: '142 40% 40%',
      accentForeground: '142 40% 95%',
      // Rustic-themed status colors
      success: '142 50% 35%',
      successForeground: '142 50% 95%',
      warning: '30 80% 45%',
      warningForeground: '30 80% 95%',
      info: '200 60% 45%',
      infoForeground: '200 60% 95%',
    },
    dark: {
      ...defaultTheme.colors.dark,
      primary: '24 70% 55%',
      primaryForeground: '24 30% 10%',
      background: '24 10% 10%',
      card: '24 10% 15%',
      // Rustic-themed status colors (dark)
      success: '142 50% 45%',
      successForeground: '142 50% 10%',
      warning: '30 80% 50%',
      warningForeground: '30 80% 10%',
      info: '200 60% 55%',
      infoForeground: '200 60% 10%',
    },
  },
  typography: {
    ...defaultTheme.typography,
    fontFamily: {
      sans: "'Crimson Text', Georgia, serif",
      serif: "'Playfair Display', Georgia, serif",
      mono: "'Courier New', monospace",
    },
  },
  splash: {
    backgroundColor: '24 70% 45%',
    textColor: '36 45% 95%',
    duration: 2000,
  },
};

export const modernMinimalTheme: ThemeConfig = {
  ...defaultTheme,
  restaurant: {
    name: 'NOIR',
    tagline: 'Contemporary Cuisine',
  },
  colors: {
    light: {
      ...defaultTheme.colors.light,
      primary: '0 0% 9%',
      primaryForeground: '0 0% 98%',
      background: '0 0% 100%',
      card: '0 0% 98%',
      accent: '0 0% 90%',
      accentForeground: '0 0% 9%',
      border: '0 0% 90%',
      // Minimal monochrome status colors
      success: '160 10% 40%',
      successForeground: '160 10% 98%',
      warning: '40 10% 50%',
      warningForeground: '40 10% 98%',
      info: '210 10% 50%',
      infoForeground: '210 10% 98%',
    },
    dark: {
      ...defaultTheme.colors.dark,
      primary: '0 0% 98%',
      primaryForeground: '0 0% 9%',
      background: '0 0% 5%',
      card: '0 0% 10%',
      // Minimal monochrome status colors (dark)
      success: '160 10% 60%',
      successForeground: '160 10% 10%',
      warning: '40 10% 60%',
      warningForeground: '40 10% 10%',
      info: '210 10% 60%',
      infoForeground: '210 10% 10%',
    },
  },
  typography: {
    ...defaultTheme.typography,
    fontFamily: {
      sans: "'Helvetica Neue', Arial, sans-serif",
      serif: "'Cormorant Garamond', Georgia, serif",
      mono: "'SF Mono', monospace",
    },
  },
  borderRadius: {
    sm: '0',
    md: '0',
    lg: '0',
    xl: '0',
    full: '9999px',
  },
  splash: {
    backgroundColor: '0 0% 5%',
    textColor: '0 0% 98%',
    duration: 1500,
  },
};
