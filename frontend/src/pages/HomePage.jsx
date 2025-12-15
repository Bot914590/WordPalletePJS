import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import './HomePage.css'; // Оставляем CSS для, возможно, других стилей HomePage

function HomePage() {
  return (
    <MainLayout>
      <div className="homepage-welcome-section card">
        <h1>Добро пожаловать в WordPallete!</h1>
        <p>Создавайте увлекательные интерактивные игры для обучения и развлечения.</p>
        <p>Начните с создания своей первой игры в разделе <a href="/my-activities">Мои активности</a>!</p>
      </div>
    </MainLayout>
  );
}

export default HomePage;