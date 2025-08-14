import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, Typography, Button, FormControlLabel, Checkbox } from '@mui/material';
import FormText from '../../components/forms/FormText.jsx';
import { register as registerApi } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthFrame from '../../components/layout/AuthFrame.jsx';

const schema = z.object({
  email: z.string().email('Geçersiz e-posta'),
  password: z.string().min(6,'En az 6 karakter'),
  confirm: z.string().min(6)
}).refine((d)=> d.password === d.confirm, { message:'Şifreler eşleşmiyor', path:['confirm']});

export default function RegisterStep2(){
  const nav = useNavigate();
  const [kvkk, setKvkk] = useState(false);
  const { register, handleSubmit, formState:{ errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    if (!kvkk) return toast.error('KVKK onayı zorunlu');
    const step1 = JSON.parse(localStorage.getItem('register_step1')||'{}');
  const payload = {
      email: data.email,
      password: data.password,
      personalInfo: { firstName: '—', lastName:'—' },
      companyInfo: {
        companyName: step1.companyName,
        taxNumber: step1.taxNumber,
        address: { city: step1.city, taxOffice: step1.taxOffice },
    licenseNumber: step1.utsNumber,
    licenseDocumentUrl: step1.__licenseUrl
      }
    };
    try {
      await registerApi(payload);
      localStorage.removeItem('register_step1');
      toast.success('Başvuru alındı, onay bekleniyor');
      nav('/pending-approval');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Kayıt başarısız';
      toast.error(msg);
    }
  };

  return (
    <AuthFrame title="Kayıt (2/2) — Giriş Bilgileri" subtitle="E-posta ve şifrenizi belirleyin" step={2} sideVariant="shield">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <FormText register={register} name="email" errors={errors} label="E-posta" type="email" />
          <FormText register={register} name="password" errors={errors} label="Şifre" type="password" />
          <FormText register={register} name="confirm" errors={errors} label="Şifre (Tekrar)" type="password" />
          <FormControlLabel control={<Checkbox checked={kvkk} onChange={(e)=>setKvkk(e.target.checked)} />} label="KVKK metnini kabul ediyorum" />
          <Button type="submit" variant="contained">Başvuruyu Gönder</Button>
        </Stack>
      </form>
    </AuthFrame>
  );
}
