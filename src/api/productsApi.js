import api from './client';

export const listProducts = (params={}) => api.get('/api/products', { params });
export const getProduct = (id) => api.get(`/api/products/${id}`);
export const searchProducts = (q) => api.get('/api/products/search', { params: { q } });
export const listCategories = () => api.get('/api/products/categories');
export const listBrands = () => api.get('/api/products/brands');
export const listSupplierProducts = (supplierId) => api.get(`/api/products/supplier/${supplierId}`);
// Supplier/Admin
export const createProduct = (payload) => api.post('/api/products', payload);
export const updateProduct = (id, payload) => api.put(`/api/products/${id}`, payload);
export const softDeleteProduct = (id) => api.delete(`/api/products/${id}`);
export const updateProductStatus = (id, status) => api.put(`/api/products/${id}/status`, { status });
export const uploadProductImage = (id, file, { alt = '', isPrimary = false } = {}) => {
	const fd = new FormData();
	fd.append('file', file);
	fd.append('alt', alt);
	fd.append('isPrimary', String(isPrimary));
	return api.post(`/api/products/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteProductImage = (id, imageId) => api.delete(`/api/products/${id}/images/${imageId}`);
export const setPrimaryProductImage = (id, imageId) => api.put(`/api/products/${id}/images/${imageId}/primary`);
