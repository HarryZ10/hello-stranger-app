// Theme constants for the app
export const theme = {
  colors: {
    // Primary colors
    primary: '#6366f1',
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',

    // Secondary colors
    secondary: '#ec4899',
    secondaryLight: '#f472b6',

    // Accent colors
    accent: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',

    // Neutral colors
    white: '#ffffff',
    black: '#000000',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },

    // Background colors
    background: {
      light: '#ffffff',
      dark: '#0f0f0f',
    },

    // Card colors
    card: {
      light: '#ffffff',
      dark: '#1a1a1a',
    },

    // Text colors
    text: {
      light: '#111827',
      dark: '#f9fafb',
      muted: {
        light: '#6b7280',
        dark: '#9ca3af',
      },
    },

    // Border colors
    border: {
      light: '#e5e7eb',
      dark: '#374151',
    },

    // Activity category colors
    categories: {
      sports: '#ef4444',
      food: '#f97316',
      outdoor: '#22c55e',
      social: '#3b82f6',
      games: '#8b5cf6',
      arts: '#ec4899',
      learning: '#06b6d4',
      tech: '#6366f1',
      music: '#a855f7',
      movies: '#f43f5e',
      wellness: '#14b8a6',
      pets: '#eab308',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

export type Theme = typeof theme;
export default theme;
