// // frontend/src/utils/axiosInstance.js
// import axios from 'axios';

// const instance = axios.create({
//   baseURL: 'http://localhost:5000/api',
// });

// // Добавляем interceptor на ответы
// instance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
//     if (
//       error.response &&
//       (error.response.status === 401 || error.response.status === 403) &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;
//       try {
//         // Пытаемся обновить accessToken
//         const refreshToken = localStorage.getItem('refreshToken');
//         if (!refreshToken) {
//           // Нет refreshToken – значит всё, logout
//           throw new Error('No refresh token');
//         }
//         // Запрос на /auth/token
//         const refreshRes = await axios.post('http://localhost:5000/api/auth/token', {
//           refreshToken,
//         });
//         const newAccessToken = refreshRes.data.accessToken;
//         localStorage.setItem('accessToken', newAccessToken);

//         // Попробуем повторить запрос
//         originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
//         return instance(originalRequest);
//       } catch (err) {
//         // Не удалось рефрешить → logout
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//         window.location.href = '/login'; 
//         return Promise.reject(error);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default instance;
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Интерцептор для запросов — автоматически добавляем токен, если он есть
instance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = 'Bearer ' + accessToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для ответов — обработка ошибок, связанных с истечением токена
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // Пытаемся обновить accessToken
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        const refreshRes = await axios.post('http://localhost:5000/api/auth/token', {
          refreshToken,
        });
        const newAccessToken = refreshRes.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return instance(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; 
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
