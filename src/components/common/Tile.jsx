import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';

export default function Tile({ title, subtitle, icon, onClick, badge }) {
  return (
    <Card elevation={0} sx={{
      position:'relative',
      overflow:'hidden',
      background:'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 100%)',
      backdropFilter:'blur(14px)',
      border:'1px solid rgba(255,255,255,0.4)',
      transition:'transform .35s, box-shadow .35s',
      boxShadow:'0 4px 12px -2px rgba(0,0,0,0.08)',
      '&:hover':{ transform:'translateY(-4px)', boxShadow:'0 12px 32px -4px rgba(0,0,0,0.12)' }
    }}>
      <CardActionArea onClick={onClick} sx={{ p:2 }}>
        <CardContent>
          <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:1 }}>
            <Box sx={{ width:40, height:40, display:'grid', placeItems:'center', borderRadius:2, background:'linear-gradient(135deg,#fff 0%,#ffe4e6 100%)', boxShadow:'0 2px 6px rgba(0,0,0,0.08)' }}>
              {icon}
            </Box>
            <Typography variant="h6" sx={{ fontWeight:700 }}>{title}</Typography>
            {badge && <Box sx={{ ml:'auto', fontSize:12, px:1, py:0.5, borderRadius:1, background:'#fecaca', color:'#7f1d1d', fontWeight:600 }}>{badge}</Box>}
          </Box>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
