/**
 * Web Audio API synthesizer for the Genomic Runner game.
 * Generates an organic, warm, and space-like chiptune ambient track representing cellular evolution.
 * This ensures audio works flawlessly without external asset download dependencies.
 */
export class CellSynthMusic {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: any = null;
  private currentStep: number = 0;
  private currentChord: number = 0;

  // Chord progression: Am7, Fmaj7, Cmaj7, G6 (A minor theme)
  private chords = [
    { bass: 55.00, arpeggio: [220, 261.63, 329.63, 392.00] }, // Am7
    { bass: 43.65, arpeggio: [174.61, 220.00, 261.63, 349.23] }, // Fmaj7
    { bass: 65.41, arpeggio: [261.63, 329.63, 392.00, 523.25] }, // Cmaj7
    { bass: 49.00, arpeggio: [196.00, 246.94, 293.66, 392.00] }  // G6
  ];

  constructor() {}

  /**
   * Starts the looping ambient music generator.
   */
  public start() {
    if (this.isPlaying) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();
      this.isPlaying = true;
      this.currentStep = 0;
      this.currentChord = 0;

      const tempo = 125; // Beats Per Minute
      const stepDuration = 60 / tempo / 2; // Eighth notes speed

      const scheduler = () => {
        if (!this.isPlaying || !this.ctx) return;
        this.playStep(this.ctx.currentTime, stepDuration);
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        this.timerId = setTimeout(scheduler, stepDuration * 1000);
      };

      scheduler();
    } catch (e) {
      console.warn("Audio Context failed to initialize:", e);
    }
  }

  /**
   * Schedule the notes for the current step.
   */
  private playStep(time: number, duration: number) {
    if (!this.ctx) return;

    const chord = this.chords[this.currentChord];

    // Every 16 steps (2 bars), advance chord
    if (this.currentStep % 16 === 0) {
      this.currentChord = (this.currentChord + 1) % this.chords.length;
    }

    // Play bass notes on main beats
    if (this.currentStep % 4 === 0) {
      this.playBass(chord.bass, time, duration * 2.5);
    }

    // Play organic pluck arpeggios
    if (this.currentStep % 2 === 0 || Math.random() > 0.4) {
      const notes = chord.arpeggio;
      const pitchIndex = this.currentStep % notes.length;
      let pitch = notes[pitchIndex];

      // Add octave variety on fourth/eighth steps
      if (this.currentStep % 8 === 0) {
        pitch *= 2; // octave higher peak
      } else if (this.currentStep % 6 === 0) {
        pitch *= 1.5; // fifth interval harmony
      }

      this.playPluck(pitch, time, duration * 0.9);
    }

    this.currentStep = (this.currentStep + 1) % 16;
  }

  /**
   * Play a deep organic bass pulse.
   */
  private playBass(frequency: number, time: number, duration: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle'; // smooth warm bass
    osc.frequency.setValueAtTime(frequency, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, time);
    filter.frequency.exponentialRampToValueAtTime(70, time + duration);

    // Volume envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.05); // low volume safe bass
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  /**
   * Play a clean, spacey pluck note.
   */
  private playPluck(frequency: number, time: number, duration: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine'; // pure rounded tone
    osc.frequency.setValueAtTime(frequency, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, time);
    filter.Q.setValueAtTime(1.2, time);

    // Pluck envelope: sharp decay
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.03, time + 0.02); // gentle volumes
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  /**
   * Stops the music.
   */
  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {}
      this.ctx = null;
    }
  }

  /**
   * Play a cool speed boost sound effect.
   */
  public triggerSpeedBoostSound() {
    if (!this.ctx) return;
    try {
      const time = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      // sweep frequency up quickly for speed-up feel!
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(1200, time + 0.5);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.04, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.5);
    } catch (e) {
      console.warn("Failed to play boost sound", e);
    }
  }
}
