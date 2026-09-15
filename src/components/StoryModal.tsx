import React, { useEffect, useState } from 'react';
import { Story, Chapter } from '../types';
import { getStoryChapters } from '../data/mockData';
import {
  X,
  BookOpen,
  CheckCircle,
  Clock,
  Key,
  Heart,
  Eye,
  Sparkles,
  Lock,
  ArrowRight,
  Bookmark,
  Flower2,
  Star,
} from 'lucide-react';
import {
  subscribeToStoryStats,
  toggleStoryLike,
  toggleStoryFollow,
  recordStoryView,
} from '../lib/realtimeService';

interface StoryModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (storyId: string, chapterNumber: number) => void;
  onGoToPasswordGuide: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  story,
  isOpen,
  onClose,
  onSelectChapter,
  onGoToPasswordGuide,
}) => {
  const [chapterFilter, setChapterFilter] = useState<'all' | 'main' | 'extra'>('all');
  const [liveViews, setLiveViews] = useState<number>(story?.views || 0);
  const [liveLikes, setLiveLikes] = useState<number>(story?.likes || 0);
  const [liveFollowers, setLiveFollowers] = useState<number>(0);
  const [ratingAvg, setRatingAvg] = useState<string>('0');
  const [ratingCount, setRatingCount] = useState<number>(0);

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isFollowed, setIsFollowed] = useState<boolean>(false);

  // Reset tab and sync storage when story changes
  useEffect(() => {
    setChapterFilter('all');
    if (story) {
      recordStoryView(story.id);
      try {
        setIsLiked(localStorage.getItem(`mel_liked_story_${story.id}`) === 'true');
        setIsFollowed(localStorage.getItem(`mel_followed_story_${story.id}`) === 'true');
      } catch {}
    }
  }, [story?.id]);

  // Subscribe to realtime stats
  useEffect(() => {
    if (!story || !isOpen) return;

    const unsubscribe = subscribeToStoryStats(
      story.id,
      story.views,
      story.likes,
      (live) => {
        setLiveViews(live.views);
        setLiveLikes(live.likes);
        setLiveFollowers(live.followers);
        if (live.ratingCount > 0) {
          setRatingAvg((live.ratingSum / live.ratingCount).toFixed(1));
          setRatingCount(live.ratingCount);
        }
      }
    );

    return () => unsubscribe();
  }, [story?.id, story?.views, story?.likes, isOpen]);

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !story) return null;

  const chapters: Chapter[] = getStoryChapters(story.id);
  const isCompleted = story.status === 'completed';

  const mainChapters = chapters.filter((c) => !c.isExtra && c.partType !== 'extra');
  const extraChapters = chapters.filter((c) => c.isExtra || c.partType === 'extra');

  const displayedChapters =
    chapterFilter === 'main'
      ? mainChapters
      : chapterFilter === 'extra'
      ? extraChapters
      : chapters;

  const latestExtraChapter = extraChapters[extraChapters.length - 1];

  const handleToggleLike = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    try {
      if (nextState) localStorage.setItem(`mel_liked_story_${story.id}`, 'true');
      else localStorage.removeItem(`mel_liked_story_${story.id}`);
    } catch {}
    toggleStoryLike(story.id, nextState);
  };

  const handleToggleFollow = () => {
    const nextState = !isFollowed;
    setIsFollowed(nextState);
    try {
      if (nextState) localStorage.setItem(`mel_followed_story_${story.id}`, 'true');
      else localStorage.removeItem(`mel_followed_story_${story.id}`);
    } catch {}
    toggleStoryFollow(story.id, nextState);
  };

  return (
    <div
      id="story-detail-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id={`story-modal-${story.id}`}
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-pink-200/80 dark:border-stone-700 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Sticky Modal Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 sm:px-7 py-3.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-pink-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
              }`}
            >
              {isCompleted ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              <span>{isCompleted ? 'Đã hoàn thành' : 'Đang cập nhật'}</span>
            </span>
            <span className="font-serif text-sm sm:text-base font-bold text-stone-800 dark:text-stone-100 truncate">
              {story.title}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime
            </span>
          </div>

          <button
            type="button"
            id="close-story-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-pink-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-500 hover:text-pink-600 dark:text-stone-400 dark:hover:text-pink-300 transition-colors cursor-pointer shrink-0"
            title="Đóng cửa sổ (ESC)"
            aria-label="Đóng cửa sổ chi tiết truyện"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-7 custom-scrollbar">
          {/* Top Section: Cover & Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Cover image */}
            <div className="md:col-span-4 lg:col-span-3 space-y-3">
              <div className="relative aspect-3/4 rounded-2xl overflow-hidden border border-pink-200 dark:border-stone-700 shadow-md group">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-xs ${
                      isCompleted ? 'bg-emerald-500/90 text-white' : 'bg-sky-500/90 text-white'
                    }`}
                  >
                    {isCompleted ? 'Full (HE)' : 'Đang ra'}
                  </span>
                  {extraChapters.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/90 text-white backdrop-blur-md shadow-xs">
                      🌸 Phiên ngoại
                    </span>
                  )}
                </div>
              </div>

              {/* Actions below cover */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className={`py-1.5 px-2.5 rounded-xl border flex items-center justify-center gap-1 text-xs font-medium transition-colors cursor-pointer ${
                    isLiked
                      ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-pink-50'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isLiked ? 'Đã tim' : 'Thả tim'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`py-1.5 px-2.5 rounded-xl border flex items-center justify-center gap-1 text-xs font-medium transition-colors cursor-pointer ${
                    isFollowed
                      ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-amber-50'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isFollowed ? 'Đã theo dõi' : 'Theo dõi'}</span>
                </button>
              </div>
            </div>

            {/* Story Details */}
            <div className="md:col-span-8 lg:col-span-9 space-y-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {story.genre.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-pink-100/70 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/70 dark:border-pink-800/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100">
                  {story.title}
                </h2>
                {story.originalTitle && (
                  <p className="font-serif italic text-stone-400 dark:text-stone-500 text-xs sm:text-sm">
                    Tên gốc: {story.originalTitle}
                  </p>
                )}
              </div>

              {/* Realtime Stats Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-pink-100 dark:border-stone-800 text-xs sm:text-sm">
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Tác giả</span>
                  <strong className="text-stone-800 dark:text-stone-200">{story.author}</strong>
                </div>
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Dịch giả / Edit</span>
                  <strong className="text-pink-600 dark:text-pink-400">{story.translator}</strong>
                </div>
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Quy mô chương</span>
                  <strong className="text-stone-800 dark:text-stone-200 block">
                    {story.totalChapters} chương
                  </strong>
                  <span className="text-[10px] text-pink-600 dark:text-pink-400">
                    {story.mainChaptersCount || 40} chính + {story.extraChaptersCount || extraChapters.length || 5} ngoại
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Lượt đọc / Tim thật</span>
                  <strong className="text-stone-700 dark:text-stone-300 flex items-center gap-2 font-mono">
                    <span>{liveViews.toLocaleString()}</span>
                    <span className="text-pink-500 font-bold">♥ {liveLikes.toLocaleString()}</span>
                  </strong>
                  {ratingCount > 0 ? (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-mono">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {ratingAvg}/5 ({ratingCount} vote)
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Mới đăng
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  id="modal-read-c1-btn"
                  onClick={() => onSelectChapter(story.id, 1)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs sm:text-sm font-medium shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Đọc Chương 1 (Chính truyện)</span>
                </button>

                {latestExtraChapter && (
                  <button
                    type="button"
                    onClick={() => onSelectChapter(story.id, latestExtraChapter.chapterNumber)}
                    className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Flower2 className="w-4 h-4 text-rose-500" />
                    <span>Đọc Phiên ngoại mới nhất</span>
                  </button>
                )}

                <button
                  type="button"
                  id="modal-read-latest-btn"
                  onClick={() =>
                    onSelectChapter(story.id, chapters[chapters.length - 1]?.chapterNumber || 1)
                  }
                  className="px-3.5 py-2 rounded-xl bg-pink-50 dark:bg-stone-800 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-stone-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Đọc chương mới nhất
                </button>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-50/80 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 space-y-2.5">
            <h3 className="font-serif text-sm sm:text-base font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>Văn án câu chuyện:</span>
            </h3>
            <p className="font-serif text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed indent-4">
              {story.summary}
            </p>
          </div>

          {/* Password Notification Banner if has locked chapters */}
          {story.hasPassword && (
            <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  Lưu ý: Bộ truyện này có cài đặt pass ở các chương cao trào & phiên ngoại
                </p>
                <p className="text-amber-800 dark:text-amber-300 font-serif italic">
                  Gợi ý giải pass: "{story.passwordHint}"
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToPasswordGuide();
                  }}
                  className="inline-flex items-center gap-1 text-pink-600 dark:text-pink-400 font-semibold hover:underline cursor-pointer pt-1"
                >
                  <span>Xem hướng dẫn nhập pass chi tiết</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Table of Contents Inside Modal */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-pink-500" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-800 dark:text-stone-100">
                  Mục lục các chương
                </h3>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200/80 dark:border-stone-700 text-xs">
                <button
                  type="button"
                  onClick={() => setChapterFilter('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    chapterFilter === 'all'
                      ? 'bg-white dark:bg-stone-700 text-pink-600 dark:text-pink-300 shadow-2xs font-bold'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Tất cả ({chapters.length})
                </button>
                <button
                  type="button"
                  onClick={() => setChapterFilter('main')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    chapterFilter === 'main'
                      ? 'bg-white dark:bg-stone-700 text-pink-600 dark:text-pink-300 shadow-2xs font-bold'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Chính truyện ({mainChapters.length})
                </button>
                <button
                  type="button"
                  onClick={() => setChapterFilter('extra')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    chapterFilter === 'extra'
                      ? 'bg-rose-500 text-white shadow-2xs font-bold'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  <span>🌸 Ngoại truyện</span>
                  <span className="text-[10px]">({extraChapters.length})</span>
                </button>
              </div>
            </div>

            {/* Chapter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {displayedChapters.map((ch) => {
                const isExtra = ch.isExtra || ch.partType === 'extra';
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => onSelectChapter(story.id, ch.chapterNumber)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isExtra
                        ? 'bg-rose-50/50 hover:bg-rose-100/60 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 border-rose-200 dark:border-rose-900/60'
                        : 'bg-stone-50 hover:bg-pink-50/60 dark:bg-stone-800/60 dark:hover:bg-stone-800 border-stone-200/70 dark:border-stone-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-stone-400">{ch.publishedAt}</span>
                        {isExtra && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            🌸 PN
                          </span>
                        )}
                      </div>
                      <p
                        className={`font-serif text-xs sm:text-sm font-medium truncate ${
                          isExtra ? 'text-rose-900 dark:text-rose-200 font-semibold' : 'text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        {ch.title}
                      </p>
                    </div>

                    {ch.isLocked ? (
                      <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-medium flex items-center gap-1 shrink-0">
                        <Lock className="w-3 h-3" />
                        Pass
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-medium shrink-0">
                        Đọc
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
