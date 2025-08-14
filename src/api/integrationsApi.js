import api from './client';

// Ödeme (mock)
export const paymentInit = (payload) => api.post('/api/integrations/payment/init', payload);
export const paymentVerify = (payload) => api.post('/api/integrations/payment/verify', payload);
// Kargo (mock)
export const createShipment = (payload) => api.post('/api/integrations/cargo/create', payload);
export const trackShipment = (trackingNumber) => api.get(`/api/integrations/cargo/track/${trackingNumber}`);
// Fatura (mock)
export const generateInvoiceXml = (payload) => api.post('/api/integrations/invoice/generate', payload);
