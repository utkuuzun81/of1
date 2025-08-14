import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Slider,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  InputAdornment
} from '@mui/material';
import TextField from '@mui/material/TextField';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { getUserSettings, updateUserSettings } from '../../api/settingsApi';
import { me, forgotPassword, logout as apiLogout, updateProfile } from '../../api/authApi';
import { useAuth } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
export default function Settings(){
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({ userSettings: { marketingEmails:false, smsOptIn:false } });
  const [companyDraft, setCompanyDraft] = useState({ companyName:'', taxNumber:'', address:{ street:'', district:'', city:'', postalCode:'', country:'TR' }, website:'' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const nav = useNavigate();
  const { clearSession } = useAuth();
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    (async () => {
      try {
        const [meRes, setRes] = await Promise.all([me(), getUserSettings()]);
        setProfile(meRes.data);
        setSettings(setRes.data || { userSettings:{} });
        const raw = meRes.data?.companyInfoPending || meRes.data?.companyInfo || {};
        const companyName = raw.companyName || raw.name || '';
        const taxNumber = raw.taxNumber || raw.taxNo || '';
        const addr = raw.address || {};
        setCompanyDraft({
          companyName,
          taxNumber,
          address: {
            street: addr.street || '',
            district: addr.district || '',
            city: addr.city || '',
            postalCode: addr.postalCode || '',
            country: addr.country || 'TR'
          },
          website: raw.website || ''
        });
      } catch (e) {
        // ignore and keep defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const us = settings.userSettings || {};

  const onSave = async () => {
    setSaving(true);
    try {
      await updateUserSettings(us);
  // Persist lightweight UI prefs locally for immediate effect
  if (us?.ui?.theme) localStorage.setItem('ui.theme', us.ui.theme);
  if (us?.ui?.language) localStorage.setItem('ui.language', us.ui.language);
  if (us?.ui?.tempUnit) localStorage.setItem('ui.tempUnit', us.ui.tempUnit);
  if (us?.notificationSounds) localStorage.setItem('ui.sounds', JSON.stringify(us.notificationSounds));
  // Notify same-tab listeners (ThemeRoot) for instant update
  window.dispatchEvent(new Event('ui.theme.changed'));
    } finally {
      setSaving(false);
    }
  };

  const onPasswordReset = async () => {
    if (!profile?.email) return setConfirmOpen(false);
    try {
      await forgotPassword(profile.email);
    } finally {
      setConfirmOpen(false);
    }
  };

  // Theme toggling handled by ThemeRoot via localStorage + custom event

  // WebAudio test beep
  const playBeep = (frequency = 880, duration = 200, volume = 0.3) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(frequency, ctx.currentTime);
      g.gain.setValueAtTime(volume, ctx.currentTime);
      o.connect(g).connect(ctx.destination);
      o.start();
      setTimeout(() => { o.stop(); ctx.close(); }, duration);
    } catch {}
  };

  const logoutEverywhere = async () => {
    // Backend endpoint yok; yakında. Şimdilik mevcut oturumu kapat.
    try { await apiLogout(); } catch {}
    clearSession();
    nav('/login');
  };

  const submitCompanyInfo = async () => {
    try {
      setSaving(true);
      await updateProfile({ companyInfo: companyDraft }); // backend: pending kuyruğuna alıp onay bekletecek
      const meRes = await me();
      setProfile(meRes.data);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display:'flex', flexDirection:'column', gap:3 }}>
      {/* Hero */}
  <Paper elevation={0} sx={{ p:2.25, borderRadius:3, background:'linear-gradient(135deg, rgba(31,41,55,0.88), rgba(17,24,39,0.88))', color:'#fff', position:'relative', overflow:'hidden' }}>
        <Box sx={{ position:'absolute', right:-20, top:-20, opacity:0.12 }}>
          <SettingsOutlinedIcon sx={{ fontSize:160 }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight:800 }}>Ayarlar</Typography>
        <Typography variant="body2" sx={{ opacity:0.8, mt:0.5 }}>Hesap tercihlerinizi yönetin. Bu ayarlar profil bilgilerinizden bağımsızdır.</Typography>
        <Box sx={{ mt:1.5, display:'flex', gap:1, flexWrap:'wrap' }}>
          <Chip size="small" color="default" variant="outlined" label={profile?.email || ''} icon={<EmailOutlinedIcon />} />
          {profile?.role && <Chip size="small" variant="outlined" label={profile.role} />}
        </Box>
      </Paper>

  <Grid container spacing={2} alignItems="flex-start">
        {/* İletişim Tercihleri */}
        <Grid item xs={12} md={7}>
          {/* UTS Numarası (read-only) */}
          <Paper elevation={0} sx={{ p:2, borderRadius:3, mb:2 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
              <SettingsOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight:700 }}>UTS Numarası</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt:0.5 }}>
              Kurumsal kayıt sırasında verilen UTS numaranız. Bu alan sadece görüntülenir.
            </Typography>
            <Divider sx={{ my:2 }} />
            <TextField
              fullWidth
              size="small"
              label="UTS No"
              value={profile?.utsNo || profile?.companyInfo?.licenseNumber || ''}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={()=> navigator.clipboard?.writeText(profile?.utsNo || profile?.companyInfo?.licenseNumber || '')}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Paper>

          {/* Fatura ve Kurum Bilgileri */}
          <Paper elevation={0} sx={{ p:2, borderRadius:3, mt:2 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
              <SettingsOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight:700 }}>Fatura ve Kurum Bilgileri</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt:0.5 }}>
              Bu bilgiler sipariş faturasında kullanılacaktır. Güncellemeler admin onayı gerektirir.
            </Typography>
            <Divider sx={{ my:2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Firma Adı" fullWidth size="small" value={companyDraft.companyName}
                  onChange={(e)=> setCompanyDraft(s=> ({...s, companyName: e.target.value}))}
                  disabled={profile?.companyInfoApprovalStatus==='pending'} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Vergi No" fullWidth size="small" value={companyDraft.taxNumber}
                  onChange={(e)=> setCompanyDraft(s=> ({...s, taxNumber: e.target.value}))}
                  disabled={profile?.companyInfoApprovalStatus==='pending'} />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField label="Adres" fullWidth size="small" value={companyDraft.address?.street}
                  onChange={(e)=> setCompanyDraft(s=> ({...s, address:{...s.address, street:e.target.value}}))}
                  disabled={profile?.companyInfoApprovalStatus==='pending'} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="İlçe" fullWidth size="small" value={companyDraft.address?.district}
                  onChange={(e)=> setCompanyDraft(s=> ({...s, address:{...s.address, district:e.target.value}}))}
                  disabled={profile?.companyInfoApprovalStatus==='pending'} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Şehir" fullWidth size="small" value={companyDraft.address?.city}
                  onChange={(e)=> setCompanyDraft(s=> ({...s, address:{...s.address, city:e.target.value}}))}
                  disabled={profile?.companyInfoApprovalStatus==='pending'} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Posta Kodu" fullWidth size="small" value={companyDraft.address?.postalCode}
                  onChange={(e)=> setCompanyDraft(s=> ({...s, address:{...s.address, postalCode:e.target.value}}))}
                  disabled={profile?.companyInfoApprovalStatus==='pending'} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Ülke" fullWidth size="small" value={companyDraft.address?.country}
                  onChange={(e)=> setCompanyDraft(s=> ({...s, address:{...s.address, country:e.target.value}}))}
                  disabled={profile?.companyInfoApprovalStatus==='pending'} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Web Sitesi" fullWidth size="small" value={companyDraft.website}
                  onChange={(e)=> setCompanyDraft(s=> ({...s, website: e.target.value}))}
                  disabled={profile?.companyInfoApprovalStatus==='pending'} />
              </Grid>
            </Grid>
            <Box sx={{ display:'flex', gap:1.5, justifyContent:'space-between', alignItems:'center', mt:2 }}>
              <Typography variant="body2" color="text.secondary">
                Durum: {profile?.companyInfoApprovalStatus==='pending' ? 'Onay Bekliyor' : profile?.companyInfoApprovalStatus==='approved' ? 'Onaylı' : '—'}
              </Typography>
              <Button variant="contained" onClick={submitCompanyInfo} disabled={saving || profile?.companyInfoApprovalStatus==='pending'}>
                {profile?.companyInfoApprovalStatus==='pending' ? 'Onay Bekleniyor' : 'Kaydet/Onaya Gönder'}
              </Button>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p:2, borderRadius:3 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
              <EmailOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight:700 }}>İletişim Tercihleri</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt:0.5 }}>
              Odyostore’dan bilgilendirme ve kampanya mesajları almak isteyip istemediğinizi seçin.
            </Typography>
            <Divider sx={{ my:2 }} />
            <Box sx={{ display:'grid', gap:1.5 }}>
              <FormControlLabel
                control={<Switch checked={!!us.marketingEmails}
                                 onChange={(e)=> setSettings(s=> ({...s, userSettings:{...us, marketingEmails:e.target.checked}}))} />}
                label={<Box sx={{ display:'flex', alignItems:'center', gap:1 }}><EmailOutlinedIcon fontSize="small"/> <span>Pazarlama e-postaları</span></Box>} />
              <FormControlLabel
                control={<Switch checked={!!us.smsOptIn}
                                 onChange={(e)=> setSettings(s=> ({...s, userSettings:{...us, smsOptIn:e.target.checked}}))} />}
                label={<Box sx={{ display:'flex', alignItems:'center', gap:1 }}><SmsOutlinedIcon fontSize="small"/> <span>SMS bilgilendirme</span></Box>} />
            </Box>
            <Box sx={{ display:'flex', gap:1.5, justifyContent:'flex-end', mt:2 }}>
              <Button variant="outlined" onClick={()=> window.location.reload()}>Vazgeç</Button>
              <Button variant="contained" onClick={onSave} disabled={saving}>{saving? 'Kaydediliyor…' : 'Kaydet'}</Button>
            </Box>
          </Paper>

          {/* Bildirimler ve Sesler */}
          <Paper elevation={0} sx={{ p:2, borderRadius:3, mt:2 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
              <NotificationsIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight:700 }}>Bildirimler ve Sesler</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt:0.5 }}>
              Uygulama bildirimleri için ses tercihleri ve ses düzeyi.
            </Typography>
            <Divider sx={{ my:2 }} />
            {['order','message','system'].map((key)=>{
              const cfg = (us.notificationSounds||{})[key] || { enabled:true, volume:70 };
              return (
                <Box key={key} sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', sm:'220px 1fr auto' }, alignItems:'center', gap:2, py:1 }}>
                  <Typography sx={{ textTransform:'capitalize' }}>
                    {key==='order'?'Sipariş Güncellemeleri': key==='message'?'Mesajlar':'Sistem'}
                  </Typography>
                  <Slider value={cfg.volume}
                          onChange={(_,v)=> setSettings(s=> ({...s, userSettings:{...us, notificationSounds:{...us.notificationSounds, [key]:{...cfg, volume: Array.isArray(v)?v[0]:v }}}}))}
                          valueLabelDisplay="auto" min={0} max={100} />
                  <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                    <FormControlLabel
                      control={<Switch checked={!!cfg.enabled}
                                       onChange={(e)=> setSettings(s=> ({...s, userSettings:{...us, notificationSounds:{...us.notificationSounds, [key]:{...cfg, enabled:e.target.checked }}}}))} />}
                      label="Aktif" />
                    <Button size="small" onClick={()=> playBeep( key==='order'? 740 : key==='message'? 880 : 520, 200, (cfg.volume||50)/200 )}>Test</Button>
                  </Box>
                </Box>
              );
            })}
            <Box sx={{ display:'flex', gap:1.5, justifyContent:'flex-end', mt:1 }}>
              <Button variant="contained" onClick={onSave} disabled={saving}>{saving? 'Kaydediliyor…' : 'Kaydet'}</Button>
            </Box>
          </Paper>

          {/* Dil ve Tema */}
          <Paper elevation={0} sx={{ p:2, borderRadius:3, mt:2 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
              <SettingsOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight:700 }}>Dil ve Tema</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt:0.5 }}>
              Uygulama dili, görünüm ve sıcaklık birimi tercihleri.
            </Typography>
            <Divider sx={{ my:2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Dil</Typography>
                <Select fullWidth size="small" value={us.ui?.language || 'tr'} onChange={(e)=> setSettings(s=> ({...s, userSettings:{...us, ui:{ ...(us.ui||{}), language: e.target.value }}}))}>
                  <MenuItem value="tr">Türkçe</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Tema</Typography>
                <Select fullWidth size="small" value={us.ui?.theme || 'light'} onChange={(e)=> setSettings(s=> ({...s, userSettings:{...us, ui:{ ...(us.ui||{}), theme: e.target.value }}}))}>
                  <MenuItem value="light">Açık</MenuItem>
                  <MenuItem value="dark">Koyu</MenuItem>
                  <MenuItem value="system">Sistem</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Sıcaklık Birimi</Typography>
                <Select fullWidth size="small" value={(us.ui?.tempUnit || localStorage.getItem('ui.tempUnit') || 'C')}
                        onChange={(e)=> setSettings(s=> ({...s, userSettings:{...us, ui:{ ...(us.ui||{}), tempUnit: e.target.value }}}))}>
                  <MenuItem value="C">Celsius (°C)</MenuItem>
                  <MenuItem value="F">Fahrenheit (°F)</MenuItem>
                </Select>
              </Grid>
            </Grid>
            <Box sx={{ display:'flex', gap:1.5, justifyContent:'flex-end', mt:2 }}>
              <Button variant="contained" onClick={onSave} disabled={saving}>{saving? 'Kaydediliyor…' : 'Kaydet'}</Button>
            </Box>
          </Paper>

        </Grid>

        {/* Hesap ve Güvenlik */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p:2, borderRadius:3, display:'flex', flexDirection:'column' }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
              <SecurityOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight:700 }}>Hesap ve Güvenlik</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt:0.5 }}>
              Şifre ve hesap işlemleri için kısayollar.
            </Typography>
            <Divider sx={{ my:1.5 }} />
            <Box sx={{ display:'grid', gap:1, gridAutoRows:'min-content' }}>
              <Button startIcon={<PersonOutlineOutlinedIcon />} variant="outlined" size="small" sx={{ justifyContent:'flex-start', py:0.8, px:1.5, borderRadius:1.5, width:'fit-content' }} onClick={()=> nav('/profile')}>
                Profil Bilgileri
              </Button>
              <Button startIcon={<SecurityOutlinedIcon />} variant="outlined" size="small" sx={{ justifyContent:'flex-start', py:0.8, px:1.5, borderRadius:1.5, width:'fit-content' }} onClick={()=> setConfirmOpen(true)}>
                Şifreyi Sıfırla
              </Button>
              {isAdmin && (
                <Button startIcon={<AdminPanelSettingsOutlinedIcon />} variant="contained" size="small" color="secondary" sx={{ justifyContent:'flex-start', py:0.8, px:1.5, borderRadius:1.5, width:'fit-content' }} onClick={()=> nav('/admin/settings')}>
                  Sistem Ayarları (Admin)
                </Button>
              )}
            </Box>
          </Paper>

          {/* MFA - Yakında */}
          <Paper elevation={0} sx={{ p:2, borderRadius:3, mt:2 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
              <SecurityOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight:700 }}>İki Aşamalı Doğrulama (MFA)</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt:0.5 }}>
              Google Authenticator veya benzeri uygulamalarla ek güvenlik katmanı. Bu özellik yakında aktif edilecek.
            </Typography>
            <Divider sx={{ my:2 }} />
            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
              <Chip size="small" label={(us.mfa?.enabled)?'Aktif':'Devre Dışı'} color={(us.mfa?.enabled)?'success':'default'} />
              <Tooltip title="Yakında">
                <span><Button disabled variant="outlined">Kur</Button></span>
              </Tooltip>
              <Tooltip title="Yakında">
                <span><Button disabled variant="outlined">Yedek Kodları Gör</Button></span>
              </Tooltip>
            </Box>
          </Paper>

          {/* Oturum Yönetimi */}
          <Paper elevation={0} sx={{ p:2, borderRadius:3, mt:2 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
              <SettingsOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight:700 }}>Oturum Yönetimi</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt:0.5 }}>
              Son giriş cihazı ve hızlı çıkış işlemleri.
            </Typography>
            <Divider sx={{ my:2 }} />
            <Box sx={{ display:'grid', gap:.5 }}>
              <Typography variant="body2"><b>Cihaz:</b> {profile?.lastLoginDevice || 'Bilinmiyor'}</Typography>
              <Typography variant="body2"><b>OS/Browser:</b> {profile?.lastLoginOS || '—'} / {profile?.lastLoginBrowser || '—'}</Typography>
              <Typography variant="body2"><b>IP:</b> {profile?.lastLoginIp || '—'}</Typography>
              <Typography variant="body2"><b>Son Giriş:</b> {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString('tr-TR') : '—'}</Typography>
            </Box>
            <Box sx={{ display:'flex', gap:1.5, mt:2 }}>
              <Button variant="outlined" color="warning" onClick={logoutEverywhere}>Bu Cihazdan Çıkış</Button>
              <Tooltip title="Yakında">
                <span><Button variant="outlined" disabled>Tüm Cihazlardan Çıkış</Button></span>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={confirmOpen} onClose={()=> setConfirmOpen(false)}>
        <DialogTitle>Şifre sıfırlama e-postası gönderilsin mi?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{profile?.email}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setConfirmOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={onPasswordReset}>Gönder</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
