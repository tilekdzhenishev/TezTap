// Design tokens — raw primitive values, no semantic meaning here.
// Import these into theme.ts to build the semantic layer.

export const color = {
  // Blue scale
  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  // Slate scale
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  // Dark ink palette
  ink950: '#080D18',
  ink900: '#0B0F1A',
  ink800: '#111827',
  ink700: '#1C2333',
  ink600: '#2D3748',
  // Semantic accents
  green400: '#10B981',
  red400: '#F87171',
  amber400: '#FBBF24',
  // Absolute
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  base: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

export const shadow = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: (glowColor: string) => ({
    shadowColor: glowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  }),
} as const;
