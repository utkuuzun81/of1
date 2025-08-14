import api from './client';
import fileDownload from 'js-file-download';

export const createOrder = (payload) => api.post('/api/orders', payload);
// Role-aware listing: default to center list; caller can pass role override
export const listOrders = (role) => {
  const r = role || JSON.parse(localStorage.getItem('user')||'{}')?.role;
  if (r === 'admin') return api.get('/api/orders/admin');
  if (r === 'supplier') return api.get('/api/orders/supplier');
  return api.get('/api/orders/center');
};
export const getOrder = (id) => api.get(`/api/orders/${id}`);
export const cancelOrder = (id) => api.put(`/api/orders/${id}/status`, { status: 'cancelled' });
export const updateStatus = (id, status) => api.put(`/api/orders/${id}/status`, { status });
export const updateShipping = (id, payload) => api.put(`/api/orders/${id}/shipping`, payload);
export const downloadInvoice = async (id) => {
  const res = await api.get(`/api/orders/${id}/invoice`, { responseType: 'blob' });
  fileDownload(res.data, `invoice-${id}.pdf`);
};
