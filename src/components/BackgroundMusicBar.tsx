import React, { useState, useEffect } from 'react';
import { bgmEngine, AudioTrack, TRACK_LIST } from '../utils/audioPlayer';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const BackgroundMusicBar: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(TRACK_LIST[0]);
  const [tracks, setTracks] = useState<AudioTrack[]>(bgmEngine.getTracks());
  const [volume, setVolume] = useState(0.4);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.4);

  useEffect(() => {
    const unsubscribe = bgmEngine.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setCurrentTrack(state.track);
      setVolume(state.volume);
      if (state.tracks) {
        setTracks(state.tracks);
      }
    });
    return unsubscribe;
  }, []);

  const handleTogglePlay = () => {
    bgmEngine.togglePlay();
  };

  const handleNext = () => {
    bgmEngine.nextTrack();
  };

  const handlePrev = () => {
    bgmEngine.prevTrack();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    bgmEngine.setVolume(val);
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      bgmEngine.setVolume(prevVolume || 0.4);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      bgmEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleSelectTrack = (index: number) => {
    bgmEngine.play(index);
  };

  return (
    <div
      id="bgm-player-widget"
      className="fixed bottom-4 left-3 sm:left-6 z-40 transition-all duration-300 select-none"
    >
      {/* Expanded Track Selection Panel */}
      {isExpanded && (
        <div className="mb-2 p-4 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-pink-200/80 dark:border-stone-700 shadow-xl w-72 sm:w-80 animate-in fade-in slide-in-from-bottom-2 space-y-3">
          <div className="flex items-center justify-between border-b border-pink-100 dark:border-stone-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Giai điệu đọc truyện</span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs cursor-pointer p-1"
              title="Thu gọn"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Track List */}
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {tracks.map((t, idx) => {
              const isSelected = currentTrack.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTrack(idx)}
                  className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-pink-100/80 dark:bg-pink-950/70 text-pink-900 dark:text-pink-200 font-medium border border-pink-200 dark:border-pink-800'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="truncate min-w-0">
                    <p className="truncate">{t.title}</p>
                    <p className="text-[10px] text-stone-400 font-sans truncate">{t.mood}</p>
                  </div>
                  {isSelected && isPlaying ? (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <span className="w-0.5 h-3 bg-pink-500 animate-pulse rounded-full" />
                      <span className="w-0.5 h-4 bg-pink-500 animate-pulse delay-75 rounded-full" />
                      <span className="w-0.5 h-2 bg-pink-500 animate-pulse delay-150 rounded-full" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-stone-400 shrink-0 font-mono">{t.duration}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Volume Control */}
          <div className="pt-2 border-t border-pink-100 dark:border-stone-800 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMute}
              className="text-stone-500 hover:text-pink-600 dark:text-stone-400 dark:hover:text-pink-400 cursor-pointer p-1"
              title={isMuted ? 'Bật âm lượng' : 'Tắt tiếng'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              title={`Âm lượng: ${Math.round(volume * 100)}%`}
            />
            <span className="text-[10px] font-mono text-stone-400 w-8 text-right">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>
      )}

      {/* Mini Docked Floating Capsule */}
      <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-pink-200 dark:border-stone-700 shadow-lg hover:shadow-xl transition-all">
        {/* Play / Pause Toggle Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0 ${
            isPlaying
              ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white animate-pulse'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-pink-100 dark:hover:bg-stone-700'
          }`}
          title={isPlaying ? 'Tạm dừng nhạc nền' : 'Bật nhạc nền thư giãn'}
          aria-label={isPlaying ? 'Tạm dừng nhạc nền' : 'Bật nhạc nền'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Track Title and Equalizer Animation */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-2 text-left cursor-pointer focus:outline-hidden"
          title="Bấm để mở danh sách bài hát & chỉnh âm lượng"
        >
          {/* Animated Waveform when playing */}
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5 shrink-0">
              <span className="w-1 h-3 bg-pink-500 animate-bounce rounded-full" />
              <span className="w-1 h-4.5 bg-rose-500 animate-bounce delay-100 rounded-full" />
              <span className="w-1 h-2 bg-amber-500 animate-bounce delay-200 rounded-full" />
            </div>
          ) : (
            <Music className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          )}

          <div className="flex flex-col min-w-0 max-w-[120px] sm:max-w-[170px]">
            <span className="text-[11px] sm:text-xs font-serif font-medium text-stone-800 dark:text-stone-100 truncate">
              {currentTrack.title}
            </span>
            <span className="text-[9px] text-pink-600 dark:text-pink-400 font-sans truncate">
              {isPlaying ? 'Đang phát trong nền...' : 'Bấm để nghe nhạc ♪'}
            </span>
          </div>

          <div className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 pl-1 shrink-0">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Quick Next Track Button */}
        {isPlaying && (
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-full hover:bg-pink-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-pink-600 transition-colors cursor-pointer shrink-0"
            title="Chuyển bài tiếp theo"
            aria-label="Chuyển bài"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
