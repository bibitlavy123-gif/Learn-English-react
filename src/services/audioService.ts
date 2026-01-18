// Audio service for word pronunciation
// Supports both pre-recorded audio files and Text-to-Speech

class AudioService {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private synth: SpeechSynthesis | null = null;
  private isEnabled: boolean = true;

  constructor() {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  // Play pre-recorded audio file
  playAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isEnabled) {
        resolve();
        return;
      }

      let audio = this.audioCache.get(url);
      
      if (!audio) {
        audio = new Audio(url);
        this.audioCache.set(url, audio);
      }

      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Audio playback failed'));
      
      audio.currentTime = 0;
      audio.play().catch(reject);
    });
  }

  // Play text-to-speech
  speakText(text: string, lang: string = 'en-US'): void {
    if (!this.isEnabled || !this.synth) {
      console.warn('Text-to-speech not available');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for children
    utterance.pitch = 1.1; // Slightly higher pitch
    utterance.volume = 1.0;

    this.synth.speak(utterance);
  }

  // Play word pronunciation (tries audio first, falls back to TTS)
  async playWordPronunciation(wordData: { pronunciation?: string; englishWord: string }): Promise<void> {
    if (!this.isEnabled) return;

    // Try pre-recorded audio first
    if (wordData.pronunciation) {
      try {
        await this.playAudio(wordData.pronunciation);
        return;
      } catch (error) {
        console.warn('Audio file failed, falling back to TTS:', error);
      }
    }

    // Fallback to Text-to-Speech
    this.speakText(wordData.englishWord);
  }

  // Stop all audio
  stopAll(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  isTTSAvailable(): boolean {
    return this.synth !== null;
  }
}

export const audioService = new AudioService();

