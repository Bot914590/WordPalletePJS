import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function MainLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="logo">
            WordPallete
          </Link>
          
          <nav className="main-nav">
            {currentUser ? (
              <>
                <Link to="/" className="nav-link">Главная</Link>
                <Link to="/my-activities" className="nav-link">Мои активности</Link> {/* Новая кнопка */}
                <button onClick={handleLogout} className="nav-link logout-btn">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Вход</Link>
                <Link to="/register" className="nav-link register-btn">
                  Регистрация
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="main-content">
        {children}
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} WordPallete - Генератор креативных идей</p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;