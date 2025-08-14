import React, { useEffect, useState } from 'react';
import { Box, Container, IconButton, Typography } from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';

const STORAGE_KEY = 'announcement.dismissed.v1';

export default function AnnouncementBar(){
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY) === '1';
    if (dismissed) setOpen(false);
  }, []);
  if (!open) return null;
  return (
    <Box sx={{ background:'#111827', color:'#e5e7eb' }}>
      <Container sx={{ display:'flex', alignItems:'center', gap:2, py:1 }}>
        <Typography variant="body2" sx={{ flex:1 }}>
          Yeni: Sadakat kredisinde seviye ödülleri! Kayıt olan ilk 100 işletmeye ekstra avantaj.
        </Typography>
        <IconButton size="small" aria-label="duyuruyu kapat"
          onClick={()=> { localStorage.setItem(STORAGE_KEY, '1'); setOpen(false); }}
          sx={{ color:'#e5e7eb' }}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </Container>
    </Box>
  );
}
