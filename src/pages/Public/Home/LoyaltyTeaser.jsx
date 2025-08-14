import React from 'react';
import { Box, Container, Grid, Paper, Typography, LinearProgress } from '@mui/material';
import useInView from '../../../hooks/useInView';

export default function LoyaltyTeaser(){
  const [ref, inView] = useInView({ threshold: 0.2 });
  const level = 72; // demo
  return (
    <Box ref={ref} sx={{ py:8, background:'#ffffff' }}>
      <Container>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" fontWeight={900} sx={{ mb:1 }}>Sadakat Kredisi</Typography>
            <Typography color="text.secondary" sx={{ mb:2 }}>Sipariş adedinize göre statünüz yükselir, indirim ve kredi limitleriniz artar.</Typography>
            <LinearProgress variant="determinate" value={inView ? level : 0} sx={{ height:10, borderRadius:5 }} />
            <Typography variant="caption" sx={{ mt:1, display:'block' }}>Mevcut seviye: %{level}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p:3, border:'1px solid #eef2f7', borderRadius:3,
              transform: inView ? 'none' : 'translateY(18px)', opacity: inView ? 1 : 0, transition:'all .6s' }}>
              <Typography fontWeight={800}>Statü Avantajları</Typography>
              <ul style={{ margin: '8px 0 0 18px', color:'#475569' }}>
                <li>Artan indirim oranları</li>
                <li>Öncelikli teklif ve hızlı onay</li>
                <li>Genişleyen kredi limiti</li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
