import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../services/audioService';
import './SentenceReadingGame.css';

interface Sentence {
  id: number;
  text: string;
  translation: string;
  isCompleted: boolean;
  attempts: number;
}

const SENTENCE_CATEGORIES: Record<string, Array<[string, string]>> = {
  'Simple Sentences': [
    ['I like cats.', 'אני אוהב חתולים.'],
    ['The dog is big.', 'הכלב גדול.'],
    ['I see a bird.', 'אני רואה ציפור.'],
    ['The sun is hot.', 'השמש חמה.'],
    ['I eat an apple.', 'אני אוכל תפוח.'],
    ['The book is good.', 'הספר טוב.'],
    ['I play with friends.', 'אני משחק עם חברים.'],
    ['The car is red.', 'המכונית אדומה.'],
    ['I drink water.', 'אני שותה מים.'],
    ['The cat is small.', 'החתול קטן.']
  ],
  'Daily Activities': [
    ['I wake up early.', 'אני מתעורר מוקדם.'],
    ['I brush my teeth.', 'אני מצחצח שיניים.'],
    ['I eat breakfast.', 'אני אוכל ארוחת בוקר.'],
    ['I go to school.', 'אני הולך לבית ספר.'],
    ['I play after school.', 'אני משחק אחרי בית ספר.'],
    ['I do my homework.', 'אני עושה שיעורי בית.'],
    ['I eat dinner.', 'אני אוכל ארוחת ערב.'],
    ['I read a book.', 'אני קורא ספר.'],
    ['I go to bed.', 'אני הולך לישון.'],
    ['I sleep at night.', 'אני ישן בלילה.']
  ],
  'Family & Friends': [
    ['I love my family.', 'אני אוהב את המשפחה שלי.'],
    ['My mom is nice.', 'האמא שלי נחמדה.'],
    ['My dad is strong.', 'האבא שלי חזק.'],
    ['I have a sister.', 'יש לי אחות.'],
    ['I have a brother.', 'יש לי אח.'],
    ['We play together.', 'אנחנו משחקים יחד.'],
    ['I help my friends.', 'אני עוזר לחברים שלי.'],
    ['We are happy.', 'אנחנו שמחים.'],
    ['I share my toys.', 'אני חולק את הצעצועים שלי.'],
    ['We have fun.', 'אנחנו נהנים.']
  ],
  'Nature & Weather': [
    ['The sky is blue.', 'השמיים כחולים.'],
    ['The sun is bright.', 'השמש בוהקת.'],
    ['I see clouds.', 'אני רואה עננים.'],
    ['It is raining.', 'יורד גשם.'],
    ['The tree is tall.', 'העץ גבוה.'],
    ['I see flowers.', 'אני רואה פרחים.'],
    ['The bird is flying.', 'הציפור עפה.'],
    ['The grass is green.', 'הדשא ירוק.'],
    ['I like the park.', 'אני אוהב את הפארק.'],
    ['Nature is beautiful.', 'הטבע יפה.']
  ],
  'Food & Eating': [
    ['I am hungry.', 'אני רעב.'],
    ['I eat lunch.', 'אני אוכל ארוחת צהריים.'],
    ['The food is good.', 'האוכל טוב.'],
    ['I like pizza.', 'אני אוהב פיצה.'],
    ['I drink milk.', 'אני שותה חלב.'],
    ['The apple is red.', 'התפוח אדום.'],
    ['I eat vegetables.', 'אני אוכל ירקות.'],
    ['The cake is sweet.', 'העוגה מתוקה.'],
    ['I eat fruit.', 'אני אוכל פירות.'],
    ['Food is important.', 'אוכל חשוב.']
  ],
  'School & Learning': [
    ['I go to school.', 'אני הולך לבית ספר.'],
    ['I learn English.', 'אני לומד אנגלית.'],
    ['The teacher is nice.', 'המורה נחמדה.'],
    ['I read books.', 'אני קורא ספרים.'],
    ['I write words.', 'אני כותב מילים.'],
    ['I study hard.', 'אני לומד קשה.'],
    ['I answer questions.', 'אני עונה על שאלות.'],
    ['I learn new words.', 'אני לומד מילים חדשות.'],
    ['School is fun.', 'בית ספר כיף.'],
    ['I like learning.', 'אני אוהב ללמוד.']
  ]
};

const SentenceReadingGame: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [hoveredSentence, setHoveredSentence] = useState<number | null>(null);
  const [micStatus, setMicStatus] = useState<'unknown' | 'available' | 'denied' | 'not-supported'>('unknown');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isStartingRef = useRef<boolean>(false);

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
        setMicStatus('available');
      } catch (error: any) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setMicStatus('denied');
        } else {
          setMicStatus('available'); // Assume available if we can't check
        }
      }
    };

    const initSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        try {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = 'en-US';
          recognitionRef.current.maxAlternatives = 1;

          recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            setIsListening(false);
            setIsRecognizing(false);
            isStartingRef.current = false;
            checkAnswer(transcript);
          };

          recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setIsRecognizing(false);
            isStartingRef.current = false;
            
            if (event.error === 'no-speech') {
              setFeedback('No speech detected. Please speak clearly and try again.');
            } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
              setFeedback('Microphone permission denied. Please allow microphone access in your browser settings.');
              setMicStatus('denied');
            } else if (event.error === 'aborted') {
              // User or system aborted, don't show error
              return;
            } else if (event.error === 'network') {
              setFeedback('Network error. Please check your internet connection.');
            } else if (event.error === 'audio-capture') {
              setFeedback('No microphone found. Please connect a microphone.');
            } else {
              setFeedback(`Error: ${event.error}. Please try again.`);
            }
          };

          recognitionRef.current.onend = () => {
            setIsListening(false);
            setIsRecognizing(false);
            isStartingRef.current = false;
          };

          recognitionRef.current.onstart = () => {
            setIsListening(true);
            setIsRecognizing(true);
            setFeedback('Listening... Speak now!');
          };

          checkMicrophonePermission();
        } catch (error) {
          console.error('Error initializing speech recognition:', error);
          setMicStatus('not-supported');
        }
      } else {
        setMicStatus('not-supported');
      }
    };

    initSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const startCategory = (category: string) => {
    const categorySentences = SENTENCE_CATEGORIES[category];
    const newSentences: Sentence[] = categorySentences.map(([text, translation], index) => ({
      id: index,
      text: text,
      translation: translation,
      isCompleted: false,
      attempts: 0,
    }));
    setSentences(newSentences);
    setSelectedCategory(category);
    setCurrentSentence(null);
    setFeedback('');
    setGameComplete(false);
    setScore(0);
    setHoveredSentence(null);
  };

  const handleSentenceHover = (sentence: Sentence) => {
    if (sentence.isCompleted) return;
    
    setHoveredSentence(sentence.id);
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Read the sentence after a short delay
    hoverTimeoutRef.current = setTimeout(() => {
      audioService.speakText(sentence.text);
    }, 300);
  };

  const handleSentenceLeave = () => {
    setHoveredSentence(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleSentenceClick = (sentence: Sentence) => {
    if (sentence.isCompleted) return;
    setCurrentSentence(sentence);
    setFeedback('Click "Listen & Repeat" to read this sentence!');
  };

  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicStatus('available');
      setFeedback('✅ Microphone is working! You can now use speech recognition.');
      setTimeout(() => setFeedback(''), 3000);
    } catch (error: any) {
      setMicStatus('denied');
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setFeedback('❌ Microphone permission denied. Please allow microphone access in your browser settings and refresh the page.');
      } else {
        setFeedback('❌ Could not access microphone. Please check your microphone settings.');
      }
    }
  };

  const startListening = () => {
    if (!currentSentence) {
      setFeedback('Please select a sentence first by clicking on it.');
      return;
    }
    
    if (!recognitionRef.current) {
      setFeedback('Speech recognition is not available. Please use Chrome or Edge browser.');
      return;
    }

    if (micStatus === 'denied') {
      setFeedback('Microphone permission denied. Click "Test Microphone" to grant permission.');
      return;
    }

    if (isStartingRef.current || isListening) {
      setFeedback('Please wait, recognition is already starting...');
      return;
    }

    // Stop any existing recognition
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (e) {
      // Ignore if already stopped
    }

    isStartingRef.current = true;
    setFeedback('Starting microphone... Please wait.');
    
    // Wait a bit before starting to ensure previous recognition is stopped
    setTimeout(() => {
      try {
        if (recognitionRef.current && !isListening) {
          recognitionRef.current.start();
        } else {
          isStartingRef.current = false;
          setFeedback('Recognition is already running. Please wait.');
        }
      } catch (error: any) {
        isStartingRef.current = false;
        setIsListening(false);
        setIsRecognizing(false);
        
        if (error.name === 'InvalidStateError' || error.message?.includes('already started')) {
          // Recognition already running, try to stop and restart
          try {
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
            setTimeout(() => {
              if (recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 500);
          } catch (e) {
            setFeedback('Please wait a moment and try again.');
          }
        } else if (error.name === 'NotAllowedError') {
          setFeedback('Microphone permission denied. Please allow microphone access.');
          setMicStatus('denied');
        } else {
          setFeedback(`Error: ${error.message || 'Unknown error'}. Please try again.`);
        }
      }
    }, 200);
  };

  const checkAnswer = (userSpeech: string) => {
    if (!currentSentence) return;

    const correctSentence = currentSentence.text.toLowerCase().trim();
    const userSentence = userSpeech.toLowerCase().trim();

    // Remove punctuation for comparison
    const cleanUserSentence = userSentence.replace(/[.,!?;:]/g, '').trim();
    const cleanCorrectSentence = correctSentence.replace(/[.,!?;:]/g, '').trim();

    // Check if user said the sentence correctly
    // More lenient matching for sentences
    const userWords = cleanUserSentence.split(/\s+/);
    const correctWords = cleanCorrectSentence.split(/\s+/);
    
    // Check if most words match (at least 70% of words)
    const matchingWords = userWords.filter(word => 
      correctWords.some(correctWord => 
        word === correctWord || 
        word.includes(correctWord) || 
        correctWord.includes(word)
      )
    );
    
    const matchPercentage = matchingWords.length / correctWords.length;
    const isCorrect = matchPercentage >= 0.7 || 
                     cleanUserSentence.includes(cleanCorrectSentence) ||
                     cleanCorrectSentence.includes(cleanUserSentence);

    if (isCorrect) {
      // Correct!
      setSentences(prev => {
        const updated = prev.map(s => 
          s.id === currentSentence.id ? { ...s, isCompleted: true } : s
        );
        
        const allComplete = updated.every(s => s.isCompleted);
        if (allComplete) {
          setTimeout(() => {
            setGameComplete(true);
            audioService.speakText('Congratulations! You read all the sentences!');
          }, 500);
        }
        
        return updated;
      });
      
      setScore(prev => prev + 20);
      setCurrentSentence(null);
      setFeedback('🌟 Excellent! Great reading!');
    } else {
      // Incorrect
      setSentences(prev => prev.map(s => 
        s.id === currentSentence.id ? { ...s, attempts: s.attempts + 1 } : s
      ));
      
      setFeedback('Not quite right. Hover over the sentence to hear it again, then try once more.');
      audioService.speakText('Try again');
      
      // Read the sentence again after a delay
      setTimeout(() => {
        audioService.speakText(currentSentence.text);
        setFeedback('Listen and try again.');
      }, 2000);
    }
  };

  const resetGame = () => {
    setSentences([]);
    setSelectedCategory('');
    setCurrentSentence(null);
    setFeedback('');
    setGameComplete(false);
    setScore(0);
    setHoveredSentence(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setIsRecognizing(false);
  };

  const completedSentences = sentences.filter(s => s.isCompleted).length;
  const totalSentences = sentences.length;

  return (
    <div className="sentence-reading-game">
      <div className="game-header">
        <div className="header-left">
          <h2>📝 Sentence Reading Game</h2>
          <div className="stats">
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <span className="stat-value">{score}</span>
            </div>
          </div>
        </div>
        <button className="reset-button" onClick={resetGame}>
          🔄 New Game
        </button>
      </div>

      {!selectedCategory ? (
        <div className="category-selection">
          <h3>Choose a Category</h3>
          <p className="category-description">
            Hover over sentences to hear them read aloud, then repeat them yourself!
          </p>
          <div className="categories-grid">
            {Object.keys(SENTENCE_CATEGORIES).map(category => (
              <button
                key={category}
                className="category-button"
                onClick={() => startCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="game-info">
            <div className="info-item">
              Category: <strong>{selectedCategory}</strong>
            </div>
            <div className="info-item">
              Completed: <strong>{completedSentences} / {totalSentences}</strong>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${totalSentences > 0 ? (completedSentences / totalSentences) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="game-instructions">
            <p>1. 🖱️ Hover over a sentence to hear it read aloud</p>
            <p>2. 👆 Click on a sentence to select it</p>
            <p>3. 🎤 Click "Listen & Repeat" and read the sentence yourself</p>
            <p>4. ⭐ Earn points for each correct sentence!</p>
          </div>

          {currentSentence && (
            <div className="current-sentence-section">
              <div className="current-sentence-display">
                <h3>Current Sentence:</h3>
                <div className="sentence-large">{currentSentence.text}</div>
                <div className="sentence-translation-large">{currentSentence.translation}</div>
                {currentSentence.attempts > 0 && (
                  <div className="attempts-info">
                    Attempts: {currentSentence.attempts}
                  </div>
                )}
                <div className="mic-controls">
                  <button
                    className="listen-button"
                    onClick={startListening}
                    disabled={isListening || isRecognizing || micStatus === 'denied'}
                  >
                    {isListening || isRecognizing ? '🎤 Listening...' : '🎤 Listen & Repeat'}
                  </button>
                  <button
                    className="test-mic-button"
                    onClick={testMicrophone}
                    title="Test microphone access"
                  >
                    🎙️ Test Microphone
                  </button>
                </div>
                {micStatus === 'not-supported' && (
                  <div className="browser-warning">
                    ⚠️ Speech recognition requires Chrome or Edge browser
                  </div>
                )}
                {micStatus === 'denied' && (
                  <div className="browser-warning error">
                    ❌ Microphone permission denied. Click "Test Microphone" to grant access.
                  </div>
                )}
                {micStatus === 'available' && recognitionRef.current && (
                  <div className="browser-warning success">
                    ✅ Microphone is ready!
                  </div>
                )}
              </div>
            </div>
          )}

          {feedback && (
            <div className="feedback-message">
              {feedback}
            </div>
          )}

          <div className="sentences-board">
            <h3>Sentences to Read</h3>
            <div className="sentences-list">
              {sentences.map(sentence => (
                <div
                  key={sentence.id}
                  className={`sentence-card ${sentence.isCompleted ? 'completed' : ''} ${currentSentence?.id === sentence.id ? 'current' : ''} ${hoveredSentence === sentence.id ? 'hovered' : ''}`}
                  onMouseEnter={() => handleSentenceHover(sentence)}
                  onMouseLeave={handleSentenceLeave}
                  onClick={() => handleSentenceClick(sentence)}
                >
                  {sentence.isCompleted ? (
                    <div className="sentence-completed">
                      <div className="checkmark">✓</div>
                      <div className="completed-text">{sentence.text}</div>
                    </div>
                  ) : (
                    <div className="sentence-content">
                      <div className="sentence-text">{sentence.text}</div>
                      <div className="sentence-translation">{sentence.translation}</div>
                      {hoveredSentence === sentence.id && (
                        <div className="hover-indicator">🔊 Listening...</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {gameComplete && (
            <div className="win-screen">
              <div className="trophy">🏆</div>
              <h2>Congratulations!</h2>
              <p>You read all the sentences correctly!</p>
              <div className="final-stats">
                <p>🎯 Final Score: <strong>{score}</strong></p>
                <p>📝 Sentences Read: <strong>{completedSentences}</strong></p>
              </div>
              <button className="play-again-button" onClick={resetGame}>
                🎮 Play Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SentenceReadingGame;

