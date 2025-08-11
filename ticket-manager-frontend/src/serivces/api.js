// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});





api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const { data } = await axios.post(
            import.meta.env.VITE_REFRESH_URL,
            { refresh }
          );

          localStorage.setItem('access', data.access);
          api.defaults.headers.Authorization = `Bearer ${data.access}`;
          originalRequest.headers.Authorization = `Bearer ${data.access}`;

          return api(originalRequest); // retry original request
        } catch (refreshErr) {
          console.error('Refresh token failed', refreshErr);
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

export default api;