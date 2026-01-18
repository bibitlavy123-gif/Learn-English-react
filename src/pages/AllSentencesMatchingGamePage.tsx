import React, { useState, useEffect } from 'react';
import SentenceMatchingGame from '../components/games/SentenceMatchingGame';
import './AllSentencesMatchingGamePage.css';
import { VOCABULARY_LISTS, ALL_WORD_PAIRS } from './WordMatchingGamePage';

// More comprehensive sentence templates for building proper sentences
const SENTENCE_TEMPLATES = [
  { template: 'I like {word}', hebrewTemplate: 'אני אוהב {word}' },
  { template: 'I have {word}', hebrewTemplate: 'יש לי {word}' },
  { template: 'This is {word}', hebrewTemplate: 'זה {word}' },
  { template: 'I want {word}', hebrewTemplate: 'אני רוצה {word}' },
  { template: 'I see {word}', hebrewTemplate: 'אני רואה {word}' },
  { template: 'I need {word}', hebrewTemplate: 'אני צריך {word}' },
  { template: 'I love {word}', hebrewTemplate: 'אני אוהב {word}' },
  { template: 'Where is {word}?', hebrewTemplate: 'איפה {word}?' },
  { template: 'What is {word}?', hebrewTemplate: 'מה זה {word}?' },
  { template: 'I go to {word}', hebrewTemplate: 'אני הולך ל{word}' },
  { template: 'I eat {word}', hebrewTemplate: 'אני אוכל {word}' },
  { template: 'I drink {word}', hebrewTemplate: 'אני שותה {word}' },
  { template: 'I play with {word}', hebrewTemplate: 'אני משחק עם {word}' },
  { template: 'I buy {word}', hebrewTemplate: 'אני קונה {word}' },
  { template: 'I read {word}', hebrewTemplate: 'אני קורא {word}' },
  { template: 'I write {word}', hebrewTemplate: 'אני כותב {word}' },
  { template: 'I listen to {word}', hebrewTemplate: 'אני מאזין ל{word}' },
  { template: 'I watch {word}', hebrewTemplate: 'אני צופה ב{word}' },
  { template: 'I think about {word}', hebrewTemplate: 'אני חושב על {word}' },
  { template: 'I talk about {word}', hebrewTemplate: 'אני מדבר על {word}' },
];

const AllSentencesMatchingGamePage: React.FC = () => {
  const [allSentences, setAllSentences] = useState<Array<[string, string]>>([]);
  const [currentSentenceSet, setCurrentSentenceSet] = useState<Array<[string, string]>>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [totalSets, setTotalSets] = useState(0);

  useEffect(() => {
    generateAllSentences();
  }, []);

  const generateAllSentences = () => {
    // Collect all words from all vocabulary lists
    const allWords: Array<[string, string]> = [...ALL_WORD_PAIRS];

    // Generate sentences using templates
    const sentences: Array<[string, string]> = [];
    
    // Filter words that work well in sentences
    const usableWords = allWords.filter(([english]) => {
      return !english.includes('...') && 
             !english.includes('[') && 
             english.length <= 30 &&
             !english.includes('?') &&
             !english.includes('!');
    });

    // Shuffle words for variety
    const shuffledWords = [...usableWords].sort(() => Math.random() - 0.5);

    // Generate sentences - use more words to create more sentences
    shuffledWords.forEach(([english, hebrew]) => {
      // Pick a random template
      const template = SENTENCE_TEMPLATES[Math.floor(Math.random() * SENTENCE_TEMPLATES.length)];
      
      const englishSentence = template.template.replace('{word}', english);
      let hebrewSentence = template.hebrewTemplate.replace('{word}', hebrew);
      
      // Clean up Hebrew sentence
      hebrewSentence = hebrewSentence.trim();
      
      sentences.push([englishSentence, hebrewSentence]);
    });

    // Remove duplicates
    const uniqueSentences = Array.from(
      new Map(sentences.map(s => [s[0], s])).values()
    );

    setAllSentences(uniqueSentences);
    
    // Split into sets of 8
    const sets: Array<Array<[string, string]>> = [];
    for (let i = 0; i < uniqueSentences.length; i += 8) {
      sets.push(uniqueSentences.slice(i, i + 8));
    }
    
    setTotalSets(sets.length);
    if (sets.length > 0) {
      setCurrentSentenceSet(sets[0]);
      setCurrentSetIndex(0);
    }
  };

  const handleNextSet = () => {
    // Split all sentences into sets of 8
    const sets: Array<Array<[string, string]>> = [];
    for (let i = 0; i < allSentences.length; i += 8) {
      sets.push(allSentences.slice(i, i + 8));
    }

    const nextIndex = currentSetIndex + 1;
    if (nextIndex < sets.length) {
      setCurrentSentenceSet(sets[nextIndex]);
      setCurrentSetIndex(nextIndex);
      setGameStarted(true);
    }
  };

  const handleStartGame = () => {
    if (currentSentenceSet.length > 0) {
      setGameStarted(true);
    }
  };

  const handleBackToSetup = () => {
    setGameStarted(false);
  };

  // Split sentences into sets for display
  const sentenceSets: Array<Array<[string, string]>> = [];
  for (let i = 0; i < allSentences.length; i += 8) {
    sentenceSets.push(allSentences.slice(i, i + 8));
  }

  if (gameStarted && currentSentenceSet.length > 0) {
    const hasNextSet = currentSetIndex + 1 < sentenceSets.length;
    return (
      <div className="all-sentences-matching-page">
        <button className="back-to-setup-button" onClick={handleBackToSetup}>
          ← Back to Setup
        </button>
        <div className="set-indicator">
          Set {currentSetIndex + 1} of {totalSets} ({currentSentenceSet.length} sentences)
        </div>
        <SentenceMatchingGame 
          sentences={currentSentenceSet} 
          onNextSentences={hasNextSet ? handleNextSet : undefined}
        />
      </div>
    );
  }

  return (
    <div className="all-sentences-matching-page">
      <div className="setup-view">
        <h2>📚 All Sentences Matching Game</h2>
        <p className="setup-description">
          This game uses ALL words from ALL vocabulary lists to create sentences. 
          You'll practice with 8 sentences at a time, and can move to the next set when you finish.
        </p>

        {allSentences.length > 0 ? (
          <div className="game-info">
            <div className="info-card">
              <h3>📊 Game Statistics</h3>
              <p><strong>Total Sentences:</strong> {allSentences.length}</p>
              <p><strong>Total Sets:</strong> {totalSets} (8 sentences each)</p>
              <p><strong>Words Used:</strong> All words from all vocabulary lists</p>
            </div>

            <div className="sentence-sets-preview">
              <h3>Sentence Sets Preview</h3>
              <div className="sets-grid">
                {sentenceSets.map((set, index) => (
                  <div
                    key={index}
                    className={`set-card ${index === currentSetIndex ? 'current' : ''}`}
                    onClick={() => {
                      setCurrentSentenceSet(set);
                      setCurrentSetIndex(index);
                    }}
                  >
                    <div className="set-number">Set {index + 1}</div>
                    <div className="set-count">{set.length} sentences</div>
                    <div className="set-preview">
                      {set.slice(0, 2).map(([eng], idx) => (
                        <div key={idx} className="preview-sentence">{eng}</div>
                      ))}
                      {set.length > 2 && <div className="more-sentences">+{set.length - 2} more</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="setup-actions">
              <button
                className="start-game-button"
                onClick={handleStartGame}
                disabled={currentSentenceSet.length === 0}
              >
                🎮 Start with Set {currentSetIndex + 1}
              </button>
            </div>
          </div>
        ) : (
          <div className="loading-message">
            <p>Generating sentences from all vocabulary lists...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSentencesMatchingGamePage;

