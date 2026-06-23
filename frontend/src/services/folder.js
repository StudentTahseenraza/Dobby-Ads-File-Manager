import api from './api';

export const getFolders = () => {
  return api.get('/folders');
};

export const getFolderChildren = (folderId) => {
  return api.get(`/folders/${folderId}/children`);
};

export const getFolderDetails = (folderId) => {
  return api.get(`/folders/${folderId}`);
};

export const createFolder = (data) => {
  return api.post('/folders', data);
};

export const deleteFolder = (folderId) => {
  return api.delete(`/folders/${folderId}`);
};