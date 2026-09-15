import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageCircleHeart,
  Music,
  Send,
  Heart,
  ArrowRight,
  Smile,
  Play,
  Pause,
  SkipForward,
  Volume2,
} from 'lucide-react';
import { bgmEngine, AudioTrack, TRACK_LIST } from '../utils/audioPlayer';

interface HomeOtherSectionProps {
  onGoToOtherPage: () => void;
}

interface LetterItem {
  id: string;
  sender: string;
  avatar: string;
  time: string;
  tag: string;
  content: string;
  reply?: string;
  likes: number;
}

const SAMPLE_LETTERS: LetterItem[] = [
  {
    id: 'hl-1',
    sender: 'Tiểu Mộc Lan',
    avatar: '🌸',
    time: '2 giờ trước',
    tag: '🌸 Lời chúc & Cảm ơn',
    content:
      'Cảm ơn Mel rất nhiều vì đã đem đến câu chuyện "Chỉ Là Chút Tình Cờ". Từng câu từng chữ êm dịu như một cơn mưa rào giữa ngày hè oi bức.',
    reply: 'Cảm ơn Mộc Lan nhiều nha! Những lời động viên như này là động lực to lớn nhất để Mel gõ truyện mỗi tối đó ạ ♡',
    likes: 28,
  },
  {
    id: 'hl-2',
    sender: 'Hạ Vy 17',
    avatar: '🍧',
    time: 'Hôm qua',
    tag: '☕ Tâm sự mùa hè',
    content:
      'Nhờ có blog của Mel mà những đêm ôn thi đại học của mình bớt cô đơn hơn hẳn. Mở playlist mùa hạ, đọc một chương truyện rồi đi ngủ thật ngon!',
    reply: 'Chúc Hạ Vy làm bài thi thật tốt và đạt được nguyện vọng 1 nhé, Mel luôn cổ vũ cho bạn!',
    likes: 42,
  },
];

export const HomeOtherSection: React.FC<HomeOtherSectionProps> = ({ onGoToOtherPage }) => {
  const [letters, setLetters] = useState<LetterItem[]>(SAMPLE_LETTERS);
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  // Background Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(TRACK_LIST[0]);

  useEffect(() => {
    const unsubscribe = bgmEngine.subscribe((state) => {
      setIsMusicPlaying(state.isPlaying);
      setCurrentTrack(state.track);
    });
    return unsubscribe;
  }, []);

  const handleSendLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newLetter: LetterItem = {
      id: `hl-${Date.now()}`,
      sender: senderName.trim() || 'Bạn đọc giấu tên',
      avatar: '💌',
      time: 'Vừa xong',
      tag: '🌸 Lời nhắn gửi',
      content: message.trim(),
      likes: 1,
    };

    setLetters([newLetter, ...letters]);
    setMessage('');
    setSenderName('');
    setIsSentSuccess(true);
    setTimeout(() => setIsSentSuccess(false), 4000);
  };

  const handleLikeLetter = (id: string) => {
    setLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, likes: l.likes + 1 } : l))
    );
  };

  return (
    <section
      id="home-other-section"
      className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-sky-50/90 via-blue-50/70 to-teal-50/60 dark:from-stone-900 dark:via-sky-950/20 dark:to-stone-900 border border-sky-200/80 dark:border-sky-900/60 shadow-xs space-y-6 relative overflow-hidden"
    >
      {/* Decorative Washi Tape */}
      <div
        className="absolute -top-3 left-8 w-28 h-5.5 bg-sky-400/80 dark:bg-sky-600/80 rotate-[-1deg] rounded-xs shadow-2xs border border-black/10 dark:border-white/20"
        style={{ clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)' }}
      />

      {/* Header with Title & Action to Dedicated Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200/60 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-sky-700 dark:text-sky-400">
              <span>Hòm thư yêu thương • Playlist âm nhạc & Góc nhỏ Mel</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-100">
              Một Số Mục Khác: Tâm Sự & Nhạc Hè
            </h2>
          </div>
        </div>

        {/* Button to go to dedicated Other Page */}
        <button
          type="button"
          id="btn-goto-dedicated-other-page"
          onClick={onGoToOtherPage}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <span>Khám phá toàn bộ Góc tâm sự</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Two columns: Music Player Mini & Public Letters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (5 cols): Playlist mini widget + send message */}
        <div className="lg:col-span-5 space-y-4">
          {/* Mini Music Player Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-800/90 border border-sky-100 dark:border-stone-700 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-sky-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="font-serif text-xs font-bold text-stone-800 dark:text-stone-200">
                  Giai điệu mùa hạ 🎐
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-medium">
                {isMusicPlaying ? 'Đang phát' : 'Đang tạm dừng'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-stone-900/80 border border-sky-100/80 dark:border-stone-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-serif text-xs font-bold text-stone-800 dark:text-stone-100 truncate">
                  {currentTrack.title}
                </p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                  {currentTrack.artist} • {currentTrack.album}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => bgmEngine.togglePlay()}
                  className="p-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white cursor-pointer transition-colors shadow-2xs"
                  title={isMusicPlaying ? 'Tạm dừng' : 'Phát nhạc'}
                >
                  {isMusicPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => bgmEngine.nextTrack()}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 cursor-pointer transition-colors"
                  title="Bài tiếp theo"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Confession / Message Form */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-800/90 border border-sky-100 dark:border-stone-700 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
              <MessageCircleHeart className="w-4 h-4 text-rose-500" />
              <span>Gửi lời nhắn nhanh cho Mel:</span>
            </div>

            <form onSubmit={handleSendLetter} className="space-y-2.5">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Biệt danh của bạn (hoặc ẩn danh)..."
                className="w-full px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-sky-400"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Gửi một chút ngọt ngào hay lời chúc đến chiếc thuyền nhỏ..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-sky-400 resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-stone-400">
                  {isSentSuccess ? '🌸 Đã gửi lá thư ngọt ngào!' : 'Thư sẽ xuất hiện ngay phía bên cạnh'}
                </span>
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Gửi thư</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col (7 cols): Recent Public Letters List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-600 dark:text-stone-400">
            <span>Hòm thư bạn đọc gần đây:</span>
            <span className="text-[11px] text-sky-600 dark:text-sky-400">
              {letters.length} lá thư
            </span>
          </div>

          <div className="space-y-3">
            {letters.map((letter) => (
              <div
                key={letter.id}
                className="p-4 rounded-2xl bg-white/90 dark:bg-stone-800/90 border border-sky-100 dark:border-stone-700 shadow-2xs space-y-2.5 transition-all hover:border-sky-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{letter.avatar}</span>
                    <div>
                      <span className="font-serif text-xs font-bold text-stone-800 dark:text-stone-100">
                        {letter.sender}
                      </span>
                      <span className="text-[10px] text-stone-400 ml-2">
                        {letter.time}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLikeLetter(letter.id)}
                    className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 transition-colors cursor-pointer"
                  >
                    <Heart className="w-3 h-3 fill-rose-500" />
                    <span>{letter.likes}</span>
                  </button>
                </div>

                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                  "{letter.content}"
                </p>

                {letter.reply && (
                  <div className="p-2.5 rounded-xl bg-pink-50/80 dark:bg-stone-900/80 border border-pink-200/60 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-300 space-y-0.5">
                    <span className="font-bold text-pink-600 dark:text-pink-400">
                      🌸 Phản hồi từ Mel:
                    </span>
                    <p className="italic">{letter.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
