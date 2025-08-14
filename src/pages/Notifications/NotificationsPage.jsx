import React, { useEffect, useMemo, useState } from 'react';
import { listNotifications, markRead, markAllRead, deleteNotification } from '../../api/notificationsApi';
import { useNotif } from '../../store/notifSlice';
import {
  Container, Box, List, ListItem, ListItemText, Button, Chip, Typography, IconButton,
  Divider, TextField, ToggleButtonGroup, ToggleButton, Tooltip
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
dayjs.extend(relativeTime);
dayjs.locale('tr');

export default function NotificationsPage(){
  const { list, setList } = useNotif();
  const [query, setQuery] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [priority, setPriority] = useState('all');

  useEffect(()=>{ listNotifications().then((res)=> setList(res.data || [])); },[setList]);

  const onRead = async (id) => {
    await markRead(id);
    const copy = list.map((n)=> n.id===id ? { ...n, isRead:true } : n);
    setList(copy);
  };

  const onDelete = async (id) => {
    await deleteNotification(id);
    setList(list.filter(n => n.id !== id));
  };

  const onMarkAll = async () => {
    await markAllRead();
    setList(list.map(n => ({ ...n, isRead:true, readAt: n.readAt || new Date().toISOString() })));
  };

  const filtered = useMemo(() => {
    return list.filter(n => {
      if (onlyUnread && n.isRead) return false;
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;
      if (priority !== 'all' && (n.priority || 'medium') !== priority) return false;
      if (query && !(`${n.title} ${n.message}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [list, query, onlyUnread, typeFilter, priority]);

  return (
    <Container sx={{ py:3, display:'flex', flexDirection:'column', gap:2 }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:1, justifyContent:'space-between', flexWrap:'wrap' }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <NotificationsOutlinedIcon />
          <Typography variant="h5" sx={{ fontWeight:800 }}>Bildirimler</Typography>
          <Chip size="small" label={`${list.filter(n=>!n.isRead).length} okunmamış`} color="error" variant="outlined" />
        </Box>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Tooltip title="Tümünü okundu yap">
            <Button size="small" startIcon={<DoneAllIcon />} onClick={onMarkAll}>Tümünü Okundu</Button>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', alignItems:'center' }}>
        <TextField size="small" placeholder="Ara" value={query} onChange={(e)=>setQuery(e.target.value)} />
        <ToggleButtonGroup size="small" value={onlyUnread? 'unread':'all'} exclusive onChange={(_,v)=> setOnlyUnread(v==='unread')}>
          <ToggleButton value="all">Tümü</ToggleButton>
          <ToggleButton value="unread">Okunmamış</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup size="small" value={typeFilter} exclusive onChange={(_,v)=> v && setTypeFilter(v)}>
          <ToggleButton value="all">Tüm Tipler</ToggleButton>
          <ToggleButton value="order_status">Sipariş</ToggleButton>
          <ToggleButton value="quote_response">Teklif</ToggleButton>
          <ToggleButton value="application_update">Başvuru</ToggleButton>
          <ToggleButton value="system_alert">Sistem</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup size="small" value={priority} exclusive onChange={(_,v)=> v && setPriority(v)}>
          <ToggleButton value="all">Öncelik: Tümü</ToggleButton>
          <ToggleButton value="low">Düşük</ToggleButton>
          <ToggleButton value="medium">Orta</ToggleButton>
          <ToggleButton value="high">Yüksek</ToggleButton>
          <ToggleButton value="urgent">Acil</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <List sx={{ bgcolor:'background.paper', borderRadius:2, border:'1px solid rgba(255,255,255,0.06)' }}>
        {filtered.length === 0 && (
          <Box sx={{ p:4, textAlign:'center' }}>
            <Typography sx={{ opacity:0.7 }}>Gösterilecek bildirim yok.</Typography>
          </Box>
        )}
        {filtered.map((n, idx)=> (
          <Box key={n.id}>
            <ListItem alignItems="flex-start"
              secondaryAction={
                <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                  {!n.isRead && <Button size="small" startIcon={<MarkEmailReadOutlinedIcon />} onClick={()=>onRead(n.id)}>Okundu</Button>}
                  <IconButton size="small" onClick={()=>onDelete(n.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={<Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                  {!n.isRead && <Chip size="small" color="primary" label="Yeni" />}
                  <Typography sx={{ fontWeight:700 }}>{n.title}</Typography>
                  <Chip size="small" variant="outlined" label={n.type?.replace('_',' ')} />
                  <Chip size="small" color={n.priority==='urgent'?'error':(n.priority==='high'?'warning':'default')} variant="outlined" label={n.priority||'medium'} />
                </Box>}
                secondary={<Typography variant="body2" sx={{ opacity:0.8 }}>{n.message}</Typography>}
              />
            </ListItem>
            <Box sx={{ display:'flex', justifyContent:'space-between', px:3, pb:1 }}>
              <Typography variant="caption" sx={{ opacity:0.6 }}>{dayjs(n.createdAt).fromNow()}</Typography>
              {n.readAt && <Typography variant="caption" sx={{ opacity:0.5 }}>okundu: {dayjs(n.readAt).fromNow()}</Typography>}
            </Box>
            {idx < filtered.length-1 && <Divider component="li" />}
          </Box>
        ))}
      </List>
    </Container>
  );
}
