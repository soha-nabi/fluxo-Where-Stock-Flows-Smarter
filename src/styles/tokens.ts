// Apple-level Design System Tokens for FLUXO

export const TYPOGRAPHY = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
    display: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"SF Mono", ui-monospace, Menlo, Monaco, Consolas, monospace',
  },
  fontSize: {
    h1Hero: '56px',
    h1Display: '48px',
    h2Heading: '40px',
    h3Title: '32px',
    h4Sub: '24px',
    body: '16px',
    small: '14px',
    xs: '12px',
  },
  lineHeight: {
    headline: 1.2,
    body: 1.5,
  },
  letterSpacing: {
    headline: '-0.02em',
    normal: '0em',
  },
} as const;

export const COLORS = {
  primary: '#7C3AED',       // Deep Purple / Violet
  primaryLight: '#8B5CF6',
  primaryDark: '#5B21B6',
  accent: '#06B6D4',        // Cyan / Teal
  success: '#10B981',       // Emerald Green
  warning: '#F59E0B',       // Amber
  danger: '#EF4444',        // Red
  info: '#3B82F6',          // Blue
  background: '#090A10',
  surfaceCard: 'rgba(18, 20, 34, 0.75)',
  surfaceGlass: 'rgba(31, 41, 55, 0.5)',
  borderSubtle: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#FFFFFF',
  textSecondary: '#E5E7EB',
  textMuted: '#9CA3AF',
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
} as const;

export const SHADOWS = {
  subtle: '0 1px 3px rgba(0,0,0,0.1)',
  medium: '0 4px 12px rgba(0,0,0,0.15)',
  elevated: '0 12px 32px rgba(0,0,0,0.2)',
  glowPrimary: '0 0 24px rgba(124, 58, 237, 0.4)',
  glowCyan: '0 0 24px rgba(6, 182, 212, 0.4)',
} as const;

export const RADIUS = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
} as const;

export const TRANSITIONS = {
  default: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
