import React, { useEffect, useMemo, useState } from 'react';
import { Container, Paper, Typography, Grid, TextField, Button, Stack, Divider, Switch, FormControlLabel, Avatar, Tabs, Tab, LinearProgress, Chip, Box, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUserSettings, updateUserSettings } from '../../api/settingsApi';
import { me, updateProfile, forgotPassword } from '../../api/authApi';
import { uploadImage, uploadImageLocal } from '../../api/uploadApi';
import { toast } from 'react-toastify';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { useLoyalty } from '../../store/loyaltySlice';
import { getLoyaltySummary, getLoyaltyTransactions } from '../../api/loyaltyApi';
import { useAuth } from '../../store/authSlice';

export default function Profile(){
  const [profile, setProfile] = useState({ email: '', role:'', personalInfo:{ firstName:'', lastName:'', phone:'', title:'' }, companyInfo:{ name:'', taxNo:'' } });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [settings, setSettings] = useState({ userSettings: { marketingEmails: false, smsOptIn: false } });
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [confirmAvatarOpen, setConfirmAvatarOpen] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Loyalty quick stats
  const { credit = 0, level = 0, orderCount = 0, transactions = [], setCredit, setOrderCount, setTransactions } = useLoyalty(state => ({
    credit: state.credit,
    level: state.level,
    orderCount: state.orderCount,
    transactions: state.transactions || [],
    setCredit: state.setCredit,
    setOrderCount: state.setOrderCount,
    setTransactions: state.setTransactions
  }));

  useEffect(()=>{
    (async()=>{
      try {
        setLoading(true);
  const [rMe, rSet, rSum, rTx] = await Promise.allSettled([
    me(),
    getUserSettings(),
    getLoyaltySummary(),
    getLoyaltyTransactions()
  ]);
  // handle /me first; if it failed, abort gracefully
  const meRes = rMe.status === 'fulfilled' ? rMe.value : { data: {} };
  // normalize company info aliases for FE
  const u = meRes.data || {};
  const ci = u.companyInfo || {};
  u.companyInfo = {
    ...ci,
    name: ci.name || ci.companyName || '',
    taxNo: ci.taxNo || ci.taxNumber || ''
  };
  setProfile(u);
  setOriginalProfile(u);
  setUser(u);
        const setRes = rSet.status === 'fulfilled' ? rSet.value : null;
        setSettings(setRes?.data || { userSettings: {} });
        // hydrate loyalty from backend (fallbacks if failed)
        const sumRes = rSum.status === 'fulfilled' ? rSum.value : { data:{} };
        const oc = Number(sumRes?.data?.orderCount ?? 0);
        const cr = Number(sumRes?.data?.credit ?? 0);
        setOrderCount(oc);
        setCredit(cr);
        const txRes = rTx.status === 'fulfilled' ? rTx.value : { data:{ items: [] } };
        const items = Array.isArray(txRes?.data?.items) ? txRes.data.items : (Array.isArray(txRes?.data) ? txRes.data : []);
        setTransactions(items);
      } catch (e) {
        // keep already set profile if partials failed
      } finally { setLoading(false); }
    })();
  },[]);

  const isEmailValid = (email)=> /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email || '');
  const isDirty = useMemo(()=> JSON.stringify(profile) !== JSON.stringify(originalProfile), [profile, originalProfile]);

  const onSaveProfile = async () => {
    if (!profile?.email) return toast.error('E-posta zorunludur');
    if (!isEmailValid(profile.email)) return toast.error('Geçerli bir e-posta girin');
    try {
      setSaving(true);
      // map aliases to backend-friendly fields
      const payload = {
        ...profile,
        companyInfo: {
          ...(profile.companyInfo||{}),
          companyName: profile.companyInfo?.name || profile.companyInfo?.companyName || '',
          taxNumber: profile.companyInfo?.taxNo || profile.companyInfo?.taxNumber || ''
        }
      };
      const res = await updateProfile(payload);
  const updated = res?.data || payload;
      // normalize aliases again for FE state
      const ci = updated.companyInfo || {};
      updated.companyInfo = { ...ci, name: ci.name || ci.companyName || '', taxNo: ci.taxNo || ci.taxNumber || '' };
      setProfile(updated);
      setOriginalProfile(updated);
  setUser(updated);
      toast.success('Profil güncellendi');
      setEditing(false);
    } catch (e) { toast.error('Profil güncellenemedi'); }
    finally { setSaving(false); }
  };
  const onSaveSettings = async () => {
    try {
      setSaving(true);
      await updateUserSettings(settings.userSettings || {});
      toast.success('Tercihler kaydedildi');
    } catch { toast.error('Tercihler kaydedilemedi'); }
    finally { setSaving(false); }
  };
  const onChangePassword = async () => {
    try {
      if (!profile?.email) return toast.error('E-posta bulunamadı');
      await forgotPassword(profile.email);
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
    } catch { toast.error('İstek gönderilemedi'); }
  };

  const us = settings.userSettings || {};
  const displayName = useMemo(() => {
    const fn = profile?.personalInfo?.firstName || '';
    const ln = profile?.personalInfo?.lastName || '';
    const full = `${fn} ${ln}`.trim();
    return full || profile?.email || 'Kullanıcı';
  }, [profile]);
  const initial = (displayName[0] || 'U').toUpperCase();
  const timeAgo = (dateStr)=>{
    try {
      const d = new Date(dateStr);
      const diff = Math.floor((Date.now() - d.getTime())/1000);
      if (diff < 60) return `${diff}s önce`;
      const m = Math.floor(diff/60); if (m<60) return `${m}dk önce`;
      const h = Math.floor(m/60); if (h<24) return `${h}s önce`;
      const day = Math.floor(h/24); if (day<30) return `${day}g önce`;
      const mon = Math.floor(day/30); if (mon<12) return `${mon}ay önce`;
      const y = Math.floor(mon/12); return `${y}y önce`;
    } catch { return ''; }
  };

  return (
    <Container sx={{ py:3 }}>
      {/* Hero Card */}
      <Paper elevation={0} sx={{ p:3, mb:3, borderRadius:3, border:'1px solid rgba(255,255,255,0.08)', background:'linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))', backdropFilter:'blur(10px)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Box sx={{ position:'relative' }}>
              <Avatar src={profile?.personalInfo?.avatar || profile?.avatarUrl || ''} sx={{ width:64, height:64, bgcolor:'#1f2937', color:'#e5e7eb' }}>{initial}</Avatar>
              <label htmlFor="avatar-input" style={{ position:'absolute', right:-6, bottom:-6 }}>
                <input id="avatar-input" type="file" accept="image/*" style={{ display:'none' }} onChange={async (e)=>{
                  const file = e.target.files?.[0];
                  if (!file) return;
                  // basic type/size guard
                  if (!file.type.startsWith('image/')) { toast.error('Lütfen bir görsel seçin'); return; }
                  if (file.size > 4 * 1024 * 1024) { toast.error('Görsel 4MB üstünde olamaz'); return; }
                  // preview and confirm
                  const reader = new FileReader();
                  reader.onload = ()=> { setAvatarPreview(reader.result); setConfirmAvatarOpen(true); };
                  reader.readAsDataURL(file);
                  // store file temporarily on input for later
                  e.target.dataset.filename = file.name;
                }} />
                <Chip size="small" label={uploading? 'Yükleniyor...' : 'Değiştir'} clickable sx={{ cursor:'pointer' }} />
              </label>
            </Box>
          </Grid>
          <Grid item xs>
            <Typography variant="h6" fontWeight={900}>{displayName}</Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
              {profile?.email && (
                <IconButton size="small" onClick={()=> { navigator.clipboard.writeText(profile.email); toast.success('E-posta kopyalandı'); }}>
                  <ContentCopyOutlinedIcon sx={{ fontSize:16 }} />
                </IconButton>
              )}
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt:1, flexWrap:'wrap' }}>
              {profile?.role && <Chip size="small" label={profile.role} />}
              <Chip size="small" color="primary" variant="outlined" label={`Seviye ${level}`} onClick={()=> navigate('/points')} clickable />
              <Chip size="small" color="success" variant="outlined" label={`${credit} Puan`} onClick={()=> navigate('/points')} clickable />
              <Chip size="small" variant="outlined" label={`${orderCount} Sipariş`} onClick={()=> navigate('/orders')} clickable />
            </Stack>
            <Box sx={{ mt:0.5 }}>
              {profile?.createdAt && (
                <Typography variant="caption" color="text.secondary" sx={{ display:'block' }}>
                  Üyelik: {new Date(profile.createdAt).toLocaleDateString()}
                </Typography>
              )}
              {(profile?.lastLoginAt || profile?.lastLoginIp || profile?.lastLoginOS || profile?.lastLoginBrowser) && (
                <Typography variant="caption" color="text.secondary" sx={{ display:'block' }}>
                  Son giriş: {profile?.lastLoginAt ? `${timeAgo(profile.lastLoginAt)} · ${new Date(profile.lastLoginAt).toLocaleString()}` : '—'} · {profile?.lastLoginIp || '—'} · {(profile?.lastLoginOS || '')}{profile?.lastLoginBrowser ? ` · ${profile.lastLoginBrowser}` : ''}
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item>
            <PersonOutlineOutlinedIcon sx={{ fontSize:40, color:'#64748b' }} />
          </Grid>
        </Grid>
      </Paper>
      {/* Avatar confirm + crop (auto center-crop square, resize 256x256) */}
      {confirmAvatarOpen && (
        <Box sx={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1300 }}>
          <Paper sx={{ p:2.5, width:420, borderRadius:2 }}>
            <Typography variant="subtitle1" fontWeight={700}>Profil fotoğrafını güncelle</Typography>
            {avatarPreview && (
              <Box sx={{ mt:1, display:'flex', justifyContent:'center' }}>
                <Avatar src={avatarPreview} sx={{ width:96, height:96 }} />
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt:1 }}>
              Görsel kare oranına göre ortalanarak 256x256 boyutuna getirilecektir.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt:2 }}>
              <Button variant="contained" color="error" onClick={()=> { setConfirmAvatarOpen(false); setAvatarPreview(null); }}>Vazgeç</Button>
              <Button variant="contained" onClick={async ()=>{
                if (!avatarPreview) return;
                try {
                  setUploading(true);
                  // load image into canvas
                  const img = new Image();
                  img.src = avatarPreview;
                  await new Promise((res, rej)=> { img.onload = res; img.onerror = rej; });
                  const side = Math.min(img.width, img.height);
                  const sx = (img.width - side)/2;
                  const sy = (img.height - side)/2;
                  const canvas = document.createElement('canvas');
                  canvas.width = 256; canvas.height = 256;
                  const ctx = canvas.getContext('2d');
                  ctx.imageSmoothingQuality = 'high';
                  ctx.drawImage(img, sx, sy, side, side, 0, 0, 256, 256);
                  const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
                  const file = new File([blob], 'avatar.jpg', { type:'image/jpeg' });
                  let res;
                  try { res = await uploadImage(file); } catch { res = await uploadImageLocal(file); }
                  const url = res?.data?.url;
                  if (url) {
                    setProfile(p=> ({ ...p, personalInfo:{ ...(p.personalInfo||{}), avatar: url } }));
                    await updateProfile({ ...profile, personalInfo:{ ...(profile.personalInfo||{}), avatar: url } });
                    toast.success('Profil fotoğrafı güncellendi');
                  }
                } catch(err){
                  toast.error('Yükleme başarısız');
                } finally {
                  setUploading(false);
                  setConfirmAvatarOpen(false);
                  setAvatarPreview(null);
                }
              }}>Kaydet</Button>
            </Stack>
          </Paper>
        </Box>
      )}

      {/* Tabs */}
      <Paper elevation={0} sx={{ p:2.5, borderRadius:3, border:'1px solid rgba(0,0,0,0.06)' }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{ mb:2 }}>
          <Tab value="overview" label="Özet" />
          <Tab value="info" label="Bilgiler" />
          <Tab value="security" label="Güvenlik" />
          <Tab value="prefs" label="İletişim Tercihleri" />
        </Tabs>
        {loading && <LinearProgress />}

        {/* Özet */}
        {tab==='overview' && !loading && (
          <Grid container spacing={2}>
            {/* About card with inline edit */}
            <Grid item xs={12} md={7}>
              <Paper variant="outlined" sx={{ p:2, borderRadius:2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1" fontWeight={700}>Hakkımda</Typography>
                  {!editing ? (
                    <IconButton size="small" onClick={()=> setEditing(true)} aria-label="Düzenle">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" color="success" aria-label="Kaydet" onClick={onSaveProfile} disabled={saving}>
                        <SaveOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" aria-label="Vazgeç" onClick={()=> setEditing(false)}>
                        <CloseOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>

                {!editing ? (
                  <List dense sx={{ mt:1 }}>
                    <ListItem disableGutters>
                      <ListItemText primary="Ad" secondary={profile.personalInfo?.firstName || '-'} />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary="Soyad" secondary={profile.personalInfo?.lastName || '-'} />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary="Telefon" secondary={profile.personalInfo?.phone || '-'} />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary="Unvan" secondary={profile.personalInfo?.title || '-'} />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary="E-posta" secondary={profile.email || '-'} />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary="Firma Adı" secondary={profile.companyInfo?.name || profile.companyInfo?.companyName || '-'} />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary="Vergi No" secondary={profile.companyInfo?.taxNo || profile.companyInfo?.taxNumber || '-'} />
                    </ListItem>
                  </List>
                ) : (
                  <Grid container spacing={2} sx={{ mt:0.5 }}>
                    <Grid item xs={12} sm={6}><TextField label="Ad" fullWidth value={profile.personalInfo?.firstName || ''} onChange={(e)=> setProfile(p=> ({...p, personalInfo:{...p.personalInfo, firstName:e.target.value}}))} /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Soyad" fullWidth value={profile.personalInfo?.lastName || ''} onChange={(e)=> setProfile(p=> ({...p, personalInfo:{...p.personalInfo, lastName:e.target.value}}))} /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Telefon" placeholder="5xx xxx xx xx" fullWidth value={profile.personalInfo?.phone || ''} onChange={(e)=> setProfile(p=> ({...p, personalInfo:{...p.personalInfo, phone:e.target.value}}))} /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Unvan" placeholder="Satınalma Uzmanı" fullWidth value={profile.personalInfo?.title || ''} onChange={(e)=> setProfile(p=> ({...p, personalInfo:{...p.personalInfo, title:e.target.value}}))} /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="E-posta" required error={!profile?.email || !isEmailValid(profile?.email)} helperText={!profile?.email? 'Zorunlu alan': (!isEmailValid(profile?.email)? 'Geçerli bir e-posta girin' : '')} fullWidth value={profile.email || ''} onChange={(e)=> setProfile(p=> ({...p, email:e.target.value}))} /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Firma Adı" fullWidth value={profile.companyInfo?.name || profile.companyInfo?.companyName || ''} onChange={(e)=> setProfile(p=> ({...p, companyInfo:{...p.companyInfo, name:e.target.value}}))} /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Vergi No" fullWidth value={profile.companyInfo?.taxNo || profile.companyInfo?.taxNumber || ''} onChange={(e)=> setProfile(p=> ({...p, companyInfo:{...p.companyInfo, taxNo:e.target.value}}))} /></Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>

            {/* Quick stats & recent activity */}
            <Grid item xs={12} md={5}>
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p:2, borderRadius:2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>Hızlı İstatistikler</Typography>
                  <Grid container spacing={1.5} sx={{ mt:0.5 }}>
                    <Grid item xs={4}><Box><Typography variant="h6" fontWeight={800}>{credit}</Typography><Typography variant="caption" color="text.secondary">Puan</Typography></Box></Grid>
                    <Grid item xs={4}><Box><Typography variant="h6" fontWeight={800}>{level}</Typography><Typography variant="caption" color="text.secondary">Seviye</Typography></Box></Grid>
                    <Grid item xs={4}><Box><Typography variant="h6" fontWeight={800}>{orderCount}</Typography><Typography variant="caption" color="text.secondary">Sipariş</Typography></Box></Grid>
                  </Grid>
                  <Stack direction="row" spacing={1} sx={{ mt:1.5 }}>
                    <Button size="small" variant="outlined" onClick={()=> setTab('security')}>Şifre Sıfırla</Button>
                    <Button size="small" variant="outlined" onClick={()=> setTab('prefs')}>Tercihler</Button>
                  </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ p:2, borderRadius:2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>Son Hareketler</Typography>
                  {transactions?.length ? (
                    <List dense>
                      {transactions.slice(0,5).map((t, idx)=> (
                        <ListItem key={idx} disableGutters onClick={()=> t.orderId && navigate(`/orders/${t.orderId}`)} sx={{ cursor: t.orderId ? 'pointer' : 'default' }} secondaryAction={<Typography variant="caption" color={t.type==='earn'?'success.main':'warning.main'}>{t.type==='earn'? '+':''}{t.amount}</Typography>}>
                          <ListItemText primary={t.title || t.description || 'İşlem'} secondary={new Date(t.date || t.createdAt || Date.now()).toLocaleDateString()} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt:0.5 }}>Henüz hareket bulunmuyor</Typography>
                  )}
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* Bilgiler */}
        {tab==='info' && !loading && (
          <Box>
            <Grid container spacing={2} sx={{ mt:.5 }}>
              <Grid item xs={12} md={6}><TextField label="Ad" fullWidth value={profile.personalInfo?.firstName || ''} onChange={(e)=> setProfile(p=> ({...p, personalInfo:{...p.personalInfo, firstName:e.target.value}}))} /></Grid>
              <Grid item xs={12} md={6}><TextField label="Soyad" fullWidth value={profile.personalInfo?.lastName || ''} onChange={(e)=> setProfile(p=> ({...p, personalInfo:{...p.personalInfo, lastName:e.target.value}}))} /></Grid>
              <Grid item xs={12} md={6}><TextField label="Telefon" placeholder="5xx xxx xx xx" fullWidth value={profile.personalInfo?.phone || ''} onChange={(e)=> setProfile(p=> ({...p, personalInfo:{...p.personalInfo, phone:e.target.value}}))} /></Grid>
              <Grid item xs={12} md={6}><TextField label="Unvan" placeholder="Satınalma Uzmanı" fullWidth value={profile.personalInfo?.title || ''} onChange={(e)=> setProfile(p=> ({...p, personalInfo:{...p.personalInfo, title:e.target.value}}))} /></Grid>
              <Grid item xs={12} md={6}><TextField label="E-posta" required error={!profile?.email || !isEmailValid(profile?.email)} helperText={!profile?.email? 'Zorunlu alan': (!isEmailValid(profile?.email)? 'Geçerli bir e-posta girin' : '')} fullWidth value={profile.email || ''} onChange={(e)=> setProfile(p=> ({...p, email:e.target.value}))} /></Grid>
              <Grid item xs={12} md={6}><TextField label="Firma Adı" fullWidth value={profile.companyInfo?.name || profile.companyInfo?.companyName || ''} onChange={(e)=> setProfile(p=> ({...p, companyInfo:{...p.companyInfo, name:e.target.value}}))} /></Grid>
              <Grid item xs={12} md={6}><TextField label="Vergi No" fullWidth value={profile.companyInfo?.taxNo || profile.companyInfo?.taxNumber || ''} onChange={(e)=> setProfile(p=> ({...p, companyInfo:{...p.companyInfo, taxNo:e.target.value}}))} /></Grid>
            </Grid>
            <Stack direction="row" spacing={2} sx={{ mt:2 }}>
              <Button variant="contained" disabled={saving || !isDirty || !isEmailValid(profile?.email)} onClick={onSaveProfile}>Kaydet</Button>
              <Button variant="text" disabled={!isDirty} onClick={()=> setProfile(originalProfile)}>Vazgeç</Button>
            </Stack>
          </Box>
        )}

        {/* Güvenlik */}
        {tab==='security' && !loading && (
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Parola Değiştir</Typography>
            <Typography variant="body2" sx={{ mt:1 }} color="text.secondary">Parola değiştirmek için e-posta ile sıfırlama bağlantısı gönderilir.</Typography>
            <Button variant="outlined" sx={{ mt:2 }} onClick={()=> setConfirmOpen(true)}>Sıfırlama Bağlantısı Gönder</Button>
          </Box>
        )}

        {/* İletişim Tercihleri */}
        {tab==='prefs' && !loading && (
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>KVKK & İletişim Tercihleri</Typography>
            <Divider sx={{ my:1 }} />
            <FormControlLabel control={<Switch checked={!!us.marketingEmails} onChange={(e)=> setSettings(s=> ({...s, userSettings:{...s.userSettings, marketingEmails:e.target.checked}}))} />} label="Pazarlama e-postaları almak istiyorum" />
            <FormControlLabel control={<Switch checked={!!us.smsOptIn} onChange={(e)=> setSettings(s=> ({...s, userSettings:{...s.userSettings, smsOptIn:e.target.checked}}))} />} label="SMS bilgilendirmesi almak istiyorum" />
            <Stack direction="row" spacing={2} sx={{ mt:2 }}>
              <Button variant="contained" disabled={saving} onClick={onSaveSettings}>Tercihleri Kaydet</Button>
            </Stack>
          </Box>
        )}
      </Paper>
      {/* Confirm dialog */}
      {confirmOpen && (
        <Box sx={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1300 }} onClick={()=> setConfirmOpen(false)}>
          <Paper onClick={(e)=> e.stopPropagation()} sx={{ p:2.5, width:360, borderRadius:2 }}>
            <Typography variant="subtitle1" fontWeight={700}>Emin misiniz?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt:0.5 }}>
              E-posta adresinize şifre sıfırlama bağlantısı gönderilecek.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt:2 }}>
              <Button variant="contained" color="error" onClick={()=> setConfirmOpen(false)}>Vazgeç</Button>
              <Button variant="contained" onClick={()=> { setConfirmOpen(false); onChangePassword(); }}>Gönder</Button>
            </Stack>
          </Paper>
        </Box>
      )}
    </Container>
  );
}
