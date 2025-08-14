import React, { useRef } from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, useMediaQuery, Box, Avatar, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUI } from '../../store/uiSlice';
import { useAuth } from '../../store/authSlice';
import { logout as apiLogout } from '../../api/authApi';

const itemsByRole = {
  center: [
    { to: '/center', icon: <DashboardCustomizeRoundedIcon />, label: 'Panel' },
    { to: '/products', icon: <InventoryRoundedIcon />, label: 'Ürünler' },
    { to: '/cart', icon: <ShoppingCartCheckoutRoundedIcon />, label: 'Sepetim' },
  { to: '/points', icon: <StarRoundedIcon />, label: 'Puanlarım' },
    { to: '/quotations', icon: <RequestQuoteRoundedIcon />, label: 'Teklif Taleplerim' },
    { to: '/orders', icon: <ReceiptLongRoundedIcon />, label: 'Siparişlerim' },
    { to: '/profile', icon: <PersonRoundedIcon />, label: 'Bilgilerim' }
  ],
  supplier: [
    { to: '/supplier', icon: <DashboardCustomizeRoundedIcon />, label: 'Panel' },
    { to: '/products-crud', icon: <InventoryRoundedIcon />, label: 'Ürün Yönetimi' },
    { to: '/offers-inbox', icon: <RequestQuoteRoundedIcon />, label: 'Teklif Yanıtları' }
  ],
  admin: [
    { to: '/admin', icon: <AdminPanelSettingsRoundedIcon />, label: 'Admin Panel' },
    { to: '/applications', icon: <SettingsSuggestRoundedIcon />, label: 'Başvurular' },
    { to: '/users', icon: <PersonRoundedIcon />, label: 'Kullanıcılar' },
    { to: '/admin/orders', icon: <ReceiptLongRoundedIcon />, label: 'Sipariş Yönetimi' },
    { to: '/reports', icon: <ReceiptLongRoundedIcon />, label: 'Raporlar' },
    { to: '/notifications/send', icon: <RequestQuoteRoundedIcon />, label: 'Bildirim Gönder' }
  ]
};

export default function Sidebar() {
  const { role } = useAuthGuard();
  const nav = useNavigate();
  const location = useLocation();
  const items = itemsByRole[role] || [];
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { sidebarOpen, setSidebar } = useUI(s => ({ sidebarOpen: s.sidebarOpen, setSidebar: s.setSidebar }));
  const toggleSidebar = () => setSidebar(!sidebarOpen);
  const collapsed = isDesktop && !sidebarOpen;
  const { user, clearSession } = useAuth();
  const hoverTimer = useRef(null);

  const handleEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setSidebar(true);
  };
  const handleLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setSidebar(false), 220);
  };
  const handleLogout = async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    clearSession();
    nav('/login');
  };

  const drawerContent = (
    <List sx={{ width: collapsed ? 72 : 240, px:0, py:1, transition:'width .25s' }}>
      {isDesktop ? null : (
        <ListItemButton onClick={toggleSidebar} sx={{ justifyContent:'flex-end' }}>
          <ListItemIcon sx={{ minWidth:32 }}><CloseIcon /></ListItemIcon>
          <ListItemText primary="Kapat" />
        </ListItemButton>
      )}
      {items.map((it) => {
        const active = location.pathname === it.to || location.pathname.startsWith(it.to + '/');
        const btn = (
          <ListItemButton
            key={it.to}
            onClick={() => { nav(it.to); if(!isDesktop) toggleSidebar(); }}
            sx={{
              position:'relative',
              gap: collapsed ? 0 : 1.25,
              px: collapsed ? 1.2 : 2.25,
              justifyContent: collapsed ? 'center' : 'flex-start',
              my:.3,
              borderRadius:2,
              minHeight:48,
              overflow:'hidden',
              '&:before': active ? { content:'""', position:'absolute', left:4, top:8, bottom:8, width:6, borderRadius:3, background:'linear-gradient(180deg,#dc2626,#f59e0b)' } : {},
              background: active ? 'linear-gradient(90deg,rgba(220,38,38,0.12),rgba(245,158,11,0.10))' : 'transparent',
              transition:'background .25s, color .25s',
              '&:hover': { background: active ? 'linear-gradient(90deg,rgba(220,38,38,0.18),rgba(245,158,11,0.16))' : 'rgba(0,0,0,0.04)' }
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40, color: active ? '#dc2626' : '#374151', transition:'color .3s' }}>{active ? <StarRoundedIcon fontSize="small" /> : it.icon}</ListItemIcon>
            {!collapsed && <ListItemText primary={it.label} primaryTypographyProps={{ fontWeight: active ? 600 : 500 }} />}
          </ListItemButton>
        );
        return collapsed ? <Tooltip arrow placement="right" key={it.to} title={it.label}>{btn}</Tooltip> : btn;
      })}
    </List>
  );

  if (isDesktop) {
    return (
      <Box onMouseEnter={handleEnter} onMouseLeave={handleLeave} sx={{ position:'fixed', left:0, top:0, bottom:0, zIndex:1200 }}>
        <Drawer variant="permanent" open PaperProps={{ sx: { width: collapsed ? 72 : 240, overflow:'hidden', transition:'width .25s', borderRight:0, background: 'linear-gradient(180deg,rgba(255,255,255,0.95) 0%,rgba(255,255,255,0.6) 100%)', backdropFilter:'blur(16px)', boxShadow:'0 0 0 1px rgba(255,255,255,0.4), 0 8px 28px -6px rgba(0,0,0,0.14)' }}}>
          <Box sx={{ height:'100%', display:'flex', flexDirection:'column' }}>
            <Box sx={{ flex:1, overflowY:'auto' }}>{drawerContent}</Box>
            <Box sx={{ p: collapsed ? 1 : 1.5, borderTop:'1px solid rgba(0,0,0,0.06)', display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'space-between', gap:1 }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:1, overflow:'hidden' }}>
                <Avatar sx={{ width:32, height:32 }}>{(user?.name || user?.email || 'U')[0]}</Avatar>
                {!collapsed && (
                  <Box sx={{ overflow:'hidden' }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight:600 }}>{user?.name || user?.email}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{user?.role}</Typography>
                  </Box>
                )}
              </Box>
              <Tooltip title="Çıkış">
                <IconButton size="small" onClick={handleLogout}>
                  <LogoutRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Drawer>
      </Box>
    );
  }
  return (
    <Drawer
      variant="temporary"
      open={sidebarOpen}
      onClose={() => setSidebar(false)}
      ModalProps={{ keepMounted:true }}
      PaperProps={{ sx:{ width:240 } }}
    >
      {drawerContent}
    </Drawer>
  );
}
