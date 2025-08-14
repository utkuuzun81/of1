import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Stack, TextField, Button, Alert, FormControlLabel, Switch, Divider } from '@mui/material';
import api from '../../api/client';

export default function AdminSettings(){
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    pendingApprovalRedirectMs: 60000,
    maintenanceMode: false,
    commissionRate: 0.05,
    quickSellDiscount: 10,
    quickSellMinDiscount: 0,
    quickSellMaxDiscount: 50,
    quickSellEnabled: true
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/settings/system');
        const sys = res.data?.systemSettings || {};
        if (mounted) setForm({
          pendingApprovalRedirectMs: typeof sys.pendingApprovalRedirectMs === 'number' ? sys.pendingApprovalRedirectMs : 60000,
          maintenanceMode: Boolean(sys.maintenanceMode),
          commissionRate: typeof sys.commissionRate === 'number' ? sys.commissionRate : 0.05,
          quickSellDiscount: typeof sys.quickSellDiscount === 'number' ? sys.quickSellDiscount : 10,
          quickSellMinDiscount: typeof sys.quickSellMinDiscount === 'number' ? sys.quickSellMinDiscount : 0,
          quickSellMaxDiscount: typeof sys.quickSellMaxDiscount === 'number' ? sys.quickSellMaxDiscount : 50,
          quickSellEnabled: Boolean(sys.quickSellEnabled ?? true)
        });
      } catch {/* ignore */}
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const onSave = async () => {
    setSaving(true); setMessage('');
    try {
      // Normalize and ensure min/max consistency
      const minD = Number(form.quickSellMinDiscount);
      const maxD = Number(form.quickSellMaxDiscount);
      const payload = {
        pendingApprovalRedirectMs: Number(form.pendingApprovalRedirectMs) || 60000,
        maintenanceMode: Boolean(form.maintenanceMode),
        commissionRate: Number(form.commissionRate),
        quickSellDiscount: Number(form.quickSellDiscount),
        quickSellMinDiscount: Number.isFinite(minD) ? Math.max(0, Math.min(100, Math.min(minD, maxD))) : 0,
        quickSellMaxDiscount: Number.isFinite(maxD) ? Math.max(0, Math.min(100, Math.max(minD, maxD))) : 50,
        quickSellEnabled: Boolean(form.quickSellEnabled)
      };
      const res = await api.put('/api/settings/system', payload);
      const sys = res.data?.systemSettings || {};
      setForm({
        pendingApprovalRedirectMs: sys.pendingApprovalRedirectMs ?? payload.pendingApprovalRedirectMs,
        maintenanceMode: Boolean(sys.maintenanceMode),
        commissionRate: typeof sys.commissionRate === 'number' ? sys.commissionRate : payload.commissionRate,
        quickSellDiscount: typeof sys.quickSellDiscount === 'number' ? sys.quickSellDiscount : payload.quickSellDiscount,
        quickSellMinDiscount: typeof sys.quickSellMinDiscount === 'number' ? sys.quickSellMinDiscount : payload.quickSellMinDiscount,
        quickSellMaxDiscount: typeof sys.quickSellMaxDiscount === 'number' ? sys.quickSellMaxDiscount : payload.quickSellMaxDiscount,
        quickSellEnabled: Boolean(sys.quickSellEnabled ?? payload.quickSellEnabled)
      });
      setMessage('Ayarlar kaydedildi.');
    } catch (e) {
      setMessage('Kayıt başarısız.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container sx={{ py:3 }}>
      <Typography variant="h5" sx={{ mb:2 }}>Sistem Ayarları</Typography>
      <Paper sx={{ p:3 }}>
        <Stack spacing={2}>
          <FormControlLabel
            control={<Switch checked={form.maintenanceMode} onChange={(e)=> setForm(f=>({ ...f, maintenanceMode: e.target.checked }))} />}
            label="Sistem Tadilat Modu (Maintenance)"
          />
          <TextField
            type="number"
            label="Onay ekranı bekleme süresi (ms)"
            value={form.pendingApprovalRedirectMs}
            onChange={(e)=> setForm(f => ({ ...f, pendingApprovalRedirectMs: e.target.value }))}
            helperText="Kullanıcı onaylandığında yönlendirme için bekleme süresi. Örn: 60000 = 60 saniye"
            inputProps={{ min: 0, step: 1000 }}
          />
          <Divider>İş Kuralları</Divider>
          <TextField
            type="number"
            label="Komisyon Oranı (%)"
            value={Math.round((Number(form.commissionRate)||0)*10000)/100}
            onChange={(e)=> {
              const v = Math.max(0, Math.min(100, Number(e.target.value)));
              setForm(f => ({ ...f, commissionRate: v/100 }));
            }}
            helperText="Platform komisyon oranı. Örn: 5 = %5"
            inputProps={{ min: 0, max: 100, step: 0.1 }}
          />
          <TextField
            type="number"
            label="Hızlı Sat İskontosu (%)"
            value={Number(form.quickSellDiscount)}
            onChange={(e)=> setForm(f => ({ ...f, quickSellDiscount: Math.max(0, Math.min(100, Number(e.target.value))) }))}
            helperText="Hızlı Sat sistem birim fiyatı = Tahmini Birim x (1 - iskonto/100)"
            inputProps={{ min: 0, max: 100, step: 1 }}
          />
          <FormControlLabel
            control={<Switch checked={form.quickSellEnabled} onChange={(e)=> setForm(f=>({ ...f, quickSellEnabled: e.target.checked }))} />}
            label="Hızlı Sat özelliğini etkinleştir"
          />
          <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
            <TextField
              type="number"
              label="Hızlı Sat Min İskonto (%)"
              value={Number(form.quickSellMinDiscount)}
              onChange={(e)=> setForm(f => ({ ...f, quickSellMinDiscount: Math.max(0, Math.min(100, Number(e.target.value))) }))}
              helperText="İzin verilen en düşük iskonto"
              inputProps={{ min: 0, max: 100, step: 1 }}
            />
            <TextField
              type="number"
              label="Hızlı Sat Max İskonto (%)"
              value={Number(form.quickSellMaxDiscount)}
              onChange={(e)=> setForm(f => ({ ...f, quickSellMaxDiscount: Math.max(0, Math.min(100, Number(e.target.value))) }))}
              helperText="İzin verilen en yüksek iskonto"
              inputProps={{ min: 0, max: 100, step: 1 }}
            />
          </Stack>
          <Alert severity="info">Hızlı Sat iskonto aralığı: {Math.min(form.quickSellMinDiscount, form.quickSellMaxDiscount)}% - {Math.max(form.quickSellMinDiscount, form.quickSellMaxDiscount)}%</Alert>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={onSave} disabled={saving || loading}>Kaydet</Button>
          </Stack>
          {message && <Alert severity="info">{message}</Alert>}
        </Stack>
      </Paper>
    </Container>
  );
}
