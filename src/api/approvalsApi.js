import api from './client';

export const listApprovals = () => api.get('/api/admin/approvals');
export const actOnApproval = (type, id, action, note = '') => api.post(`/api/admin/approvals/${type}/${id}`, { action, note });

export default { listApprovals, actOnApproval };
