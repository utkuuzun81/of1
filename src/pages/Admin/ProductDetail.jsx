import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Stack, TextField, MenuItem, Button, Chip, Tabs, Tab, Box, IconButton, Tooltip, Typography, Card, CardMedia, CardContent, CardActions, Grid, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-toastify';
import {
  getProduct,
  updateProduct,
  updateProductStatus,
  uploadProductImage,
  deleteProductImage,
  setPrimaryProductImage
} from '../../api/productsApi';

function Section({ title, children }){
  return (
    <Box sx={{ mt:2 }}>
      <Typography variant="subtitle1" sx={{ mb:1.5, color:'text.secondary' }}>{title}</Typography>
      {children}
    </Box>
  );
}

export default function AdminProductDetail(){
  const { id } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [prod, setProd] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [autoSku, setAutoSku] = useState(true);
  const fileRef = useRef(null);

  const load = async()=>{
    try {
      setLoading(true);
      const res = await getProduct(id);
      setProd(res.data);
      setForm(res.data);
    } catch { toast.error('Ürün yüklenemedi'); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[id]);

  const statusColor = useMemo(()=>({ pending:'warning', active:'success', inactive:'default', discontinued:'error' }),[]);

  // Options and SKU helpers
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

  // Auto-SKU when key fields change
  useEffect(()=>{
    if (!autoSku) return;
    setForm(f => ({ ...f, sku: genSku(f) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.brand, form?.model, form?.specifications?.technical?.productType, form?.specifications?.technical?.cabinetType, form?.specifications?.technical?.powerType]);

  const validate = (f)=>{
    const e = {};
    const t = f?.specifications?.technical?.productType;
    if (!t) e.productType = 'Zorunlu';
    if (!f?.brand) e.brand = 'Zorunlu';
    if (!f?.model) e.model = 'Zorunlu';
    if (t === 'hearing_aid'){
      if (!f?.specifications?.technical?.cabinetType) e.cabinetType = 'Zorunlu';
      if (!f?.specifications?.technical?.powerType) e.powerType = 'Zorunlu';
    }
    if (!f?.sku) e.sku = 'Zorunlu';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async()=>{
    const payload = { ...form };
    if (!validate(payload)) { toast.error('Zorunlu alanları doldurun'); return; }
    try { await updateProduct(id, payload); toast.success('Kaydedildi'); await load(); }
    catch { toast.error('Kayıt hatası'); }
  };

  const doStatus = async(s)=>{
    try { await updateProductStatus(id, s); toast.success('Durum güncellendi'); await load(); }
    catch { toast.error('Durum hata'); }
  };

  const images = prod?.media?.images || [];

  return (
    <Container sx={{ py:2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb:1 }}>
        <Tooltip title="Geri"><IconButton onClick={()=> nav('/admin/products')}><ArrowBackIcon /></IconButton></Tooltip>
        <Typography variant="h6" sx={{ flex:1 }}>{prod?.name || 'Ürün'}</Typography>
        <Chip size="small" label={prod?.status || '-'} color={statusColor[prod?.status]||'default'} />
        <Tooltip title="Yenile"><IconButton onClick={load}><RefreshIcon /></IconButton></Tooltip>
        <Button startIcon={<SaveIcon />} variant="contained" onClick={save} disabled={loading}>Kaydet</Button>
      </Stack>

      <Tabs value={tab} onChange={(_,v)=> setTab(v)} sx={{ mb:2 }}>
        <Tab label="Genel" />
        <Tab label="Fiyat" />
        <Tab label="Tedarikçi" />
        <Tab label="Medya" />
        <Tab label="SEO" />
        <Tab label="Durum" />
      </Tabs>

      {tab===0 && (
        <Box>
          <Section title="Temel Bilgiler">
            <Stack direction={{ xs:'column', md:'row' }} spacing={2}>
              <TextField select required label="Ürün Tipi" fullWidth value={form.specifications?.technical?.productType||''}
                onChange={(e)=> setForm(f=>({ ...f, specifications:{ ...(f.specifications||{}), technical:{ ...(f.specifications?.technical||{}), productType: e.target.value } } }))}
                error={Boolean(errors.productType)} helperText={errors.productType||''}>
                {PRODUCT_TYPES.map(o=> <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
              <TextField label="Ürün Adı" fullWidth value={form.name||''} onChange={(e)=> setForm(f=>({ ...f, name:e.target.value }))} />
              <TextField required label="SKU" fullWidth value={form.sku||''} onChange={(e)=> { setAutoSku(false); setForm(f=>({ ...f, sku:e.target.value })); }} error={Boolean(errors.sku)} helperText={errors.sku||''} />
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
            <TextField sx={{ mt:2 }} label="Açıklama" fullWidth multiline minRows={4} value={form.description||''} onChange={(e)=> setForm(f=>({ ...f, description:e.target.value }))} />
          </Section>
        </Box>
      )}

      {tab===1 && (
        <Box>
          <Section title="Fiyatlandırma">
            <Stack direction={{ xs:'column', md:'row' }} spacing={2}>
              <TextField type="number" label="Liste Fiyatı (TL)" fullWidth value={form.pricing?.basePrice||0} onChange={(e)=> setForm(f=>({ ...f, pricing:{ ...(f.pricing||{}), basePrice:Number(e.target.value) } }))} />
              <TextField type="number" label="Satış Fiyatı (TL)" fullWidth value={form.pricing?.salePrice||0} onChange={(e)=> setForm(f=>({ ...f, pricing:{ ...(f.pricing||{}), salePrice:Number(e.target.value) } }))} />
              <TextField type="number" label="KDV (%)" fullWidth value={form.pricing?.taxRate||0} onChange={(e)=> setForm(f=>({ ...f, pricing:{ ...(f.pricing||{}), taxRate:Number(e.target.value) } }))} />
            </Stack>
          </Section>
        </Box>
      )}

      {tab===2 && (
        <Box>
          <Section title="Tedarikçi Bilgileri">
            <Stack direction={{ xs:'column', md:'row' }} spacing={2}>
              <TextField label="Tedarikçi ID" fullWidth value={form.supplierInfo?.supplierId||''} onChange={(e)=> setForm(f=>({ ...f, supplierInfo:{ ...(f.supplierInfo||{}), supplierId:e.target.value } }))} />
              <TextField label="Tedarikçi SKU" fullWidth value={form.supplierInfo?.supplierSku||''} onChange={(e)=> setForm(f=>({ ...f, supplierInfo:{ ...(f.supplierInfo||{}), supplierSku:e.target.value } }))} />
            </Stack>
          </Section>
        </Box>
      )}

      {tab===3 && (
        <Box>
          <Section title="Görseller">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb:1 }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={async(e)=>{
                const file = e.target.files?.[0];
                if (!file) return;
                try { await uploadProductImage(id, file, { alt: form.name||'', isPrimary: images.length===0 }); toast.success('Görsel yüklendi'); await load(); }
                catch { toast.error('Yükleme hatası'); }
                finally { if (fileRef.current) fileRef.current.value = ''; }
              }} />
              <Button startIcon={<UploadIcon />} variant="outlined" onClick={()=> fileRef.current?.click()}>Görsel Yükle</Button>
            </Stack>
            <Grid container spacing={2}>
              {images.map(img => (
                <Grid item xs={12} sm={6} md={3} key={img.id}>
                  <Card variant="outlined" sx={{ height:'100%', display:'flex', flexDirection:'column' }}>
                    <CardMedia component="img" image={img.url} alt={img.alt||''} sx={{ height:180, objectFit:'cover' }} />
                    <CardContent sx={{ py:1, flex:1 }}>
                      <Typography variant="body2" noWrap>{img.alt || 'Görsel'}</Typography>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent:'space-between' }}>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title={img.isPrimary ? 'Kapak' : 'Kapağa al'}>
                          <IconButton color={img.isPrimary?'warning':'default'} onClick={async()=>{ await setPrimaryProductImage(id, img.id); await load(); }}>
                            {img.isPrimary ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      <Tooltip title="Sil">
                        <IconButton color="error" onClick={async()=>{ await deleteProductImage(id, img.id); toast.info('Silindi'); await load(); }}><DeleteOutlineIcon /></IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Section>
        </Box>
      )}

      {tab===4 && (
        <Box>
          <Section title="SEO">
            <TextField label="SEO Başlık" fullWidth sx={{ mb:2 }} value={form.seo?.title||''} onChange={(e)=> setForm(f=>({ ...f, seo:{ ...(f.seo||{}), title:e.target.value } }))} />
            <TextField label="SEO Açıklama" fullWidth multiline minRows={3} value={form.seo?.description||''} onChange={(e)=> setForm(f=>({ ...f, seo:{ ...(f.seo||{}), description:e.target.value } }))} />
          </Section>
        </Box>
      )}

      {tab===5 && (
        <Box>
          <Section title="Durum / Yayın">
            <Stack direction={{ xs:'column', md:'row' }} spacing={2}>
              <TextField select label="Durum" value={prod?.status||''} onChange={(e)=> doStatus(e.target.value)} sx={{ minWidth:220 }}>
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="pending">Bekleyen</MenuItem>
                <MenuItem value="inactive">Pasif</MenuItem>
                <MenuItem value="discontinued">Kaldırıldı</MenuItem>
              </TextField>
              <Button variant="outlined" onClick={save}>Kaydet</Button>
            </Stack>
          </Section>
        </Box>
      )}
    </Container>
  );
}
