import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Pin,
  Lock,
  BookMarked,
  Music,
  ExternalLink,
} from 'lucide-react';
import { Story, Announcement, RecentUpdate } from '../types';
import { SUMMER_QUOTES } from '../data/mockData';
import { SidebarStoryDropdown } from './SidebarStoryDropdown';
import { SidebarGenreDropdown } from './SidebarGenreDropdown';

interface SidebarProps {
  stories: Story[];
  announcements: Announcement[];
  recentUpdates: RecentUpdate[];
  onSelectStory: (storyId: string) => void;
  onSelectChapter: (storyId: string, chapterNumber: number) => void;
  onFilterGenre: (genre: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  stories,
  announcements,
  recentUpdates,
  onSelectStory,
  onSelectChapter,
  onFilterGenre,
}) => {
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeQuoteIndex, setActiveQuoteIndex] = useState<number>(0);

  // All distinct genres across stories
  const allGenres = Array.from(new Set(stories.flatMap((s) => s.genre)));

  const handleSelectStory = (storyId: string) => {
    setSelectedStoryId(storyId);
    onSelectStory(storyId);
  };

  const handleFilterGenre = (genre: string) => {
    setSelectedGenre(genre);
    onFilterGenre(genre);
  };

  const toggleAudioAmbiance = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const nextQuote = () => {
    setActiveQuoteIndex((prev) => (prev + 1) % SUMMER_QUOTES.length);
  };

  const activeNotice = announcements.find((a) => a.isPinned) || announcements[0];

  return (
    <aside id="blog-right-sidebar" className="space-y-6 w-full">
      {/* 1. SECTION: THÔNG BÁO CHÍNH (Đoạn văn thông báo các thông báo chính) */}
      <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-pink-50/90 via-rose-50/60 to-amber-50/80 dark:from-stone-800 dark:via-stone-800/90 dark:to-pink-950/30 border border-pink-200/80 dark:border-stone-700/80 shadow-xs">
        {/* Washi tape decoration */}
        <div className="absolute -top-2.5 left-8 w-16 h-4 bg-pink-300/80 dark:bg-pink-700/70 rotate-[-2deg] rounded-xs shadow-2xs border-y border-white/60" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <h3 className="font-serif text-base font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
              <span>Bảng tin nhà Mel</span>
              <Pin className="w-3.5 h-3.5 text-pink-500" />
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-pink-200/70 text-pink-900 dark:bg-pink-900/60 dark:text-pink-200">
            {activeNotice.date}
          </span>
        </div>

        <div className="space-y-2">
          <h4 className="font-serif text-sm font-semibold text-pink-900 dark:text-pink-200 leading-snug">
            {activeNotice.title}
          </h4>
          <p className="text-xs sm:text-[13px] leading-relaxed text-stone-700 dark:text-stone-300 font-sans">
            {activeNotice.content}
          </p>
        </div>

        {/* Small note reminder */}
        <div className="mt-3 pt-3 border-t border-pink-200/60 dark:border-stone-700/60 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
          <span className="font-serif italic">Mellifluous 🌸 Thuyền nhỏ</span>
          <span className="text-pink-600 dark:text-pink-400 font-medium">Phi thương mại</span>
        </div>
      </div>

      {/* 2. SECTION: DANH MỤC ĐỔ XUỐNG ĐỂ CHỌN TÁC PHẨM TRUYỆN / CHUYÊN MỤC (Linh hoạt theo chế độ sáng/tối, đồng bộ và rõ chữ) */}
      <div className="relative p-5 rounded-2xl bg-white dark:bg-stone-900 border border-pink-100 dark:border-stone-800 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-pink-50 text-pink-600 border border-pink-200 dark:bg-stone-800 dark:text-pink-400 dark:border-stone-700 shadow-2xs">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-stone-800 dark:text-white flex items-center gap-1.5">
                <span>Chọn tác phẩm truyện</span>
                <span className="text-xs">🌸</span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">
                Đổ xuống danh mục để đọc ngay
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-100/80 text-pink-800 dark:bg-stone-800 dark:text-pink-300 font-semibold border border-pink-200 dark:border-stone-700">
            {stories.length} bộ
          </span>
        </div>

        {/* Custom Styled Dropdown 1: Tác phẩm truyện */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 dark:text-stone-200 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Danh mục truyện:</span>
              <span className="text-pink-500 dark:text-pink-400 text-[10px]">✦</span>
            </span>
            <span className="text-[11px] text-pink-600 dark:text-pink-300 font-medium">
              Kèm thanh trượt & tìm kiếm
            </span>
          </label>
          <SidebarStoryDropdown
            stories={stories}
            selectedStoryId={selectedStoryId}
            onSelectStory={handleSelectStory}
          />
        </div>

        {/* Custom Styled Dropdown 2: Thể loại / Chuyên mục truyện */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-stone-700 dark:text-stone-200 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Lọc theo thể loại / chuyên mục:</span>
              <span className="text-emerald-500 dark:text-emerald-400 text-[10px]">🍃</span>
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-300 font-medium">
              {allGenres.length} tags
            </span>
          </label>
          <SidebarGenreDropdown
            stories={stories}
            selectedGenre={selectedGenre}
            onFilterGenre={handleFilterGenre}
          />
        </div>
      </div>

      {/* 3. SECTION: THÔNG BÁO CÁC CHƯƠNG TRUYỆN MỚI NHẤT ĐƯỢC CẬP NHẬT THEO THỜI GIAN ĐĂNG BÀI */}
      <div className="p-5 rounded-2xl bg-white/90 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-stone-800 dark:text-stone-100">
                Chương mới cập nhật
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">
                Theo dòng thời gian đăng bài
              </p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
        </div>

        {/* Timeline list of recent chapters */}
        <div className="space-y-3">
          {recentUpdates.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectChapter(item.storyId, item.chapterNumber)}
              className="w-full text-left p-3 rounded-xl bg-stone-50 hover:bg-pink-50/70 dark:bg-stone-900/60 dark:hover:bg-stone-700/60 border border-stone-200/60 dark:border-stone-700/60 hover:border-pink-200 dark:hover:border-pink-800 transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                <span className="font-medium text-pink-600 dark:text-pink-400 flex items-center gap-1 truncate max-w-[65%]">
                  🌸 {item.storyTitle}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-stone-800 shrink-0">
                  {item.timeAgo}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="font-serif text-xs sm:text-[13px] font-semibold text-stone-800 dark:text-stone-200 group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors line-clamp-1">
                  {item.chapterTitle}
                </p>
                {item.isLocked ? (
                  <span
                    className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-sm shrink-0 border border-amber-300/60"
                    title="Chương có cài đặt mật khẩu"
                  >
                    <Lock className="w-3 h-3" />
                    Pass
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-sm shrink-0 border border-emerald-300/60">
                    Đọc
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. SECTION: TRÍCH DẪN NGÔN TÌNH MÙA HÈ THANH XUÂN */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-yellow-50/50 to-pink-50/60 dark:from-stone-800 dark:via-stone-900 dark:to-amber-950/30 border border-amber-200/70 dark:border-stone-700 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Trích dẫn mùa hạ
          </span>
          <button
            type="button"
            onClick={nextQuote}
            className="text-[11px] text-stone-500 hover:text-amber-600 dark:hover:text-amber-300 underline font-sans cursor-pointer"
          >
            Đổi câu khác ↻
          </button>
        </div>

        <blockquote className="space-y-2">
          <p className="font-serif text-xs sm:text-[13px] leading-relaxed text-stone-700 dark:text-stone-300 italic">
            "{SUMMER_QUOTES[activeQuoteIndex].text}"
          </p>
          <cite className="block text-right text-[11px] font-medium text-pink-600 dark:text-pink-400 not-italic">
            — {SUMMER_QUOTES[activeQuoteIndex].book}
          </cite>
        </blockquote>
      </div>

      {/* 5. SECTION: LO-FI AMBIANCE MUSIC PLAYER (Thanh âm mùa hạ) */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Giai điệu mùa hè
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">
              {isPlayingAudio ? 'Đang phát: Gió Thổi Mùa Hạ ♫' : 'Tiếng gió hè & ve sầu'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleAudioAmbiance}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isPlayingAudio
              ? 'bg-pink-500 text-white border-pink-600 shadow-xs'
              : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-600'
          }`}
          title={isPlayingAudio ? 'Tạm dừng nhạc' : 'Bật giai điệu thư giãn'}
        >
          {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
