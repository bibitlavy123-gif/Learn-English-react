import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../services/audioService';
import './ReadingGameEnhanced.css';

interface Word {
  id: number;
  text: string;
  translation: string;
  category: string;
  isCompleted: boolean;
}


interface Story {
  id: string;
  title: string;
  sentences: string[][]; // Array of word arrays that form sentences
  unlocked: boolean;
}

const STORIES: Story[] = [
  {
    id: 'story1',
    title: 'The Cat and the Dog',
    sentences: [
      ['the', 'cat', 'likes', 'to', 'play'],
      ['the', 'dog', 'likes', 'to', 'run'],
      ['they', 'are', 'good', 'friends']
    ],
    unlocked: true
  },
  {
    id: 'story2',
    title: 'A Day at the Park',
    sentences: [
      ['we', 'go', 'to', 'the', 'park'],
      ['we', 'see', 'trees', 'and', 'flowers'],
      ['it', 'is', 'a', 'sunny', 'day']
    ],
    unlocked: true
  },
  {
    id: 'story3',
    title: 'My Favorite Food',
    sentences: [
      ['i', 'like', 'to', 'eat', 'cake'],
      ['cake', 'is', 'sweet', 'and', 'good'],
      ['i', 'eat', 'cake', 'with', 'milk']
    ],
    unlocked: true
  }
];

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
  'Y Sounds': [
    ['yes', 'כן'], ['yellow', 'צהוב'], ['yard', 'חצר'], ['year', 'שנה'], ['young', 'צעיר'],
    ['system', 'מערכת'], ['symbol', 'סמל'], ['cycle', 'מחזור'], ['type', 'סוג'], ['mystery', 'תעלומה'],
    ['happy', 'שמח'], ['candy', 'ממתק'], ['city', 'עיר'], ['baby', 'תינוק'], ['party', 'מסיבה'], ['lady', 'גברת'],
    ['day', 'יום'], ['say', 'אומר'], ['play', 'משחק'], ['may', 'אולי'], ['way', 'דרך'], ['stay', 'להישאר'],
    ['key', 'מפתח'], ['they', 'הם'], ['monkey', 'קוף'], ['money', 'כסף'], ['honey', 'דבש'], ['donkey', 'חמור'],
    ['boy', 'ילד'], ['toy', 'צעצוע'], ['enjoy', 'ליהנות'], ['joy', 'שמחה'], ['destroy', 'להרוס'], ['employ', 'להעסיק']
  ],
};


const ReadingGameEnhanced: React.FC = () => {
  const [gameMode, setGameMode] = useState<'category' | 'story'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [currentSentence, setCurrentSentence] = useState<string[]>([]);
  const [completedSentences, setCompletedSentences] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const confettiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
            checkAnswer(transcript);
          };

          recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setIsRecognizing(false);
            
            if (event.error === 'no-speech') {
              setFeedback('No speech detected. Please speak clearly and try again.');
            } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
              setFeedback('Microphone permission denied. Please allow microphone access in your browser settings.');
            } else if (event.error === 'aborted') {
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
          };

          recognitionRef.current.onstart = () => {
            setIsListening(true);
            setIsRecognizing(true);
            setFeedback('Listening... Speak now!');
          };
        } catch (error) {
          console.error('Error initializing speech recognition:', error);
        }
      }
    };

    initSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);


  const getCategoryRule = (category: string): string | null => {
    if (category === 'Y Sounds') {
      return 'Y can make different sounds depending on its position: At the beginning it sounds like /y/ (yes), in the middle it can be /i/ or /y/, at the end it often sounds like /ee/ (happy). Combinations: AY sounds like /ay/ (day), EY sounds like /ee/ or /ay/ (key, they), OY sounds like /oy/ (boy).';
    }
    return null;
  };

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
    setScore(0);
    setStars(0);
    setGameMode('category');
    
    // Read the rule if it exists
    const rule = getCategoryRule(category);
    if (rule) {
      setTimeout(() => {
        audioService.speakText(rule);
      }, 500);
    }
  };

  const startStory = (story: Story) => {
    // Flatten all words from sentences
    const allWords: string[] = [];
    story.sentences.forEach(sentence => {
      sentence.forEach(word => {
        if (!allWords.includes(word)) {
          allWords.push(word);
        }
      });
    });

    const newWords: Word[] = allWords.map((word, index) => ({
      id: index,
      text: word,
      translation: translateWord(word),
      category: 'story',
      isCompleted: false,
    }));

    setWords(newWords);
    setSelectedStory(story);
    setCurrentSentence(story.sentences[0] || []);
    setCompletedSentences(0);
    setSelectedCategory('');
    setCurrentWord(null);
    setFeedback('');
    setGameComplete(false);
    setScore(0);
    setStars(0);
    setGameMode('story');
  };

  const translateWord = (word: string): string => {
    // Simple translation lookup - you can expand this
    const translations: Record<string, string> = {
      'the': 'ה', 'cat': 'חתול', 'dog': 'כלב', 'likes': 'אוהב', 'to': 'ל',
      'play': 'לשחק', 'run': 'לרוץ', 'they': 'הם', 'are': 'הם', 'good': 'טוב',
      'friends': 'חברים', 'we': 'אנחנו', 'go': 'ללכת', 'park': 'פארק',
      'see': 'לראות', 'trees': 'עצים', 'and': 'ו', 'flowers': 'פרחים',
      'it': 'זה', 'is': 'הוא', 'a': 'א', 'sunny': 'שמשי', 'day': 'יום',
      'i': 'אני', 'like': 'אוהב', 'eat': 'לאכול', 'cake': 'עוגה', 'sweet': 'מתוק',
      'milk': 'חלב', 'with': 'עם'
    };
    return translations[word.toLowerCase()] || `[${word}]`;
  };

  const handleWordClick = (word: Word) => {
    if (word.isCompleted) return;
    setCurrentWord(word);
    setFeedback('Click "Listen & Repeat" to read this word!');
    audioService.speakText(word.text);
  };

  const startListening = () => {
    if (!currentWord) {
      setFeedback('Please select a word first by clicking on it.');
      return;
    }
    
    if (!recognitionRef.current) {
      setFeedback('Speech recognition is not available. Please use Chrome or Edge browser.');
      return;
    }

    if (isListening) {
      setFeedback('Please wait, recognition is already running...');
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

    setFeedback('Starting microphone... Please wait.');
    
    setTimeout(() => {
      try {
        if (recognitionRef.current && !isListening) {
          recognitionRef.current.start();
        } else {
          setFeedback('Recognition is already running. Please wait.');
        }
      } catch (error: any) {
        setIsListening(false);
        setIsRecognizing(false);
        
        if (error.name === 'InvalidStateError' || error.message?.includes('already started')) {
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
          setFeedback('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else {
          setFeedback(`Error: ${error.message || 'Unknown error'}. Please try again.`);
        }
      }
    }, 200);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
    }
    confettiTimeoutRef.current = setTimeout(() => {
      setShowConfetti(false);
    }, 2000);
  };

  const checkAnswer = (userSpeech: string) => {
    if (!currentWord) return;

    const correctWord = currentWord.text.toLowerCase().trim();
    const userWord = userSpeech.toLowerCase().trim();
    const cleanUserWord = userWord.replace(/[.,!?;:]/g, '').trim();
    const cleanCorrectWord = correctWord.replace(/[.,!?;:]/g, '').trim();

    if (cleanUserWord === cleanCorrectWord || 
        cleanUserWord.includes(cleanCorrectWord) || 
        cleanCorrectWord.includes(cleanUserWord) ||
        cleanUserWord.split(' ').includes(cleanCorrectWord)) {
      // Correct!
      setWords(prev => {
        const updated = prev.map(w => 
          w.id === currentWord.id ? { ...w, isCompleted: true } : w
        );
        
        const allComplete = updated.every(w => w.isCompleted);
        if (allComplete) {
          setTimeout(() => {
            setGameComplete(true);
            audioService.speakText('Congratulations! You read all the words!');
            setStars(prev => prev + 3);
          }, 500);
        }
        
        return updated;
      });
      
      setScore(prev => prev + 10);
      setStars(prev => prev + 1);
      setCurrentWord(null);
      setFeedback('🌟 Excellent! Great job!');
      triggerConfetti();

      // Check if sentence is complete (story mode)
      if (gameMode === 'story' && selectedStory) {
        checkSentenceCompletion();
      }
    } else {
      setFeedback('Incorrect answer. Listen again.');
      audioService.speakText('Incorrect answer');
      setTimeout(() => {
        audioService.speakText(currentWord.text);
        setFeedback('Listen and try again.');
      }, 1500);
    }
  };

  const checkSentenceCompletion = () => {
    if (!selectedStory) return;
    
    const currentSentenceWords = currentSentence.map(w => w.toLowerCase());
    const completedWordsInSentence = words
      .filter(w => currentSentenceWords.includes(w.text.toLowerCase()) && w.isCompleted)
      .map(w => w.text.toLowerCase());
    
    if (completedWordsInSentence.length === currentSentence.length) {
      // Sentence complete!
      setCompletedSentences(prev => {
        const newCount = prev + 1;
        if (newCount < selectedStory.sentences.length) {
          setCurrentSentence(selectedStory.sentences[newCount]);
        }
        return newCount;
      });
      setScore(prev => prev + 50); // Bonus for completing sentence
      triggerConfetti();
      audioService.speakText('Great! Sentence complete!');
    }
  };

  const resetGame = () => {
    setWords([]);
    setSelectedCategory('');
    setSelectedStory(null);
    setCurrentWord(null);
    setFeedback('');
    setGameComplete(false);
    setScore(0);
    setStars(0);
    setCurrentSentence([]);
    setCompletedSentences(0);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setIsRecognizing(false);
  };

  const remainingWords = words.filter(w => !w.isCompleted).length;
  const completedWords = words.filter(w => w.isCompleted).length;

  return (
    <div className="reading-game-enhanced">
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'][Math.floor(Math.random() * 5)]
            }} />
          ))}
        </div>
      )}

      <div className="game-header">
        <div className="header-left">
          <h2>📖 Reading Adventure</h2>
          <div className="stats">
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">{stars}</span>
            </div>
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

      {!selectedCategory && !selectedStory ? (
        <div className="mode-selection">
          <div className="mode-tabs">
            <button 
              className={`mode-tab ${gameMode === 'category' ? 'active' : ''}`}
              onClick={() => setGameMode('category')}
            >
              📚 Word Categories
            </button>
            <button 
              className={`mode-tab ${gameMode === 'story' ? 'active' : ''}`}
              onClick={() => setGameMode('story')}
            >
              📖 Story Mode
            </button>
          </div>

          {gameMode === 'category' ? (
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
            <div className="story-selection">
              <h3>Choose a Story</h3>
              <p className="story-description">Read words to complete sentences and unlock the story!</p>
              <div className="stories-grid">
                {STORIES.map(story => (
                  <div
                    key={story.id}
                    className={`story-card ${!story.unlocked ? 'locked' : ''}`}
                    onClick={() => story.unlocked && startStory(story)}
                  >
                    {!story.unlocked && <div className="lock-icon">🔒</div>}
                    <h4>{story.title}</h4>
                    <p className="story-preview">
                      {story.sentences[0].join(' ')}...
                    </p>
                    <div className="story-info">
                      <span>📝 {story.sentences.length} sentences</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {getCategoryRule(selectedCategory) && (
            <div className="rule-explanation">
              <div className="rule-header">
                <h3>📚 Reading Rule</h3>
              </div>
              <p className="rule-text">{getCategoryRule(selectedCategory)}</p>
            </div>
          )}

          <div className="game-info">
            <div className="info-item">
              {gameMode === 'story' ? (
                <>
                  Story: <strong>{selectedStory?.title}</strong>
                  <br />
                  Sentence: {completedSentences + 1} / {selectedStory?.sentences.length}
                </>
              ) : (
                <>
                  Category: <strong>{selectedCategory}</strong>
                </>
              )}
            </div>
            <div className="info-item">
              Progress: <strong>{completedWords} / {words.length}</strong>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${(completedWords / words.length) * 100}%` }}
              />
            </div>
          </div>

          {gameMode === 'story' && selectedStory && (
            <div className="current-sentence-display">
              <h4>Current Sentence:</h4>
              <div className="sentence-words">
                {currentSentence.map((word, idx) => {
                  const wordObj = words.find(w => w.text.toLowerCase() === word.toLowerCase());
                  return (
                    <span
                      key={idx}
                      className={`sentence-word ${wordObj?.isCompleted ? 'completed' : ''}`}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="game-instructions">
            <p>1. Click on a word to hear it</p>
            <p>2. Click "Listen & Repeat" and say the word</p>
            <p>3. Earn ⭐ stars and 🎯 points for each correct word!</p>
          </div>

          {currentWord && (
            <div className="current-word-section">
              <div className="current-word-display">
                <h3>Current Word:</h3>
                <div className="word-large">{currentWord.text}</div>
                <div className="word-translation-large">{currentWord.translation}</div>
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
            <div className="feedback-message">
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
                    <div className="word-completed">⭐</div>
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
              <div className="final-stats">
                <p>⭐ Stars Earned: <strong>{stars}</strong></p>
                <p>🎯 Final Score: <strong>{score}</strong></p>
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

export default ReadingGameEnhanced;

