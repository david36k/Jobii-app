// Jobii design tokens - single source of truth for colors and glassmorphism
const tintColorLight = '#4F46E5';

// Semantic tokens
export const colors = {
  // Primary / accent (indigo)
  primary: '#4F46E5',
  primaryLight: '#6366F1',
  // Success / work mode (emerald)
  success: '#10B981',
  successDark: '#059669',
  successDarker: '#047857',
  // Warning / credits (amber)
  warning: '#F59E0B',
  warningDark: '#D97706',
  amber: '#FBBF24',
  // Error / danger
  error: '#DC2626',
  errorLight: '#EF4444',
  errorBg: 'rgba(239, 68, 68, 0.05)',
  errorBorder: 'rgba(239, 68, 68, 0.2)',
  whiteOverlay: 'rgba(255, 255, 255, 0.2)',
  whiteOverlay90: 'rgba(255, 255, 255, 0.9)',
  // Neutrals
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  borderLight: '#D1D5DB',
  borderLighter: '#F3F4F6',
  background: '#FFFFFF',
  backgroundAlt: '#F9FAFB',
  muted: '#9CA3AF',
  // Archive / purple
  archivePrimary: '#7C3AED',
  archiveDark: '#6D28D9',
  archiveLight: '#A78BFA',
  // Glassmorphism
  glassBackground: 'rgba(255, 255, 255, 0.7)',
  glassBackgroundStrong: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(0, 0, 0, 0.05)',
  // Overlays
  overlayScrim: 'rgba(0, 0, 0, 0.35)',
  // Blue (e.g. status open)
  blue: '#3B82F6',
  // Screen gradient stops (light mode)
  gradientWorkStart: '#ECFDF5',
  gradientWorkMid: '#F0FDF4',
  gradientHireStart: '#EEF2FF',
  gradientHireMid: '#F8FAFC',
  gradientLoginStart: '#EEF2FF',
  gradientLoginMid: '#FEFCE8',
  // Overlays / tints
  creditsButtonBg: 'rgba(251, 191, 36, 0.1)',
  creditsButtonBorder: 'rgba(251, 191, 36, 0.3)',
  statIconSecondaryBg: 'rgba(16, 185, 129, 0.15)',
  whiteTint30: 'rgba(255, 255, 255, 0.3)',
  whiteTint20: 'rgba(255, 255, 255, 0.2)',
  whiteOnAccent: 'rgba(255, 255, 255, 0.9)',
  shadow: '#000000',
  // Status badge backgrounds (work invites)
  statusPendingBg: 'rgba(251, 191, 36, 0.15)',
  statusAcceptedBg: 'rgba(16, 185, 129, 0.15)',
  statusRejectedBg: 'rgba(239, 68, 68, 0.15)',
  statusMutedBg: 'rgba(156, 163, 175, 0.15)',
} as const;

// Legacy light theme (kept for existing imports)
export default {
  light: {
    tint: tintColorLight,
    tabIconDefault: colors.muted,
    tabIconSelected: colors.primary,
    ...colors,
  },
};
