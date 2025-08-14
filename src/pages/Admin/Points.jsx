import React, { useEffect, useState } from 'react';
import { Container, Stack, Typography, TextField, Button, MenuItem, Paper, Divider, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Box, Autocomplete } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'react-toastify';
import api from '../../api/client';

const mockUsers = [];
const mockTransactions = [];
const mockSettings = {
  earnRate: 1, // 1 TL = 1 puan
  levels: [
    { name: 'Bronz', min: 0, bonus: 0 },
    { name: 'Gümüş', min: 100, bonus: 5 },
    { name: 'Altın', min: 250, bonus: 10 },
  ]
};

export default function AdminPoints() {
  const [userQuery, setUserQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignDialog, setAssignDialog] = useState(false);
  const [assignAmount, setAssignAmount] = useState(0);
  const [assignReason, setAssignReason] = useState('');
  const [removeDialog, setRemoveDialog] = useState(false);
  const [removeAmount, setRemoveAmount] = useState(0);
  const [removeReason, setRemoveReason] = useState('');
  const [settings, setSettings] = useState(mockSettings);
  const [dirty, setDirty] = useState(false);
  const [editLevel, setEditLevel] = useState(null);
  const [levelDialog, setLevelDialog] = useState(false);
  const [levelName, setLevelName] = useState('');
  const [levelMin, setLevelMin] = useState(0);
  const [levelBonus, setLevelBonus] = useState(0);

  const [userOptions, setUserOptions] = useState([]);
  const filteredUsers = userOptions.filter(u => (u.email||'').includes(userQuery) || (u.name||'').includes(userQuery));

  const searchUsers = async (q) => {
    try {
      const res = await api.get('/api/users', { params: { q } });
      const arr = Array.isArray(res.data) ? res.data : [];
      setUserOptions(arr.map(u => ({ id: u._id || u.id, email: u.email, name: u?.companyInfo?.companyName || u?.personalInfo?.firstName || u.email })));
    } catch { setUserOptions([]); }
  };
  const [userTx, setUserTx] = useState([]);

  const loadUserTx = async (u) => {
    if (!u) return;
    try {
      const res = await api.get(`/api/loyalty/admin/${u.id}/transactions`);
      const rows = Array.isArray(res.data) ? res.data : [];
      setUserTx(rows.map(r => ({ id: r._id || r.id, type: r.type, amount: r.amount, date: r.createdAt || r.date, reason: r.reason || r.desc })));
    } catch { setUserTx([]); }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get('/api/settings/system');
        const sys = res?.data?.systemSettings || {};
        const pts = sys.points;
        if (alive && pts) setSettings({ earnRate: Number(pts.earnRate)||1, levels: Array.isArray(pts.levels)? pts.levels : mockSettings.levels });
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  const handleSaveSettings = async () => {
    try {
      const payload = { points: { earnRate: Number(settings.earnRate)||1, levels: settings.levels || [] } };
      const res = await api.put('/api/settings/system', payload);
      const saved = res?.data?.systemSettings?.points;
      if (saved) setSettings({ earnRate: saved.earnRate, levels: saved.levels||[] });
      setDirty(false);
      toast.success('Ayarlar kaydedildi');
    } catch {
      toast.error('Ayarlar kaydedilemedi');
    }
  };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Puan Yönetimi</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <Autocomplete
            options={userOptions}
            getOptionLabel={(o)=> o?.name ? `${o.name} <${o.email}>` : o?.email || ''}
            onInputChange={(_, v) => { setUserQuery(v); if (v && v.length >= 2) searchUsers(v); }}
            onChange={(_, v) => { setSelectedUser(v || null); if (v) loadUserTx(v); }}
            renderInput={(params) => <TextField {...params} label="Üye ara (isim/email)" size="small" InputProps={{ ...params.InputProps, startAdornment: <SearchIcon fontSize="small" /> }} />}
            sx={{ minWidth: 360 }}
          />
          {selectedUser && <Typography sx={{ ml: 2 }}>Seçili: <b>{selectedUser.name || selectedUser.email}</b> ({selectedUser.email})</Typography>}
        </Stack>
        {selectedUser && (
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setAssignDialog(true)}>Puan Ekle</Button>
            <Button startIcon={<RemoveIcon />} color="error" variant="outlined" onClick={() => setRemoveDialog(true)}>Puan Sil</Button>
          </Stack>
        )}
      </Paper>
      {selectedUser && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Puan Hareketleri</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tarih</TableCell>
                <TableCell>Tip</TableCell>
                <TableCell>Miktar</TableCell>
                <TableCell>Açıklama</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
        {userTx.map(tx => (
                <TableRow key={tx.id}>
          <TableCell>{new Date(tx.date).toLocaleString('tr-TR')}</TableCell>
          <TableCell>{tx.type === 'earn' ? 'Kazanım' : tx.type === 'spend' ? 'Kullanım' : 'Düzeltme'}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
          <TableCell>{tx.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Puan Kazanım Oranı ve Seviye Ayarları</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField label="Kazanım Oranı (1 TL = ? puan)" type="number" size="small" value={settings.earnRate} onChange={e => { setSettings(s => ({ ...s, earnRate: Number(e.target.value) })); setDirty(true); }} sx={{ width: 260 }} />
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" onClick={handleSaveSettings} disabled={!dirty}>Kaydet</Button>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2">Seviye ve Bonuslar</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Seviye</TableCell>
              <TableCell>Min. Puan</TableCell>
              <TableCell>Bonus (%)</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {settings.levels.map((lvl, i) => (
              <TableRow key={lvl.name}>
                <TableCell>{lvl.name}</TableCell>
                <TableCell>{lvl.min}</TableCell>
                <TableCell>{lvl.bonus}</TableCell>
                <TableCell><IconButton size="small" onClick={() => { setEditLevel(i); setLevelName(lvl.name); setLevelMin(lvl.min); setLevelBonus(lvl.bonus); setLevelDialog(true); }}><EditIcon fontSize="small" /></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      {/* Assign Points Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)}>
        <DialogTitle>Puan Ekle</DialogTitle>
        <DialogContent>
          <TextField label="Miktar" type="number" fullWidth sx={{ my: 1 }} value={assignAmount} onChange={e => setAssignAmount(Number(e.target.value))} />
          <TextField label="Açıklama" fullWidth sx={{ my: 1 }} value={assignReason} onChange={e => setAssignReason(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Vazgeç</Button>
          <Button variant="contained" onClick={async () => {
            try {
              await api.post('/api/loyalty/admin/assign', { userId: selectedUser?.id, amount: Math.abs(Number(assignAmount)||0), reason: assignReason||'Admin ekleme' });
              toast.success('Puan eklendi');
              setAssignDialog(false);
              loadUserTx(selectedUser);
            } catch { toast.error('Puan eklenemedi'); }
          }}>Ekle</Button>
        </DialogActions>
      </Dialog>
      {/* Remove Points Dialog */}
      <Dialog open={removeDialog} onClose={() => setRemoveDialog(false)}>
        <DialogTitle>Puan Sil</DialogTitle>
        <DialogContent>
          <TextField label="Miktar" type="number" fullWidth sx={{ my: 1 }} value={removeAmount} onChange={e => setRemoveAmount(Number(e.target.value))} />
          <TextField label="Açıklama" fullWidth sx={{ my: 1 }} value={removeReason} onChange={e => setRemoveReason(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialog(false)}>Vazgeç</Button>
          <Button color="error" variant="contained" onClick={async () => {
            try {
              await api.post('/api/loyalty/admin/assign', { userId: selectedUser?.id, amount: -Math.abs(Number(removeAmount)||0), reason: removeReason||'Admin silme' });
              toast.success('Puan düşürüldü');
              setRemoveDialog(false);
              loadUserTx(selectedUser);
            } catch { toast.error('Puan düşürülemedi'); }
          }}>Sil</Button>
        </DialogActions>
      </Dialog>
      {/* Edit Level Dialog */}
      <Dialog open={levelDialog} onClose={() => setLevelDialog(false)}>
        <DialogTitle>Seviye Düzenle</DialogTitle>
        <DialogContent>
          <TextField label="Seviye Adı" fullWidth sx={{ my: 1 }} value={levelName} onChange={e => setLevelName(e.target.value)} />
          <TextField label="Min. Puan" type="number" fullWidth sx={{ my: 1 }} value={levelMin} onChange={e => setLevelMin(Number(e.target.value))} />
          <TextField label="Bonus (%)" type="number" fullWidth sx={{ my: 1 }} value={levelBonus} onChange={e => setLevelBonus(Number(e.target.value))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLevelDialog(false)}>Vazgeç</Button>
          <Button variant="contained" onClick={() => {
            setSettings(s => {
              const lvls = [...s.levels];
              lvls[editLevel] = { name: levelName, min: levelMin, bonus: levelBonus };
              return { ...s, levels: lvls };
            });
            setDirty(true);
            setLevelDialog(false);
          }}>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
