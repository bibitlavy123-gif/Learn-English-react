import React, { useState, useEffect } from 'react';
import WordMatchingGame from '../components/games/WordMatchingGame';
import { translateWords } from '../services/translationService';
import './WordMatchingGamePage.css';

interface SavedList {
  id: string;
  name: string;
  words: string[];
  createdAt: string;
}

const STORAGE_KEY = 'wordMatchingSavedLists';
const LEARNING_LIST_KEY = 'wordMatchingLearningList';

// Helper function to split array into chunks
const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Predefined word list with English-Hebrew pairs
export const ALL_WORD_PAIRS: Array<[string, string]> = [
  ['a few', 'כמה'],
  ['a/an', 'אחד / אחת'],
  ['add', 'להוסיף'],
  ['all the time', 'כל הזמן'],
  ['and', 'ו'],
  ['Are you ready?', 'אתה מוכן? / את מוכנה?'],
  ['as', 'כמו / כפי'],
  ['ask', 'לשאול'],
  ['ask for', 'לבקש'],
  ['at', 'ב'],
  ['at home', 'בבית'],
  ['bad', 'רע'],
  ['bag', 'תיק'],
  ['be going to do/be sth', 'עומד לעשות / להיות'],
  ['be', 'להיות'],
  ['bed', 'מיטה'],
  ['best', 'הכי טוב'],
  ['big', 'גדול'],
  ['bit', 'קצת'],
  ['both', 'שניהם'],
  ['box', 'קופסה'],
  ['boy', 'ילד'],
  ['bus', 'אוטובוס'],
  ['bus stop', 'תחנת אוטובוס'],
  ['but', 'אבל'],
  ['camp', 'מחנה'],
  ['can', 'יכול'],
  ['cat', 'חתול'],
  ['come back', 'לחזור'],
  ['cost', 'עולה (מחיר)'],
  ['cut', 'לחתוך'],
  ['dad', 'אבא'],
  ['desk', 'שולחן כתיבה'],
  ['do', 'לעשות'],
  ['Do you have …?', 'יש לך …?'],
  ['Do you know …?', 'אתה יודע …?'],
  ['Do you like …?', 'אתה אוהב …?'],
  ['dog', 'כלב'],
  ['egg', 'ביצה'],
  ['end', 'סוף'],
  ['Excuse me please', 'סליחה בבקשה'],
  ['fact', 'עובדה'],
  ['fan', 'מאוורר / אוהד'],
  ['fast', 'מהר'],
  ['fifth', 'חמישי'],
  ['film', 'סרט'],
  ['film star', 'כוכב קולנוע'],
  ['Fine!', 'מצוין!'],
  ['friend', 'חבר / חברה'],
  ['from', 'מ'],
  ['fun', 'כיף'],
  ['get', 'לקבל / להשיג'],
  ['get up', 'לקום'],
  ['gift', 'מתנה'],
  ['glad', 'שמח'],
  ['go', 'ללכת'],
  ['go away', 'ללכת משם'],
  ['go on', 'להמשיך'],
  ['go out/outside', 'לצאת החוצה'],
  ['Good luck!', 'בהצלחה!'],
  ['good morning / goodbye / bye', 'בוקר טוב / להתראות / ביי'],
  ['half', 'חצי'],
  ['hand', 'יד'],
  ['Happy birthday!', 'יום הולדת שמח!'],
  ['hat', 'כובע'],
  ['have', 'יש / להיות'],
  ['Have a good day!', 'שיהיה לך יום טוב!'],
  ['he', 'הוא'],
  ['hello', 'שלום'],
  ['help', 'עזרה'],
  ['her', 'אותה / שלה'],
  ['him', 'אותו'],
  ['hit', 'להכות'],
  ['hot', 'חם'],
  ['How are you?', 'מה שלומך?'],
  ['How do you say …?', 'איך אומרים …?'],
  ['How many?', 'כמה?'],
  ['How much?', 'כמה? (מחיר)'],
  ['How old are you?', 'בן כמה אתה? / בת כמה את?'],
  ['I', 'אני'],
  ['I am/I\'m ... (fine, sick, hungry...)', 'אני ... (בסדר, חולה, רעב...)'],
  ['I am/I\'m … years old.', 'אני בן/בת … שנים'],
  ['I feel well', 'אני מרגיש טוב'],
  ['I have …', 'יש לי …'],
  ['I like … I don\'t like …', 'אני אוהב … אני לא אוהב …'],
  ['I live in …', 'אני גר ב …'],
  ['if', 'אם'],
  ['I\'m a boy/girl / He\'s a boy / She\'s a girl', 'אני ילד/ילדה / הוא ילד / היא ילדה'],
  ['I\'m ready', 'אני מוכן / מוכנה'],
  ['I\'m sorry', 'סליחה'],
  ['in', 'ב'],
  ['in a minute', 'עוד רגע'],
  ['in front of sb/sth', 'מול מישהו/משהו'],
  ['it', 'זה'],
  ['it doesn\'t matter', 'לא משנה'],
  ['It is a/an …', 'זה …'],
  ['its', 'שלו / שלה'],
  ['It\'s hot/cold', 'חם / קר'],
  ['It\'s/That\'s not fair', 'זה לא הוגן'],
  ['job', 'עבודה'],
  ['kid', 'ילד'],
  ['last', 'אחרון'],
  ['left', 'שמאל / נשאר'],
  ['let', 'לתת'],
  ['let\'s', 'בואו נ...'],
  ['Let\'s go', 'בואו נלך'],
  ['Let\'s play …', 'בואו נשחק …'],
  ['lost', 'אבוד'],
  ['lot', 'הרבה'],
  ['mad', 'כועס / משוגע'],
  ['man', 'איש'],
  ['me', 'אותי'],
  ['milk', 'חלב'],
  ['mix', 'לערבב'],
  ['mom/mum', 'אמא'],
  ['My address is …', 'הכתובת שלי היא …'],
  ['My name is …', 'השם שלי הוא …'],
  ['net', 'רשת'],
  ['next', 'הבא'],
  ['next to', 'ליד'],
  ['no', 'לא'],
  ['no one', 'אף אחד'],
  ['No problem!', 'אין בעיה!'],
  ['not', 'לא'],
  ['of', 'של'],
  ['of course', 'כמובן'],
  ['on', 'על'],
  ['once upon a time', 'היה היה פעם'],
  ['past', 'עבר'],
  ['pen', 'עט'],
  ['pencil', 'עיפרון'],
  ['pet', 'חיית מחמד'],
  ['plan', 'תוכנית'],
  ['plus', 'פלוס'],
  ['red', 'אדום'],
  ['rent', 'לשכור'],
  ['rest', 'לנוח'],
  ['run', 'לרוץ'],
  ['sad', 'עצוב'],
  ['Say it again please', 'תגיד את זה שוב בבקשה'],
  ['see you later', 'נתראה אחר כך'],
  ['send', 'לשלוח'],
  ['Show me …', 'תראה לי …'],
  ['sit', 'לשבת'],
  ['six', 'שש'],
  ['sleep', 'לישון'],
  ['so', 'אז'],
  ['soft', 'רך'],
  ['spend', 'להוציא / לבלות'],
  ['stand', 'לעמוד'],
  ['stop', 'לעצור'],
  ['sun', 'שמש'],
  ['swim', 'לשחות'],
  ['take a picture', 'לצלם תמונה'],
  ['Take care!', 'שמור על עצמך!'],
  ['talk', 'לדבר'],
  ['Tell a story', 'לספר סיפור'],
  ['ten', 'עשר'],
  ['test', 'מבחן'],
  ['than', 'מאשר'],
  ['thank you', 'תודה'],
  ['that', 'זה / ההוא'],
  ['the', 'ה'],
  ['the same', 'אותו דבר'],
  ['their', 'שלהם'],
  ['them', 'אותם'],
  ['then', 'ואז'],
  ['there is / there are / there was, etc', 'יש / היו'],
  ['they', 'הם'],
  ['this', 'זה'],
  ['This is a/an …', 'זה …'],
  ['This is my …', 'זה שלי …'],
  ['three', 'שלוש'],
  ['to', 'ל'],
  ['today', 'היום'],
  ['Today is … (weather: rainy, hot, cold, nice)', 'היום … (מזג אוויר: גשום, חם, קר, נעים)'],
  ['top', 'עליון'],
  ['trip', 'טיול'],
  ['up', 'למעלה'],
  ['us', 'אותנו'],
  ['wait for', 'לחכות ל…'],
  ['We like to …', 'אנחנו אוהבים …'],
  ['Well done!', 'כל הכבוד!'],
  ['What (fruit / vegetable / sport) do you like?', 'איזה (פרי / ירק / ספורט) אתה אוהב?'],
  ['What color is your …?', 'איזה צבע יש ל… שלך?'],
  ['What is it?', 'מה זה?'],
  ['What is this? What\'s this?', 'מה זה?'],
  ['What\'s (what is) your name?', 'איך קוראים לך?'],
  ['What\'s the matter?', 'מה הבעיה?'],
  ['Where do you live?', 'איפה אתה גר?'],
  ['Where is the …? Where\'s the …', 'איפה ה…?'],
  ['Who has …?', 'למי יש …?'],
  ['Who is this? Who\'s this?', 'מי זה?'],
  ['yes', 'כן'],
  ['Yes, please', 'כן, בבקשה'],
  ['you', 'אתה / את'],
  ['you\'re welcome', 'בבקשה'],
  ['sit down', 'לשבת']
];

// Split into lists of max 8 words each
export interface VocabularyList {
  id: number;
  name: string;
  pairs: Array<[string, string]>;
}

export const VOCABULARY_LISTS: VocabularyList[] = chunkArray(ALL_WORD_PAIRS, 8).map((pairs, index) => ({
  id: index + 1,
  name: `Vocabulary List ${index + 1} (${pairs.length} words)`,
  pairs
}));

const WordMatchingGamePage: React.FC = () => {
  const [englishWords, setEnglishWords] = useState<string[]>([]);
  const [wordInput, setWordInput] = useState('');
  const [translatedPairs, setTranslatedPairs] = useState<Array<[string, string]>>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [missingTranslations, setMissingTranslations] = useState<Array<[string, string]>>([]);
  const [translationInputs, setTranslationInputs] = useState<Record<string, string>>({});
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [listName, setListName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'lists' | 'create' | 'game'>('lists');
  const [currentVocabListIndex, setCurrentVocabListIndex] = useState<number | null>(null);
  const [learningList, setLearningList] = useState<Array<[string, string]>>([]);

  useEffect(() => {
    loadSavedLists();
    loadLearningList();
  }, []);

  const loadLearningList = () => {
    try {
      const stored = localStorage.getItem(LEARNING_LIST_KEY);
      if (stored) {
        const list = JSON.parse(stored) as Array<[string, string]>;
        setLearningList(list);
      }
    } catch (error) {
      console.error('Error loading learning list:', error);
    }
  };

  const saveLearningList = (list: Array<[string, string]>) => {
    try {
      localStorage.setItem(LEARNING_LIST_KEY, JSON.stringify(list));
      setLearningList(list);
    } catch (error) {
      console.error('Error saving learning list:', error);
    }
  };

  const addToLearningList = (wordPair: [string, string]) => {
    // Check if word already exists in learning list
    const exists = learningList.some(([eng]) => eng === wordPair[0]);
    if (!exists) {
      const updated = [...learningList, wordPair];
      saveLearningList(updated);
    }
  };

  const removeFromLearningList = (englishWord: string) => {
    const updated = learningList.filter(([eng]) => eng !== englishWord);
    saveLearningList(updated);
  };

  const clearLearningList = () => {
    if (window.confirm('Are you sure you want to clear your learning list?')) {
      saveLearningList([]);
    }
  };

  const loadLearningListGame = () => {
    if (learningList.length === 0) return;
    const englishWordsList = learningList.map(([english]) => english);
    setEnglishWords(englishWordsList);
    setTranslatedPairs([...learningList]);
    setCurrentVocabListIndex(null);
    setGameStarted(true);
    setViewMode('game');
  };

  const loadSavedLists = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const lists = JSON.parse(stored) as SavedList[];
        setSavedLists(lists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (error) {
      console.error('Error loading saved lists:', error);
    }
  };

  const saveList = () => {
    if (!listName.trim() || englishWords.length === 0) return;

    const newList: SavedList = {
      id: Date.now().toString(),
      name: listName.trim(),
      words: [...englishWords],
      createdAt: new Date().toISOString(),
    };

    const updatedLists = [newList, ...savedLists];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLists));
    setSavedLists(updatedLists);
    setListName('');
    setShowSaveDialog(false);
    setEnglishWords([]);
    setViewMode('lists');
  };

  const loadList = (list: SavedList) => {
    setEnglishWords(list.words);
    setCurrentVocabListIndex(null); // Clear vocab list index for custom lists
    setViewMode('create');
  };

  const loadDefaultList = (vocabList: VocabularyList) => {
    // Extract English words from pairs
    const englishWordsList = vocabList.pairs.map(([english]) => english);
    setEnglishWords(englishWordsList);
    // Set translated pairs directly since we already have Hebrew translations
    setTranslatedPairs([...vocabList.pairs]);
    // Store the current vocabulary list index
    setCurrentVocabListIndex(vocabList.id - 1); // id is 1-based, index is 0-based
    setViewMode('create');
  };

  const handleNextList = () => {
    if (currentVocabListIndex === null) return;
    
    const nextIndex = currentVocabListIndex + 1;
    if (nextIndex < VOCABULARY_LISTS.length) {
      const nextList = VOCABULARY_LISTS[nextIndex];
      loadDefaultList(nextList);
      setGameStarted(true);
    }
  };

  const deleteList = (id: string) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      const updatedLists = savedLists.filter(list => list.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLists));
      setSavedLists(updatedLists);
    }
  };

  const handleAddWord = () => {
    const word = wordInput.trim().toLowerCase();
    if (word && !englishWords.includes(word)) {
      setEnglishWords([...englishWords, word]);
      setWordInput('');
      // Clear translated pairs since list has changed
      setTranslatedPairs([]);
      setGameStarted(false);
      setCurrentVocabListIndex(null); // Clear vocab list index when manually adding words
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddWord();
    }
  };

  const handleStartGame = () => {
    if (englishWords.length > 0) {
      // If we already have translated pairs (e.g., from default list), verify they match and use them directly
      if (translatedPairs.length > 0 && translatedPairs.length === englishWords.length) {
        // Verify that all English words in pairs match the current word list
        const pairsMatch = englishWords.every(word => 
          translatedPairs.some(([eng]) => eng.toLowerCase() === word.toLowerCase())
        );
        if (pairsMatch) {
          setGameStarted(true);
          return;
        }
      }
      
      // Otherwise, translate all words
      const translations = translateWords(englishWords);
      
      // Check for missing translations (words with brackets)
      const missing = translations.filter(([, heb]) => heb.startsWith('[') && heb.endsWith(']'));
      
      if (missing.length > 0) {
        // Show translation input for missing words
        setMissingTranslations(missing);
        const inputs: Record<string, string> = {};
        missing.forEach(([eng]) => {
          inputs[eng] = '';
        });
        setTranslationInputs(inputs);
      } else {
        // All words translated, start game
        setTranslatedPairs(translations);
        setGameStarted(true);
      }
    }
  };

  const handleTranslationInput = (english: string, hebrew: string) => {
    setTranslationInputs(prev => ({
      ...prev,
      [english]: hebrew
    }));
  };

  const handleConfirmTranslations = () => {
    // Replace missing translations with user inputs
    const finalTranslations = translateWords(englishWords).map(([eng, heb]) => {
      if (heb.startsWith('[') && heb.endsWith(']') && translationInputs[eng]) {
        return [eng, translationInputs[eng]] as [string, string];
      }
      return [eng, heb] as [string, string];
    });
    
    setTranslatedPairs(finalTranslations);
    setGameStarted(true);
    setMissingTranslations([]);
    setTranslationInputs({});
  };

  const handleRemoveWord = (index: number) => {
    setEnglishWords(englishWords.filter((_, i) => i !== index));
    // Clear translated pairs since list has changed
    setTranslatedPairs([]);
    setGameStarted(false);
    setCurrentVocabListIndex(null); // Clear vocab list index when removing words
  };

  const handleClearAll = () => {
    setEnglishWords([]);
    setWordInput('');
    setTranslatedPairs([]);
    setGameStarted(false);
    setMissingTranslations([]);
    setTranslationInputs({});
    setCurrentVocabListIndex(null); // Clear vocab list index
  };

  const handleBackToSetup = () => {
    setGameStarted(false);
    setViewMode('create');
  };

  const handleGoToMyList = () => {
    setGameStarted(false);
    setViewMode('lists');
    // Scroll to learning list section
    setTimeout(() => {
      const learningSection = document.querySelector('.learning-list-section');
      if (learningSection) {
        learningSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleNewList = () => {
    setEnglishWords([]);
    setWordInput('');
    setViewMode('create');
  };

  const handleBackToLists = () => {
    setViewMode('lists');
    handleClearAll();
  };

  if (gameStarted && translatedPairs.length > 0) {
    const hasNextList = currentVocabListIndex !== null && currentVocabListIndex + 1 < VOCABULARY_LISTS.length;
    return (
      <div className="word-matching-page">
        <button className="back-to-setup-button" onClick={handleBackToSetup}>
          ← Back to Setup
        </button>
        <WordMatchingGame 
          words={translatedPairs} 
          onNextList={hasNextList ? handleNextList : undefined}
          hasNextList={hasNextList}
          onAddToLearningList={addToLearningList}
          learningList={learningList}
          onGoToMyList={handleGoToMyList}
        />
      </div>
    );
  }

  if (viewMode === 'lists') {
    return (
      <div className="word-matching-page">
        <div className="lists-view">
          <h2>🔗 Word Matching Game - Saved Lists</h2>
          <div className="list-actions-header">
            <button className="new-list-button" onClick={handleNewList}>
              ➕ Create New List
            </button>
            {learningList.length > 0 && (
              <div className="learning-list-badge">
                📚 My List: {learningList.length} words
              </div>
            )}
          </div>

          {/* Vocabulary Lists Section */}
          <div className="vocabulary-lists-section">
            <h3>📚 Vocabulary Lists</h3>
            <div className="vocabulary-lists-grid">
              {VOCABULARY_LISTS.map((vocabList) => (
                <button
                  key={vocabList.id}
                  className="vocab-list-button"
                  onClick={() => loadDefaultList(vocabList)}
                >
                  <span className="vocab-list-name">{vocabList.name}</span>
                  <span className="vocab-list-count">{vocabList.pairs.length} words</span>
                </button>
              ))}
            </div>
          </div>

          {/* Learning List Section */}
          <div className="learning-list-section">
            <div className="learning-list-header">
              <h3>📚 My List</h3>
              {learningList.length > 0 && (
                <div className="learning-list-actions">
                  <button className="start-learning-button" onClick={loadLearningListGame}>
                    🎮 Start Game ({learningList.length} words)
                  </button>
                  <button className="clear-learning-button" onClick={clearLearningList}>
                    🗑️ Clear List
                  </button>
                </div>
              )}
            </div>
            {learningList.length === 0 ? (
              <div className="no-learning-list-message">
                <p>My List is empty.</p>
                <p>Click the + button on words while playing to add them to My List!</p>
              </div>
            ) : (
              <div className="learning-list-words">
                <div className="learning-list-preview">
                  {learningList.map(([english, hebrew], index) => (
                    <div key={index} className="learning-list-word-item">
                      <span className="learning-word-english">{english}</span>
                      <span className="learning-word-separator">→</span>
                      <span className="learning-word-hebrew">{hebrew}</span>
                      <button
                        className="remove-from-learning-btn"
                        onClick={() => removeFromLearningList(english)}
                        title="Remove from learning list"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Saved Lists Section */}
          <div className="saved-lists-section">
            <h3>💾 Your Saved Lists</h3>
            {savedLists.length === 0 ? (
              <div className="no-lists-message">
                <p>No saved lists yet.</p>
                <p>Click "Create New List" to get started!</p>
              </div>
            ) : (
              <div className="saved-lists-grid">
              {savedLists.map(list => (
                <div key={list.id} className="saved-list-card">
                  <div className="list-header">
                    <h3>{list.name}</h3>
                    <div className="list-actions">
                      <button
                        className="load-button"
                        onClick={() => loadList(list)}
                        title="Load this list"
                      >
                        📂 Load
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteList(list.id)}
                        title="Delete this list"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="list-info">
                    <p className="word-count">{list.words.length} words</p>
                    <p className="list-date">
                      {new Date(list.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="list-preview">
                    {list.words.slice(0, 5).map((word, idx) => (
                      <span key={idx} className="preview-word">{word}</span>
                    ))}
                    {list.words.length > 5 && (
                      <span className="preview-more">+{list.words.length - 5} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="word-matching-page">
      <div className="word-input-section">
        <div className="section-header">
          <button className="back-button" onClick={handleBackToLists}>
            ← Back to Lists
          </button>
          <h2>🔗 Create Word List</h2>
          {englishWords.length > 0 && (
            <button
              className="save-list-button"
              onClick={() => setShowSaveDialog(true)}
            >
              💾 Save List
            </button>
          )}
        </div>
        <h2>🔗 Word Matching Game Setup</h2>
        <p>Enter English words (one at a time). We'll translate them to Hebrew automatically!</p>
        
        <div className="input-container">
          <div className="input-group">
            <label>English Word:</label>
            <input
              type="text"
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type an English word and press Enter"
              autoFocus
            />
          </div>
          <button className="add-button" onClick={handleAddWord}>
            ➕ Add Word
          </button>
        </div>

        {englishWords.length > 0 && (
          <div className="words-list-preview">
            <h3>Words Added ({englishWords.length}):</h3>
            <div className="words-preview">
              {englishWords.map((word, index) => (
                <div key={index} className="word-preview">
                  <span className="preview-english">{word}</span>
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveWord(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="action-buttons">
              <button className="start-button" onClick={handleStartGame}>
                🎮 Start Game
              </button>
              <button className="clear-button" onClick={handleClearAll}>
                🗑️ Clear All
              </button>
            </div>
          </div>
        )}

        {englishWords.length === 0 && (
          <div className="help-text">
            <p>💡 Tip: Add words like: cat, dog, house, car, book, etc.</p>
            <p>After adding all words, click "Start Game" to begin matching!</p>
            <p>💾 Don't forget to save your list so you can use it again later!</p>
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="save-dialog-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="save-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>💾 Save Word List</h3>
            <p>Give your list a name:</p>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g., Animals, Colors, My Words..."
              onKeyPress={(e) => e.key === 'Enter' && saveList()}
              autoFocus
            />
            <div className="dialog-buttons">
              <button className="cancel-button" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </button>
              <button
                className="confirm-save-button"
                onClick={saveList}
                disabled={!listName.trim()}
              >
                💾 Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Translation Input Section */}
      {missingTranslations.length > 0 && !gameStarted && (
        <div className="translation-input-section">
          <h3>⚠️ Some words need translation</h3>
          <p>Please provide Hebrew translations for these words:</p>
          <div className="translation-inputs">
            {missingTranslations.map(([english]) => (
              <div key={english} className="translation-input-group">
                <label>{english}:</label>
                <input
                  type="text"
                  value={translationInputs[english] || ''}
                  onChange={(e) => handleTranslationInput(english, e.target.value)}
                  placeholder="Enter Hebrew translation"
                  onKeyPress={(e) => e.key === 'Enter' && handleConfirmTranslations()}
                />
              </div>
            ))}
          </div>
          <button className="confirm-button" onClick={handleConfirmTranslations}>
            ✓ Confirm Translations & Start Game
          </button>
        </div>
      )}
    </div>
  );
};

export default WordMatchingGamePage;
