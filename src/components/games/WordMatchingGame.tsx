import React, { useState } from 'react';
import { audioService } from '../../services/audioService';
import './WordMatchingGame.css';

interface WordPair {
  id: number;
  english: string;
  hebrew: string;
  isMatched: boolean;
}

interface WordMatchingGameProps {
  words: Array<[string, string]>; // [english, hebrew] pairs
  onNextList?: () => void;
  hasNextList?: boolean;
  onAddToLearningList?: (wordPair: [string, string]) => void;
  learningList?: Array<[string, string]>;
  onGoToMyList?: () => void;
}

const WordMatchingGame: React.FC<WordMatchingGameProps> = ({ words, onNextList, hasNextList, onAddToLearningList, learningList = [], onGoToMyList }) => {
  const [englishWords, setEnglishWords] = useState<WordPair[]>([]);
  const [hebrewWords, setHebrewWords] = useState<WordPair[]>([]);
  const [selectedEnglishWord, setSelectedEnglishWord] = useState<WordPair | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showAddNotification, setShowAddNotification] = useState(false);
  const [addedWord, setAddedWord] = useState<string>('');

  React.useEffect(() => {
    initializeGame();
  }, [words]);

  const initializeGame = () => {
    // Create word pairs
    const pairs: WordPair[] = words.map(([english, hebrew], index) => ({
      id: index,
      english,
      hebrew,
      isMatched: false,
    }));

    // Shuffle English words
    const shuffledEnglish = [...pairs].sort(() => Math.random() - 0.5);
    
    // Shuffle Hebrew words
    const shuffledHebrew = [...pairs].sort(() => Math.random() - 0.5);

    setEnglishWords(shuffledEnglish);
    setHebrewWords(shuffledHebrew);
    setSelectedEnglishWord(null);
    setMatchedPairs(new Set());
    setScore(0);
    setGameComplete(false);
  };

  const handleEnglishWordClick = (word: WordPair) => {
    if (word.isMatched) return;
    
    // If clicking the same word, deselect it
    if (selectedEnglishWord?.id === word.id) {
      setSelectedEnglishWord(null);
    } else {
      setSelectedEnglishWord(word);
      // Read the English word when selected
      audioService.speakText(word.english);
    }
  };

  const handleHebrewWordClick = (hebrewWord: WordPair) => {
    if (hebrewWord.isMatched || !selectedEnglishWord) return;
    
    // Check if words match
    if (selectedEnglishWord.id === hebrewWord.id) {
      // Correct match!
      setEnglishWords(prev => prev.map(w => 
        w.id === selectedEnglishWord.id ? { ...w, isMatched: true } : w
      ));
      setHebrewWords(prev => prev.map(w => 
        w.id === hebrewWord.id ? { ...w, isMatched: true } : w
      ));
      
      setMatchedPairs(prev => new Set([...prev, selectedEnglishWord.id]));
      setScore(prev => prev + 10);
      setSelectedEnglishWord(null);
      
      // Check if game is complete
      if (matchedPairs.size + 1 >= words.length) {
        setTimeout(() => {
          setGameComplete(true);
          audioService.speakText('Congratulations! You matched all the words!');
        }, 500);
      }
    } else {
      // Wrong match
      audioService.speakText('Incorrect answer');
      setSelectedEnglishWord(null);
    }
  };

  return (
    <div className="word-matching-game">
      <div className="game-header">
        <h2>🔗 Word Matching Game</h2>
        <div className="score">Score: {score}</div>
        <div className="header-buttons">
          {onGoToMyList && (
            <button className="my-list-button" onClick={onGoToMyList}>
              📚 My List ({learningList.length})
            </button>
          )}
          {hasNextList && onNextList && (
            <button className="skip-list-button" onClick={onNextList}>
              ⏭️ Skip to Next List
            </button>
          )}
          <button className="reset-button" onClick={initializeGame}>
            🔄 Reset Game
          </button>
        </div>
      </div>

      <div className="game-instructions">
        <p>🎯 Click an English word, then click its Hebrew translation!</p>
        {onAddToLearningList && (
          <p>📚 Click the + button on words to add them to My List</p>
        )}
      </div>

      <div className="matching-container">
        {/* English Words Side */}
        <div className="words-side english-side">
          <h3>English Words</h3>
          <div className="words-list">
            {englishWords.map(word => {
              const isInLearningList = learningList.some(([eng]) => eng === word.english);
              return (
                <div
                  key={word.id}
                  className={`word-item english-word ${word.isMatched ? 'matched' : ''} ${selectedEnglishWord?.id === word.id ? 'selected' : ''}`}
                >
                  <div className="word-content" onClick={() => handleEnglishWordClick(word)}>
                    {word.isMatched ? (
                      <div className="word-matched">✓</div>
                    ) : (
                      <div className="word-text">{word.english}</div>
                    )}
                  </div>
                  {onAddToLearningList && !word.isMatched && (
                    <button
                      className={`add-to-learning-btn ${isInLearningList ? 'in-list' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isInLearningList) {
                          onAddToLearningList([word.english, word.hebrew]);
                          setAddedWord(word.english);
                          setShowAddNotification(true);
                          setTimeout(() => {
                            setShowAddNotification(false);
                          }, 2000);
                        }
                      }}
                      title={isInLearningList ? 'Already in My List' : 'Add to My List'}
                    >
                      {isInLearningList ? '✓' : '+'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Connection Area */}
        <div className="connection-area">
          <div className="connection-label">Click to Match</div>
        </div>

        {/* Hebrew Words Side */}
        <div className="words-side hebrew-side">
          <h3>Hebrew Translations</h3>
          <div className="words-list">
            {hebrewWords.map(word => (
              <div
                key={word.id}
                className={`word-item hebrew-word ${word.isMatched ? 'matched' : ''}`}
                onClick={() => handleHebrewWordClick(word)}
              >
                {word.isMatched ? (
                  <div className="word-matched">✓</div>
                ) : (
                  <div className="word-text">{word.hebrew}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add to List Notification */}
      {showAddNotification && (
        <div className="add-notification">
          <span>✓ Added "{addedWord}" to My List!</span>
        </div>
      )}

      {/* Win Screen */}
      {gameComplete && (
        <div className="win-screen">
          <div className="trophy">🏆</div>
          <h2>Congratulations!</h2>
          <p>You matched all the words correctly!</p>
          <p className="final-score">Final Score: {score}</p>
          <div className="win-screen-buttons">
            {hasNextList && onNextList && (
              <button className="next-list-button" onClick={onNextList}>
                ➡️ Next List
              </button>
            )}
            <button className="play-again-button" onClick={initializeGame}>
              🎮 Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordMatchingGame;
