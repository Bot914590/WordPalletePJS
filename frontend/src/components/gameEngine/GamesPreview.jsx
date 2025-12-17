import { useEffect, useState } from 'react';
import { data, useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import { useAuth } from '../../context/AuthContext';
import gameService from "../../services/gameService";
// import WheelGamePreview from '../../img/WheelGamePreview.jpg'; // Убираем импорт изображения
import './GamesPreview.css';

function GamesPreview() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { currentUser } = useAuth();
    const navigate = useNavigate(); // Инициализируем useNavigate
    
    const loadGames = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await gameService.getUserGames();
            setGames(data.games || []);
        } catch (err) {
            setError('Не удалось загрузить игры');
            console.error('Ошибка загрузки:', err);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        loadGames();
    }, []);
    
    const refreshGames = () => {
        loadGames();
    };
    
    const getGameIcon = (gameType) => {
        switch (gameType) {
            case 'wheel': return '🎡';
            case 'quiz': return '❓';
            case 'match': return '🔗';
            default: return '🎮';
        }
    };
    
    const handlePlayGame = (gameId) => {
        navigate(`/play/${gameId}`); // Переход на страницу игры
    };

    // ---------------------------------------------
    // Функция удаления игры
    // ----------------------------------------------
    const deleteGame = (gameId) => {
        gameService.deleteGame(gameId)
            .then(() => {
                loadGames();
            })
            .catch(error => {
                console.error('Ошибка при удалении игры:', error);
            });
    };
    
    if (loading) {
        return (
            <div className="games-section-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Загрузка ваших игр...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="games-section-container">
                <div className="error-state">
                    <h2>Ошибка загрузки!</h2>
                    <p>{error}</p>
                    <button onClick={refreshGames} className="btn btn-primary">
                        Повторить
                    </button>
                </div>
            </div>
        );
    }
    
    if (games.length === 0) {
        return (
            <div className="games-section-container">
                <div className="empty-state">
                    <h2>У вас пока нет игр</h2>
                    <p>Начните создавать уникальные учебные игры!</p>
                    <button onClick={refreshGames} className="btn btn-secondary">
                        Обновить
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="games-section-container">
            <div className="games-header">
                <h1>Мои игры</h1>
                <button onClick={refreshGames} className="btn btn-secondary">
                    Обновить
                </button>
            </div>
            
            <div className="games-grid">
                {games.map(game => (
                    <div key={game.id} className="game-card no-image">
                        <div className="game-card-top">
                            <div className="game-icon-wrapper">{getGameIcon(game.game_type)}</div>
                            <div className="game-meta-info">
                                <h3 className="game-title">{game.game_name}</h3>
                                <span className="game-type-badge">{game.game_type}</span>
                            </div>
                        </div>
                        
                        <div className="game-info-bottom">
                            <span className="game-date">Дата создания: {new Date(game.created_at).toLocaleDateString()}</span>
                            <div className="game-actions">
                                <button 
                                    className="btn btn-primary btn-sm play-btn"
                                    onClick={() => handlePlayGame(game.id)}
                                >
                                    Играть
                                </button>
                                <button 
                                    className="btn btn-outline btn-sm delete-btn"
                                    onClick={() => {deleteGame(game.id)}}
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GamesPreview;