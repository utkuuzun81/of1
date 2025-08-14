import React, { useMemo, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Link,
  Chip,
  Alert,
  Stack,
  Button,
  IconButton,
  Drawer,
} from '@mui/material';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useNavigate } from 'react-router-dom';

export default function Manual(){
  const navigate = useNavigate();
  const updatedAt = useMemo(() => new Date().toLocaleString('tr-TR'), []);
  const [activeId, setActiveId] = useState('baslangic');
  const [tocOpen, setTocOpen] = useState(false);

  const toc = [
    { id:'baslangic', label:'Başlangıç: Giriş ve Kayıt' },
    { id:'ust-cubuk', label:'Navigasyon ve Üst Çubuk' },
    { id:'arama-urunler', label:'Arama ve Ürünler' },
    { id:'sepet-odeme', label:'Sepet ve Ödeme' },
    { id:'ayarlar', label:'Ayarlar' },
    { id:'sirket-bilgileri', label:'Fatura ve Kurum Bilgileri' },
    { id:'sadakat', label:'Sadakat Sistemi' },
    { id:'siparis-teklif', label:'Siparişler ve Teklifler' },
    { id:'bildirimler', label:'Bildirimler' },
    { id:'admin', label:'Yönetici Onayları' },
    { id:'tedarikci-entegrasyon', label:'Tedarikçi ve Entegrasyonlar' },
    { id:'sss-destek', label:'SSS ve Destek' },
  ];

  const Section = ({ id, title, children }) => (
    <Box id={id} sx={{ scrollMarginTop: 96 }}>
      <Paper elevation={0} sx={{ p:{ xs:1.5, sm:2, md:2.5 }, borderRadius:3 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>{title}</Typography>
        <Divider sx={{ mb:2 }} />
        <Box sx={{ display:'grid', gap:1.25 }}>{children}</Box>
      </Paper>
    </Box>
  );

  const Callout = ({ type='info', title, children }) => (
    <Alert severity={type} variant="outlined" icon={false} sx={{ borderRadius:2 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>{title}</Typography>
      <Typography variant="body2" sx={{ opacity:0.85 }}>{children}</Typography>
    </Alert>
  );

  // Scroll spy to highlight active section in TOC
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a,b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { root: null, rootMargin: '-120px 0px -40% 0px', threshold: [0.25, 0.5, 0.75] }
    );
    toc.forEach(t => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Hash deep-link support on initial load
  useEffect(() => {
    const hash = decodeURIComponent((window.location.hash || '').replace('#',''));
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveId(hash);
        }
      }, 60);
    }
  }, []);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
    if (history.replaceState) history.replaceState(null, '', `#${id}`);
  };

  return (
    <Container sx={{ py: 4 }}>
      {/* Back/Home controls */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1 }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Button size="small" variant="text" startIcon={<ArrowBackIosNewOutlinedIcon />} onClick={()=>{
            if (window.history.length > 1) navigate(-1); else navigate('/');
          }} aria-label="Geri">
            Geri
          </Button>
          <Button size="small" variant="outlined" onClick={()=> setTocOpen(true)} sx={{ display:{ xs:'inline-flex', md:'none' } }}>
            İçindekiler
          </Button>
        </Box>
        <IconButton onClick={()=> navigate('/')} aria-label="Ana Sayfa">
          <HomeOutlinedIcon />
        </IconButton>
      </Box>
      {/* Hero */}
      <Paper elevation={0} sx={{ p:2.25, borderRadius:3, background:'linear-gradient(135deg, rgba(31,41,55,0.88), rgba(17,24,39,0.88))', color:'#fff', position:'relative', overflow:'hidden', mb:3 }}>
        <Box sx={{ position:'absolute', right:-20, top:-20, opacity:0.12 }}>
          <MenuBookOutlinedIcon sx={{ fontSize:160 }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight:800 }} gutterBottom>Kullanma Kılavuzu</Typography>
        <Typography variant="body2" sx={{ opacity:0.85 }}>
          Odyostore uygulamasının temel işlevleri ve en iyi uygulamalar. Bu kılavuz, oturum açmaktan
          sipariş oluşturmaya, ayarları yönetmekten şirket bilgisi onay sürecine kadar adım adım rehber sunar.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap:'wrap' }}>
          <Chip size="small" color="default" variant="outlined" label={`Son güncelleme: ${updatedAt}`} />
          <Chip size="small" variant="outlined" label="v1.0 — Web" />
        </Stack>
      </Paper>

      <Grid container spacing={3} alignItems="flex-start">
        {/* TOC */}
  <Grid item xs={12} md={4} lg={3} sx={{ display:{ xs:'none', md:'block' } }}>
          <Paper elevation={0} sx={{ p:2, borderRadius:3, position:{ md:'sticky' }, top:{ md:84 } }}>
            <Typography variant="subtitle2" sx={{ fontWeight:800, mb:1 }}>İçindekiler</Typography>
            <List dense disablePadding>
              {toc.map(item => (
                <ListItemButton
                  key={item.id}
                  component="a"
                  href={`#${item.id}`}
                  onClick={scrollTo(item.id)}
                  selected={activeId === item.id}
                  sx={{
                    borderRadius:1,
                    '&.Mui-selected': { bgcolor: 'action.selected' },
                  }}
                >
                  <ListItemText primaryTypographyProps={{ fontSize:14 }} primary={item.label} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Content */}
        <Grid item xs={12} md={8} lg={9}>
          <Stack spacing={3}>
              <Section id="baslangic" title="Başlangıç: Giriş ve Kayıt">
                <Typography variant="body2">
                  Hesabınızla <Link href="/login">/login</Link> adresinden giriş yapın. Parolanızı unuttuysanız, giriş ekranındaki
                  “Şifremi Unuttum” bağlantısını kullanarak e‑posta ile sıfırlama bağlantısı talep edebilirsiniz. Güvenlik için
                  giriş tarih/saat ve cihaz bilgileri hesapta tutulur. İki Aşamalı Doğrulama (MFA) desteği yakında eklenecektir.
                </Typography>
                <Callout title="İpucu">
                  Güvenli parolalar kullanın ve ekip içinde paylaşmayın. Şüpheli oturumlarda Ayarlar → Oturum Yönetimi’nden çıkış yapın.
                </Callout>
              </Section>

              <Section id="ust-cubuk" title="Navigasyon ve Üst Çubuk">
                <Typography variant="body2">
                  Üst çubuk; Ana Sayfa, Kullanma Kılavuzu, İletişim, Ayarlar ve Sepet kısayollarını içerir. Sağda hava durumu yer alır.
                </Typography>
                <Typography variant="body2">
                  — Ana Sayfa: Rolünüze göre uygun panele götürür. <br/>
                  — Kılavuz: Bu sayfa (<Link href="/manual">/manual</Link>). <br/>
                  — İletişim: Telefon/E‑posta/WhatsApp bilgilerini popover içinde gösterir ve kopyalama yapmanıza izin verir. <br/>
                  — Ayarlar: <Link href="/settings">/settings</Link>. <br/>
                  — Sepet: Anlık sepet özeti popover’ı; ürün kaldırma, sepete gitme (<Link href="/cart">/cart</Link>) ve ödeme (<Link href="/checkout">/checkout</Link>) kısayolları.
                </Typography>
                <Typography variant="body2">
                  Hava durumu göstergesi konumunuza göre anlık sıcaklık sağlar. Tıkladığınızda konum adı, kaynak ve son güncelleme
                  bilgilerini görürsünüz. Ayarlar’dan sıcaklık birimini °C/°F seçebilirsiniz.
                </Typography>
                <Callout type="info" title="Veri kaynakları">
                  Konum için tarayıcı konum izni veya IP tabanlı tahmin; hava verisi için Open‑Meteo kullanılır. 10 dk. önbellekleme yapılır.
                </Callout>
              </Section>

              <Section id="arama-urunler" title="Arama ve Ürünler">
                <Typography variant="body2">
                  Ürün liste sayfasında arama kutusuyla ürün adı/marka bazlı arama yapabilirsiniz. Arama metnini temizlemek sayfayı
                  varsayılana döndürür. Gelişmiş filtreler ve kategori bazlı gezinme proje kapsamına göre eklenebilir.
                </Typography>
              </Section>

              <Section id="sepet-odeme" title="Sepet ve Ödeme">
                <Typography variant="body2">
                  Sepet simgesine tıklayınca mini önizleme çıkar; ürünleri kaldırabilir, adetleri sayfada düzenleyebilir veya tam
                  sepet sayfasına geçebilirsiniz. Ödemeye geçmeden önce firma bilgileri gerekliliklerini dikkate alın.
                </Typography>
                <Typography variant="body2">
                  Çıkış (Checkout) koşulları: Fatura ve Kurum Bilgileri doldurulmuş ve “Onaylı” olmalıdır. Bilgiler “Beklemede” ise,
                  ödeme akışı engellenir ve onay sonrası otomatik açılır.
                </Typography>
                <Callout type="warning" title="Önemli">
                  Şirket bilgilerinizde değişiklik yaptıysanız, onaylanana kadar önceki onaylı bilgiler faturada kullanılmaya devam eder.
                </Callout>
              </Section>

              <Section id="ayarlar" title="Ayarlar">
                <Typography variant="body2">
                  Ayarlar sayfası; Dil ve Tema, Sıcaklık Birimi, Bildirimler ve Sesler, UTS Numarası, Fatura ve Kurum Bilgileri,
                  Hesap ve Güvenlik, Oturum Yönetimi bölümlerinden oluşur.
                </Typography>
                <Typography variant="body2">
                  — Dil ve Tema: Uygulama dili, görünüm (Açık/Koyu/Sistem) ve sıcaklık birimi (°C/°F). <br/>
                  — Bildirimler ve Sesler: Sipariş/Mesaj/Sistem ses düzeyi ve açık/kapalı durumu; test butonu ile ön dinleme. <br/>
                  — UTS Numarası: Kurumsal kayıtta verilen UTS numarası; sadece okunur, kopya butonu mevcuttur. <br/>
                  — Hesap ve Güvenlik: Profil kısayolu ve şifre sıfırlama. <br/>
                  — Oturum Yönetimi: Son giriş bilgileri ve çıkış butonları.
                </Typography>
              </Section>

              <Section id="sirket-bilgileri" title="Fatura ve Kurum Bilgileri">
                <Typography variant="body2">
                  Firma adı, vergi no, adres ve web sitesi gibi bilgiler bu bölümden düzenlenir. Kaydettiğinizde bilgiler doğrudan
                  kullanılmaz; önce “Onay Bekliyor” statüsüne geçer ve bir yönetici onayı gerekir. Onaylanınca “Onaylı” olur ve
                  faturalarınızda yeni bilgiler kullanılmaya başlar.
                </Typography>
                <Typography variant="body2">
                  Durum göstergesi: Onaylı / Beklemede / —. Beklemede iken alanlar düzenlemeye kapatılır. İptal etmek isterseniz
                  onay sürecini bekleyin veya destekle iletişime geçin.
                </Typography>
                <Callout type="success" title="Adım adım">
                  1) Ayarlar → Fatura ve Kurum Bilgileri’ni doldurun. 2) Kaydet/Onaya Gönder’e basın. 3) Yönetici onayından sonra
                  Checkout kullanılabilir hâle gelir ve faturada onaylı bilgiler yer alır.
                </Callout>
              </Section>

              <Section id="sadakat" title="Sadakat Sistemi">
                <Typography variant="body2">
                  Sadakat puanlarınızı uygun sepetlerde kullanabilirsiniz. Puan kullanım sınırları ve kuralları kampanyalara göre
                  değişebilir. Sepet ekranında kullanılabilir puanlar ve indiriminiz görüntülenir.
                </Typography>
              </Section>

              <Section id="siparis-teklif" title="Siparişler ve Teklifler">
                <Typography variant="body2">
                  Sipariş geçmişinizi filtreleyebilir, durumları görüntüleyebilir ve gerekirse teklif talebi oluşturabilirsiniz.
                  Teklifler, onay veya güncelleme sonrası sepete aktarılabilir.
                </Typography>
              </Section>

              <Section id="bildirimler" title="Bildirimler">
                <Typography variant="body2">
                  Uygulama içi bildirimler üst çubuktaki zil ikonu ve ilgili sayfalarda görünür. Ses tercihlerinizi Ayarlar →
                  Bildirimler ve Sesler kısmından yönetebilirsiniz.
                </Typography>
              </Section>

              <Section id="admin" title="Yönetici Onayları">
                <Typography variant="body2">
                  Yönetici panelinde bekleyen “Fatura ve Kurum Bilgileri” başvuruları listelenir. Yönetici onayladığında bilgiler
                  onaylı hâle gelir; reddedildiğinde mevcut onaylı bilgiler geçerli kalır ve durum “—” veya “Reddedildi” olarak görünür.
                </Typography>
              </Section>

              <Section id="tedarikci-entegrasyon" title="Tedarikçi ve Entegrasyonlar">
                <Typography variant="body2">
                  Tedarikçi başvurusu ve ERP/Kargo/WhatsApp gibi entegrasyon modülleri proje yol haritasındadır. Aktif olduğunda
                  duyurulacaktır. Şimdilik ilgili alanlar bilgilendirme amaçlı “yakında” rozetleriyle gösterilir.
                </Typography>
              </Section>

        <Section id="sss-destek" title="SSS ve Destek">
                <Typography variant="body2">
                  Sık sorulan sorular için SSS sayfasını ziyaret edin. Destek için üst çubuktaki İletişim popover’ından telefon,
                  e‑posta ve WhatsApp bilgilerine ulaşabilir, tek tıkla kopyalayabilirsiniz.
                </Typography>
                <Typography variant="body2">
                  Sorun bildirmek için ekran görüntüsü ve hata zamanını iletmeniz çözümü hızlandırır.
                </Typography>
              </Section>
      </Stack>
        </Grid>
      </Grid>

      {/* Mobile TOC Drawer */}
      <Drawer anchor="left" open={tocOpen} onClose={()=> setTocOpen(false)}>
        <Box sx={{ width: 280, p:2 }} role="presentation">
          <Typography variant="subtitle2" sx={{ fontWeight:800, mb:1 }}>İçindekiler</Typography>
          <List dense>
            {toc.map(item => (
              <ListItemButton key={item.id} onClick={(e)=>{ scrollTo(item.id)(e); setTocOpen(false); }} selected={activeId===item.id}>
                <ListItemText primaryTypographyProps={{ fontSize:14 }} primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </Container>
  );
}
