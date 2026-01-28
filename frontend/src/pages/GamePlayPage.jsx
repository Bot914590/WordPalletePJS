import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gameService from '../services/gameService';
import MainLayout from '../components/layout/MainLayout';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './GamePlayPage.css';
// Updated on $(29.01.26)
const AnagramaGame = ({ gameData }) => {
  const { game_name, game_content } = gameData;
  const { gameId } = useParams();
  const navigate = useNavigate();
  
  // Состояние для текущего слова и прогресса
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [words, setWords] = useState([]);

  // Функция для перемешивания букв
  const shuffleWord = (word) => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters;
  };

  // Инициализация игры
  useEffect(() => {
    if (game_content) {
      try {
        const parsed = JSON.parse(game_content);
        if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
          // Нормализуем слова - убедимся, что это массив строк
          const normalizedWords = parsed.items.map(item => 
            typeof item === 'string' ? item : (item.word || item.text || item.content || String(item))
          );
          
          setWords(normalizedWords);
          setCurrentIndex(0); // ИСПРАВЛЕНИЕ: сбрасываем индекс при загрузке
          
          // Инициализируем первое слово
          const firstWord = normalizedWords[0];
          const shuffled = shuffleWord(firstWord);
          setItems(shuffled.map((letter, index) => ({
            id: `letter-${index}`,
            content: letter
          })));
        }
      } catch (e) {
        console.error('Ошибка парсинга game_content:', e);
      }
    }
  }, [game_content]);

  // Обработка перехода к следующему слову
  useEffect(() => {
    // ИСПРАВЛЕНИЕ: проверяем что words загружены и индекс валидный
    if (words.length === 0) return;
    
    if (currentIndex > 0 && currentIndex < words.length) {
      const currentWord = words[currentIndex];
      
      // Генерируем анаграмму для следующего слова
      const shuffled = shuffleWord(currentWord);
      setItems(shuffled.map((letter, index) => ({
        id: `letter-${currentIndex}-${index}`, // ИСПРАВЛЕНИЕ: уникальные ID для каждого слова
        content: letter
      })));
      setIsSolved(false);
    } else if (currentIndex >= words.length) {
      setGameOver(true);
    }
  }, [currentIndex, words]);

  // Получаем текущее слово и информацию о прогрессе
  const currentWord = words[currentIndex] || '';
  const currentWordIndex = currentIndex + 1;
  const totalWords = words.length;

  // Обработчик завершения перетаскивания
  const onDragEnd = (result) => {
    // Отмена, если нет назначения или позиция не изменилась
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    // Переупорядочивание элементов
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);
    
    setItems(reorderedItems);
    
    // Проверяем, собрано ли правильное слово
    const currentOrder = reorderedItems.map(item => item.content).join('');
    if (currentOrder === currentWord) {
      setIsSolved(true);
      // Задержка для визуального подтверждения
      setTimeout(() => {
        if (currentIndex < words.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setGameOver(true);
        }
      }, 500);
    }
  };

  // ИСПРАВЛЕНИЕ: функция для сброса текущего слова
  const handleReset = () => {
    if (!currentWord) return;
    
    const shuffled = shuffleWord(currentWord);
    setItems(shuffled.map((letter, index) => ({
      id: `letter-${currentIndex}-${index}`, // ИСПРАВЛЕНИЕ: используем текущий индекс для уникальности
      content: letter
    })));
    setIsSolved(false);
  };

  // Стили
  const grid = 8;
  
  const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    padding: `${grid * 1.5}px ${grid * 2}px`,
    margin: `0 ${grid}px 0 0`,
    borderRadius: '6px',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: 'white',
    minWidth: '45px',
    height: '60px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isDragging ? '#4CAF50' : '#2196F3',
    boxShadow: isDragging 
      ? '0 4px 8px rgba(0,0,0,0.3)' 
      : '0 2px 4px rgba(0,0,0,0.2)',
    ...draggableStyle,
  });

  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? '#E3F2FD' : '#F5F5F5',
    display: 'flex',
    padding: grid,
    borderRadius: '8px',
    border: `2px dashed ${isDraggingOver ? '#2196F3' : '#bdbdbd'}`,
    minHeight: '80px',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  });

  // ИСПРАВЛЕНИЕ: добавляем проверку на загрузку данных
  if (!words.length && !gameOver) {
    return (
      <MainLayout>
        <div className="game-play-page">
          <div className="game-header">
            <h1>{game_name || 'Игра "Анаграмма"'}</h1>
          </div>
          <div className="game-loading">
            <p>Загрузка игры...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (gameOver) {
    return (
      <MainLayout>
        <div className="game-play-page">
          <div className="game-header">
            <h1>{game_name || 'Игра "Анаграмма"'}</h1>
          </div>
          
          <div className="game-complete">
            <h2>Поздравляем! 🎉</h2>
            <p>Вы успешно завершили все уровни!</p>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/games')}
            >
              Вернуться к списку игр
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="game-play-page">
        <div className="game-header">
          <h1>{game_name || 'Игра "Анаграмма"'}</h1>
          <div className="game-progress">
            Слово {currentWordIndex} из {totalWords}
          </div>
        </div>
        
        <div className="game-instructions">
          <p>Перетащите буквы в правильном порядке, чтобы составить слово</p>
        </div>
        
        {currentWord && (
          <div className="current-word">
            {currentWord.split('').map((letter, index) => (
              <span 
                key={`correct-${currentIndex}-${index}`} // ИСПРАВЛЕНИЕ: уникальные ключи
                className={`letter ${isSolved ? 'solved' : ''}`}
              >
                {letter}
              </span>
            ))}
          </div>
        )}
        
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable 
            droppableId="anagram-droppable" 
            direction="horizontal"
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
                {...provided.droppableProps}
                className="droppable-container"
              >
                {items.map((item, index) => (
                  <Draggable 
                    key={item.id} 
                    draggableId={item.id} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                        className="draggable-item"
                      >
                        {item.content}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        <div className="game-actions">
          <button 
            className="btn-reset" 
            onClick={handleReset} // ИСПРАВЛЕНИЕ: используем отдельную функцию
            aria-label="Сбросить текущее слово"
          >
            Сбросить
          </button>
          
          <button 
            className="btn-primary" 
            onClick={() => navigate('/games')}
          >
            Вернуться к списку игр
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

const MatchGame = ({ gameData }) => {

  //parsing into game_content
  const { game_name, game_content } = gameData;
  const [items, setItems] = useState(game_content && JSON.parse(game_content).items 
  ? JSON.parse(game_content).items : []);

  const [draggedItem, setDraggedItem] = useState(null);
  const [matchedAnswers, setMatchedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [usedAnswers, setUsedAnswers] = useState(new Set()); // Какие ответы уже использованы

  const handleDragStart = (e, item) => {
    
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move'
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetQuestion) => {
    e.preventDefault();
    
    if (draggedItem) {
      setMatchedAnswers(prev => {
        const newMatchedAnswers = { ...prev };
        
        // Если в этой зоне уже есть ответ, возвращаем его в верхнюю часть
        if (newMatchedAnswers[targetQuestion.wordId]) {
          setUsedAnswers(prevUsed => {
            const newUsed = new Set(prevUsed);
            newUsed.delete(newMatchedAnswers[targetQuestion.wordId]);
            return newUsed;
          });
        }
        
        // Добавляем новое сопоставление
        newMatchedAnswers[targetQuestion.wordId] = draggedItem.wordId;
        
        // Отмечаем ответ как использованный
        setUsedAnswers(prevUsed => new Set([...prevUsed, draggedItem.wordId]));
        
        return newMatchedAnswers;
      });
    }
    
    setDraggedItem(null);
  };
  // проверка ответов(находим неверные ответы)
  const uncorAns = () => {
    const correctAnswers = items.filter(item => item.isCorrect).map(item => item.wordId);
    const userAnswers = Object.values(matchedAnswers);
    const uncorrectAnswers = correctAnswers.filter(Element => !userAnswers.includes(Element))
    return uncorrectAnswers;
  };
  const handleCheckResults = () => {
    setShowResult(true);
  };
  const isCorrectMatch = (questionId, answerId) => {
    // Отладочная информация
    console.log('Проверка сопоставления:', { questionId, answerId, result: questionId === answerId });
    // Правильно, если ID вопроса равен ID ответа
    return questionId === answerId;
  };

  // Показываем только неиспользованные ответы в верхней части
  const availableAnswers = items.filter(item => !usedAnswers.has(item.wordId));

  

  return(
    <div className="match-game-container">
      <h1>{game_name}</h1>
      
      {/* Верхняя часть - правильные ответы для перетаскивания */}
      <div className="answers-section">
        <h3>Перетащите ответы:</h3>
        <div className="answers-grid">
          {availableAnswers.map(item => (
            <div
              key={item.wordId}
              className={`answer-card ${draggedItem?.wordId === item.wordId ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
            >
              <span className="answer-text">{item.correctAnswer}</span>
            </div>
          ))}
          {availableAnswers.length === 0 && (
            <p className="text-muted">Все ответы использованы</p>
          )}
        </div>
      </div>
      
      {/* Нижняя часть - вопросы для заполнения */}
      <div className="questions-section">
        <h3>Сопоставьте с вопросами:</h3>
        <div className="questions-list">
          {items.map(item => (
            <div
              key={item.wordId}
              className={`question-item ${showResult && matchedAnswers[item.wordId] ? (isCorrectMatch(item.wordId, matchedAnswers[item.wordId]) ? 'correct' : 'incorrect') : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item)}
            >
              <div className="question-text">
                {item.answer}
              </div>
              <div className={`drop-zone ${matchedAnswers[item.wordId] ? 'filled' : ''}`}>
                {matchedAnswers[item.wordId] ? (
                  <span className="dropped-answer">
                    {items.find(i => i.wordId === matchedAnswers[item.wordId])?.correctAnswer}
                    {/* ПОКАЗЫВАЕМ РЕЗУЛЬТАТ В НИЖНЕЙ ЧАСТИ */}
                    {showResult && (
                      <span className="result-icon">
                        {isCorrectMatch(item.wordId, matchedAnswers[item.wordId]) ? '✓' : '✗'}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="placeholder">
                    Перетащите сюда ответ
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопка проверки результатов */}
      <div className="action-buttons">
        <button onClick={handleCheckResults} className="btn btn-primary">
          Проверить результаты
        </button>
      </div>

    </div>
  );

};

// ##################################################################################

// ---------------------------------------------
// кОМПОНЕНТ ОТРИСОВКИ КОЛЕСА
// ----------------------------------------------
const WheelGame = ({ gameData }) => {
  const navigate = useNavigate();
  const { game_name, game_content } = gameData;
  const [items, setItems] = useState(game_content && JSON.parse(game_content).items ? JSON.parse(game_content).items : []);
  const [originalItems, setOriginalItems] = useState([]); // Для сброса

  useEffect(() => {
    // Сохраняем оригинальные элементы для возможности сброса
    setOriginalItems(items);
  }, []);

  //const textPos = { x: 0, y: 0 };
  const [rotationDeg, setRotationDeg] = useState(0);
  const [resultLabel, setResultLabel] = useState("Нажмите 'Крутить'");
  const [lastSpunIndex, setLastSpunIndex] = useState(null);
  const spinningRef = useRef(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [keepTextUpright, setKeepTextUpright] = useState(true);
  
  // Палитра цветов, если game_content не включает цвета
  const defaultPalette = [
    "#b3e5fc", // Light Blue
    "#81d4fa", // Cerulean
    "#4fc3f7", // Sky Blue
    "#29b6f6", // Deep Sky Blue
    "#03a9f4", // Blue
    "#039be5", // Dark Blue
    "#0288d1", // Midnight Blue
    "#0277bd", // Prussian Blue
    "#01579b", // Navy Blue
    "#002171"  // Darker Navy
  ];

  // Убедимся, что у каждого элемента есть цвет. Добавим также сокращение длинного текста.
  useEffect(() => {
    setItems(prevItems => prevItems.map((item, index) => ({
        ...item,
        color: item.color || defaultPalette[index % defaultPalette.length],
        // Сокращаем текст, если он слишком длинный
        displayLabel: item.wordLabel.length > 15 ? item.wordLabel.substring(0, 12) + '...' : item.wordLabel
    })));
  }, [game_content]);

  const getPointerIndex = (deg, count) => {
    if (count <= 0) return -1;
    const adjusted = (270 - (deg % 360) + 360) % 360; 
    const step = 360 / count;
    const index = Math.floor(adjusted / step);
    return Math.min(Math.max(index, 0), count - 1);
  };

  const spin = () => {
    if (spinningRef.current || isSpinning || items.length === 0) return;
    spinningRef.current = true;
    setIsSpinning(true);
    setResultLabel("");

    const count = items.length;
    const current = rotationDeg % 360;
    const targetIndex = Math.floor(Math.random() * count); // Выбираем случайный индекс
    const step = 360 / count;
    
    const targetCenterDeg = (targetIndex * step + step / 2) % 360;
    
    const baseTargetRotation = (270 - targetCenterDeg + 360) % 360;
    
    const extraTurns = Math.floor(Math.random() * (10 - 5 + 1)) + 5; // Случайные обороты
    const finalRotation = baseTargetRotation + 360 * extraTurns + 360; // Ещё один оборот для плавности

    const durationMs = 5000;
    const startTs = performance.now();
    const startRotation = current;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed = now - startTs;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = easeOutCubic(t);
      const value = startRotation + (finalRotation - startRotation) * eased;
      setRotationDeg(value);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        const finalResultIndex = getPointerIndex(value, count);
        const label = finalResultIndex >= 0 ? items[finalResultIndex]?.wordLabel ?? "" : "";
        setResultLabel(label);
        setLastSpunIndex(finalResultIndex); 
        spinningRef.current = false;
        setIsSpinning(false);
      }
    };

    requestAnimationFrame(tick);
  };

  const handleDeleteResult = () => {
    if (lastSpunIndex !== null && items[lastSpunIndex]) {
      const updatedItems = items.filter((_, index) => index !== lastSpunIndex);
      setItems(updatedItems);
      setResultLabel("");
      setLastSpunIndex(null);
      setRotationDeg(0); 
    }
  };

  const handleResetWheel = () => {
    setItems(originalItems);
    setResultLabel("Нажмите 'Крутить'");
    setLastSpunIndex(null);
    setRotationDeg(0);
  };

  const WordWheel = ({ items, size, thickness, rotationDeg, keepTextUpright }) => {
    const computeAnglesEqual = (count) => {
      if (count <= 0) return [];
      const step = 360 / count;
      const spans = [];
      for (let i = 0; i < count; i++) {
        const startDeg = i * step;
        const endDeg = (i + 1) * step;
        spans.push({ startDeg, endDeg });
      }
      spans[spans.length - 1].endDeg = 360;
      return spans;
    };

    const donutSlicePath = (cx, cy, rOuter, rInner, startDeg, endDeg) => {
      const toRad = (d) => (d * Math.PI) / 180;
      const pt = (r, a) => ({
        x: cx + r * Math.cos(toRad(a)),
        y: cy + r * Math.sin(toRad(a)),
      });
      const largeArc = (endDeg - startDeg + 360) % 360 > 180 ? 1 : 0;
      const p1 = pt(rOuter, startDeg), p2 = pt(rOuter, endDeg);
      const p3 = pt(rInner, endDeg), p4 = pt(rInner, startDeg);
      return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`;
    };

    const wheelDraw = () => {
      const spans = computeAnglesEqual(items.length);
      const cx = size / 2;
      const cy = size / 2;
      const rOuter = Math.min(cx, cy) - 5;
      const rInner = Math.max(0, rOuter - thickness);
      const toRad = (d) => (d * Math.PI) / 180;
      const polarToCartesian = (r, angleDeg) => ({
        x: cx + r * Math.cos(toRad(angleDeg)),
        y: cy + r * Math.sin(toRad(angleDeg)),
      });

      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`rotate(${rotationDeg} ${cx} ${cy})`}>
            {spans.map((span, i) => {
              const d = donutSlicePath(
                cx,
                cy,
                rOuter,
                rInner,
                span.startDeg,
                span.endDeg
              );
              const midAngle = (span.startDeg + span.endDeg) / 2;
              const textRadius = (rOuter + rInner) / 2;
              const { x, y } = polarToCartesian(textRadius, midAngle);
              return (
                <g key={i}>
                  <path d={d} fill={items[i].color ?? "#ccc"} />
                  <text
                    x={x}
                    y={y}
                    fill="#222"
                    fontSize={Math.max(10, thickness * 0.3)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={
                      keepTextUpright
                        ? `rotate(${-rotationDeg} ${x} ${y})`
                        : undefined
                    }
                  >
                    {items[i].displayLabel} {/* Используем displayLabel */}
                  </text>
                </g>
              );
            })}
          </g>
          <polygon points={`${cx - 6},10 ${cx + 6},10 ${cx},28`} fill="#333" />
        </svg>
      );
    };

    return wheelDraw();
  };

  return (
    <div className="wheel-play-area">
      <h1>{game_name}</h1>
      
      <div className="wheel-display">
        <WordWheel
          items={items}
          // Оптимизированные размеры
          size={Math.min(window.innerWidth * 0.7, window.innerHeight * 0.6, 600)} 
          thickness={Math.min(window.innerWidth * 0.2, window.innerHeight * 0.15, 180)} 
          rotationDeg={rotationDeg}
          keepTextUpright={keepTextUpright}
        />
      </div>
      
      <div className="wheel-game-controls card">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={keepTextUpright}
            onChange={(e) => setKeepTextUpright(e.target.checked)}
          />
          Держать текст вертикально
        </label>
        <button
          onClick={spin}
          disabled={isSpinning || items.length === 0}
          className={`btn ${isSpinning ? 'btn-outline' : 'btn-primary'}`}
        >
          {isSpinning ? 'Крутим...' : 'Крутить колесо'}
        </button>
        {lastSpunIndex !== null && items.length > 0 && (
          <button 
            onClick={handleDeleteResult} 
            className="btn btn-danger ml-2"
            disabled={isSpinning}
          >
            Удалить выпавший ({items[lastSpunIndex]?.wordLabel})
          </button>
        )}
        {items.length !== originalItems.length && (
            <button 
                onClick={handleResetWheel} 
                className="btn btn-secondary ml-2"
                disabled={isSpinning}
            >
                Сбросить колесо
            </button>
        )}
      </div>
      
      {resultLabel && (items.length > 0) && (
        <div className="wheel-result alert alert-success mt-3">
          <strong>Выпало:</strong> {resultLabel}
        </div>
      )}
      {items.length === 0 && !isSpinning && (
        <div className="wheel-result alert alert-warning mt-3">
            Все варианты удалены! Колесо пустое.
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------
// ГЛАВНЫЙ компонент
// ----------------------------------------------
function GamePlayPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Добавим состояние для возможности выхода из полноэкранного режима
  const handleExitFullscreen = () => {
    navigate(-1); // Возвращаемся на предыдущую страницу (список игр)
  };

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        const response = await gameService.getGameById(gameId);
        setGame(response.game);
      } catch (err) {
        setError('Не удалось загрузить игру.');
        console.error('Ошибка загрузки игры:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [gameId]);

  if (loading) {
    return <MainLayout><div className="game-play-loading">Загрузка игры...</div></MainLayout>;
  }

  if (error) {
    return <MainLayout><div className="game-play-error">Ошибка: {error}</div></MainLayout>;
  }

  if (!game) {
    return <MainLayout><div className="game-play-empty">Игра не найдена.</div></MainLayout>;
  }

  // В зависимости от game.game_type рендерим соответствующий компонент
  switch (game.game_type) {
    case 'wheel':
      return (
        <div className="game-play-fullscreen">
          <button onClick={handleExitFullscreen} className="btn btn-secondary exit-btn">↩️ Выйти</button>
          <WheelGame gameData={game} />
        </div>
      );
    case 'match':
      return (
        <div className="game-play-fullscreen">
          <button onClick={handleExitFullscreen} className="btn btn-secondary exit-btn">↩️ Выйти</button>
          <MatchGame gameData={game} />
        </div>
      );
    case 'anagrama':
      return (
        <div className="game-play-fullscreen">
          <button onClick={handleExitFullscreen} className="btn btn-secondary exit-btn">↩️ Выйти</button>
          <AnagramaGame gameData={game} />
        </div>
      );
    case 'quiz':
      return <MainLayout><div className="m-auto card p-4"><div className="game-play-placeholder">Викторина скоро появится!</div></div></MainLayout>;
    default:
      return <MainLayout><div className="m-auto card p-4"><div className="game-play-error">Неизвестный тип игры.</div></div></MainLayout>;
  }
}

export default GamePlayPage;