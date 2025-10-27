/**
 * Design Theme Configuration
 * 
 * A centralized design system for the KCET College Predictor
 * Provides consistent colors, typography, spacing, and styling throughout the app
 */

export const theme = {
  // Color Palette - Modern, professional gradients
  colors: {
    // Primary - Deep Blue to Purple gradient
    primary: {
      main: '#4F46E5',      // Indigo
      light: '#6366F1',     // Lighter Indigo
      dark: '#4338CA',      // Darker Indigo
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      gradientAlt: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    },
    
    // Secondary - Vibrant Purple to Pink
    secondary: {
      main: '#EC4899',      // Pink
      light: '#F472B6',     // Light Pink
      dark: '#DB2777',      // Dark Pink
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    
    // Accent - Teal/Cyan
    accent: {
      main: '#06B6D4',      // Cyan
      light: '#22D3EE',     // Light Cyan
      dark: '#0891B2',      // Dark Cyan
      gradient: 'linear-gradient(135deg, #13B0F5 0%, #00E4D0 100%)',
    },
    
    // Success, Warning, Error, Info
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      bg: '#D1FAE5',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      bg: '#FEF3C7',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      bg: '#FEE2E2',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      bg: '#DBEAFE',
    },
    
    // Neutrals - Clean grays
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    
    // Background colors
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
      dark: '#111827',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      mesh: 'radial-gradient(at 40% 20%, hsla(267,79%,62%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.15) 0px, transparent 50%)',
    },
    
    // Text colors
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    
    // Border colors
    border: {
      light: '#E5E7EB',
      main: '#D1D5DB',
      dark: '#9CA3AF',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      heading: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'Fira Code', 'Courier New', monospace",
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing (multiples of 4px)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(79, 70, 229, 0.3)',
    glowPink: '0 0 20px rgba(236, 72, 153, 0.3)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  
  // Breakpoints
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
};

export type Theme = typeof theme;

// Helper function to create glass morphism effect
export const glassMorphism = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
};

// Helper function for card styles
export const cardStyles = {
  background: theme.colors.background.paper,
  borderRadius: theme.borderRadius.lg,
  boxShadow: theme.shadows.md,
  transition: theme.transitions.base,
  border: `1px solid ${theme.colors.border.light}`,
};

// Hover card effect
export const hoverCardEffect = {
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows.xl,
    borderColor: theme.colors.primary.light,
  },
};

export default theme;
