import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import GameConstructor from '../components/gameEngine/GameConstructor';
import GamesPreview from '../components/gameEngine/GamesPreview';
import './MyActivitiesPage.css';

function MyActivitiesPage() {
  const [viewMode, setViewMode] = useState('games'); // 'games' or 'constructor'

  return (
    <MainLayout>
      <div className="my-activities-container">
        <div className="view-switcher">
          <button 
            className={viewMode === 'games' ? 'btn btn-primary active' : 'btn btn-outline'}
            onClick={() => setViewMode('games')}
          >
            Мои игры
          </button>
          <button 
            className={viewMode === 'constructor' ? 'btn btn-primary active' : 'btn btn-outline'}
            onClick={() => setViewMode('constructor')}
          >
            Конструктор игр
          </button>
        </div>

        <div className="page-section">
          {viewMode === 'games' ? <GamesPreview /> : <GameConstructor />}
        </div>
      </div>
    </MainLayout>
  );
}

export default MyActivitiesPage;