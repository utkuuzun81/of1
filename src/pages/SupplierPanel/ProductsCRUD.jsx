import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Paper, Stack, Button, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../../store/authSlice';
import { listSupplierProducts, createProduct, updateProduct, softDeleteProduct, uploadProductImage, deleteProductImage, setPrimaryProductImage } from '../../api/productsApi';
import { toast } from 'react-toastify';

export default function ProductsCRUD(){
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'', pricing:{ basePrice:0, currency:'TRY' }, sku:'', brand:'', media:{ images:[] } });
  const [tab, setTab] = useState(0);

  const load = async () => {
    try {
      const res = await listSupplierProducts(user?.id);
      setRows(res.data || []);
    } catch { /* noop */ }
  };
  useEffect(()=>{ load(); },[]);

  const columns = useMemo(()=>[
    { field:'sku', headerName:'SKU', width:140 },
    { field:'name', headerName:'Ürün', flex:1 },
    { field:'brand', headerName:'Marka', width:140 },
    { field:'price', headerName:'Fiyat', width:140, valueGetter:(p)=> p.row?.pricing?.salePrice || p.row?.pricing?.basePrice, valueFormatter:(p)=> `${(p.value||0).toLocaleString('tr-TR')} TRY` },
  ],[]);

  const onNew = () => { setEditing(null); setForm({ name:'', pricing:{ basePrice:0, currency:'TRY' }, sku:'', brand:'' }); setOpen(true); };
  const onEdit = (row) => { setEditing(row); setForm({ ...row, pricing: row.pricing || { basePrice:0, currency:'TRY' }, media: row.media || { images: [] } }); setTab(0); setOpen(true); };
  const onDelete = async (row) => {
    try { await softDeleteProduct(row.id); toast.success('Silindi'); load(); } catch { toast.error('Silinemedi'); }
  };
  const onSave = async () => {
    try {
      const payload = { ...form, supplierInfo: { ...(form.supplierInfo||{}), supplierId: user?.id } };
      if (editing) await updateProduct(editing.id, payload); else await createProduct(payload);
      toast.success('Kaydedildi');
      setOpen(false); load();
    } catch { toast.error('Kaydedilemedi'); }
  };

  return (
    <Container sx={{ py:3 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb:1 }}>
        <Typography variant="h6">Ürün Yönetimi</Typography>
        <Button variant="contained" onClick={onNew}>Yeni Ürün</Button>
      </Stack>
      <Paper sx={{ height: 520 }}>
        <DataGrid rows={rows} getRowId={(r)=> r.id} columns={[...columns, {
          field:'actions', headerName:'İşlemler', width:200, sortable:false, filterable:false,
          renderCell:(p)=> (
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={()=> onEdit(p.row)}>Düzenle</Button>
              <Button size="small" color="error" onClick={()=> onDelete(p.row)}>Sil</Button>
            </Stack>
          )
        }]} disableRowSelectionOnClick />
      </Paper>

      <Dialog open={open} onClose={()=> setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Ürün Düzenle' : 'Yeni Ürün'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt:0.5 }}>
            <Stack direction="row" spacing={2}>
              <Button variant={tab===0?'contained':'outlined'} onClick={()=> setTab(0)}>Genel</Button>
              {editing && <Button variant={tab===1?'contained':'outlined'} onClick={()=> setTab(1)}>Medya</Button>}
            </Stack>
            {tab===0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField label="Ürün Adı" fullWidth value={form.name||''} onChange={(e)=> setForm(f=> ({...f, name:e.target.value}))} /></Grid>
                <Grid item xs={6}><TextField label="SKU" fullWidth value={form.sku||''} onChange={(e)=> setForm(f=> ({...f, sku:e.target.value}))} /></Grid>
                <Grid item xs={6}><TextField label="Marka" fullWidth value={form.brand||''} onChange={(e)=> setForm(f=> ({...f, brand:e.target.value}))} /></Grid>
                <Grid item xs={6}><TextField label="Fiyat" type="number" fullWidth value={form.pricing?.basePrice || 0} onChange={(e)=> setForm(f=> ({...f, pricing:{...f.pricing, basePrice:Number(e.target.value)}}))} /></Grid>
                <Grid item xs={6}><TextField label="Para Birimi" fullWidth value={form.pricing?.currency || 'TRY'} onChange={(e)=> setForm(f=> ({...f, pricing:{...f.pricing, currency:e.target.value}}))} /></Grid>
              </Grid>
            )}
            {tab===1 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <input type="file" accept="image/*" onChange={async (e)=>{
                    const file = e.target.files?.[0];
                    if (!file || !editing) return;
                    try {
                      const res = await uploadProductImage(editing.id, file, { alt: editing.name, isPrimary: !(form.media?.images?.length) });
                      setForm(f=> ({...f, media: { ...f.media, images: res.data?.images || f.media?.images || [] } }));
                      toast.success('Görsel yüklendi');
                    } catch { toast.error('Yükleme başarısız'); }
                  }} />
                </Grid>
                {(form.media?.images || []).map(img => (
                  <Grid item xs={3} key={img.id}>
                    <Stack spacing={1} alignItems="center">
                      <img src={img.url} alt={img.alt||''} style={{ width:'100%', height:100, objectFit:'cover', borderRadius:8 }} />
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={async ()=>{
                          try {
                            const res = await setPrimaryProductImage(editing.id, img.id);
                            setForm(f=> ({...f, media:{...f.media, images: res.data?.images || f.media.images }}));
                            toast.success('Kapak güncellendi');
                          } catch { toast.error('Kapak güncellenemedi'); }
                        }}>Kapak Yap</Button>
                        <Button size="small" color="error" onClick={async ()=>{
                          try { await deleteProductImage(editing.id, img.id); setForm(f=> ({...f, media:{...f.media, images: (f.media.images||[]).filter(x=> x.id!==img.id) }})); toast.success('Silindi'); } catch { toast.error('Silinemedi'); }
                        }}>Sil</Button>
                      </Stack>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={onSave}>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
