import React from 'react';
import NeoDashboardLayout from '../../components/neo/NeoDashboardLayout';
import NeoTileGrid from '../../components/neo/NeoTileGrid';
import NeoTile from '../../components/neo/NeoTile';
import { useNavigate } from 'react-router-dom';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import StarsOutlinedIcon from '@mui/icons-material/StarsOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';

export default function AdminDashboard(){
  const nav = useNavigate();
  return (
    <NeoDashboardLayout title="Yönetim Paneli">
      <NeoTileGrid>
  <NeoTile title="Teklifler" onClick={()=>nav('/admin/quotations')} icon={<RequestQuoteOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Onay Merkezi" active onClick={()=>nav('/admin/approvals')} icon={<ChecklistOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Başvurular" active onClick={()=>nav('/applications')} icon={<AssignmentOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Kullanıcılar" onClick={()=>nav('/users')} icon={<GroupOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Ürünler" onClick={()=>nav('/admin/products')} icon={<CategoryOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Puan Yönetimi" onClick={()=>nav('/admin/points')} icon={<StarsOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Siparişler" onClick={()=>nav('/admin/orders')} icon={<Inventory2OutlinedIcon fontSize="inherit" />} cols={2} />
  <NeoTile title="Raporlar" onClick={()=>nav('/reports')} icon={<InsightsOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Bildirim Gönder" onClick={()=>nav('/notifications/send')} icon={<CampaignOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Ayarlar" onClick={()=>nav('/admin/settings')} icon={<SettingsOutlinedIcon fontSize="inherit" />} />
      </NeoTileGrid>
    </NeoDashboardLayout>
  );
}
