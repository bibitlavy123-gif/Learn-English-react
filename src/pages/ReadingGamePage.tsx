import React, { useState } from 'react';
import ReadingGameEnhanced from '../components/games/ReadingGameEnhanced';
import SentenceReadingGame from '../components/games/SentenceReadingGame';
import './ReadingGamePage.css';

const ReadingGamePage: React.FC = () => {
  const [gameMode, setGameMode] = useState<'words' | 'sentences'>('words');

  return (
    <div className="reading-game-page">
      <div className="reading-mode-selector">
        <button
          className={`mode-selector-button ${gameMode === 'words' ? 'active' : ''}`}
          onClick={() => setGameMode('words')}
        >
          📖 Word Reading
        </button>
        <button
          className={`mode-selector-button ${gameMode === 'sentences' ? 'active' : ''}`}
          onClick={() => setGameMode('sentences')}
        >
          📝 Sentence Reading
        </button>
      </div>
      {gameMode === 'words' ? <ReadingGameEnhanced /> : <SentenceReadingGame />}
    </div>
  );
};

export default ReadingGamePage;

