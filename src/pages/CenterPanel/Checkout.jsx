import React, { useEffect, useMemo, useState } from 'react';
import { Container, Grid, Paper, TextField, Typography, Button, Stack, FormControlLabel, Checkbox, Divider, MenuItem } from '@mui/material';
import { useCart } from '../../store/cartSlice';
import { createOrder } from '../../api/ordersApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { me } from '../../api/authApi';

export default function Checkout(){
  const { items, clear, coupon, loyaltyUse } = useCart();
  const nav = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [form, setForm] = useState({ company:'', taxNo:'', city:'', address:'', paymentMethod:'credit_card' });
  const [profile, setProfile] = useState(null);
  const required = { city: !form.city, address: !form.address };
  const canSubmit = accepted && items.length>0 && !required.city && !required.address;
  const subtotal = useMemo(() => items.reduce((s, i)=> s + (i.product?.pricing?.salePrice || i.product?.pricing?.basePrice || 0)*i.quantity, 0), [items]);

  useEffect(() => {
    (async () => {
      try {
        const res = await me();
        const u = res.data;
        setProfile(u);
        // Prefill invoice fields from profile if available
        const ci = u?.companyInfo || {};
        const name = ci.companyName || ci.name || '';
        const tax = ci.taxNumber || ci.taxNo || '';
        if (name || tax) setForm(f => ({ ...f, company: f.company || name, taxNo: f.taxNo || tax }));
      } catch {}
    })();
  }, []);

  const onOrder = async () => {
    try {
      // Prefer approved profile company info; fall back to form inputs. Do not block missing company/tax; just warn once.
      const ci = profile?.companyInfo || {};
      const approved = profile?.companyInfoApprovalStatus === 'approved';
      const hasCompany = Boolean(ci?.companyName || ci?.name || form.company);
      const hasTax = Boolean(ci?.taxNumber || ci?.taxNo || form.taxNo);
      if (!hasCompany || !hasTax) {
        toast.warn('Fatura için Firma adı ve Vergi No eksik. Sipariş verildi, lütfen Ayarlar > Fatura Bilgileri bölümünü tamamlayın.');
      } else if (!approved) {
        toast.info('Kurumsal bilgileriniz onay bekliyor. Sipariş verildiğinde formdaki fatura bilgileri kullanılacaktır.');
      }
      const totalPrice = Math.max(0, subtotal - (Number(loyaltyUse)||0));
      if (!form.city || !form.address) return toast.error('Teslimat adresi eksik');
      const payload = {
        items: items.map(({product, quantity}) => ({ productId: product.id, quantity, price: (product.pricing?.salePrice || product.pricing?.basePrice || 0), name: product.name })),
        shippingAddress: { city: form.city, street: form.address },
        paymentMethod: form.paymentMethod,
        totalPrice,
        billing: { companyName: form.company || ci.companyName || ci.name || '', taxNumber: form.taxNo || ci.taxNumber || ci.taxNo || '' }
      };
      const res = await createOrder(payload);
      toast.success('Sipariş oluşturuldu');
      clear();
      nav(`/orders/${res.data?.orderId || 'last'}`);
    } catch (e) {
      toast.error('Sipariş başarısız');
    }
  };

  return (
    <Container sx={{ py:3 }}>
      <Typography variant="h5" gutterBottom>Siparişi Tamamla</Typography>
      {profile && profile.companyInfoApprovalStatus!=='approved' && (
        <Paper sx={{ p:1.5, mb:2, borderLeft:'4px solid #f59e0b' }}>
          <Typography variant="body2" color="text.secondary">
            Fatura bilgileri onay bekliyor veya eksik. Lütfen Ayarlar sayfasından güncelleyiniz.
          </Typography>
        </Paper>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p:2 }}>
            <Typography variant="h6">Fatura Bilgileri</Typography>
            <TextField label="Firma Adı" fullWidth sx={{ my:1 }} value={form.company} onChange={(e)=> setForm(f=> ({...f, company:e.target.value}))} />
            <TextField label="Vergi No" fullWidth sx={{ my:1 }} value={form.taxNo} onChange={(e)=> setForm(f=> ({...f, taxNo:e.target.value}))} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p:2 }}>
            <Typography variant="h6">Teslimat Bilgileri</Typography>
            <TextField label="Şehir" fullWidth sx={{ my:1 }} value={form.city} onChange={(e)=> setForm(f=> ({...f, city:e.target.value}))} error={required.city} helperText={required.city ? 'Zorunlu alan' : ''} />
            <TextField label="Adres" fullWidth sx={{ my:1 }} value={form.address} onChange={(e)=> setForm(f=> ({...f, address:e.target.value}))} error={required.address} helperText={required.address ? 'Zorunlu alan' : ''} />
            <TextField select label="Ödeme Yöntemi" fullWidth sx={{ my:1 }} value={form.paymentMethod} onChange={(e)=> setForm(f=> ({...f, paymentMethod:e.target.value}))}>
              <MenuItem value="credit_card">Kredi Kartı</MenuItem>
              <MenuItem value="bank_transfer">Havale/EFT</MenuItem>
            </TextField>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt:1 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p:2 }}>
            <Typography variant="subtitle1" fontWeight={700}>Özet</Typography>
            <Divider sx={{ my:1 }} />
            {items.map(({product, quantity})=> (
              <Stack key={product.id} direction="row" justifyContent="space-between" sx={{ py:.5 }}>
                <Typography variant="body2">{product.name} × {quantity}</Typography>
                <Typography variant="body2">{((product.pricing?.salePrice || product.pricing?.basePrice || 0)*quantity).toLocaleString('tr-TR')} TL</Typography>
              </Stack>
            ))}
            <Divider sx={{ my:1 }} />
            <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Ara Toplam</Typography><Typography variant="body2">{subtotal.toLocaleString('tr-TR')} TL</Typography></Stack>
            {coupon && <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Kupon</Typography><Typography variant="body2">{coupon}</Typography></Stack>}
            {!!loyaltyUse && <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Sadakat Kullanımı</Typography><Typography variant="body2">-{Number(loyaltyUse).toLocaleString('tr-TR')} TL</Typography></Stack>}
          </Paper>
        </Grid>
      </Grid>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mt:2 }}>
        <FormControlLabel control={<Checkbox checked={accepted} onChange={(e)=>setAccepted(e.target.checked)} />} label="Satış sözleşmesi ve KVKK metnini kabul ediyorum." />
  <Button variant="contained" onClick={onOrder} disabled={!canSubmit}>Sipariş Ver</Button>
      </Stack>
    </Container>
  );
}
