import React from 'react';
import NeoDashboardLayout from '../../components/neo/NeoDashboardLayout';
import NeoTileGrid from '../../components/neo/NeoTileGrid';
import NeoTile from '../../components/neo/NeoTile';
import { useNavigate } from 'react-router-dom';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

export default function Dashboard(){
  const nav = useNavigate();
  return (
    <NeoDashboardLayout title="Merkez Paneli">
      <NeoTileGrid>
  <NeoTile title="Mağaza" active onClick={()=>nav('/products')} icon={<StorefrontOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Sepetim" onClick={()=>nav('/cart')} icon={<ShoppingCartOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Siparişlerim" onClick={()=>nav('/orders')} icon={<Inventory2OutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Teklif Taleplerim" onClick={()=>nav('/quotations')} icon={<RequestQuoteOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Bildirimler" onClick={()=>nav('/notifications')} icon={<NotificationsOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Puanlarım" onClick={()=>nav('/points')} icon={<StarBorderOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Profil" onClick={()=>nav('/profile')} icon={<PersonOutlineOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="Ayarlar" onClick={()=>nav('/settings')} icon={<SettingsOutlinedIcon fontSize="inherit" />} />
  <NeoTile title="SSS" onClick={()=>nav('/faq')} icon={<HelpOutlineOutlinedIcon fontSize="inherit" />} />
      </NeoTileGrid>
    </NeoDashboardLayout>
  );
}
