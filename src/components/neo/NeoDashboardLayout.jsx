import React from 'react';
import { ThemeProvider, CssBaseline, Box, Fab, Tooltip } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import neoTheme from '../../theme/neoTheme';
import NeoTopbar from './NeoTopbar';

export default function NeoDashboardLayout({ title, children, onRefresh }){
  return (
    <ThemeProvider theme={neoTheme}>
      <CssBaseline />
      <Box sx={{ minHeight:'100vh', bgcolor:'background.default', color:'text.primary', display:'flex', flexDirection:'column' }}>
        <NeoTopbar title={title} />
        <Box sx={{
          flex:1,
          p: { xs: 2, sm: 2.5, md: 3 },
          maxWidth: { xs: '100%', md: 1400, lg: 1560 },
          mx:'auto',
          width:'100%'
        }}>
          {children}
        </Box>
        <Tooltip title="Yenile">
          <Fab color="primary" onClick={onRefresh||(()=>location.reload())} sx={{ position:'fixed', right:16, bottom:16 }}>
            <ReplayIcon />
          </Fab>
        </Tooltip>
      </Box>
    </ThemeProvider>
  );
}
