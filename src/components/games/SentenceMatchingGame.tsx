import React, { useState } from 'react';
import { audioService } from '../../services/audioService';
import './SentenceMatchingGame.css';

interface SentencePair {
  id: number;
  english: string;
  hebrew: string;
  isMatched: boolean;
}

interface SentenceMatchingGameProps {
  sentences: Array<[string, string]>; // [english, hebrew] sentence pairs
  onNextSentences?: () => void;
}

const SentenceMatchingGame: React.FC<SentenceMatchingGameProps> = ({ sentences, onNextSentences }) => {
  const [englishSentences, setEnglishSentences] = useState<SentencePair[]>([]);
  const [hebrewSentences, setHebrewSentences] = useState<SentencePair[]>([]);
  const [selectedEnglishSentence, setSelectedEnglishSentence] = useState<SentencePair | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  React.useEffect(() => {
    initializeGame();
  }, [sentences]);

  const initializeGame = () => {
    // Create sentence pairs
    const pairs: SentencePair[] = sentences.map(([english, hebrew], index) => ({
      id: index,
      english,
      hebrew,
      isMatched: false,
    }));

    // Shuffle English sentences
    const shuffledEnglish = [...pairs].sort(() => Math.random() - 0.5);
    
    // Shuffle Hebrew sentences
    const shuffledHebrew = [...pairs].sort(() => Math.random() - 0.5);

    setEnglishSentences(shuffledEnglish);
    setHebrewSentences(shuffledHebrew);
    setSelectedEnglishSentence(null);
    setMatchedPairs(new Set());
    setScore(0);
    setGameComplete(false);
  };

  const handleEnglishSentenceClick = (sentence: SentencePair) => {
    if (sentence.isMatched) return;
    
    // If clicking the same sentence, deselect it
    if (selectedEnglishSentence?.id === sentence.id) {
      setSelectedEnglishSentence(null);
    } else {
      setSelectedEnglishSentence(sentence);
      // Read the English sentence when selected
      audioService.speakText(sentence.english);
    }
  };

  const handleHebrewSentenceClick = (hebrewSentence: SentencePair) => {
    if (hebrewSentence.isMatched || !selectedEnglishSentence) return;
    
    // Check if sentences match
    if (selectedEnglishSentence.id === hebrewSentence.id) {
      // Correct match!
      setEnglishSentences(prev => prev.map(s => 
        s.id === selectedEnglishSentence.id ? { ...s, isMatched: true } : s
      ));
      setHebrewSentences(prev => prev.map(s => 
        s.id === hebrewSentence.id ? { ...s, isMatched: true } : s
      ));
      
      setMatchedPairs(prev => new Set([...prev, selectedEnglishSentence.id]));
      setScore(prev => prev + 10);
      setSelectedEnglishSentence(null);
      
      // Check if game is complete
      if (matchedPairs.size + 1 >= sentences.length) {
        setTimeout(() => {
          setGameComplete(true);
          audioService.speakText('Congratulations! You matched all the sentences!');
        }, 500);
      }
    } else {
      // Wrong match
      audioService.speakText('Incorrect answer');
      setSelectedEnglishSentence(null);
    }
  };

  return (
    <div className="sentence-matching-game">
      <div className="game-header">
        <h2>📝 Sentence Matching Game</h2>
        <div className="score">Score: {score}</div>
        <button className="reset-button" onClick={initializeGame}>
          🔄 Reset Game
        </button>
      </div>

      <div className="game-instructions">
        <p>🎯 Click an English sentence, then click its Hebrew translation!</p>
      </div>

      <div className="matching-container">
        {/* English Sentences Side */}
        <div className="sentences-side english-side">
          <h3>English Sentences</h3>
          <div className="sentences-list">
            {englishSentences.map(sentence => (
              <div
                key={sentence.id}
                className={`sentence-item english-sentence ${sentence.isMatched ? 'matched' : ''} ${selectedEnglishSentence?.id === sentence.id ? 'selected' : ''}`}
                onClick={() => handleEnglishSentenceClick(sentence)}
              >
                {sentence.isMatched ? (
                  <div className="sentence-matched">✓</div>
                ) : (
                  <div className="sentence-text">{sentence.english}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Connection Area */}
        <div className="connection-area">
          <div className="connection-label">Click to Match</div>
        </div>

        {/* Hebrew Sentences Side */}
        <div className="sentences-side hebrew-side">
          <h3>Hebrew Translations</h3>
          <div className="sentences-list">
            {hebrewSentences.map(sentence => (
              <div
                key={sentence.id}
                className={`sentence-item hebrew-sentence ${sentence.isMatched ? 'matched' : ''}`}
                onClick={() => handleHebrewSentenceClick(sentence)}
              >
                {sentence.isMatched ? (
                  <div className="sentence-matched">✓</div>
                ) : (
                  <div className="sentence-text">{sentence.hebrew}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Win Screen */}
      {gameComplete && (
        <div className="win-screen">
          <div className="trophy">🏆</div>
          <h2>Congratulations!</h2>
          <p>You matched all the sentences correctly!</p>
          <p className="final-score">Final Score: {score}</p>
          <div className="win-screen-buttons">
            {onNextSentences && (
              <button className="next-sentences-button" onClick={onNextSentences}>
                ➡️ Next Sentences
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

export default SentenceMatchingGame;

