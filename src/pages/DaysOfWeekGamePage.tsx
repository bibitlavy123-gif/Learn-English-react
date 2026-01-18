import React from 'react';
import DaysOfWeekGame from '../components/games/DaysOfWeekGame';
import './DaysOfWeekGamePage.css';

const DaysOfWeekGamePage: React.FC = () => {
  return (
    <div className="days-of-week-game-page">
      <DaysOfWeekGame />
    </div>
  );
};

export default DaysOfWeekGamePage;

