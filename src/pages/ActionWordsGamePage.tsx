import React from 'react';
import ActionWordsGame from '../components/games/ActionWordsGame';
import './ActionWordsGamePage.css';

const ActionWordsGamePage: React.FC = () => {
  return (
    <div className="action-words-game-page">
      <ActionWordsGame />
    </div>
  );
};

export default ActionWordsGamePage;

