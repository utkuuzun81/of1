import React, { useEffect, useState } from 'react';
import { listQuotations } from '../../api/quotationsApi';
import { Container, Table, TableHead, TableRow, TableCell, TableBody, Grid, Button, Box, Typography, Tabs, Tab, Chip, Stack, IconButton } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SellIcon from '@mui/icons-material/Sell';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';

export default function Quotations(){
  const [rows, setRows] = useState([]);
  const [qsEnabled, setQsEnabled] = useState(true);
  const [tab, setTab] = useState('all');
  const nav = useNavigate();
  const load = ()=> listQuotations().then((res)=> setRows(res.data || [])).catch(()=> setRows([]));
  useEffect(()=>{ load(); },[]);
  useEffect(()=>{
    fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/public/system')
      .then(r=>r.json())
      .then(d=> setQsEnabled(Boolean(d?.quickSellEnabled ?? true)))
      .catch(()=>{});
  },[]);

  return (
    <Container sx={{ py:3 }}>
      <Box sx={{ mb:3 }}>
        <Typography variant="h6" sx={{ mb:1 }}>Hızlı işlemler</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth size="large" variant="contained" startIcon={<FlashOnIcon />} onClick={()=> nav('/quotations/new?type=quick-sell')} disabled={!qsEnabled}
              sx={{ py:2, bgcolor:'secondary.main', ':hover':{ opacity:0.9, transform:'translateY(-2px)' }, transition:'all 120ms ease' }}>Hızlı Sat!</Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth size="large" variant="contained" startIcon={<SellIcon />} onClick={()=> nav('/quotations/new?type=sell')}
              sx={{ py:2, bgcolor:'success.main', ':hover':{ opacity:0.9, transform:'translateY(-2px)' }, transition:'all 120ms ease' }}>Satmak İstiyorum</Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth size="large" variant="contained" startIcon={<ShoppingCartIcon />} onClick={()=> nav('/quotations/new?type=buy')}
              sx={{ py:2, bgcolor:'info.main', ':hover':{ opacity:0.9, transform:'translateY(-2px)' }, transition:'all 120ms ease' }}>Almak İstiyorum</Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth size="large" variant="contained" startIcon={<ListAltIcon />} onClick={()=> nav('/quotations')}
              sx={{ py:2, bgcolor:'primary.main', ':hover':{ opacity:0.9, transform:'translateY(-2px)' }, transition:'all 120ms ease' }}>Tekliflerim</Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb:2 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Tabs value={tab} onChange={(e,v)=> setTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile>
            <Tab label={`Tümü (${rows.length})`} value="all" />
            <Tab label={`Bekleyen (${rows.filter(r=>r.status==='pending').length})`} value="pending" />
            <Tab label={`Teklif Geldi (${rows.filter(r=>r.status==='quoted' || r.status==='negotiating').length})`} value="quoted" />
            <Tab label={`Kabul (${rows.filter(r=>r.status==='accepted').length})`} value="accepted" />
            <Tab label={`Red (${rows.filter(r=>r.status==='rejected').length})`} value="rejected" />
            <Tab label={`Süresi Dolan (${rows.filter(r=>r.status==='expired').length})`} value="expired" />
          </Tabs>
          <IconButton onClick={load} title="Yenile"><RefreshIcon /></IconButton>
        </Stack>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tür</TableCell>
            <TableCell>Başlık</TableCell>
            <TableCell>Tarih</TableCell>
            <TableCell>Durum</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows
            .filter(r => tab==='all' ? true : (
              tab==='quoted' ? (r.status==='quoted' || r.status==='negotiating') : r.status===tab
            ))
            .map((r)=> {
              const status = r.status;
              const statusColor = status==='accepted' ? 'success' : status==='rejected' ? 'error' : status==='quoted' || status==='negotiating' ? 'info' : status==='expired' ? 'default' : 'warning';
              const typeColor = r.requestType==='quick-sell' ? 'secondary' : r.requestType==='sell' ? 'success' : 'info';
              return (
                <TableRow key={r.quoteNumber} hover onClick={()=> nav(`/quotations/${r._id || r.id}`)} style={{ cursor:'pointer' }}>
                  <TableCell><Chip size="small" label={r.requestType} color={typeColor} variant="outlined" /></TableCell>
                  <TableCell>{r.requestInfo?.title}</TableCell>
                  <TableCell>{new Date(r.createdAt||Date.now()).toLocaleString('tr-TR')}</TableCell>
                  <TableCell><Chip size="small" label={status} color={statusColor} /></TableCell>
                </TableRow>
              );
            })}
          {rows.length===0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography variant="body2" color="text.secondary">Henüz bir teklif bulunamadı.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Container>
  );
}
