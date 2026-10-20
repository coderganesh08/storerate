import api from './api.js';

export const getStats = () => api.get('/admin/stats').then((res) => res.data);
export const getUsers = (params) => api.get('/users', { params }).then((res) => res.data);
export const createUser = (user) => api.post('/users', user).then((res) => res.data.user);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getOwners = () => api.get('/users', { params: { role: 'STORE_OWNER', pageSize: 100 } }).then((res) => res.data.users);
export const getStores = (params) => api.get('/stores', { params }).then((res) => res.data);
export const createStore = (store) => api.post('/stores', store).then((res) => res.data.store);
export const deleteStore = (id) => api.delete(`/stores/${id}`);
