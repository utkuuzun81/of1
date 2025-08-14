import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
// no heading icon per request
import useInView from '../../../hooks/useInView';

const steps = [
  { title: 'Talep Oluştur', desc: 'Ürün veya hizmet için saniyeler içinde talep girin.' },
  { title: 'Teklif Al', desc: 'Şeffaf fiyatlar ve anlık stok ile karşılaştırın.' },
  { title: 'Sipariş ve Takip', desc: 'Tek panelden sipariş verin ve kargoyu izleyin.' },
];

export default function HowItWorks(){
  const [ref, inView] = useInView({ threshold: 0.2 });
  return (
    <Box ref={ref} sx={{ py:8, background:'#ffffff' }}>
      <Container>
  <Typography variant="h5" fontWeight={900} sx={{ mb:4 }}>Nasıl Çalışır?</Typography>
        <Grid container spacing={3}>
          {steps.map((s, i) => (
            <Grid item xs={12} md={4} key={s.title}>
              <Paper elevation={0} sx={{ p:3, borderRadius:3, border:'1px solid #eef2f7',
                transform: inView ? 'none' : 'translateY(24px)',
                opacity: inView ? 1 : 0,
                transition: `all .6s ${i * 120}ms cubic-bezier(.2,.8,.2,1)`,
              }}>
                <Box sx={{ width:44, height:44, borderRadius:2, background:'#0b0f14', color:'#fff', display:'grid', placeItems:'center', fontWeight:800, mb:1 }}>{i+1}</Box>
                <Typography variant="h6" fontWeight={800}>{s.title}</Typography>
                <Typography color="text.secondary">{s.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
