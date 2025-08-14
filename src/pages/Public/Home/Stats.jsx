import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';

function useCountTo(value, duration = 1200){
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return val;
}

const items = [
  { label: 'Tamamlanan Sipariş', value: 12480 },
  { label: 'Stoklu Ürün', value: 8200 },
  { label: 'Ortalama Teklif Süresi (sn)', value: 28 },
  { label: 'Memnuniyet', value: 98, suffix: '%' },
];

export default function Stats(){
  return (
    <Box sx={{ py:6, background:'#0f1319' }}>
      <Container>
        <Grid container spacing={2}>
          {items.map((it) => (
            <Grid item xs={6} md={3} key={it.label}>
              <Paper elevation={0} sx={{ p:3, background:'rgba(255,255,255,0.03)', borderRadius:3, textAlign:'center' }}>
                <Stat value={it.value} suffix={it.suffix} />
                <Typography variant="body2" sx={{ opacity:.75 }}>{it.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function Stat({ value, suffix = '' }){
  const val = useCountTo(value);
  return (
    <Typography variant="h4" fontWeight={900} sx={{ color:'#e2e8f0', mb:0.5 }}>
      {val.toLocaleString()} {suffix}
    </Typography>
  );
}
