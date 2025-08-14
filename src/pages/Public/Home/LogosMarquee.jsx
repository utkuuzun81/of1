import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const logos = ['Logo 1','Logo 2','Logo 3','Logo 4','Logo 5','Logo 6','Logo 7'];

export default function LogosMarquee(){
  return (
    <Box sx={{ py: 4, background: '#0b0f14', color:'#9aa4b2', position:'relative', overflow:'hidden' }}>
      <Container>
        <Typography variant="caption" sx={{ display:'block', mb:1, opacity:.7 }}>Bize güvenenler</Typography>
        <Box sx={{ position:'relative' }}>
          {/* edge fades */}
          <Box sx={{ position:'absolute', inset:0, pointerEvents:'none',
            background: 'linear-gradient(90deg, #0b0f14, transparent 8%, transparent 92%, #0b0f14)'
          }} />
          <Box sx={{
            display:'flex', gap:6, alignItems:'center', whiteSpace:'nowrap',
            ['@keyframes scroll']:{ from:{ transform:'translateX(0)' }, to:{ transform:'translateX(-50%)' } },
          }}>
            <Box sx={{ display:'inline-flex', gap:6, animation:'scroll 32s linear infinite', minWidth:'200%' }}>
              {[...logos, ...logos].map((label, i) => (
                <Box key={i} aria-label={label} sx={{
                  px:2.5, py:1, borderRadius:2, border:'1px solid rgba(255,255,255,0.08)',
                  background:'rgba(255,255,255,0.03)', color:'#cbd5e1', fontSize:12,
                  backdropFilter:'blur(2px)'
                }}>{label}</Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
