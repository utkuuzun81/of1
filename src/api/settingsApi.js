import api from './client';

export const getUserSettings = () => api.get('/api/settings/user');
export const updateUserSettings = (payload) => api.put('/api/settings/user', payload);
