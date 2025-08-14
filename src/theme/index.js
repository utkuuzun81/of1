import { createTheme } from '@mui/material/styles';

const base = {
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h6: { fontWeight: 700 },
  },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 20 } } },
    MuiLinearProgress: { styleOverrides: { bar: { borderRadius: 4 } } },
  },
};

const palettes = {
  light: {
    mode: 'light',
    primary: { main: '#dc2626' },
    secondary: { main: '#7f1d1d' },
    warning: { main: '#f59e0b' },
    background: { default: '#fafafa', paper: '#ffffff' },
    text: { primary: '#111827' },
  },
  dark: {
    mode: 'dark',
    primary: { main: '#f87171' },
    secondary: { main: '#7f1d1d' },
    warning: { main: '#fbbf24' },
    background: { default: '#0b0f17', paper: '#0f172a' },
    text: { primary: '#e5e7eb' },
  },
};

export function getTheme(mode = 'light') {
  if (mode === 'system') {
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    mode = prefersDark ? 'dark' : 'light';
  }
  return createTheme({ palette: palettes[mode] || palettes.light, ...base });
}
