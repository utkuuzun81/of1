import React from 'react';
import { Box, Typography } from '@mui/material';

export default function EmptyState({ message="Henüz veri yok.", children }) {
  return (
    <Box sx={{ p:6, textAlign:'center', color:'text.secondary' }}>
      <Typography>{message}</Typography>
      {children}
    </Box>
  );
}
