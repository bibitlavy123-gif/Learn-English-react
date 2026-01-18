import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../services/audioService';
import './ReadingGame.css';

interface Word {
  id: number;
  text: string;
  translation: string;
  category: string;
  isCompleted: boolean;
}

const WORD_CATEGORIES: Record<string, Array<[string, string]>> = {
  'Words ending with Y': [
    ['cry', 'בוכה'], ['pay', 'לשלם'], ['day', 'יום'], ['say', 'אומר'], 
    ['way', 'דרך'], ['may', 'אולי'], ['play', 'לשחק'], ['stay', 'להישאר'], 
    ['try', 'לנסות'], ['fly', 'לעוף'], ['my', 'שלי'], ['why', 'למה']
  ],
  'Words ending with ING': [
    ['reading', 'קריאה'], ['playing', 'משחק'], ['singing', 'שירה'], ['running', 'ריצה'], 
    ['jumping', 'קפיצה'], ['eating', 'אכילה'], ['sleeping', 'שינה'], ['walking', 'הליכה'], 
    ['talking', 'דיבור'], ['dancing', 'ריקוד']
  ],
  'Words with EE': [
    ['see', 'לראות'], ['tree', 'עץ'], ['bee', 'דבורה'], ['free', 'חופשי'], 
    ['three', 'שלושה'], ['green', 'ירוק'], ['sleep', 'לישון'], ['keep', 'לשמור'], 
    ['deep', 'עמוק'], ['sheep', 'כבשה']
  ],
  'Words with OO': [
    ['book', 'ספר'], ['look', 'להסתכל'], ['cook', 'לבשל'], ['took', 'לקח'], 
    ['good', 'טוב'], ['food', 'אוכל'], ['moon', 'ירח'], ['soon', 'בקרוב'], 
    ['room', 'חדר'], ['cool', 'מגניב']
  ],
  'Words with AI': [
    ['rain', 'גשם'], ['train', 'רכבת'], ['pain', 'כאב'], ['main', 'עיקרי'], 
    ['gain', 'להרוויח'], ['chain', 'שרשרת'], ['brain', 'מוח'], ['plain', 'פשוט'], 
    ['again', 'שוב'], ['Spain', 'ספרד']
  ],
  'Words with TION': [
    ['action', 'פעולה'], ['nation', 'אומה'], ['station', 'תחנה'], ['question', 'שאלה'], 
    ['section', 'סעיף'], ['motion', 'תנועה'], ['option', 'אפשרות'], ['portion', 'חלק'], 
    ['notion', 'רעיון'], ['caution', 'זהירות']
  ],
  'Words with CH': [
    ['chair', 'כיסא'], ['child', 'ילד'], ['chicken', 'תרנגולת'], ['chocolate', 'שוקולד'], 
    ['church', 'כנסייה'], ['cheese', 'גבינה'], ['cheap', 'זול'], ['chance', 'הזדמנות'], 
    ['change', 'שינוי'], ['chase', 'לרדוף']
  ],
  'Words with SH': [
    ['ship', 'ספינה'], ['shop', 'חנות'], ['shoe', 'נעל'], ['sheep', 'כבשה'], 
    ['fish', 'דג'], ['wish', 'משאלה'], ['brush', 'מברשת'], ['crash', 'התרסקות'], 
    ['flash', 'פלאש'], ['wash', 'לשטוף']
  ],
  'Words with EA': [
    ['read', 'לקרוא'], ['head', 'ראש'], ['bread', 'לחם'], ['dead', 'מת'], 
    ['lead', 'להוביל'], ['ready', 'מוכן'], ['heavy', 'כבד'], ['weather', 'מזג אוויר'], 
    ['feather', 'נוצה'], ['leather', 'עור']
  ],
  'Magic E Words': [
    ['cake', 'עוגה'], ['make', 'לעשות'], ['take', 'לקחת'], ['lake', 'אגם'], 
    ['name', 'שם'], ['game', 'משחק'], ['same', 'אותו'], ['came', 'בא'], 
    ['time', 'זמן'], ['like', 'לאהוב']
  ],
  'Simple Words': [
    ['cat', 'חתול'], ['dog', 'כלב'], ['hat', 'כובע'], ['bat', 'עטלף'], 
    ['mat', 'מחצלת'], ['rat', 'עכבר'], ['sat', 'ישב'], ['pat', 'טפיחה'], 
    ['fat', 'שמן'], ['vat', 'מיכל']
  ],
  'Soft G / Hard G': [
    ['giraffe', 'ג\'ירף'], ['gem', 'אבן חן'], ['gym', 'מכון כושר'], ['giant', 'ענק'], 
    ['gentle', 'עדין'], ['page', 'עמוד'], ['cage', 'כלוב'], ['stage', 'במה'], 
    ['game', 'משחק'], ['gate', 'שער'], ['goat', 'עז'], ['gift', 'מתנה']
  ],
  'Soft C / Hard C': [
    ['city', 'עיר'], ['cent', 'סנט'], ['circle', 'עיגול'], ['ceiling', 'תקרה'], 
    ['ice', 'קרח'], ['face', 'פנים'], ['race', 'מירוץ'], ['place', 'מקום'], 
    ['cat', 'חתול'], ['car', 'מכונית'], ['cup', 'כוס'], ['cut', 'חתוך']
  ],
};

const ReadingGame: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [gameComplete, setGameComplete] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    const initSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript.toLowerCase().trim();
          setIsListening(false);
          setIsRecognizing(false);
          checkAnswer(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setIsRecognizing(false);
          
          if (event.error === 'no-speech') {
            setFeedback('No speech detected. Please try again.');
          } else if (event.error === 'not-allowed') {
            setFeedback('Microphone permission denied. Please allow microphone access.');
          } else if (event.error === 'aborted') {
            // User or system aborted, don't show error
            return;
          } else {
            setFeedback(`Error: ${event.error}. Please try again.`);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          setIsRecognizing(false);
        };

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setIsRecognizing(true);
        };
      } else {
        setFeedback('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      }
    };

    initSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  const startCategory = (category: string) => {
    const categoryWords = WORD_CATEGORIES[category];
    const newWords: Word[] = categoryWords.map(([word, translation], index) => ({
      id: index,
      text: word,
      translation: translation,
      category: category,
      isCompleted: false,
    }));
    setWords(newWords);
    setSelectedCategory(category);
    setCurrentWord(null);
    setFeedback('');
    setGameComplete(false);
  };

  const handleWordClick = (word: Word) => {
    if (word.isCompleted) return;
    
    setCurrentWord(word);
    setFeedback('');
    audioService.speakText(word.text);
  };

  const startListening = () => {
    if (!currentWord) {
      setFeedback('Please select a word first by clicking on it.');
      return;
    }
    
    if (!recognitionRef.current) {
      setFeedback('Speech recognition is not available in your browser. Please use Chrome or Edge.');
      return;
    }

    // Stop any existing recognition
    try {
      recognitionRef.current.stop();
    } catch (e) {
      // Ignore if already stopped
    }

    setFeedback('Listening... Please say the word clearly.');
    
    // Small delay to ensure previous recognition is stopped
    setTimeout(() => {
      try {
        recognitionRef.current?.start();
      } catch (error: any) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
        setIsRecognizing(false);
        
        if (error.message?.includes('already started') || error.name === 'InvalidStateError') {
          // Recognition already running, try to stop and restart
          try {
            recognitionRef.current?.stop();
            setTimeout(() => {
              recognitionRef.current?.start();
            }, 100);
          } catch (e) {
            setFeedback('Please wait a moment and try again.');
          }
        } else {
          setFeedback('Error starting speech recognition. Please check microphone permissions.');
        }
      }
    }, 100);
  };

  const checkAnswer = (userSpeech: string) => {
    if (!currentWord) return;

    const correctWord = currentWord.text.toLowerCase().trim();
    const userWord = userSpeech.toLowerCase().trim();

    // Remove punctuation and extra spaces
    const cleanUserWord = userWord.replace(/[.,!?;:]/g, '').trim();
    const cleanCorrectWord = correctWord.replace(/[.,!?;:]/g, '').trim();

    // Check if user said the word correctly (exact match or close match)
    if (cleanUserWord === cleanCorrectWord || 
        cleanUserWord.includes(cleanCorrectWord) || 
        cleanCorrectWord.includes(cleanUserWord) ||
        cleanUserWord.split(' ').includes(cleanCorrectWord)) {
      // Correct!
      setWords(prev => {
        const updated = prev.map(w => 
          w.id === currentWord.id ? { ...w, isCompleted: true } : w
        );
        
        // Check if all words are completed
        const allComplete = updated.every(w => w.isCompleted);
        if (allComplete) {
          setTimeout(() => {
            setGameComplete(true);
            audioService.speakText('Congratulations! You read all the words!');
          }, 500);
        }
        
        return updated;
      });
      setCurrentWord(null);
      setFeedback('Correct! Great job!');
      // No audio for correct answers
    } else {
      // Incorrect
      setFeedback('Incorrect answer. Listen again.');
      audioService.speakText('Incorrect answer');
      // Read the word again after a short delay
      setTimeout(() => {
        audioService.speakText(currentWord.text);
        setFeedback('Listen and try again.');
      }, 1500);
    }
  };

  const resetGame = () => {
    setWords([]);
    setSelectedCategory('');
    setCurrentWord(null);
    setFeedback('');
    setGameComplete(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setIsRecognizing(false);
  };

  const remainingWords = words.filter(w => !w.isCompleted).length;
  const completedWords = words.filter(w => w.isCompleted).length;

  return (
    <div className="reading-game">
      <div className="game-header">
        <h2>📖 Reading Game</h2>
        <button className="reset-button" onClick={resetGame}>
          🔄 New Game
        </button>
      </div>

      {!selectedCategory ? (
        <div className="category-selection">
          <h3>Choose a Category</h3>
          <div className="categories-grid">
            {Object.keys(WORD_CATEGORIES).map(category => (
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
              Completed: {completedWords} / {words.length}
            </div>
          </div>

          <div className="game-instructions">
            <p>1. Click on a word to hear it</p>
            <p>2. Click "Listen" and repeat the word</p>
            <p>3. If correct, the word will disappear!</p>
          </div>

          {currentWord && (
            <div className="current-word-section">
              <div className="current-word-display">
                <h3>Current Word:</h3>
                <div className="word-large">{currentWord.text}</div>
                <button
                  className="listen-button"
                  onClick={startListening}
                  disabled={isListening || isRecognizing}
                >
                  {isListening || isRecognizing ? '🎤 Listening...' : '🎤 Listen & Repeat'}
                </button>
                {!recognitionRef.current && (
                  <div className="browser-warning">
                    ⚠️ Speech recognition requires Chrome or Edge browser
                  </div>
                )}
              </div>
            </div>
          )}

          {feedback && (
            <div className={`feedback ${feedback.includes('Correct') ? 'success' : feedback.includes('Incorrect') ? 'error' : 'info'}`}>
              {feedback}
            </div>
          )}

          <div className="words-board">
            <h3>Words to Read</h3>
            <div className="words-grid">
              {words.map(word => (
                <div
                  key={word.id}
                  className={`word-card ${word.isCompleted ? 'completed' : ''} ${currentWord?.id === word.id ? 'current' : ''}`}
                  onClick={() => handleWordClick(word)}
                >
                  {word.isCompleted ? (
                    <div className="word-completed">✓</div>
                  ) : (
                    <div className="word-content">
                      <div className="word-text">{word.text}</div>
                      <div className="word-translation">{word.translation}</div>
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
              <p>You read all the words correctly!</p>
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

export default ReadingGame;

