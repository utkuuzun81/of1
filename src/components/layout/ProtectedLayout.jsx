import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import NeoDashboardLayout from '../neo/NeoDashboardLayout';

export default function ProtectedLayout() {
  const location = useLocation();
  const path = location.pathname;
  // For Neo dashboards, render children without classic Sidebar/Topbar to avoid duplication
  if (path === '/center' || path === '/supplier' || path === '/admin') {
    return <Outlet />;
  }

  // Use the Neo shell for all other protected pages for visual consistency
  return (
    <NeoDashboardLayout title="">
      <Outlet />
    </NeoDashboardLayout>
  );
}
