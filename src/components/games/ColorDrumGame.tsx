import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../services/audioService';
import './ColorDrumGame.css';

interface Drum {
  id: number;
  colorName: string;
  colorValue: string;
  soundFrequency: number; // Unique frequency for each drum sound
}

const ALL_COLORS = [
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#000080' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Green', value: '#008000' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Purple', value: '#800080' },
  { name: 'Pink', value: '#FF1493' },
  { name: 'Brown', value: '#A52A2A' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Gray', value: '#808080' },
  { name: 'Beige', value: '#F5F5DC' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Gold', value: '#DAA520' },
  { name: 'Silver', value: '#C9C9C9' },
];

const ColorDrumGame: React.FC = () => {
  const [drums, setDrums] = useState<Drum[]>([]);
  const [colorSequence, setColorSequence] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    initializeGame();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initializeGame = () => {
    // Select 8 random colors for drums
    const shuffledColors = [...ALL_COLORS].sort(() => Math.random() - 0.5).slice(0, 8);
    
    // Frequencies for different drum sounds (different pitches)
    const frequencies = [80, 100, 120, 140, 160, 180, 200, 220];
    
    // Create drums with these colors and unique frequencies
    const newDrums: Drum[] = shuffledColors.map((color, index) => ({
      id: index,
      colorName: color.name,
      colorValue: color.value,
      soundFrequency: frequencies[index],
    }));

    // Create a sequence of 5-7 colors from the selected drums (with some repetition)
    const sequenceLength = 5 + Math.floor(Math.random() * 3); // 5-7 colors
    const newSequence: string[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      const randomColor = shuffledColors[Math.floor(Math.random() * shuffledColors.length)];
      newSequence.push(randomColor.name);
    }

    setDrums(newDrums);
    setColorSequence(newSequence);
    setCurrentIndex(0);
    setGameComplete(false);
  };

  const playDrumSound = (frequency: number) => {
    if (!audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a drum-like sound with quick attack and decay
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1); // Quick decay
    
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  };

  const handleDrumClick = (drum: Drum) => {
    if (gameComplete) return;

    const expectedColor = colorSequence[currentIndex];
    
    if (drum.colorName === expectedColor) {
      // Correct! Play drum sound only (no voice)
      playDrumSound(drum.soundFrequency);
      
      // Move to next color in sequence
      if (currentIndex + 1 >= colorSequence.length) {
        // Game complete!
        setGameComplete(true);
        setTimeout(() => {
          audioService.speakText('Congratulations! You completed the sequence!');
        }, 1000);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    } else {
      // Incorrect - play no sound
    }
  };

  return (
    <div className="color-drum-game">
      <div className="game-header">
        <h2>🥁 Color Drum Game</h2>
        <button className="reset-button" onClick={initializeGame}>
          🔄 New Game
        </button>
      </div>

      <div className="game-container">
        {/* Drum Set - Left Side */}
        <div className="drums-section">
          <h3>Drum Set</h3>
          <div className="drums-grid">
            {drums.map(drum => (
              <div
                key={drum.id}
                className="drum-container"
                onClick={() => handleDrumClick(drum)}
              >
                <div className="drum">
                  <div 
                    className="drum-top"
                    style={{ backgroundColor: drum.colorValue }}
                  >
                    <span className="drum-label">{drum.colorName}</span>
                  </div>
                  <div className="drum-body"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Color Characters - Right Side */}
        <div className="sequence-section">
          <h3>Click in this order:</h3>
          <div className="color-sequence">
            {colorSequence.map((colorName, index) => {
              const color = ALL_COLORS.find(c => c.name === colorName);
              const isCurrent = index === currentIndex;
              const isCompleted = index < currentIndex;
              
              return (
                <div
                  key={index}
                  className={`sequence-item character-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
                  style={{ backgroundColor: color?.value || '#ccc' }}
                >
                  <span className="character-emoji">👤</span>
                  {isCurrent && <span className="current-indicator">👆</span>}
                  {isCompleted && <span className="checkmark">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completion Screen */}
      {gameComplete && (
        <div className="completion-screen">
          <div className="celebration">🎉</div>
          <h2>Great Job!</h2>
          <p>You completed the color sequence!</p>
          <button className="play-again-button" onClick={initializeGame}>
            🎮 Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorDrumGame;

