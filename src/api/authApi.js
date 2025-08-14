import api from './client';

export const login = (data) => api.post('/api/auth/login', data);
export const register = (data) => api.post('/api/auth/register', data, {
  headers: { 'Content-Type': 'application/json' }
});
export const me = () => api.get('/api/auth/me');
export const updateProfile = (data) => api.put('/api/auth/profile', data);
export const adminApproveCompanyInfo = (userId, action) => api.post(`/api/admin/users/${userId}/company-info/approve`, { action });
export const logout = () => api.post('/api/auth/logout');
export const refreshToken = (refreshToken) => api.post('/api/auth/refresh-token', { refreshToken });
export const forgotPassword = (email) => api.post('/api/auth/forgot-password', { email });
export const resetPassword = (payload) => api.post('/api/auth/reset-password', payload);
