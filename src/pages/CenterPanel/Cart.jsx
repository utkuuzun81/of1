import React, { useMemo, useState } from 'react';
import { useCart } from '../../store/cartSlice';
import { Container, Table, TableHead, TableRow, TableCell, TableBody, Button, Stack, Typography, TextField, InputAdornment, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLoyalty } from '../../store/loyaltySlice';

export default function Cart(){
  const { items, remove, clear, coupon, applyCoupon, removeCoupon, loyaltyUse, setLoyaltyUse, updateQty } = useCart();
  const { credit } = useLoyalty();
  const nav = useNavigate();

  const [couponInput, setCouponInput] = useState(coupon || '');

  const subtotal = useMemo(() => items.reduce((s, i)=> s + (i.product?.pricing?.salePrice || i.product?.pricing?.basePrice || 0)*i.quantity, 0), [items]);
  const couponDiscount = useMemo(() => {
    const code = (coupon || '').toUpperCase().trim();
    if (!code) return 0;
    if (/^(INDIRIM|IND)(10)$/i.test(code) || code === 'IND10') return Math.round(subtotal * 0.10);
    if (/^(INDIRIM|IND)(20)$/i.test(code) || code === 'IND20') return Math.round(subtotal * 0.20);
    return 0;
  }, [coupon, subtotal]);
  const maxLoyalty = Math.max(0, Math.min(credit, Math.max(0, subtotal - couponDiscount)));
  const loyaltyApplied = Math.max(0, Math.min(maxLoyalty, Number(loyaltyUse)||0));
  const total = Math.max(0, subtotal - couponDiscount - loyaltyApplied);

  return (
    <Container sx={{ py:3 }}>
      <Typography variant="h5" gutterBottom>Sepetim</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>Sadakat krediniz: {credit.toLocaleString('tr-TR')} TL — Kısmi kredi kullanımı desteklenir.</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Ürün</TableCell>
            <TableCell align="right">Adet</TableCell>
            <TableCell align="right">Fiyat</TableCell>
            <TableCell align="right">Toplam</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(({product, quantity})=> {
            const price = product.pricing?.salePrice || product.pricing?.basePrice || 0;
            return (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell align="right" width={120}>
                  <TextField type="number" size="small" value={quantity}
                    onChange={(e)=>updateQty(product.id, Number(e.target.value)||1)} inputProps={{ min:1 }} />
                </TableCell>
                <TableCell align="right">{price}</TableCell>
                <TableCell align="right">{price*quantity}</TableCell>
                <TableCell align="right"><Button onClick={()=>remove(product.id)}>Sil</Button></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mt:2 }}>
        <Paper sx={{ p:2, flex:1 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Kupon ve Sadakat</Typography>
          <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
            <TextField label="Kupon Kodu" value={couponInput} onChange={(e)=>setCouponInput(e.target.value)} size="small"
              InputProps={{ endAdornment:(
                <InputAdornment position="end">
                  {coupon ? (
                    <Button size="small" onClick={()=>{ removeCoupon(); setCouponInput(''); }}>Kaldır</Button>
                  ) : (
                    <Button size="small" onClick={()=>applyCoupon(couponInput)}>Uygula</Button>
                  )}
                </InputAdornment>
              ) }}
              helperText={coupon ? `Uygulanan kupon: ${coupon}` : 'Örn: IND10 veya IND20'}
              sx={{ maxWidth: 360 }}
            />
            <TextField label="Kullanılacak Sadakat (TL)" type="number" size="small"
              value={loyaltyApplied}
              onChange={(e)=> setLoyaltyUse(Math.min(maxLoyalty, Math.max(0, Number(e.target.value)||0)))}
              helperText={`Mevcut: ${credit.toLocaleString('tr-TR')} TL • Maks: ${maxLoyalty.toLocaleString('tr-TR')} TL`}
              InputProps={{ endAdornment:<InputAdornment position="end">TL</InputAdornment> }}
              sx={{ maxWidth: 320 }}
            />
          </Stack>
        </Paper>
        <Paper sx={{ p:2, minWidth: 280 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Özet</Typography>
          <Stack spacing={0.5}>
            <Row label="Ara Toplam" value={subtotal} />
            <Row label="Kupon İndirimi" value={-couponDiscount} highlight={!!couponDiscount} />
            <Row label="Sadakat Kullanımı" value={-loyaltyApplied} highlight={!!loyaltyApplied} />
            <Row label="Genel Toplam" value={total} bold />
          </Stack>
        </Paper>
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt:2 }}>
        <Button onClick={()=>clear()}>Temizle</Button>
        <Button variant="contained" onClick={()=>nav('/checkout')} disabled={items.length===0}>Siparişi Tamamla</Button>
      </Stack>
    </Container>
  );
}

function Row({ label, value, highlight=false, bold=false }){
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ color: highlight ? 'success.main' : 'text.primary', fontWeight: bold?700:500 }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2">{Number(value).toLocaleString('tr-TR')} TL</Typography>
    </Stack>
  );
}
