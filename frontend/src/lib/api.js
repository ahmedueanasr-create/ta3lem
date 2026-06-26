import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({ baseURL: BASE, withCredentials: false });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !refreshing) {
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) return Promise.reject(error);
      original._retry = true;
      refreshing = true;
      try {
        const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken: refresh });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch (e) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
