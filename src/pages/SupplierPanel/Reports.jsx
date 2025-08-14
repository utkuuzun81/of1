import React, { useMemo, useState } from 'react';
import { Container, Stack, Button, TextField, MenuItem, Paper, Typography } from '@mui/material';
import { exportOrders } from '../../api/reportsApi';
import fileDownload from 'js-file-download';

const ORDER_STATUSES = ['all','pending','confirmed','processing','shipped','delivered','cancelled','refunded'];

export default function SupplierReports(){
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('all');
  const params = useMemo(()=>({ from, to, status }),[from,to,status]);

  const download = async (format) => {
    const res = await exportOrders({ ...params, format });
    const filename = format === 'pdf' ? 'orders.pdf' : format === 'excel' ? 'orders.xlsx' : 'orders.csv';
    fileDownload(res.data, filename);
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
        </Stack>
      </Paper>
      <Typography variant="subtitle1" gutterBottom>Sipariş İhracı</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={()=>download('csv')}>CSV</Button>
        <Button variant="outlined" onClick={()=>download('excel')}>Excel</Button>
        <Button variant="outlined" onClick={()=>download('pdf')}>PDF</Button>
      </Stack>
    </Container>
  );
}
