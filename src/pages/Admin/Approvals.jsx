import React, { useEffect, useMemo, useState } from 'react';
import { Container, Button, Chip, Stack, Typography, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { listApprovals, actOnApproval } from '../../api/approvalsApi';

export default function AdminApprovals(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const load = async ()=>{
    setLoading(true);
    try {
      const res = await listApprovals();
      const items = res.data?.items || [];
      setRows(items);
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{ load(); },[]);

  const handle = async (row, action)=>{
    await actOnApproval(row.type, row.id, action);
    await load();
  };

  const columns = useMemo(()=>[
    { field:'type', headerName:'Tür', width:160, renderCell:(p)=>{
      const map = { user_company:'Kurum Bilgisi', product:'Ürün', order:'Sipariş', supplier_application:'Tedarikçi Başvuru' };
      return <Chip size="small" label={map[p.value] || p.value} />;
    }},
    { field:'title', headerName:'Başlık', flex:1, renderCell:(p)=> (
      <Stack>
        <Typography fontWeight={600} variant="body2">{p.value}</Typography>
        {p.row.subtitle ? <Typography variant="caption" color="text.secondary">{p.row.subtitle}</Typography> : null}
      </Stack>
    ) },
    { field:'requestedBy', headerName:'İsteyen', width:220 },
    { field:'status', headerName:'Durum', width:140, renderCell:(p)=>{
      const color = p.value==='pending'?'warning':p.value==='approved'?'success':p.value==='active'?'success':p.value==='rejected'?'error':'default';
      return <Chip size="small" color={color} label={p.value} />;
    } },
    { field:'createdAt', headerName:'Tarih', width:180, valueFormatter:(p)=> new Date(p?.value||Date.now()).toLocaleString('tr-TR') },
    { field:'actions', headerName:'İşlem', width:220, renderCell:(p)=> (
      <Stack direction="row" spacing={1}>
        <Tooltip title="Onayla"><span><Button size="small" variant="contained" color="success" onClick={()=>handle(p.row,'approve')}>Onay</Button></span></Tooltip>
        <Tooltip title="Reddet"><span><Button size="small" variant="outlined" color="error" onClick={()=>handle(p.row,'reject')}>Red</Button></span></Tooltip>
      </Stack>
    )}
  ],[]);

  return (
    <Container sx={{ py:3 }}>
      <Typography variant="h5" sx={{ mb:2 }}>Onay Merkezi</Typography>
      <div style={{ height: 560, width:'100%' }}>
        <DataGrid rows={rows} loading={loading} getRowId={(r)=> `${r.type}:${r.id}`} columns={columns} pageSizeOptions={[10,25,50]} initialState={{ pagination:{ paginationModel:{ pageSize:10 } } }} />
      </div>
    </Container>
  );
}
