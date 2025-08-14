import { createTheme } from '@mui/material';

const neoPalette = {
  primary: { main: '#ef4444' },
  secondary: { main: '#7f1d1d' },
  background: { default: '#0f1b2b', paper: '#17253a' },
  text: { primary: '#e5e7eb', secondary: '#9ca3af' }
};

const neoTheme = createTheme({
  palette: neoPalette,
  shape: { borderRadius: 16 },
  typography: { fontWeightBold: 800 }
});

export default neoTheme;
