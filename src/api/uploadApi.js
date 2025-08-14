import api from './client';

export const uploadImage = (file) => {
  const form = new FormData();
  form.append('image', file);
  return api.post('/api/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const uploadImageLocal = (file) => {
  const form = new FormData();
  form.append('image', file);
  return api.post('/api/upload/image/local', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
