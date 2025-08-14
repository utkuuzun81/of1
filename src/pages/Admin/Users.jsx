import React, { useEffect, useState } from 'react';
import { Container, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Stack, Chip, TextField, MenuItem } from '@mui/material';
import { listUsers, assignRole, deleteUser } from '../../api/usersApi';

export default function Users(){
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('all');
  const [role, setRole] = useState('all');
  const [q, setQ] = useState('');
  const load = async () => { const res = await listUsers({ status, role, q }); setRows(res.data||[]); };
  useEffect(()=>{ load(); },[status, role, q]);

  const onAssign = async (id, role) => { await assignRole(id, role); await load(); };
  const onDelete = async (id) => { await deleteUser(id); await load(); };

  const toFileUrl = (u) => {
    if (!u) return null;
    if (/^https?:\/\//i.test(u)) return u;
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    if (apiBase && /^https?:\/\//i.test(apiBase)) return `${apiBase.replace(/\/$/, '')}${u}`;
    return u;
  };

  return (
    <Container sx={{ py:3 }}>
      <Paper sx={{ p:2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb:1, gap:2, flexWrap:'wrap' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField select size="small" label="Durum" value={status} onChange={(e)=> setStatus(e.target.value)} sx={{ minWidth: 160 }}>
              {['all','pending','approved','rejected','suspended'].map(s=> <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Rol" value={role} onChange={(e)=> setRole(e.target.value)} sx={{ minWidth: 160 }}>
              {['all','admin','center','supplier','user'].map(r=> <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <TextField size="small" label="Ara" value={q} onChange={(e)=> setQ(e.target.value)} sx={{ minWidth: 220 }} />
          </Stack>
          <Chip color="info" label={`Kayıt: ${rows.length}`} />
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Firma</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Ruhsat</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="right">İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((u)=> (
              <TableRow key={u._id}>
                <TableCell>{u.companyInfo?.companyName || u.personalInfo?.firstName || '-'}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {(()=>{
                    const lic = u.companyInfoPending?.licenseDocumentUrl || u.companyInfo?.licenseDocumentUrl;
                    return lic ? <a href={toFileUrl(lic)} target="_blank" rel="noreferrer">Görüntüle</a> : '—';
                  })()}
                </TableCell>
                <TableCell><Chip size="small" label={u.status} color={u.status==='pending'?'warning':u.status==='approved'?'success':u.status==='rejected'?'default':'default'} /></TableCell>
                <TableCell><Chip size="small" label={u.role||'-'} /></TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={()=>onAssign(u._id,'supplier')}>Tedarikçi</Button>
                    <Button size="small" variant="contained" onClick={()=>onAssign(u._id,'center')}>Merkez</Button>
                    <Button size="small" color="error" onClick={()=>onDelete(u._id)}>Sil</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
