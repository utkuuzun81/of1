import React, { useEffect, useMemo, useState } from 'react';
import { Container, Stack, Chip, TextField, MenuItem, Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-toastify';
import { listProducts, createProduct, updateProduct, updateProductStatus } from '../../api/productsApi';
import { useNavigate } from 'react-router-dom';

export default function AdminProducts(){
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('active'); // default: markette listelenenler
  const [brand, setBrand] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'', sku:'', brand:'', model:'', pricing:{ basePrice:0, salePrice:0, currency:'TRY' }, supplierInfo:{ supplierId:'', supplierSku:'' }, specifications:{ technical:{} }, status:'pending' });
  const [errors, setErrors] = useState({});
  const [autoSku, setAutoSku] = useState(true);

  const PRODUCT_TYPES = [
    { value:'hearing_aid', label:'İşitme Cihazı', code:'IC' },
    { value:'battery', label:'Pil', code:'PIL' },
    { value:'accessory', label:'Aksesuar', code:'AKS' }
  ];
  const CABINET_TYPES = [
    { value:'BTE', label:'Kulak Arkası (BTE)', code:'BTE' },
    { value:'RIC', label:'RIC', code:'RIC' },
    { value:'ITE', label:'Kulak İçi (ITE)', code:'ITE' },
    { value:'ITC', label:'ITC', code:'ITC' },
    { value:'CIC', label:'CIC', code:'CIC' },
    { value:'UNI', label:'Universal', code:'UNI' }
  ];
  const POWER_TYPES = [
    { value:'battery', label:'Pilli', code:'P' },
    { value:'rechargeable', label:'Şarjlı', code:'S' }
  ];
  const brandCode = (s='')=> (s||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3).padEnd(3,'X');
  const modelCode = (s='')=> (s||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4).padEnd(3,'0');
  const codeOf = (arr, val)=> arr.find(x=> x.value===val)?.code || 'NA';
  const genSku = (f)=>{
    const t = f?.specifications?.technical?.productType;
    const typeC = codeOf(PRODUCT_TYPES, t);
    const b = brandCode(f?.brand||'');
    const m = modelCode(f?.model||'');
    if (t === 'hearing_aid'){
      const cab = codeOf(CABINET_TYPES, f?.specifications?.technical?.cabinetType);
      const pow = codeOf(POWER_TYPES, f?.specifications?.technical?.powerType);
      return `${typeC}-${b}${m}-${cab}-${pow}`;
    }
    return `${typeC}-${b}${m}`;
  };
  useEffect(()=>{ if (autoSku) setForm(f=> ({ ...f, sku: genSku(f) })); }, [form.brand, form.model, form.specifications?.technical?.productType, form.specifications?.technical?.cabinetType, form.specifications?.technical?.powerType]);

  const load = async ()=>{
    try {
      setLoading(true);
      const res = await listProducts({ q: q || undefined, brand: brand || undefined, sort: 'newest' });
      const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
      const filtered = status ? data.filter(p => p.status === status) : data;
      setRows(filtered);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);
  useEffect(()=>{ load(); },[status]);

  const columns = useMemo(()=>[
    { field:'sku', headerName:'SKU', width:140 },
    { field:'name', headerName:'Ürün', flex:1 },
    { field:'brand', headerName:'Marka', width:160 },
    { field:'pricing', headerName:'Fiyat', width:160, valueGetter:(p)=> p.row?.pricing?.salePrice || p.row?.pricing?.basePrice || 0, valueFormatter:(p)=> `${Number(p.value||0).toLocaleString('tr-TR')} TL` },
    { field:'status', headerName:'Durum', width:140, renderCell:(p)=> <Chip size="small" label={p.value} color={p.value==='pending'?'warning':p.value==='active'?'success':p.value==='inactive'?'default':'default'} /> },
    { field:'createdAt', headerName:'Oluşturma', width:180, valueFormatter:(p)=> new Date(p?.value||Date.now()).toLocaleString('tr-TR') },
    { field:'actions', headerName:'İşlem', width:260, sortable:false, filterable:false, renderCell:(p)=> (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={async()=>{ await updateProductStatus(p.row.id, 'active'); toast.success('Aktif edildi'); await load(); }}>Aktifleştir</Button>
        <Button size="small" onClick={async()=>{ await updateProductStatus(p.row.id, 'inactive'); toast.info('Pasifleştirildi'); await load(); }}>Pasif</Button>
        <Button size="small" color="error" onClick={()=>{ setEditing(p.row); setForm({ ...p.row }); setDialogOpen(true); }}>Düzenle</Button>
      </Stack>
    )}
  ],[]);

  const startCreate = ()=>{ setEditing(null); setForm({ name:'', sku:'', brand:'', model:'', pricing:{ basePrice:0, salePrice:0, currency:'TRY' }, supplierInfo:{ supplierId:'', supplierSku:'' }, specifications:{ technical:{} }, status:'pending' }); setErrors({}); setAutoSku(true); setDialogOpen(true); };
  const save = async()=>{
    const payload = { ...form };
    const t = payload?.specifications?.technical?.productType;
    const e = {};
    if (!t) e.productType = 'Zorunlu';
    if (!payload.brand) e.brand = 'Zorunlu';
    if (!payload.model) e.model = 'Zorunlu';
    if (t==='hearing_aid'){
      if (!payload.specifications?.technical?.cabinetType) e.cabinetType = 'Zorunlu';
      if (!payload.specifications?.technical?.powerType) e.powerType = 'Zorunlu';
    }
    if (!payload.sku) e.sku = 'Zorunlu';
    setErrors(e);
    if (Object.keys(e).length){ toast.error('Zorunlu alanları doldurun'); return; }
    try {
      if (editing) { await updateProduct(editing.id, payload); toast.success('Ürün güncellendi'); }
      else {
        await createProduct(payload);
        toast.success('Ürün oluşturuldu');
        // Yeni ürünler çoğunlukla 'pending' olarak başlar; görünür olması için filtreyi pending'e al
        setStatus('pending');
      }
      setDialogOpen(false);
      await load();
    } catch { toast.error('Kayıt başarısız'); }
  };

  return (
    <Container sx={{ py:3 }}>
      {/* Top row: filters */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb:0.5, flexWrap:'wrap' }}>
        <Chip size="small" color="info" variant="outlined" label="Ürünler" />
        <TextField size="small" placeholder="Ara: ürün adı, SKU" value={q} onChange={(e)=> setQ(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} sx={{ minWidth:260 }} />
        <TextField size="small" select label="Durum" value={status} onChange={(e)=> setStatus(e.target.value)} sx={{ minWidth:160 }}>
          <MenuItem value="active">Aktif</MenuItem>
          <MenuItem value="pending">Bekleyen</MenuItem>
          <MenuItem value="inactive">Pasif</MenuItem>
          <MenuItem value="discontinued">Kaldırıldı</MenuItem>
          <MenuItem value="">Tümü</MenuItem>
        </TextField>
        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={startCreate}>Yeni Ürün</Button>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ ml:'auto' }}>
          <Tooltip title="Yenile"><IconButton size="small" onClick={load}><RefreshIcon /></IconButton></Tooltip>
        </Stack>
      </Stack>
      {/* Bottom row: grid */}
      <div style={{ height: 560, width:'100%' }}>
        <DataGrid
          rows={rows}
          loading={loading}
          getRowId={(r)=> r.id}
          columns={columns}
          onRowDoubleClick={(p)=> nav(`/admin/products/${p.row.id}`)}
          pageSizeOptions={[10,25,50]}
          initialState={{ pagination:{ paginationModel:{ pageSize:10 } } }}
        />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={()=> setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Ürün Düzenle' : 'Yeni Ürün'}</DialogTitle>
        <DialogContent sx={{ pt:1 }}>
          <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mt:1 }}>
            <TextField select required label="Ürün Tipi" fullWidth value={form.specifications?.technical?.productType||''}
              onChange={(e)=> setForm(f=>({ ...f, specifications:{ ...(f.specifications||{}), technical:{ ...(f.specifications?.technical||{}), productType: e.target.value } } }))}
              error={Boolean(errors.productType)} helperText={errors.productType||''}>
              {PRODUCT_TYPES.map(o=> <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
            <TextField label="Ürün Adı" fullWidth value={form.name} onChange={(e)=> setForm(f=>({ ...f, name:e.target.value }))} />
            <TextField required label="SKU" fullWidth value={form.sku} onChange={(e)=> { setAutoSku(false); setForm(f=>({ ...f, sku:e.target.value })); }} error={Boolean(errors.sku)} helperText={errors.sku||''} />
          </Stack>
          <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mt:2 }}>
            <TextField required label="Marka" fullWidth value={form.brand||''} onChange={(e)=> setForm(f=>({ ...f, brand:e.target.value }))} error={Boolean(errors.brand)} helperText={errors.brand||''} />
            <TextField required label="Model" fullWidth value={form.model||''} onChange={(e)=> setForm(f=>({ ...f, model:e.target.value }))} error={Boolean(errors.model)} helperText={errors.model||''} />
          </Stack>
          {form.specifications?.technical?.productType==='hearing_aid' && (
            <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mt:2 }}>
              <TextField select required label="Kabin Tipi" fullWidth value={form.specifications?.technical?.cabinetType||''}
                onChange={(e)=> setForm(f=>({ ...f, specifications:{ ...(f.specifications||{}), technical:{ ...(f.specifications?.technical||{}), cabinetType: e.target.value } } }))}
                error={Boolean(errors.cabinetType)} helperText={errors.cabinetType||''}>
                {CABINET_TYPES.map(o=> <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
              <TextField select required label="Pilli/Şarjlı" fullWidth value={form.specifications?.technical?.powerType||''}
                onChange={(e)=> setForm(f=>({ ...f, specifications:{ ...(f.specifications||{}), technical:{ ...(f.specifications?.technical||{}), powerType: e.target.value } } }))}
                error={Boolean(errors.powerType)} helperText={errors.powerType||''}>
                {POWER_TYPES.map(o=> <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Stack>
          )}
          <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mt:2 }}>
            <TextField label="Satış Fiyatı (TL)" type="number" fullWidth value={form.pricing?.salePrice||0} onChange={(e)=> setForm(f=>({ ...f, pricing:{ ...(f.pricing||{}), salePrice: Number(e.target.value) } }))} />
          </Stack>
          <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mt:2 }}>
            <TextField label="Tedarikçi ID" fullWidth value={form.supplierInfo?.supplierId||''} onChange={(e)=> setForm(f=>({ ...f, supplierInfo:{ ...(f.supplierInfo||{}), supplierId:e.target.value } }))} />
            <TextField label="Tedarikçi SKU" fullWidth value={form.supplierInfo?.supplierSku||''} onChange={(e)=> setForm(f=>({ ...f, supplierInfo:{ ...(f.supplierInfo||{}), supplierSku:e.target.value } }))} />
          </Stack>
          <TextField sx={{ mt:2 }} label="Açıklama" fullWidth multiline minRows={3} value={form.description||''} onChange={(e)=> setForm(f=>({ ...f, description:e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setDialogOpen(false)}>Vazgeç</Button>
          <Button onClick={save} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
