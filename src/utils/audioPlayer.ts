// Ambient Background Music Engine using Web Audio API
// High reliability, zero external network dependency, seamless background playback across all pages and devices.

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  mood: string;
}

export const TRACK_LIST: AudioTrack[] = [
  {
    id: 'track-1',
    title: 'Gió Thổi Mùa Hạ (夏天的风)',
    artist: 'Mellifluous Lofi Chill',
    duration: '03:45',
    mood: 'Rhodes Piano & Gió mùa hạ',
  },
  {
    id: 'track-2',
    title: 'Mùa Hè Năm Ấy (那年夏天)',
    artist: 'Acoustic Piano & Music Box',
    duration: '04:12',
    mood: 'Tiếng đàn êm dịu tuổi thanh xuân',
  },
  {
    id: 'track-3',
    title: 'Tớ Thích Cậu (我喜欢你)',
    artist: 'Sweet Warm Chords',
    duration: '03:30',
    mood: 'Giai điệu ngọt ngào chữa lành',
  },
  {
    id: 'track-4',
    title: 'Ký Ức Mùa Mưa Rào',
    artist: 'Ambient Rain & Chimes',
    duration: '02:58',
    mood: 'Chuông gió & giọt mưa tí tách',
  },
];

// Pentatonic note frequencies for sweet romantic melodies (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6)
const PENTATONIC_FREQS = [
  261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5,
];

// Chord roots & harmonies
const CHORD_PROGRESSIONS = [
  // Track 1: Cmaj9 -> Am9 -> Fmaj7 -> Gsus4
  [
    [130.81, 261.63, 329.63, 392.0, 493.88], // C3, C4, E4, G4, B4
    [110.0, 220.0, 261.63, 329.63, 392.0],  // A2, A3, C4, E4, G4
    [87.31, 174.61, 261.63, 329.63, 349.23], // F2, F3, C4, E4, F4
    [98.0, 196.0, 261.63, 293.66, 392.0],   // G2, G3, C4, D4, G4
  ],
  // Track 2: Fmaj7 -> Em7 -> Dm7 -> Cmaj7
  [
    [87.31, 174.61, 261.63, 329.63, 392.0],
    [82.41, 164.81, 246.94, 329.63, 392.0],
    [73.42, 146.83, 220.0, 261.63, 329.63],
    [65.41, 130.81, 196.0, 246.94, 329.63],
  ],
  // Track 3: G -> D/F# -> Em -> C
  [
    [98.0, 196.0, 246.94, 293.66, 392.0],
    [92.5, 185.0, 220.0, 293.66, 369.99],
    [82.41, 164.81, 246.94, 329.63, 392.0],
    [65.41, 130.81, 196.0, 261.63, 329.63],
  ],
  // Track 4: C -> G -> Am -> F
  [
    [130.81, 196.0, 261.63, 329.63, 392.0],
    [98.0, 146.83, 196.0, 246.94, 293.66],
    [110.0, 164.81, 220.0, 261.63, 329.63],
    [87.31, 130.81, 174.61, 220.0, 261.63],
  ],
];

class BackgroundMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTrackIndex = 0;
  private volume = 0.4;
  private masterGain: GainNode | null = null;
  private intervalId: number | null = null;
  private step = 0;
  private listeners: Array<(state: { isPlaying: boolean; track: AudioTrack; volume: number }) => void> = [];

  constructor() {
    try {
      const savedVolume = localStorage.getItem('better_bgm_volume');
      if (savedVolume !== null) {
        this.volume = Math.max(0, Math.min(1, parseFloat(savedVolume)));
      }
      const savedTrack = localStorage.getItem('better_bgm_track');
      if (savedTrack !== null) {
        const idx = parseInt(savedTrack, 10);
        if (idx >= 0 && idx < TRACK_LIST.length) {
          this.currentTrackIndex = idx;
        }
      }
    } catch {
      // safe fallback
    }
  }

  private initAudio() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public subscribe(fn: (state: { isPlaying: boolean; track: AudioTrack; volume: number }) => void) {
    this.listeners.push(fn);
    fn(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      track: TRACK_LIST[this.currentTrackIndex] || TRACK_LIST[0],
      volume: this.volume,
    };
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public play(trackIndex?: number) {
    if (trackIndex !== undefined && trackIndex >= 0 && trackIndex < TRACK_LIST.length) {
      this.currentTrackIndex = trackIndex;
      try {
        localStorage.setItem('better_bgm_track', trackIndex.toString());
      } catch {
        // ignore
      }
    }

    this.initAudio();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.notify();

    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }

    // Play next note every 600ms to 900ms
    this.step = 0;
    this.playStep();
    this.intervalId = window.setInterval(() => {
      this.playStep();
    }, 750);
  }

  public pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.notify();
  }

  public nextTrack() {
    const nextIdx = (this.currentTrackIndex + 1) % TRACK_LIST.length;
    this.play(nextIdx);
  }

  public prevTrack() {
    const prevIdx = (this.currentTrackIndex - 1 + TRACK_LIST.length) % TRACK_LIST.length;
    this.play(prevIdx);
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
    try {
      localStorage.setItem('better_bgm_volume', clamped.toString());
    } catch {
      // ignore
    }
    this.notify();
  }

  private playStep() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    const chords = CHORD_PROGRESSIONS[this.currentTrackIndex % CHORD_PROGRESSIONS.length];
    const chordIndex = Math.floor(this.step / 4) % chords.length;
    const currentChord = chords[chordIndex];

    // Every 4 steps, trigger the root pad
    if (this.step % 4 === 0) {
      this.playPad(currentChord);
    }

    // Play gentle melody note from pentatonic scale
    // Select notes that harmonize with current chord
    const notePool = [...currentChord, ...PENTATONIC_FREQS];
    const freq = notePool[Math.floor(Math.random() * notePool.length)];

    this.playMelodyNote(freq, this.currentTrackIndex);
    this.step++;
  }

  private playPad(frequencies: number[]) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    frequencies.slice(0, 3).forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.5, now); // 1 octave lower for soft warm pad

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.3);
    });
  }

  private playMelodyNote(freq: number, trackStyle: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Subtle variations based on track style
    if (trackStyle === 0) {
      // Rhodes piano / gentle electric chime
      osc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 1.2);
    } else if (trackStyle === 1) {
      // Music box / bell
      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 1.5);
    } else if (trackStyle === 2) {
      // Soft acoustic warm chime
      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
    } else {
      // Ambient wind chime
      osc.type = 'triangle';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(2, now);
    }

    osc.frequency.setValueAtTime(freq, now);

    // Envelope: quick gentle attack, soft ringing decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.9);
  }
}

export const bgmEngine = new BackgroundMusicEngine();
