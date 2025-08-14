import React from 'react';
import { TextField } from '@mui/material';

export default function FormText({ register, name, errors, label, type='text', children, ...rest }) {
  return (
    <TextField {...register(name)} label={label} type={type} fullWidth error={!!errors?.[name]} helperText={errors?.[name]?.message} {...rest}>
      {children}
    </TextField>
  );
}
