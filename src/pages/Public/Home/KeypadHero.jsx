import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import { Box, Container, Grid, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import content from '../../../content/home.tr.json';
import { track } from '../../../components/analytics/events';
import Icon3D from '../../../components/ui/Icon3D';

const InteractiveKeypad = lazy(() => import('../../../components/interactive/InteractiveKeypad'));

export default function KeypadHero(){
  const nav = useNavigate();
  const prefersReduced = useMemo(() => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  useEffect(()=>{
    // no-op: could preload here if needed
  },[]);

  return (
    <Box sx={{
      py: { xs:6, md:8 },
      color:'#fff',
      backgroundColor:'#0b0f14',
      backgroundImage:
        `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
         radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`,
      backgroundPosition:'0 0, 25px 25px',
      backgroundSize:'50px 50px',
      pr: { md: 2 },
    }}>
      <Container>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" sx={{ fontWeight:800, mb:1 }}>{content.hero.title}</Typography>
            <Typography sx={{ opacity:.9, mb:3 }}>{content.hero.subtitle}</Typography>
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
              <Button variant="contained" color="secondary" onClick={()=> { track('hero_cta_login'); nav('/login'); }}>
                <Icon3D variant="bolt" />&nbsp;{content.hero.ctaLogin}
              </Button>
              <Button variant="outlined" color="inherit" onClick={()=> { track('hero_cta_register'); nav('/register/step1'); }}>
                <Icon3D variant="arrow" />&nbsp;{content.hero.ctaRegister}
              </Button>
            </Stack>
            <Typography sx={{ mt:3, opacity:.9, fontWeight:600 }}>{content.hero.socialProof}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Suspense fallback={<Box sx={{ height: 360 }} />}> 
              <InteractiveKeypad
                size={prefersReduced ? 'md' : 'lg'}
                muted={prefersReduced}
                showRecBar={false}
                keys={[
                  // Match the reference (image 2): orange OK, gray GO, black CREATE
                  { id:'ok', label:'ok', key:'o', hue: 24, saturation: 1.8, brightness: 1.06 },
                  { id:'go', label:'go', key:'g', hue: 0, saturation: 0.0, brightness: 1.08 },
                  { id:'create', label:'create.', key:'c', hue: 0, saturation: 0.0, brightness: 0.52 },
                ]}
                onRecord={()=>{ /* only animation; no navigation */ }}
              />
            </Suspense>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
