import api from './api.js';

export const signup = (details) => api.post('/auth/register', details, { skipAuthRedirect: true }).then((res) => res.data);
export const login = (credentials) => api.post('/auth/login', credentials, { skipAuthRedirect: true }).then((res) => res.data);
export const getCurrentUser = () => api.get('/auth/me').then((res) => res.data.user);
export const changePassword = (passwords) => api.patch('/auth/password', passwords).then((res) => res.data);
