import api from './client';

export const getLoyaltySummary = () => api.get('/api/loyalty/summary');
export const getLoyaltyTransactions = () => api.get('/api/loyalty/transactions');
