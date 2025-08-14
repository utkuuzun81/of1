import React from 'react';
import { Box, Typography } from '@mui/material';

export default function NeoTile({ title, icon, active=false, onClick, cols=1, rows=1 }){
  return (
    <Box onClick={onClick} sx={{
      gridColumn: `span ${cols}`,
      gridRow: `span ${rows}`,
      p: { xs: 2.25, sm: 2.5, md: 3 },
      borderRadius:2,
      cursor:'pointer',
      userSelect:'none',
      // Make tiles noticeably larger and responsive to viewport height
      minHeight: { xs: 96, sm: 120, md: 150, lg: 180 },
      bgcolor: active ? 'primary.main' : 'background.paper',
      color: '#e5e7eb',
      border:'1px solid rgba(255,255,255,0.06)',
      backgroundImage: !active ? 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.04), transparent 40%)' : 'none',
      transition:'transform .15s ease, box-shadow .15s ease',
      '&:hover': { transform:'translateY(-2px)', boxShadow:'0 12px 24px rgba(0,0,0,.25)' }
    }}>
      <Box sx={{ height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <Box sx={{ opacity:0.16, fontSize: 'clamp(56px, 8vw, 104px)', lineHeight:0, alignSelf:'flex-end' }}>{icon}</Box>
        <Typography sx={{
          fontWeight: 800,
          fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.35rem', lg: '1.5rem' }
        }}>{title}</Typography>
      </Box>
    </Box>
  );
}
