import React, { useState, useEffect } from 'react';
import { Story, Chapter, Announcement, ReaderLetter } from '../types';
import {
  X,
  Sparkles,
  BookOpen,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileText,
  Bell,
  Trash2,
  Lock,
  Key,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  Layers,
  Check,
  Mail,
  Send,
  Reply,
  ShieldCheck,
  LogOut,
  LogIn,
} from 'lucide-react';
import {
  publishStory,
  deleteStory,
  publishChapter,
  publishAnnouncement,
  deleteAnnouncement,
  subscribeToReaderLetters,
  replyToReaderLetter,
  deleteReaderLetter,
} from '../lib/realtimeService';
import { useAuth } from '../lib/authContext';

interface AuthorPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  announcements: Announcement[];
  onStoriesUpdated?: () => void;
}

const PRESET_COVERS = [
  {
    name: 'Hoa anh đào mùa hạ',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bức thư và mây trời',
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Chiếc ô cơn mưa xanh',
    url: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tán phong ngày hè',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Khu vườn mùa hạ xanh',
    url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80',
  },
];

const PRESET_GENRES = [
  'Thanh xuân vườn trường',
  'Ngọt sủng',
  'Chữa lành',
  'HE',
  'Đô thị tình duyên',
  'Song hướng thầm mến',
  'Học đường',
  'Gương vỡ lại lành',
  'Hài hước',
  'Ấm áp',
];

export const AuthorPublishModal: React.FC<AuthorPublishModalProps> = ({
  isOpen,
  onClose,
  stories,
  announcements,
  onStoriesUpdated,
}) => {
  const { user, isAuthor, openAuthModal, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'newStory' | 'newChapter' | 'newAnnouncement' | 'letters' | 'manage'>('newStory');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reader Letters state in Studio
  const [letters, setLetters] = useState<ReaderLetter[]>([]);
  const [letterFilter, setLetterFilter] = useState<'all' | 'unanswered' | 'private' | 'public'>('all');
  const [replyingLetterId, setReplyingLetterId] = useState<string | null>(null);
  const [authorReplyInput, setAuthorReplyInput] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    if (!isOpen || !isAuthor) return;
    const unsubscribe = subscribeToReaderLetters((list) => {
      setLetters(list);
    });
    return unsubscribe;
  }, [isOpen, isAuthor]);

  // New Story Form State
  const [storyTitle, setStoryTitle] = useState('');
  const [storyOriginalTitle, setStoryOriginalTitle] = useState('');
  const [storyAuthor, setStoryAuthor] = useState('');
  const [storyTranslator, setStoryTranslator] = useState('Mellifluous');
  const [storyStatus, setStoryStatus] = useState<'completed' | 'ongoing'>('ongoing');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Thanh xuân vườn trường', 'Ngọt sủng']);
  const [customGenre, setCustomGenre] = useState('');
  const [storySummary, setStorySummary] = useState('');
  const [storyCover, setStoryCover] = useState(PRESET_COVERS[0].url);
  const [hasPassword, setHasPassword] = useState(false);
  const [passwordHint, setPasswordHint] = useState('');
  const [passwordKey, setPasswordKey] = useState('');
  const [totalChapters, setTotalChapters] = useState(30);

  // New Chapter Form State
  const [targetStoryId, setTargetStoryId] = useState(stories[0]?.id || '');
  const [partType, setPartType] = useState<'main' | 'extra'>('main');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [translatorNote, setTranslatorNote] = useState('');
  const [isChapterLocked, setIsChapterLocked] = useState(false);

  // New Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annTag, setAnnTag] = useState<'Thông báo' | 'Lịch đăng' | 'Nhắc nhở' | 'Lưu ý'>('Thông báo');
  const [annContent, setAnnContent] = useState('');
  const [annIsPinned, setAnnIsPinned] = useState(true);

  // Safe inline confirmation states (prevents iframe alert/confirm blocking)
  const [storyToDelete, setStoryToDelete] = useState<{ id: string; title: string } | null>(null);
  const [letterToDelete, setLetterToDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  // Gatekeeper: Only authorized authors and collaborators can access Studio
  if (!isAuthor) {
    return (
      <div
        id="author-access-denied-modal"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-pink-200 dark:border-stone-700 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-pink-100 dark:bg-pink-950 text-pink-600 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
              Khu vực dành riêng cho Tác giả
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {user ? (
                <>
                  Tài khoản <strong className="text-pink-600 font-mono">{user.email}</strong> hiện không nằm trong danh sách Tác giả / Quản trị viên được cấp quyền truy cập Studio.
                </>
              ) : (
                <>
                  Studio xuất bản và đăng truyện chỉ dành riêng cho Tác giả <strong>Mellifluous</strong> và các cộng sự được phân quyền. Vui lòng đăng nhập với tài khoản Google tác giả để tiếp tục.
                </>
              )}
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            {user ? (
              <button
                type="button"
                id="switch-author-account-btn"
                onClick={openAuthModal}
                className="w-full py-2.5 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Đổi sang tài khoản tác giả khác</span>
              </button>
            ) : (
              <button
                type="button"
                id="login-author-google-btn"
                onClick={openAuthModal}
                className="w-full py-2.5 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập Google Tác Giả</span>
              </button>
            )}

            <button
              type="button"
              id="close-unauthorized-modal-btn"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs sm:text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Trở lại trang web
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };

  // 1. Publish New Story
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle.trim() || !storyAuthor.trim()) {
      showFeedback('error', 'Vui lòng nhập tên truyện và tên tác giả.');
      return;
    }

    setIsProcessing(true);
    try {
      const generatedId =
        storyTitle
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || `truyen-${Date.now()}`;

      const newStory: Story = {
        id: generatedId,
        title: storyTitle.trim(),
        originalTitle: storyOriginalTitle.trim(),
        author: storyAuthor.trim(),
        translator: storyTranslator.trim() || 'Mellifluous',
        status: storyStatus,
        genre: selectedGenres.length > 0 ? selectedGenres : ['Ngôn tình', 'Ngọt sủng'],
        summary: storySummary.trim() || 'Chưa có văn án.',
        totalChapters: Number(totalChapters) || 1,
        completedChapters: 0,
        mainChaptersCount: Number(totalChapters) || 1,
        extraChaptersCount: 0,
        coverImage: storyCover || PRESET_COVERS[0].url,
        colorTheme: 'from-pink-100 to-rose-200 dark:from-pink-950/40 dark:to-rose-900/40',
        hasPassword,
        passwordHint: hasPassword ? passwordHint.trim() : '',
        passwordKey: hasPassword ? passwordKey.trim().toLowerCase() : '',
        updatedAt: 'Vừa đăng',
        views: 0,
        likes: 0,
        featured: true,
      };

      await publishStory(newStory);
      showFeedback('success', `🎉 Đã xuất bản thành công tác phẩm "${newStory.title}"! Lượt xem và lượt thích bắt đầu từ 0.`);
      
      // Reset form
      setStoryTitle('');
      setStoryOriginalTitle('');
      setStoryAuthor('');
      setStorySummary('');
      setHasPassword(false);
      setPasswordHint('');
      setPasswordKey('');

      if (onStoriesUpdated) onStoriesUpdated();
    } catch (err) {
      showFeedback('error', 'Không thể lưu truyện vào cơ sở dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Publish New Chapter
  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveStoryId = targetStoryId || (stories.length > 0 ? stories[0].id : '');
    if (!effectiveStoryId || !chapterTitle.trim() || !chapterContent.trim()) {
      showFeedback('error', 'Vui lòng chọn truyện, nhập tiêu đề và nội dung chương.');
      return;
    }

    setIsProcessing(true);
    try {
      const chapterId = `${effectiveStoryId}-${partType === 'extra' ? 'extra' : 'c'}${chapterNumber}`;
      const newChapter: Chapter = {
        id: chapterId,
        storyId: effectiveStoryId,
        chapterNumber: Number(chapterNumber) || 1,
        title: chapterTitle.trim(),
        publishedAt: new Date().toISOString(),
        isLocked: isChapterLocked,
        content: chapterContent.trim(),
        translatorNote: translatorNote.trim(),
        wordCount: chapterContent.trim().split(/\s+/).length,
        isExtra: partType === 'extra',
        extraNumber: partType === 'extra' ? Number(chapterNumber) : 0,
        partType,
      };

      await publishChapter(newChapter);
      showFeedback('success', `🎉 Đã đăng thành công "${newChapter.title}"!`);

      // Reset form
      setChapterTitle('');
      setChapterContent('');
      setTranslatorNote('');
      setChapterNumber((prev) => prev + 1);

      if (onStoriesUpdated) onStoriesUpdated();
    } catch (err) {
      showFeedback('error', 'Lỗi khi đăng chương. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 6. Publish Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      showFeedback('error', 'Vui lòng nhập tiêu đề và nội dung thông báo.');
      return;
    }

    setIsProcessing(true);
    try {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: annTitle.trim(),
        tag: annTag,
        content: annContent.trim(),
        date: new Date().toLocaleDateString('vi-VN'),
        isPinned: annIsPinned,
      };

      await publishAnnouncement(newAnn);
      showFeedback('success', `🎉 Đã đăng bảng tin "${newAnn.title}" thành công!`);

      setAnnTitle('');
      setAnnContent('');
      if (onStoriesUpdated) onStoriesUpdated();
    } catch (err) {
      showFeedback('error', 'Lỗi khi đăng thông báo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 7. Delete story
  const handleDeleteStory = async (id: string, title: string) => {
    setIsProcessing(true);
    try {
      await deleteStory(id);
      showFeedback('success', `Đã xóa truyện "${title}".`);
      setStoryToDelete(null);
      if (onStoriesUpdated) onStoriesUpdated();
    } catch (err) {
      showFeedback('error', 'Lỗi khi xóa truyện.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Letter handlers for Author
  const handleAuthorReplyLetter = async (letterId: string) => {
    if (!authorReplyInput.trim() || isSendingReply) return;
    setIsSendingReply(true);
    try {
      await replyToReaderLetter(
        letterId,
        authorReplyInput.trim(),
        user?.displayName ? `${user.displayName} (Tác giả)` : 'Mellifluous (Tác giả)'
      );
      showFeedback('success', '✓ Đã gửi hồi đáp cho bạn đọc thành công!');
      setAuthorReplyInput('');
      setReplyingLetterId(null);
    } catch (err) {
      showFeedback('error', 'Lỗi khi gửi hồi đáp cho bạn đọc.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleDeleteLetterFromModal = async (letterId: string) => {
    try {
      await deleteReaderLetter(letterId);
      showFeedback('success', 'Đã xóa bức thư thành công.');
      setLetterToDelete(null);
    } catch (err) {
      showFeedback('error', 'Lỗi khi xóa bức thư.');
    }
  };

  return (
    <div
      id="author-publishing-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-pink-200/80 dark:border-stone-700 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-50 via-white to-amber-50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-800 border-b border-pink-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base sm:text-lg font-bold text-stone-800 dark:text-stone-100">
                  Trung tâm Tác giả & Xuất bản Web
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{user?.displayName || 'Tác giả'}</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Đang đăng nhập: <strong className="font-mono text-pink-600 dark:text-pink-400">{user?.email}</strong> • Quản lý xuất bản & tác phẩm Mellifluous
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logout}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
            <button
              type="button"
              id="close-author-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 hover:bg-pink-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-500 hover:text-pink-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div
            className={`px-6 py-3 text-xs sm:text-sm font-medium flex items-center gap-2 border-b ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Nav Tabs */}
        <div className="flex border-b border-pink-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 px-6 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('newStory')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'newStory'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400 font-bold bg-white dark:bg-stone-800/80 rounded-t-xl'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-pink-600'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Đăng truyện mới</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('newChapter')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'newChapter'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400 font-bold bg-white dark:bg-stone-800/80 rounded-t-xl'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-pink-600'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Đăng chương / Phiên ngoại</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('newAnnouncement')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'newAnnouncement'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400 font-bold bg-white dark:bg-stone-800/80 rounded-t-xl'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-pink-600'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Đăng Bảng tin</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('letters')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'letters'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400 font-bold bg-white dark:bg-stone-800/80 rounded-t-xl'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-pink-600'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Hòm thư bạn đọc ({letters.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'manage'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400 font-bold bg-white dark:bg-stone-800/80 rounded-t-xl'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-pink-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Quản lý bài đã đăng ({stories.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
          {/* ========================================================= */}
          {/* TAB 1: ĐĂNG TRUYỆN MỚI (NEW STORY)                         */}
          {/* ========================================================= */}
          {activeTab === 'newStory' && (
            <form onSubmit={handleCreateStory} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Tên truyện tiếng Việt <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Mùa Hè Năm Ấy Gió Thổi Ngang Qua"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Tên gốc tiếng Trung / Hàn (nếu có)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 那年夏天的风吹过"
                    value={storyOriginalTitle}
                    onChange={(e) => setStoryOriginalTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Tác giả gốc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Lam Hải Nhược Tuyết"
                    value={storyAuthor}
                    onChange={(e) => setStoryAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Dịch giả / Editor
                  </label>
                  <input
                    type="text"
                    value={storyTranslator}
                    onChange={(e) => setStoryTranslator(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Tình trạng truyện
                  </label>
                  <select
                    value={storyStatus}
                    onChange={(e) => setStoryStatus(e.target.value as 'completed' | 'ongoing')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                  >
                    <option value="ongoing">Đang tiến hành (Đang cập nhật)</option>
                    <option value="completed">Đã hoàn thành (Full HE)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Dự kiến tổng số chương
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={totalChapters}
                    onChange={(e) => setTotalChapters(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                  />
                </div>
              </div>

              {/* Genre Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Thể loại truyện (Nhấp để chọn)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_GENRES.map((g) => {
                    const isSelected = selectedGenres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          if (isSelected) setSelectedGenres(selectedGenres.filter((x) => x !== g));
                          else setSelectedGenres([...selectedGenres, g]);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-pink-500 text-white border-pink-500 font-medium'
                            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-pink-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Story Summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Văn án / Tóm tắt truyện
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập văn án ngọt ngào hoặc lời tựa của bộ truyện..."
                  value={storySummary}
                  onChange={(e) => setStorySummary(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-300 leading-relaxed"
                />
              </div>

              {/* Cover Presets or Custom URL */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Chọn ảnh bìa minh họa phong cách màu nước:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {PRESET_COVERS.map((cov) => (
                    <div
                      key={cov.url}
                      onClick={() => setStoryCover(cov.url)}
                      className={`relative aspect-3/4 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        storyCover === cov.url
                          ? 'border-pink-500 shadow-md ring-2 ring-pink-300'
                          : 'border-transparent hover:opacity-80'
                      }`}
                    >
                      <img src={cov.url} alt={cov.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                        <span className="text-[10px] text-white font-medium line-clamp-1">{cov.name}</span>
                      </div>
                      {storyCover === cov.url && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pt-1">
                  <input
                    type="url"
                    placeholder="Hoặc dán URL ảnh bìa tùy chỉnh của bạn..."
                    value={storyCover}
                    onChange={(e) => setStoryCover(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              {/* Password Settings */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-800/60 border border-amber-200/80 dark:border-stone-700 space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPassword}
                    onChange={(e) => setHasPassword(e.target.checked)}
                    className="rounded-sm text-pink-500 focus:ring-pink-400"
                  />
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>Cài đặt mật khẩu (Password) cho truyện này</span>
                </label>

                {hasPassword && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[11px] text-stone-600 dark:text-stone-400 block mb-1">
                        Gợi ý giải pass (hiển thị cho bạn đọc)
                      </span>
                      <input
                        type="text"
                        placeholder="VD: Tên loài hoa kẹp trong từ điển (10 ký tự không dấu)"
                        value={passwordHint}
                        onChange={(e) => setPasswordHint(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-600 dark:text-stone-400 block mb-1">
                        Đáp án mật mã (viết thường không dấu)
                      </span>
                      <input
                        type="text"
                        placeholder="VD: hoaanhdao"
                        value={passwordKey}
                        onChange={(e) => setPasswordKey(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isProcessing ? 'Đang lưu...' : 'Xuất bản tác phẩm ngay (Views = 0)'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* TAB 3: ĐĂNG CHƯƠNG MỚI (NEW CHAPTER)                       */}
          {/* ========================================================= */}
          {activeTab === 'newChapter' && (
            <form onSubmit={handleCreateChapter} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Chọn bộ truyện <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={targetStoryId}
                    onChange={(e) => setTargetStoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium"
                  >
                    {stories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Phân loại chương
                  </label>
                  <select
                    value={partType}
                    onChange={(e) => setPartType(e.target.value as 'main' | 'extra')}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  >
                    <option value="main">Chính truyện</option>
                    <option value="extra">Phiên ngoại (Ngoại truyện)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Số thứ tự chương
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Tiêu đề chương <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Chương 1: Cơn gió đầu mùa hè năm ấy"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Lời nhắn gửi của Mellifluous (Translator Note)
                </label>
                <input
                  type="text"
                  placeholder="VD: Chúc các nàng đọc truyện vui vẻ! Hãy để lại bình luận cho tớ biết cảm nhận nhé 🌸"
                  value={translatorNote}
                  onChange={(e) => setTranslatorNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Nội dung chương truyện <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Dán hoặc gõ toàn bộ nội dung chương truyện tại đây..."
                  value={chapterContent}
                  onChange={(e) => setChapterContent(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-pink-300 font-serif"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChapterLocked}
                    onChange={(e) => setIsChapterLocked(e.target.checked)}
                    className="rounded-sm text-amber-500 focus:ring-amber-400"
                  />
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Khóa mật khẩu chương này (Chỉ mở khi độc giả giải đúng pass)</span>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-sm shadow-sm hover:from-pink-600 hover:to-rose-600 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Đang đăng...' : 'Đăng chương này ngay'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* TAB 4: ĐĂNG BẢNG TIN (NEW ANNOUNCEMENT)                    */}
          {/* ========================================================= */}
          {activeTab === 'newAnnouncement' && (
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Tiêu đề bảng tin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Lịch đăng chương tuần mới • Tháng 7 rực rỡ"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-pink-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Thẻ phân loại
                  </label>
                  <select
                    value={annTag}
                    onChange={(e) => setAnnTag(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium"
                  >
                    <option value="Thông báo">Thông báo chung</option>
                    <option value="Lịch đăng">Lịch đăng chương</option>
                    <option value="Nhắc nhở">Nhắc nhở giải pass</option>
                    <option value="Lưu ý">Lưu ý bản quyền & phi thương mại</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Nội dung thông báo <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập thông tin nhắn gửi đến độc giả của nhà..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={annIsPinned}
                    onChange={(e) => setAnnIsPinned(e.target.checked)}
                    className="rounded-sm text-pink-500"
                  />
                  <span>Ghim thông báo này lên đầu trang</span>
                </label>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
                >
                  {isProcessing ? 'Đang lưu...' : 'Đăng bảng tin'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* TAB: QUẢN LÝ HÒM THƯ BẠN ĐỌC & HỒI ĐÁP (READER LETTERS)   */}
          {/* ========================================================= */}
          {activeTab === 'letters' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-pink-500" />
                    <span>Hòm thư & Tâm sự của Độc giả ({letters.length})</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Phản hồi các tâm tình, giải đáp câu hỏi và gửi gắm những lời chúc dịu dàng tới bạn đọc
                  </p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'unanswered', label: 'Chưa hồi đáp' },
                    { id: 'private', label: 'Thư kín 🔒' },
                    { id: 'public', label: 'Công khai 💌' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setLetterFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        letterFilter === f.id
                          ? 'bg-pink-500 text-white shadow-2xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {letters.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-2">
                  <p className="text-sm font-serif text-stone-700 dark:text-stone-300">
                    Hòm thư hiện chưa có bức thư nào.
                  </p>
                  <p className="text-xs text-stone-500">
                    Khi độc giả gửi lời nhắn hoặc tâm sự, thư sẽ tự động hiển thị tại đây để bạn đọc và phản hồi!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {letters
                    .filter((item) => {
                      if (letterFilter === 'unanswered') return !item.replyFromMel;
                      if (letterFilter === 'private') return item.type === 'private';
                      if (letterFilter === 'public') return item.type === 'public';
                      return true;
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 shadow-xs space-y-3"
                      >
                        {/* Letter Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl select-none">{item.avatar || '💌'}</span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-serif font-bold text-sm text-stone-800 dark:text-stone-100">
                                  {item.sender}
                                </span>
                                {item.type === 'private' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" />
                                    <span>Thư thầm kín</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                                    Công khai
                                  </span>
                                )}
                                {item.tag && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400">
                                    {item.tag}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono mt-0.5">
                                <span>{item.time || new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                                {item.senderEmail && (
                                  <>
                                    <span>•</span>
                                    <span>{item.senderEmail}</span>
                                  </>
                                )}
                                {item.secretLookupCode && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                                      Mã tra cứu: {item.secretLookupCode}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {letterToDelete === item.id ? (
                            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 p-1 rounded-lg border border-rose-200">
                              <span className="text-[10px] text-rose-700 dark:text-rose-300 font-medium px-1">Xóa thư?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteLetterFromModal(item.id)}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white hover:bg-rose-600"
                              >
                                Xóa
                              </button>
                              <button
                                type="button"
                                onClick={() => setLetterToDelete(null)}
                                className="px-1.5 py-0.5 rounded text-[10px] text-stone-500 hover:bg-stone-200"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setLetterToDelete(item.id)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                              title="Xóa thư"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Letter Content */}
                        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-700/60 text-xs sm:text-sm font-sans text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                          {item.content}
                        </div>

                        {/* Existing Reply */}
                        {item.replyFromMel && (
                          <div className="p-3.5 rounded-xl bg-pink-50/70 dark:bg-pink-950/40 border border-pink-200/80 dark:border-pink-800/60 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-serif font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5">
                                <span>🌸</span>
                                <span>{item.repliedBy || 'Mellifluous (Tác giả)'}:</span>
                              </span>
                              <span className="text-pink-400 font-mono text-[10px]">
                                {item.repliedAt ? new Date(item.repliedAt).toLocaleDateString('vi-VN') : 'Đã phản hồi'}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-sans italic leading-relaxed pl-5">
                              "{item.replyFromMel}"
                            </p>
                          </div>
                        )}

                        {/* Reply Form */}
                        {replyingLetterId === item.id ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              rows={3}
                              value={authorReplyInput}
                              onChange={(e) => setAuthorReplyInput(e.target.value)}
                              placeholder={`Nhập lời phản hồi dịu dàng gửi tới ${item.sender}...`}
                              className="w-full p-3 rounded-xl border border-pink-300 dark:border-pink-700 bg-white dark:bg-stone-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-400 font-sans"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingLetterId(null);
                                  setAuthorReplyInput('');
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                disabled={isSendingReply || !authorReplyInput.trim()}
                                onClick={() => handleAuthorReplyLetter(item.id)}
                                className="px-4 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isSendingReply ? 'Đang gửi...' : 'Gửi hồi đáp'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingLetterId(item.id);
                                setAuthorReplyInput(item.replyFromMel || '');
                              }}
                              className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-pink-50 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                            >
                              <Reply className="w-3.5 h-3.5" />
                              <span>{item.replyFromMel ? 'Sửa lời hồi đáp' : 'Hồi đáp thư này'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: QUẢN LÝ BÀI ĐÃ ĐĂNG (MANAGE POSTS)                 */}
          {/* ========================================================= */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  Hiện có <strong>{stories.length}</strong> bộ truyện trên website
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('newStory')}
                  className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Thêm truyện mới</span>
                </button>
              </div>

              {stories.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-2">
                  <p className="text-sm font-serif text-stone-700 dark:text-stone-300">
                    Chưa có bộ truyện nào trên website.
                  </p>
                  <p className="text-xs text-stone-500">
                    Hãy bấm vào tab "Đăng truyện mới" để xuất bản tác phẩm đầu tiên của bạn!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden bg-white dark:bg-stone-800/80">
                  {stories.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-pink-50/40 dark:hover:bg-stone-700/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={s.coverImage}
                          alt={s.title}
                          className="w-12 h-16 object-cover rounded-lg shrink-0 border border-stone-200 dark:border-stone-700"
                        />
                        <div className="min-w-0">
                          <h4 className="font-serif text-sm font-bold text-stone-800 dark:text-stone-100 truncate">
                            {s.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                            <span>Tác giả: {s.author}</span>
                            <span>•</span>
                            <span className="text-sky-600 dark:text-sky-400">
                              {s.views || 0} lượt xem
                            </span>
                            <span>•</span>
                            <span className="text-pink-600 dark:text-pink-400">
                              {s.likes || 0} tim
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setTargetStoryId(s.id);
                            setActiveTab('newChapter');
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300 font-medium hover:bg-pink-100 transition-colors"
                        >
                          + Thêm chương
                        </button>

                        {storyToDelete?.id === s.id ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 p-1 rounded-lg border border-rose-200 dark:border-rose-800">
                            <span className="text-[10px] text-rose-700 dark:text-rose-300 font-medium px-1">Xóa truyện?</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteStory(s.id, s.title)}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                            >
                              Xóa ngay
                            </button>
                            <button
                              type="button"
                              onClick={() => setStoryToDelete(null)}
                              className="px-1.5 py-1 rounded text-[10px] text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStoryToDelete({ id: s.id, title: s.title })}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Xóa truyện này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
