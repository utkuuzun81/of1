import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Badge } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useUI } from '../../store/uiSlice';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import { useLoyalty } from '../../store/loyaltySlice';
import { useNotif } from '../../store/notifSlice';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from '../../pages/Notifications/NotificationPanel.jsx';

export default function Topbar() {
  const { level, credit, progressPct } = useLoyalty();
  const { unread } = useNotif();
  const nav = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const toggle = useUI(s => s.toggleSidebar);

  return (
    <AppBar position="sticky" elevation={0} sx={{ backdropFilter: 'blur(8px)', background: 'linear-gradient(90deg,#ef4444,#7f1d1d)' }}>
      <Toolbar sx={{ display:'flex', gap:2 }}>
        <IconButton edge="start" color="inherit" onClick={toggle} sx={{ mr:1, display:{ md:'none' }}}>
          <MenuIcon />
        </IconButton>
  <Typography variant="h6" sx={{ flexGrow:1, fontWeight:700, letterSpacing:.5, textShadow:'0 1px 2px rgba(0,0,0,0.25)' }}>Odyostore</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:2, cursor:'pointer' }} onClick={() => nav('/profile')}>
          <StarIcon fontSize="small" />
          <Typography variant="body2">Seviye {level} • Kredi {credit.toLocaleString('tr-TR')} TL • %{Math.round(progressPct)}</Typography>
        </Box>
        <IconButton color="inherit" onClick={() => setNotifOpen(true)}>
          <Badge color="error" badgeContent={unread}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Toolbar>
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </AppBar>
  );
}
