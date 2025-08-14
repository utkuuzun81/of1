import React from 'react';
import { TextField, MenuItem } from '@mui/material';

export default function FormSelect({ register, name, errors, label, options=[], ...rest }) {
  return (
    <TextField select {...register(name)} label={label} fullWidth error={!!errors?.[name]} helperText={errors?.[name]?.message} {...rest}>
      {options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
    </TextField>
  );
}
