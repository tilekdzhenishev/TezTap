import { color, space, radius, fontSize, fontWeight, shadow } from './tokens';

export const theme = {
  colors: {
    background: color.ink900,
    surface: color.ink800,
    card: color.ink700,
    cardBorder: color.ink600,
    primary: color.blue400,
    primaryDark: color.blue500,
    primaryLight: color.blue300,
    success: color.green400,
    danger: color.red400,
    admin: color.amber400,
    text: color.slate100,
    textSecondary: color.slate400,
    textMuted: color.slate500,
    overlay: 'rgba(0,0,0,0.75)',
  },
  spacing: {
    xs: space[1],
    sm: space[2],
    md: space[4],
    lg: space[6],
    xl: space[8],
    xxl: space[12],
  },
  borderRadius: radius,
  typography: {
    h1: { fontSize: fontSize['5xl'], fontWeight: fontWeight.extrabold, letterSpacing: -1 },
    h2: { fontSize: fontSize['4xl'], fontWeight: fontWeight.extrabold, letterSpacing: -0.5 },
    h3: { fontSize: fontSize['3xl'], fontWeight: fontWeight.bold },
    h4: { fontSize: fontSize['2xl'], fontWeight: fontWeight.semibold },
    body: { fontSize: fontSize.lg, fontWeight: fontWeight.regular },
    bodySmall: { fontSize: fontSize.md, fontWeight: fontWeight.regular },
    caption: { fontSize: fontSize.sm, fontWeight: fontWeight.regular },
    label: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: 0.8 },
    button: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
  },
  shadow,
} as const;

export type Theme = typeof theme;
