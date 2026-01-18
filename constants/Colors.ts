/**
 * Goalmax color constants
 * Primary color scheme is dark with green accents
 */

const goalmax = {
  bg: '#0a0a0b',
  surface: '#141416',
  border: '#27272a',
  muted: '#52525b',
  text: '#fafafa',
  textSecondary: '#a1a1aa',
  accent: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

export default {
  light: {
    text: goalmax.text,
    background: goalmax.bg,
    tint: goalmax.accent,
    tabIconDefault: goalmax.muted,
    tabIconSelected: goalmax.accent,
  },
  dark: {
    text: goalmax.text,
    background: goalmax.bg,
    tint: goalmax.accent,
    tabIconDefault: goalmax.muted,
    tabIconSelected: goalmax.accent,
  },
  goalmax,
};
