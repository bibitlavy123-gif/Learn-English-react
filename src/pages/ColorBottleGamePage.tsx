import React from 'react';
import ColorBottleGame from '../components/games/ColorBottleGame';
import './ColorBottleGamePage.css';

const ColorBottleGamePage: React.FC = () => {
  return (
    <div className="color-bottle-game-page">
      <ColorBottleGame />
    </div>
  );
};

export default ColorBottleGamePage;

