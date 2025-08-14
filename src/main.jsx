import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/globals.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getTheme } from './theme';

function readMode() {
  return localStorage.getItem('ui.theme') || 'light';
}

function ThemeRoot({ children }){
  const [mode, setMode] = React.useState(readMode());
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  React.useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'ui.theme') setMode(readMode());
    };
    const onSystem = (e) => {
      if (readMode() === 'system') setMode('system');
    };
    window.addEventListener('storage', onStorage);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', onSystem);
    return () => {
      window.removeEventListener('storage', onStorage);
      mq.removeEventListener?.('change', onSystem);
    };
  }, []);

  // Custom event support for same-tab updates
  React.useEffect(() => {
    const handler = () => setMode(readMode());
    window.addEventListener('ui.theme.changed', handler);
    return () => window.removeEventListener('ui.theme.changed', handler);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
      <ToastContainer position="top-right" autoClose={2500} />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeRoot>
      <App />
    </ThemeRoot>
  </React.StrictMode>
);
