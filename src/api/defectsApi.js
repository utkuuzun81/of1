import api from './client';

export const listDefects = (params={}) => api.get('/api/defects', { params });
export const getDefect = (id) => api.get(`/api/defects/${id}`);
export const createDefect = (payload) => api.post('/api/defects', payload);
export const updateDefect = (id, payload) => api.put(`/api/defects/${id}`, payload);
export const updateDefectStatus = (id, status) => api.put(`/api/defects/${id}/status`, { status });
export const softDeleteDefect = (id) => api.delete(`/api/defects/${id}`);
