import React, { useState, useEffect } from 'react';
import { audioService } from '../../services/audioService';
import './ColorBottleGame.css';

interface ColorBottle {
  id: number;
  colors: string[]; // Array of color values (e.g., ['#FF0000', '#FFA500'] for red and orange)
  colorNames: string[]; // Array of color names
  placedColors: boolean[]; // Track which colors have been placed (same length as colors)
}

interface TargetBottle {
  id: number;
  colorName: string;
  colorValue: string;
  placedColors: string[]; // Colors that were placed in this bottle (max 2)
}

const ALL_COLORS = [
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#000080' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Green', value: '#008000' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Purple', value: '#800080' },
  { name: 'Pink', value: '#FF1493' },
  { name: 'Brown', value: '#A52A2A' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Gray', value: '#808080' },
  { name: 'Beige', value: '#F5F5DC' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Gold', value: '#DAA520' },
  { name: 'Silver', value: '#C9C9C9' },
];

interface ColorNameItem {
  id: number;
  name: string;
  matched: boolean;
}

interface ColorPictureItem {
  id: number;
  colorName: string;
  colorValue: string;
  matched: boolean;
}

const ColorBottleGame: React.FC = () => {
  const [targetBottles, setTargetBottles] = useState<TargetBottle[]>([]);
  const [colorBottles, setColorBottles] = useState<ColorBottle[]>([]);
  const [selectedBottle, setSelectedBottle] = useState<ColorBottle | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  
  // Step 2 states
  const [step2Active, setStep2Active] = useState(false);
  const [colorNames, setColorNames] = useState<ColorNameItem[]>([]);
  const [colorPictures, setColorPictures] = useState<ColorPictureItem[]>([]);
  const [draggedColorName, setDraggedColorName] = useState<ColorNameItem | null>(null);
  const [dragOverPicture, setDragOverPicture] = useState<number | null>(null);
  const [step2Complete, setStep2Complete] = useState(false);

  useEffect(() => {
    // Initialize color bottles only once on mount if they don't exist
    if (colorBottles.length === 0) {
      // Use all colors instead of selecting 8 random ones
      const selectedColors = [...ALL_COLORS];
      
      // Create color bottles (right side) - each contains 1 color
      // We need 28 bottles total (2 of each color) to fill 14 target bottles with 2 colors each
      const newColorBottles: ColorBottle[] = [];
      
      // Create 2 bottles for each color
      selectedColors.forEach((color, colorIndex) => {
        for (let i = 0; i < 2; i++) {
          newColorBottles.push({
            id: colorIndex * 2 + i,
            colors: [color.value],
            colorNames: [color.name],
            placedColors: [false], // Track if the color is still in the bottle
          });
        }
      });

      // Shuffle the color bottles
      const shuffledBottles = newColorBottles.sort(() => Math.random() - 0.5);
      setColorBottles(shuffledBottles);
      
      // Initialize target bottles based on all colors (one for each color)
      // Only if target bottles don't exist yet
      if (targetBottles.length === 0) {
        const newTargetBottles: TargetBottle[] = selectedColors.map((color, index) => ({
          id: index,
          colorName: color.name,
          colorValue: color.value,
          placedColors: [],
        }));
        setTargetBottles(newTargetBottles);
      }
    } else {
      // If color bottles exist but target bottles don't, create target bottles for EXACTLY the colors that exist in color bottles
      // Don't reset if target bottles already exist (they might have colors in them)
      if (targetBottles.length === 0) {
        initializeTargetBottlesFromColorBottles();
      }
    }
    setGameComplete(false);
    setScore(0);
  }, []);

  const initializeTargetBottlesFromColorBottles = () => {
    // Get all unique colors from color bottles (by name and value)
    const colorMap = new Map<string, string>(); // name -> value
    colorBottles.forEach(bottle => {
      const colorName = bottle.colorNames[0];
      const colorValue = bottle.colors[0];
      if (!colorMap.has(colorName)) {
        colorMap.set(colorName, colorValue);
      }
    });
    
    // Create target bottles for each unique color found in color bottles
    const newTargetBottles: TargetBottle[] = Array.from(colorMap.entries()).map(([name, value], index) => ({
      id: index,
      colorName: name,
      colorValue: value,
      placedColors: [],
    }));
    
    setTargetBottles(newTargetBottles);
  };

  const initializeGame = () => {
    // Only reset target bottles, keep color bottles the same
    // Ensure target bottles match exactly the colors in color bottles
    initializeTargetBottlesFromColorBottles();
    setGameComplete(false);
    setScore(0);
  };

  const resetGameCompletely = () => {
    // Fully reset the game with all colors
    const selectedColors = [...ALL_COLORS];
    
    // Create new color bottles (right side) - each contains 1 color
    // We need 28 bottles total (2 of each color) to fill 14 target bottles with 2 colors each
    const newColorBottles: ColorBottle[] = [];
    
    // Create 2 bottles for each color
    selectedColors.forEach((color, colorIndex) => {
      for (let i = 0; i < 2; i++) {
        newColorBottles.push({
          id: colorIndex * 2 + i,
          colors: [color.value],
          colorNames: [color.name],
          placedColors: [false], // Track if the color is still in the bottle
        });
      }
    });

    // Shuffle the color bottles
    const shuffledBottles = newColorBottles.sort(() => Math.random() - 0.5);
    setColorBottles(shuffledBottles);
    
    // Create target bottles based on all colors
    const newTargetBottles: TargetBottle[] = selectedColors.map((color, index) => ({
      id: index,
      colorName: color.name,
      colorValue: color.value,
      placedColors: [],
    }));
    setTargetBottles(newTargetBottles);
    setGameComplete(false);
    setScore(0);
    setSelectedBottle(null);
    // Reset step 2 states
    setStep2Active(false);
    setStep2Complete(false);
    setColorNames([]);
    setColorPictures([]);
  };

  const handleColorNameClick = (colorName: string) => {
    audioService.speakText(colorName);
  };

  const handleBottleClick = (bottle: ColorBottle) => {
    // Check if bottle has any unplaced colors
    const hasUnplacedColors = bottle.placedColors.some(placed => !placed);
    if (!hasUnplacedColors) return;
    
    setSelectedBottle(bottle);
    // Say the colors in the bottle when selecting
    const unplacedColors = bottle.colorNames.filter((_, idx) => !bottle.placedColors[idx]);
    const colorsText = unplacedColors.join(' and ');
    audioService.speakText(colorsText);
  };

  const handleTargetBottleClick = (targetBottle: TargetBottle) => {
    if (!selectedBottle) return;

    // Find if the selected bottle has a color that matches the target
    const matchingColorIndex = selectedBottle.colorNames.findIndex(
      (name, idx) => name === targetBottle.colorName && !selectedBottle.placedColors[idx]
    );

    if (matchingColorIndex !== -1) {
      // Check if target bottle already has 2 colors
      if (targetBottle.placedColors.length >= 2) {
        audioService.speakText('Bottle is full');
        setSelectedBottle(null);
        return;
      }

      // Correct match! Pour the matching color from the bottle
      const matchingColor = selectedBottle.colors[matchingColorIndex];
      
      // Update target bottles
      setTargetBottles(prev => prev.map(b =>
        b.id === targetBottle.id
          ? { ...b, placedColors: [...b.placedColors, matchingColor] }
          : b
      ));

      // Update color bottles (remove color from source bottle)
      setColorBottles(prev => prev.map(bottle =>
        bottle.id === selectedBottle.id
          ? {
              ...bottle,
              placedColors: bottle.placedColors.map((placed, idx) =>
                idx === matchingColorIndex ? true : placed
              ),
            }
          : bottle
      ));

      // Update score
      setScore(prev => prev + 10);
      
      // Don't say "Correct!" - only say something when incorrect
      setSelectedBottle(null);
    } else {
      // Wrong match - no matching color in the bottle
      audioService.speakText('Incorrect answer');
    }
  };

  useEffect(() => {
    // Check if all color bottles are empty (all colors have been poured)
    const allBottlesEmpty = colorBottles.length > 0 && colorBottles.every(bottle => 
      bottle.placedColors.every(placed => placed)
    );

    if (allBottlesEmpty && !gameComplete && !step2Active) {
      setGameComplete(true);
      audioService.speakText('Congratulations! You finished successfully! All bottles are empty! Now let\'s match color names to colors!');
      // Start step 2 after a short delay
      setTimeout(() => {
        initializeStep2();
      }, 2000);
    }
  }, [colorBottles, gameComplete, step2Active]);

  const initializeStep2WithColors = (colors: typeof ALL_COLORS) => {
    // Shuffle the colors
    const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
    
    // Create color name items (left side)
    const names: ColorNameItem[] = shuffledColors.map((color, index) => ({
      id: index,
      name: color.name,
      matched: false,
    }));
    
    // Create color picture items (right side)
    const pictures: ColorPictureItem[] = shuffledColors.map((color, index) => ({
      id: index,
      colorName: color.name,
      colorValue: color.value,
      matched: false,
    }));
    
    setColorNames(names);
    setColorPictures(pictures);
    setStep2Active(true);
    setGameComplete(false); // Hide the win screen
  };

  const initializeStep2 = () => {
    // Get unique colors from the completed game
    const uniqueColorNames = Array.from(new Set(colorBottles.map(b => b.colorNames[0])));
    const step2Colors = ALL_COLORS.filter(c => uniqueColorNames.includes(c.name));
    initializeStep2WithColors(step2Colors);
  };

  const handleColorNameDragStart = (e: React.DragEvent, colorName: ColorNameItem) => {
    if (colorName.matched) return;
    setDraggedColorName(colorName);
    e.dataTransfer.effectAllowed = 'move';
    audioService.speakText(colorName.name);
  };

  const handleColorNameDragEnd = () => {
    setDraggedColorName(null);
    setDragOverPicture(null);
  };

  const handlePictureDragOver = (e: React.DragEvent, pictureId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPicture(pictureId);
  };

  const handlePictureDragLeave = () => {
    setDragOverPicture(null);
  };

  const handlePictureDrop = (e: React.DragEvent, picture: ColorPictureItem) => {
    e.preventDefault();
    
    if (!draggedColorName || picture.matched) return;

    if (draggedColorName.name === picture.colorName) {
      // Correct match!
      setColorNames(prev => prev.map(item =>
        item.id === draggedColorName.id ? { ...item, matched: true } : item
      ));
      setColorPictures(prev => prev.map(item =>
        item.id === picture.id ? { ...item, matched: true } : item
      ));
      setScore(prev => prev + 10);
      // Don't say "Correct!" - only say something when incorrect
    } else {
      // Incorrect match
      audioService.speakText('Incorrect answer');
    }

    setDraggedColorName(null);
    setDragOverPicture(null);
  };

  useEffect(() => {
    // Check if step 2 is complete
    if (step2Active && colorNames.length > 0) {
      const allMatched = colorNames.every(name => name.matched) && 
                         colorPictures.every(pic => pic.matched);
      if (allMatched && !step2Complete) {
        setStep2Complete(true);
        audioService.speakText('Excellent! You matched all the colors correctly!');
      }
    }
  }, [colorNames, colorPictures, step2Active, step2Complete]);

  // If step 2 is active, show step 2 UI
  if (step2Active) {
    return (
      <div className="color-bottle-game">
        <div className="game-header">
          <h2>🎨 Step 2: Match Color Names to Colors</h2>
          <div className="score">Score: {score}</div>
        </div>

        <div className="step2-container">
          {/* Color Names Section (Left) */}
          <div className="color-names-section">
            <h3>Color Names</h3>
            <div className="color-names-grid">
              {colorNames.map(colorName => (
                <div
                  key={colorName.id}
                  className={`color-name-item ${colorName.matched ? 'matched' : ''}`}
                  draggable={!colorName.matched}
                  onDragStart={(e) => handleColorNameDragStart(e, colorName)}
                  onDragEnd={handleColorNameDragEnd}
                  onClick={() => !colorName.matched && audioService.speakText(colorName.name)}
                >
                  {colorName.name}
                  {colorName.matched && <span className="check-icon">✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Color Pictures Section (Right) */}
          <div className="color-pictures-section">
            <h3>Color Pictures</h3>
            <div className="color-pictures-grid">
              {colorPictures.map(picture => (
                <div
                  key={picture.id}
                  className={`color-picture-item ${picture.matched ? 'matched' : ''} ${dragOverPicture === picture.id ? 'drag-over' : ''}`}
                  onDragOver={(e) => handlePictureDragOver(e, picture.id)}
                  onDragLeave={handlePictureDragLeave}
                  onDrop={(e) => handlePictureDrop(e, picture)}
                >
                  <div
                    className="color-picture"
                    style={{ backgroundColor: picture.colorValue }}
                  />
                  {picture.matched && <span className="check-icon">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {step2Complete && (
          <div className="win-screen">
            <div className="trophy">🏆</div>
            <h2>Excellent Work!</h2>
            <p>You matched all the colors correctly!</p>
            <p className="final-score">Final Score: {score}</p>
            <button className="play-again-button" onClick={() => {
              setStep2Active(false);
              setStep2Complete(false);
              resetGameCompletely();
            }}>
              🎮 Play Again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="color-bottle-game">
      <div className="game-header">
        <h2>🎨 Color Bottle Game</h2>
        <div className="score">Score: {score}</div>
        <div className="header-buttons">
          <button className="skip-button" onClick={() => {
            // Use colors from target bottles if they exist, otherwise use random colors
            if (targetBottles.length > 0) {
              const colors = targetBottles.map(tb => ALL_COLORS.find(c => c.name === tb.colorName)).filter(Boolean) as typeof ALL_COLORS;
              initializeStep2WithColors(colors);
            } else {
              // If no target bottles, use all colors
              initializeStep2WithColors([...ALL_COLORS]);
            }
          }}>
            ⏭️ Skip to Step 2
          </button>
          <button className="reset-button" onClick={initializeGame}>
            🔄 Reset Game
          </button>
        </div>
      </div>

      <div className="game-container">
        {/* Target Bottles Section (Left) */}
        <div className="target-bottles-section">
          <h3>Match the Colors</h3>
          <div className="target-bottles-grid">
            {targetBottles.map(targetBottle => (
              <div
                key={targetBottle.id}
                className={`target-bottle-container ${selectedBottle ? 'ready-for-selection' : ''}`}
                onClick={() => handleTargetBottleClick(targetBottle)}
              >
                <div className={`target-bottle ${targetBottle.placedColors.length === 2 ? 'bottle-complete' : ''}`}>
                  <div className="bottle-neck"></div>
                  <div className="bottle-body">
                    {targetBottle.placedColors.map((color, index) => (
                      <div
                        key={index}
                        className="color-layer"
                        style={{
                          backgroundColor: color,
                          bottom: `${index * 50}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div 
                  className="color-name-label"
                  onClick={() => handleColorNameClick(targetBottle.colorName)}
                >
                  {targetBottle.colorName}
                </div>
                {targetBottle.placedColors.length === 2 && (
                  <div className="star">⭐</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Color Bottles Section (Right) */}
        <div className="color-bottles-section">
          <h3>Colored Bottles</h3>
          <div className="color-bottles-grid">
            {colorBottles
              .filter(bottle => bottle.placedColors.some(placed => !placed)) // Only show bottles that still have colors
              .map(bottle => {
                const hasUnplacedColors = bottle.placedColors.some(placed => !placed);
                return (
                  <div
                    key={bottle.id}
                    className={`color-bottle-wrapper ${selectedBottle?.id === bottle.id ? 'selected' : ''}`}
                    onClick={() => handleBottleClick(bottle)}
                  >
                    <div className="color-bottle">
                      <div className="bottle-neck"></div>
                      <div className="bottle-body">
                        {bottle.colors.map((color, index) => {
                          const isPlaced = bottle.placedColors[index];
                          return (
                            <div
                              key={index}
                              className={`color-layer ${isPlaced ? 'color-placed' : ''}`}
                              style={{
                                backgroundColor: color,
                                bottom: `${index * 50}px`,
                                opacity: isPlaced ? 0.3 : 1,
                              }}
                              title={bottle.colorNames[index]}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Win Screen */}
      {gameComplete && (
        <div className="win-screen">
          <div className="trophy">🏆</div>
          <h2>Congratulations!</h2>
          <p>You matched all the colors correctly!</p>
          <p className="final-score">Final Score: {score}</p>
          <button className="play-again-button" onClick={resetGameCompletely}>
            🎮 Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorBottleGame;
