import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ColorBottleGamePage from './pages/ColorBottleGamePage';
import ColorDrumGamePage from './pages/ColorDrumGamePage';
import AnimalCaveGamePage from './pages/AnimalCaveGamePage';
import ReadingGamePage from './pages/ReadingGamePage';
import WordMatchingGamePage from './pages/WordMatchingGamePage';
import SentenceMatchingGamePage from './pages/SentenceMatchingGamePage';
import AllSentencesMatchingGamePage from './pages/AllSentencesMatchingGamePage';
import DaysOfWeekGamePage from './pages/DaysOfWeekGamePage';
import ActionWordsGamePage from './pages/ActionWordsGamePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<GameMenu />} />
          <Route path="/color-bottle-game" element={<ColorBottleGamePage />} />
          <Route path="/color-drum-game" element={<ColorDrumGamePage />} />
          <Route path="/animal-cave-game" element={<AnimalCaveGamePage />} />
          <Route path="/reading-game" element={<ReadingGamePage />} />
          <Route path="/word-matching-game" element={<WordMatchingGamePage />} />
          <Route path="/sentence-matching-game" element={<SentenceMatchingGamePage />} />
          <Route path="/all-sentences-matching-game" element={<AllSentencesMatchingGamePage />} />
          <Route path="/days-of-week-game" element={<DaysOfWeekGamePage />} />
          <Route path="/action-words-game" element={<ActionWordsGamePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const GameMenu: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '40px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
        🎮 Learning Games
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', width: '100%' }}>
        <a
          href="/color-bottle-game"
          style={{
            padding: '20px 40px',
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'rgba(255,255,255,0.9)',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
        >
          🎨 Color Bottle Game
        </a>
        <a
          href="/color-drum-game"
          style={{
            padding: '20px 40px',
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'rgba(255,255,255,0.9)',
            color: '#ff6b6b',
            textDecoration: 'none',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
        >
          🥁 Color Drum Game
        </a>
        <a
          href="/animal-cave-game"
          style={{
            padding: '20px 40px',
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'rgba(255,255,255,0.9)',
            color: '#2d5016',
            textDecoration: 'none',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
        >
          🦁 Animal Cave Game
        </a>
        <a
          href="/reading-game"
          style={{
            padding: '20px 40px',
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'rgba(255,255,255,0.9)',
            color: '#4facfe',
            textDecoration: 'none',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
        >
          📖 Reading Game
        </a>
        <a
          href="/word-matching-game"
          style={{
            padding: '20px 40px',
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'rgba(255,255,255,0.9)',
            color: '#f5576c',
            textDecoration: 'none',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
        >
          🔗 Word Matching Game
        </a>
        <a
          href="/sentence-matching-game"
          style={{
            padding: '20px 40px',
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'rgba(255,255,255,0.9)',
            color: '#764ba2',
            textDecoration: 'none',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
        >
          📝 Sentence Matching Game
        </a>
        <a
          href="/all-sentences-matching-game"
          style={{
            padding: '20px 40px',
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'rgba(255,255,255,0.9)',
            color: '#9b59b6',
            textDecoration: 'none',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
        >
          📚 All Sentences Matching Game
        </a>
        <a
          href="/days-of-week-game"
          style={{
            padding: '20px 40px',
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'rgba(255,255,255,0.9)',
            color: '#f093fb',
            textDecoration: 'none',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
        >
          📅 Days of the Week
        </a>
        <a
          href="/action-words-game"
          style={{
            padding: '20px 40px',
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'rgba(255,255,255,0.9)',
            color: '#2d5016',
            textDecoration: 'none',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
        >
          🌲 Action Words in the Forest
        </a>
      </div>
    </div>
  );
};

export default App;

