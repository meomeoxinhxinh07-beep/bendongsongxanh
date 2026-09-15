import React, { useState } from 'react';
import { Story, Announcement, RecentUpdate } from '../types';
import { StoryCard } from './StoryCard';
import { Sidebar } from './Sidebar';
import {
  CheckCircle2,
  Sparkles,
  BookOpen,
  Filter,
  ArrowLeft,
  Heart,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface CompletedStoriesViewProps {
  stories: Story[];
  announcements: Announcement[];
  recentUpdates: RecentUpdate[];
  onBackToHome: () => void;
  onOpenStory: (storyId: string) => void;
  onSelectChapter: (storyId: string, chapterNumber: number) => void;
}

export const CompletedStoriesView: React.FC<CompletedStoriesViewProps> = ({
  stories,
  announcements,
  recentUpdates,
  onBackToHome,
  onOpenStory,
  onSelectChapter,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'views' | 'likes'>('updated');

  // Filter only completed stories
  const completedStories = stories.filter((s) => s.status === 'completed');

  // Extract all unique genres from completed stories
  const allGenres = Array.from(
    new Set(completedStories.flatMap((s) => s.genre))
  );

  // Apply genre filter and sorting
  const filtered = completedStories
    .filter((s) => (selectedGenre === 'all' ? true : s.genre.includes(selectedGenre)))
    .sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'likes') return b.likes - a.likes;
      return 0; // Default order
    });

  const totalViews = completedStories.reduce((acc, curr) => acc + curr.views, 0);
  const totalLikes = completedStories.reduce((acc, curr) => acc + curr.likes, 0);

  return (
    <div id="completed-stories-page" className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
        <button
          type="button"
          onClick={onBackToHome}
          className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Trang chủ</span>
        </button>
        <span>/</span>
        <span className="text-pink-600 dark:text-pink-400 font-semibold">
          Truyện đã hoàn thành
        </span>
      </nav>

      {/* Dedicated Page Hero Banner */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-pink-50 via-rose-50/70 to-amber-50/60 dark:from-pink-950/40 dark:via-stone-900 dark:to-stone-900 border border-pink-200/80 dark:border-pink-900/60 shadow-xs overflow-hidden">
        {/* Decorative Tape */}
        <div
          className="absolute -top-3 left-10 w-28 h-6 bg-pink-400/80 dark:bg-pink-600/80 rotate-[-1deg] rounded-xs shadow-2xs border border-white/50"
          style={{ clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/90 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 text-xs font-semibold tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-pink-500" />
              <span>KHO TÀNG TRUYỆN ĐÃ HOÀN • 100% HAPPY ENDING</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
              Truyện Đã Hoàn Thành
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
              Trọn vẹn tình đầu, kết thúc viên mãn. Những câu chuyện đã kết thúc trọn vẹn, được biên tập kỹ lưỡng, yên tâm lọt hố thâu đêm suốt sáng mà không lo phải chờ đợi chương mới từng ngày.
            </p>

            {/* Quick Stats Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-200 border border-pink-200/60 dark:border-stone-700 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-pink-500" />
                <strong>{completedStories.length}</strong> bộ truyện full
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-200 border border-pink-200/60 dark:border-stone-700 shadow-2xs">
                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                {totalViews.toLocaleString('vi-VN')} lượt đọc
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-200 border border-pink-200/60 dark:border-stone-700 shadow-2xs">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                {totalLikes.toLocaleString('vi-VN')} yêu thích
              </span>
            </div>
          </div>

          {/* Right illustration stamp */}
          <div className="shrink-0 hidden md:flex flex-col items-center justify-center w-36 h-36 rounded-2xl bg-white/80 dark:bg-stone-800/80 border-2 border-dashed border-pink-300 dark:border-pink-800/80 p-3 shadow-inner rotate-2">
            <span className="text-4xl select-none">🌸</span>
            <span className="font-serif text-xs font-bold text-pink-700 dark:text-pink-300 mt-2 uppercase tracking-widest">
              Full • HE
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400">
              Trọn vẹn 100%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout with 8 cols feed + 4 cols sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Controls Bar: Genre Filters & Sorting */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-pink-100 dark:border-stone-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-pink-500" />
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
                  className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-pink-400 cursor-pointer"
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
                    ? 'bg-pink-500 text-white font-semibold shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-pink-50 dark:hover:bg-stone-700'
                }`}
              >
                Tất cả ({completedStories.length})
              </button>

              {allGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    selectedGenre === genre
                      ? 'bg-pink-500 text-white font-semibold shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-pink-50 dark:hover:bg-stone-700'
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
                Không tìm thấy truyện hoàn nào thuộc thể loại #{selectedGenre}.
              </p>
              <button
                type="button"
                onClick={() => setSelectedGenre('all')}
                className="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-medium hover:bg-pink-600 transition-colors cursor-pointer"
              >
                Xem tất cả truyện đã hoàn
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
