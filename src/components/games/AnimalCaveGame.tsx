import React, { useState, useEffect } from 'react';
import { audioService } from '../../services/audioService';
import './AnimalCaveGame.css';

interface Animal {
  id: number;
  name: string;
  emoji: string;
  isPlaced: boolean;
}

interface Cave {
  id: number;
  animalName: string;
  animals: Animal[];
  isComplete: boolean;
}

const ANIMALS = [
  { name: 'Dog', emoji: '🐶' },
  { name: 'Cat', emoji: '🐱' },
  { name: 'Horse', emoji: '🐴' },
  { name: 'Cow', emoji: '🐮' },
  { name: 'Sheep', emoji: '🐑' },
  { name: 'Goat', emoji: '🐐' },
  { name: 'Pig', emoji: '🐷' },
  { name: 'Chicken', emoji: '🐔' },
  { name: 'Duck', emoji: '🦆' },
  { name: 'Rabbit', emoji: '🐰' },
  { name: 'Lion', emoji: '🦁' },
  { name: 'Tiger', emoji: '🐯' },
  { name: 'Elephant', emoji: '🐘' },
  { name: 'Giraffe', emoji: '🦒' },
  { name: 'Zebra', emoji: '🦓' },
  { name: 'Bear', emoji: '🐻' },
  { name: 'Wolf', emoji: '🐺' },
  { name: 'Fox', emoji: '🦊' },
  { name: 'Deer', emoji: '🦌' },
  { name: 'Monkey', emoji: '🐵' },
  { name: 'Gorilla', emoji: '🦍' },
  { name: 'Kangaroo', emoji: '🦘' },
  { name: 'Panda', emoji: '🐼' },
  { name: 'Dolphin', emoji: '🐬' },
  { name: 'Whale', emoji: '🐋' },
  { name: 'Shark', emoji: '🦈' },
  { name: 'Fish', emoji: '🐟' },
  { name: 'Turtle', emoji: '🐢' },
  { name: 'Snake', emoji: '🐍' },
  { name: 'Frog', emoji: '🐸' },
  { name: 'Eagle', emoji: '🦅' },
  { name: 'Owl', emoji: '🦉' },
  { name: 'Parrot', emoji: '🦜' },
  { name: 'Penguin', emoji: '🐧' },
  { name: 'Seal', emoji: '🦭' },
  { name: 'Crocodile', emoji: '🐊' },
  { name: 'Hippopotamus', emoji: '🦛' },
  { name: 'Rhinoceros', emoji: '🦏' },
  { name: 'Leopard', emoji: '🐆' },
  { name: 'Cheetah', emoji: '🐆' },
  { name: 'Camel', emoji: '🐫' },
  { name: 'Donkey', emoji: '🫏' },
  { name: 'Squirrel', emoji: '🐿️' },
  { name: 'Mouse', emoji: '🐭' },
  { name: 'Rat', emoji: '🐀' },
  { name: 'Bat', emoji: '🦇' },
  { name: 'Bee', emoji: '🐝' },
  { name: 'Butterfly', emoji: '🦋' },
  { name: 'Ant', emoji: '🐜' },
];

const AnimalCaveGame: React.FC = () => {
  const [caves, setCaves] = useState<Cave[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Select 8 random animals
    const selectedAnimals = [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, 8);
    
    // Create caves
    const newCaves: Cave[] = selectedAnimals.map((animal, index) => ({
      id: index,
      animalName: animal.name,
      animals: [],
      isComplete: false,
    }));

    // Create animal instances (1 of each)
    const newAnimals: Animal[] = selectedAnimals.map((animal, index) => ({
      id: index,
      name: animal.name,
      emoji: animal.emoji,
      isPlaced: false,
    }));

    // Shuffle animals
    const shuffledAnimals = newAnimals.sort(() => Math.random() - 0.5);

    setCaves(newCaves);
    setAnimals(shuffledAnimals);
    setGameComplete(false);
    setScore(0);
    setSelectedAnimal(null);
  };

  const handleCaveLabelClick = (e: React.MouseEvent, animalName: string) => {
    e.stopPropagation();
    audioService.speakText(animalName);
  };

  const handleCaveClick = (cave: Cave) => {
    if (!selectedAnimal || selectedAnimal.isPlaced) return;

    // Check if animal matches cave
    if (selectedAnimal.name === cave.animalName) {
      // Correct match!
      setAnimals(prev => prev.map(animal =>
        animal.id === selectedAnimal.id ? { ...animal, isPlaced: true } : animal
      ));

      setCaves(prev => prev.map(c =>
        c.id === cave.id
          ? {
              ...c,
              animals: [...c.animals, { ...selectedAnimal, isPlaced: true }],
              isComplete: true,
            }
          : c
      ));

      setScore(prev => prev + 10);
      setSelectedAnimal(null);
      // No audio for correct matches
    } else {
      // Wrong match
      audioService.speakText('Incorrect answer');
      setSelectedAnimal(null);
    }
  };

  const handleAnimalClick = (animal: Animal) => {
    if (animal.isPlaced) return;
    
    // Select the animal and speak its name
    setSelectedAnimal(animal);
    audioService.speakText(animal.name);
  };

  useEffect(() => {
    // Check if game is complete (only if we have animals and caves)
    if (animals.length === 0 || caves.length === 0) return;
    
    const allAnimalsPlaced = animals.every(animal => animal.isPlaced);
    const allCavesComplete = caves.every(cave => cave.animals.length === 1);

    if (allAnimalsPlaced && allCavesComplete && !gameComplete) {
      setGameComplete(true);
      audioService.speakText('Congratulations! You won!');
    }
  }, [animals, caves, gameComplete]);

  return (
    <div className="animal-cave-game">
      <div className="game-header">
        <h2>🦁 Animal Cave Game</h2>
        <div className="score">Score: {score}</div>
        <button className="reset-button" onClick={initializeGame}>
          🔄 Reset Game
        </button>
      </div>

      <div className="game-instructions">
        <p>🎯 Click on an animal picture, then click on the matching word!</p>
        <p>🔊 Click on animal names to hear them</p>
      </div>

      <div className="game-container">
        {/* Caves Section */}
        <div className="caves-section">
          <h3>Caves</h3>
          <div className="caves-grid-8">
            {caves.map(cave => (
              <div
                key={cave.id}
                className="cave-container"
                onClick={() => handleCaveClick(cave)}
              >
                <div className="cave">
                  <div className="cave-entrance"></div>
                  <div className="cave-interior">
                    {cave.animals.map((animal, index) => (
                      <div
                        key={animal.id}
                        className="animal-in-cave"
                        title={animal.name}
                      >
                        <span className="animal-emoji-large">{animal.emoji}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div 
                  className="cave-label"
                  onClick={(e) => handleCaveLabelClick(e, cave.animalName)}
                >
                  {cave.animalName}
                </div>
                {cave.isComplete && (
                  <div className="cave-complete">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Animals Section */}
        <div className="animals-section">
          <h3>Animals</h3>
          <div className="animals-table">
            {animals.map(animal => (
              <div
                key={animal.id}
                className={`animal ${animal.isPlaced ? 'animal-placed' : ''} ${selectedAnimal?.id === animal.id ? 'selected' : ''}`}
                onClick={() => handleAnimalClick(animal)}
                title={animal.name}
              >
                <span className="animal-emoji">{animal.emoji}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Win Screen */}
      {gameComplete && (
        <div className="win-screen">
          <div className="trophy">🏆</div>
          <h2>Congratulations!</h2>
          <p>You matched all the animals correctly!</p>
          <p className="final-score">Final Score: {score}</p>
          <button className="play-again-button" onClick={initializeGame}>
            🎮 Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default AnimalCaveGame;

