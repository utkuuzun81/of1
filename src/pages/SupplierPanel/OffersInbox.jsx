import React, { useEffect, useState } from 'react';
import { Container, Table, TableHead, TableRow, TableCell, TableBody, Button, Stack } from '@mui/material';
import { listQuotations, respondQuotation } from '../../api/quotationsApi';

export default function OffersInbox(){
  const [rows, setRows] = useState([]);
  useEffect(()=>{ listQuotations('supplier').then((res)=> setRows(res.data||[])); },[]);

  const act = async (row, accept) => {
    await respondQuotation(row.quoteNumber, { status: accept ? 'accepted' : 'declined' });
    setRows((r)=> r.map(x=> x.quoteNumber===row.quoteNumber ? { ...x, status: accept?'accepted':'declined' } : x));
  };

  return (
    <Container sx={{ py:3 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Başlık</TableCell>
            <TableCell>Merkez</TableCell>
            <TableCell>Durum</TableCell>
            <TableCell align="right">İşlem</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r)=> (
            <TableRow key={r.quoteNumber}>
              <TableCell>{r.quoteNumber}</TableCell>
              <TableCell>{r.requestInfo?.title}</TableCell>
              <TableCell>{r.centerInfo?.name || '-'}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="outlined" onClick={()=>act(r,false)} disabled={r.status!=='pending'}>Reddet</Button>
                  <Button size="small" variant="contained" onClick={()=>act(r,true)} disabled={r.status!=='pending'}>Kabul</Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
