import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import IconClay from '../../../components/ui/IconClay';
import useInView from '../../../hooks/useInView';

const items = [
  { name: 'ERP', desc: 'Sipariş ve stok entegrasyonu (yakında)', icon:'erp' },
  { name: 'E-posta', desc: 'Sipariş/teklif bildirimleri', icon:'email' },
  { name: 'WhatsApp', desc: 'Hızlı paylaşım (yakında)', icon:'whatsapp' },
  { name: 'Kargo', desc: 'Takip entegrasyonu (yakında)', icon:'cargo' },
];

export default function Integrations(){
  const [ref, inView] = useInView({ threshold: 0.2 });
  return (
    <Box ref={ref} sx={{ py:8, background:'#ffffff' }}>
      <Container>
  <Typography variant="h5" fontWeight={900} sx={{ mb:3 }}>Entegrasyonlar</Typography>
        <Grid container spacing={2}>
          {items.map((it, i) => (
            <Grid item xs={12} md={3} key={it.name} sx={{
              transform: inView ? 'none' : 'translateY(16px)',
              opacity: inView ? 1 : 0,
              transition: `all .6s ${i * 90}ms cubic-bezier(.2,.8,.2,1)`
            }}>
              <Paper elevation={0} sx={{ p:3, borderRadius:3, border:'1px solid #eef2f7',
                '&:hover':{ boxShadow:'0 10px 30px rgba(0,0,0,0.08)', transform:'translateY(-2px)', transition:'all .2s' }
              }}>
                <Box sx={{ display:'grid', placeItems:'center', mb:1 }}>
                  <IconClay variant={it.icon} size={64} />
                </Box>
                <Typography fontWeight={800}>{it.name}</Typography>
                <Typography variant="body2" color="text.secondary">{it.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
