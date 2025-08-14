import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Stack, Button, Chip, Divider, Table, TableBody, TableRow, TableCell, TableHead } from '@mui/material';
import { getQuotation, acceptQuotation, rejectQuotation } from '../../api/quotationsApi';

export default function QuotationDetail(){
  const { id } = useParams();
  const [data, setData] = useState(null);
  const load = async ()=>{ const res = await getQuotation(id); setData(res.data); };
  useEffect(()=>{ load(); },[id]);
  if (!data) return null;

  const onAccept = async ()=>{ await acceptQuotation(id); await load(); };
  const onReject = async ()=>{ await rejectQuotation(id); await load(); };

  return (
    <Container sx={{ py:3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb:2 }}>
        <Typography variant="h6">Teklif #{data.quoteNumber} • {data.requestType}</Typography>
        <Chip label={data.status} color={data.status==='quoted' ? 'info' : data.status==='accepted' ? 'success' : data.status==='rejected' ? 'default' : 'warning'} size="small" />
        <Typography variant="body2" color="text.secondary">Oluşturma: {new Date(data.createdAt||Date.now()).toLocaleString('tr-TR')}</Typography>
      </Stack>
      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="subtitle2" gutterBottom>Talep Bilgisi</Typography>
        <Typography variant="body2">Başlık: {data.requestInfo?.title}</Typography>
        <Typography variant="body2" sx={{ whiteSpace:'pre-wrap' }}>Açıklama: {data.requestInfo?.description}</Typography>
        <Typography variant="body2">Adet: {data.requestInfo?.quantity}</Typography>
        {data.requestInfo?.budgetRange && (
          <Typography variant="body2">Bütçe: {data.requestInfo.budgetRange.min} - {data.requestInfo.budgetRange.max} {data.requestInfo.budgetRange.currency}</Typography>
        )}
      </Paper>

      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="subtitle2" gutterBottom>Ürünler</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ürün</TableCell>
              <TableCell>Adet</TableCell>
              <TableCell>Tahmini Birim</TableCell>
              <TableCell>Not</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data.requestedItems||[]).map((it,i)=> (
              <TableRow key={i}>
                <TableCell>{it.productId || it.productName || '-'}</TableCell>
                <TableCell>{it.quantity}</TableCell>
                <TableCell>{it.estimatedUnitPrice ?? '-'}</TableCell>
                <TableCell>{it.specifications || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {data.sellInfo && (
        <Paper sx={{ p:2, mb:2 }}>
          <Typography variant="subtitle2" gutterBottom>Satış Özeti</Typography>
          <Typography variant="body2">Birim Fiyat: {data.sellInfo.desiredUnitPrice} • Komisyon Oranı: {(data.sellInfo.commissionRate*100).toFixed(1)}%</Typography>
          <Typography variant="body2">Komisyon: {data.sellInfo.commissionAmount} • Net: {data.sellInfo.netProceeds}</Typography>
          {data.sellInfo.customerTotal && <Typography variant="body2">Müşteri Toplam: {data.sellInfo.customerTotal} • Müşteri Birim: {data.sellInfo.customerUnitPrice}</Typography>}
          <Typography variant="body2">Komisyon Yansıtma: {data.sellInfo.commissionPassThrough === 'pass' ? 'Müşteriye Yansıt' : 'Ben Karşılarım'}</Typography>
        </Paper>
      )}

      {data.supplierResponse && (
        <Paper sx={{ p:2, mb:2 }}>
          <Typography variant="subtitle2" gutterBottom>Tedarikçi Cevabı</Typography>
          <Typography variant="body2">Toplam: {data.supplierResponse.totalAmount} {data.supplierResponse.currency}</Typography>
          <Typography variant="body2">Geçerlilik: {new Date(data.supplierResponse.validUntil).toLocaleString('tr-TR')}</Typography>
          {data.supplierResponse.paymentTerms || data.supplierResponse.deliveryTerms ? (
            <Typography variant="body2">Ödeme: {data.supplierResponse.paymentTerms} • Teslimat: {data.supplierResponse.deliveryTerms}</Typography>
          ) : null}
          {data.supplierResponse.notes && <Typography variant="body2">Not: {data.supplierResponse.notes}</Typography>}
        </Paper>
      )}

      {data.status==='quoted' && (
        <Stack direction="row" spacing={2} sx={{ mt:2 }}>
          <Button variant="contained" onClick={onAccept}>Kabul Et</Button>
          <Button color="error" onClick={onReject}>Reddet</Button>
        </Stack>
      )}
    </Container>
  );
}
