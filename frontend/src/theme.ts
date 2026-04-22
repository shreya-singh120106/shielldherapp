export const theme = {
  bg: '#0D0B14',
  bgDeep: '#07060C',
  glassBorder: 'rgba(255,255,255,0.10)',
  glassBorderStrong: 'rgba(255,255,255,0.16)',
  glassSurface: 'rgba(20,18,28,0.45)',
  glassSurfaceLight: 'rgba(255,255,255,0.04)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#5A5A6A',

  // Accents
  travel: '#00FF9C',
  travelDeep: '#00B85C',
  cyber: '#00E5FF',
  cyberDeep: '#0088FF',
  wellness: '#FF758F',
  wellnessDeep: '#FF4D6D',
  sos: '#FF3B30',
  sosDeep: '#FF1A1A',

  gradients: {
    travel: ['#00FF9C', '#00B85C'] as const,
    cyber: ['#00E5FF', '#0088FF'] as const,
    wellness: ['#FF9EB1', '#FF4D6D'] as const,
    sos: ['#FF6A5C', '#FF1A1A'] as const,
    dark: ['#131120', '#0D0B14'] as const,
    glow: ['rgba(255,117,143,0.35)', 'rgba(13,11,20,0)'] as const,
  },
};

export const radius = { sm: 12, md: 16, lg: 20, xl: 28, xxl: 36, pill: 999 };
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
