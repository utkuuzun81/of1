import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct, listProducts } from '../../api/productsApi';
import { Container, Grid, Card, CardContent, Typography, Button, Tabs, Tab, Box, ImageList, ImageListItem, Link, Stack, Chip } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import CreditIndicator from '../../components/Loyalty/CreditIndicator.jsx';
import GamificationBanner from '../../components/Loyalty/GamificationBanner.jsx';
import { useCart } from '../../store/cartSlice';

export default function ProductDetail(){
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [tab, setTab] = useState(0);
  const [activeImg, setActiveImg] = useState(null);
  const { add } = useCart();

  useEffect(()=>{ getProduct(id).then((res)=> setProduct(res.data)); },[id]);
  useEffect(()=>{
    (async()=>{
      if (!product) return;
      try {
        const res = await listProducts();
        const catKey = product.category?.name || product.categoryName || product.categoryId;
        const rel = (res.data||[]).filter(p=> (p.id!==product.id) && ((p.category?.name||p.categoryName||p.categoryId)===catKey)).slice(0,4);
        setRelated(rel);
      } catch { /* noop */ }
    })();
  },[product]);
  if (!product) return null;
  const images = product.media?.images || [];
  const primary = activeImg || images.find(i=> i.isPrimary) || images[0];

  return (
    <>
    <Container sx={{ py:3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ p:2 }}>
            <Box sx={{ background:'#fff', height:320, borderRadius:2, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {primary ? <img src={primary.url} alt={primary.alt||product.name} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }} /> : <Box sx={{ color:'#999' }}>Görsel yok</Box>}
            </Box>
            {images.length>1 && (
              <ImageList cols={6} gap={8} sx={{ mt:1 }}>
                {images.map((img)=> (
                  <ImageListItem key={img.id} onClick={()=> setActiveImg(img)} sx={{ cursor:'pointer', border: activeImg?.id===img.id ? '2px solid #1976d2' : '1px solid #eee', borderRadius:1, overflow:'hidden' }}>
                    <img src={img.url} alt={img.alt||''} style={{ width:'100%', height:60, objectFit:'cover' }} />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h5" fontWeight={800}>{product.name}</Typography>
              <Typography color="primary" fontWeight={800} sx={{ my:1 }}>{(product.pricing?.salePrice || product.pricing?.basePrice)} {product.pricing?.currency}</Typography>
              <CreditIndicator />
              <GamificationBanner message="Bu ürünle yıldız seviyen artacak!" />
              <Button variant="contained" sx={{ mt:2 }} onClick={()=>add(product,1)}>Sepete Ekle</Button>
              <Tabs sx={{ mt:3 }} value={tab} onChange={(_,v)=>setTab(v)}>
                <Tab label="Açıklama" />
                <Tab label="Teknik Bilgi" />
                <Tab label="Belgeler" />
              </Tabs>
              <Box sx={{ py:2 }}>
                {tab===0 && <Typography whiteSpace="pre-line">{product.description || 'Açıklama yok.'}</Typography>}
                {tab===1 && (
                  <Box component="dl" sx={{ display:'grid', gridTemplateColumns:'1fr 2fr', rowGap:1, columnGap:2 }}>
                    {Object.entries(product.specifications?.technical || {}).map(([k,v])=> (
                      <React.Fragment key={k}>
                        <Typography component="dt" color="text.secondary">{k}</Typography>
                        <Typography component="dd">{String(v)}</Typography>
                      </React.Fragment>
                    ))}
                  </Box>
                )}
                {tab===2 && (
                  <Stack spacing={1}>
                    {(product.media?.documents || []).map(doc => {
                      const isPdf = (doc.type || doc.mime || '').includes('pdf') || (doc.name||'').toLowerCase().endsWith('.pdf');
                      const sizeKB = doc.size ? Math.round(doc.size/1024) : null;
                      return (
                        <Stack key={doc.id} direction="row" alignItems="center" spacing={1}>
                          {isPdf ? <PictureAsPdfIcon color="error" fontSize="small"/> : <DescriptionIcon color="action" fontSize="small"/>}
                          <Link href={doc.url} target="_blank" rel="noopener">{doc.name || doc.type || 'Belge'}</Link>
                          {sizeKB && <Chip size="small" label={`${sizeKB} KB`} />}
                        </Stack>
                      );
                    })}
                    {(!product.media?.documents || product.media.documents.length===0) && <Typography>Belge bulunmuyor.</Typography>}
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
  </Container>
  {related.length>0 && (
      <Container sx={{ py:1 }}>
        <Typography variant="h6" sx={{ mb:1 }}>Benzer Ürünler</Typography>
        <Grid container spacing={2}>
          {related.map(r=> (
            <Grid item xs={12} md={3} key={r.id}>
              <Card elevation={0} onClick={()=> window.location.assign(`/product/${r.id}`)} sx={{ cursor:'pointer' }}>
                <Box sx={{ height:120, display:'flex', alignItems:'center', justifyContent:'center', background:'#fff' }}>
                  {r.media?.images?.[0]?.url ? <img src={r.media.images[0].url} alt={r.name} style={{ maxWidth:'100%', maxHeight:'100%' }} /> : <Box sx={{ color:'#999' }}>Görsel yok</Box>}
                </Box>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700}>{r.name}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    )}
    </>
  );
}
