import { useState, useRef } from "react";
import gameService from '../../services/gameService';
import './GameConstructor.css';

function GameConstructor() {
  const [gameType, setGameType] = useState('wheel');
  const [gameName, setGameName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Слова для колеса в режиме конструктора
  const [wheelWords, setWheelWords] = useState([
    { id: 1, text: "Вариант 1" },
    { id: 2, text: "Вариант 2" },
    { id: 3, text: "Вариант 3" },
  ]);
  const [newWordInput, setNewWordInput] = useState('');

  const handleGameNaming = (event) => {
    setGameName(event.target.value);
  };

  const handleAddWord = () => {
    if (newWordInput.trim() === '') return;
    const newId = wheelWords.length > 0 ? Math.max(...wheelWords.map(w => w.id)) + 1 : 1;
    setWheelWords([...wheelWords, { id: newId, text: newWordInput.trim() }]);
    setNewWordInput('');
  };

  const handleDeleteWord = (id) => {
    setWheelWords(wheelWords.filter(word => word.id !== id));
  };

  const handleSaveGame = async () => {
    if (!gameName.trim()) {
      setSaveMessage('Пожалуйста, введите название игры');
      return;
    }

    if (gameType === 'wheel' && wheelWords.length === 0) {
      setSaveMessage('Добавьте хотя бы одно слово для колеса');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      // Преобразуем wheelWords в формат wheelItems (для сохранения в БД)
      const wheelItemsForSave = wheelWords.map((word, index) => ({
        wordId: word.id,
        wordLabel: word.text,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Генерация случайного цвета
        textPosition: { x: 0, y: 0 },
      }));

      await gameService.saveWheelGame(gameName, wheelItemsForSave);
      setSaveMessage('Игра успешно сохранена!');
    } catch (error) {
      console.error('Ошибка при сохранении игры:', error);
      setSaveMessage('Ошибка при сохранении игры');
    } finally {
      setIsSaving(false);
    }
  };

  function ConstructorEngine({ gameName, gameType, wheelWords, setNewWordInput, handleAddWord, handleDeleteWord, newWordInput }) {
    if (gameType === 'wheel') {
      return (
        <div className="wheel-game-editor card">
          <h2 className="game-constructor-subtitle">Настройте варианты колеса</h2>
          
          <div className="input-group mb-3">
            <input
              type="text"
              value={newWordInput}
              onChange={(e) => setNewWordInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddWord(); }}
              placeholder="Введите вариант для колеса"
            />
            <button 
              onClick={handleAddWord} 
              className="btn btn-primary"
            >
              Добавить
            </button>
          </div>

          <div className="word-list">
            {wheelWords.length === 0 ? (
              <p className="text-muted">Добавьте варианты для колеса.</p>
            ) : (
              wheelWords.map(word => (
                <div key={word.id} className="word-item">
                  <span>{word.text}</span>
                  <button onClick={() => handleDeleteWord(word.id)} className="btn btn-danger btn-sm">
                    Удалить
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      );
    } else if (gameType === 'match') {
      return (
        <div className="game-type-placeholder card">
          <h3>Игра на совпадение: {gameName || 'Без названия'}</h3>
          <p>Функционал игры на совпадение скоро появится!</p>
        </div>
      );
    } else if (gameType === 'quiz') {
      return (
        <div className="game-type-placeholder card">
          <h3>Игра-викторина: {gameName || 'Без названия'}</h3>
          <p>Функционал викторины скоро появится!</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="game-constructor-container card">
      <h1>Конструктор игр</h1>
      
      <div className="form-group">
        <label htmlFor="gameName">Название игры</label>
        <input
          type="text"
          id="gameName"
          value={gameName}
          onChange={handleGameNaming}
          placeholder="Например: 'Колесо удачи'"
        />
      </div>
      
      <div className="button-group game-type-selector mb-3">
        <button
          type="button"
          onClick={() => setGameType('wheel')}
          className={`btn ${gameType === 'wheel' ? 'btn-primary' : 'btn-outline'}`}
        >
          Колесо
        </button>
        <button
          type="button"
          onClick={() => setGameType('match')}
          className={`btn ${gameType === 'match' ? 'btn-primary' : 'btn-outline'}`}
        >
          Совпадения
        </button>
        <button
          type="button"
          onClick={() => setGameType('quiz')}
          className={`btn ${gameType === 'quiz' ? 'btn-primary' : 'btn-outline'}`}
        >
          Викторина
        </button>
      </div>

      {ConstructorEngine({
        gameName, 
        gameType,
        wheelWords,
        setNewWordInput,
        handleAddWord,
        handleDeleteWord,
        newWordInput
      })}

      <div className="d-flex justify-content-center mt-4">
        <button
          type="button"
          onClick={handleSaveGame}
          disabled={isSaving || !gameName.trim() || (gameType === 'wheel' && wheelWords.length === 0)}
          className={`btn ${isSaving ? 'btn-outline' : 'btn-success'} btn-lg`}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить игру'}
        </button>
      </div>
      
      {saveMessage && (
        <div className={`alert ${saveMessage.includes('успешно') ? 'alert-success' : 'alert-error'} mt-3`}>
          {saveMessage}
        </div>
      )}
    </div>
  );
}

export default GameConstructor;