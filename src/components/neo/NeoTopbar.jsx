import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Box, IconButton, Typography, Tooltip, Badge, Avatar, Menu, MenuItem, Divider, InputBase, alpha, Popover, List, ListItem, ListItemText, Button, Stack } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import TabletAndroidOutlinedIcon from '@mui/icons-material/TabletAndroidOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LaunchIcon from '@mui/icons-material/Launch';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import NotificationPanel from '../../pages/Notifications/NotificationPanel';
import { useNotif } from '../../store/notifSlice';
import { useAuth } from '../../store/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchProducts } from '../../api/productsApi';
import { useSearch } from '../../store/searchSlice';
import { useSocket } from '../../hooks/useSocket';
import { useCart } from '../../store/cartSlice';

export default function NeoTopbar({ title='Panel' }){
  const [now, setNow] = useState(new Date());
  const [tempC, setTempC] = useState(null);
  const [tempUnit, setTempUnit] = useState(localStorage.getItem('ui.tempUnit') || 'C');
  const [locName, setLocName] = useState(null);
  const [locSource, setLocSource] = useState(null); // 'geo' | 'ip'
  const [open, setOpen] = useState(false);
  const { unread } = useNotif();
  const { user, clearSession } = useAuth();
  const { setQuery: setSearchQuery, setResults: setSearchResults } = useSearch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [contactEl, setContactEl] = useState(null);
  const [cartEl, setCartEl] = useState(null);
  const [weatherEl, setWeatherEl] = useState(null);
  const nav = useNavigate();
  const loc = useLocation();
  useSocket(user?.id);
  const { items, remove } = useCart();

  useEffect(()=>{ const t = setInterval(()=> setNow(new Date()), 1000); return ()=>clearInterval(t); },[]);
  // Listen storage changes for unit updates coming from Settings
  useEffect(() => {
    const onStorage = (e) => { if (e.key === 'ui.tempUnit') setTempUnit(e.newValue || 'C'); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  // Fetch weather once with caching (10 minutes)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const cache = JSON.parse(localStorage.getItem('weather_cache') || 'null');
        if (cache && Date.now() - cache.ts < 10*60*1000) {
          setTempC(cache.temp);
          setLocName(cache.name || null);
          setLocSource(cache.src || null);
          return;
        }
        const getCoords = () => new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('no-geo'));
          navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => reject(new Error('denied')),
            { enableHighAccuracy:false, timeout:5000, maximumAge:300000 }
          );
        });
        let lat, lon, name = null, src = 'geo';
        try {
          ({ lat, lon } = await getCoords());
          // Reverse geocode to a human-readable name (optional; disabled by default to reduce external calls)
          try {
            const enableReverse = String(import.meta.env.VITE_ENABLE_WEATHER_REVERSE || 'false') === 'true';
            if (enableReverse) {
              const r = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=tr&count=1`);
              if (r.ok) {
                const g = await r.json();
                const res = g?.results?.[0];
                if (res) name = [res.name, res.admin1, res.country_code].filter(Boolean).join(', ');
              }
            }
          } catch { /* ignore network errors silently */ }
        } catch {
          // Fallback to IP-based geolocation (no key)
          const ipRes = await fetch('https://ipapi.co/json/');
          const ip = await ipRes.json();
          lat = ip.latitude; lon = ip.longitude; src = 'ip';
          name = [ip.city, ip.region, ip.country_code].filter(Boolean).join(', ');
        }
        if (lat && lon) {
          const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`);
          const w = await wRes.json();
          const t = Math.round(w?.current?.temperature_2m ?? w?.current_weather?.temperature ?? 24);
          if (!cancelled) {
            setTempC(t);
            setLocName(name);
            setLocSource(src);
            localStorage.setItem('weather_cache', JSON.stringify({ temp: t, ts: Date.now(), lat, lon, name, src }));
          }
        }
      } catch {
        // ignore silently
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
  const [query, setQuery] = useState('');
  const [debounce, setDebounce] = useState(null);
  const onSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounce) clearTimeout(debounce);
  setDebounce(setTimeout(async () => {
      if (!val || val.trim().length < 2) return;
      try {
        const res = await searchProducts(val.trim());
    setSearchQuery(val.trim());
    setSearchResults(res.data || []);
        nav('/products');
      } catch (err) { /* ignore for now */ }
    }, 400));
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <Toolbar sx={{ gap:2 }}>
        <Box sx={{ display:'flex', gap:1 }}>
          <TopIcon Icon={HomeOutlinedIcon} active onClick={()=>{
            const role = (JSON.parse(localStorage.getItem('user')||'{}')?.role) || 'center';
            if (role === 'admin') nav('/admin');
            else if (role === 'supplier') nav('/supplier');
            else nav('/center');
          }} />
          {/* Kullanma Kılavuzu */}
          <TopIcon Icon={MenuBookOutlinedIcon} onClick={()=> nav('/manual')} />
          {/* İletişim */}
          <TopIcon Icon={ContactSupportOutlinedIcon} onClick={(e)=> setContactEl(e.currentTarget)} />
          {/* Ayarlar */}
          <TopIcon Icon={SettingsOutlinedIcon} onClick={()=> nav('/settings')} />
          {/* Kasa (Sepet önizleme + Checkout) */}
          <TopIcon Icon={PointOfSaleOutlinedIcon} onClick={(e)=> setCartEl(e.currentTarget)} badgeContent={items.length||0} />
          <TopIcon Icon={TabletAndroidOutlinedIcon} />
        </Box>
        <Typography sx={{ ml:1, fontWeight:800 }}>{title}</Typography>
        <Box sx={{ ml:'auto', display:'flex', alignItems:'center', gap:2 }}>
          {/* quick search placeholder */}
          <Box sx={{
            display:{ xs:'none', md:'flex' },
            alignItems:'center',
            gap:1,
            px:1.5,
            py:0.75,
            borderRadius:2,
            bgcolor: theme => alpha('#ffffff', 0.06),
            border:'1px solid rgba(255,255,255,0.06)'
          }}>
            <SearchRoundedIcon fontSize="small" />
            <InputBase value={query} onChange={onSearchChange} placeholder="Ürün ara…" sx={{ color:'#e5e7eb', width:220, fontSize:14 }} />
          </Box>
          <Box sx={{ display:'flex', alignItems:'center', gap:1, color:'#fbbf24', cursor:'pointer' }} onClick={(e)=> setWeatherEl(e.currentTarget)}>
            <WbSunnyIcon />
            <Typography variant="h6" sx={{ fontWeight:800 }}>
              {tempC!==null ? `${tempUnit==='F' ? Math.round((tempC*9)/5+32) : tempC}°${tempUnit}` : '…'}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity:0.7 }}>{now.toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' })}</Typography>
          <Tooltip title="Bildirimler">
            <IconButton color="inherit" onClick={()=>setOpen(true)}>
              <Badge color="error" badgeContent={unread}><NotificationsIcon sx={{ color:'#e5e7eb' }} /></Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Siteyi ziyaret et">
            <a href="/" style={{ textDecoration:'none' }} target="_blank" rel="noreferrer">
              <Box sx={{ px:2, py:1, borderRadius:3, bgcolor:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:1, color:'#e5e7eb' }}>
                <LaunchIcon fontSize="small" />
                <Typography variant="body2">Visit site</Typography>
              </Box>
            </a>
          </Tooltip>
          {/* user menu */}
          <Tooltip title={user?.name || 'Hesap'}>
            <IconButton onClick={(e)=>setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width:32, height:32, bgcolor:'primary.main' }}>{user?.name?.[0]?.toUpperCase() || 'U'}</Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
      <NotificationPanel open={open} onClose={()=>setOpen(false)} />
      {/* Weather popover */}
      <Popover
        open={Boolean(weatherEl)}
        anchorEl={weatherEl}
        onClose={()=> setWeatherEl(null)}
        anchorOrigin={{ vertical:'bottom', horizontal:'left' }}
        transformOrigin={{ vertical:'top', horizontal:'left' }}
      >
        <Box sx={{ p:2, maxWidth: 320 }}>
          <Typography variant="subtitle2" sx={{ fontWeight:700, mb:0.5 }}>Sıcaklık Bilgisi</Typography>
          <Typography variant="body2" sx={{ opacity:0.8 }}>
            Konum: {locName || 'Bilinmiyor'}
          </Typography>
          <Typography variant="body2" sx={{ opacity:0.6 }}>
            Kaynak: {locSource === 'geo' ? 'Cihaz konumu' : locSource === 'ip' ? 'IP konumu' : '—'}
          </Typography>
          <Typography variant="caption" sx={{ opacity:0.6, display:'block', mt:1 }}>
            Son güncelleme: {now.toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' })}
          </Typography>
          <Typography variant="caption" sx={{ opacity:0.6, display:'block' }}>
            Birim: °{tempUnit} (Ayarlardan değiştirilebilir)
          </Typography>
        </Box>
      </Popover>
      {/* Contact popover */}
      <Popover
        open={Boolean(contactEl)}
        anchorEl={contactEl}
        onClose={()=> setContactEl(null)}
        anchorOrigin={{ vertical:'bottom', horizontal:'left' }}
        transformOrigin={{ vertical:'top', horizontal:'left' }}
      >
        <Box sx={{ p:2, maxWidth: 320 }}>
          <Typography variant="subtitle2" sx={{ mb:1, fontWeight:700 }}>İletişim</Typography>
          <List dense>
            <ListItem
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton edge="end" component="a" href="tel:+908508502020"><CallOutlinedIcon fontSize="small"/></IconButton>
                  <IconButton edge="end" onClick={()=>navigator.clipboard?.writeText('+90 850 850 20 20')}><ContentCopyIcon fontSize="small"/></IconButton>
                  <IconButton edge="end" component="a" href="https://wa.me/908508502020" target="_blank" rel="noreferrer"><WhatsAppIcon fontSize="small"/></IconButton>
                </Stack>
              }
            >
              <ListItemText primary="Telefon" secondary="+90 850 850 20 20" />
            </ListItem>
            <ListItem
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton edge="end" component="a" href="mailto:destek@odyostore.com"><EmailOutlinedIcon fontSize="small"/></IconButton>
                  <IconButton edge="end" onClick={()=>navigator.clipboard?.writeText('destek@odyostore.com')}><ContentCopyIcon fontSize="small"/></IconButton>
                </Stack>
              }
            >
              <ListItemText primary="E‑posta" secondary="destek@odyostore.com" />
            </ListItem>
          </List>
          <Stack direction="row" spacing={1} sx={{ mt:1 }}>
            <Button variant="contained" size="small" href="/contact">İletişim Sayfası</Button>
            <Button size="small" onClick={()=> setContactEl(null)}>Kapat</Button>
          </Stack>
        </Box>
      </Popover>
      {/* Cart popover */}
      <Popover
        open={Boolean(cartEl)}
        anchorEl={cartEl}
        onClose={()=> setCartEl(null)}
        anchorOrigin={{ vertical:'bottom', horizontal:'left' }}
        transformOrigin={{ vertical:'top', horizontal:'left' }}
        PaperProps={{ sx:{ width: 380, maxWidth:'90vw' } }}
      >
        <Box sx={{ p:2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight:700, mb:1 }}>Sepet</Typography>
          {items.length === 0 ? (
            <Typography variant="body2" sx={{ opacity:0.7 }}>Sepetiniz boş.</Typography>
          ) : (
            <List dense sx={{ maxHeight: 260, overflow:'auto' }}>
              {items.map(({ product, quantity }) => (
                <ListItem key={product.id}
                  secondaryAction={<Button size="small" onClick={()=> remove(product.id)}>Sil</Button>}
                >
                  <ListItemText
                    primary={product.name}
                    secondary={`Adet: ${quantity} • Fiyat: ${(product.pricing?.salePrice || product.pricing?.basePrice || 0).toLocaleString('tr-TR')} TL`}
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt:1 }}>
            <Button size="small" onClick={()=>{ setCartEl(null); nav('/cart'); }}>Sepete Git</Button>
            <Button variant="contained" size="small" onClick={()=>{ setCartEl(null); nav('/checkout'); }}>Kasaya Git</Button>
          </Stack>
        </Box>
      </Popover>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={()=>setAnchorEl(null)}>
        <MenuItem onClick={()=>{ setAnchorEl(null); nav('/profile'); }}><PersonOutlineOutlinedIcon fontSize="small" style={{ marginRight:8 }} /> Profil</MenuItem>
  <MenuItem onClick={()=>{ setAnchorEl(null); nav('/settings'); }}><SettingsOutlinedIcon fontSize="small" style={{ marginRight:8 }} /> Ayarlar</MenuItem>
        <Divider />
        <MenuItem onClick={()=>{ setAnchorEl(null); clearSession(); nav('/login'); }}><LogoutRoundedIcon fontSize="small" style={{ marginRight:8 }} /> Çıkış</MenuItem>
      </Menu>
    </AppBar>
  );
}

function TopIcon({ Icon, active, onClick, badgeContent }){
  return (
    <Box onClick={onClick} sx={{ p:1, borderRadius:2, bgcolor: active? 'primary.main':'transparent', color: active? '#fff':'#e5e7eb', display:'grid', placeItems:'center', width:56, height:48, border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer' }}>
      {badgeContent ? (
        <Badge color="error" badgeContent={badgeContent} overlap="circular">
          <Icon />
        </Badge>
      ) : (
        <Icon />
      )}
    </Box>
  );
}
