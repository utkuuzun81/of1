import React, { useEffect, useState } from 'react';
import { Container, Paper, Stack, Typography, TextField, Button, MenuItem, Divider, Table, TableHead, TableRow, TableCell, TableBody, Grid, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { getOrder, cancelOrder, downloadInvoice } from '../../api/ordersApi';
import api from '../../api/client';

const statuses = ['pending','confirmed','processing','shipped','delivered','cancelled'];

export default function OrderDetail(){
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('pending');
  const [company, setCompany] = useState('');
  const [tracking, setTracking] = useState('');
  const [supplier, setSupplier] = useState('');
  const load = async ()=>{ const res = await getOrder(id); setOrder(res.data); setStatus(res.data?.status||'pending'); };
  useEffect(()=>{ load(); },[id]);
  if (!order) return null;

  const updateStatus = async ()=>{ await api.put(`/api/orders/${id}/status`, { status }); await load(); };
  const updateShipping = async ()=>{ await api.put(`/api/orders/${id}/shipping`, { company, trackingNumber: tracking }); await load(); };
  const assignSupplier = async ()=>{ if (!supplier) return; await api.put(`/api/orders/${id}/assign-supplier`, { supplierId: supplier }); await load(); };
  const addTracking = async ()=>{ await api.post(`/api/orders/${id}/tracking`, { company, trackingNumber: tracking, status: 'in_transit' }); await load(); };

  const totalNumbers = (()=>{
    const subtotal = (order.items||[]).reduce((s,it)=> s + (Number(it?.price || it?.product?.price || 0) * Number(it?.quantity || 0)), 0);
    const total = Number(order?.pricing?.totalAmount ?? subtotal);
    return { subtotal, total };
  })();

  const buyerDisplay = order?.userDisplay || order?.customerInfo?.companyName || order?.customerInfo?.name || order?.customerInfo?.email || order?.billingAddress?.name || order?.userId;

  return (
    <Container sx={{ py:3 }}>
  <Typography variant="h6" gutterBottom>Sipariş #{order.orderNumber}</Typography>
      <Paper sx={{ p:2 }}>
        <Stack direction={{ xs:'column', md:'row' }} spacing={2}>
          <TextField select label="Durum" value={status} onChange={(e)=>setStatus(e.target.value)} sx={{ minWidth: 200 }}>
            {statuses.map(s=> <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <Button variant="contained" onClick={updateStatus}>Durumu Güncelle</Button>
          <Button color="error" onClick={async()=>{ await cancelOrder(id); await load(); }}>İptal</Button>
          <Button onClick={()=>downloadInvoice(id)}>Fatura İndir</Button>
        </Stack>
      </Paper>
      <Paper sx={{ p:2, mt:2 }}>
        <Stack direction={{ xs:'column', md:'row' }} spacing={2}>
          <TextField label="Kargo Firması" value={company} onChange={(e)=>setCompany(e.target.value)} />
          <TextField label="Takip No" value={tracking} onChange={(e)=>setTracking(e.target.value)} />
          <Button variant="outlined" onClick={updateShipping}>Kargo Güncelle</Button>
          <Button onClick={addTracking}>Takip Bilgisi Ekle</Button>
        </Stack>
      </Paper>
      <Paper sx={{ p:2, mt:2 }}>
        <Stack direction={{ xs:'column', md:'row' }} spacing={2}>
          <TextField label="Tedarikçi ID" value={supplier} onChange={(e)=>setSupplier(e.target.value)} />
          <Button variant="contained" onClick={assignSupplier} disabled={!supplier}>Tedarikçi Ata</Button>
        </Stack>
      </Paper>
      <Grid container spacing={2} sx={{ mt:2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p:2 }}>
            <Typography variant="subtitle1" gutterBottom>Ürünler</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ürün</TableCell>
                  <TableCell align="right">Adet</TableCell>
                  <TableCell align="right">Birim Fiyat</TableCell>
                  <TableCell align="right">Tutar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(order.items||[]).map((it, idx)=>{
                  const unit = Number(it?.price || it?.product?.price || 0);
                  const qty = Number(it?.quantity || 0);
                  const amt = unit * qty;
                  return (
                    <TableRow key={idx}>
                      <TableCell>{it?.product?.name || it?.name || 'Ürün'}</TableCell>
                      <TableCell align="right">{qty}</TableCell>
                      <TableCell align="right">{unit.toLocaleString('tr-TR')}</TableCell>
                      <TableCell align="right">{amt.toLocaleString('tr-TR')}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Divider sx={{ my:2 }} />
            <Box sx={{ display:'flex', justifyContent:'flex-end', gap:3 }}>
              <Box>
                <Typography variant="body2">Ara Toplam</Typography>
                <Typography variant="body2">Toplam</Typography>
              </Box>
              <Box>
                <>
                  <Typography variant="body2">{totalNumbers.subtotal.toLocaleString('tr-TR')} TL</Typography>
                  <Typography variant="body2" fontWeight={700}>{totalNumbers.total.toLocaleString('tr-TR')} TL</Typography>
                </>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p:2, mb:2 }}>
            <Typography variant="subtitle1" gutterBottom>Müşteri</Typography>
            <Typography>{buyerDisplay}</Typography>
            <Typography variant="body2" color="text.secondary">Sipariş Tarihi: {order.createdAt ? new Date(order.createdAt).toLocaleString('tr-TR') : '-'}</Typography>
          </Paper>
          <Paper sx={{ p:2, mb:2 }}>
            <Typography variant="subtitle1" gutterBottom>Tedarikçi</Typography>
            <Typography>{order.supplierDisplay || order.supplierId || '—'}</Typography>
          </Paper>
          <Paper sx={{ p:2 }}>
            <Typography variant="subtitle1" gutterBottom>Adresler</Typography>
            <Typography variant="body2">Sevk: {order.shippingAddress?.addressLine || order.shippingInfo?.address || '—'}</Typography>
            <Typography variant="body2">Fatura: {order.billingAddress?.addressLine || '—'}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
