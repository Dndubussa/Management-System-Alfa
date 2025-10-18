// Notification sound utility functions
export class NotificationSound {
  private static audioContext: AudioContext | null = null;
  private static isEnabled: boolean = true;
  private static volume: number = 0.5;

  // Initialize audio context (required for Web Audio API)
  private static async initAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume audio context if it's suspended (required for user interaction)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    return this.audioContext;
  }

  // Generate a bell-like notification sound using Web Audio API
  static async playBellSound(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const audioContext = await this.initAudioContext();
      
      // Create oscillator for the bell sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure the bell sound (multiple frequencies for richness)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Base frequency
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      // Set volume
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
    } catch (error) {
      console.warn('Could not play notification sound:', error);
      // Fallback to simple beep
      this.playFallbackSound();
    }
  }

  // Fallback sound using HTML5 Audio (simpler but less customizable)
  private static playFallbackSound(): void {
    if (!this.isEnabled) return;

    try {
      // Create a simple beep sound using data URL
      const audio = new Audio();
      const sampleRate = 44100;
      const duration = 0.2;
      const frequency = 800;
      
      // Generate a simple sine wave
      const samples = sampleRate * duration;
      const buffer = new ArrayBuffer(44 + samples * 2);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + samples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, samples * 2, true);
      
      // Generate sine wave
      for (let i = 0; i < samples; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
        view.setInt16(44 + i * 2, sample * 32767, true);
      }
      
      const blob = new Blob([buffer], { type: 'audio/wav' });
      audio.src = URL.createObjectURL(blob);
      audio.volume = this.volume;
      audio.play().catch(error => {
        console.warn('Could not play fallback notification sound:', error);
      });
      
    } catch (error) {
      console.warn('Could not create fallback notification sound:', error);
    }
  }

  // Play a simple notification sound (easier to implement)
  static async playSimpleBell(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const audioContext = await this.initAudioContext();
      
      // Create a simple bell sound with two tones
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);
        
        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
      };
      
      // Play two tones for a bell-like sound
      playTone(800, 0, 0.2);    // First tone
      playTone(600, 0.1, 0.2);  // Second tone (slightly delayed)
      
    } catch (error) {
      console.warn('Could not play simple bell sound:', error);
      this.playFallbackSound();
    }
  }

  // Enable/disable notification sounds
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    // Save preference to localStorage
    localStorage.setItem('notificationSoundEnabled', enabled.toString());
  }

  // Set volume (0.0 to 1.0)
  static setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    // Save preference to localStorage
    localStorage.setItem('notificationSoundVolume', this.volume.toString());
  }

  // Get current enabled state
  static getEnabled(): boolean {
    return this.isEnabled;
  }

  // Get current volume
  static getVolume(): number {
    return this.volume;
  }

  // Load preferences from localStorage
  static loadPreferences(): void {
    const enabled = localStorage.getItem('notificationSoundEnabled');
    const volume = localStorage.getItem('notificationSoundVolume');
    
    if (enabled !== null) {
      this.isEnabled = enabled === 'true';
    }
    
    if (volume !== null) {
      this.volume = parseFloat(volume);
    }
  }

  // Play notification sound based on notification type
  static async playNotificationSound(type: string = 'default'): Promise<void> {
    switch (type) {
      case 'appointment':
        await this.playBellSound();
        break;
      case 'urgent':
        // Play twice for urgent notifications
        await this.playSimpleBell();
        setTimeout(() => this.playSimpleBell(), 200);
        break;
      case 'system':
        await this.playSimpleBell();
        break;
      default:
        await this.playSimpleBell();
        break;
    }
  }
}

// Initialize preferences on module load
NotificationSound.loadPreferences();
