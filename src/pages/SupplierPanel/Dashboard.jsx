import React from 'react';
import NeoDashboardLayout from '../../components/neo/NeoDashboardLayout';
import NeoTileGrid from '../../components/neo/NeoTileGrid';
import NeoTile from '../../components/neo/NeoTile';
import { useNavigate } from 'react-router-dom';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

export default function SupplierDashboard(){
  const nav = useNavigate();
  return (
    <NeoDashboardLayout title="Tedarikçi Paneli">
      <NeoTileGrid>
  <NeoTile title="Ürün Yönetimi" active onClick={()=>nav('/products-crud')} icon={<Inventory2OutlinedIcon fontSize="inherit" />} cols={2} />
  <NeoTile title="Teklif Yanıtları" onClick={()=>nav('/offers-inbox')} icon={<MarkEmailUnreadOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Siparişler" onClick={()=>nav('/supplier/orders')} icon={<LocalShippingOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Raporlar" onClick={()=>nav('/supplier/reports')} icon={<AssessmentOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Ayarlar" onClick={()=>nav('/settings')} icon={<SettingsOutlinedIcon fontSize="inherit" />} />
      </NeoTileGrid>
    </NeoDashboardLayout>
  );
}
