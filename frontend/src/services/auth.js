import api from './api';

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const signup = (email, password) => {
  return api.post('/auth/signup', { email, password });
};

export const logout = () => {
  return api.post('/auth/logout');
};

export const getCurrentUser = () => {
  return api.get('/auth/me');
};