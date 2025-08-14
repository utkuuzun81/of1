import React, { useRef } from 'react';
import { Button, Box, Typography } from '@mui/material';

export default function FileUpload({ onFile, accept='application/pdf,image/*' }) {
  const ref = useRef(null);
  return (
    <Box>
      <input ref={ref} type="file" hidden accept={accept} onChange={(e) => onFile?.(e.target.files?.[0])} />
      <Button variant="outlined" onClick={() => ref.current?.click()}>Dosya Yükle</Button>
      <Typography variant="caption" display="block" color="text.secondary">PDF/JPG/PNG, maks 10MB</Typography>
    </Box>
  );
}
