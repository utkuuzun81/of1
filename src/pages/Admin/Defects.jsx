import React from 'react';
import { Box, Stack, Typography, Button, IconButton, Chip, TextField, MenuItem, Divider } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { listDefects, createDefect, updateDefect, updateDefectStatus, softDeleteDefect } from '../../api/defectsApi';
import { toast } from 'react-toastify';

const statusMap = {
  reported: { label: 'Bildirildi', color: 'default' },
  inspecting: { label: 'İncelemede', color: 'warning' },
  approved: { label: 'Onaylandı', color: 'info' },
  repaired: { label: 'Onarıldı', color: 'success' },
  scrapped: { label: 'İmha', color: 'default' },
  returned_supplier: { label: 'Tedarikçiye iade', color: 'secondary' },
  refunded: { label: 'İade edildi', color: 'success' },
  closed: { label: 'Kapandı', color: 'default' }
};

const priorityMap = {
  low: 'Düşük',
  normal: 'Normal',
  high: 'Yüksek',
  urgent: 'Acil'
};

export default function AdminDefects() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [priority, setPriority] = React.useState('');

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await listDefects({ q, status, priority });
      const out = Array.isArray(data) ? data : data.items || [];
      setRows(out.map((d, i) => ({ id: d.id, ...d, _idx: i+1 })));
    } catch (e) {
      toast.error('Kayıtlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [q, status, priority]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { field: '_idx', headerName: '#', width: 60 },
    { field: 'createdAt', headerName: 'Tarih', width: 120, valueGetter: p => dayjs(p.row.createdAt).format('DD.MM.YYYY') },
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'productName', headerName: 'Ürün', flex: 1, minWidth: 180 },
    { field: 'orderNumber', headerName: 'Sipariş', width: 120 },
    { field: 'reason', headerName: 'Sebep', flex: 1, minWidth: 180 },
    { field: 'priority', headerName: 'Öncelik', width: 110, renderCell: p => <Chip size="small" label={priorityMap[p.value] || p.value} /> },
    { field: 'status', headerName: 'Durum', width: 150, renderCell: p => {
      const s = statusMap[p.value] || { label: p.value, color: 'default' };
      return <Chip size="small" color={s.color} label={s.label} />;
    }},
    {
      field: 'actions', headerName: 'İşlemler', width: 140, sortable: false, renderCell: (p) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => quickAdvance(p.row)} title="İlerle">
            <AssignmentTurnedInIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => editRow(p.row)} title="Düzenle">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => removeRow(p.row)} title="Sil">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      )
    }
  ];

  const quickAdvance = async (row) => {
    // simple status flow: reported -> inspecting -> approved -> repaired -> closed
    const flow = ['reported','inspecting','approved','repaired','closed'];
    const idx = flow.indexOf(row.status);
    const next = flow[Math.min(flow.length-1, idx+1)] || 'closed';
    try {
      await updateDefectStatus(row.id, next);
      toast.success('Durum güncellendi');
      fetchData();
    } catch { toast.error('Durum güncellenemedi'); }
  };

  const editRow = async (row) => {
    const reason = window.prompt('Sebep', row.reason || '') || '';
    const description = window.prompt('Açıklama', row.description || '') || '';
    const priority = window.prompt('Öncelik (low/normal/high/urgent)', row.priority || 'normal') || 'normal';
    try {
      await updateDefect(row.id, { reason, description, priority });
      toast.success('Güncellendi');
      fetchData();
    } catch { toast.error('Güncellenemedi'); }
  };

  const removeRow = async (row) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await softDeleteDefect(row.id);
      toast.success('Silindi');
      fetchData();
    } catch { toast.error('Silinemedi'); }
  };

  const createQuick = async () => {
    const sku = window.prompt('SKU') || '';
    const productName = window.prompt('Ürün adı') || '';
    const orderNumber = window.prompt('Sipariş No (opsiyonel)') || '';
    const reason = window.prompt('Sebep') || '';
    const description = window.prompt('Açıklama (opsiyonel)') || '';
    const priority = window.prompt('Öncelik (low/normal/high/urgent)', 'normal') || 'normal';
    try {
      await createDefect({ sku, productName, orderNumber, reason, description, priority });
      toast.success('Kayıt oluşturuldu');
      fetchData();
    } catch { toast.error('Oluşturulamadı'); }
  };

  return (
    <Stack spacing={1} sx={{ height: '100%', p: 1 }}>
      <Typography variant="h6">Sakat Yönetimi</Typography>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="Ara" value={q} onChange={e=>setQ(e.target.value)} InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }} />
        <TextField size="small" select label="Durum" value={status} onChange={e=>setStatus(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="">Tümü</MenuItem>
          {Object.entries(statusMap).map(([k,v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Öncelik" value={priority} onChange={e=>setPriority(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">Tümü</MenuItem>
          {Object.entries(priorityMap).map(([k,v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
        </TextField>
        <IconButton onClick={fetchData} title="Yenile"><RefreshIcon /></IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={createQuick}>Yeni Kayıt</Button>
      </Stack>
      <Divider />
      <Box sx={{ flex: 1, minHeight: 300 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} density="compact" disableRowSelectionOnClick autoPageSize />
      </Box>
    </Stack>
  );
}
