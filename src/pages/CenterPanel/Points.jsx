import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, LinearProgress, Chip, Divider, TextField, InputAdornment, Button, Tabs, Tab, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import { useLoyalty } from '../../store/loyaltySlice';
import { getLoyaltySummary, getLoyaltyTransactions } from '../../api/loyaltyApi';
import { useNavigate } from 'react-router-dom';

function Radial({ value=0 }){
  const pct = Math.max(0, Math.min(100, value));
  const r = 44; const c = 2*Math.PI*r; const dash = (pct/100)*c;
  const cap = pct <= 0 ? 'butt' : 'round';
  return (
    <Box sx={{ width:120, display:'flex', flexDirection:'column', alignItems:'center' }}>
      <Box sx={{ position:'relative', width:120, height:120 }}>
        <svg width={120} height={120} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={60} cy={60} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={12} />
          <circle cx={60} cy={60} r={r} fill="none" stroke="url(#grad)" strokeWidth={12} strokeDasharray={`${dash} ${c-dash}`} strokeLinecap={cap} />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626"/>
              <stop offset="100%" stopColor="#f59e0b"/>
            </linearGradient>
          </defs>
        </svg>
        <Box sx={{ position:'absolute', inset:0, display:'grid', placeItems:'center' }}>
          <Box sx={{ position:'relative', display:'inline-block', lineHeight:1 }}>
            <Typography variant="h4" fontWeight={900} sx={{ color:'#111827', textShadow:'0 1px 0 rgba(255,255,255,0.6)' }}>{Math.round(pct)}</Typography>
            <Typography component="span" sx={{ position:'absolute', top:-6, right:-14, fontWeight:900, color:'#111827' }}>%</Typography>
          </Box>
        </Box>
      </Box>
      <Typography variant="caption" sx={{ color:'#334155', textShadow:'0 1px 0 rgba(255,255,255,0.5)' }}>Seviye İlerleme</Typography>
    </Box>
  );
}

function TxRow({ tx }){
  const color = tx.type === 'earn' ? '#16a34a' : '#dc2626';
  const sign = tx.type === 'earn' ? '+' : '−';
  const date = new Date(tx.date);
  return (
    <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', py:1.25 }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:1.25 }}>
        <Box sx={{ width:36, height:36, borderRadius:2, display:'grid', placeItems:'center', background:'rgba(0,0,0,0.04)' }}>
          <HistoryRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography fontWeight={600} variant="body2">{tx.desc || (tx.type === 'earn' ? 'Kazanım' : 'Kullanım')}</Typography>
          <Typography variant="caption" color="text.secondary">{date.toLocaleDateString('tr-TR')} {date.toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' })}</Typography>
        </Box>
      </Box>
      <Typography fontWeight={800} sx={{ color }}>{sign}{tx.amount.toLocaleString('tr-TR')} TL</Typography>
    </Box>
  );
}

export default function Points(){
  const { level, credit, progressPct, transactions, seedDemo, setTransactions, setOrderCount, setCredit } = useLoyalty();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');
  const [openRules, setOpenRules] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [sumRes, txRes] = await Promise.all([
          getLoyaltySummary(),
          getLoyaltyTransactions()
        ]);
        if (!mounted) return;
        const oc = Number(sumRes?.data?.orderCount ?? 0);
        const cr = Number(sumRes?.data?.credit ?? 0);
        setOrderCount(oc);
        setCredit(cr);
        setTransactions(Array.isArray(txRes?.data) ? txRes.data : []);
      } catch (e) {
        // Backend hazır değilse demoya düş
        seedDemo();
      }
    })();
    return () => { mounted = false; };
  }, [seedDemo, setTransactions, setOrderCount, setCredit]);

  const filtered = useMemo(() => {
    const list = (transactions||[])
      .slice()
      .sort((a,b)=> new Date(b.date) - new Date(a.date))
      .filter(tx => {
      if (tab !== 'all' && tx.type !== tab) return false;
      if (!q) return true;
      const s = `${tx.desc||''}`.toLowerCase();
      return s.includes(q.toLowerCase());
    });
    return list;
  }, [transactions, q, tab]);

  return (
    <Box sx={{ py:3 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={7}>
      <Paper elevation={0} sx={{ p:3, border:'1px solid rgba(0,0,0,0.06)', borderRadius:3, background:'linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,250,252,0.8))', backdropFilter:'blur(12px)' }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:1.25, mb:2 }}>
                <Box sx={{ width:44, height:44, display:'grid', placeItems:'center', borderRadius:3, background:'linear-gradient(135deg,#fee2e2,#ffedd5)' }}>
                  <StarRoundedIcon sx={{ color:'#dc2626' }} />
                </Box>
        <Typography variant="h5" fontWeight={900} sx={{ color:'#111827' }}>Puanlarım</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p:2, border:'1px solid rgba(255,255,255,0.06)', borderRadius:3, background:'linear-gradient(180deg,#0b1220,#111827)', color:'#e5e7eb' }}>
                    <Typography variant="caption" sx={{ color:'#cbd5e1' }}>Mevcut Kredi</Typography>
                    <Box sx={{ display:'flex', alignItems:'baseline', gap:1 }}>
                      <Typography variant="h4" fontWeight={900} sx={{ color:'#ffffff' }}>{credit.toLocaleString('tr-TR')}</Typography>
                      <Typography variant="body2" sx={{ color:'#cbd5e1' }}>TL</Typography>
                    </Box>
                    <Chip size="small" color="warning" label={`Seviye ${level}`} sx={{ mt:1, fontWeight:700 }} />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p:2, border:'1px solid rgba(255,255,255,0.06)', borderRadius:3, display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(180deg,#0b1220,#111827)', color:'#e5e7eb' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color:'#cbd5e1' }}>Aylık Kazanım</Typography>
                      <Typography variant="h6" fontWeight={800} sx={{ color:'#ffffff' }}>+{Math.round(credit*0.08).toLocaleString('tr-TR')} TL</Typography>
                      <Typography variant="caption" sx={{ color:'#cbd5e1' }}>tahmini</Typography>
                    </Box>
                    <SavingsRoundedIcon sx={{ color:'#22c55e' }} />
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mt:2 }}>
                <Box sx={{ flex:1, mr:2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progressPct}
                    sx={{
                      height:10,
                      borderRadius:5,
                      bgcolor:'rgba(220,38,38,0.15)',
                      '& .MuiLinearProgress-bar':{ background:'linear-gradient(90deg,#dc2626,#f59e0b)' }
                    }}
                  />
                  <Typography variant="caption" sx={{ mt:.5, display:'block', color:'#475569' }}>Seviye ilerlemesi: %{Math.round(progressPct)}</Typography>
                </Box>
                <Radial value={progressPct} />
              </Box>

              <Box sx={{ display:'flex', gap:1.25, mt:2, flexWrap:'wrap' }}>
                <Button variant="contained" color="warning" size="large" disableElevation endIcon={<ArrowOutwardRoundedIcon />} onClick={() => nav('/cart')} aria-label="Sepette kullan"
                  sx={{ borderRadius:3, fontWeight:800 }}>
                  Sepette Kullan
                </Button>
                <Button variant="outlined" color="warning" startIcon={<FilterListRoundedIcon />} onClick={()=>setOpenRules(true)} aria-label="Kuralları aç"
                  sx={{ borderRadius:3, fontWeight:800 }}>
                  Kurallar
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p:2.5, border:'1px solid rgba(0,0,0,0.06)', borderRadius:3, height:'100%', display:'flex', flexDirection:'column' }}>
              <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
                <Typography fontWeight={800}>İşlem Geçmişi</Typography>
                <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{ minHeight:36 }}>
                  <Tab value="all" label="Tümü" sx={{ minHeight:36 }} />
                  <Tab value="earn" label="Kazanım" sx={{ minHeight:36 }} />
                  <Tab value="spend" label="Kullanım" sx={{ minHeight:36 }} />
                </Tabs>
              </Box>
              <TextField
                value={q}
                onChange={e=>setQ(e.target.value)}
                placeholder="Ara..."
                size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
              />
              <Divider sx={{ my:1.5 }} />
              <Box sx={{ flex:1, overflowY:'auto' }}>
                {filtered.length === 0 ? (
                  <Box sx={{ py:4, textAlign:'center', color:'text.secondary' }}>
                    <Typography variant="body2">Kayıt bulunamadı</Typography>
                  </Box>
                ) : (
                  <Stack divider={<Divider />}>
                    {filtered.map(tx => <TxRow key={tx.id} tx={tx} />)}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={openRules} onClose={()=>setOpenRules(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Puan Kullanım Kuralları</DialogTitle>
        <DialogContent dividers>
          <ul style={{ margin:'0 0 0 18px' }}>
            <li>Sepette puan kullanımı, kupon sonrası kalan tutara uygulanır.</li>
            <li>Maksimum kullanım, mevcut kredi ve sipariş toplamı ile sınırlıdır.</li>
            <li>İade edilen siparişlerde kullanılan puanlar iade edilir.</li>
            <li>Kazanım oranı kampanyalara göre değişebilir.</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenRules(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
