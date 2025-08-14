import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
  Outlet,
  useLocation
} from 'react-router-dom';
import { useAuthGuard } from './hooks/useAuthGuard.js';
import Home from './pages/Public/Home.jsx';
import FAQ from './pages/Public/FAQ.jsx';
import Why from './pages/Public/Why.jsx';
import Contact from './pages/Public/Contact.jsx';
import Manual from './pages/Public/Manual.jsx';
import Maintenance from './pages/Public/Maintenance.jsx';
import Login from './pages/Auth/Login.jsx';
import RegisterStep1 from './pages/Auth/RegisterStep1.jsx';
import RegisterStep2 from './pages/Auth/RegisterStep2.jsx';
import PendingApproval from './pages/Auth/PendingApproval.jsx';
import ForgotPassword from './pages/Auth/ForgotPassword.jsx';
import ResetPassword from './pages/Auth/ResetPassword.jsx';
// Center
import CenterDashboard from './pages/CenterPanel/Dashboard.jsx';
import Products from './pages/CenterPanel/Products.jsx';
import ProductDetail from './pages/CenterPanel/ProductDetail.jsx';
import Cart from './pages/CenterPanel/Cart.jsx';
import Checkout from './pages/CenterPanel/Checkout.jsx';
import Orders from './pages/CenterPanel/Orders.jsx';
import OrderDetail from './pages/CenterPanel/OrderDetail.jsx';
import Quotations from './pages/CenterPanel/Quotations.jsx';
import QuotationForm from './pages/CenterPanel/QuotationForm.jsx';
import QuotationDetail from './pages/CenterPanel/QuotationDetail.jsx';
import Profile from './pages/CenterPanel/Profile.jsx';
import Settings from './pages/CenterPanel/Settings.jsx';
import Points from './pages/CenterPanel/Points.jsx';
// Supplier
import SupplierDashboard from './pages/SupplierPanel/Dashboard.jsx';
import ProductsCRUD from './pages/SupplierPanel/ProductsCRUD.jsx';
import OffersInbox from './pages/SupplierPanel/OffersInbox.jsx';
import SupplierOrders from './pages/SupplierPanel/Orders.jsx';
import SupplierReports from './pages/SupplierPanel/Reports.jsx';
// Admin
import AdminDashboard from './pages/Admin/Dashboard.jsx';
import Applications from './pages/Admin/Applications.jsx';
import Users from './pages/Admin/Users.jsx';
import AdminOrders from './pages/Admin/Orders.jsx';
import AdminOrdersV2 from './pages/Admin/OrdersV2.jsx';
import AdminOrderDetail from './pages/Admin/OrderDetail.jsx';
import Reports from './pages/Admin/Reports.jsx';
import NotificationsSend from './pages/Admin/NotificationsSend.jsx';
import AdminProducts from './pages/Admin/Products.jsx';
import AdminSettings from './pages/Admin/Settings.jsx';
import AdminApprovals from './pages/Admin/Approvals.jsx';
import AdminProductDetail from './pages/Admin/ProductDetail.jsx';
import AdminQuotationDetail from './pages/Admin/QuotationDetail.jsx';
import AdminQuotations from './pages/Admin/Quotations.jsx';
// Removed Defects screen
import AdminPoints from './pages/Admin/Points.jsx';
import NotificationsPage from './pages/Notifications/NotificationsPage.jsx';
import KeypadDemo from './pages/Playground/KeypadDemo.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import ProtectedLayout from './components/layout/ProtectedLayout.jsx';

// Global guard to redirect unapproved users
function AppGuard() {
  const { user, isApproved } = useAuthGuard();
  const location = useLocation();
  const [maintenance, setMaintenance] = React.useState(false);
  React.useEffect(() => {
    // Fetch public system info to decide maintenance mode
    fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/public/system')
      .then(r => r.json()).then(d => setMaintenance(Boolean(d?.maintenanceMode))).catch(()=>{});
  }, []);
  useEffect(() => {
    // Hard redirect unauthenticated users who try to access protected root paths directly
    const protectedRoots = ['/admin', '/center', '/supplier'];
    if (!user && protectedRoots.some(p => location.pathname.startsWith(p))) {
      window.location.replace('/login');
      return;
    }

    if (user && !isApproved && !location.pathname.startsWith('/pending-approval')) {
      window.location.replace('/pending-approval');
    }
    // If maintenance active: allow only admin, login, contact, maintenance page
    const allowed = ['/login','/contact','/maintenance'];
    if (maintenance) {
      const isAdmin = user?.role === 'admin';
      const ok = isAdmin || allowed.some(p => location.pathname.startsWith(p));
      if (!ok) window.location.replace('/maintenance');
    }
  }, [user, isApproved, location.pathname]);
  return <Outlet />;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppGuard />}> {/* Wrap everything to preserve previous guard logic */}
      {/* Public */}
      <Route path="/" element={<Home />} />
  <Route path="/labs/keypad" element={<KeypadDemo />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/why" element={<Why />} />
      <Route path="/contact" element={<Contact />} />
  <Route path="/maintenance" element={<Maintenance />} />
  <Route path="/manual" element={<Manual />} />
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register/step1" element={<RegisterStep1 />} />
      <Route path="/register/step2" element={<RegisterStep2 />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password/:token" element={<ResetPassword />} />
      {/* Center */}
      <Route element={<ProtectedRoute roles={["center", "admin"]} />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/center" element={<CenterDashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/quotations/new" element={<QuotationForm />} />
          <Route path="/quotations/:id" element={<QuotationDetail />} />
          <Route path="/points" element={<Points />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      {/* Supplier */}
      <Route element={<ProtectedRoute roles={["supplier", "admin"]} />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/supplier" element={<SupplierDashboard />} />
          <Route path="/products-crud" element={<ProductsCRUD />} />
          <Route path="/offers-inbox" element={<OffersInbox />} />
          <Route path="/supplier/orders" element={<SupplierOrders />} />
          <Route path="/supplier/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/supplier/reports" element={<SupplierReports />} />
        </Route>
      </Route>
      {/* Common profile for all roles */}
      <Route element={<ProtectedRoute roles={["center", "supplier", "admin"]} />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      {/* Admin */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/quotations" element={<AdminQuotations />} />
          <Route path="/admin/quotations/:id" element={<AdminQuotationDetail />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/:id" element={<AdminProductDetail />} />
          {/* Defects screen removed */}
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/points" element={<AdminPoints />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/users" element={<Users />} />
          <Route path="/admin/orders" element={<AdminOrdersV2 />} />
          <Route path="/admin/orders-v2" element={<AdminOrdersV2 />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications/send" element={<NotificationsSend />} />
        </Route>
      </Route>
      {/* Notifications */}
      <Route element={<ProtectedRoute roles={["center", "supplier", "admin"]} />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

export default router;
