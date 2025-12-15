import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import LoginForm from '../components/auth/LoginForm';

function Login() {
  const [error, setError] = useState('');
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (email, password) => {
    try {
      setError('');
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Неверный email или пароль');
    }
  };

  return (
    <MainLayout>
      <div className="auth-container">
        <h1>Вход в систему</h1>
        {error && <div className="error-message">{error}</div>}
        <LoginForm onSubmit={handleSubmit} />
        <div className="auth-footer">
          <p>Нет аккаунта? <a href="/register">Зарегистрироваться</a></p>
        </div>
      </div>
    </MainLayout>
  );
}

export default Login;