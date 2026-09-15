import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Sparkles,
  Heart,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Story } from '../types';

interface SidebarStoryDropdownProps {
  stories: Story[];
  selectedStoryId: string;
  onSelectStory: (storyId: string) => void;
}

export const SidebarStoryDropdown: React.FC<SidebarStoryDropdownProps> = ({
  stories,
  selectedStoryId,
  onSelectStory,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusTab, setStatusTab] = useState<'all' | 'completed' | 'ongoing'>('all');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [canScrollUp, setCanScrollUp] = useState<boolean>(false);
  const [canScrollDown, setCanScrollDown] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const selectedStory = stories.find((s) => s.id === selectedStoryId);

  // Close dropdown when clicking outside
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

  // Filter stories based on search term and status tab
  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.genre.some((g) => g.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusTab === 'completed') return story.status === 'completed';
    if (statusTab === 'ongoing') return story.status === 'ongoing';
    return true;
  });

  // Calculate scroll progress and update scroll indicator
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
      // Small timeout to allow container to mount and layout
      const timer = setTimeout(updateScrollState, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, filteredStories.length]);

  const handleScrollUp = () => {
    if (listContainerRef.current) {
      listContainerRef.current.scrollBy({ top: -110, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if (listContainerRef.current) {
      listContainerRef.current.scrollBy({ top: 110, behavior: 'smooth' });
    }
  };

  const handleSelect = (storyId: string) => {
    onSelectStory(storyId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* 1. TRIGGER BUTTON WITH ADAPTIVE BACKGROUND AND HIGH CONTRAST TEXT */}
      <button
        type="button"
        id="sidebar-story-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group w-full text-left p-3 sm:p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 border-2 ${
          isOpen
            ? 'bg-pink-50/90 border-pink-500 shadow-md shadow-pink-500/10 ring-2 ring-pink-500/20 dark:bg-stone-950 dark:border-pink-500 dark:shadow-black/60 dark:ring-pink-500/30'
            : 'bg-stone-50/90 hover:bg-pink-50/60 border-stone-200 hover:border-pink-300 shadow-2xs dark:bg-stone-950 dark:hover:bg-stone-800/90 dark:border-stone-700 dark:hover:border-pink-400'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Decorative Solid Sakura Book Icon Badge */}
          <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0 shadow-xs border border-pink-500">
            <BookOpen className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1">
              <span>Tác phẩm chọn lọc</span>
              <Sparkles className="w-2.5 h-2.5" />
            </span>

            {selectedStory ? (
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-serif text-xs sm:text-[13px] font-bold text-stone-800 dark:text-white truncate">
                  {selectedStory.title}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium shrink-0 ${
                    selectedStory.status === 'completed'
                      ? 'bg-pink-100 text-pink-700 border border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  {selectedStory.status === 'completed' ? '🌸 Full' : '🍃 Đang ra'}
                </span>
              </div>
            ) : (
              <p className="font-serif text-xs text-stone-500 dark:text-stone-400 italic truncate">
                Nhấp chọn một bộ truyện để xem...
              </p>
            )}
          </div>
        </div>

        {/* Decorated Dropdown Arrow indicator */}
        <div className="flex items-center gap-1 shrink-0 pl-1">
          <span className="text-xs select-none">🌸</span>
          <div
            className={`p-1.5 rounded-lg transition-transform duration-300 ${
              isOpen
                ? 'rotate-180 bg-pink-600 text-white shadow-xs'
                : 'bg-stone-100 text-pink-600 dark:bg-stone-800 dark:text-pink-400 group-hover:bg-pink-100 dark:group-hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </button>

      {/* 2. DECORATED DROPDOWN MENU PANEL WITH ADAPTIVE BACKGROUND */}
      {isOpen && (
        <div
          id="sidebar-story-dropdown-menu"
          className="absolute z-50 left-0 right-0 mt-2 p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-stone-950 border-2 border-stone-200 dark:border-stone-700 shadow-xl dark:shadow-2xl dark:shadow-black/90 ring-1 ring-stone-900/5 dark:ring-stone-800 animate-dropdown-in"
        >
          {/* Vintage top decorative ribbon */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-stone-800 dark:text-white">
              <Sparkles className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
              <span>Thư viện truyện Mellifluous</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-50 dark:bg-stone-900 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-stone-700">
              {filteredStories.length} tác phẩm
            </span>
          </div>

          {/* Quick Search Filter inside Dropdown */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tên truyện, tác giả, tag..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-white placeholder:text-stone-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 mb-2.5 pb-2 border-b border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setStatusTab('all')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                statusTab === 'all'
                  ? 'bg-pink-600 text-white font-semibold shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-stone-700'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setStatusTab('completed')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                statusTab === 'completed'
                  ? 'bg-pink-600 text-white font-semibold shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-stone-700'
              }`}
            >
              🌸 Đã hoàn
            </button>
            <button
              type="button"
              onClick={() => setStatusTab('ongoing')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                statusTab === 'ongoing'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-stone-700'
              }`}
            >
              🍃 Đang ra
            </button>
          </div>

          {/* 3. VISUAL SCROLL PROGRESS & CONTROLS */}
          <div className="flex items-center justify-between gap-2 px-1 mb-1 text-[10px] text-pink-600 dark:text-pink-400 font-medium select-none">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <SlidersHorizontal className="w-3 h-3 text-pink-500 dark:text-pink-400 shrink-0" />
              <span>Thanh trượt danh mục:</span>
              {/* Custom Scroll Progress Bar */}
              <div className="flex-1 max-w-[90px] h-1.5 bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden border border-stone-200 dark:border-stone-800">
                <div
                  className="h-full bg-pink-500 rounded-full transition-all duration-150"
                  style={{ width: `${Math.max(12, scrollProgress)}%` }}
                />
              </div>
            </div>

            {/* Quick Scroll Up/Down Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleScrollUp}
                disabled={!canScrollUp}
                title="Trượt lên"
                className={`p-1 rounded-md border text-[10px] transition-all flex items-center justify-center ${
                  canScrollUp
                    ? 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-700 dark:text-pink-400 border-stone-200 dark:border-stone-700 cursor-pointer shadow-2xs'
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
                    ? 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-700 dark:text-pink-400 border-stone-200 dark:border-stone-700 cursor-pointer shadow-2xs'
                    : 'opacity-40 text-stone-400 dark:text-stone-600 border-transparent cursor-default'
                }`}
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 4. SCROLLABLE STORY ITEMS CONTAINER WITH SAKURA SCROLLBAR */}
          <div
            ref={listContainerRef}
            onScroll={updateScrollState}
            className="sakura-scrollbar max-h-64 sm:max-h-72 overflow-y-auto space-y-1.5 pr-1.5 py-1"
          >
            {filteredStories.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-500 dark:text-stone-400">
                <p className="font-serif italic">Không tìm thấy tác phẩm phù hợp 🍃</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusTab('all');
                  }}
                  className="mt-2 text-[11px] text-pink-600 dark:text-pink-400 underline cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              filteredStories.map((story) => {
                const isSelected = story.id === selectedStoryId;
                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => handleSelect(story.id)}
                    className={`w-full text-left p-2 sm:p-2.5 rounded-xl transition-all duration-150 cursor-pointer flex items-center gap-2.5 group border ${
                      isSelected
                        ? 'bg-pink-50 dark:bg-stone-900 border-pink-500 text-stone-900 dark:text-white shadow-2xs'
                        : 'bg-stone-50/70 dark:bg-stone-900/90 hover:bg-pink-50/50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-800 hover:border-pink-200 dark:hover:border-stone-700'
                    }`}
                  >
                    {/* Story Tiny Cover Thumbnail with rounded frame */}
                    <div className="w-9 h-12 rounded-lg overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700 shadow-2xs relative">
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-white font-mono text-center leading-tight py-0.2">
                        {story.completedChapters}c
                      </span>
                    </div>

                    {/* Story Information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-serif text-xs font-bold text-stone-800 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-300 truncate">
                          {story.title}
                        </span>
                        {isSelected && (
                          <span className="p-0.5 rounded-full bg-pink-600 text-white shrink-0 shadow-2xs">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-sans truncate">
                        Tác giả: {story.author}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                            story.status === 'completed'
                              ? 'bg-pink-100 text-pink-700 border border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {story.status === 'completed' ? '🌸 Full HE' : '🍃 Đang ra'}
                        </span>
                        {Boolean(story.extraChaptersCount) && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                            +{story.extraChaptersCount} ngoại
                          </span>
                        )}
                        <span className="text-[9px] text-stone-500 dark:text-stone-400 truncate">
                          {story.genre[0]}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Bottom helper tip */}
          <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400">
            <span className="italic">Nhấp truyện để mở bài giới thiệu</span>
            <span className="text-pink-600 dark:text-pink-400 flex items-center gap-0.5 font-medium">
              <Heart className="w-2.5 h-2.5 fill-current" />
              Mellifluous
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
