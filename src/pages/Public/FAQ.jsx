import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Typography, Paper, TextField, InputAdornment, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, Chip, Stack, Button } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { useLocation, useNavigate } from 'react-router-dom';

const DATA = [
  // Genel
  { id: 'what', cat: 'Genel', q: 'Odyostore nedir?', a: 'İşitme merkezleri ve tedarikçileri bir araya getiren B2B tedarik platformudur.' },
  { id: 'who-can-use', cat: 'Genel', q: 'Kimler kullanabilir?', a: 'Odyostore, işitme merkezleri ve yetkili tedarikçiler için tasarlanmıştır.' },
  { id: 'supported-browsers', cat: 'Genel', q: 'Hangi tarayıcıları destekliyorsunuz?', a: 'Güncel Chrome, Edge, Firefox ve Safari tarayıcılarının son iki sürümü.' },
  // Hesap
  { id: 'register', cat: 'Hesap', q: 'Kayıt nasıl çalışır?', a: 'İki adımda kurumsal ve giriş bilgileri tamamlanır; admin onayı sonrası giriş yapılır.' },
  { id: 'approval-time', cat: 'Hesap', q: 'Onay süresi ne kadar?', a: 'Başvurular genellikle 1 iş günü içinde değerlendirilir.' },
  { id: 'password-reset', cat: 'Hesap', q: 'Şifremi unuttum, nasıl sıfırlarım?', a: 'Giriş sayfasındaki “Şifremi Unuttum” bağlantısından e-posta ile sıfırlayabilirsiniz.' },
  // Sadakat
  { id: 'loyalty', cat: 'Sadakat', q: 'Sadakat kredisi nasıl kazanılır?', a: 'Tamamlanan sipariş sayınıza göre seviyeniz ve kredi miktarınız artar. İlk sipariş öncesi seviye 0’dır.' },
  { id: 'loyalty-use', cat: 'Sadakat', q: 'Puanlarımı nasıl kullanırım?', a: 'Sepet ekranında “Puan Kullan” alanından mevcut krediniz kadar indirimi uygulayabilirsiniz.' },
  { id: 'loyalty-limits', cat: 'Sadakat', q: 'Puan kullanımında sınır var mı?', a: 'Kullanım, kupon sonrası kalan tutarla ve mevcut krediyle sınırlıdır.' },
  // Sipariş
  { id: 'invoice', cat: 'Sipariş', q: 'Faturamı nasıl alırım?', a: 'Sipariş detayından PDF fatura indirebilirsiniz.' },
  { id: 'shipping', cat: 'Sipariş', q: 'Kargo durumunu nasıl takip ederim?', a: 'Sipariş detayında kargo takibini görebilirsiniz.' },
  { id: 'order-cancel', cat: 'Sipariş', q: 'Siparişimi iptal edebilir miyim?', a: 'Hazırlık öncesi iptal edilebilir. Kargoya verildiyse iade süreci uygulanır.' },
  // Ödeme
  { id: 'payment-methods', cat: 'Ödeme', q: 'Hangi ödeme yöntemleri mevcut?', a: 'Banka havalesi ve anlaşmalı koşullara göre kredili ödeme seçenekleri.' },
  { id: 'payment-failure', cat: 'Ödeme', q: 'Ödeme başarısız oldu, ne yapmalıyım?', a: 'Ödeme tekrar deneyin; sorun sürerse destek ile iletişime geçin.' },
  // Güvenlik
  { id: 'security', cat: 'Güvenlik', q: 'Verilerim güvende mi?', a: 'TLS ile şifreleme, rol bazlı yetkilendirme ve kayıt izleme uygulanır.' },
  { id: 'session', cat: 'Güvenlik', q: 'Oturumum neden kapandı?', a: 'Güvenlik için belirli süre hareketsizlikte oturum kapatılır veya token süresi dolar.' },
  // İade
  { id: 'returns', cat: 'İade', q: 'İade koşulları nelerdir?', a: 'Hasarlı veya yanlış ürünlerde iade kabul edilir; detaylar sözleşmede belirtilir.' },
  { id: 'refund-time', cat: 'İade', q: 'İade/geri ödeme süresi?', a: 'Ürün kontrolü sonrası 3-7 iş günü içinde süreç tamamlanır.' },
];

const CATS = ['Tümü','Genel','Hesap','Sadakat','Sipariş','Ödeme','Güvenlik','İade'];

function highlight(text, query){
  if (!query) return text;
  try {
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    return text.replace(re, '<mark style="background:#fde68a;color:#111827;padding:0 2px;border-radius:2px;">$1</mark>');
  } catch { return text; }
}

export default function FAQ(){
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Tümü');
  const [expanded, setExpanded] = useState(null);
  const location = useLocation();
  const nav = useNavigate();

  const items = useMemo(() => {
    return DATA.filter(it => (cat==='Tümü' || it.cat===cat) && (q==='' || it.q.toLowerCase().includes(q.toLowerCase())));
  }, [q, cat]);

  // İlk arama sonucunu otomatik aç
  useEffect(() => {
    if (q && items.length) setExpanded(items[0].id);
  }, [q, items]);

  // Hash ile derin bağlantı (#id)
  useEffect(() => {
    const id = (location.hash || '').replace('#','');
    if (!id) return;
    const target = DATA.find(d => d.id === id);
    if (target) {
      setCat('Tümü');
      setExpanded(id);
      setTimeout(() => {
        const el = document.getElementById(`faq-${id}`);
        if (el) el.scrollIntoView({ behavior:'smooth', block:'center' });
      }, 50);
    }
  }, [location.hash]);

  return (
    <Box sx={{ py:6, minHeight:'100vh', background:'#0b1220' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p:3, borderRadius:3, border:'1px solid rgba(255,255,255,0.08)', background:'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))', color:'#e5e7eb', backdropFilter:'blur(10px)' }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1.25, mb:2 }}>
            <Box sx={{ width:44, height:44, borderRadius:3, display:'grid', placeItems:'center', background:'rgba(255,255,255,0.08)' }}>
              <HelpOutlineRoundedIcon />
            </Box>
            <Typography variant="h5" fontWeight={900}>SSS</Typography>
          </Box>
          <TextField
            fullWidth
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Bir soru ara..."
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> }}
            sx={{
              mb:2,
              '& .MuiInputBase-root':{
                background:'rgba(255,255,255,0.9)'
              }
            }}
          />
          <Tabs value={cat} onChange={(_,v)=>setCat(v)} textColor="inherit"
            sx={{
              minHeight:40,
              '& .MuiTab-root':{ minHeight:40, color:'#cbd5e1' },
              '& .Mui-selected':{ color:'#fff', fontWeight:900 }
            }}
          >
            {CATS.map(c => <Tab key={c} value={c} label={c} />)}
          </Tabs>
          <Stack sx={{ mt:2 }} spacing={1.5}>
            {items.length === 0 ? (
              <Box>
                <Typography color="#cbd5e1" sx={{ mb:1 }}>Sonuç bulunamadı.</Typography>
                <Button variant="contained" color="warning" onClick={()=>nav('/contact')}>Bize Ulaşın</Button>
              </Box>
            ) : items.map(it => (
              <Accordion id={`faq-${it.id}`} key={it.id} expanded={expanded===it.id} onChange={() => setExpanded(expanded===it.id?null:it.id)}
                TransitionProps={{ unmountOnExit:true }}
                sx={{
                  background:'linear-gradient(180deg,rgba(8,14,29,0.8),rgba(11,18,32,0.9))',
                  color:'#e5e7eb',
                  border:'1px solid rgba(255,255,255,0.06)',
                  borderRadius:2,
                  '&:before':{ display:'none' }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ color:'#94a3b8' }} />}>
                  <Typography fontWeight={800} component="div" dangerouslySetInnerHTML={{ __html: highlight(it.q, q) }} />
                  <Chip size="small" label={it.cat} sx={{ ml:1.25 }} />
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="#cbd5e1">{it.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
