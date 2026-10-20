import axios from 'axios';

export const TOKEN_KEY = 'token';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && !error.config?.skipAuthRedirect && localStorage.getItem(TOKEN_KEY)) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.assign('/login');
  }
  return Promise.reject(error);
});

export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) return 'Cannot reach the server. Check that the local API is running and try again.';
  return error?.message || 'Something went wrong. Please try again.';
}

export function getFieldErrors(error) {
  return error.response?.data?.errors || {};
}

export default api;

