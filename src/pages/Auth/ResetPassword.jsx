import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Stack, Typography } from '@mui/material';
import { resetPassword } from '../../api/authApi';

export default function ResetPassword(){
  const { token } = useParams();
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!password || password !== confirm) return;
    await resetPassword({ token, password });
    setDone(true);
    setTimeout(()=> nav('/login'), 1200);
  };

  return (
    <Container sx={{ py:6 }}>
      <Typography variant="h5" gutterBottom>Yeni Şifre</Typography>
      {done ? (
        <Typography>Şifreniz güncellendi. Yönlendiriliyorsunuz…</Typography>
      ) : (
        <Stack spacing={2} maxWidth={420}>
          <TextField label="Yeni Şifre" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} fullWidth />
          <TextField label="Yeni Şifre (Tekrar)" type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} fullWidth />
          <Button variant="contained" onClick={submit} disabled={!password || password!==confirm}>Güncelle</Button>
        </Stack>
      )}
    </Container>
  );
}
