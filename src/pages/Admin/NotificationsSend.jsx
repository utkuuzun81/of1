import React, { useState } from 'react';
import { Container, Paper, Stack, TextField, Button } from '@mui/material';
import { sendNotification } from '../../api/notificationsApi';
import { toast } from 'react-toastify';

export default function NotificationsSend(){
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('Duyuru');
  const [message, setMessage] = useState('');
  const onSend = async () => {
    try { await sendNotification({ userId, title, message }); toast.success('Gönderildi'); }
    catch { toast.error('Gönderilemedi'); }
  };
  return (
    <Container sx={{ py:3 }}>
      <Paper sx={{ p:2 }}>
        <Stack spacing={2}>
          <TextField label="Kullanıcı ID" value={userId} onChange={(e)=>setUserId(e.target.value)} />
          <TextField label="Başlık" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <TextField label="Mesaj" value={message} onChange={(e)=>setMessage(e.target.value)} multiline rows={4} />
          <Button variant="contained" onClick={onSend} disabled={!userId || !message}>Gönder</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
