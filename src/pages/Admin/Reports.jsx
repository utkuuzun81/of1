import React, { useMemo, useState } from 'react';
import { Container, Stack, Button, TextField, MenuItem, Typography, Paper, Divider, Box } from '@mui/material';
import { exportOrders, getOrderSummary, exportLoyalty } from '../../api/reportsApi';
import fileDownload from 'js-file-download';

const ORDER_STATUSES = ['all','pending','confirmed','processing','shipped','delivered','cancelled','refunded'];

export default function Reports(){
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('all');
  const [summary, setSummary] = useState(null);

  const params = useMemo(()=>({ from, to, status }),[from,to,status]);

  const downloadOrders = async (format) => {
    const res = await exportOrders({ ...params, format });
    const filename = format === 'pdf' ? 'orders.pdf' : format === 'excel' ? 'orders.xlsx' : format === 'json' ? 'orders.json' : 'orders.csv';
    fileDownload(res.data, filename);
  };

  const downloadLoyalty = async (format) => {
    const res = await exportLoyalty({ format, from, to });
    const filename = format === 'pdf' ? 'loyalty.pdf' : format === 'excel' ? 'loyalty.xlsx' : format === 'json' ? 'loyalty.json' : 'loyalty.csv';
    fileDownload(res.data, filename);
  };

  const loadSummary = async () => {
    const res = await getOrderSummary(params);
    setSummary(res.data);
  };

  return (
    <Container sx={{ py:3 }}>
      <Paper variant="outlined" sx={{ p:2, mb:2 }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
          <TextField type="date" label="Başlangıç" InputLabelProps={{ shrink: true }} value={from} onChange={e=>setFrom(e.target.value)} />
          <TextField type="date" label="Bitiş" InputLabelProps={{ shrink: true }} value={to} onChange={e=>setTo(e.target.value)} />
          <TextField select label="Durum" value={status} onChange={e=>setStatus(e.target.value)} sx={{ minWidth: 180 }}>
            {ORDER_STATUSES.map(s=> <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <Button variant="contained" onClick={loadSummary}>Özet Göster</Button>
        </Stack>
      </Paper>

      {summary && (
        <Paper variant="outlined" sx={{ p:2, mb:2 }}>
          <Typography variant="h6" gutterBottom>Orders Summary</Typography>
          <Stack direction={{ xs:'column', sm:'row' }} spacing={3}>
            <div>
              <Typography variant="body2" color="text.secondary">Toplam Sipariş</Typography>
              <Typography variant="h5">{summary.totals?.totalOrders ?? 0}</Typography>
            </div>
            <div>
              <Typography variant="body2" color="text.secondary">Toplam Tutar</Typography>
              <Typography variant="h5">₺{Number(summary.totals?.totalRevenue || 0).toLocaleString('tr-TR')}</Typography>
            </div>
            <div>
              <Typography variant="body2" color="text.secondary">Sepet Ortalaması</Typography>
              <Typography variant="h6">₺{Number(summary.totals?.avgOrderValue || 0).toLocaleString('tr-TR')}</Typography>
            </div>
          </Stack>
          <Divider sx={{ my:2 }} />
          <Stack direction={{ xs:'column', md:'row' }} spacing={2}>
            <Box sx={{ flex:1 }}>
              <Typography variant="subtitle1">Duruma Göre</Typography>
              <StatusBarChart data={summary.byStatus||[]} />
            </Box>
            <Box sx={{ flex:2 }}>
              <Typography variant="subtitle1">Günlük Trend</Typography>
              <DayLineChart data={summary.byDay||[]} />
            </Box>
          </Stack>
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p:2, mb:2 }}>
        <Typography variant="subtitle1" gutterBottom>Sipariş İhracı</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={()=>downloadOrders('csv')}>CSV</Button>
          <Button variant="outlined" onClick={()=>downloadOrders('excel')}>Excel</Button>
          <Button variant="outlined" onClick={()=>downloadOrders('pdf')}>PDF</Button>
          <Button variant="outlined" onClick={()=>downloadOrders('json')}>JSON</Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p:2 }}>
        <Typography variant="subtitle1" gutterBottom>Loyalty İhracı</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={()=>downloadLoyalty('csv')}>CSV</Button>
          <Button variant="outlined" onClick={()=>downloadLoyalty('excel')}>Excel</Button>
          <Button variant="outlined" onClick={()=>downloadLoyalty('pdf')}>PDF</Button>
          <Button variant="outlined" onClick={()=>downloadLoyalty('json')}>JSON</Button>
        </Stack>
      </Paper>
    </Container>
  );
}

// Basit durum çubuk grafiği
function StatusBarChart({ data=[] }){
  if (!data.length) return <Typography variant="body2" color="text.secondary">Veri yok</Typography>;
  const max = Math.max(...data.map(d=>d.count||0)) || 1;
  return (
    <Stack spacing={1} sx={{ mt:1 }}>
      {data.map(d => (
        <Box key={d.status}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">{d.status}</Typography>
            <Typography variant="body2">{d.count}</Typography>
          </Stack>
          <Box sx={{ height:8, borderRadius:4, bgcolor:'rgba(0,0,0,0.06)' }}>
            <Box sx={{ width:`${(100*(d.count||0)/max).toFixed(1)}%`, height:1, bgcolor:'#1976d2', borderRadius:4 }} />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

// Basit çizgi grafiği (SVG)
function DayLineChart({ data=[] }){
  if (!data.length) return <Typography variant="body2" color="text.secondary">Veri yok</Typography>;
  // normalize points into 0..1 ranges
  const w = 600, h = 200, pad = 24;
  const maxRev = Math.max(...data.map(d=>Number(d.revenue||0))) || 1;
  const points = data.map((d,i)=>{
    const x = pad + (i*(w-2*pad))/Math.max(1, data.length-1);
    const y = h - pad - (Number(d.revenue||0)/maxRev)*(h-2*pad);
    return { x, y };
  });
  const path = points.map((p,i)=> (i===0?`M ${p.x},${p.y}`:` L ${p.x},${p.y}`)).join('');
  return (
    <Box sx={{ overflow:'auto' }}>
      <svg width={w} height={h} role="img" aria-label="Günlük gelir grafiği">
        <rect x="0" y="0" width={w} height={h} fill="#fafafa" stroke="#eee" />
        <path d={path} fill="none" stroke="#2e7d32" strokeWidth={2} />
        {points.map((p,i)=> (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3} fill="#2e7d32" />
          </g>
        ))}
      </svg>
    </Box>
  );
}
