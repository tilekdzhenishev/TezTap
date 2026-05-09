import { Dimensions, StyleSheet } from 'react-native';
import { color, radius, fontSize, fontWeight } from '../../design/tokens';

export const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.ink950,
  },

  // ── Ambient orbs ──────────────────────────────────────
  orb: {
    position: 'absolute',
    borderRadius: radius.full,
  },
  orbTopLeft: {
    width: 380,
    height: 380,
    backgroundColor: color.blue400,
    opacity: 0.025,
    top: -120,
    left: -100,
  },
  orbBottomRight: {
    width: 320,
    height: 320,
    backgroundColor: color.blue500,
    opacity: 0.025,
    bottom: -60,
    right: -80,
  },
  orbCenter: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: color.blue700,
    opacity: 0.015,
  },

  // ── Grid overlay ──────────────────────────────────────
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: color.blue400,
    opacity: 0.04,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: color.blue400,
    opacity: 0.04,
  },

  // ── Layout ────────────────────────────────────────────
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 28,
    zIndex: 1,
  },

  // ── Hero ──────────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: height * 0.3,
  },
  logoImage: {
    width: 238,
    height: 238,
    resizeMode: 'contain',
  },

  // ── Headline ──────────────────────────────────────────
  headlineSection: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headlineMain: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.extrabold,
    color: color.white,
    lineHeight: 46,
    letterSpacing: -1,
    textAlign: 'center',
  },
  headlineAccent: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.extrabold,
    color: color.blue400,
    lineHeight: 46,
    letterSpacing: -1,
    marginBottom: 16,
    textAlign: 'center',
  },
  headlineSub: {
    fontSize: fontSize.base,
    color: color.slate500,
    lineHeight: 23,
    textAlign: 'center',
  },

  // ── Buttons ───────────────────────────────────────────
  buttonSection: {
    gap: 0,
  },
  buttonGap: {
    height: 20,
  },

  // ── Footer ────────────────────────────────────────────
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
    color: color.slate700,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: color.slate600,
    textDecorationLine: 'underline',
  },
  adminDot: {
    marginTop: 14,
    alignSelf: 'center',
  },
  adminDotText: {
    fontSize: 10,
    color: color.slate800,
    letterSpacing: 5,
  },
});
