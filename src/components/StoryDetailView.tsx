import React, { useState, useEffect } from 'react';
import { Story, Chapter, RealtimeComment } from '../types';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  Key,
  Heart,
  Eye,
  Sparkles,
  Lock,
  Bookmark,
  Share2,
  Flower2,
  Star,
  MessageSquare,
  BookmarkCheck,
  Send,
  Reply,
  Trash2,
  CornerDownRight,
  ShieldCheck,
} from 'lucide-react';
import {
  subscribeToStoryStats,
  toggleStoryLike,
  toggleStoryFollow,
  submitStoryRating,
  subscribeToComments,
  postRealtimeComment,
  postCommentReply,
  deleteComment,
  recordStoryView,
} from '../lib/realtimeService';
import { useAuth } from '../lib/authContext';


interface StoryDetailViewProps {
  story: Story;
  chapters: Chapter[];
  onBack: () => void;
  onSelectChapter: (chapterNumber: number) => void;
  onGoToPasswordGuide: () => void;
}

export const StoryDetailView: React.FC<StoryDetailViewProps> = ({
  story,
  chapters,
  onBack,
  onSelectChapter,
  onGoToPasswordGuide,
}) => {
  const [chapterFilter, setChapterFilter] = useState<'all' | 'main' | 'extra'>('all');
  const isCompleted = story.status === 'completed';

  // Realtime stats from Firestore
  const [realtimeViews, setRealtimeViews] = useState<number>(story.views || 0);
  const [realtimeLikes, setRealtimeLikes] = useState<number>(story.likes || 0);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [ratingSum, setRatingSum] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const [isLiked, setIsLiked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`mel_liked_story_${story.id}`) === 'true';
    } catch {
      return false;
    }
  });

  const [isFollowed, setIsFollowed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`mel_followed_story_${story.id}`) === 'true';
    } catch {
      return false;
    }
  });

  const { user, isAuthor, isMainAuthor, isCollaborator, roleBadge, openAuthModal } = useAuth();

  // Comments state
  const [comments, setComments] = useState<RealtimeComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isCopiedShare, setIsCopiedShare] = useState(false);

  // Reply & moderation state
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyUserName, setReplyUserName] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    if (user) {
      if (isMainAuthor) setAuthorName('Mellifluous (Tác giả)');
      else if (isCollaborator) setAuthorName(user.displayName || 'Cộng sự BQT');
      else if (user.displayName) setAuthorName(user.displayName);
      else if (user.email) setAuthorName(user.email.split('@')[0]);
    }
  }, [user, isAuthor, isMainAuthor, isCollaborator]);


  useEffect(() => {
    // Record view in Firestore
    recordStoryView(story.id);

    // Subscribe to realtime story statistics
    const unsubscribeStats = subscribeToStoryStats(
      story.id,
      story.views,
      story.likes,
      (live) => {
        setRealtimeViews(live.views);
        setRealtimeLikes(live.likes);
        setFollowersCount(live.followers);
        setRatingSum(live.ratingSum);
        setRatingCount(live.ratingCount);
      }
    );

    // Subscribe to realtime comments
    const unsubscribeComments = subscribeToComments(story.id, null, (list) => {
      setComments(list);
    });

    return () => {
      unsubscribeStats();
      unsubscribeComments();
    };
  }, [story.id, story.views, story.likes]);

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

  const handleRating = (stars: number) => {
    setUserRating(stars);
    submitStoryRating(story.id, stars);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopiedShare(true);
      setTimeout(() => setIsCopiedShare(false), 2200);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmittingComment) return;

    const sender = authorName.trim() || (isMainAuthor ? 'Mellifluous (Tác giả)' : isCollaborator ? (user?.displayName || 'Cộng sự BQT') : (user?.displayName || 'Bạn đọc yêu truyện'));

    setIsSubmittingComment(true);
    try {
      await postRealtimeComment({
        storyId: story.id,
        user: sender,
        userEmail: user?.email || null,
        userId: user?.uid || null,
        isAuthor: Boolean(isMainAuthor),
        isCollaborator: Boolean(isCollaborator),
        roleBadge: isMainAuthor ? 'Tác giả' : isCollaborator ? 'Cộng sự' : undefined,
        avatar: isMainAuthor ? '🌸' : isCollaborator ? '🌿' : (user?.photoURL || '🌸'),
        text: newCommentText.trim(),
        rating: userRating || null,
      });
      setNewCommentText('');
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
      : (user?.displayName || replyUserName.trim() || authorName.trim() || 'Bạn đọc');

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
      console.error('Failed to reply:', err);
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


  const mainChapters = chapters.filter((c) => !c.isExtra && c.partType !== 'extra');
  const extraChapters = chapters.filter((c) => c.isExtra || c.partType === 'extra');

  const displayedChapters =
    chapterFilter === 'main'
      ? mainChapters
      : chapterFilter === 'extra'
      ? extraChapters
      : chapters;

  const latestExtraChapter = extraChapters[extraChapters.length - 1];
  const averageRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '0';

  return (
    <div id="story-detail-view" className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Back button & Realtime connection badge */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-medium hover:bg-pink-50 dark:hover:bg-stone-700 transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-pink-500" />
          <span>Quay lại danh sách truyện</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Đồng bộ số liệu Firestore trực tiếp</span>
        </div>
      </div>

      {/* Main Story Hero Card */}
      <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-white dark:bg-stone-800 border border-pink-200/80 dark:border-stone-700 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          {/* Cover & Live Action Card */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="relative aspect-3/4 rounded-2xl overflow-hidden border border-pink-200 dark:border-stone-700 shadow-md group">
              <img
                src={story.coverImage}
                alt={story.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs ${
                    isCompleted ? 'bg-emerald-500/90 text-white' : 'bg-sky-500/90 text-white'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  <span>{isCompleted ? 'Full (HE)' : 'Đang tiến hành'}</span>
                </span>
                {extraChapters.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/90 text-white backdrop-blur-md shadow-xs">
                    🌸 +{extraChapters.length} ngoại
                  </span>
                )}
              </div>
            </div>

            {/* Quick interactive buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleToggleLike}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isLiked
                    ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300'
                    : 'bg-white dark:bg-stone-700 border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:bg-pink-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isLiked ? 'Đã tim' : 'Thả tim'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleFollow}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isFollowed
                    ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
                    : 'bg-white dark:bg-stone-700 border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:bg-amber-50'
                }`}
              >
                {isFollowed ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{isFollowed ? 'Đã theo dõi' : 'Theo dõi'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-700/80 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-pink-500" />
              <span>{isCopiedShare ? 'Đã chép link truyện!' : 'Chia sẻ tác phẩm'}</span>
            </button>
          </div>

          {/* Story Metadata, Live Stats & Synopsis */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {story.genre.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-pink-100/70 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 dark:text-stone-100">
                {story.title}
              </h1>
              {story.originalTitle && (
                <p className="font-serif italic text-stone-400 dark:text-stone-500 text-sm">
                  Tên gốc: {story.originalTitle}
                </p>
              )}
            </div>

            {/* Author info & stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-pink-100 dark:border-stone-700/80 text-xs sm:text-sm">
              <div>
                <span className="text-stone-400 block text-[11px]">Tác giả</span>
                <strong className="text-stone-800 dark:text-stone-200">{story.author}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Dịch giả / Editor</span>
                <strong className="text-pink-600 dark:text-pink-400">{story.translator}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Quy mô tác phẩm</span>
                <strong className="text-stone-800 dark:text-stone-200 block">
                  {story.totalChapters} chương
                </strong>
                <span className="text-[11px] text-pink-600 dark:text-pink-400">
                  {story.mainChaptersCount || 40} chính + {story.extraChaptersCount || extraChapters.length || 5} ngoại
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Tình trạng</span>
                <strong className={isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'}>
                  {isCompleted ? 'Đã hoàn thành' : 'Đang cập nhật'}
                </strong>
              </div>
            </div>

            {/* Realtime Live Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-pink-50/60 dark:bg-stone-900/60 border border-pink-200/60 dark:border-stone-700 text-xs font-sans">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">Lượt xem thật</span>
                  <strong className="font-mono font-bold text-stone-800 dark:text-stone-100">
                    {realtimeViews.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                  <Heart className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">Lượt tim thật</span>
                  <strong className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {realtimeLikes.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Bookmark className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">Người theo dõi</span>
                  <strong className="font-mono font-bold text-amber-700 dark:text-amber-300">
                    {followersCount.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">Bình luận</span>
                  <strong className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {comments.length}
                  </strong>
                </div>
              </div>
            </div>

            {/* Interactive Rating Row */}
            <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-serif text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Đánh giá tác phẩm:
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRating(star)}
                      className="p-0.5 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                      title={`Đánh giá ${star} sao`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          (hoverRating || userRating || (ratingCount > 0 ? Math.round(Number(averageRating)) : 0)) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 dark:text-stone-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {ratingCount > 0 ? (
                  <>
                    <span className="font-mono font-bold text-xs text-amber-800 dark:text-amber-300 ml-1">
                      {averageRating}/5
                    </span>
                    <span className="text-[11px] text-stone-400">({ratingCount} lượt vote thực)</span>
                  </>
                ) : (
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 ml-1">
                    (Chưa có đánh giá • Hãy là người đầu tiên vote sao nhé!)
                  </span>
                )}
              </div>

              {userRating > 0 && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Bạn đã đánh giá {userRating} sao! Cảm ơn bạn.
                </span>
              )}
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>Văn án câu chuyện:</span>
              </h3>
              <p className="font-serif text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed indent-4">
                {story.summary}
              </p>
            </div>

            {/* Password Hint Alert if applicable */}
            {story.hasPassword && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                <Key className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Truyện có cài đặt mật khẩu cho một số chương quan trọng & phiên ngoại
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 italic font-serif">
                    Gợi ý: "{story.passwordHint}"
                  </p>
                  <button
                    type="button"
                    onClick={onGoToPasswordGuide}
                    className="text-xs text-pink-600 dark:text-pink-400 font-medium hover:underline pt-1 block cursor-pointer"
                  >
                    Xem cẩm nang giải pass chi tiết tại đây →
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => onSelectChapter(1)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-medium shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Đọc từ Chương 1 (Chính truyện)</span>
              </button>

              {latestExtraChapter && (
                <button
                  type="button"
                  onClick={() => onSelectChapter(latestExtraChapter.chapterNumber)}
                  className="px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Flower2 className="w-4 h-4 text-rose-500" />
                  <span>Đọc Phiên ngoại mới nhất</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onSelectChapter(chapters[chapters.length - 1]?.chapterNumber || 1)}
                className="px-5 py-2.5 rounded-xl bg-pink-50 dark:bg-stone-700 text-pink-700 dark:text-pink-300 hover:bg-pink-100 text-sm font-medium transition-colors cursor-pointer"
              >
                Đọc chương mới nhất
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Table of Contents */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 dark:border-stone-700 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-pink-500" />
            <h2 className="font-serif text-xl font-bold text-stone-800 dark:text-stone-100">
              Mục lục các chương truyện
            </h2>
          </div>

          {/* Chapter Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-900/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80 text-xs font-medium">
            <button
              type="button"
              onClick={() => setChapterFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chapterFilter === 'all'
                  ? 'bg-white dark:bg-stone-800 text-pink-600 dark:text-pink-400 font-bold shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Tất cả ({chapters.length})
            </button>
            <button
              type="button"
              onClick={() => setChapterFilter('main')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chapterFilter === 'main'
                  ? 'bg-white dark:bg-stone-800 text-pink-600 dark:text-pink-400 font-bold shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Chính truyện ({mainChapters.length})
            </button>
            <button
              type="button"
              onClick={() => setChapterFilter('extra')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                chapterFilter === 'extra'
                  ? 'bg-rose-500 text-white font-bold shadow-2xs'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30'
              }`}
            >
              <span>🌸 Phiên ngoại</span>
              <span className="text-[11px] opacity-90">({extraChapters.length})</span>
            </button>
          </div>
        </div>

        {displayedChapters.length === 0 ? (
          <div className="py-12 text-center text-stone-500 italic font-serif">
            Chưa có chương nào trong danh mục này.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedChapters.map((ch) => {
              const isExtra = ch.isExtra || ch.partType === 'extra';
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onSelectChapter(ch.chapterNumber)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-left transition-all duration-200 group cursor-pointer ${
                    isExtra
                      ? 'bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border-rose-200/80 dark:border-rose-900/60'
                      : 'bg-stone-50 hover:bg-pink-50/70 dark:bg-stone-900/60 dark:hover:bg-stone-700/60 border-stone-200/70 dark:border-stone-700'
                  }`}
                >
                  <div className="space-y-1 flex-1 truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-stone-400 group-hover:text-pink-500">
                        {ch.publishedAt}
                      </span>
                      {isExtra && (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200/60">
                          🌸 Phiên ngoại {ch.extraNumber ? `#${ch.extraNumber}` : ''}
                        </span>
                      )}
                    </div>
                    <p
                      className={`font-serif text-sm font-semibold truncate ${
                        isExtra
                          ? 'text-rose-900 dark:text-rose-200 group-hover:text-rose-600'
                          : 'text-stone-800 dark:text-stone-200 group-hover:text-pink-600 dark:group-hover:text-pink-300'
                      }`}
                    >
                      {ch.title}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {ch.isLocked ? (
                      <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-medium">
                        <Lock className="w-3 h-3" />
                        Pass
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                        Đọc ngay
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Realtime Reader Comments Section */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-pink-100 dark:border-stone-700 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-pink-500" />
            <h2 className="font-serif text-xl font-bold text-stone-800 dark:text-stone-100">
              Bình luận độc giả thời gian thực
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-xs font-mono font-bold">
              {comments.length}
            </span>
          </div>
          <span className="text-xs text-stone-400 font-sans hidden sm:inline">
            Cập nhật tự động trên mọi thiết bị
          </span>
        </div>

        {/* Active auth status or prompt */}
        <div className="flex items-center justify-between text-xs px-1">
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
              <span className="text-stone-500 dark:text-stone-400 text-[11px]">
                ✍️ Bạn có thể bình luận và trả lời tự do, hoặc đăng nhập để lưu danh tính:
              </span>
              <button
                type="button"
                onClick={openAuthModal}
                className="text-[11px] font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 underline cursor-pointer"
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>

        {/* Post comment form */}
        <form onSubmit={handleSendComment} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={user ? (isMainAuthor ? 'Mellifluous (Tác giả)' : isCollaborator ? 'Cộng sự BQT' : 'Tên của bạn...') : 'Tên của bạn hoặc biệt hiệu (không bắt buộc)...'}
              className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-400"
            />
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Chia sẻ cảm nhận thật về tác phẩm này..."
              className="sm:col-span-2 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingComment || !newCommentText.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingComment ? 'Đang gửi...' : 'Gửi bình luận'}</span>
            </button>
          </div>
        </form>

        {/* Comments list */}
        <div className="space-y-3 pt-2">
          {comments.length === 0 ? (
            <div className="p-8 text-center text-stone-400 italic text-xs font-serif">
              Chưa có bình luận nào. Hãy là người đầu tiên để lại cảm xúc nhé! 🌸
            </div>
          ) : (
            comments.map((cmt) => {
              const isCmtMainAuthor = cmt.roleBadge === 'Tác giả' || (cmt.isAuthor && !cmt.isCollaborator);
              const isCmtCollaborator = cmt.roleBadge === 'Cộng sự' || cmt.isCollaborator;

              return (
                <div
                  key={cmt.id}
                  className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                    isCmtMainAuthor
                      ? 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-300 dark:border-rose-900/60'
                      : isCmtCollaborator
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-300 dark:border-emerald-900/60'
                      : 'bg-stone-50/70 dark:bg-stone-900/60 border-stone-200/60 dark:border-stone-700/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                        isCmtMainAuthor
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200 ring-2 ring-rose-400/50'
                          : isCmtCollaborator
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400/50'
                          : 'bg-pink-100 dark:bg-pink-950 text-pink-600'
                      }`}
                    >
                      {cmt.avatar || (isCmtMainAuthor ? '🌸' : isCmtCollaborator ? '🌿' : '💬')}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`font-semibold font-serif truncate ${
                            isCmtMainAuthor
                              ? 'text-rose-950 dark:text-rose-200'
                              : isCmtCollaborator
                              ? 'text-emerald-950 dark:text-emerald-200'
                              : 'text-stone-800 dark:text-stone-200'
                          }`}>
                            {cmt.user}
                          </span>
                          {isCmtMainAuthor && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/80 dark:text-rose-200 border border-rose-300/60 shrink-0">
                              🌸 Tác giả • Mellifluous
                            </span>
                          )}
                          {isCmtCollaborator && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 border border-emerald-300/60 shrink-0">
                              🌿 Cộng sự • BQT
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-stone-400 shrink-0">
                          {cmt.createdAt ? new Date(cmt.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                        </span>
                      </div>

                      <p className="text-xs sm:text-[13px] text-stone-700 dark:text-stone-300 leading-relaxed font-sans break-words">
                        {cmt.text}
                      </p>

                      {/* Actions: Reply and Delete */}
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
                    <div className="pl-4 sm:pl-7 space-y-2 border-l-2 border-pink-200/80 dark:border-stone-700 ml-4 my-1.5">
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
                                : 'bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <CornerDownRight className={`w-3 h-3 shrink-0 ${isRepMainAuthor ? 'text-rose-500' : isRepCollaborator ? 'text-emerald-500' : 'text-pink-500'}`} />
                                <span className={`font-semibold ${isRepMainAuthor ? 'text-rose-950 dark:text-rose-200' : isRepCollaborator ? 'text-emerald-950 dark:text-emerald-200' : 'text-stone-800 dark:text-stone-200'}`}>
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
                              <span className="text-[10px] font-mono text-stone-400">
                                {new Date(rep.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="pl-4 font-sans text-xs sm:text-[13px] text-stone-700 dark:text-stone-300 leading-relaxed break-words">
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
                      <div className="p-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-100/70 dark:bg-stone-900/80 space-y-2.5">
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
                            className="w-full sm:w-64 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
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
                                : 'Nhập phản hồi của bạn...'
                            }
                            className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
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

    </div>
  );
};
