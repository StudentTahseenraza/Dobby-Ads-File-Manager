// services/image.js
import api from './api';

export const uploadImage = (formData) => {
  return api.post('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getImagesByFolder = (folderId) => {
  return api.get(`/images/${folderId}`);
};

export const deleteImage = (imageId) => {
  return api.delete(`/images/${imageId}`);
};

export const getAllImages = () => {
  return api.get('/images');
};