// Ambient Background Music Engine using Web Audio API + HTMLAudioElement for custom streaming links
// Allows authors, admins, and collaborators to add, remove, and link custom music streams or MP3s.

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  duration?: string;
  mood?: string;
  audioUrl?: string; // Direct audio URL (mp3, wav, stream)
  addedBy?: string;
  createdAt?: string;
}

export const DEFAULT_TRACK_LIST: AudioTrack[] = [
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

export let TRACK_LIST: AudioTrack[] = [...DEFAULT_TRACK_LIST];

// Pentatonic note frequencies for sweet romantic melodies
const PENTATONIC_FREQS = [
  261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5,
];

// Chord roots & harmonies
const CHORD_PROGRESSIONS = [
  [
    [130.81, 261.63, 329.63, 392.0, 493.88],
    [110.0, 220.0, 261.63, 329.63, 392.0],
    [87.31, 174.61, 261.63, 329.63, 349.23],
    [98.0, 196.0, 261.63, 293.66, 392.0],
  ],
  [
    [87.31, 174.61, 261.63, 329.63, 392.0],
    [82.41, 164.81, 246.94, 329.63, 392.0],
    [73.42, 146.83, 220.0, 261.63, 329.63],
    [65.41, 130.81, 196.0, 246.94, 329.63],
  ],
  [
    [98.0, 196.0, 246.94, 293.66, 392.0],
    [92.5, 185.0, 220.0, 293.66, 369.99],
    [82.41, 164.81, 246.94, 329.63, 392.0],
    [65.41, 130.81, 196.0, 261.63, 329.63],
  ],
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
  private audioEl: HTMLAudioElement | null = null;
  private isExternalAudio = false;
  private tracks: AudioTrack[] = [...DEFAULT_TRACK_LIST];
  private listeners: Array<
    (state: { isPlaying: boolean; track: AudioTrack; volume: number; tracks: AudioTrack[] }) => void
  > = [];

  constructor() {
    this.loadTracksFromStorage();

    try {
      const savedVolume = localStorage.getItem('better_bgm_volume');
      if (savedVolume !== null) {
        this.volume = Math.max(0, Math.min(1, parseFloat(savedVolume)));
      }
      const savedTrack = localStorage.getItem('better_bgm_track');
      if (savedTrack !== null) {
        const idx = parseInt(savedTrack, 10);
        if (idx >= 0 && idx < this.tracks.length) {
          this.currentTrackIndex = idx;
        }
      }
    } catch {
      // safe fallback
    }
  }

  private loadTracksFromStorage() {
    try {
      const raw = localStorage.getItem('better_bgm_custom_playlist');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.tracks = parsed;
          TRACK_LIST = this.tracks;
          return;
        }
      }
    } catch {}
    this.tracks = [...DEFAULT_TRACK_LIST];
    TRACK_LIST = this.tracks;
  }

  private saveTracksToStorage() {
    try {
      localStorage.setItem('better_bgm_custom_playlist', JSON.stringify(this.tracks));
      TRACK_LIST = this.tracks;
    } catch {}
  }

  public getTracks(): AudioTrack[] {
    return [...this.tracks];
  }

  public addTrack(track: Omit<AudioTrack, 'id'>): AudioTrack {
    const newTrack: AudioTrack = {
      ...track,
      id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.tracks.push(newTrack);
    this.saveTracksToStorage();
    this.notify();
    return newTrack;
  }

  public removeTrack(trackId: string): boolean {
    if (this.tracks.length <= 1) return false; // keep at least 1 track
    const indexToRemove = this.tracks.findIndex((t) => t.id === trackId);
    if (indexToRemove === -1) return false;

    const wasPlayingCurrent = this.isPlaying && this.currentTrackIndex === indexToRemove;
    this.tracks = this.tracks.filter((t) => t.id !== trackId);
    this.saveTracksToStorage();

    if (this.currentTrackIndex >= this.tracks.length) {
      this.currentTrackIndex = Math.max(0, this.tracks.length - 1);
    }

    if (wasPlayingCurrent) {
      this.play(this.currentTrackIndex);
    } else {
      this.notify();
    }
    return true;
  }

  public resetToDefaultTracks() {
    this.stopExternalAudio();
    this.tracks = [...DEFAULT_TRACK_LIST];
    this.saveTracksToStorage();
    this.currentTrackIndex = 0;
    if (this.isPlaying) {
      this.play(0);
    } else {
      this.notify();
    }
  }

  private initAudio() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  public subscribe(
    fn: (state: {
      isPlaying: boolean;
      track: AudioTrack;
      volume: number;
      tracks: AudioTrack[];
    }) => void
  ) {
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
      track: this.tracks[this.currentTrackIndex] || this.tracks[0] || DEFAULT_TRACK_LIST[0],
      volume: this.volume,
      tracks: this.tracks,
    };
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private stopExternalAudio() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
      this.audioEl = null;
    }
    this.isExternalAudio = false;
  }

  public play(trackIndex?: number) {
    if (trackIndex !== undefined && trackIndex >= 0 && trackIndex < this.tracks.length) {
      this.currentTrackIndex = trackIndex;
      try {
        localStorage.setItem('better_bgm_track', trackIndex.toString());
      } catch {}
    }

    const currentTrack = this.tracks[this.currentTrackIndex];
    this.stopExternalAudio();

    // Check if current track has custom streaming URL
    if (currentTrack?.audioUrl && currentTrack.audioUrl.trim().length > 5) {
      try {
        this.audioEl = new Audio(currentTrack.audioUrl.trim());
        this.audioEl.volume = this.volume;
        this.audioEl.loop = true;
        this.isExternalAudio = true;

        const playPromise = this.audioEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.isPlaying = true;
              this.notify();
            })
            .catch((err) => {
              console.warn('Direct audio stream failed, falling back to gentle synth:', err);
              this.stopExternalAudio();
              this.playSynth();
            });
        }
        return;
      } catch (e) {
        console.warn('Audio tag failed:', e);
        this.stopExternalAudio();
      }
    }

    this.playSynth();
  }

  private playSynth() {
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

    this.step = 0;
    this.playStep();
    this.intervalId = window.setInterval(() => {
      this.playStep();
    }, 750);
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.notify();
  }

  public nextTrack() {
    if (this.tracks.length === 0) return;
    const nextIdx = (this.currentTrackIndex + 1) % this.tracks.length;
    this.play(nextIdx);
  }

  public prevTrack() {
    if (this.tracks.length === 0) return;
    const prevIdx = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.play(prevIdx);
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    if (this.audioEl) {
      this.audioEl.volume = clamped;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
    try {
      localStorage.setItem('better_bgm_volume', clamped.toString());
    } catch {}
    this.notify();
  }

  private playStep() {
    if (!this.ctx || !this.masterGain || !this.isPlaying || this.isExternalAudio) return;

    const chords = CHORD_PROGRESSIONS[this.currentTrackIndex % CHORD_PROGRESSIONS.length];
    const chordIndex = Math.floor(this.step / 4) % chords.length;
    const currentChord = chords[chordIndex];

    if (this.step % 4 === 0) {
      this.playChord(currentChord, 3.2);
    }

    const melodyPitch = this.pickMelodyNote(currentChord);
    this.playMelodyNote(melodyPitch, 1.4);

    if (Math.random() > 0.4) {
      const sparklePitch = PENTATONIC_FREQS[Math.floor(Math.random() * PENTATONIC_FREQS.length)];
      setTimeout(() => {
        if (this.isPlaying && !this.isExternalAudio) {
          this.playBellNote(sparklePitch, 1.2);
        }
      }, 350);
    }

    this.step = (this.step + 1) % 16;
  }

  private pickMelodyNote(currentChord: number[]): number {
    const chordNotes = currentChord.filter((freq) => freq > 250);
    if (Math.random() > 0.3 && chordNotes.length > 0) {
      return chordNotes[Math.floor(Math.random() * chordNotes.length)];
    }
    return PENTATONIC_FREQS[Math.floor(Math.random() * PENTATONIC_FREQS.length)];
  }

  private playMelodyNote(freq: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.09, now + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  private playBellNote(freq: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 2, now);

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.035, now + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  private playChord(chordFreqs: number[], duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    chordFreqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.045 / chordFreqs.length, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + duration);
    });
  }
}

export const bgmEngine = new BackgroundMusicEngine();
