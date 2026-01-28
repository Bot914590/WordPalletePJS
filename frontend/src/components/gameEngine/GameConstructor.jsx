import { useState } from "react";
import gameService from '../../services/gameService';
//import './GameConstructor.css';


// Updated on $(29.01.26)


function GameConstructor() {
  const [gameType, setGameType] = useState('wheel');
  const [gameName, setGameName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Слова для колеса в режиме конструктора
  const [wheelWords, setWheelWords] = useState([
    { id: 1, text: "Science" },
    { id: 2, text: "Math" },
    { id: 3, text: "literature " },
  ]);
  const [newWordInput, setNewWordInput] = useState('');

  const [matchWords, setMatchWords] = useState([
    { id: 1, textWithPlaceholder: "Science about numbers is ", correctAnswer: "Math" },
    { id: 2, textWithPlaceholder: "Наука о живых огранизмах это", correctAnswer: "биология" },
    { id: 3, textWithPlaceholder: "Наука о числах это", correctAnswer: "Математика" },
  ]);
  const [newMatchWordInputFirst, setNewMatchWordInputFirst] = useState('');
  const [newMatchWordInputSecond, setNewMatchWordInputSecond] = useState('');

  const [anagramaWords, setAnagramaWord] = useState([
    {id: 1 , content: "Hello"},
    {id: 2 , content: "Time"},
    {id: 3 , content: "Horse"},
  ]);
  const [newAnagramaWordInput, setNewAnagramaWordInput] = useState('');

  const handleGameNaming = (event) => {
    setGameName(event.target.value);
  };

  const handleAddWord = () => {
    if (newWordInput.trim() === '') return;
    const newId = wheelWords.length > 0 ? Math.max(...wheelWords.map(w => w.id)) + 1 : 1;
    setWheelWords([...wheelWords, { id: newId, text: newWordInput.trim() }]);
    setNewWordInput('');
  };
  const handleADDtextWithPlaceholder = () => {
    if (newMatchWordInputFirst.trim() === '' || newMatchWordInputSecond.trim() === '') return;
    const newId = matchWords.length > 0 ? Math.max(...matchWords.map(w => w.id)) + 1 : 1;
    const newTextWithPlaceholder = newMatchWordInputFirst.trim();
    const newCorrectAnswer = newMatchWordInputSecond.trim();
    setMatchWords([...matchWords, { id: newId, textWithPlaceholder: newTextWithPlaceholder, correctAnswer: newCorrectAnswer }]);
    setNewMatchWordInputFirst('');
    setNewMatchWordInputSecond('');
  };

  const handleDeleteWord = (id) => {
    setWheelWords(wheelWords.filter(word => word.id !== id));
  };
  const handleDeleteMatchWord = (id) => {
    setMatchWords(matchWords.filter(word => word.id !== id));
  };

  const handleAddAnagramaWord = () => {
    if (newAnagramaWordInput.trim() === '') return; 
    const newId = anagramaWords.length > 0 ? Math.max(...anagramaWords.map(w => w.id)) + 1 : 1;
    setAnagramaWord([...anagramaWords,{id: newId , content: newAnagramaWordInput.trim()}] );

  };

  const handleDeleteAnagramaWord = (id) => {
    setAnagramaWord(anagramaWords.filter(word => word.id !== id));
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

    if (gameType === 'match' && matchWords.length === 0) {
      setSaveMessage('Добавьте хотя бы одно слово для совпадения');
      return;
    }

    if (gameType === 'anagrama' && anagramaWords.length === 0) {
      setSaveMessage('Добавьте хотя бы одно слово');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    if (gameType === 'wheel') {
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
  } else if (gameType === 'match') {
    try {
      // Преобразуем matchWords в формат matchItems (для сохранения в БД)
      const matchItemsForSave = matchWords.map((word, index) => ({
        wordId: word.id,
        answer: word.textWithPlaceholder,
        correctAnswer: word.correctAnswer,
        textPosition: { x: 0, y: 0 },
      }));
      await gameService.saveMatchGame(gameName, matchItemsForSave);
      setSaveMessage('Игра успешно сохранена!');
    } catch (error) {
      console.error('Ошибка при сохранении игры:', error);
      setSaveMessage('Ошибка при сохранении игры');
    } finally {
      setIsSaving(false);
    }
    } else if (gameType === 'anagrama'){
      try {
        await gameService.saveAnagramaGame(gameName, anagramaWords);
        setSaveMessage('Игра успешно сохранена!');
      } catch (error) {
        console.error('Ошибка при сохранении игры:', error);
        setSaveMessage('Ошибка при сохранении игры');
      } finally {
        setIsSaving(false);
      }
    }
  };
  function ConstructorEngine({ gameName, gameType, wheelWords, 
    setNewWordInput, handleAddWord, handleDeleteWord, newWordInput,newMatchWordInput, setNewMatchWordInput, newAnagramaWordInput, setNewAnagramaWordInput }) {
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
                  <button onClick={() => handleDeleteWord(word.id)} className="btn ">
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
        <div className="wheel-game-editor card">
          <h2 className="game-constructor-subtitle">Настройте вариантов совпадения</h2>
          <div className="input-group">
            <input
              type="text"
              value={newMatchWordInputFirst}
              onChange={(e) => setNewMatchWordInputFirst(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddWord(); }}
              placeholder="Введите "
            />
            <input
              type="text"
              value={newMatchWordInputSecond}
              onChange={(e) => setNewMatchWordInputSecond(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddWord(); }}
              placeholder="Введите "
            />
            <button 
              onClick={handleADDtextWithPlaceholder} 
              className="btn btn-primary"
            >
              Добавить
            </button>
          </div>
          <div className="word-list">
            {matchWords.length === 0 ? (
              <p className="text-muted">Добавьте варианты для совпадения.</p>
            ) : (
              matchWords.map(word => (
                <div key={word.id} className="word-item-match">
                  <span>{word.textWithPlaceholder}</span>
                  <span>{word.correctAnswer}</span>
                  
                  <button onClick={() => handleDeleteMatchWord(word.id)} className="btn ">
                    Удалить
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      );
    } else if (gameType === 'anagrama') {
      return (
        <div className="wheel-game-editor card">
          <h2 className="game-constructor-subtitle">Настройте слова для анаграммы</h2>

          <div className="input-group mb-3">
            <input
              type="text"
              value={newAnagramaWordInput}
              onChange={(e) => setNewAnagramaWordInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddAnagramaWord(); }}
              placeholder="Введите слово для анаграммы"
            />
            <button
              onClick={handleAddAnagramaWord}
              className="btn btn-primary"
            >
              Добавить
            </button>
          </div>

          <div className="word-list">
            {anagramaWords.length === 0 ? (
              <p className="text-muted">Добавьте слова для анаграммы.</p>
            ) : (
              anagramaWords.map(word => (
                <div key={word.id} className="word-item">
                  <span>{word.content}</span>
                  <button onClick={() => handleDeleteAnagramaWord(word.id)} className="btn ">
                    Удалить
                  </button>
                </div>
              ))
            )}
          </div>
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
          onClick={() => setGameType('anagrama')}
          className={`btn ${gameType === 'anagrama' ? 'btn-primary' : 'btn-outline'}`}
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
        newWordInput,
        newMatchWordInputFirst,
        setNewMatchWordInputFirst,
        newMatchWordInputSecond,
        setNewMatchWordInputSecond,
        matchWords,
        setMatchWords,
        handleADDtextWithPlaceholder,
        handleSaveGame,
        saveMessage,
        newAnagramaWordInput,
        setNewAnagramaWordInput,
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
};

export default GameConstructor;