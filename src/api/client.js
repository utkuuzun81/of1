import axios from 'axios';

// Base URL: when VITE_API_BASE_URL is given (e.g. http://localhost:5000), we keep endpoints like '/api/...'
// When it's not set, use same-origin '' so '/api/...' works with Vite proxy without duplicating '/api'.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || ''
});

// JWT ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 yönetimi
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!location.pathname.startsWith('/login')) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
