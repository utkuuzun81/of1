import React from 'react';
import {
  Container, Paper, Typography, Stack, Chip, Tabs, Tab, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, Tooltip, TextField, InputAdornment
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

const typeColor = (t) => t === 'quick-sell' ? 'success' : (t === 'sell' ? 'warning' : 'info');
const statusColor = (s) => ({ pending:'default', quoted:'primary', negotiating:'warning', accepted:'success', rejected:'error', expired:'secondary' }[s] || 'default');

export default function AdminQuotations(){
  const nav = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState(0);
  const [q, setQ] = React.useState('');

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/quotations/admin');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { fetchRows(); }, []);

  const statuses = ['all','pending','quoted','negotiating','accepted','rejected','expired'];
  const currentStatus = statuses[tab];
  let list = rows;
  if (currentStatus !== 'all') list = list.filter(r => r.status === currentStatus);
  if (q.trim()) {
    const t = q.trim().toLowerCase();
    list = list.filter(r =>
      r.quoteNumber?.toLowerCase().includes(t) ||
      r.requestType?.toLowerCase().includes(t) ||
      r.requestInfo?.title?.toLowerCase().includes(t) ||
      r._requester?.companyName?.toLowerCase().includes(t) ||
      r._requester?.email?.toLowerCase().includes(t) ||
      r._supplier?.companyName?.toLowerCase().includes(t) ||
      r._supplier?.email?.toLowerCase().includes(t)
    );
  }

  return (
    <Container sx={{ py:3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb:2 }}>
        <Typography variant="h5">Teklifler (Yönetici)</Typography>
        <Stack direction="row" spacing={1}>
          <TextField size="small" placeholder="Ara (numara, başlık, kullanıcı)" value={q} onChange={e=>setQ(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          <Tooltip title="Yenile">
            <span>
              <IconButton onClick={fetchRows} disabled={loading}><RefreshIcon /></IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <Paper sx={{ p:1 }}>
        <Tabs value={tab} onChange={(e,v)=>setTab(v)} sx={{ px:1 }}>
          {statuses.map(s => <Tab key={s} label={
            s==='all'?'Tümü': s==='pending'?'Bekleyen': s==='quoted'?'Teklif Geldi': s==='negotiating'?'Müzakere': s==='accepted'?'Kabul': s==='rejected'?'Red':'Süresi Dolan'
          } />)}
        </Tabs>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Numara</TableCell>
              <TableCell>Tür</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Başlık</TableCell>
              <TableCell>İsteyen (Merkez)</TableCell>
              <TableCell>Tedarikçi</TableCell>
              <TableCell>Tarih</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map(r => (
              <TableRow key={r._id} hover sx={{ cursor:'pointer' }} onClick={()=> nav(`/admin/quotations/${r._id}`)}>
                <TableCell>{r.quoteNumber}</TableCell>
                <TableCell><Chip size="small" label={r.requestType} color={typeColor(r.requestType)} /></TableCell>
                <TableCell><Chip size="small" label={r.status} color={statusColor(r.status)} /></TableCell>
                <TableCell>{r?.requestInfo?.title || '-'}</TableCell>
                <TableCell>{r?._requester?.companyName || r?._requester?.email || '-'}</TableCell>
                <TableCell>{r?._supplier?.companyName || r?._supplier?.email || '-'}</TableCell>
                <TableCell>{r?.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</TableCell>
              </TableRow>
            ))}
            {!loading && list.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center">Kayıt yok</TableCell></TableRow>
            )}
            {loading && (
              <TableRow><TableCell colSpan={7} align="center">Yükleniyor…</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
