import React from 'react';
import { Box, Container, Stack, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { track } from '../../../components/analytics/events';

export default function FinalCTA(){
  const nav = useNavigate();
  return (
    <Box sx={{ py:8, background:'#0b0f14', color:'#e2e8f0', textAlign:'center' }}>
      <Container>
  <Typography variant="h4" fontWeight={900} sx={{ mb:1 }}>Hazır Mısınız?</Typography>
        <Typography sx={{ opacity:.8, mb:3 }}>İşitme merkezleri için en hızlı ve güvenli tedarik deneyimi.</Typography>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={2} justifyContent="center">
          <Button variant="contained" color="secondary" onClick={()=> { track('final_cta_register'); nav('/register/step1'); }}>Ücretsiz Kayıt</Button>
          <Button variant="outlined" color="inherit" onClick={()=> { track('final_cta_login'); nav('/login'); }}>Giriş Yap</Button>
        </Stack>
      </Container>
    </Box>
  );
}
