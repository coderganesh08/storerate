import api from './api.js';

export const getStores = (params) => api.get('/stores', { params }).then((res) => res.data);
export const getStore = (storeId, params) => api.get(`/stores/${storeId}`, { params }).then((res) => res.data);
export const rateStore = (storeId, score, review) => api.post(`/stores/${storeId}/ratings`, { score, review }).then((res) => res.data);
