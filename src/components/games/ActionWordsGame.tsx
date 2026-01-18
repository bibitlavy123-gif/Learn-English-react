import React, { useState, useEffect } from 'react';
import { audioService } from '../../services/audioService';
import './ActionWordsGame.css';

const ALL_ACTIONS = [
  { english: 'run', hebrew: 'לרוץ' },
  { english: 'jump', hebrew: 'לקפוץ' },
  { english: 'walk', hebrew: 'ללכת' },
  { english: 'sit', hebrew: 'לשבת' },
  { english: 'stand', hebrew: 'לעמוד' },
  { english: 'eat', hebrew: 'לאכול' },
  { english: 'drink', hebrew: 'לשתות' },
  { english: 'sleep', hebrew: 'לישון' },
  { english: 'play', hebrew: 'לשחק' },
  { english: 'read', hebrew: 'לקרוא' },
  { english: 'write', hebrew: 'לכתוב' },
  { english: 'sing', hebrew: 'לשיר' },
  { english: 'dance', hebrew: 'לרקוד' },
  { english: 'swim', hebrew: 'לשחות' },
  { english: 'fly', hebrew: 'לעוף' },
  { english: 'climb', hebrew: 'לטפס' },
  { english: 'throw', hebrew: 'לזרוק' },
  { english: 'catch', hebrew: 'לתפוס' },
  { english: 'kick', hebrew: 'לבעוט' },
  { english: 'draw', hebrew: 'לצייר' },
];

interface TreeWord {
  id: number;
  english: string;
  hebrew: string;
  matched: boolean;
}

interface Bucket {
  id: number;
  hebrew: string;
  english: string;
  matchedCount: number; // Track how many words matched (should be 2)
}

const ActionWordsGame: React.FC = () => {
  const [selectedActions, setSelectedActions] = useState<typeof ALL_ACTIONS>([]);
  const [treeWords, setTreeWords] = useState<TreeWord[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedWord, setSelectedWord] = useState<TreeWord | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [kidPosition, setKidPosition] = useState({ x: 50, y: 50 }); // Position in percentage
  const [kidWalking, setKidWalking] = useState(false);
  const [collectedWord, setCollectedWord] = useState<string | null>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Select 8 random actions
    const shuffled = [...ALL_ACTIONS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 8);

    // Create tree words - 2 instances of each English word
    const words: TreeWord[] = [];
    selected.forEach((action, index) => {
      // First instance
      words.push({
        id: index * 2,
        english: action.english,
        hebrew: action.hebrew,
        matched: false,
      });
      // Second instance
      words.push({
        id: index * 2 + 1,
        english: action.english,
        hebrew: action.hebrew,
        matched: false,
      });
    });

    // Shuffle the tree words
    const shuffledWords = words.sort(() => Math.random() - 0.5);

    // Create buckets with Hebrew words
    const newBuckets: Bucket[] = selected.map((action, index) => ({
      id: index,
      hebrew: action.hebrew,
      english: action.english,
      matchedCount: 0,
    }));

    setSelectedActions(selected);
    setTreeWords(shuffledWords);
    setBuckets(newBuckets);
    setSelectedWord(null);
    setGameComplete(false);
    setKidPosition({ x: 50, y: 50 });
    setKidWalking(false);
    setCollectedWord(null);
  };

  const handleWordClick = (word: TreeWord) => {
    if (word.matched) return;
    
    // Animate kid walking to the tree
    setKidWalking(true);
    setSelectedWord(word);
    setCollectedWord(word.english);
    
    // Calculate position near the tree (simplified - you can make this more dynamic)
    const treeIndex = treeWords.findIndex(w => w.id === word.id);
    const treesPerRow = 4;
    const row = Math.floor(treeIndex / treesPerRow);
    const col = treeIndex % treesPerRow;
    const newX = 20 + (col * 20);
    const newY = 30 + (row * 25);
    
    setKidPosition({ x: newX, y: newY });
    
    audioService.speakText(word.english);
    
    // Stop walking after animation
    setTimeout(() => {
      setKidWalking(false);
    }, 1000);
  };

  const handleBucketClick = (bucket: Bucket) => {
    if (!selectedWord || selectedWord.matched) return;

    // Animate kid walking to the bucket
    setKidWalking(true);
    
    // Calculate position near the bucket
    const bucketIndex = buckets.findIndex(b => b.id === bucket.id);
    const bucketsPerRow = 4;
    const row = Math.floor(bucketIndex / bucketsPerRow);
    const col = bucketIndex % bucketsPerRow;
    const newX = 15 + (col * 22);
    const newY = 70 + (row * 15);
    
    setKidPosition({ x: newX, y: newY });

    // Check if the word matches the bucket
    if (selectedWord.hebrew === bucket.hebrew) {
      // Correct match!
      if (bucket.matchedCount >= 2) {
        audioService.speakText('Bucket is full');
        setSelectedWord(null);
        setCollectedWord(null);
        setTimeout(() => {
          setKidWalking(false);
        }, 1000);
        return;
      }

      // Update tree word as matched
      setTreeWords(prev => prev.map(w =>
        w.id === selectedWord.id ? { ...w, matched: true } : w
      ));

      // Update bucket matched count
      setBuckets(prev => prev.map(b =>
        b.id === bucket.id ? { ...b, matchedCount: b.matchedCount + 1 } : b
      ));

      // Show word being placed in bucket
      setTimeout(() => {
        setCollectedWord(null);
        setSelectedWord(null);
        setKidWalking(false);
      }, 1500);
    } else {
      // Incorrect match
      audioService.speakText('Incorrect answer');
      setTimeout(() => {
        setKidWalking(false);
      }, 1000);
    }
  };

  const handleBucketLabelClick = (bucket: Bucket) => {
    audioService.speakText(bucket.english);
  };

  // Check if game is complete
  useEffect(() => {
    const allWordsMatched = treeWords.every(word => word.matched);
    const allBucketsFull = buckets.every(bucket => bucket.matchedCount === 2);
    
    if (allWordsMatched && allBucketsFull && !gameComplete) {
      setGameComplete(true);
      audioService.speakText('Congratulations! You collected all the flowers!');
    }
  }, [treeWords, buckets, gameComplete]);

  return (
    <div className="action-words-game">
      <div className="game-header">
        <h2>🌲 Action Words in the Forest</h2>
        <button className="reset-button" onClick={initializeGame}>
          🔄 Reset Game
        </button>
      </div>

      <div className="forest-scene">
        {/* Forest background elements */}
        <div className="forest-background">
          <div className="cloud cloud1">☁️</div>
          <div className="cloud cloud2">☁️</div>
          <div className="cloud cloud3">☁️</div>
          <div className="sun">☀️</div>
        </div>

        {/* Boy character - animated and positioned */}
        <div 
          className={`boy-character ${kidWalking ? 'walking' : ''}`}
          style={{
            left: `${kidPosition.x}%`,
            top: `${kidPosition.y}%`,
          }}
        >
          <div className="boy">👦</div>
          {collectedWord && (
            <div className="collected-word-bubble">
              {collectedWord}
            </div>
          )}
        </div>

        {/* Trees with words */}
        <div className="trees-section">
          <h3>Pick words from the trees</h3>
          <div className="trees-grid">
            {treeWords.map(word => (
              <div
                key={word.id}
                className={`tree-word-container ${word.matched ? 'matched' : ''} ${selectedWord?.id === word.id ? 'selected' : ''}`}
                onClick={() => handleWordClick(word)}
              >
                <div className="tree">🌳</div>
                {!word.matched && (
                  <div className="word-label">{word.english}</div>
                )}
                {word.matched && (
                  <div className="matched-check">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Buckets with Hebrew words */}
        <div className="buckets-section">
          <h3>Put words in the correct bucket</h3>
          <div className="buckets-grid">
            {buckets.map(bucket => (
              <div
                key={bucket.id}
                className={`bucket-container ${bucket.matchedCount === 2 ? 'full' : ''} ${selectedWord ? 'ready-for-selection' : ''}`}
                onClick={() => handleBucketClick(bucket)}
              >
                <div className="bucket">
                  <div className="bucket-handle"></div>
                  <div className="bucket-body">
                    {bucket.matchedCount > 0 && (
                      <div className="bucket-content">
                        {bucket.matchedCount === 2 && <span className="flower">🌸</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div 
                  className="bucket-label"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBucketLabelClick(bucket);
                  }}
                >
                  {bucket.hebrew}
                </div>
                {bucket.matchedCount === 2 && (
                  <div className="bucket-check">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {gameComplete && (
        <div className="completion-screen">
          <div className="flowers-celebration">
            <div className="flower-large">🌸</div>
            <div className="flower-large">🌺</div>
            <div className="flower-large">🌻</div>
            <div className="flower-large">🌷</div>
            <div className="flower-large">🌼</div>
          </div>
          <h2>🎉 Wonderful!</h2>
          <p>You collected all the flowers!</p>
          <p>Great job matching all the action words!</p>
          <button className="play-again-button" onClick={initializeGame}>
            🎮 Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionWordsGame;

