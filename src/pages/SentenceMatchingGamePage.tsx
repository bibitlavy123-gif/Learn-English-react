import React, { useState, useEffect } from 'react';
import SentenceMatchingGame from '../components/games/SentenceMatchingGame';
import './SentenceMatchingGamePage.css';
import { VOCABULARY_LISTS } from './WordMatchingGamePage';

// Sentence templates that can use vocabulary words
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
];

const SentenceMatchingGamePage: React.FC = () => {
  const [selectedLists, setSelectedLists] = useState<Set<number>>(new Set());
  const [sentencePairs, setSentencePairs] = useState<Array<[string, string]>>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [availableLists, setAvailableLists] = useState(VOCABULARY_LISTS);

  const toggleListSelection = (listId: number) => {
    setSelectedLists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listId)) {
        newSet.delete(listId);
      } else {
        newSet.add(listId);
      }
      return newSet;
    });
  };

  const generateSentences = () => {
    if (selectedLists.size === 0) {
      alert('Please select at least one vocabulary list!');
      return;
    }

    // Collect all words from selected lists
    const allWords: Array<[string, string]> = [];
    selectedLists.forEach(listId => {
      const list = availableLists.find(l => l.id === listId);
      if (list) {
        allWords.push(...list.pairs);
      }
    });

    if (allWords.length === 0) {
      alert('No words found in selected lists!');
      return;
    }

    // Generate sentences using templates
    const sentences: Array<[string, string]> = [];
    const usedWords = new Set<string>();
    
    // Shuffle words to get different combinations each time
    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
    
    // Use up to 10 words to create sentences
    const wordsToUse = shuffledWords.slice(0, Math.min(10, shuffledWords.length));
    
    wordsToUse.forEach(([english, hebrew]) => {
      // Skip if word is too long or contains special characters that don't work well in sentences
      if (english.includes('...') || english.includes('[') || english.length > 30) {
        return;
      }

      // Pick a random template
      const template = SENTENCE_TEMPLATES[Math.floor(Math.random() * SENTENCE_TEMPLATES.length)];
      
      const englishSentence = template.template.replace('{word}', english);
      let hebrewSentence = template.hebrewTemplate.replace('{word}', hebrew);
      
      // Clean up Hebrew sentence (remove extra spaces, fix grammar if needed)
      hebrewSentence = hebrewSentence.trim();
      
      sentences.push([englishSentence, hebrewSentence]);
      usedWords.add(english);
    });

    if (sentences.length === 0) {
      alert('Could not generate sentences from selected lists. Try selecting different lists.');
      return;
    }

    setSentencePairs(sentences);
    setGameStarted(true);
  };

  const handleNextSentences = () => {
    // Generate new sentences from the same selected lists
    generateSentences();
  };

  const handleBackToSetup = () => {
    setGameStarted(false);
  };

  if (gameStarted && sentencePairs.length > 0) {
    return (
      <div className="sentence-matching-page">
        <button className="back-to-setup-button" onClick={handleBackToSetup}>
          ← Back to Setup
        </button>
        <SentenceMatchingGame 
          sentences={sentencePairs} 
          onNextSentences={handleNextSentences}
        />
      </div>
    );
  }

  return (
    <div className="sentence-matching-page">
      <div className="setup-view">
        <h2>📝 Sentence Matching Game Setup</h2>
        <p className="setup-description">
          Select vocabulary lists to generate sentences. The game will create sentences using words from your selected lists.
        </p>

        <div className="lists-selection">
          <h3>Select Vocabulary Lists:</h3>
          {availableLists.length === 0 ? (
            <p>Loading vocabulary lists...</p>
          ) : (
            <div className="lists-grid">
              {availableLists.map(list => (
                <div
                  key={list.id}
                  className={`list-card ${selectedLists.has(list.id) ? 'selected' : ''}`}
                  onClick={() => toggleListSelection(list.id)}
                >
                  <div className="list-checkbox">
                    {selectedLists.has(list.id) ? '✓' : ''}
                  </div>
                  <div className="list-info">
                    <h4>{list.name}</h4>
                    <p>{list.pairs.length} words</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="setup-actions">
          <div className="selected-count">
            {selectedLists.size > 0 ? (
              <p>✓ {selectedLists.size} list(s) selected</p>
            ) : (
              <p>No lists selected</p>
            )}
          </div>
          <button
            className="start-game-button"
            onClick={generateSentences}
            disabled={selectedLists.size === 0}
          >
            🎮 Generate Sentences & Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default SentenceMatchingGamePage;

