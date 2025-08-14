import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, Typography, Button } from '@mui/material';
import FormText from '../../components/forms/FormText.jsx';
import FileUpload from '../../components/forms/FileUpload.jsx';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';
import AuthFrame from '../../components/layout/AuthFrame.jsx';

const schema = z.object({
  companyName: z.string().min(2,'Zorunlu'),
  city: z.string().min(2,'Zorunlu'),
  taxNumber: z.string().min(10,'Vergi no'),
  taxOffice: z.string().min(2,'Vergi dairesi'),
  utsNumber: z.string().min(2,'UTS no')
});

export default function RegisterStep1(){
  const nav = useNavigate();
  const [licenseFile, setLicenseFile] = useState(null);
  const { register, handleSubmit, formState:{ errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    if (!licenseFile) return alert('Ruhsat dosyası zorunlu');
    try {
      const form = new FormData();
      form.append('document', licenseFile);
      const res = await api.post('/api/upload/document/public', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const payload = { ...data, __licenseName: licenseFile.name, __licenseUrl: res.data?.url };
      localStorage.setItem('register_step1', JSON.stringify(payload));
      nav('/register/step2');
    } catch (e) {
      alert('Belge yüklenemedi. Lütfen PDF/JPG/PNG ve 10MB altında bir dosya deneyin.');
    }
  };

  return (
    <AuthFrame title="Kayıt (1/2) — Kurumsal Bilgiler" subtitle="İşletme bilgilerinizi doldurun" step={1} sideVariant="star">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <FormText register={register} name="companyName" errors={errors} label="İşletme Adı" />
          <FormText register={register} name="city" errors={errors} label="Şehir" />
          <FormText register={register} name="taxNumber" errors={errors} label="Vergi No" />
          <FormText register={register} name="taxOffice" errors={errors} label="Vergi Dairesi" />
          <FormText register={register} name="utsNumber" errors={errors} label="UTS No" />
          <FileUpload onFile={setLicenseFile} />
          {licenseFile && <Typography variant="caption">Seçilen: {licenseFile.name}</Typography>}
          <Button type="submit" variant="contained">Devam Et</Button>
        </Stack>
      </form>
    </AuthFrame>
  );
}
