import React, { useState } from 'react';
import { Container, TextField, Button, Stack, Typography } from '@mui/material';
import { forgotPassword } from '../../api/authApi';

export default function ForgotPassword(){
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const submit = async () => {
    if (!email) return;
    await forgotPassword(email);
    setSent(true);
  };
  return (
    <Container sx={{ py:6 }}>
      <Typography variant="h5" gutterBottom>Şifre Sıfırlama</Typography>
      {sent ? (
        <Typography>Şifre sıfırlama bağlantısı e-postanıza gönderildi.</Typography>
      ) : (
        <Stack spacing={2} maxWidth={420}>
          <TextField label="E-posta" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} fullWidth />
          <Button variant="contained" onClick={submit}>Gönder</Button>
        </Stack>
      )}
    </Container>
  );
}
