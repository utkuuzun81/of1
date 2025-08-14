import React from 'react';
import { Box, Container, Grid, Paper, Typography, Stack } from '@mui/material';
import IconClay from '../ui/IconClay';

/**
 * AuthFrame - Fullscreen animated frame for Auth pages (login/register)
 * Props: title, subtitle, children, sideVariant ('bolt'|'star'|'shield')
 */
export default function AuthFrame({ title, subtitle, sideVariant='bolt', children, step }){
  return (
    <Box sx={{ minHeight:'100vh', position:'relative', overflow:'hidden', color:'#0b0f14',
      backgroundColor:'#0b0f14',
      backgroundImage:
        `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
         radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`,
      backgroundPosition:'0 0, 25px 25px',
      backgroundSize:'50px 50px',
    }}>
      {/* animated blobs */}
      <Box sx={{ position:'absolute', inset:0, pointerEvents:'none',
        '&:before, &:after':{
          content:'""', position:'absolute', width:520, height:520, borderRadius:'50%',
          filter:'blur(80px)', opacity:0.25,
        },
        '&:before':{ background:'linear-gradient(135deg,#8b5cf6,#22d3ee)', top:-160, left:-120, animation:'float1 14s ease-in-out infinite' },
        '&:after':{ background:'linear-gradient(135deg,#f59e0b,#ef4444)', bottom:-180, right:-160, animation:'float2 18s ease-in-out infinite' },
        '@keyframes float1':{ '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(30px)' } },
        '@keyframes float2':{ '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-30px)' } }
      }}/>

      <Container maxWidth="lg" sx={{ py:{ xs:5, md:8 } }}>
        <Grid
          container
          spacing={{ xs:3, md:4 }}
          alignItems="center"
          sx={{ minHeight:{ md:'calc(100vh - 2 * 64px)' } }}
        >
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p:{ xs:3, md:5 }, borderRadius:4, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'#e2e8f0', backdropFilter:'blur(6px)'}}>
              <Typography variant="h4" fontWeight={900} sx={{ mb:1 }}>{title}</Typography>
              {subtitle && <Typography sx={{ opacity:.85, mb:2 }}>{subtitle}</Typography>}
              {typeof step !== 'undefined' && (
                <Box sx={{ display:'flex', gap:1, mb:2 }} aria-label={`step ${step}`}>
                  {[1,2].map((i)=> (
                    <Box key={i} sx={{ flex:1, height:6, borderRadius:3, background: i<=step? 'linear-gradient(90deg,#22d3ee,#8b5cf6)': 'rgba(255,255,255,0.15)'}}/>
                  ))}
                </Box>
              )}
              {children}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display:{ xs:'none', md:'block' } }}>
            <Box sx={{ display:'grid', placeItems:'center', px:{ md:2, lg:4 } }}>
              <Stack spacing={2} alignItems="center" sx={{ textAlign:'center', color:'#cbd5e1' }}>
                <Box sx={{ transform:'perspective(1000px) rotateX(6deg) rotateY(-6deg)', transition:'transform .3s',
                  '&:hover':{ transform:'perspective(1000px) rotateX(0) rotateY(0) translateY(-2px)' }
                }}>
                  <IconClay variant={sideVariant} size={148} />
                </Box>
                <Typography sx={{ color:'#94a3b8' }}>Odyostore — güvenli giriş ve hızlı kayıt</Typography>

                {/* feature bullets */}
                <Stack spacing={1.5} sx={{ mt:1.5, width:'100%', maxWidth:420 }}>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1.5, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:2, px:1.25, py:1 }}>
                    <IconClay variant="shield" size={26} />
                    <Typography variant="body2" sx={{ color:'#cbd5e1' }}>İki adımlı doğrulama ve JWT tabanlı güvenlik</Typography>
                  </Box>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1.5, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:2, px:1.25, py:1 }}>
                    <IconClay variant="bolt" size={26} />
                    <Typography variant="body2" sx={{ color:'#cbd5e1' }}>Hızlı kayıt, anında panel erişimi (onay beklemeli)</Typography>
                  </Box>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1.5, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:2, px:1.25, py:1 }}>
                    <IconClay variant="star" size={26} />
                    <Typography variant="body2" sx={{ color:'#cbd5e1' }}>7/24 destek ve sadakat statü avantajları</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
