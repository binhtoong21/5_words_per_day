import axios from 'axios';
import { useAuthStore } from './store';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const user = useAuthStore.getState().user;
  if (user && user.id) {
    config.headers['x-user-id'] = user.id;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);
