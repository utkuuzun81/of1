import React from 'react';
import { Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { downloadInvoice } from '../../api/ordersApi';

export default function PDFButton({ orderId }) {
  return (
    <Button startIcon={<PictureAsPdfIcon />} onClick={() => downloadInvoice(orderId)} variant="outlined" sx={{ position:'sticky', top:16, float:'right' }}>
      Fatura İndir
    </Button>
  );
}
