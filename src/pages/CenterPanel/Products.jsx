import React, { useEffect, useMemo, useState } from 'react';
import { Container, Grid, Card, CardActionArea, CardContent, Typography, Chip, Box, TextField, InputAdornment, Pagination, Stack as MuiStack, Button, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { listProducts, listCategories as apiListCategories, listBrands as apiListBrands } from '../../api/productsApi';
import { useSearch } from '../../store/searchSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';

export default function Products(){
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const location = useLocation();
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const { query: searchQ, results, clear } = useSearch();
  useEffect(()=>{
    if (results && results.length) {
      setQ(searchQ || '');
      setPage(1);
      clear();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  // replaced by useMemo below
  const [categories, setCategories] = useState(['all']);
  const [brands, setBrands] = useState(['all']);
  useEffect(()=>{ apiListCategories().then((res)=> setCategories(['all', ...(res.data?.map(c=>c.name)||[])])); },[]);
  useEffect(()=>{ apiListBrands().then((res)=> setBrands(['all', ...(res.data||[])])); },[]);
  // pick initial filters from URL
  useEffect(()=>{
    const sp = new URLSearchParams(location.search);
    const c = sp.get('category');
    const b = sp.get('brand');
    if (c) setCategory(c);
    if (b) setBrand(b);
    if (c || b) setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(()=>{
    const run = async()=>{
      const params = { q: q || undefined, page, limit: pageSize, sort };
      if (category !== 'all') params.category = category;
      if (brand !== 'all') params.brand = brand;
      setLoading(true);
      setError(null);
      try {
        const res = await listProducts(params);
        const data = res.data;
        if (Array.isArray(data)) {
          setItems(data);
          setTotalPages(1);
        } else {
          setItems(data.items || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (e) {
        setItems([]);
        setTotalPages(1);
        setError('Ürünler yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [q, category, brand, page, sort]);

  return (
    <Container sx={{ py:3 }}>
      <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mb:2 }}>
        <TextField placeholder="Ürün adı, marka…" fullWidth value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} InputProps={{ startAdornment:(<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
        <ToggleButtonGroup size="small" exclusive value={category} onChange={(_,v)=> { if (v) { setCategory(v); setPage(1);} }} sx={{ flexWrap:'wrap' }}>
          {categories.map((c)=> (<ToggleButton key={c} value={c}>{c==='all'?'Tümü':c}</ToggleButton>))}
        </ToggleButtonGroup>
        <ToggleButtonGroup size="small" exclusive value={brand} onChange={(_,v)=> { if (v) { setBrand(v); setPage(1);} }} sx={{ flexWrap:'wrap' }}>
          {brands.map((b)=> (<ToggleButton key={b} value={b}>{b==='all'?'Tüm Markalar':b}</ToggleButton>))}
        </ToggleButtonGroup>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="sort-label">Sırala</InputLabel>
          <Select labelId="sort-label" label="Sırala" value={sort} onChange={(e)=> { setSort(e.target.value); setPage(1); }}>
            <MenuItem value="newest">En yeni</MenuItem>
            <MenuItem value="name_asc">Ada göre (A-Z)</MenuItem>
            <MenuItem value="name_desc">Ada göre (Z-A)</MenuItem>
            <MenuItem value="price_asc">Fiyat (Artan)</MenuItem>
            <MenuItem value="price_desc">Fiyat (Azalan)</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      {loading && (
        <Box sx={{ display:'flex', justifyContent:'center', py:6 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && error && (
        <Typography color="error" sx={{ py:2 }}>{error}</Typography>
      )}
      {!loading && !error && items.length === 0 && (
        <Box sx={{ textAlign:'center', py:6 }}>
          <Typography variant="h6">Kriterlere uygun ürün bulunamadı</Typography>
          <Typography variant="body2" sx={{ mt:1 }}>Filtreleri temizleyip tekrar deneyin.</Typography>
          <Button variant="text" sx={{ mt:2 }} onClick={()=>{ setBrand('all'); setCategory('all'); setQ(''); setPage(1); }}>Filtreleri Temizle</Button>
        </Box>
      )}
      {!loading && !error && items.length > 0 && (
        <>
          <Grid container spacing={2}>
            {items.map((p)=> (
              <Grid key={p.id} item xs={12} md={3}>
                <Card elevation={0} sx={{ borderRadius:3, overflow:'hidden', '&:hover':{ boxShadow: '0 8px 30px rgba(0,0,0,.12)' } }}>
                  <CardActionArea onClick={()=>nav(`/product/${p.id}`)}>
                    <Box sx={{ height:140, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {p.media?.images?.length ? (
                        <img src={p.media.images[0].url} alt={p.name} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }} />
                      ) : (
                        <Box sx={{ color:'#999' }}>Görsel yok</Box>
                      )}
                    </Box>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={800}>{p.name}</Typography>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1, my:1 }}>
                        {p.pricing?.salePrice ? (
                          <>
                            <Typography color="primary" fontWeight={800}>{p.pricing.salePrice} {p.pricing.currency}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textDecoration:'line-through' }}>{p.pricing.basePrice}</Typography>
                          </>
                        ) : (
                          <Typography color="primary" fontWeight={800}>{p.pricing?.basePrice} {p.pricing?.currency}</Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip size="small" label="Sadakat" color="primary" variant="outlined" />
                        {(p.category?.name || p.categoryName || p.categoryId) && <Chip size="small" label={p.category?.name || p.categoryName || p.categoryId} />}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <MuiStack alignItems="center" sx={{ mt:2 }}>
              <Pagination count={totalPages} page={page} onChange={(_,v)=> setPage(v)} color="primary" />
            </MuiStack>
          )}
        </>
      )}
    </Container>
  );
}
