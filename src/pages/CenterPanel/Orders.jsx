import React, { useEffect, useMemo, useState } from 'react';
import { listOrders } from '../../api/ordersApi';
import { Container, Chip, Box, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

const colorByStatus = (s) => ({ pending:'warning', processing:'info', shipped:'primary', delivered:'success', cancelled:'default' }[s] || 'default');
const labelByStatus = (s) => ({ pending:'Beklemede', confirmed:'Onaylandı', processing:'Hazırlanıyor', shipped:'Kargoda', delivered:'Teslim edildi', cancelled:'İptal' }[s] || (s || '-'));

function dateFromObjectId(id){
  if (!id || typeof id !== 'string' || id.length < 8) return null;
  const tsHex = id.substring(0, 8);
  const ts = parseInt(tsHex, 16);
  if (!Number.isFinite(ts)) return null;
  return new Date(ts * 1000);
}

export default function Orders(){
  const [rows, setRows] = useState([]);
  const nav = useNavigate();

  useEffect(()=>{ listOrders().then((res)=> setRows(Array.isArray(res.data)? res.data : (res.data?.items||[]))); },[]);

  const columns = useMemo(()=>[
    { field:'createdAt', headerName:'Tarih', width:190,
      renderCell:(p)=> {
        const dt = p?.row?.createdAt || p?.row?.updatedAt || dateFromObjectId(p?.row?._id);
        const t = dt ? new Date(dt).toLocaleString('tr-TR') : '-';
        return <span style={{ color:'#fff' }}>{t}</span>;
      }
    },
    { field:'orderNumber', headerName:'#', width:140,
      renderCell:(p)=> {
        const num = p?.row?.orderNumber;
        const oid = p?.row?._id || p?.row?.id;
        const val = num ? String(num) : (oid ? String(oid).slice(-6).toUpperCase() : '-');
        return <span style={{ color:'#fff' }}>{val}</span>;
      }
    },
    { field:'items', headerName:'Ürünler', flex:1, minWidth:220,
      renderCell:(p)=> {
        if (p?.row?.itemsPreview) return <span style={{ color:'#fff' }}>{p.row.itemsPreview}</span>;
        const items = Array.isArray(p?.row?.items) ? p.row.items : [];
        const txt = items.slice(0, 2).map(it => (it?.product?.name || it?.name || 'Ürün') + (it?.quantity ? ` × ${it.quantity}` : '')).join(', ');
        const more = items.length > 2 ? ` +${items.length - 2}` : '';
        return <span style={{ color:'#fff' }}>{txt ? (txt + more) : '-'}</span>;
      }
    },
  { field:'total', headerName:'Toplam', width:160, align:'right', headerAlign:'right',
      valueGetter:(p)=> {
        const total = p?.row?.pricing?.totalAmount;
        if (typeof total === 'number') return total;
        const items = Array.isArray(p?.row?.items) ? p.row.items : [];
        return items.reduce((sum, it)=> sum + (Number(it?.price || it?.product?.price || 0) * Number(it?.quantity || 0)), 0);
      },
      valueFormatter:(p)=> `${(Number(p?.value||0)).toLocaleString('tr-TR')} TL` },
    { field:'status', headerName:'Durum', width:160,
      renderCell:(p)=> {
        const raw = p?.value || p?.row?.status || '-';
        const val = labelByStatus(raw);
        return <Chip size="small" label={val} color={colorByStatus(raw)} sx={{ color:'#fff' }} />;
      }
    },
  ],[]);

  const [quick, setQuick] = useState('');
  const role = (JSON.parse(localStorage.getItem('user')||'{}')?.role)||'center';
  const baseDetail = role === 'supplier' ? '/supplier/orders' : '/orders';
  const filtered = rows.filter(r => {
    const t = Number(r?.pricing?.totalAmount || 0);
    const comp = Array.isArray(r?.items) ? r.items.reduce((s, it)=> s + (Number(it?.price || it?.product?.price || 0) * Number(it?.quantity || 0)), 0) : 0;
    return (t > 0 || comp > 0);
  });

  return (
    <Container sx={{ py:3 }}>
      <Box sx={{ height: 520, width:'100%' }}>
        <DataGrid rows={filtered} getRowId={(r)=> r._id || r.id}
          columns={columns}
          onRowClick={(p)=> nav(`${baseDetail}/${p.row._id || p.row.id}`)}
          initialState={{
            pagination:{ paginationModel:{ pageSize:10 } },
            filter: { filterModel: { items: [], quickFilterValues: [] } },
          }}
          filterModel={{ items: [], quickFilterValues: quick ? [quick] : [] }}
          pageSizeOptions={[10,25,50]}
          disableRowSelectionOnClick
          slots={{ toolbar: GridSimpleToolbar }}
          slotProps={{ toolbar: { placeholder: 'Hızlı filtre…', value: quick, onChange: setQuick } }}
          sx={{
            color: '#fff',
            '& .MuiDataGrid-cell': { color: '#fff' },
            '& .MuiDataGrid-columnHeaders': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.12)' },
            '& .MuiDataGrid-columnHeaderTitle': { color: '#fff' },
            '& .MuiDataGrid-footerContainer': { color: '#fff', borderTop: '1px solid rgba(255,255,255,0.12)' },
            '& .MuiSvgIcon-root': { color: '#fff' },
            '& .MuiTablePagination-root, & .MuiTablePagination-actions': { color: '#fff' },
            '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(255,255,255,0.04)' }
          }}
        />
      </Box>
    </Container>
  );
}

function GridSimpleToolbar({ placeholder, value, onChange }){
  return (
    <Box sx={{ p:1 }}>
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        value={value||''}
        onChange={(e)=> onChange?.(e.target.value)}
        InputProps={{ sx:{ color:'#fff' } }}
        sx={{
          '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)', opacity: 1 },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' }
        }}
      />
    </Box>
  );
}
