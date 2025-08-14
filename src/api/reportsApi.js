import api from './client';

// Export orders with optional filters: from, to, status. format: csv|excel|pdf|json
export const exportOrders = ({ format = 'csv', from, to, status } = {}) => {
	const params = { format };
	if (from) params.from = from;
	if (to) params.to = to;
	if (status && status !== 'all') params.status = status;
	// Use blob for file downloads
	const responseType = format === 'json' ? 'json' : 'blob';
	return api.get('/api/reports/orders', { params, responseType });
};

// Get aggregated order summary with optional filters
export const getOrderSummary = ({ from, to, status } = {}) => {
	const params = {};
	if (from) params.from = from;
	if (to) params.to = to;
	if (status && status !== 'all') params.status = status;
	return api.get('/api/reports/orders/summary', { params });
};

// Export loyalty transactions (admin only) with optional filters
export const exportLoyalty = ({ format = 'csv', from, to, userId } = {}) => {
	const params = { format };
	if (from) params.from = from;
	if (to) params.to = to;
	if (userId) params.userId = userId;
	const responseType = format === 'json' ? 'json' : 'blob';
	return api.get('/api/reports/loyalty', { params, responseType });
};
