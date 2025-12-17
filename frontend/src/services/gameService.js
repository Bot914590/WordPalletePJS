import api from "./api";

const gameService = {
    saveGame: async (gameData) => {
        try {
            const response = await api.post('/games', {
                game_type: gameData.gameType,
                game_name: gameData.gameName,
                game_content: gameData.gameContent
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getUserGames: async () => {
        try {
            const response = await api.get('/my-games');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getGameById: async (gameId) => {
        try {
            const response = await api.get(`/games/${gameId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteGame: async (gameId) => {
        try {
            const response = await api.delete(`/games/${gameId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ---------------------------------------------
    // Специализированный метод для сохранения колеса
    // ----------------------------------------------
    saveWheelGame: async (gameName, wheelItems) => {
        try {
            const response = await api.post('/games', {
                game_type: 'wheel',
                game_name: gameName,
                game_content: {
                    items: wheelItems,
                    // Дополнительные настройки колеса можно добавить здесь
                    keepTextUpright: true
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ----------------------------------------------
    // Специализированный метод для сохранения игры совпадений
    // ----------------------------------------------
    saveMatchGame: async (gameName, matchItems) => {
        try {
            const response = await api.post('/games', {
                game_type: 'match',
                game_name: gameName,
                game_content: {
                    items: matchItems,
                    // Дополнительные настройки соревнования можно добавить здесь
                    
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
};

export default gameService;