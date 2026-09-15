import React, { useState, useRef, useEffect } from 'react';
import {
  Tag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import { Story } from '../types';

interface SidebarGenreDropdownProps {
  stories: Story[];
  selectedGenre: string;
  onFilterGenre: (genre: string) => void;
}

// Map each genre to a fitting charming emoji
const GENRE_EMOJIS: Record<string, string> = {
  'Thanh xuân vườn trường': '🏫',
  'Ngọt sủng': '🍰',
  'Chữa lành': '☕',
  'HE': '🌸',
  'Học đường': '🎒',
  'Thầm yêu': '💌',
  'Song hướng': '💫',
  'Mùa hè': '🌻',
  'Đô thị tình duyên': '🏙️',
  'Gương vỡ lại lành': '🪞',
  'Nhẹ nhàng': '🍃',
  'Yêu thầm': '🕊️',
  'Ấn ký mùa hạ': '🌊',
  'Cứu rỗi': '✨',
  'Cưới trước yêu sau': '💍',
  'Hào môn thế gia': '💎',
};

export const SidebarGenreDropdown: React.FC<SidebarGenreDropdownProps> = ({
  stories,
  selectedGenre,
  onFilterGenre,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [canScrollUp, setCanScrollUp] = useState<boolean>(false);
  const [canScrollDown, setCanScrollDown] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // All unique genres from all stories
  const allGenres: string[] = Array.from(new Set<string>(stories.flatMap((s) => s.genre)));

  // Count how many stories match each genre
  const getGenreCount = (genre: string) => {
    return stories.filter((s) => s.genre.includes(genre)).length;
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update scroll track indicator
  const updateScrollState = () => {
    const el = listContainerRef.current;
    if (!el) return;

    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      setCanScrollUp(false);
      setCanScrollDown(false);
      return;
    }

    const currentScroll = el.scrollTop;
    const progress = Math.min(100, Math.max(0, (currentScroll / maxScroll) * 100));
    setScrollProgress(progress);
    setCanScrollUp(currentScroll > 5);
    setCanScrollDown(currentScroll < maxScroll - 5);
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(updateScrollState, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleScrollUp = () => {
    if (listContainerRef.current) {
      listContainerRef.current.scrollBy({ top: -90, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if (listContainerRef.current) {
      listContainerRef.current.scrollBy({ top: 90, behavior: 'smooth' });
    }
  };

  const handleSelect = (genre: string) => {
    onFilterGenre(genre);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* 1. TRIGGER BUTTON WITH ADAPTIVE BACKGROUND AND HIGH CONTRAST TEXT */}
      <button
        type="button"
        id="sidebar-genre-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group w-full text-left p-3 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 border-2 ${
          isOpen
            ? 'bg-emerald-50/90 border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20 dark:bg-stone-950 dark:border-emerald-500 dark:shadow-black/60 dark:ring-emerald-500/30'
            : 'bg-stone-50/90 hover:bg-emerald-50/60 border-stone-200 hover:border-emerald-300 shadow-2xs dark:bg-stone-950 dark:hover:bg-stone-800/90 dark:border-stone-700 dark:hover:border-emerald-400'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Decorative Solid Tag Badge */}
          <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs border border-emerald-500">
            <Tag className="w-3.5 h-3.5" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span>Chuyên mục / Thể loại</span>
              <Sparkles className="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400" />
            </span>

            <div className="flex items-center gap-1.5 truncate">
              <span className="font-serif text-xs sm:text-[13px] font-bold text-stone-800 dark:text-white truncate">
                {selectedGenre === 'all'
                  ? '✦ Tất cả thể loại mùa hè'
                  : `${GENRE_EMOJIS[selectedGenre] || '🏷️'} ${selectedGenre}`}
              </span>
              {selectedGenre !== 'all' && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 shrink-0">
                  {getGenreCount(selectedGenre)} bộ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dropdown arrow with mint leaf styling */}
        <div className="flex items-center gap-1 shrink-0 pl-1">
          <span className="text-xs select-none">🍃</span>
          <div
            className={`p-1.5 rounded-lg transition-transform duration-300 ${
              isOpen
                ? 'rotate-180 bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-emerald-600 dark:bg-stone-800 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </button>

      {/* 2. DROPDOWN MENU PANEL WITH ADAPTIVE BACKGROUND */}
      {isOpen && (
        <div
          id="sidebar-genre-dropdown-menu"
          className="absolute z-50 left-0 right-0 mt-2 p-3 rounded-2xl bg-white dark:bg-stone-950 border-2 border-stone-200 dark:border-stone-700 shadow-xl dark:shadow-2xl dark:shadow-black/90 ring-1 ring-stone-900/5 dark:ring-stone-800 animate-dropdown-in"
        >
          {/* Top header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-stone-800 dark:text-white">
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Thẻ phân loại truyện</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-stone-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-stone-700">
              {allGenres.length + 1} danh mục
            </span>
          </div>

          {/* 3. VISUAL SCROLL PROGRESS & CONTROLS */}
          <div className="flex items-center justify-between gap-2 px-1 mb-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium select-none">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <SlidersHorizontal className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Thanh trượt thẻ:</span>
              {/* Progress track */}
              <div className="flex-1 max-w-[90px] h-1.5 bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden border border-stone-200 dark:border-stone-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-150"
                  style={{ width: `${Math.max(12, scrollProgress)}%` }}
                />
              </div>
            </div>

            {/* Scroll Up/Down Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleScrollUp}
                disabled={!canScrollUp}
                title="Trượt lên"
                className={`p-1 rounded-md border text-[10px] transition-all flex items-center justify-center ${
                  canScrollUp
                    ? 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-700 dark:text-emerald-400 border-stone-200 dark:border-stone-700 cursor-pointer shadow-2xs'
                    : 'opacity-40 text-stone-400 dark:text-stone-600 border-transparent cursor-default'
                }`}
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleScrollDown}
                disabled={!canScrollDown}
                title="Trượt xuống"
                className={`p-1 rounded-md border text-[10px] transition-all flex items-center justify-center ${
                  canScrollDown
                    ? 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-700 dark:text-emerald-400 border-stone-200 dark:border-stone-700 cursor-pointer shadow-2xs'
                    : 'opacity-40 text-stone-400 dark:text-stone-600 border-transparent cursor-default'
                }`}
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 4. SCROLLABLE GENRE ITEMS LIST WITH EMERALD SCROLLBAR */}
          <div
            ref={listContainerRef}
            onScroll={updateScrollState}
            className="emerald-scrollbar max-h-56 overflow-y-auto space-y-1 pr-1 py-0.5"
          >
            {/* Option: All Genres */}
            <button
              type="button"
              onClick={() => handleSelect('all')}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-between group border ${
                selectedGenre === 'all'
                  ? 'bg-emerald-50 dark:bg-stone-900 border-emerald-500 text-emerald-950 dark:text-white font-semibold shadow-2xs'
                  : 'bg-stone-50/70 dark:bg-stone-900/90 hover:bg-emerald-50/50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-800 hover:border-emerald-200 dark:hover:border-stone-700'
              }`}
            >
              <span className="flex items-center gap-2 text-xs font-serif">
                <span className="text-emerald-600 dark:text-emerald-400">✦</span>
                <span className="text-stone-800 dark:text-white">Tất cả thể loại mùa hè</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  {stories.length}
                </span>
                {selectedGenre === 'all' && (
                  <span className="p-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </button>

            {/* All Specific Genres */}
            {allGenres.map((genre) => {
              const isSelected = selectedGenre === genre;
              const count = getGenreCount(genre);
              const emoji = GENRE_EMOJIS[genre] || '🏷️';

              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleSelect(genre)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-between group border ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-stone-900 border-emerald-500 text-emerald-950 dark:text-white font-semibold shadow-2xs'
                      : 'bg-stone-50/70 dark:bg-stone-900/90 hover:bg-emerald-50/50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-800 hover:border-emerald-200 dark:hover:border-stone-700'
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs font-serif truncate">
                    <span className="text-xs">{emoji}</span>
                    <span className="truncate text-stone-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300">{genre}</span>
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                      {count}
                    </span>
                    {isSelected && (
                      <span className="p-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom quick hint */}
          <div className="mt-2 pt-1.5 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400 italic text-center">
            Chọn thẻ để lọc truyện trên trang chủ ngay lập tức 🍃
          </div>
        </div>
      )}
    </div>
  );
};
