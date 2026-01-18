import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../services/audioService';
import './DaysOfWeekGame.css';

const DAYS_OF_WEEK = [
  { name: 'Sunday', number: 1 },
  { name: 'Monday', number: 2 },
  { name: 'Tuesday', number: 3 },
  { name: 'Wednesday', number: 4 },
  { name: 'Thursday', number: 5 },
  { name: 'Friday', number: 6 },
  { name: 'Saturday', number: 7 },
];

const MONTHS = [
  { name: 'January', number: 1 },
  { name: 'February', number: 2 },
  { name: 'March', number: 3 },
  { name: 'April', number: 4 },
  { name: 'May', number: 5 },
  { name: 'June', number: 6 },
  { name: 'July', number: 7 },
  { name: 'August', number: 8 },
  { name: 'September', number: 9 },
  { name: 'October', number: 10 },
  { name: 'November', number: 11 },
  { name: 'December', number: 12 },
];

interface CalendarSlot {
  number: number;
  dayName: string | null;
  monthName: string | null;
}

const DaysOfWeekGame: React.FC = () => {
  const [step2Active, setStep2Active] = useState(false);
  
  // Step 1: Days of the Week
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlot[]>([
    { number: 1, dayName: null, monthName: null },
    { number: 2, dayName: null, monthName: null },
    { number: 3, dayName: null, monthName: null },
    { number: 4, dayName: null, monthName: null },
    { number: 5, dayName: null, monthName: null },
    { number: 6, dayName: null, monthName: null },
    { number: 7, dayName: null, monthName: null },
  ]);
  
  const [availableDays, setAvailableDays] = useState<string[]>(
    DAYS_OF_WEEK.map(day => day.name).sort(() => Math.random() - 0.5)
  );
  
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const songIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const songPausedRef = useRef(false);
  const currentDayIndexRef = useRef(0);
  const isSongPlayingRef = useRef(false);

  // Step 2: Months
  const [monthSlots, setMonthSlots] = useState<CalendarSlot[]>([
    { number: 1, dayName: null, monthName: null },
    { number: 2, dayName: null, monthName: null },
    { number: 3, dayName: null, monthName: null },
    { number: 4, dayName: null, monthName: null },
    { number: 5, dayName: null, monthName: null },
    { number: 6, dayName: null, monthName: null },
    { number: 7, dayName: null, monthName: null },
    { number: 8, dayName: null, monthName: null },
    { number: 9, dayName: null, monthName: null },
    { number: 10, dayName: null, monthName: null },
    { number: 11, dayName: null, monthName: null },
    { number: 12, dayName: null, monthName: null },
  ]);
  
  const [availableMonths, setAvailableMonths] = useState<string[]>(
    MONTHS.map(month => month.name).sort(() => Math.random() - 0.5)
  );
  
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const musicOscillatorRef = useRef<OscillatorNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);

  const playBackgroundMusic = () => {
    if (songPausedRef.current || !isSongPlayingRef.current) return;
    
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      
      // Create a simple pleasant melody - days of the week song melody
      const melody = [
        { freq: 261.63, duration: 0.3 }, // C
        { freq: 293.66, duration: 0.3 }, // D
        { freq: 329.63, duration: 0.3 }, // E
        { freq: 349.23, duration: 0.3 }, // F
        { freq: 392.00, duration: 0.4 }, // G
        { freq: 440.00, duration: 0.4 }, // A
        { freq: 392.00, duration: 0.6 }, // G (back down)
      ];
      
      let noteIndex = 0;
      
      const playNote = () => {
        if (songPausedRef.current || !isSongPlayingRef.current) {
          if (musicOscillatorRef.current) {
            musicOscillatorRef.current.stop();
            musicOscillatorRef.current = null;
          }
          return;
        }
        
        const note = melody[noteIndex % melody.length];
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = note.freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + note.duration);
        
        noteIndex++;
        
        // Play next note
        songIntervalRef.current = setTimeout(() => {
          playNote();
        }, note.duration * 1000 + 100);
      };
      
      playNote();
    } catch (error) {
      console.warn('Could not play background music:', error);
    }
  };

  const singDaysSong = () => {
    // Start background music (just music, no words)
    playBackgroundMusic();
  };

  const startSong = () => {
    if (isSongPlayingRef.current) return;
    setIsSongPlaying(true);
    isSongPlayingRef.current = true;
    songPausedRef.current = false;
    currentDayIndexRef.current = 0;
    singDaysSong();
  };

  const pauseSong = () => {
    songPausedRef.current = true;
    if (songIntervalRef.current) {
      clearTimeout(songIntervalRef.current);
      songIntervalRef.current = null;
    }
    // Stop music oscillator
    if (musicOscillatorRef.current) {
      try {
        musicOscillatorRef.current.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
      musicOscillatorRef.current = null;
    }
    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const resumeSong = () => {
    if (!isSongPlayingRef.current) return;
    songPausedRef.current = false;
    singDaysSong();
  };

  useEffect(() => {
    // Start the song when component mounts (only for step 1)
    if (!step2Active) {
      startSong();
    }

    return () => {
      // Cleanup on unmount
      if (songIntervalRef.current) {
        clearTimeout(songIntervalRef.current);
      }
      setIsSongPlaying(false);
      isSongPlayingRef.current = false;
      songPausedRef.current = false;
    };
  }, [step2Active]);

  const handleDayClick = (dayName: string) => {
    // Pause the song
    pauseSong();
    
    // Cancel any ongoing speech from the song
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Speak the day
    audioService.speakText(dayName);
    setSelectedDay(dayName);
    
    // Resume the song after speaking (wait for TTS to finish)
    setTimeout(() => {
      resumeSong();
    }, 2000);
  };

  const handleSlotClick = (slotNumber: number) => {
    if (!selectedDay) return;

    // Find the correct day for this slot
    const correctDay = DAYS_OF_WEEK.find(day => day.number === slotNumber);
    
    if (correctDay && correctDay.name === selectedDay) {
      // Correct match - place the day in the slot
      setCalendarSlots(prev => prev.map(slot =>
        slot.number === slotNumber
          ? { ...slot, dayName: selectedDay }
          : slot
      ));
      
      // Remove the day from available days
      setAvailableDays(prev => prev.filter(day => day !== selectedDay));
      setSelectedDay(null);
    } else {
      // Incorrect match
      audioService.speakText('Incorrect answer');
    }
  };

  const handleMonthClick = (monthName: string) => {
    audioService.speakText(monthName);
    setSelectedMonth(monthName);
  };

  const handleMonthSlotClick = (slotNumber: number) => {
    if (!selectedMonth) return;

    // Find the correct month for this slot
    const correctMonth = MONTHS.find(month => month.number === slotNumber);
    
    if (correctMonth && correctMonth.name === selectedMonth) {
      // Correct match - place the month in the slot
      setMonthSlots(prev => prev.map(slot =>
        slot.number === slotNumber
          ? { ...slot, monthName: selectedMonth }
          : slot
      ));
      
      // Remove the month from available months
      setAvailableMonths(prev => prev.filter(month => month !== selectedMonth));
      setSelectedMonth(null);
    } else {
      // Incorrect match
      audioService.speakText('Incorrect answer');
    }
  };

  const resetGame = () => {
    // Stop the song
    pauseSong();
    setIsSongPlaying(false);
    isSongPlayingRef.current = false;
    currentDayIndexRef.current = 0;
    
    setCalendarSlots([
      { number: 1, dayName: null, monthName: null },
      { number: 2, dayName: null, monthName: null },
      { number: 3, dayName: null, monthName: null },
      { number: 4, dayName: null, monthName: null },
      { number: 5, dayName: null, monthName: null },
      { number: 6, dayName: null, monthName: null },
      { number: 7, dayName: null, monthName: null },
    ]);
    setAvailableDays(DAYS_OF_WEEK.map(day => day.name).sort(() => Math.random() - 0.5));
    setSelectedDay(null);
    setStep2Active(false);
    
    // Restart the song after a short delay
    setTimeout(() => {
      if (!step2Active) {
        startSong();
      }
    }, 500);
  };

  const resetMonthsGame = () => {
    setMonthSlots([
      { number: 1, dayName: null, monthName: null },
      { number: 2, dayName: null, monthName: null },
      { number: 3, dayName: null, monthName: null },
      { number: 4, dayName: null, monthName: null },
      { number: 5, dayName: null, monthName: null },
      { number: 6, dayName: null, monthName: null },
      { number: 7, dayName: null, monthName: null },
      { number: 8, dayName: null, monthName: null },
      { number: 9, dayName: null, monthName: null },
      { number: 10, dayName: null, monthName: null },
      { number: 11, dayName: null, monthName: null },
      { number: 12, dayName: null, monthName: null },
    ]);
    setAvailableMonths(MONTHS.map(month => month.name).sort(() => Math.random() - 0.5));
    setSelectedMonth(null);
  };

  const allDaysPlaced = calendarSlots.every(slot => slot.dayName !== null);
  const allMonthsPlaced = monthSlots.every(slot => slot.monthName !== null);

  // Check if step 1 is complete and transition to step 2
  useEffect(() => {
    if (allDaysPlaced && !step2Active) {
      // Stop the song
      pauseSong();
      setIsSongPlaying(false);
      isSongPlayingRef.current = false;
      
      setTimeout(() => {
        audioService.speakText('Great job! Now let\'s learn the months of the year!');
        setStep2Active(true);
      }, 2000);
    }
  }, [allDaysPlaced, step2Active]);

  // If step 2 is active, show months game
  if (step2Active) {
    return (
      <div className="days-of-week-game">
        <div className="game-header">
          <h2>📅 Step 2: Months of the Year</h2>
          <div className="header-buttons">
            <button className="skip-button" onClick={() => {
              resetMonthsGame();
            }}>
              🔄 Reset Months
            </button>
            <button className="reset-button" onClick={resetGame}>
              🔄 Reset All
            </button>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="calendar-section">
          <h3>Calendar</h3>
          <div className="calendar-grid months-grid">
            {monthSlots.map(slot => (
              <div
                key={slot.number}
                className={`calendar-slot ${slot.monthName ? 'filled' : ''} ${selectedMonth ? 'ready-for-selection' : ''}`}
                onClick={() => handleMonthSlotClick(slot.number)}
              >
                <div className="slot-number">{slot.number}</div>
                {slot.monthName && (
                  <div className="slot-day-name">{slot.monthName}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Months Store Section */}
        <div className="days-store-section">
          <h3>Months of the Year</h3>
          <div className="days-store-grid">
            {availableMonths.map(monthName => (
              <div
                key={monthName}
                className={`day-item ${selectedMonth === monthName ? 'selected' : ''}`}
                onClick={() => handleMonthClick(monthName)}
              >
                {monthName}
              </div>
            ))}
          </div>
        </div>

        {allMonthsPlaced && (
          <div className="completion-message">
            <h2>🎉 Excellent Work!</h2>
            <p>You've placed all the months correctly!</p>
            <button className="play-again-button" onClick={() => {
              setStep2Active(false);
              resetGame();
            }}>
              🎮 Play Again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="days-of-week-game">
      <div className="game-header">
        <h2>📅 Step 1: Days of the Week</h2>
        <div className="header-buttons">
          <button className="skip-button" onClick={() => {
            setStep2Active(true);
            resetMonthsGame();
          }}>
            ⏭️ Skip to Months
          </button>
          <button className="reset-button" onClick={resetGame}>
            🔄 Reset Game
          </button>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="calendar-section">
        <h3>Calendar</h3>
        <div className="calendar-grid">
          {calendarSlots.map(slot => (
            <div
              key={slot.number}
              className={`calendar-slot ${slot.dayName ? 'filled' : ''} ${selectedDay ? 'ready-for-selection' : ''}`}
              onClick={() => handleSlotClick(slot.number)}
            >
              <div className="slot-number">{slot.number}</div>
              {slot.dayName && (
                <div className="slot-day-name">{slot.dayName}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Days Store Section */}
      <div className="days-store-section">
        <h3>Days of the Week</h3>
        <div className="days-store-grid">
          {availableDays.map(dayName => (
            <div
              key={dayName}
              className={`day-item ${selectedDay === dayName ? 'selected' : ''}`}
              onClick={() => handleDayClick(dayName)}
            >
              {dayName}
            </div>
          ))}
        </div>
      </div>

      {allDaysPlaced && !step2Active && (
        <div className="completion-message">
          <h2>🎉 Great Job!</h2>
          <p>You've placed all the days correctly!</p>
          <p>Moving to months...</p>
        </div>
      )}
    </div>
  );
};

export default DaysOfWeekGame;

