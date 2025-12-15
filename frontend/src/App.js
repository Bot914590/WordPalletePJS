import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import MyActivitiesPage from './pages/MyActivitiesPage'; // Импортируем новую страницу
import GamePlayPage from './pages/GamePlayPage'; // Импортируем новую страницу игры
import './App.css'; 

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={ 
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route 
            path="/my-activities" 
            element={
              <ProtectedRoute>
                <MyActivitiesPage /> {/* Новый маршрут */}
              </ProtectedRoute>
            }
          />
          <Route 
            path="/play/:gameId" 
            element={
              <ProtectedRoute>
                <GamePlayPage /> {/* Новый маршрут для страницы игры */}
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
