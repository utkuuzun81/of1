import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Stack, Chip, Divider, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { getQuotation } from '../../api/quotationsApi';

const typeColor = (t) => t === 'quick-sell' ? 'success' : (t === 'sell' ? 'warning' : 'info');
const statusColor = (s) => ({ pending:'default', quoted:'primary', negotiating:'warning', accepted:'success', rejected:'error', expired:'secondary' }[s] || 'default');

export default function AdminQuotationDetail(){
  const { id } = useParams();
  const [data, setData] = useState(null);
  const load = async ()=> { const res = await getQuotation(id); setData(res.data); };
  useEffect(()=>{ load(); },[id]);
  if (!data) return null;

  return (
    <Container sx={{ py:3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb:2 }}>
        <Typography variant="h6">Teklif #{data.quoteNumber}</Typography>
        <Chip size="small" color={typeColor(data.requestType)} label={data.requestType} />
        <Chip size="small" color={statusColor(data.status)} label={data.status} />
        <Typography variant="body2" color="text.secondary">Oluşturma: {new Date(data.createdAt||Date.now()).toLocaleString('tr-TR')}</Typography>
      </Stack>
      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="subtitle2" gutterBottom>Taraflar</Typography>
        <Typography variant="body2">
          İsteyen: {data._requester?.companyName || '-'}
          {data._requester?.fullName ? ` • ${data._requester.fullName}` : ''}
          {data._requester?.email ? ` • ${data._requester.email}` : ''}
        </Typography>
        <Typography variant="body2">
          Tedarikçi: {data._supplier?.companyName || '-'}
          {data._supplier?.fullName ? ` • ${data._supplier.fullName}` : ''}
          {data._supplier?.email ? ` • ${data._supplier.email}` : ''}
        </Typography>
      </Paper>

      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="subtitle2">Talep Bilgisi</Typography>
        <Typography variant="body2">Başlık: {data.requestInfo?.title}</Typography>
        <Typography variant="body2">Açıklama: {data.requestInfo?.description}</Typography>
        <Typography variant="body2">Adet: {data.requestInfo?.quantity} • Bütçe: {data.requestInfo?.budgetRange?.min} - {data.requestInfo?.budgetRange?.max} {data.requestInfo?.budgetRange?.currency}</Typography>
        {data.requestInfo?.deliveryDate && <Typography variant="body2">Teslim: {new Date(data.requestInfo.deliveryDate).toLocaleDateString('tr-TR')}</Typography>}
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
            {data.supplierResponse?.quotedItems?.length ? (
              <TableRow><TableCell colSpan={4}><Divider /></TableCell></TableRow>
            ) : null}
            {(data.supplierResponse?.quotedItems||[]).map((it,i)=> (
              <TableRow key={'q'+i}>
                <TableCell>{it.productId || '-'}</TableCell>
                <TableCell>{it.quantity}</TableCell>
                <TableCell>{it.unitPrice} → Satır: {it.totalPrice}</TableCell>
                <TableCell>{it.notes || '-'}</TableCell>
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
          <Typography variant="body2">Ödeme: {data.supplierResponse.paymentTerms} • Teslimat: {data.supplierResponse.deliveryTerms}</Typography>
          {data.supplierResponse.notes && <Typography variant="body2">Not: {data.supplierResponse.notes}</Typography>}
        </Paper>
      )}

      <Paper sx={{ p:2 }}>
        <Typography variant="caption">Oluşturma: {new Date(data.createdAt||Date.now()).toLocaleString('tr-TR')} • Güncelleme: {data.updatedAt ? new Date(data.updatedAt).toLocaleString('tr-TR') : '-'}</Typography>
      </Paper>
    </Container>
  );
}
