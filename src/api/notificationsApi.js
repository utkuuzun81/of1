import api from './client';

export const listNotifications = () => api.get('/api/notifications');
export const markRead = (id) => api.put(`/api/notifications/${id}/read`);
export const sendNotification = (payload) => api.post('/api/notifications/send', payload);
export const markAllRead = () => api.put('/api/notifications/mark-all/read');
export const deleteNotification = (id) => api.delete(`/api/notifications/${id}`);
