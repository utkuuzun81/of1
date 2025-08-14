import React, { useEffect, useState } from 'react';
import { Container, Table, TableHead, TableRow, TableCell, TableBody, Button, Stack, Chip } from '@mui/material';
import { listPendingUsers, approveCompanyInfo, rejectCompanyInfo } from '../../api/usersApi';

export default function Applications(){
  const [rows, setRows] = useState([]);
  const load = async ()=> { const res = await listPendingUsers(); setRows(res.data||[]); };
  useEffect(()=>{ load(); },[]);

  // Resolve file URL to absolute if backend returned a relative "/uploads/..." path
  const toFileUrl = (u) => {
    if (!u) return null;
    if (/^https?:\/\//i.test(u)) return u;
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    if (apiBase && /^https?:\/\//i.test(apiBase)) {
      return `${apiBase.replace(/\/$/, '')}${u}`;
    }
    return u; // fallback
  };

  return (
    <Container sx={{ py:3 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Firma</TableCell>
            <TableCell>E-posta</TableCell>
            <TableCell>Ruhsat</TableCell>
            <TableCell>Durum</TableCell>
            <TableCell align="right">İşlem</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
      {rows.map((u)=> {
            const pending = u.companyInfoPending || {};
            const licenseUrl = pending.licenseDocumentUrl || u.companyInfo?.licenseDocumentUrl;
            const companyName = pending.companyName || u.companyInfo?.companyName || '-';
            return (
            <TableRow key={u._id}>
              <TableCell>{companyName}</TableCell>
              <TableCell>{u.email}</TableCell>
        <TableCell>{licenseUrl ? <a href={toFileUrl(licenseUrl)} target="_blank" rel="noreferrer">Görüntüle</a> : '-'}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Chip size="small" label={u.status} color={u.status==='pending'?'warning': u.status==='approved'?'success':'default'} />
                  {u.companyInfoApprovalStatus && <Chip size="small" label={`kurum: ${u.companyInfoApprovalStatus}`} />}
                </Stack>
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="contained" onClick={async()=>{ await approveCompanyInfo(u._id); await load(); }}>Onayla</Button>
                  <Button size="small" color="error" onClick={async()=>{ await rejectCompanyInfo(u._id); await load(); }}>Reddet</Button>
                </Stack>
              </TableCell>
            </TableRow>
          );})}
        </TableBody>
      </Table>
    </Container>
  );
}
