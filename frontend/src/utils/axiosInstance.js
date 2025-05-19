// frontend/src/utils/axiosInstance.js
import axios from 'axios';

// Создаём общий инстанс с базовым URL
const api = axios.create({
  // baseURL: '/api', СЕРВЕР!!!
  baseURL: 'http://localhost:5000/api',

});

// ⬆️ В каждый запрос подставляем access‑токен, если он есть
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// ⬇️ Ответы: авто‑refresh токена, но игнорируем сам /auth/login
api.interceptors.response.use(
  res => res,
  async err => {
    const orig   = err.config;
    const status = err.response?.status;

    // 👉 Не трогаем ошибки самого логина, чтобы не стирать email
    const isAuthLogin = orig?.url?.includes('/auth/login');

    if ((status === 401 || status === 403) && !orig._retry && !isAuthLogin) {
      orig._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // нет refresh → выходим в логин
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }

      try {
        // Запрашиваем новый access
        const { data } = await api.post('/auth/token', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);

        // подставляем в оригинальный запрос и повторяем
        orig.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(orig);
      } catch {
        // refresh тоже не прокатил → полный logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    // Все остальные ошибки прокидываем как есть
    return Promise.reject(err);
  }
);

export default api;
