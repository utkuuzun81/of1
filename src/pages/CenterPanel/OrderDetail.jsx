import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder } from '../../api/ordersApi';
import { Container, Paper, Typography, Stepper, Step, StepLabel, Box, Table, TableHead, TableRow, TableCell, TableBody, Divider } from '@mui/material';
import PDFButton from '../../components/common/PDFButton.jsx';

const steps = ['Beklemede','Hazırlanıyor','Kargoda','Teslim Edildi'];

export default function OrderDetail(){
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(()=>{ getOrder(id).then((res)=> setOrder(res.data)); },[id]);
  if (!order) return null;

  const activeStep = Math.max(0, steps.indexOf(order.uiStatus || 'Beklemede'));

  return (
    <Container sx={{ py:3 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Typography variant="h5">Sipariş #{order.orderNumber}</Typography>
        <PDFButton orderId={id} />
      </Box>
      <Paper sx={{ p:2, mt:2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((l)=> (<Step key={l}><StepLabel>{l}</StepLabel></Step>))}
        </Stepper>
        <Typography sx={{ mt:2 }}>Kargo: {order.shippingInfo?.trackingNumber || '—'} • Durum: {order.shippingInfo?.status || '—'}</Typography>
      </Paper>
      <Paper sx={{ p:2, mt:2 }}>
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
        {(() => {
          const subtotal = (order.items||[]).reduce((s,it)=> s + (Number(it?.price || it?.product?.price || 0) * Number(it?.quantity || 0)), 0);
          const total = Number(order?.pricing?.totalAmount ?? subtotal);
          return <Box sx={{ display:'flex', justifyContent:'flex-end', gap:3 }}>
            <Box>
              <Typography variant="body2">Ara Toplam</Typography>
              <Typography variant="body2">Toplam</Typography>
            </Box>
            <Box>
              <Typography variant="body2">{subtotal.toLocaleString('tr-TR')} TL</Typography>
              <Typography variant="body2" fontWeight={700}>{total.toLocaleString('tr-TR')} TL</Typography>
            </Box>
          </Box>;
        })()}
      </Paper>
    </Container>
  );
}
