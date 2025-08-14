import React from 'react';
import { Dialog, DialogTitle, DialogActions, Button } from '@mui/material';

export default function ConfirmDialog({ open, title, onCancel, onConfirm }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogActions>
        <Button onClick={onCancel}>Vazgeç</Button>
        <Button onClick={onConfirm} variant="contained" color="primary">Onayla</Button>
      </DialogActions>
    </Dialog>
  );
}
