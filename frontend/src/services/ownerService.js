import api from './api.js';

export const getSummary = () => api.get('/owner').then((res) => res.data);
export const getRatings = (params) => api.get('/owner/ratings', { params }).then((res) => res.data);
