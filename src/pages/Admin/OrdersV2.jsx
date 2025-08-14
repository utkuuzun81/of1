import React, { useEffect, useMemo, useState } from 'react';
import { Container, Chip, Stack, ToggleButtonGroup, ToggleButton, Alert, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Tooltip, Switch, FormControlLabel, InputAdornment, LinearProgress, Box, Checkbox } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Autocomplete from '@mui/material/Autocomplete';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { listOrders, downloadInvoice, updateStatus } from '../../api/ordersApi';
import api from '../../api/client';
import { listUsers } from '../../api/usersApi';
import fileDownload from 'js-file-download';
import { toast } from 'react-toastify';

export default function OrdersV2(){
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [supplierId, setSupplierId] = useState('');
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(() => {
    try { return JSON.parse(localStorage.getItem('orders.autoRefresh')||'false'); } catch { return false; }
  });
  const [search, setSearch] = useState(() => localStorage.getItem('orders.search') || '');
  const [dateFilter, setDateFilter] = useState(() => localStorage.getItem('orders.dateFilter') || 'all');
  const [dateStart, setDateStart] = useState(() => localStorage.getItem('orders.dateStart') || '');
  const [dateEnd, setDateEnd] = useState(() => localStorage.getItem('orders.dateEnd') || '');
  const [pageSize, setPageSize] = useState(() => {
    const v = Number(localStorage.getItem('orders.pageSize')||10);
    return [10,25,50].includes(v) ? v : 10;
  });
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [statusMenuRow, setStatusMenuRow] = useState(null);
  const [density, setDensity] = useState(() => localStorage.getItem('orders.density') || 'standard');
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  const [columnVisibility, setColumnVisibility] = useState(() => {
    try { return JSON.parse(localStorage.getItem('orders.columnVisibility') || '{}'); } catch { return {}; }
  });
  const [settingsAnchor, setSettingsAnchor] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await listOrders('admin');
      setRows(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{ load(); },[]);
  useEffect(()=>{
    if (!autoRefresh) return;
    const int = setInterval(load, 60000);
    return ()=> clearInterval(int);
  },[autoRefresh]);
  useEffect(()=>{ localStorage.setItem('orders.autoRefresh', JSON.stringify(autoRefresh)); },[autoRefresh]);
  useEffect(()=>{ localStorage.setItem('orders.search', search); },[search]);
  useEffect(()=>{ localStorage.setItem('orders.dateFilter', dateFilter); },[dateFilter]);
  useEffect(()=>{ localStorage.setItem('orders.dateStart', dateStart); },[dateStart]);
  useEffect(()=>{ localStorage.setItem('orders.dateEnd', dateEnd); },[dateEnd]);
  useEffect(()=>{ localStorage.setItem('orders.pageSize', String(pageSize)); },[pageSize]);
  useEffect(()=>{ localStorage.setItem('orders.density', density); },[density]);
  useEffect(()=>{ localStorage.setItem('orders.columnVisibility', JSON.stringify(columnVisibility)); },[columnVisibility]);

  const statusLabel = useMemo(() => ({
    pending: 'bekliyor',
    confirmed: 'onaylandı',
    processing: 'işlemde',
    shipped: 'kargolandı',
    delivered: 'teslim edildi',
    cancelled: 'iptal edildi',
    refunded: 'iade edildi'
  }), []);
  const statusColor = useMemo(() => ({
    pending: 'warning',
    confirmed: 'success', delivered: 'success',
    processing: 'info', shipped: 'info',
    cancelled: 'error', refunded: 'error'
  }), []);

  const buyerOf = (r)=> {
    const b = r?.userDisplay
      || r?.customerInfo?.companyName
      || r?.customerInfo?.name
      || r?.customerInfo?.email
      || r?.billingAddress?.name
      || r?.user?.firmaAdi
      || r?.user?.email
      || r?.buyer
      || r?.userId
      || null;
    return b || '—';
  };
  const sumOf = (r)=>{
    const explicit = Number(r?.pricing?.totalAmount);
    if (!Number.isNaN(explicit) && explicit > 0) return explicit;
    const items = Array.isArray(r?.items) ? r.items : [];
    return items.reduce((s,it)=> s + (Number(it?.price || it?.product?.price || 0) * Number(it?.quantity || 0)), 0);
  };

  const applyDate = (r)=>{
    const v = r?.createdAt || r?.created_at || r?.date || r?.orderDate;
    if (!v) return false;
    const dt = new Date(v);
    if (dateFilter === 'all') return true;
    if (dateFilter === 'today'){
      const now = new Date();
      return dt.toDateString() === now.toDateString();
    }
    if (dateFilter === 'last7'){
      const now = new Date();
      const past = new Date(now.getTime() - 7*24*60*60*1000);
      return dt >= past && dt <= now;
    }
    if (dateFilter === 'custom'){
      const sOk = dateStart ? dt >= new Date(dateStart) : true;
      const eOk = dateEnd ? dt <= new Date(dateEnd + 'T23:59:59') : true;
      return sOk && eOk;
    }
    return true;
  };
  const applySearch = (r)=>{
    const q = (search||'').trim().toLowerCase();
    if (!q) return true;
    const fields = [
      r?.orderNumber, r?._id, r?.id,
      r?.userDisplay, r?.customerInfo?.companyName, r?.customerInfo?.name, r?.customerInfo?.email,
      r?.billingAddress?.name, r?.shippingAddress?.name, r?.userId
    ];
    return fields.some(v => String(v||'').toLowerCase().includes(q));
  };

  const cols = [
  { field:'orderNumber', headerName:'Sipariş No', width:180, renderCell:(p)=> {
      const r = p?.row || {};
      const v = r.orderNumber || r.order_no || r.no || r._id || r.id || null;
      return v ? String(v) : '—';
    } },
    { field:'buyer', headerName:'Sipariş Eden', width:280, renderCell:(p)=> {
      const r = p?.row || {};
      return buyerOf(r);
    } },
    { field:'createdAt', headerName:'Tarih', width:220, renderCell:(p)=> {
      const r = p?.row || {};
      const v = r.createdAt || r.created_at || r.date || r.orderDate || null;
      return v ? new Date(v).toLocaleString('tr-TR') : '—';
    } },
    { field:'total', headerName:'Toplam', width:160, type:'number', renderCell:(p)=> {
      const r = p?.row || {};
      const val = sumOf(r);
      return `${Number(val||0).toLocaleString('tr-TR')} TL`;
    } },
    { field:'status', headerName:'Durum', width:160, renderCell:(p)=> {
      const r = p?.row || {};
      const v = r.status;
      return (
        <Chip
          size="small"
          color={statusColor[v]||'default'}
          label={statusLabel[v]||v||'-'}
          onClick={(e)=>{ e.stopPropagation(); setStatusMenuAnchor(e.currentTarget); setStatusMenuRow(r); }}
          sx={{ cursor: 'pointer' }}
        />
      );
    } },
    {
      field:'actions', headerName:'', width:180, sortable:false, filterable:false, disableColumnMenu: true, headerAlign: 'center', align: 'center',
      renderCell:(p)=> {
        const r = p?.row || {};
        return (
          <Stack direction="row" spacing={1} alignItems="center" onClick={(e)=> e.stopPropagation()} sx={{ minWidth: 150, justifyContent: 'flex-start' }}>
            <Tooltip title="Detay" arrow>
              <IconButton
                size="small"
                sx={{ color: 'text.secondary', '& svg': { fontSize: 22 }, '&:hover': { color: 'primary.main' } }}
                onClick={(e)=>{ e.stopPropagation(); nav(`/admin/orders/${r._id || r.id}`); }}
              >
                <VisibilityOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fatura indir" arrow>
              <IconButton
                size="small"
                sx={{ color: 'text.secondary', '& svg': { fontSize: 22 }, '&:hover': { color: 'primary.main' } }}
                onClick={async (e)=>{ e.stopPropagation(); if(r){ toast.info('Fatura indiriliyor...'); await downloadInvoice(r._id || r.id); } }}
              >
                <ReceiptLongOutlinedIcon />
              </IconButton>
            </Tooltip>
            {/* Keep Assign/Cancel under overflow menu to reduce clutter */}
            <Tooltip title="Diğer" arrow>
              <IconButton
                size="small"
                sx={{ color: 'text.secondary', '& svg': { fontSize: 22 }, '&:hover': { color: 'primary.main' } }}
                onClick={(e)=>{ e.stopPropagation(); setMenuAnchor(e.currentTarget); setMenuRow(r); }}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      }
    }
  ];

  const prepared = rows.map(r => ({ ...r, totalCached: sumOf(r)})).filter(r => r.createdAt && r.totalCached > 0);
  const filteredByDateAndSearch = prepared.filter(r => applyDate(r) && applySearch(r));
  const statusCounts = filteredByDateAndSearch.reduce((acc, r)=>{ acc.all=(acc.all||0)+1; acc[r.status]=(acc[r.status]||0)+1; return acc; },{});
  const filtered = filteredByDateAndSearch.filter(r => statusFilter==='all' ? true : r.status===statusFilter);
  const omittedCount = rows.length - filtered.length;
  const summary = useMemo(()=>{
    const totalCount = filtered.length;
    const totalSum = filtered.reduce((s,r)=> s + Number(r.totalCached||0), 0);
    return { totalCount, totalSum };
  }, [filtered]);

  const exportCsv = ()=>{
    const header = ['Sipariş No','Sipariş Eden','Tarih','Toplam','Durum'];
    const lines = filtered.map(r=>[
      r.orderNumber || r._id || r.id || '',
      buyerOf(r),
      r.createdAt ? new Date(r.createdAt).toLocaleString('tr-TR') : '',
      String(Number(r.totalCached||0).toFixed(2)).replace('.', ','),
      statusLabel[r.status] || r.status || ''
    ]);
    const csv = [header, ...lines].map(row=> row.map(v=> `"${String(v).replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob = new Blob(["\ufeff", csv], { type: 'text/csv;charset=utf-8;' });
    // use fileDownload from js-file-download which accepts Blob instance as data
    fileDownload(blob, `orders_${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <Container sx={{ py:3 }}>
  <Stack direction="row" spacing={1.25} sx={{ mb:0.5, flexWrap: 'nowrap', overflowX: 'auto' }} alignItems="center">
        <Chip size="small" label="V2" color="info" variant="outlined" />
        <ToggleButtonGroup
          exclusive
          size="small"
          value={statusFilter}
          onChange={(_,v)=> v && setStatusFilter(v)}
          color="primary"
          sx={{
            '& .MuiToggleButton-root': {
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': { color: 'primary.light', borderColor: 'primary.light' }
            },
            '& .Mui-selected': {
              color: 'primary.contrastText',
              backgroundColor: 'primary.main',
              borderColor: 'primary.main',
              '&:hover': { backgroundColor: 'primary.dark', borderColor: 'primary.dark' }
            }
          }}
        >
          <ToggleButton value="all">Tümü ({statusCounts.all||0})</ToggleButton>
          <ToggleButton value="pending">Bekleyen ({statusCounts.pending||0})</ToggleButton>
          <ToggleButton value="confirmed">Onaylı ({statusCounts.confirmed||0})</ToggleButton>
          <ToggleButton value="shipped">Kargoda ({statusCounts.shipped||0})</ToggleButton>
          <ToggleButton value="delivered">Teslim ({statusCounts.delivered||0})</ToggleButton>
          <ToggleButton value="cancelled">İptal ({statusCounts.cancelled||0})</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          value={search}
          onChange={(e)=> setSearch(e.target.value)}
          size="small"
          placeholder="Ara: sipariş no, e‑posta, isim"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            sx: {
              '& input::placeholder': { color: 'text.secondary', opacity: 1 }
            }
          }}
          sx={{ minWidth: 280 }}
        />
        <TextField
          select size="small"
          value={dateFilter}
          onChange={(e)=> setDateFilter(e.target.value)}
          sx={{ minWidth: 150 }}
          InputLabelProps={{ sx: { color: 'text.primary', '&.Mui-focused': { color: 'primary.light' } } }}
          label="Tarih"
        >
          <MenuItem value="all">Tüm Tarihler</MenuItem>
          <MenuItem value="today">Bugün</MenuItem>
          <MenuItem value="last7">Son 7 Gün</MenuItem>
          <MenuItem value="custom">Özel</MenuItem>
        </TextField>
  {dateFilter==='custom' && (
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField type="date" size="small" value={dateStart} onChange={(e)=> setDateStart(e.target.value)} />
            <TextField type="date" size="small" value={dateEnd} onChange={(e)=> setDateEnd(e.target.value)} />
          </Stack>
        )}
      </Stack>
      {/* Info alert removed for a cleaner UI */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb:1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip variant="outlined" label={`Kayıt: ${summary.totalCount}`} />
          <Chip variant="outlined" label={`Toplam: ${summary.totalSum.toLocaleString('tr-TR')} TL`} />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Yenile"><IconButton size="small" onClick={load} sx={{ color: 'text.primary', '& svg': { fontSize: 22 } }}><RefreshIcon /></IconButton></Tooltip>
          <Tooltip title="CSV indir"><IconButton size="small" onClick={exportCsv} sx={{ color: 'text.primary', '& svg': { fontSize: 22 } }}><FileDownloadOutlinedIcon /></IconButton></Tooltip>
          <Tooltip title="Ayarlar"><IconButton size="small" onClick={(e)=> setSettingsAnchor(e.currentTarget)} sx={{ color: 'text.primary', '& svg': { fontSize: 22 } }}><SettingsOutlinedIcon /></IconButton></Tooltip>
        </Stack>
      </Stack>
      <div style={{ height:560, width:'100%' }}>
        <DataGrid
          rows={filtered}
          getRowId={(r)=> r._id || r.id}
          columns={cols}
          onRowClick={(p)=> nav(`/admin/orders/${p.row._id || p.row.id}`)}
          loading={loading}
          density={density}
          columnVisibilityModel={columnVisibility}
          onColumnVisibilityModelChange={(m)=> setColumnVisibility(m)}
          sx={{
            color: 'text.primary',
            '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-footerContainer': { color: 'text.primary' },
            '& .MuiDataGrid-cell': { color: 'text.primary' }
          }}
          slots={{
            loadingOverlay: () => <LinearProgress sx={{ width: '100%' }} />,
            noRowsOverlay: () => (
              <Box sx={{ p:2, textAlign: 'center', color: 'text.secondary' }}>
                Kriterlere uyan sipariş yok
              </Box>
            )
          }}
          paginationModel={{ pageSize, page: 0 }}
          onPaginationModelChange={(m)=> setPageSize(m.pageSize)}
          pageSizeOptions={[10,25,50]}
          disableRowSelectionOnClick
        />
      </div>
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={()=> setSettingsAnchor(null)}
      >
        <MenuItem onClick={()=> setDensity(density==='standard'?'compact':'standard')}>
          Görünüm: {density==='standard' ? 'Standart' : 'Kompakt'}
        </MenuItem>
        <MenuItem onClick={(e)=>{ setSettingsAnchor(null); setColumnsMenuAnchor(e.currentTarget); }}>
          Sütunlar…
        </MenuItem>
        <MenuItem disableRipple>
          <FormControlLabel control={<Switch size="small" checked={autoRefresh} onChange={(e)=> setAutoRefresh(e.target.checked)} />} label="Oto-yenile" />
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={()=>{ setStatusMenuAnchor(null); setStatusMenuRow(null); }}
      >
        {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => (
          <MenuItem key={s} onClick={async ()=>{
            if (!statusMenuRow) return;
            try {
              await updateStatus(statusMenuRow._id || statusMenuRow.id, s);
              toast.success('Durum güncellendi');
            } catch {
              toast.error('Durum güncellenemedi');
            }
            setStatusMenuAnchor(null); setStatusMenuRow(null);
            await load();
          }}>
            {statusLabel[s] || s}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={columnsMenuAnchor}
        open={Boolean(columnsMenuAnchor)}
        onClose={()=> setColumnsMenuAnchor(null)}
      >
        {['orderNumber','buyer','createdAt','total','status','actions'].map(key => (
          <MenuItem key={key} onClick={()=> setColumnVisibility(v => ({ ...v, [key]: !(v?.[key] ?? true) }))}>
            <Checkbox size="small" checked={columnVisibility?.[key] ?? true} />
            {({
              orderNumber: 'Sipariş No', buyer: 'Sipariş Eden', createdAt: 'Tarih', total: 'Toplam', status: 'Durum', actions: 'Aksiyonlar'
            })[key]}
          </MenuItem>
        ))}
      </Menu>
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
        <MenuItem onClick={()=>{ if(menuRow){ setAssignOrderId(null); setSupplierId(''); nav(`/admin/orders/${menuRow._id || menuRow.id}`); } setMenuAnchor(null); }}>
          Gönderi/İşlemler
        </MenuItem>
          <MenuItem onClick={()=>{ if(menuRow){ setCancelOrderId(menuRow._id || menuRow.id); setCancelOpen(true); } setMenuAnchor(null); }} disabled={menuRow ? menuRow.status !== 'pending' : false}>
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
