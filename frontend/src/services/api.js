// src/services/api.js
import axios from 'axios';

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // URL твоего Flask бэкенда
  timeout: 10000, // Таймаут 10 секунд
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для автоматического добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек или невалиден
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Перенаправляем на логин
    }
    return Promise.reject(error);
  }
);

export default api;