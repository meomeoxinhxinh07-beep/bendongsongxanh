import React, { useState, useEffect } from 'react';
import { Story } from '../types';
import { Search, X, BookOpen, Key, Sparkles, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  onSelectStory: (storyId: string) => void;
  onSelectChapter: (storyId: string, chapterNumber: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  stories,
  onSelectStory,
  onSelectChapter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = stories.filter((story) => {
    const q = searchTerm.toLowerCase();
    return (
      story.title.toLowerCase().includes(q) ||
      story.author.toLowerCase().includes(q) ||
      story.summary.toLowerCase().includes(q) ||
      story.genre.some((g) => g.toLowerCase().includes(q))
    );
  });

  return (
    <div
      id="blog-search-modal"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white dark:bg-stone-900 border border-pink-200 dark:border-stone-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-pink-100 dark:border-stone-800 flex items-center gap-3 bg-pink-50/40 dark:bg-stone-800/40">
          <Search className="w-5 h-5 text-pink-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên truyện, tác giả, thể loại (thanh xuân, ngọt sủng...)..."
            autoFocus
            className="w-full bg-transparent border-none text-stone-800 dark:text-stone-100 placeholder-stone-400 text-sm sm:text-base focus:outline-hidden font-serif"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-700 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {searchTerm.trim() === '' ? (
            <div className="text-center py-8 space-y-2">
              <span className="text-3xl select-none">🌸</span>
              <p className="text-sm font-serif text-stone-600 dark:text-stone-400">
                Gõ tên truyện hoặc từ khóa để tìm kiếm nhanh trong nhà Mel
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {['Thanh xuân vườn trường', 'HE', 'Ngọt sủng', 'Mùa hè'].map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => setSearchTerm(keyword)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-stone-800 text-pink-700 dark:text-pink-300 border border-pink-200/50 dark:border-stone-700 hover:bg-pink-100 transition-colors cursor-pointer"
                  >
                    #{keyword}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="font-serif text-stone-500 dark:text-stone-400 text-sm">
                Không tìm thấy tác phẩm nào phù hợp với từ khóa "{searchTerm}".
              </p>
              <p className="text-xs text-stone-400">
                Hãy thử tìm kiếm với từ khóa ngắn hơn hoặc theo tên tác giả nhé!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-1">
                Tìm thấy {filtered.length} kết quả
              </div>
              {filtered.map((story) => (
                <div
                  key={story.id}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700 flex items-start justify-between gap-4 hover:border-pink-300 dark:hover:border-pink-800 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 font-medium">
                        {story.status === 'completed' ? 'Hoàn' : 'Đang ra'}
                      </span>
                      {Boolean(story.extraChaptersCount) && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-medium border border-rose-200 dark:border-rose-900">
                          🌸 +{story.extraChaptersCount} ngoại
                        </span>
                      )}
                      <h4
                        onClick={() => {
                          onSelectStory(story.id);
                          onClose();
                        }}
                        className="font-serif text-sm sm:text-base font-bold text-stone-800 dark:text-stone-100 hover:text-pink-600 dark:hover:text-pink-400 cursor-pointer"
                      >
                        {story.title}
                      </h4>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                      Tác giả: {story.author} • Edit: {story.translator}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-300 font-serif line-clamp-1">
                      {story.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-center">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectStory(story.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>Xem</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 px-5 bg-stone-50 dark:bg-stone-800/80 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
          <span>Nhấn ESC hoặc bấm ra ngoài để đóng</span>
          <span className="font-serif italic text-pink-500">better and better 🌸</span>
        </div>
      </div>
    </div>
  );
};
