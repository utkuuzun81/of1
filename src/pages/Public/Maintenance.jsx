import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Paper, Stack, Typography, LinearProgress } from '@mui/material';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import DirectionsRunRoundedIcon from '@mui/icons-material/DirectionsRunRounded';

function AnimatedCranes() {
  return (
    <Box sx={{ position:'relative', width:'100%', height:200, overflow:'hidden', mb:2 }}>
      {[...Array(3)].map((_,i)=> (
        <Box key={i} sx={{ position:'absolute', top: 40 + i*20, left: i%2? 'auto':-120, right: i%2? -120:'auto', width:200, height:12, background:'linear-gradient(90deg,#ddd,#bbb)', borderRadius:6, animation:`beam ${8+i*1.5}s linear infinite alternate` }} />
      ))}
      <style>{`
        @keyframes beam { from { transform: translateX(0); } to { transform: translateX(120%); } }
      `}</style>
    </Box>
  );
}

export default function Maintenance(){
  const [progress, setProgress] = useState(10);
  useEffect(()=>{
    const t = setInterval(()=> setProgress(p => (p>=95?10:p+1)), 120);
    return ()=> clearInterval(t);
  },[]);

  return (
    <Box sx={{ minHeight:'100vh', display:'grid', placeItems:'center', background: 'radial-gradient(circle at 20% 20%, #0b1220, #060b14)' }}>
      <Container>
        <Paper elevation={6} sx={{ p:4, borderRadius:4, backdropFilter:'blur(6px)', textAlign:'center', background:'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border:'1px solid rgba(255,255,255,0.08)' }}>
          <Stack spacing={2} alignItems="center">
            <Box sx={{ position:'relative', width:128, height:128, display:'grid', placeItems:'center' }}>
              <Box sx={{ position:'absolute', inset:0, borderRadius:'50%', background:'linear-gradient(180deg,#f59e0b,#dc2626)', filter:'blur(24px)', opacity:0.35 }} />
              <Box sx={{ animation:'spin 6s linear infinite' }}><BuildCircleRoundedIcon sx={{ fontSize:96, color:'#fff' }} /></Box>
              <Box sx={{ position:'absolute', bottom:-14, left:'50%', transform:'translateX(-50%)', bgcolor:'#111827', px:2, py:.5, borderRadius:999, border:'1px solid rgba(255,255,255,0.12)', color:'#fef3c7' }}>TADİLATDAYIZ</Box>
              <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
            </Box>

            <Typography variant="h4" sx={{ fontWeight:800, color:'#e5e7eb' }}>Kısa bir tadilat arasındayız</Typography>
            <Typography sx={{ color:'#cbd5e1' }}>Sistemi daha iyi hale getiriyoruz. Birazdan tekrar buradayız.</Typography>
            <AnimatedCranes />
            <Box sx={{ width:'100%', maxWidth:520 }}>
              <LinearProgress variant="determinate" value={progress} sx={{ height:10, borderRadius:999 }} />
              <Typography variant="caption" sx={{ mt:1, display:'block', color:'#94a3b8' }}>Yükleniyor…</Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ mt:1 }}>
              <Button href="/contact" variant="contained" color="warning" startIcon={<ConstructionRoundedIcon />}>Bize Ulaşın</Button>
              <Button href="/" startIcon={<DirectionsRunRoundedIcon />}>Ana Sayfa</Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
