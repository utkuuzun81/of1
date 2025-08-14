import React from 'react';
import Orders from '../CenterPanel/Orders.jsx';

export default function SupplierOrders(){
  // Reuse Orders with role-aware API (ordersApi.listOrders handles supplier route)
  return <Orders />;
}
