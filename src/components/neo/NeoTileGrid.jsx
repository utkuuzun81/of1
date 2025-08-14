import React from 'react';
import { Box } from '@mui/material';

export default function NeoTileGrid({ children }){
  return (
    <Box sx={{
      display:'grid',
  // Slightly wider columns and bigger spacing for a fuller look
  gridTemplateColumns:'repeat(3, minmax(260px, 1fr))',
  gap: { xs: 1.5, sm: 2, md: 2.5 },
  height: '100%',
  alignContent: 'stretch',
  gridAutoRows: 'minmax(150px, 1fr)',
  gridAutoFlow: 'row dense',
  '@media (max-width:1200px)':{ gridTemplateColumns:'repeat(2, minmax(260px, 1fr))' },
  '@media (max-width:700px)':{ gridTemplateColumns:'repeat(1, minmax(260px, 1fr))' }
    }}>
      {children}
    </Box>
  );
}
