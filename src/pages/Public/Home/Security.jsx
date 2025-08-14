import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import IconClay from '../../../components/ui/IconClay';
import useInView from '../../../hooks/useInView';

const items = [
  { title: 'JWT + RoleAuth', desc: 'Yetki bazlı erişim ve güvenli token yönetimi.', icon:'shield' },
  { title: 'Loglama', desc: 'Audit trail ve aksiyon kayıtları.', icon:'spark' },
  { title: 'Rate Limit', desc: 'Kötüye kullanıma karşı istek sınırlama.', icon:'bolt' },
  { title: 'Dosya Yükleme', desc: 'Multer/S3 ile güvenli yükleme ve doğrulama.', icon:'lock' },
];

export default function Security(){
  const [ref, inView] = useInView({ threshold: 0.2 });
  return (
  <Box ref={ref} sx={{ py:8, background:'#0b0f14', color:'#eef2f7' }}>
      <Container>
    <Typography variant="h5" fontWeight={900} sx={{ mb:3 }}>Güvenlik</Typography>
        <Grid container spacing={2}>
          {items.map((it, i) => (
            <Grid item xs={12} md={3} key={it.title} sx={{
              transform: inView ? 'none' : 'translateY(16px)',
              opacity: inView ? 1 : 0,
              transition: `all .6s ${i * 90}ms cubic-bezier(.2,.8,.2,1)`
            }}>
              <Paper elevation={0} sx={{ p:3, background:'rgba(255,255,255,0.08)', borderRadius:3, border:'1px solid rgba(255,255,255,0.16)' }}>
                <Box sx={{ display:'grid', placeItems:'center', mb:1 }}>
                  <IconClay variant={it.icon} size={64} />
                </Box>
                <Typography fontWeight={800} sx={{ color:'#f8fafc' }}>{it.title}</Typography>
                <Typography variant="body2" sx={{ color:'#cbd5e1' }}>{it.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
