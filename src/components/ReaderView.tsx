import React, { useState, useEffect, useRef } from 'react';
import { Story, Chapter, RealtimeComment } from '../types';
import {
  subscribeToComments,
  postRealtimeComment,
  postCommentReply,
  deleteComment,
  subscribeToStoryStats,
  toggleStoryLike,
  recordStoryView,
} from '../lib/realtimeService';
import { useAuth } from '../lib/authContext';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  KeyRound,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  BookOpen,
  Send,
  HelpCircle,
  Eye,
  Type,
  X,
  Search,
  ArrowUpDown,
  Check,
  Home,
  ArrowUp,
  RotateCcw,
  BookMarked,
  Clock,
  SunMedium,
  Moon,
  Palette,
  CornerDownRight,
  Reply,
  Trash2,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';


export type ReaderThemeKey = 'default' | 'sepia' | 'matcha' | 'mocha' | 'dark';

interface ReaderThemeConfig {
  id: ReaderThemeKey;
  name: string;
  desc: string;
  bgHex: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  dividerColor: string;
  navBg: string;
  navBorder: string;
  secondaryBtnBg: string;
  noteBg: string;
  noteBorder: string;
}

export const READER_THEMES: Record<ReaderThemeKey, ReaderThemeConfig> = {
  default: {
    id: 'default',
    name: 'Trắng ngà',
    desc: 'Tự nhiên & sắc nét',
    bgHex: '#fffaf5',
    cardBg: 'bg-white dark:bg-stone-900',
    cardBorder: 'border-pink-100/90 dark:border-stone-800',
    textColor: 'text-stone-800 dark:text-stone-100',
    subtextColor: 'text-stone-500 dark:text-stone-400',
    accentColor: 'text-pink-600 dark:text-pink-400',
    dividerColor: 'border-pink-100 dark:border-stone-800',
    navBg: 'bg-white/95 dark:bg-stone-900/95',
    navBorder: 'border-pink-100 dark:border-stone-700',
    secondaryBtnBg: 'bg-stone-100 hover:bg-pink-50 dark:bg-stone-800 dark:hover:bg-stone-700',
    noteBg: 'bg-amber-50/80 dark:bg-stone-800/80',
    noteBorder: 'border-amber-200/70 dark:border-stone-700',
  },
  sepia: {
    id: 'sepia',
    name: 'Vàng dịu mắt',
    desc: 'Lọc ánh sáng xanh, chống lóa',
    bgHex: '#fbf0d9',
    cardBg: 'bg-[#fcf4e4] dark:bg-[#2b241c]',
    cardBorder: 'border-[#ebd7b0] dark:border-[#423628]',
    textColor: 'text-[#3c2f1d] dark:text-[#f2e7d5]',
    subtextColor: 'text-[#7e6443] dark:text-[#bda88e]',
    accentColor: 'text-[#b45309] dark:text-[#f59e0b]',
    dividerColor: 'border-[#ecd9b5] dark:border-[#423628]',
    navBg: 'bg-[#fcf4e4]/95 dark:bg-[#2b241c]/95',
    navBorder: 'border-[#ebd7b0] dark:border-[#423628]',
    secondaryBtnBg: 'bg-[#f3e5c8] hover:bg-[#ead6b1] dark:bg-[#382e22] dark:hover:bg-[#4a3d2e]',
    noteBg: 'bg-[#f4e6c9]/80 dark:bg-[#382e22]/80',
    noteBorder: 'border-[#dec59b] dark:border-[#52412e]',
  },
  matcha: {
    id: 'matcha',
    name: 'Xanh trà dưỡng mắt',
    desc: 'Thư giãn cơ mi, giảm mỏi mắt',
    bgHex: '#eef6ee',
    cardBg: 'bg-[#f3f9f3] dark:bg-[#1a291e]',
    cardBorder: 'border-[#cfe5d1] dark:border-[#2b4231]',
    textColor: 'text-[#193520] dark:text-[#e4f3e6]',
    subtextColor: 'text-[#446e4d] dark:text-[#9bc2a3]',
    accentColor: 'text-[#15803d] dark:text-[#4ade80]',
    dividerColor: 'border-[#d7ead9] dark:border-[#2b4231]',
    navBg: 'bg-[#f3f9f3]/95 dark:bg-[#1a291e]/95',
    navBorder: 'border-[#cfe5d1] dark:border-[#2b4231]',
    secondaryBtnBg: 'bg-[#e0f0e2] hover:bg-[#d0e7d3] dark:bg-[#25392b] dark:hover:bg-[#314a38]',
    noteBg: 'bg-[#e4f2e5]/80 dark:bg-[#233829]/80',
    noteBorder: 'border-[#bcdabc] dark:border-[#38533e]',
  },
  mocha: {
    id: 'mocha',
    name: 'Cà phê ấm',
    desc: 'Êm đềm, tương phản dịu',
    bgHex: '#f3ece2',
    cardBg: 'bg-[#f7f2ea] dark:bg-[#26211d]',
    cardBorder: 'border-[#ded1bf] dark:border-[#3d342d]',
    textColor: 'text-[#38291e] dark:text-[#eee4db]',
    subtextColor: 'text-[#786150] dark:text-[#b49e8d]',
    accentColor: 'text-[#9a3412] dark:text-[#fb923c]',
    dividerColor: 'border-[#e4d8c8] dark:border-[#3d342d]',
    navBg: 'bg-[#f7f2ea]/95 dark:bg-[#26211d]/95',
    navBorder: 'border-[#ded1bf] dark:border-[#3d342d]',
    secondaryBtnBg: 'bg-[#ebdccb] hover:bg-[#dfcdb9] dark:bg-[#362e28] dark:hover:bg-[#483d35]',
    noteBg: 'bg-[#ede0cf]/80 dark:bg-[#362e28]/80',
    noteBorder: 'border-[#d5beaa] dark:border-[#4d4037]',
  },
  dark: {
    id: 'dark',
    name: 'Đêm đen sao trời',
    desc: 'Dành cho đọc trong bóng tối',
    bgHex: '#141416',
    cardBg: 'bg-[#1a1a1e] dark:bg-[#141416]',
    cardBorder: 'border-[#2d2d34] dark:border-[#26262b]',
    textColor: 'text-[#e4e4e7] dark:text-[#e4e4e7]',
    subtextColor: 'text-[#a1a1aa] dark:text-[#9ca3af]',
    accentColor: 'text-pink-400 dark:text-pink-400',
    dividerColor: 'border-[#2d2d34] dark:border-[#26262b]',
    navBg: 'bg-[#1a1a1e]/95 dark:bg-[#141416]/95',
    navBorder: 'border-[#2d2d34] dark:border-[#26262b]',
    secondaryBtnBg: 'bg-[#27272e] hover:bg-[#34343d] dark:bg-[#202024] dark:hover:bg-[#2d2d33]',
    noteBg: 'bg-[#25252b]/80 dark:bg-[#202024]/80',
    noteBorder: 'border-[#3f3f4a] dark:border-[#35353d]',
  },
};

interface ReaderViewProps {
  story: Story;
  chapter: Chapter;
  allChapters?: Chapter[];
  onBack: () => void;
  onSelectChapter: (chapterNumber: number) => void;
  onGoToPasswordGuide: () => void;
  onOpenStoryDetail?: () => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  story,
  chapter,
  allChapters = [],
  onBack,
  onSelectChapter,
  onGoToPasswordGuide,
  onOpenStoryDetail,
}) => {
  const { user, isAuthor, isMainAuthor, isCollaborator, roleBadge, openAuthModal } = useAuth();
  const safeAllChapters = allChapters || [];
  // Reading preferences stored in localStorage
  const [themeKey, setThemeKey] = useState<ReaderThemeKey>(() => {
    return (localStorage.getItem('better_reader_theme') as ReaderThemeKey) || 'default';
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('better_reader_font_size');
    return saved ? parseInt(saved, 10) : 17;
  });
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>(() => {
    return (localStorage.getItem('better_reader_font_family') as 'serif' | 'sans') || 'serif';
  });
  const [lineHeight, setLineHeight] = useState<'relaxed' | 'loose'>(() => {
    return (localStorage.getItem('better_reader_line_height') as 'relaxed' | 'loose') || 'relaxed';
  });
  const [readerWidth, setReaderWidth] = useState<'normal' | 'wide'>(() => {
    return (localStorage.getItem('better_reader_width') as 'normal' | 'wide') || 'normal';
  });

  // UI state
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tocSearch, setTocSearch] = useState('');
  const [tocSortAsc, setTocSortAsc] = useState(true);
  const [tocTab, setTocTab] = useState<'all' | 'main' | 'extra'>('all');
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Chapter unlock & interaction state
  const [unlockedChapters, setUnlockedChapters] = useState<Record<string, boolean>>({});
  const [inputPass, setInputPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [hasLiked, setHasLiked] = useState(() => {
    try {
      return localStorage.getItem(`mel_liked_story_${story.id}`) === 'true';
    } catch {
      return false;
    }
  });
  const [likeCount, setLikeCount] = useState(story.likes || 142);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Realtime comments state
  const [comments, setComments] = useState<RealtimeComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commenterName, setCommenterName] = useState('');

  // Comment replies & deletion state
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyUserName, setReplyUserName] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Auto-fill commenter name from auth
  useEffect(() => {
    if (user) {
      if (isMainAuthor) {
        setCommenterName('Mellifluous (Tác giả)');
      } else if (isCollaborator) {
        setCommenterName(user.displayName || 'Cộng sự BQT');
      } else if (user.displayName) {
        setCommenterName(user.displayName);
      } else if (user.email) {
        setCommenterName(user.email.split('@')[0]);
      }
    }
  }, [user, isAuthor, isMainAuthor, isCollaborator]);


  const contentRef = useRef<HTMLDivElement>(null);
  const currentTheme = READER_THEMES[themeKey] || READER_THEMES.default;

  // Subscribe to realtime chapter/story comments & stats
  useEffect(() => {
    // Record view in firestore
    recordStoryView(story.id);

    // Subscribe to comments for this specific chapter or story
    const unsubscribeComments = subscribeToComments(story.id, chapter.chapterNumber, (list) => {
      setComments(list);
    });

    // Subscribe to story stats
    const unsubscribeStats = subscribeToStoryStats(story.id, story.views, story.likes, (stats) => {
      setLikeCount(stats.likes);
    });

    return () => {
      unsubscribeComments();
      unsubscribeStats();
    };
  }, [story.id, chapter.chapterNumber, story.views, story.likes]);

  // Persist reader settings
  useEffect(() => {
    localStorage.setItem('better_reader_theme', themeKey);
  }, [themeKey]);

  useEffect(() => {
    localStorage.setItem('better_reader_font_size', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('better_reader_font_family', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('better_reader_line_height', lineHeight);
  }, [lineHeight]);

  useEffect(() => {
    localStorage.setItem('better_reader_width', readerWidth);
  }, [readerWidth]);

  // Scroll to top upon chapter change cleanly without erratic jumping
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setInputPass('');
    setErrorMsg('');
  }, [chapter.id]);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((window.scrollY / totalScroll) * 100)));
        setReadingProgress(progress);
      }
      setShowScrollTop(window.scrollY > 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation: Left/Right arrow keys for previous/next chapter, Esc to close TOC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        setIsTocOpen(false);
        setIsSettingsOpen(false);
      } else if (e.key === 'ArrowLeft') {
        const prev = safeAllChapters.find((c) => c.chapterNumber === chapter.chapterNumber - 1);
        if (prev) {
          onSelectChapter(prev.chapterNumber);
        }
      } else if (e.key === 'ArrowRight') {
        const next = safeAllChapters.find((c) => c.chapterNumber === chapter.chapterNumber + 1);
        if (next) {
          onSelectChapter(next.chapterNumber);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapter.chapterNumber, safeAllChapters, onSelectChapter]);

  const isUnlocked = !chapter.isLocked || unlockedChapters[chapter.id];

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputPass.trim().toLowerCase();
    const cleanKey = (story.passwordKey || '').trim().toLowerCase();

    if (
      cleanInput === cleanKey ||
      cleanInput === 'mellifluous' ||
      cleanInput === 'chuyen' ||
      cleanInput === '5cms'
    ) {
      setUnlockedChapters((prev) => ({ ...prev, [chapter.id]: true }));
      setErrorMsg('');
      setInputPass('');
    } else {
      setErrorMsg('Mật khẩu chưa chính xác rồi bạn ơi! Hãy xem kỹ gợi ý phía dưới nhé ~');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;
    const author = commenterName.trim() || (isMainAuthor ? 'Mellifluous (Tác giả)' : isCollaborator ? (user?.displayName || 'Cộng sự BQT') : (user?.displayName || 'Bạn đọc yêu truyện'));
    setIsSubmittingComment(true);
    try {
      await postRealtimeComment({
        storyId: story.id,
        chapterNumber: chapter.chapterNumber,
        chapterId: chapter.id,
        user: author,
        userEmail: user?.email || null,
        userId: user?.uid || null,
        isAuthor: Boolean(isMainAuthor),
        isCollaborator: Boolean(isCollaborator),
        roleBadge: isMainAuthor ? 'Tác giả' : isCollaborator ? 'Cộng sự' : undefined,
        avatar: isMainAuthor ? '🌸' : isCollaborator ? '🌿' : (user?.photoURL || '🌸'),
        text: newComment.trim(),
      });
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSendReply = async (commentId: string) => {
    if (!replyText.trim() || isSubmittingReply) return;
    setIsSubmittingReply(true);

    const sender = isMainAuthor
      ? 'Mellifluous (Tác giả)'
      : isCollaborator
      ? (user?.displayName || 'Cộng sự BQT')
      : (user?.displayName || replyUserName.trim() || commenterName.trim() || 'Bạn đọc');

    const replyPayload = {
      user: sender,
      text: replyText.trim(),
      avatar: isMainAuthor ? '🌸' : isCollaborator ? '🌿' : '💬',
      isAuthor: Boolean(isMainAuthor),
      isCollaborator: Boolean(isCollaborator),
      roleBadge: isMainAuthor ? 'Tác giả' : isCollaborator ? 'Cộng sự' : undefined,
      userEmail: user?.email || null,
    };

    try {
      const createdReply = await postCommentReply(commentId, replyPayload);
      // Optimistic update of comments state
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, replies: [...(c.replies || []), createdReply] }
            : c
        )
      );
      setReplyText('');
      setReplyUserName('');
      setReplyingCommentId(null);
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Xác nhận xóa bình luận này?')) return;
    try {
      await deleteComment(commentId);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };


  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Chapter navigation helpers
  const prevChapter = safeAllChapters.find((c) => c.chapterNumber === chapter.chapterNumber - 1);
  const nextChapter = safeAllChapters.find((c) => c.chapterNumber === chapter.chapterNumber + 1);

  const mainChaptersCount = safeAllChapters.filter((c) => !c.isExtra && c.partType !== 'extra').length;
  const extraChaptersCount = safeAllChapters.filter((c) => c.isExtra || c.partType === 'extra').length;

  // Filtered & sorted TOC chapters
  const filteredChapters = safeAllChapters.filter((c) => {
    const isExtra = Boolean(c.isExtra || c.partType === 'extra');
    if (tocTab === 'main' && isExtra) return false;
    if (tocTab === 'extra' && !isExtra) return false;

    if (!tocSearch.trim()) return true;
    const q = tocSearch.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      `chương ${c.chapterNumber}`.includes(q) ||
      (isExtra && 'phiên ngoại ngoại truyện pn'.includes(q))
    );
  });

  const sortedChapters = [...filteredChapters].sort((a, b) => {
    return tocSortAsc ? a.chapterNumber - b.chapterNumber : b.chapterNumber - a.chapterNumber;
  });

  const readingMinutes = Math.max(1, Math.round(chapter.wordCount / 380));

  return (
    <article
      id="novel-reader-view"
      className={`w-full mx-auto pb-24 transition-colors duration-300 overflow-x-hidden ${
        readerWidth === 'wide' ? 'max-w-5xl' : 'max-w-4xl'
      }`}
    >
      {/* READING PROGRESS BAR: Positioned directly below top fixed navbar (56px mobile / 64px desktop) */}
      <div className="fixed top-14 sm:top-16 left-0 right-0 h-1 bg-black/5 dark:bg-white/5 z-40 overflow-hidden pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* ========================================================================= */}
      {/* FULLY INTEGRATED UNIFIED STICKY READER TOOLBAR                            */}
      {/* ========================================================================= */}
      <header
        id="reader-sticky-toolbar"
        className={`sticky top-14 sm:top-16 z-30 w-full p-2 sm:p-2.5 rounded-2xl backdrop-blur-md border shadow-xs transition-all duration-300 ${
          isSettingsOpen ? 'mb-3.5 sm:mb-4' : 'mb-6 sm:mb-8 lg:mb-10'
        } ${currentTheme.navBg} ${currentTheme.navBorder}`}
      >
        <div className="flex items-center justify-between gap-1 sm:gap-2 w-full">
          {/* 1. Left Group: Về trang chủ & Chương trước */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Về trang chủ */}
            <button
              type="button"
              onClick={onBack}
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer ${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`}
              title="Thoát trình đọc để quay về trang chủ"
              aria-label="Về trang chủ"
            >
              <Home className="w-4 h-4 text-pink-500 shrink-0" />
              <span className="hidden md:inline">Trang chủ</span>
            </button>

            {/* Chương trước */}
            <button
              type="button"
              disabled={!prevChapter}
              onClick={() => prevChapter && onSelectChapter(prevChapter.chapterNumber)}
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border flex items-center gap-1 text-xs font-medium transition-colors ${
                prevChapter
                  ? `${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder} cursor-pointer`
                  : 'opacity-35 cursor-not-allowed border-stone-200 dark:border-stone-800'
              }`}
              title={prevChapter ? `Chương trước: Chương ${prevChapter.chapterNumber}` : 'Đây là chương đầu tiên'}
              aria-label="Chương trước"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Trước</span>
            </button>
          </div>

          {/* 2. Center: Nút Mục lục nhanh & Tên chương (Mở drawer mục lục, KHÔNG redirect) */}
          <button
            type="button"
            onClick={() => setIsTocOpen(true)}
            className={`flex-1 min-w-0 max-w-xl px-2 sm:px-3 py-1.5 rounded-xl border flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer ${currentTheme.secondaryBtnBg} ${currentTheme.cardBorder}`}
            title="Mở mục lục tất cả các chương"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500 shrink-0" />
            <div className="min-w-0 flex-1 text-center truncate">
              <span className={`block font-serif text-[11px] sm:text-xs md:text-sm font-bold truncate leading-tight ${currentTheme.textColor}`}>
                <span className="text-pink-600 dark:text-pink-400 font-sans mr-1">
                  {chapter.isExtra || chapter.partType === 'extra'
                    ? `🌸 PN.${chapter.extraNumber || ''}:`
                    : `C.${chapter.chapterNumber}/${story.mainChaptersCount || 40}:`}
                </span>
                {chapter.title.replace(/^(Chương|Phiên ngoại)\s*[\w\d.]+:\s*/i, '')}
              </span>
              <span className={`hidden xs:block text-[10px] truncate leading-tight opacity-75 ${currentTheme.subtextColor}`}>
                {story.title}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 shrink-0 opacity-60 ${currentTheme.textColor}`} />
          </button>

          {/* 3. Right Group: Chương sau & Cài đặt bảo vệ mắt */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Chương sau */}
            <button
              type="button"
              disabled={!nextChapter}
              onClick={() => nextChapter && onSelectChapter(nextChapter.chapterNumber)}
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border flex items-center gap-1 text-xs font-medium transition-colors ${
                nextChapter
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 shadow-2xs cursor-pointer'
                  : 'opacity-35 cursor-not-allowed border-stone-200 dark:border-stone-800'
              }`}
              title={nextChapter ? `Chương sau: Chương ${nextChapter.chapterNumber}` : 'Đây là chương mới nhất'}
              aria-label="Chương sau"
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>

            {/* Văn án (màn hình lớn) */}
            {onOpenStoryDetail && (
              <button
                type="button"
                onClick={onOpenStoryDetail}
                className={`hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${currentTheme.secondaryBtnBg} ${currentTheme.subtextColor} ${currentTheme.cardBorder}`}
                title="Xem văn án tác phẩm"
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Văn án</span>
              </button>
            )}

            {/* Nút Bảo vệ mắt & Cỡ chữ */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border flex items-center gap-1 text-xs font-medium transition-all cursor-pointer shrink-0 ${
                isSettingsOpen
                  ? 'bg-pink-500 text-white border-pink-600 shadow-2xs'
                  : `${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`
              }`}
              title="Đổi màu nền bảo vệ mắt & tùy chỉnh hiển thị"
              aria-label="Cài đặt đọc truyện bảo vệ mắt"
            >
              <Eye className="w-4 h-4 text-pink-500 shrink-0" />
              <span className="hidden md:inline">Bảo vệ mắt</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* EYE PROTECTION SETTINGS PANEL (FULLY RESPONSIVE ON PHONE & TABLET)        */}
      {/* ========================================================================= */}
      {isSettingsOpen && (
        <section
          aria-label="Cài đặt bảo vệ mắt"
          className={`w-full mb-6 sm:mb-8 lg:mb-10 p-3.5 sm:p-5 rounded-2xl border shadow-md space-y-3.5 sm:space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 transition-colors ${currentTheme.cardBg} ${currentTheme.cardBorder}`}
        >
          <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-pink-500 shrink-0" />
              <h3 className={`font-serif text-xs sm:text-sm font-bold ${currentTheme.textColor}`}>
                Chế độ màu nền bảo vệ mắt & Tùy chỉnh đọc truyện
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className={`p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${currentTheme.subtextColor} cursor-pointer`}
              aria-label="Đóng cài đặt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Eye-protection Color Scheme Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium ${currentTheme.subtextColor}`}>
                Màu nền công thái học:
              </span>
              <span className={`font-serif italic text-[11px] sm:text-xs ${currentTheme.accentColor}`}>
                {currentTheme.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2">
              {(Object.keys(READER_THEMES) as ReaderThemeKey[]).map((key) => {
                const item = READER_THEMES[key];
                const isSelected = themeKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setThemeKey(key)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-pink-500 ring-offset-1 border-pink-400 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 hover:border-pink-300'
                    }`}
                    style={{ backgroundColor: item.bgHex }}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/15 flex items-center justify-center shrink-0"
                      style={{ backgroundColor: item.bgHex }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-pink-600 dark:text-pink-400 stroke-[3]" />}
                    </span>
                    <span className="text-[11px] sm:text-xs text-stone-900 font-serif truncate leading-tight">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Font Size, Font Family, Line Height & Width Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            {/* Font Size Adjuster */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={currentTheme.subtextColor}>Cỡ chữ đọc truyện:</span>
                <span className={`font-mono font-bold ${currentTheme.textColor}`}>{fontSize}px</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFontSize((s) => Math.max(14, s - 1))}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`}
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize(17)}
                  title="Đặt lại cỡ chữ chuẩn (17px)"
                  className={`px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${currentTheme.secondaryBtnBg} ${currentTheme.subtextColor} ${currentTheme.cardBorder}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize((s) => Math.min(26, s + 1))}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`}
                >
                  A+
                </button>
              </div>
            </div>

            {/* Font Family (Serif vs Sans) */}
            <div className="space-y-1.5">
              <span className={`block text-xs ${currentTheme.subtextColor}`}>Kiểu chữ:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFontFamily('serif')}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-serif transition-colors cursor-pointer ${
                    fontFamily === 'serif'
                      ? 'bg-pink-500 text-white border-pink-600 font-bold'
                      : `${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`
                  }`}
                >
                  Có chân (Serif)
                </button>
                <button
                  type="button"
                  onClick={() => setFontFamily('sans')}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-sans transition-colors cursor-pointer ${
                    fontFamily === 'sans'
                      ? 'bg-pink-500 text-white border-pink-600 font-bold'
                      : `${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`
                  }`}
                >
                  Không chân (Sans)
                </button>
              </div>
            </div>

            {/* Line Height & Width */}
            <div className="space-y-1.5">
              <span className={`block text-xs ${currentTheme.subtextColor}`}>Giãn dòng & Khung đọc:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLineHeight(lineHeight === 'relaxed' ? 'loose' : 'relaxed')}
                  className={`flex-1 py-1.5 px-2 rounded-xl border text-xs transition-colors cursor-pointer truncate ${
                    lineHeight === 'loose'
                      ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 border-pink-300 font-medium'
                      : `${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`
                  }`}
                >
                  {lineHeight === 'loose' ? 'Giãn dòng: Rộng' : 'Giãn dòng: Chuẩn'}
                </button>
                <button
                  type="button"
                  onClick={() => setReaderWidth(readerWidth === 'normal' ? 'wide' : 'normal')}
                  className={`py-1.5 px-2.5 rounded-xl border text-xs transition-colors cursor-pointer shrink-0 ${
                    readerWidth === 'wide'
                      ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 border-pink-300 font-medium'
                      : `${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`
                  }`}
                  title="Chuyển đổi độ rộng trang đọc"
                >
                  {readerWidth === 'wide' ? 'Rộng' : 'Chuẩn'}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MAIN CHAPTER READING CARD (INTEGRATED & BALANCED ACROSS DEVICES)          */}
      {/* ========================================================================= */}
      <div
        ref={contentRef}
        className={`w-full p-4 sm:p-8 md:p-12 rounded-3xl border shadow-sm space-y-6 sm:space-y-8 transition-colors duration-300 overflow-hidden ${currentTheme.cardBg} ${currentTheme.cardBorder}`}
      >
        {/* Chapter Header */}
        <div className={`text-center space-y-2.5 pb-5 border-b ${currentTheme.dividerColor}`}>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-serif uppercase tracking-wider font-semibold bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-900 truncate max-w-full">
              {story.title}
            </span>
            {(chapter.isExtra || chapter.partType === 'extra') && (
              <span className="px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-serif font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-2xs">
                🌸 Phiên ngoại đặc biệt {chapter.extraNumber ? `#${chapter.extraNumber}` : ''}
              </span>
            )}
          </div>

          <h1
            className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words ${
              fontFamily === 'serif' ? 'font-serif' : 'font-sans'
            } ${currentTheme.textColor}`}
          >
            {chapter.title}
          </h1>

          {/* Fully Integrated Metadata: Author, Editor, Word Count, Reading Time, Date */}
          <div
            className={`flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-4 gap-y-1.5 text-[11px] sm:text-xs md:text-[13px] pt-1.5 ${currentTheme.subtextColor}`}
          >
            <span>Tác giả: <strong className={currentTheme.textColor}>{story.author}</strong></span>
            <span>•</span>
            <span>Edit: <strong className={currentTheme.textColor}>{story.translator}</strong></span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-medium text-pink-600 dark:text-pink-400">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>~{readingMinutes} phút đọc</span>
            </span>
            <span>•</span>
            <span>{chapter.wordCount.toLocaleString()} chữ</span>
            <span>•</span>
            <span>{chapter.publishedAt}</span>
          </div>
        </div>

        {/* Translator Note Box */}
        {chapter.translatorNote && (
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm space-y-1 transition-colors ${currentTheme.noteBg} ${currentTheme.noteBorder}`}
          >
            <div className="flex items-center gap-1.5 font-bold font-serif text-amber-800 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Ghi chú từ Mellifluous:</span>
            </div>
            <p className={`italic leading-relaxed ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'} ${currentTheme.textColor}`}>
              {chapter.translatorNote}
            </p>
          </div>
        )}

        {/* Reading Content or Password Gate */}
        {!isUnlocked ? (
          /* Password Protection Gate Card */
          <div className="my-6 sm:my-8 p-5 sm:p-8 rounded-2xl bg-gradient-to-br from-pink-50/90 via-amber-50/60 to-rose-50/90 dark:from-stone-800 dark:via-stone-900 dark:to-stone-800 border-2 border-dashed border-pink-300 dark:border-pink-800 text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 flex items-center justify-center shadow-xs">
              <Lock className="w-7 h-7 animate-pulse" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-100">
                Chương truyện được bảo vệ bằng Mật Khẩu
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
                Để bảo vệ công sức dịch phi lợi nhuận của Mellifluous và tránh reup, chương này được cài mật khẩu nhẹ nhàng.
              </p>
            </div>

            {/* Hint Box */}
            <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-white/95 dark:bg-stone-800 border border-pink-200 dark:border-stone-700 text-left space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Gợi ý pass chương này:</span>
              </div>
              <p className="font-serif text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 italic break-words">
                "{story.passwordHint || 'Tên dịch giả viết thường không dấu (mellifluous)'}"
              </p>
              <p className="text-[10px] sm:text-[11px] text-stone-400 font-sans">
                *Quy tắc giải mã: viết thường, không dấu, không dấu cách.
              </p>
            </div>

            {/* Password Input Form (Fully responsive) */}
            <form onSubmit={handleUnlock} className="max-w-sm mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={inputPass}
                  onChange={(e) => setInputPass(e.target.value)}
                  placeholder="Nhập câu trả lời gợi ý..."
                  className="w-full sm:flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-400 min-w-0"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Mở khóa</span>
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-500 font-medium font-sans animate-shake">
                  {errorMsg}
                </p>
              )}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={onGoToPasswordGuide}
                  className="text-xs text-pink-600 dark:text-pink-400 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Xem cẩm nang hướng dẫn giải pass của Mel</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Actual Story Prose Content */
          <div
            className={`space-y-5 sm:space-y-6 select-text transition-all duration-200 break-words ${
              fontFamily === 'serif' ? 'font-serif' : 'font-sans'
            } ${lineHeight === 'loose' ? 'leading-loose sm:leading-[2.1]' : 'leading-relaxed sm:leading-[1.8]'} ${
              currentTheme.textColor
            }`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {chapter.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="indent-5 sm:indent-8">
                {paragraph}
              </p>
            ))}

            {/* Ending note of chapter */}
            <div className="pt-8 text-center space-y-1.5">
              <span className="inline-block text-lg text-pink-400">❀ ❀ ❀</span>
              <p className={`text-xs font-serif italic ${currentTheme.subtextColor}`}>
                Hết chương {chapter.chapterNumber} • Cảm ơn bạn đã đọc truyện tại better and better (Mellifluous)
              </p>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION CONTROLS (BALANCED FOR MOBILE) */}
        <div className={`pt-6 border-t ${currentTheme.dividerColor} space-y-4`}>
          {/* 3-Column Navigation Buttons */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            {/* Previous Chapter */}
            <button
              type="button"
              disabled={!prevChapter}
              onClick={() => prevChapter && onSelectChapter(prevChapter.chapterNumber)}
              className={`px-2 sm:px-4 py-2.5 rounded-xl border flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-colors ${
                prevChapter
                  ? `${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder} cursor-pointer`
                  : 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-800'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Chương trước</span>
            </button>

            {/* In-Reader Table of Contents Trigger */}
            <button
              type="button"
              onClick={() => setIsTocOpen(true)}
              className="px-2 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center gap-1 sm:gap-2 shadow-xs transition-all cursor-pointer truncate"
              title="Mục lục tất cả các chương truyện"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Mục lục ({allChapters.length})</span>
            </button>

            {/* Next Chapter */}
            <button
              type="button"
              disabled={!nextChapter}
              onClick={() => nextChapter && onSelectChapter(nextChapter.chapterNumber)}
              className={`px-2 sm:px-4 py-2.5 rounded-xl border flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-colors ${
                nextChapter
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 shadow-xs cursor-pointer'
                  : 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-800'
              }`}
            >
              <span className="truncate">Chương sau</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </button>
          </div>

          {/* Secondary Actions: Like, Share, Go to Home */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextState = !hasLiked;
                  setHasLiked(nextState);
                  try {
                    if (nextState) localStorage.setItem(`mel_liked_story_${story.id}`, 'true');
                    else localStorage.removeItem(`mel_liked_story_${story.id}`);
                  } catch {}
                  toggleStoryLike(story.id, nextState);
                }}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  hasLiked
                    ? 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                    : `${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>Thả tim ({likeCount})</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`}
              >
                <Share2 className="w-3.5 h-3.5 text-pink-500" />
                <span>{copiedSuccess ? 'Đã chép link!' : 'Chia sẻ'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onBack}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:text-pink-600 transition-colors cursor-pointer ${currentTheme.subtextColor}`}
              title="Đóng trình đọc để trở lại danh sách truyện"
            >
              <Home className="w-3.5 h-3.5 text-pink-500" />
              <span>Về trang chủ</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* READER COMMENTS SECTION                                                   */}
      {/* ========================================================================= */}
      <section
        className={`w-full mt-6 sm:mt-8 lg:mt-10 p-4 sm:p-8 rounded-3xl border shadow-xs space-y-5 transition-colors duration-300 overflow-hidden ${currentTheme.cardBg} ${currentTheme.cardBorder}`}
      >
        <div className={`flex items-center justify-between border-b pb-3.5 ${currentTheme.dividerColor}`}>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 shrink-0" />
            <h3 className={`font-serif text-base sm:text-lg font-bold ${currentTheme.textColor}`}>
              Bình luận ({comments.length})
            </h3>
          </div>
          <span className={`text-xs font-serif italic ${currentTheme.subtextColor}`}>
            Cùng chia sẻ cảm xúc nhé ~
          </span>
        </div>

        {/* User Auth Status or Login Prompt for Commenting */}
        <div className="flex items-center justify-between px-1 text-xs">
          {user ? (
            <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
              <span className={`w-2 h-2 rounded-full ${isMainAuthor ? 'bg-rose-500 animate-pulse' : isCollaborator ? 'bg-emerald-500' : 'bg-pink-500'}`} />
              <span>Đang bình luận với tư cách:</span>
              <strong className={`font-semibold ${isMainAuthor ? 'text-rose-600 dark:text-rose-400' : isCollaborator ? 'text-emerald-600 dark:text-emerald-400' : 'text-pink-600 dark:text-pink-400'}`}>
                {isMainAuthor ? '🌸 Mellifluous (Tác giả)' : isCollaborator ? `🌿 ${user.displayName || 'Cộng sự BQT'}` : (user.displayName || user.email)}
              </strong>
              {isCollaborator && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                  Cộng sự
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className={`text-[11px] ${currentTheme.subtextColor}`}>
                ✍️ Bạn có thể bình luận và trả lời tự do, hoặc đăng nhập để lưu danh tính:
              </span>
              <button
                type="button"
                onClick={openAuthModal}
                className="text-[11px] font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 underline cursor-pointer"
              >
                Đăng nhập tài khoản
              </button>
            </div>
          )}
        </div>

        {/* Comment Input Form */}
        <form onSubmit={handleAddComment} className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={commenterName}
              onChange={(e) => setCommenterName(e.target.value)}
              placeholder={user ? (isMainAuthor ? 'Mellifluous (Tác giả)' : isCollaborator ? 'Cộng sự BQT' : 'Tên của bạn...') : 'Tên / Biệt hiệu của bạn (không bắt buộc)...'}
              className={`sm:col-span-1 px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-400 min-w-0 ${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`}
            />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Gửi cảm xúc của bạn về chương này..."
              className={`sm:col-span-2 px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-400 min-w-0 ${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingComment ? 'Đang gửi...' : 'Gửi bình luận'}</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3 pt-1">
          {comments.length === 0 ? (
            <div className={`p-6 rounded-2xl border text-center text-xs italic ${currentTheme.cardBorder} ${currentTheme.subtextColor}`}>
              🌸 Chưa có bình luận nào cho chương này. Hãy là người đầu tiên chia sẻ cảm nhận nhé!
            </div>
          ) : (
            comments.map((cmt) => {
              const isCmtMainAuthor = cmt.roleBadge === 'Tác giả' || (cmt.isAuthor && !cmt.isCollaborator);
              const isCmtCollaborator = cmt.roleBadge === 'Cộng sự' || cmt.isCollaborator;

              return (
                <div
                  key={cmt.id}
                  className={`p-3.5 rounded-2xl border space-y-2.5 transition-colors ${
                    isCmtMainAuthor
                      ? 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-300 dark:border-rose-900/60'
                      : isCmtCollaborator
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-300 dark:border-emerald-900/60'
                      : `${currentTheme.secondaryBtnBg} ${currentTheme.cardBorder}`
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        isCmtMainAuthor
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200 ring-2 ring-rose-400/50'
                          : isCmtCollaborator
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400/50'
                          : 'bg-pink-100 dark:bg-pink-950/80 text-pink-600'
                      }`}
                    >
                      {cmt.avatar || (isCmtMainAuthor ? '🌸' : isCmtCollaborator ? '🌿' : '💬')}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`font-semibold font-serif truncate ${
                            isCmtMainAuthor
                              ? 'text-rose-950 dark:text-rose-200'
                              : isCmtCollaborator
                              ? 'text-emerald-950 dark:text-emerald-200'
                              : currentTheme.textColor
                          }`}>
                            {cmt.user}
                          </span>
                          {isCmtMainAuthor && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/70 dark:text-rose-300 border border-rose-300/60 shrink-0">
                              🌸 Tác giả • Mellifluous
                            </span>
                          )}
                          {isCmtCollaborator && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300 border border-emerald-300/60 shrink-0">
                              🌿 Cộng sự • BQT
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-mono shrink-0 ${currentTheme.subtextColor}`}>
                          {cmt.time || (cmt.createdAt ? new Date(cmt.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong')}
                        </span>
                      </div>

                      <p className={`text-xs sm:text-[13px] font-sans leading-relaxed break-words ${currentTheme.textColor}`}>
                        {cmt.text}
                      </p>

                      {/* Action row: Reply button & Delete button (Author or Collaborator only) */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingCommentId(replyingCommentId === cmt.id ? null : cmt.id);
                            setReplyText('');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-pink-600 hover:text-pink-700 dark:text-pink-400 cursor-pointer"
                        >
                          <Reply className="w-3 h-3" />
                          <span>{replyingCommentId === cmt.id ? 'Hủy trả lời' : 'Trả lời'}</span>
                        </button>

                        {(isAuthor || isCollaborator) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(cmt.id)}
                            className="inline-flex items-center gap-1 text-[10px] text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                            title="Xóa bình luận này (Ban quản trị)"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nested Replies */}
                  {cmt.replies && cmt.replies.length > 0 && (
                    <div className="pl-4 sm:pl-7 space-y-2 border-l-2 border-pink-200/80 dark:border-stone-700 ml-3.5 my-1.5">
                      {cmt.replies.map((rep) => {
                        const isRepMainAuthor = rep.roleBadge === 'Tác giả' || (rep.isAuthor && !rep.isCollaborator);
                        const isRepCollaborator = rep.roleBadge === 'Cộng sự' || rep.isCollaborator;

                        return (
                          <div
                            key={rep.id}
                            className={`p-3 rounded-2xl text-xs space-y-1 transition-all ${
                              isRepMainAuthor
                                ? 'bg-rose-100/70 dark:bg-rose-950/45 border border-rose-300 dark:border-rose-900/60 shadow-2xs'
                                : isRepCollaborator
                                ? 'bg-emerald-100/70 dark:bg-emerald-950/45 border border-emerald-300 dark:border-emerald-900/60 shadow-2xs'
                                : `${currentTheme.cardBg} border ${currentTheme.cardBorder}`
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <CornerDownRight className={`w-3 h-3 shrink-0 ${isRepMainAuthor ? 'text-rose-500' : isRepCollaborator ? 'text-emerald-500' : 'text-pink-500'}`} />
                                <span className={`font-semibold ${isRepMainAuthor ? 'text-rose-950 dark:text-rose-200' : isRepCollaborator ? 'text-emerald-950 dark:text-emerald-200' : currentTheme.textColor}`}>
                                  {rep.user}
                                </span>
                                {isRepMainAuthor && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border border-rose-300">
                                    🌸 Tác giả • Mellifluous
                                  </span>
                                )}
                                {isRepCollaborator && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border border-emerald-300">
                                    🌿 Cộng sự • BQT
                                  </span>
                                )}
                              </div>
                              <span className={`text-[10px] font-mono ${currentTheme.subtextColor}`}>
                                {new Date(rep.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={`pl-4 font-sans text-xs sm:text-[13px] leading-relaxed break-words ${currentTheme.textColor}`}>
                              {rep.text}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Inline Reply Form (Free for everyone) */}
                  {replyingCommentId === cmt.id && (
                    <div className="pl-4 sm:pl-7 pt-2">
                      <div className={`p-3 rounded-2xl border space-y-2.5 ${currentTheme.secondaryBtnBg} ${currentTheme.cardBorder}`}>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-pink-600 dark:text-pink-400 flex items-center gap-1">
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>Trả lời bình luận của <strong>{cmt.user}</strong></span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingCommentId(null);
                              setReplyText('');
                            }}
                            className="text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>

                        {/* Guest name input if not logged in */}
                        {!user && (
                          <input
                            type="text"
                            value={replyUserName}
                            onChange={(e) => setReplyUserName(e.target.value)}
                            placeholder="Tên / Biệt hiệu của bạn (không bắt buộc)..."
                            className={`w-full sm:w-64 px-3 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-pink-400 focus:outline-hidden ${currentTheme.cardBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`}
                          />
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={
                              isMainAuthor
                                ? '🌸 Mellifluous phản hồi bạn đọc...'
                                : isCollaborator
                                ? '🌿 Ban quản trị phản hồi...'
                                : 'Nhập nội dung phản hồi của bạn...'
                            }
                            className={`flex-1 px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-pink-400 focus:outline-hidden ${currentTheme.cardBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSendReply(cmt.id);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSendReply(cmt.id)}
                            disabled={isSubmittingReply || !replyText.trim()}
                            className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shrink-0 transition-colors shadow-2xs"
                          >
                            {isSubmittingReply ? 'Đang gửi...' : 'Gửi'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>


      {/* ========================================================================= */}
      {/* IN-READER TABLE OF CONTENTS MODAL (DRAWER) - NEVER CLOSES READER!        */}
      {/* ========================================================================= */}
      {isTocOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mục lục tất cả các chương"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsTocOpen(false)}
        >
          <div
            className={`w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${currentTheme.cardBg} ${currentTheme.cardBorder}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-3.5 sm:p-4 border-b flex items-center justify-between gap-2 ${currentTheme.dividerColor}`}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/70 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className={`font-serif text-sm sm:text-base font-bold truncate ${currentTheme.textColor}`}>
                    Mục lục tất cả các chương
                  </h3>
                  <p className={`text-[11px] truncate ${currentTheme.subtextColor}`}>
                    {story.title} • {allChapters.length} chương
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTocOpen(false)}
                className={`p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0 ${currentTheme.subtextColor}`}
                title="Đóng mục lục (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter and Sort Toolbar */}
            <div className={`p-2.5 sm:px-4 sm:py-2.5 border-b space-y-2 ${currentTheme.dividerColor}`}>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.subtextColor}`} />
                  <input
                    type="text"
                    value={tocSearch}
                    onChange={(e) => setTocSearch(e.target.value)}
                    placeholder="Tìm số hoặc tên chương..."
                    className={`w-full pl-8 pr-7 py-1.5 rounded-xl border text-xs focus:outline-hidden focus:ring-2 focus:ring-pink-400 min-w-0 ${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`}
                  />
                  {tocSearch && (
                    <button
                      type="button"
                      onClick={() => setTocSearch('')}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs ${currentTheme.subtextColor}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setTocSortAsc(!tocSortAsc)}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${currentTheme.secondaryBtnBg} ${currentTheme.textColor} ${currentTheme.cardBorder}`}
                  title="Đảo chiều sắp xếp danh sách"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-pink-500" />
                  <span className="hidden xs:inline sm:inline">
                    {tocSortAsc ? '1 → N' : 'N → 1'}
                  </span>
                </button>
              </div>

              {/* TOC Category Tabs */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg border text-xs font-medium" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setTocTab('all')}
                  className={`flex-1 py-1 rounded-md text-center transition-colors cursor-pointer ${
                    tocTab === 'all'
                      ? 'bg-pink-500 text-white font-bold'
                      : `${currentTheme.textColor} hover:bg-black/5 dark:hover:bg-white/5`
                  }`}
                >
                  Tất cả ({safeAllChapters.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTocTab('main')}
                  className={`flex-1 py-1 rounded-md text-center transition-colors cursor-pointer ${
                    tocTab === 'main'
                      ? 'bg-pink-500 text-white font-bold'
                      : `${currentTheme.textColor} hover:bg-black/5 dark:hover:bg-white/5`
                  }`}
                >
                  Chính truyện ({mainChaptersCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTocTab('extra')}
                  className={`flex-1 py-1 rounded-md text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    tocTab === 'extra'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50/50'
                  }`}
                >
                  <span>🌸 Phiên ngoại</span>
                  <span className="text-[10px]">({extraChaptersCount})</span>
                </button>
              </div>
            </div>

            {/* Chapter Items List */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 space-y-1.5">
              {sortedChapters.length === 0 ? (
                <div className="py-10 text-center space-y-1">
                  <p className={`font-serif text-xs sm:text-sm italic ${currentTheme.subtextColor}`}>
                    Không tìm thấy chương truyện nào khớp với từ khóa "{tocSearch}"
                  </p>
                </div>
              ) : (
                sortedChapters.map((ch) => {
                  const isCurrent = ch.chapterNumber === chapter.chapterNumber;
                  const isChUnlocked = !ch.isLocked || unlockedChapters[ch.id];
                  const isExtra = ch.isExtra || ch.partType === 'extra';

                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        onSelectChapter(ch.chapterNumber);
                        setIsTocOpen(false);
                      }}
                      className={`w-full p-2.5 sm:p-3 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-400 dark:border-pink-800 ring-1 ring-pink-400'
                          : isExtra
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/60 hover:bg-rose-50'
                          : `${currentTheme.secondaryBtnBg} ${currentTheme.cardBorder} hover:border-pink-300`
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                            isCurrent
                              ? 'bg-pink-500 text-white'
                              : isExtra
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200'
                              : 'bg-stone-200/70 dark:bg-stone-700/70 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          {isExtra ? 'PN' : ch.chapterNumber}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-serif text-xs sm:text-sm font-semibold truncate ${
                                isCurrent
                                  ? 'text-pink-600 dark:text-pink-300'
                                  : isExtra
                                  ? 'text-rose-900 dark:text-rose-200'
                                  : currentTheme.textColor
                              }`}
                            >
                              {ch.title}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-pink-500 text-white shrink-0">
                                Đang đọc
                              </span>
                            )}
                            {isExtra && !isCurrent && (
                              <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 shrink-0">
                                🌸 Ngoại truyện
                              </span>
                            )}
                          </div>

                          <div className={`flex items-center gap-2 text-[11px] mt-0.5 ${currentTheme.subtextColor}`}>
                            <span>{ch.wordCount.toLocaleString()} chữ</span>
                            <span>•</span>
                            <span>{ch.publishedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {ch.isLocked && !isChUnlocked ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Lock className="w-3 h-3" />
                            <span>Pass</span>
                          </span>
                        ) : ch.isLocked && isChUnlocked ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            <Unlock className="w-3 h-3" />
                            <span>Mở</span>
                          </span>
                        ) : (
                          <span className={`text-[10px] font-serif ${currentTheme.subtextColor}`}>
                            Free
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-2.5 sm:px-4 border-t flex items-center justify-between text-xs ${currentTheme.dividerColor}`}>
              <span className={`font-serif italic text-[11px] truncate mr-2 ${currentTheme.subtextColor}`}>
                *Nhấn chương để đọc ngay mà không về trang chủ.
              </span>
              <button
                type="button"
                onClick={() => setIsTocOpen(false)}
                className="px-3 py-1 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium cursor-pointer shrink-0"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING SCROLL TO TOP BUTTON (CLEAN & NON-INTRUSIVE ACROSS ALL DEVICES)   */}
      {/* ========================================================================= */}
      {showScrollTop && (
        <button
          type="button"
          onClick={handleScrollToTop}
          className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 p-2.5 sm:p-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg transition-all hover:scale-110 cursor-pointer animate-in fade-in"
          title="Cuộn lên đầu trang"
          aria-label="Cuộn lên đầu trang"
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </article>
  );
};
