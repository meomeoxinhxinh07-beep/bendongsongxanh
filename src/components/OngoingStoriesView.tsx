import React, { useState } from 'react';
import { Story, Announcement, RecentUpdate } from '../types';
import { StoryCard } from './StoryCard';
import { Sidebar } from './Sidebar';
import {
  Clock,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Calendar,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';

interface OngoingStoriesViewProps {
  stories: Story[];
  announcements: Announcement[];
  recentUpdates: RecentUpdate[];
  onBackToHome: () => void;
  onOpenStory: (storyId: string) => void;
  onSelectChapter: (storyId: string, chapterNumber: number) => void;
}

export const OngoingStoriesView: React.FC<OngoingStoriesViewProps> = ({
  stories,
  announcements,
  recentUpdates,
  onBackToHome,
  onOpenStory,
  onSelectChapter,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'views' | 'likes'>('updated');

  // Filter only ongoing stories
  const ongoingStories = stories.filter((s) => s.status === 'ongoing');

  // Extract all unique genres
  const allGenres = Array.from(
    new Set(ongoingStories.flatMap((s) => s.genre))
  );

  // Apply genre filter and sorting
  const filtered = ongoingStories
    .filter((s) => (selectedGenre === 'all' ? true : s.genre.includes(selectedGenre)))
    .sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'likes') return b.likes - a.likes;
      return 0;
    });

  return (
    <div id="ongoing-stories-page" className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
        <button
          type="button"
          onClick={onBackToHome}
          className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Trang chủ</span>
        </button>
        <span>/</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
          Truyện đang tiến hành
        </span>
      </nav>

      {/* Dedicated Page Hero Banner */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/70 to-green-50/60 dark:from-emerald-950/40 dark:via-stone-900 dark:to-stone-900 border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs overflow-hidden">
        {/* Decorative Tape */}
        <div
          className="absolute -top-3 left-10 w-28 h-6 bg-emerald-400/80 dark:bg-emerald-600/80 rotate-[-1deg] rounded-xs shadow-2xs border border-white/50"
          style={{ clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tracking-wide">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>KHU VƯỜN TRUYỆN ĐANG TIẾN HÀNH • CẬP NHẬT ĐỀU ĐẶN</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
              Truyện Đang Tiến Hành
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
              Cùng Mel đồng hành mỗi tuần, theo dõi từng bước chân ngọt ngào của các nhân vật. Từng chương mới được chuyển ngữ tỉ mỉ, đong đầy cảm xúc mùa hạ trong từng câu chữ.
            </p>

            {/* Posting Schedule Indicator */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-200 border border-emerald-200/60 dark:border-stone-700 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                Lịch ra chương: <strong>Thứ 3 • Thứ 5 • Thứ 7</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-200 border border-emerald-200/60 dark:border-stone-700 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                <strong>{ongoingStories.length}</strong> dự án đang chạy
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 dark:bg-stone-800 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-stone-700 shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Đều đặn không drop
              </span>
            </div>
          </div>

          {/* Right illustration stamp */}
          <div className="shrink-0 hidden md:flex flex-col items-center justify-center w-36 h-36 rounded-2xl bg-white/80 dark:bg-stone-800/80 border-2 border-dashed border-emerald-300 dark:border-emerald-800/80 p-3 shadow-inner -rotate-2">
            <span className="text-4xl select-none">🍃</span>
            <span className="font-serif text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-2 uppercase tracking-widest">
              Updating
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400">
              Mùa hè này
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout with 8 cols feed + 4 cols sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Controls Bar: Genre Filters & Sorting */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-100 dark:border-stone-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Lọc theo thể loại:
                </span>
              </div>

              {/* Sorting options */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-400">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                >
                  <option value="updated">Mới cập nhật</option>
                  <option value="views">Lượt đọc nhiều nhất</option>
                  <option value="likes">Yêu thích nhiều nhất</option>
                </select>
              </div>
            </div>

            {/* Genre badges list */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setSelectedGenre('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  selectedGenre === 'all'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-700'
                }`}
              >
                Tất cả ({ongoingStories.length})
              </button>

              {allGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    selectedGenre === genre
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-700'
                  }`}
                >
                  #{genre}
                </button>
              ))}
            </div>
          </div>

          {/* Stories List */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <p className="font-serif text-lg text-stone-600 dark:text-stone-300">
                Không tìm thấy truyện đang tiến hành nào thuộc thể loại #{selectedGenre}.
              </p>
              <button
                type="button"
                onClick={() => setSelectedGenre('all')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Xem tất cả truyện đang tiến hành
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onOpenStory={onOpenStory}
                  onSelectChapter={onSelectChapter}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4">
          <Sidebar
            stories={stories}
            announcements={announcements}
            recentUpdates={recentUpdates}
            onSelectStory={onOpenStory}
            onSelectChapter={onSelectChapter}
            onFilterGenre={(g) => setSelectedGenre(g)}
          />
        </div>
      </div>
    </div>
  );
};
