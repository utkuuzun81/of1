import api from './client';

export const listQuotations = (role) => {
	const r = role || JSON.parse(localStorage.getItem('user')||'{}')?.role;
	if (r === 'supplier') return api.get('/api/quotations/supplier');
	if (r === 'admin') return api.get('/api/quotations/admin');
	return api.get('/api/quotations/center');
};
export const createQuotation = (payload) => api.post('/api/quotations', payload);
export const respondQuotation = (id, payload) => api.put(`/api/quotations/${id}/respond`, payload);
export const getQuotation = (id) => api.get(`/api/quotations/${id}`);
export const acceptQuotation = (id) => api.put(`/api/quotations/${id}/accept`);
export const rejectQuotation = (id) => api.put(`/api/quotations/${id}/reject`);
