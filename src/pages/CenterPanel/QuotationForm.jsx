import React from 'react';
import { useAuth } from '../../store/authSlice';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Container, Paper, Stack, Typography, Button, ToggleButton, ToggleButtonGroup, Divider, Alert, Grid, Chip, Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FormText from '../../components/forms/FormText.jsx';
import { createQuotation } from '../../api/quotationsApi';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

function TextSummary({ label, value }){
  return (
    <Box sx={{ display:'flex', flexDirection:'column', justifyContent:'center', gap:0.5, minWidth: 240 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography>{value}</Typography>
    </Box>
  );
}

const baseSchema = z.object({
  title: z.string().min(2, 'Başlık zorunlu'),
  description: z.string().min(5, 'Açıklama zorunlu'),
  quantity: z.coerce.number().min(1, 'Adet en az 1'),
  targetMin: z.coerce.number().optional(),
  targetMax: z.coerce.number().optional(),
  productId: z.string().min(1, 'Ürün ID/Referans girin')
});

export default function QuotationForm(){
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [type, setType] = React.useState('quick-sell');
  const [commissionRate, setCommissionRate] = React.useState(0.05);
  const [quickSellDiscount, setQuickSellDiscount] = React.useState(10);
  const [quickSellEnabled, setQuickSellEnabled] = React.useState(true);
  const [qsMin, setQsMin] = React.useState(0);
  const [qsMax, setQsMax] = React.useState(50);
  React.useEffect(()=>{
    // read-only public endpoint
  fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/public/system')
      .then(r=>r.json()).then(d=>{
        const r = typeof d?.commissionRate === 'number' ? d.commissionRate : 0.05;
        setCommissionRate(r);
        setValue('commissionRate', r);
        const qd = typeof d?.quickSellDiscount === 'number' ? d.quickSellDiscount : 10;
        setQuickSellDiscount(qd);
        const enabled = Boolean(d?.quickSellEnabled ?? true);
        setQuickSellEnabled(enabled);
        setQsMin(typeof d?.quickSellMinDiscount === 'number' ? d.quickSellMinDiscount : 0);
        setQsMax(typeof d?.quickSellMaxDiscount === 'number' ? d.quickSellMaxDiscount : 50);
        // Respect deep link ?type=quick-sell|sell|buy
        const params = new URLSearchParams(loc.search);
        const qType = params.get('type');
        const valid = ['quick-sell','sell','buy'];
        if (qType && valid.includes(qType)) {
          setType(qType === 'quick-sell' && !enabled ? 'sell' : qType);
        } else if (!enabled) {
          // Avoid leaving UI in a disabled tab
          setType(t => t === 'quick-sell' ? 'sell' : t);
        }
      }).catch(()=>{});
  },[loc.search]);

  const dynamicResolver = React.useCallback(async (...args) => {
    // Only enforce baseSchema for 'buy' flow
    if (type === 'buy') return zodResolver(baseSchema)(...args);
    return { values: args[0] || {}, errors: {} };
  }, [type]);

  const { register, handleSubmit, watch, setValue, getValues, formState:{ errors, isSubmitting } } = useForm({
    resolver: dynamicResolver,
    defaultValues: { commissionRate: 0.05, paymentOption: 'cash' }
  });

  // Multi-item support for quick-sell/buy
  const [items, setItems] = React.useState([{ productId: '', quantity: 1, estimatedUnitPrice: undefined }]);
  const addItem = ()=> setItems([...items, { productId: '', quantity: 1 }]);
  const removeItem = (idx)=> setItems(items.filter((_,i)=> i!==idx));
  const updateItem = (idx, key, val)=> setItems(items.map((it,i)=> i===idx ? { ...it, [key]: val } : it));

  const qty = watch('quantity') || 0;
  const desiredUnitPrice = watch('desiredUnitPrice') || 0;
  const gross = React.useMemo(() => {
    if (type === 'sell') {
      return items.reduce((sum, it) => sum + ((Number(it.desiredUnitPrice)||0) * (Number(it.quantity)||0)), 0);
    }
    return Number(desiredUnitPrice) * Number(qty);
  }, [type, items, desiredUnitPrice, qty]);
  const commissionAmount = Math.round(gross * (commissionRate || 0) * 100) / 100;
  const passThrough = (watch('commissionPassThrough') || 'absorb') === 'pass';
  // If pass-through, net = gross (komisyon müşteri fiyatına eklenir). If absorb, net = gross - commission
  const net = Math.round((gross - (passThrough ? 0 : commissionAmount)) * 100) / 100;
  const customerTotal = Math.round(((passThrough ? (gross + commissionAmount) : gross)) * 100) / 100;
  const totalQtySell = React.useMemo(() => items.reduce((a,it)=> a + (Number(it.quantity)||0), 0), [items]);
  const customerUnit = totalQtySell > 0 ? Math.round((customerTotal / totalQtySell) * 100) / 100 : 0;

  const onSubmit = async (d) => {
    try {
      const payload = {
        requestType: type,
        supplierId: null,
        requestInfo: (type==='quick-sell')
          ? {
              title: 'Hızlı Sat Talebi',
              description: 'Hızlı sat otomatik oluşturuldu',
              quantity: items.reduce((a,it)=> a + Number(it.quantity||0), 0) || 1,
              budgetRange: { min: 0, max: 0, currency: 'TRY' }
            }
          : type==='buy' ? {
              title: d.title,
              description: d.description,
              quantity: Number(d.quantity),
              budgetRange: { min: Number(d.targetMin||0), max: Number(d.targetMax||0), currency: 'TRY' }
            } : {
              title: 'Satış Talebi',
              description: 'Satış talebi otomatik oluşturuldu',
              quantity: items.reduce((a,it)=> a + Number(it.quantity||0), 0) || 1,
              budgetRange: { min: 0, max: 0, currency: 'TRY' }
            },
        requestedItems: (type==='quick-sell')
          ? items.map(it => ({ productId: it.productId || d.productId, quantity: Number(it.quantity||d.quantity||1), estimatedUnitPrice: it.estimatedUnitPrice!=null ? Number(it.estimatedUnitPrice) : (d.estimatedUnitPrice?Number(d.estimatedUnitPrice):undefined) }))
          : (type==='buy')
            ? items.map(it => ({ productId: it.productId || d.productId, quantity: Number(it.quantity||d.quantity||1), estimatedUnitPrice: it.estimatedUnitPrice!=null ? Number(it.estimatedUnitPrice) : (d.estimatedUnitPrice?Number(d.estimatedUnitPrice):undefined) }))
            : items.map(it => ({ productId: it.productId, quantity: Number(it.quantity||1), estimatedUnitPrice: it.desiredUnitPrice!=null ? Number(it.desiredUnitPrice) : undefined }))
      };
      if (type === 'sell') {
        const totalQty = items.reduce((a,it)=> a + (Number(it.quantity)||0), 0);
        const totalGross = items.reduce((a,it)=> a + ((Number(it.desiredUnitPrice)||0) * (Number(it.quantity)||0)), 0);
        const avgUnit = totalQty > 0 ? Math.round((totalGross/totalQty)*100)/100 : 0;
        payload.sellInfo = { desiredUnitPrice: avgUnit, commissionRate: commissionRate, commissionPassThrough: d.commissionPassThrough || 'absorb' };
        if (!totalQty) throw new Error('En az bir ürün ve adet giriniz.');
      }
      if (type === 'buy') {
        payload.buyInfo = { paymentOption: d.paymentOption };
      }
      const res = await createQuotation(payload);
      const isQuick = type === 'quick-sell';
      toast.success(isQuick ? 'Hızlı Sat teklifi oluşturuldu' : 'Teklif talebi oluşturuldu');
      nav(`/quotations${res?.data?.id ? '/' + res.data.id : ''}`);
    } catch (e) { toast.error(e?.response?.data?.message || 'Oluşturma başarısız'); }
  };

  return (
    <Container sx={{ py:3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb:2 }}>
        <Typography variant="h6">Yeni Teklif Oluştur</Typography>
        <Typography variant="body2" color="text.secondary">Gönderen: {user?.personalInfo?.firstName} {user?.personalInfo?.lastName} • {user?.email}</Typography>
      </Stack>
      <Paper sx={{ p:2 }}>
        <Typography variant="h6" gutterBottom>Teklif Taleplerim</Typography>
  <ToggleButtonGroup exclusive value={type} onChange={(e,v)=> v && setType(v)} sx={{ mb:2 }}>
          <ToggleButton value="quick-sell" disabled={!quickSellEnabled}>Hızlı Sat!</ToggleButton>
          <ToggleButton value="sell">Satmak İstiyorum</ToggleButton>
          <ToggleButton value="buy">Almak İstiyorum</ToggleButton>
        </ToggleButtonGroup>

        {type === 'buy' && (
          <Alert severity="info" sx={{ mb:2 }}>Alım taleplerinde toplam adet en az 10 olmalıdır. Ödeme seçeneğini belirtin.</Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            {type === 'buy' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><FormText register={register} name="title" errors={errors} label="Başlık" /></Grid>
                <Grid item xs={12} md={6}><FormText register={register} name="productId" errors={errors} label="Ürün ID / Referans" /></Grid>
                <Grid item xs={12}><FormText register={register} name="description" errors={errors} label="Açıklama" /></Grid>
                <Grid item xs={12} md={4}><FormText register={register} name="quantity" errors={errors} label="Adet" type="number" /></Grid>
              </Grid>
            )}

            {/* Common budget range */}
            {type === 'buy' && (
              <>
                <Divider flexItem textAlign="left">Bütçe</Divider>
                <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
                  <FormText register={register} name="targetMin" errors={errors} label="Hedef Fiyat (Min)" type="number" />
                  <FormText register={register} name="targetMax" errors={errors} label="Hedef Fiyat (Max)" type="number" />
                </Stack>
              </>
            )}

            {/* Quick sell baseline */}
            {type === 'quick-sell' && (
              <>
                <Box sx={{ display:'flex', gap:2, flexWrap:'wrap', mb:1 }}>
                  <Chip label={`Toplam ≈ ${items.reduce((sum,it)=> {
                    const est = Number(it.estimatedUnitPrice);
                    if (!Number.isFinite(est) || est<=0) return sum;
                    const effDisc = Math.min(Math.max(quickSellDiscount, qsMin), qsMax);
                    const unit = Math.round(est * (1 - (effDisc/100)) * 100)/100;
                    return Math.round((sum + unit * Number(it.quantity||1)) * 100)/100;
                  },0)} TRY`} color="info" variant="outlined" />
                  <Chip label="Teklif 3 gün geçerli" variant="outlined" />
                  <Chip label={`Uygulanan İskonto: ${Math.min(Math.max(quickSellDiscount, qsMin), qsMax)}%`} variant="outlined" />
                </Box>
                <Divider flexItem textAlign="left">Ürünler</Divider>
                <Stack spacing={1}>
                  {items.map((it,idx)=> (
                    <Stack key={idx} direction={{ xs:'column', sm:'row' }} spacing={1} alignItems="center" sx={{ transition:'transform 120ms ease, background 120ms ease', '&:hover':{ transform:'translateY(-2px)', background:'action.hover', borderRadius:1, } }}>
                      <FormText value={it.productId} onChange={e=>updateItem(idx,'productId',e.target.value)} name={`_pi_${idx}`} register={()=>({})} errors={{}} label="Ürün ID" />
                      <FormText value={it.quantity} onChange={e=>updateItem(idx,'quantity',e.target.value)} name={`_qty_${idx}`} register={()=>({})} errors={{}} label="Adet" type="number" />
                      <FormText value={it.estimatedUnitPrice ?? ''} onChange={e=>updateItem(idx,'estimatedUnitPrice',e.target.value)} name={`_eu_${idx}`} register={()=>({})} errors={{}} label="Tahmini Birim (ops)" type="number" />
                      {Number(it.estimatedUnitPrice)>0 && (
                        <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
                          {(() => { const effDisc = Math.min(Math.max(quickSellDiscount, qsMin), qsMax); const unit = Math.round(Number(it.estimatedUnitPrice) * (1 - (effDisc/100)) * 100)/100; return <>
                            <Chip label={`Sistem Birim ≈ ${unit} TRY`} size="small" />
                            <Chip label={`Satır Toplam ≈ ${Math.round(unit * Number(it.quantity||1) * 100)/100} TRY`} size="small" />
                          </>; })()}
                        </Box>
                      )}
                      <IconButton onClick={()=>removeItem(idx)} aria-label="Sil"><DeleteIcon /></IconButton>
                    </Stack>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={addItem} variant="outlined" size="small">Ürün Ekle</Button>
                </Stack>
                {(Number.isFinite(qsMin) && Number.isFinite(qsMax)) && (
                  <Alert severity="info">Hızlı Sat iskonto aralığı: {Math.min(qsMin, qsMax)}% - {Math.max(qsMin, qsMax)}%</Alert>
                )}
              </>
            )}

            {/* Sell flow fields */}
            {type === 'sell' && (
              <>
                <Box sx={{ display:'flex', gap:2, flexWrap:'wrap', mb:1 }}>
                  <Chip label={`Toplam (Müşteri) ≈ ${isNaN(customerTotal) ? '-' : customerTotal} TRY`} color="info" variant="outlined" />
                  {totalQtySell>0 && <Chip label={`Ortalama Birim (Müşteri) ≈ ${customerUnit} TRY`} variant="outlined" />}
                </Box>
                <Divider flexItem textAlign="left">Ürünler</Divider>
                <Stack spacing={1}>
                  {items.map((it,idx)=> (
                    <Stack key={idx} direction={{ xs:'column', sm:'row' }} spacing={1} alignItems="center" sx={{ transition:'transform 120ms ease, background 120ms ease', '&:hover':{ transform:'translateY(-2px)', background:'action.hover', borderRadius:1, } }}>
                      <FormText value={it.productId} onChange={e=>updateItem(idx,'productId',e.target.value)} name={`s_pi_${idx}`} register={()=>({})} errors={{}} label="Ürün ID" />
                      <FormText value={it.quantity} onChange={e=>updateItem(idx,'quantity',e.target.value)} name={`s_qty_${idx}`} register={()=>({})} errors={{}} label="Adet" type="number" />
                      <FormText value={it.desiredUnitPrice ?? ''} onChange={e=>updateItem(idx,'desiredUnitPrice',e.target.value)} name={`s_du_${idx}`} register={()=>({})} errors={{}} label="Birim Fiyat" type="number" />
                      {Number(it.desiredUnitPrice)>0 && (
                        <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
                          {(() => { const rowGross = Math.round(Number(it.desiredUnitPrice) * Number(it.quantity||1) * 100)/100; const rowComm = Math.round(rowGross * (commissionRate||0) * 100)/100; const pass = (watch('commissionPassThrough')||'absorb')==='pass'; const custRow = pass ? rowGross + rowComm : rowGross; return <>
                            <Chip label={`Satır Brüt: ${rowGross} TRY`} size="small" />
                            <Chip label={`Müşteri Satır: ${Math.round(custRow*100)/100} TRY`} size="small" color={pass ? 'warning' : 'default'} />
                          </>; })()}
                        </Box>
                      )}
                      <IconButton onClick={()=>removeItem(idx)} aria-label="Sil"><DeleteIcon /></IconButton>
                    </Stack>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={addItem} variant="outlined" size="small">Ürün Ekle</Button>
                </Stack>
                <Divider flexItem textAlign="left">Satış Bilgileri</Divider>
                <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
                  <TextSummary label="Komisyon Oranı" value={`${(commissionRate*100).toFixed(1)}% (Admin)`} />
                </Stack>
                <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
                  <FormText
                    select
                    register={register}
                    name="commissionPassThrough"
                    errors={errors}
                    label="Komisyon Yansıtma"
                    SelectProps={{ native: true }}
                    defaultValue="absorb"
                  >
                    <option value="absorb">Komisyonu Ben Karşılayayım</option>
                    <option value="pass">Komisyonu Müşteriye Yansıt</option>
                  </FormText>
                  <TextSummary label="Özet" value={isNaN(net) ? '-' : `Net Gelir: ${net} TRY`} />
                </Stack>
                <Alert severity="success">
                  Tahmini Net Gelir: {isNaN(net) ? '-' : net} TRY • Komisyon: {isNaN(commissionAmount) ? '-' : commissionAmount} TRY • Müşteri Toplam: {isNaN(customerTotal) ? '-' : customerTotal} TRY{totalQtySell>0 ? ` • Müşteri Birim: ${customerUnit} TRY` : ''}
                </Alert>
                <Box sx={{ position:'sticky', bottom:0, backgroundColor:'background.paper', borderTop: (theme)=>`1px solid ${theme.palette.divider}`, py:1, px:2, mt:2, display:'flex', gap:1, flexWrap:'wrap' }}>
                  <Chip label={`Brüt: ${isNaN(gross) ? '-' : gross} TRY`} />
                  <Chip label={`Komisyon: ${isNaN(commissionAmount) ? '-' : commissionAmount} TRY`} />
                  <Chip label={`Net: ${isNaN(net) ? '-' : net} TRY`} color="success" />
                  <Chip label={`Müşteri: ${isNaN(customerTotal) ? '-' : customerTotal} TRY`} color="warning" />
                </Box>
              </>
            )}

            {/* Buy flow fields */}
            {type === 'buy' && (
              <>
                <Divider flexItem textAlign="left">Ödeme Seçeneği</Divider>
                <FormText
                  select
                  register={register}
                  name="paymentOption"
                  errors={errors}
                  label="Ödeme Türü"
                  SelectProps={{ native: true }}
                >
                  <option value="cash">Nakit</option>
                  <option value="installment">Taksit</option>
                </FormText>
              </>
            )}

            <Button type="submit" variant="contained" disabled={isSubmitting}>{type === 'quick-sell' ? 'Hızlı Teklif Al' : 'Gönder'}</Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
