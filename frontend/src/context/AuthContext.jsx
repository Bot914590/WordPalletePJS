import React, { createContext, useContext, useState, useEffect } from 'react';
import gameService from '../services/gameService';

const API_URL = "http://localhost:5000/api";  // Базовый URL бэкенда

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // данные для управления данными игр
  const [userGames, setUserGames] = useState([]);


  useEffect(() => {
    // Проверяем, есть ли сохраненный токен
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
        loadUserData();
      } catch (error) {
        console.error("Ошибка при чтении пользователя:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const loadUserData = async () => {
    try {
      const games = await gameService.getUserGames();
      setUserGames(games.games || []);
    } catch (error) {
      console.error("Ошибка при загрузке данных пользователя:", error);
      setUserGames([]);
    } finally {
      setLoading(false);
    }
  };

//-----------------------------------------------------
// Регистрация
//-----------------------------------------------------
  const signup = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          username: email.split('@')[0]  // Автоматически создаем username из email
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка регистрации');
      }
      
      const data = await response.json();
      
      // Сохраняем данные пользователя
      setCurrentUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw error;
    }
  };

//-----------------------------------------------------
// Вход
//-----------------------------------------------------
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Неверный email или пароль');
      }
      
      const data = await response.json();
      
      // Сохраняем данные пользователя
      setCurrentUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw error;
    }
  };

//-----------------------------------------------------
// Выход
//-----------------------------------------------------
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    currentUser,
    userGames,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

