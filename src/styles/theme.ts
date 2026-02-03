export const theme = {
  colors: {
    // Background colors
    bgPrimary: '#0a1628',
    bgSecondary: '#0f2444',
    bgTertiary: '#1a3a5c',
    bgCard: 'linear-gradient(135deg, #0d1f3c 0%, #1a3a5c 50%, #0d1f3c 100%)',

    // Accent colors
    primary: '#4facfe',
    primaryGlow: '#00f2fe',
    secondary: '#667eea',

    // Status colors
    success: '#00d26a',
    warning: '#ffc107',
    error: '#ff4757',
    info: '#17a2b8',

    // Priority colors
    priorityLow: '#4facfe',
    priorityMedium: '#ffc107',
    priorityHigh: '#ff6b35',
    priorityUrgent: '#ff4757',

    // Text colors
    textPrimary: '#ffffff',
    textSecondary: '#a0c4ff',
    textMuted: '#6b8cae',

    // Border colors
    border: '#2d5a87',
    borderGlow: '#4facfe',
  },

  fonts: {
    heading: "'Cinzel', serif",
    body: "'Rajdhani', sans-serif",
  },

  shadows: {
    glow: '0 0 20px rgba(79, 172, 254, 0.3)',
    glowStrong: '0 0 40px rgba(79, 172, 254, 0.5)',
    card: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '20px',
  },
};

export type Theme = typeof theme;
