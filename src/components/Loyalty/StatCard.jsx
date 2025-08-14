import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useLoyalty } from '../../store/loyaltySlice';

export default function StatCard() {
  const { level, credit, progressPct } = useLoyalty();
  return (
    <Card elevation={0} sx={{
      background:'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
      backdropFilter:'blur(18px)',
      border:'1px solid rgba(255,255,255,0.5)',
      boxShadow:'0 8px 24px -6px rgba(0,0,0,0.12)',
      overflow:'hidden'
    }}>
      <CardContent>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.25, mb:1 }}>
          <Box sx={{ width:44, height:44, display:'grid', placeItems:'center', borderRadius:3, background:'linear-gradient(135deg,#fef3c7,#fde68a)', boxShadow:'0 2px 6px rgba(0,0,0,0.12)' }}>
            <StarIcon sx={{ color:'#d97706' }} />
          </Box>
          <Typography variant="h6">Sadakat Statüsü</Typography>
        </Box>
        <Typography variant="body2" sx={{ fontWeight:500, mb:1 }}>Seviye: {level} • Kredi: {credit.toLocaleString('tr-TR')} TL</Typography>
        <LinearProgress variant="determinate" value={progressPct} sx={{
          height:10,
          borderRadius:5,
          '& .MuiLinearProgress-bar':{
            background:'linear-gradient(90deg,#f59e0b,#fbbf24)'
          }
        }} />
        <Typography variant="caption" sx={{ fontWeight:600, display:'block', mt:.75 }}>İlerleme: %{Math.round(progressPct)}</Typography>
      </CardContent>
    </Card>
  );
}
