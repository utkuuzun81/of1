import api from './client';

export const listPendingUsers = () => api.get('/api/users/pending');
export const listUsers = (params) => api.get('/api/users', { params });
export const assignRole = (id, role) => api.put(`/api/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/api/users/${id}`);
export const approveCompanyInfo = (id) => api.post(`/api/admin/users/${id}/company-info/approve`, { action: 'approve' });
export const rejectCompanyInfo = (id) => api.post(`/api/admin/users/${id}/company-info/approve`, { action: 'reject' });
