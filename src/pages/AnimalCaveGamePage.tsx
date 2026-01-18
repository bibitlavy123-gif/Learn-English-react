import React from 'react';
import AnimalCaveGame from '../components/games/AnimalCaveGame';
import './AnimalCaveGamePage.css';

const AnimalCaveGamePage: React.FC = () => {
  return (
    <div className="animal-cave-game-page">
      <AnimalCaveGame />
    </div>
  );
};

export default AnimalCaveGamePage;

