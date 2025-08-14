import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthGuard } from '../../hooks/useAuthGuard';

export default function ProtectedRoute({ roles = [] }) {
  const { user, role, isApproved } = useAuthGuard();

  if (!user) return <Navigate to="/login" replace />;
  if (!isApproved) return <Navigate to="/pending-approval" replace />;
  if (roles.length && !roles.includes(role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
