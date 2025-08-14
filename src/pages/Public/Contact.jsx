import React, { useState } from 'react';
import { Container, TextField, Button, Stack, Typography, Alert } from '@mui/material';
import api from '../../api/client';

export default function Contact(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const submit = async ()=>{
    try{
      setError('');
  await api.post('/api/public/contact', { name, email, message });
      setSent(true);
    }catch(e){ setError('Gönderim sırasında hata oluştu.'); }
  };
  return (
    <Container sx={{ py:6 }}>
      <Typography variant="h4" gutterBottom>Destek & İletişim</Typography>
      {sent ? (
        <Alert severity="success">Mesajınız iletildi. Teşekkürler.</Alert>
      ) : (
        <Stack direction="column" spacing={2} maxWidth={480}>
          {!!error && <Alert severity="error">{error}</Alert>}
          <TextField label="Ad Soyad" value={name} onChange={(e)=>setName(e.target.value)} fullWidth />
          <TextField label="E-posta" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} fullWidth />
          <TextField label="Mesajınız" multiline minRows={4} value={message} onChange={(e)=>setMessage(e.target.value)} fullWidth />
          <Button variant="contained" disabled={!email || !message} onClick={submit}>Gönder</Button>
        </Stack>
      )}
    </Container>
  );
}
