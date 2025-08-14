import React from 'react';
import { Alert } from '@mui/material';

export default function GamificationBanner({ message }) {
  return <Alert severity="info" sx={{ background:'#fecaca' }}>{message}</Alert>;
}
