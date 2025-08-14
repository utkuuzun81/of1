import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, Typography, Button, TextField, InputAdornment, IconButton } from '@mui/material';
import FormText from '../../components/forms/FormText.jsx';
import { login, me } from '../../api/authApi';
import { useAuth } from '../../store/authSlice';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import AuthFrame from '../../components/layout/AuthFrame.jsx';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const schema = z.object({
  email: z.string().email('Geçerli e-posta girin'),
  password: z.string().min(6, 'En az 6 karakter')
});

export default function Login(){
  const { register, handleSubmit, formState:{ errors } } = useForm({ resolver: zodResolver(schema) });
  const { setSession } = useAuth();
  const nav = useNavigate();
  const [show, setShow] = React.useState(false);

  const onSubmit = async (data) => {
    try {
      const res = await login(data);
      const token = res.data.token;
      localStorage.setItem('token', token);
      const meRes = await me();
      setSession({ user: meRes.data, token });
      if (meRes.data.status !== 'approved') return nav('/pending-approval');
      // role yönlendirme
  const r = meRes.data.role;
  if (r === 'admin') nav('/admin');
  else if (r === 'supplier') nav('/supplier');
  else nav('/center');
      toast.success('Giriş başarılı');
    } catch (e) {
      if (e?.response?.status === 403) toast.error('Hesabınız incelemede.');
      else toast.error('E-posta veya şifre hatalı');
    }
  };

  return (
    <AuthFrame title="Giriş Yap" subtitle="Hesabınıza güvenle giriş yapın" sideVariant="bolt">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <FormText register={register} name="email" errors={errors} label="E-posta" type="email" />
          <TextField {...register('password')} label="Şifre" type={show? 'text':'password'} fullWidth error={!!errors?.password} helperText={errors?.password?.message}
            InputProps={{
              endAdornment:(
                <InputAdornment position="end">
                  <IconButton onClick={()=> setShow(s=>!s)} edge="end" aria-label="toggle password visibility">
                    {show? <VisibilityOff/> : <Visibility/>}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button type="submit" variant="contained">Giriş Yap</Button>
          <Stack direction="row" justifyContent="space-between">
            <Link to="/register/step1">Kayıt Ol</Link>
            <Link to="#">Şifremi Unuttum</Link>
          </Stack>
        </Stack>
      </form>
    </AuthFrame>
  );
}
