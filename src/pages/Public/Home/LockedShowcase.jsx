import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import IconClay from '../../../components/ui/IconClay';
import { useNavigate } from 'react-router-dom';

const items = [
  { title: 'Örnek Ürün 1' }, { title: 'Örnek Ürün 2' }, { title: 'Örnek Ürün 3' }, { title: 'Örnek Ürün 4' }
];

export default function LockedShowcase(){
  const nav = useNavigate();
  return (
    <Box sx={{ py:8, background:'#f7f9fb' }}>
      <Container>
  <Typography variant="h5" fontWeight={900} sx={{ mb:3 }}>Ürün Vitrini (Üye Girişi ile Görünür)</Typography>
        <Grid container spacing={2}>
          {items.map((it, i) => (
            <Grid item xs={12} md={3} key={i}>
              <Paper elevation={0} sx={{ p:3, borderRadius:3, height:160, position:'relative', overflow:'hidden',
                background:'#fff', border:'1px solid #eef2f7', cursor:'pointer',
                '&:hover .blur':{ filter:'blur(6px)' }, '&:hover .lock':{ transform:'translate(-50%, -50%) scale(1.05)' }
              }} onClick={()=> nav('/login')}>
                <Box className="blur" sx={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#dfe7f1,#f3f6fa)', filter:'blur(4px)', transition:'filter .2s' }} />
                <Box className="lock" sx={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', transition:'transform .2s' }}>
                  <IconClay variant="lock" size={56} />
                </Box>
                <Typography sx={{ position:'absolute', bottom:12, left:12, fontWeight:800 }}>{it.title}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
