import React from 'react';
import { Chip } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useLoyalty } from '../../store/loyaltySlice';

export default function CreditIndicator() {
  const { credit } = useLoyalty();
  return <Chip icon={<MonetizationOnIcon />} color="primary" label={`Sadakat Kredisi: ${credit.toLocaleString('tr-TR')} TL`} />;
}
