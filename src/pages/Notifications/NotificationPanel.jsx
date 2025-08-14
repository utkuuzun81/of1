import React, { useEffect } from 'react';
import { Drawer, List, ListItem, ListItemText, IconButton, Box, Typography, Button, Divider, Chip, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { listNotifications, markRead, markAllRead, deleteNotification } from '../../api/notificationsApi';
import { useNotif } from '../../store/notifSlice';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';

export default function NotificationPanel({ open, onClose }){
  const { list, setList } = useNotif();
  useEffect(()=>{ if (open) listNotifications().then((res)=> setList(res.data||[])); },[open]);

  const onRead = async (id) => {
    await markRead(id);
    setList(list.map(n => n.id===id ? { ...n, isRead:true } : n));
  };

  const onDelete = async (id) => {
    await deleteNotification(id);
    setList(list.filter(n => n.id !== id));
  };

  const onMarkAll = async () => {
    await markAllRead();
    setList(list.map(n => ({ ...n, isRead:true, readAt: n.readAt || new Date().toISOString() })));
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx:{ width:360 }}}>
      <Box sx={{ p:2, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Typography variant="h6">Bildirimler</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Tooltip title="Tümünü okundu yap"><IconButton onClick={onMarkAll}><DoneAllIcon /></IconButton></Tooltip>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
      </Box>
      <List>
        {list.map((n, idx)=> (
          <Box key={n.id}>
            <ListItem secondaryAction={
              <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                {!n.isRead && <Button size="small" onClick={()=>onRead(n.id)}>Okundu</Button>}
                <IconButton size="small" onClick={()=>onDelete(n.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
              </Box>
            }>
              <ListItemText primary={<Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                {!n.isRead && <Chip size="small" color="primary" label="Yeni" />}
                {n.title}
              </Box>} secondary={new Date(n.createdAt).toLocaleString('tr-TR')} />
            </ListItem>
            {idx < list.length-1 && <Divider />}
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
