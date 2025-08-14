import React, { useEffect, useState, useMemo } from 'react';
import { Container, Chip, Stack, ToggleButtonGroup, ToggleButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Autocomplete from '@mui/material/Autocomplete';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { listOrders, updateStatus, downloadInvoice } from '../../api/ordersApi';
import api from '../../api/client';
import { listUsers } from '../../api/usersApi';

export default function Orders(){
  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [supplierId, setSupplierId] = useState('');
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const nav = useNavigate();
  const load = async () => {
    const res = await listOrders('admin');
    setRows(res.data || []);
  };
  useEffect(()=>{ load(); },[]);
  useEffect(()=>{
    const id = setInterval(load, 60000);
    return ()=> clearInterval(id);
  },[]);
  const statusLabel = useMemo(() => ({
    pending: 'bekliyor',
    bekliyor: 'bekliyor',
    confirmed: 'onaylandı',
    onaylandi: 'onaylandı',
    processing: 'işlemde',
    shipped: 'kargolandı',
    delivered: 'teslim edildi',
    cancelled: 'iptal edildi',
    refunded: 'iade edildi'
  }), []);
  const statusColor = useMemo(() => ({
    pending: 'warning', bekliyor: 'warning',
    confirmed: 'success', onaylandi: 'success', delivered: 'success',
    processing: 'info', shipped: 'info',
    cancelled: 'error', refunded: 'error'
  }), []);

  const resolveBuyer = (row)=>{
    return row?.userDisplay
      || row?.customerInfo?.companyName
      || row?.customerInfo?.name
      || row?.customerInfo?.email
      || row?.billingAddress?.name
      || row?.userId
      || '-';
  };

  const cols = [
    { field:'createdAt', headerName:'Tarih', width:210,
      renderCell:(p)=>{
        const dt = p?.row?.createdAt || p?.row?.updatedAt || (p?.row?._id ? new Date(parseInt(String(p.row._id).slice(0,8),16)*1000) : null);
        return <span>{dt ? new Date(dt).toLocaleString('tr-TR') : '-'}</span>;
      }
    },
    { field:'orderNumber', headerName:'#', width:140, valueGetter:(p)=> p?.row?.orderNumber || (p?.row?._id ? String(p.row._id).slice(-6).toUpperCase() : '-') },
    { field:'userDisplay', headerName:'Sipariş Eden', width:280, valueGetter:(p)=> resolveBuyer(p?.row) },
    { field:'items', headerName:'Ürünler', flex:1, minWidth:260,
      renderCell:(p)=>{
        const items = Array.isArray(p?.row?.items) ? p.row.items : [];
        const txt = (p?.row?.itemsPreview) || items.slice(0,2).map(it => (it?.name || it?.product?.name || 'Ürün') + (it?.quantity?` × ${it.quantity}`:'' )).join(', ');
        const more = items.length>2 ? ` +${items.length-2}` : '';
        return <span>{txt ? (txt+more) : '-'}</span>;
      }
    },
    {
      field:'total', headerName:'Toplam', width:160, type:'number',
      valueGetter: (params) => {
        const total = params?.row?.pricing?.totalAmount;
        if (typeof total === 'number') return total;
        const items = params?.row?.items || [];
        const calc = Array.isArray(items)
          ? items.reduce((sum, it) => sum + (Number(it?.price || it?.product?.price || 0) * Number(it?.quantity || 0)), 0)
          : 0;
        return calc;
      },
      valueFormatter: (params) => {
        const v = typeof params?.value === 'number' ? params.value : Number(params?.value || 0);
        return `${v.toLocaleString('tr-TR')} TL`;
      }
    },
    {
      field:'status', headerName:'Durum', width:180,
      renderCell: (p) => {
        const val = p?.row?.status || p?.value;
        const label = statusLabel[val] || val || '-';
        const color = statusColor[val] || 'default';
        return <Chip size="small" color={color} label={label} />;
      }
    },
    {
      field: 'actions', headerName: '', width: 60, sortable: false, filterable: false,
      renderCell: (p) => (
        <IconButton
          size="small"
          onClick={(e)=>{ setMenuAnchor(e.currentTarget); setMenuRow(p.row); }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )
    }
  ];
  return (
    <Container sx={{ py:3 }}>
    { rows.some(r=> r.status==='pending' && ageHours(r.createdAt) >= 2) && (
      <Alert severity="warning" sx={{ mb:2 }}>
        2 saatten uzun süredir bekleyen siparişler var. Lütfen kontrol edin.
      </Alert>
    )}
    <Stack direction="row" spacing={2} sx={{ mb:1 }}>
        <ToggleButtonGroup exclusive size="small" value={statusFilter} onChange={(_,v)=> v && setStatusFilter(v)}>
          <ToggleButton value="all">Tümü</ToggleButton>
          <ToggleButton value="pending">Bekleyen</ToggleButton>
          <ToggleButton value="confirmed">Onaylı</ToggleButton>
          <ToggleButton value="shipped">Kargoda</ToggleButton>
      <ToggleButton value="delivered">Teslim</ToggleButton>
      <ToggleButton value="cancelled">İptal</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <div style={{ height:560, width:'100%' }}>
        <DataGrid rows={rows.filter(r=> isRealOrder(r) && (statusFilter==='all' ? true : r.status===statusFilter))} getRowId={(r)=> r._id || r.id} columns={cols}
          onRowClick={(p)=> nav(`/admin/orders/${p.row._id || p.row.id}`)}
          initialState={{ pagination:{ paginationModel:{ pageSize:10 } } }}
          pageSizeOptions={[10,25,50]} disableRowSelectionOnClick />
      </div>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={()=>{ setMenuAnchor(null); setMenuRow(null); }}
      >
        <MenuItem onClick={()=>{ if(menuRow){ nav(`/admin/orders/${menuRow._id || menuRow.id}`); } setMenuAnchor(null); }}>
          Detay
        </MenuItem>
        <MenuItem onClick={async ()=>{ if(menuRow){ await downloadInvoice(menuRow._id || menuRow.id); } setMenuAnchor(null); }}>
          Fatura indir
        </MenuItem>
        <MenuItem onClick={async ()=>{
          if (menuRow) {
            // Load suppliers on demand
            try {
              const res = await listUsers({ role: 'supplier' });
              setSupplierOptions(res.data || []);
            } catch {}
            setAssignOrderId(menuRow._id || menuRow.id);
            setAssignOpen(true);
          }
          setMenuAnchor(null);
        }}>
          Tedarikçi ata
        </MenuItem>
        <MenuItem onClick={()=>{ if(menuRow){ setCancelOrderId(menuRow._id || menuRow.id); setCancelOpen(true); } setMenuAnchor(null); }}>
          İptal et
        </MenuItem>
      </Menu>
      <Dialog open={assignOpen} onClose={()=> setAssignOpen(false)}>
        <DialogTitle>Tedarikçi Ata</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={supplierOptions}
            getOptionLabel={(o)=> (o?.companyInfo?.companyName || o?.email || '')}
            isOptionEqualToValue={(opt, val)=> (opt?._id||opt?.id) === (val?._id||val?.id)}
            value={supplierOptions.find(o=> (o._id===supplierId) || (o.id===supplierId)) || null}
            onChange={(_, val)=> setSupplierId(val?._id || val?.id || '')}
            renderInput={(params)=> <TextField {...params} label="Tedarikçi" sx={{ mt:1, minWidth: 360 }} />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setAssignOpen(false)}>Vazgeç</Button>
          <Button variant="contained" onClick={async ()=>{ if (!assignOrderId) return; await api.put(`/api/orders/${assignOrderId}/assign-supplier`, { supplierId }); setAssignOpen(false); await load(); }}>Kaydet</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={cancelOpen} onClose={()=> setCancelOpen(false)}>
        <DialogTitle>Siparişi İptal Et</DialogTitle>
        <DialogContent>
          Bu siparişi iptal etmek istediğinize emin misiniz? Bu işlem yalnızca bekleyen siparişler için geçerlidir.
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setCancelOpen(false)}>Vazgeç</Button>
          <Button color="error" variant="contained" onClick={async ()=>{ if (!cancelOrderId) return; await api.put(`/api/orders/${cancelOrderId}/cancel`); setCancelOpen(false); await load(); }}>İptal Et</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

function isRealOrder(r){
  if (!r) return false;
  const total = Number(r?.pricing?.totalAmount || 0);
  const lines = Array.isArray(r.items) ? r.items : [];
  const computed = lines.reduce((s, it)=> s + (Number(it?.price || it?.product?.price || 0) * Number(it?.quantity || 0)), 0);
  // Require positive monetary amount either from pricing or computed sum
  return Boolean(r.createdAt) && (total > 0 || computed > 0);
}

function humanizeAge(ts){
  const diff = Date.now() - ts.getTime();
  const mins = Math.floor(diff/60000);
  if (mins < 60) return `${mins} dk`;
  const hours = Math.floor(mins/60);
  const rem = mins % 60;
  return `${hours}s ${rem}dk`;
}

function ageHours(dt){
  if (!dt) return 0;
  const ts = typeof dt === 'string' || dt instanceof Date ? new Date(dt).getTime() : Number(dt);
  return (Date.now() - ts) / (1000*60*60);
}
