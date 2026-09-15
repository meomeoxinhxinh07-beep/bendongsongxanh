import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Music,
  MessageCircleHeart,
  BookOpen,
  Coffee,
  Send,
  Check,
  Lock,
  Globe,
  Heart,
  ShieldCheck,
  Smile,
  Mail,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  Reply,
  Trash2,
  KeyRound,
  Search,
  Copy,
} from 'lucide-react';
import { PLAYLIST } from '../data/mockData';
import { bgmEngine, AudioTrack, TRACK_LIST } from '../utils/audioPlayer';
import {
  subscribeToReaderLetters,
  sendReaderLetter,
  replyToReaderLetter,
  deleteReaderLetter,
  toggleLetterLike,
  ReaderLetter,
} from '../lib/realtimeService';
import { useAuth } from '../lib/authContext';

export const OtherSections: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diary' | 'music' | 'faq'>('diary');
  const { user, isAuthor, isMainAuthor, isCollaborator, roleBadge, openAuthModal } = useAuth();

  // Background Music state
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [currentBgmTrack, setCurrentBgmTrack] = useState<AudioTrack>(TRACK_LIST[0]);
  const [bgmVolume, setBgmVolume] = useState(0.4);

  useEffect(() => {
    const unsubscribe = bgmEngine.subscribe((state) => {
      setIsBgmPlaying(state.isPlaying);
      setCurrentBgmTrack(state.track);
      setBgmVolume(state.volume);
    });
    return unsubscribe;
  }, []);

  // Confession form states
  const [letterType, setLetterType] = useState<'public' | 'private'>('public');
  const [guestSender, setGuestSender] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [selectedTag, setSelectedTag] = useState('🌸 Lời chúc & Cảm ơn');
  const [sentSuccessType, setSentSuccessType] = useState<'public' | 'private' | null>(null);
  const [createdSecretCode, setCreatedSecretCode] = useState<string | null>(null);
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isSubmittingLetter, setIsSubmittingLetter] = useState(false);

  // Stored public and private letters from Firestore
  const [letters, setLetters] = useState<ReaderLetter[]>([]);
  const [authorMailboxTab, setAuthorMailboxTab] = useState<'public' | 'private'>('public');

  // Reader private letter lookup state
  const [lookupInputCode, setLookupInputCode] = useState('');
  const [lookedUpLetter, setLookedUpLetter] = useState<ReaderLetter | null>(null);
  const [lookupError, setLookupError] = useState('');

  // Author inline reply state
  const [replyingLetterId, setReplyingLetterId] = useState<string | null>(null);
  const [authorReplyText, setAuthorReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    if (user && !guestSender) {
      setGuestSender(user.displayName || user.email.split('@')[0]);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = subscribeToReaderLetters((list) => {
      setLetters(list);
    });
    return unsubscribe;
  }, []);

  const availableTags = [
    '🌸 Lời chúc & Cảm ơn',
    '☕ Tâm sự mùa hè',
    '📖 Đề xuất truyện mới',
    '💭 Trải lòng thầm kín',
  ];

  const handleSendConfession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!guestMessage.trim() || isSubmittingLetter) return;

    const senderName = guestSender.trim() || (user.displayName || user.email?.split('@')[0] || 'Bạn Đọc Ẩn Danh');
    setIsSubmittingLetter(true);
    setCreatedSecretCode(null);

    try {
      const result = await sendReaderLetter({
        sender: senderName,
        content: guestMessage.trim(),
        type: letterType,
        tag: selectedTag,
        avatar: user.photoURL || (letterType === 'public' ? '🌸' : '💌'),
        userEmail: user.email || undefined,
        userId: user.uid,
      });

      if (letterType === 'private' && result.secretLookupCode) {
        setCreatedSecretCode(result.secretLookupCode);
        setSentSuccessType('private');
      } else {
        setSentSuccessType('public');
      }

      setGuestMessage('');
    } catch (err) {
      console.error('Failed to send letter:', err);
    } finally {
      setIsSubmittingLetter(false);
      setTimeout(() => {
        setSentSuccessType(null);
      }, 10000);
    }
  };

  const handleLikeLetter = async (id: string) => {
    try {
      await toggleLetterLike(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAuthorReply = async (letterId: string) => {
    if (!authorReplyText.trim() || isSubmittingReply) return;
    setIsSubmittingReply(true);
    const replier = isMainAuthor
      ? 'Mellifluous (Tác giả)'
      : isCollaborator
      ? (user?.displayName || 'Cộng sự BQT')
      : 'Ban Quản Trị';

    try {
      await replyToReaderLetter(letterId, authorReplyText.trim(), replier);
      setAuthorReplyText('');
      setReplyingLetterId(null);
    } catch (err) {
      console.error('Failed to reply letter:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteLetter = async (id: string) => {
    if (!window.confirm('Xác nhận xóa bức thư này?')) return;
    try {
      await deleteReaderLetter(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLookupPrivateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookedUpLetter(null);
    const code = lookupInputCode.trim().toUpperCase();
    if (!code) return;
    const match = letters.find(
      (l) => l.type === 'private' && l.secretLookupCode?.toUpperCase() === code
    );
    if (match) {
      setLookedUpLetter(match);
    } else {
      setLookupError('Không tìm thấy bức thư với mã này. Hãy kiểm tra lại mã niêm phong nhé!');
    }
  };


  return (
    <div id="other-sections-view" className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-sky-50 via-blue-50/70 to-pink-50/70 dark:from-stone-800 dark:via-stone-900 dark:to-sky-950/40 border border-sky-200 dark:border-stone-700 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-semibold text-sky-600 dark:text-sky-400">
              <span>🎐</span>
              <span>Góc nhỏ dành cho những tâm hồn đồng điệu</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 mt-1">
              Một Số Mục Khác Của Nhà Mel
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-serif italic mt-1">
              Nhật ký chiếc thuyền nhỏ, hòm thư tâm sự (thầm kín & công khai), playlist mùa hạ
            </p>
          </div>

          {/* Sub-tab pills */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 shrink-0">
            <button
              type="button"
              id="subtab-diary-btn"
              onClick={() => setActiveTab('diary')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'diary'
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
            >
              Tâm sự & Hòm thư
            </button>
            <button
              type="button"
              id="subtab-music-btn"
              onClick={() => setActiveTab('music')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'music'
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
            >
              Playlist mùa hạ
            </button>
            <button
              type="button"
              id="subtab-faq-btn"
              onClick={() => setActiveTab('faq')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
            >
              Hỏi đáp (FAQ)
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: DIARY & CONFESSIONS */}
      {activeTab === 'diary' && (
        <div className="space-y-8">
          {/* Mel's Heartfelt Diary Entry */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-700 pb-3">
              <span className="font-serif font-bold text-lg text-stone-800 dark:text-stone-100 flex items-center gap-2">
                <span>⛵</span>
                <span>Chuyện chiếc thuyền nhỏ lênh đênh ngược gió</span>
              </span>
              <span className="text-xs font-mono text-stone-400">Đêm hè dịu dàng</span>
            </div>

            <div className="space-y-4 font-serif text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed indent-6">
              <p>
                Có những ngày trở về nhà sau giờ làm việc mệt nhoài, mình lại mở máy tính lên, ngồi gõ từng dòng chữ dịch của những câu chuyện tình thanh xuân thuần khiết. Giữa cuộc sống bận rộn nhiều áp lực, việc đắm mình vào một góc nhỏ có hoa anh đào, có tiếng ve mùa hè, có sự chân thành của lứa tuổi mười bảy chính là liều thuốc chữa lành dịu êm nhất.
              </p>
              <p>
                Trang blog này được lập ra như một chiếc thuyền nhỏ dự phòng. Thuyền tuy nhỏ nhưng hy vọng có thể che chở cho những kỷ niệm đẹp đẽ, mang lại cho bạn một chút ngọt ngào khi nhâm nhi tách trà chiều.
              </p>
              <p>
                Cảm ơn bạn vì đã ghé thăm và dừng chân lại chốn này giữa biển người bao la. Mùa hè có thể trôi qua, nhưng tình cảm trong những trang sách sẽ mãi mãi còn vẹn nguyên.
              </p>
            </div>

            <div className="text-right pt-3">
              <p className="font-serif italic text-pink-600 dark:text-pink-400 text-sm">
                — Mellifluous 🌸
              </p>
            </div>
          </div>

          {/* HÒM THƯ: FORM GỬI THƯ (CÔNG KHAI & THẦM KÍN) */}
          <div
            id="confession-letter-form"
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-pink-50/90 via-rose-50/50 to-amber-50/80 dark:from-stone-800/90 dark:via-stone-800 dark:to-stone-900 border border-pink-200/90 dark:border-stone-700 shadow-sm space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
                  <MessageCircleHeart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-100">
                    Gửi thư cho Mel & Chiếc thuyền nhỏ
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                    Bạn có thể gửi thư công khai lên bảng tin hoặc gửi thư thầm kín riêng tư
                  </p>
                </div>
              </div>

              {/* Toggle: Thư công khai vs Thư thầm kín */}
              <div className="inline-flex p-1 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-pink-200 dark:border-stone-700">
                <button
                  type="button"
                  id="tab-public-letter"
                  onClick={() => setLetterType('public')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    letterType === 'public'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-pink-600'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Thư công khai</span>
                </button>
                <button
                  type="button"
                  id="tab-private-letter"
                  onClick={() => setLetterType('private')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    letterType === 'private'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-purple-500'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Thư thầm kín</span>
                </button>
              </div>
            </div>

            {/* Mode Explanation Banner */}
            {letterType === 'public' ? (
              <div className="p-3.5 rounded-2xl bg-pink-100/60 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900/50 flex items-center gap-2.5 text-xs text-pink-800 dark:text-pink-200 font-sans">
                <Globe className="w-4 h-4 text-pink-500 shrink-0" />
                <span>
                  <strong>Chế độ Thư công khai:</strong> Lá thư của bạn sẽ được ghim lên Bảng Thư Công Khai bên dưới để độc giả khác cùng đọc và chia vui cùng Mel.
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-purple-100/70 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900/50 flex items-center gap-2.5 text-xs text-purple-900 dark:text-purple-200 font-sans">
                <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
                <span>
                  <strong>Chế độ Thư thầm kín (Bảo mật 100%):</strong> Lá thư được niêm phong sáp và gửi trực tiếp vào hòm thư bí mật của Mel. Không hiển thị trên bảng tin công khai!
                </span>
              </div>
            )}

            {/* User Auth Requirement Notice */}
            {!user ? (
              <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start sm:items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-stone-800 dark:text-stone-100">
                      Yêu cầu đăng nhập để gửi Tâm Tư & Thư Thầm Kín
                    </p>
                    <p className="text-stone-600 dark:text-stone-300">
                      Mục tâm tư, tình cảm cần đăng nhập tài khoản để bảo mật và lưu giữ danh tính của bạn. (Bình luận và phản hồi truyện vẫn hoàn toàn tự do không cần tài khoản).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="confession-login-btn"
                  onClick={openAuthModal}
                  className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Đăng nhập để gửi thư</span>
                </button>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-pink-200/80 dark:border-stone-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-stone-500 dark:text-stone-400">Đang gửi thư với tư cách:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-100">
                    {user.displayName || user.email}
                  </span>
                  {roleBadge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border border-pink-200">
                      {roleBadge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hidden sm:inline">
                  ✓ Đã xác thực
                </span>
              </div>
            )}

            <form onSubmit={handleSendConfession} className="space-y-3.5">
              {/* Sender Name & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1">
                    Tên / Biệt danh của bạn:
                  </label>
                  <input
                    type="text"
                    value={guestSender}
                    onChange={(e) => setGuestSender(e.target.value)}
                    placeholder="Ví dụ: Hạ Mộc, Bạn đọc yêu hoa..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 text-xs sm:text-sm focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1">
                    Chủ đề bức thư:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          selectedTag === tag
                            ? 'bg-pink-500 text-white border-pink-500 font-medium'
                            : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-pink-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message content */}
              <div>
                <label className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1">
                  Nội dung lời nhắn gửi:
                </label>
                <textarea
                  rows={4}
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  placeholder={
                    letterType === 'public'
                      ? 'Viết đôi dòng chia sẻ cảm nhận, lời chúc hoặc tâm sự cùng mọi người...'
                      : 'Viết những tâm sự thầm kín riêng tư gửi riêng cho Mel (hoàn toàn bảo mật)...'
                  }
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 text-xs sm:text-sm focus:ring-2 focus:ring-pink-400 focus:outline-hidden font-serif"
                />
              </div>

              {/* Submit and status bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                {sentSuccessType === 'public' ? (
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Đã ghim bức thư của bạn lên Hòm thư công khai! 🌸</span>
                  </div>
                ) : sentSuccessType === 'private' ? (
                  <div className="p-3.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 text-xs font-medium flex flex-col gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="font-bold">
                        Đã niêm phong sáp và gửi vào hòm thư bí mật của Mel!
                      </span>
                    </div>
                    {createdSecretCode && (
                      <div className="space-y-2">
                        <div className="text-[11px] text-purple-800 dark:text-purple-300 font-sans leading-relaxed">
                          Mã tra cứu thư của bạn: <strong className="font-mono text-purple-900 dark:text-purple-100 bg-white dark:bg-stone-800 px-2 py-0.5 rounded-md border border-purple-300 dark:border-stone-700 shadow-2xs">{createdSecretCode}</strong>.
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(createdSecretCode);
                                setIsCopiedCode(true);
                                setTimeout(() => setIsCopiedCode(false), 2500);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-stone-700 text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-purple-50 transition-colors cursor-pointer"
                          >
                            {isCopiedCode ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>Đã sao chép!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Sao chép mã tra cứu</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLookupInputCode(createdSecretCode);
                              const elem = document.getElementById('reader-letter-lookup-box');
                              if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Xem ngay trong hộp tra cứu</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-stone-400 font-sans italic">
                    {letterType === 'public'
                      ? '*Thư công khai sẽ hiển thị ngay trên bảng tin'
                      : '*Thư thầm kín được bảo mật tuyệt đối, chỉ Mel đọc được'}
                  </span>
                )}

                <button
                  type={user ? 'submit' : 'button'}
                  id="submit-letter-btn"
                  onClick={user ? undefined : openAuthModal}
                  disabled={isSubmittingLetter}
                  className={`px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                    isSubmittingLetter ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    !user
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : letterType === 'public'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                  }`}
                >
                  {!user ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Đăng nhập để gửi thư</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isSubmittingLetter ? 'Đang gửi thư...' : letterType === 'public' ? 'Gửi thư công khai 💌' : 'Gửi thư thầm kín 🔒'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* HỘP TRA CỨU THƯ THẦM KÍN DÀNH CHO ĐỘC GIẢ */}
          <div id="reader-letter-lookup-box" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50/70 to-pink-50/70 dark:from-stone-800/80 dark:to-purple-950/30 border border-purple-200 dark:border-stone-700 space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                Tra cứu thư thầm kín của bạn
              </h4>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Nhập mã niêm phong (ví dụ: <span className="font-mono font-semibold">MEL-12345</span>) bạn đã nhận khi gửi thư riêng tư để xem phản hồi từ Mel:
            </p>
            <form onSubmit={handleLookupPrivateLetter} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={lookupInputCode}
                onChange={(e) => setLookupInputCode(e.target.value)}
                placeholder="Nhập mã niêm phong thư (MEL-...)"
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-purple-200 dark:border-stone-700 text-xs font-mono text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Tra cứu thư</span>
              </button>
            </form>

            {lookupError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-sans">{lookupError}</p>
            )}

            {lookedUpLetter && (
              <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-purple-200 dark:border-purple-800/60 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    🔒 Thư gửi bởi: {lookedUpLetter.sender}
                  </span>
                  <span className="text-stone-400 font-mono text-[11px]">{lookedUpLetter.time}</span>
                </div>
                <p className="font-serif italic text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                  "{lookedUpLetter.content}"
                </p>
                {lookedUpLetter.replyFromMel ? (
                  <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-pink-700 dark:text-pink-300">
                      <span>🌸</span>
                      <span>Hồi đáp riêng từ Mel:</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-200 pl-4">{lookedUpLetter.replyFromMel}</p>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">
                    ⏳ Mel đã nhận được thư và sẽ sớm hồi đáp cho bạn nhé!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* BẢNG THƯ TỪ ĐỘC GIẢ */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">💌</span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-100">
                  {isAuthor && authorMailboxTab === 'private'
                    ? 'Hòm Thư Thầm Kín Độc Giả (Bảo mật Tác giả)'
                    : 'Bảng Thư Công Khai Nhà Mel'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {isAuthor && (
                  <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <button
                      type="button"
                      onClick={() => setAuthorMailboxTab('public')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        authorMailboxTab === 'public'
                          ? 'bg-pink-500 text-white shadow-2xs'
                          : 'text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      Thư công khai ({letters.filter((l) => l.type === 'public').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthorMailboxTab('private')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        authorMailboxTab === 'private'
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      🔒 Thư thầm kín ({letters.filter((l) => l.type === 'private').length})
                    </button>
                  </div>
                )}
                <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                  {isAuthor && authorMailboxTab === 'private'
                    ? `${letters.filter((l) => l.type === 'private').length} bức thư bí mật`
                    : `${letters.filter((l) => l.type === 'public').length} bức thư đã gửi`}
                </span>
              </div>
            </div>

            {/* List of letters */}
            {letters.filter((l) => (isAuthor && authorMailboxTab === 'private' ? l.type === 'private' : l.type === 'public')).length === 0 ? (
              <div className="text-center py-12 bg-white/60 dark:bg-stone-800/60 rounded-2xl border border-dashed border-stone-200 dark:border-stone-700 text-stone-500 text-xs sm:text-sm">
                🌸 Chưa có bức thư nào. Hãy là người đầu tiên gửi những tâm sự ngọt ngào đến Mel nhé!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {letters
                  .filter((l) => (isAuthor && authorMailboxTab === 'private' ? l.type === 'private' : l.type === 'public'))
                  .map((letter) => (
                    <div
                      key={letter.id}
                      className="p-5 rounded-2xl bg-white dark:bg-stone-800/90 border border-pink-100 dark:border-stone-700 shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* Header of letter */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {letter.avatar.startsWith('http') ? (
                              <img
                                src={letter.avatar}
                                alt={letter.sender}
                                className="w-5 h-5 rounded-full object-cover border border-pink-200"
                              />
                            ) : (
                              <span className="text-base select-none">{letter.avatar}</span>
                            )}
                            <strong className="font-sans font-semibold text-stone-800 dark:text-stone-200">
                              {letter.sender}
                            </strong>
                            {letter.userEmail && isAuthor && (
                              <span className="text-[10px] text-stone-400 font-mono">({letter.userEmail})</span>
                            )}
                          </div>
                          <span className="text-stone-400 font-mono text-[11px]">{letter.time}</span>
                        </div>

                        {/* Tag badge & Code */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                            {letter.tag}
                          </span>
                          {letter.type === 'private' && letter.secretLookupCode && isAuthor && (
                            <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                              Mã: {letter.secretLookupCode}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <p className="font-serif text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
                          "{letter.content}"
                        </p>

                        {/* Mel / Collaborator Reply if present */}
                        {letter.replyFromMel && (
                          <div className="mt-3 p-3 rounded-xl bg-pink-50/80 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/40 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-pink-700 dark:text-pink-300">
                              <span>🌸</span>
                              <span>{letter.repliedBy ? `Hồi đáp từ ${letter.repliedBy}:` : 'Lời nhắn từ Tác giả & BQT:'}</span>
                            </div>
                            <p className="text-stone-600 dark:text-stone-300 font-sans pl-5">
                              {letter.replyFromMel}
                            </p>
                          </div>
                        )}

                        {/* Author inline reply box */}
                        {isAuthor && replyingLetterId === letter.id && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-50/80 dark:bg-stone-900 border border-amber-200 dark:border-stone-700 space-y-2 animate-in fade-in">
                            <label className="block text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                              Viết phản hồi của Tác giả:
                            </label>
                            <textarea
                              rows={3}
                              value={authorReplyText}
                              onChange={(e) => setAuthorReplyText(e.target.value)}
                              placeholder="Nhập lời cảm ơn, lời nhắn gửi ấm áp của Mel..."
                              className="w-full p-2.5 text-xs rounded-lg bg-white dark:bg-stone-800 border border-amber-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingLetterId(null);
                                  setAuthorReplyText('');
                                }}
                                className="px-3 py-1 text-xs rounded-lg text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700 cursor-pointer"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                disabled={isSubmittingReply}
                                onClick={() => handleSendAuthorReply(letter.id)}
                                className="px-3 py-1 text-xs rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-medium cursor-pointer shadow-2xs flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                <span>{isSubmittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Letter Footer */}
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-700/80 flex items-center justify-between text-xs">
                        <span className="text-stone-400 text-[11px] flex items-center gap-1">
                          {letter.type === 'public' ? (
                            <>
                              <Globe className="w-3 h-3 text-stone-400" />
                              <span>Thư công khai</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-purple-400" />
                              <span className="text-purple-600 dark:text-purple-400 font-medium">Thư thầm kín</span>
                            </>
                          )}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Author Reply Action */}
                          {isAuthor && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingLetterId(letter.id);
                                  setAuthorReplyText(letter.replyFromMel || '');
                                }}
                                className="px-2 py-1 rounded-md text-[11px] font-medium text-pink-600 hover:bg-pink-50 dark:hover:bg-stone-700 flex items-center gap-1 cursor-pointer"
                                title="Phản hồi bức thư này"
                              >
                                <Reply className="w-3 h-3" />
                                <span>{letter.replyFromMel ? 'Sửa phản hồi' : 'Phản hồi'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteLetter(letter.id)}
                                className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-stone-700 cursor-pointer"
                                title="Xóa thư"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {letter.type === 'public' && (
                            <button
                              type="button"
                              onClick={() => handleLikeLetter(letter.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-pink-50 dark:hover:bg-stone-700 text-stone-500 hover:text-pink-600 dark:text-stone-400 dark:hover:text-pink-400 transition-colors cursor-pointer"
                            >
                              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                              <span className="font-sans font-medium">{letter.likes}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MUSIC PLAYLIST */}
      {activeTab === 'music' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 dark:border-stone-700 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-sky-500" />
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-100">
                Playlist Thanh Xuân Mùa Hạ
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans text-stone-400">4 bài hát êm dịu</span>
              {isBgmPlaying && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                  Đang phát trong nền
                </span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            Tuyển tập những bài hát được Mel tuyển chọn để phát liên tục trong nền. Khi bật lên, âm nhạc sẽ đồng hành cùng bạn xuyên suốt khi đọc từng chương truyện và chuyển đổi giữa các trang mà không bị ngắt quãng.
          </p>

          {/* Persistent Background Music Banner & Volume Control */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/90 via-pink-50/70 to-amber-50/70 dark:from-stone-900 dark:via-stone-900/80 dark:to-stone-800/80 border border-sky-200/70 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => bgmEngine.togglePlay()}
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all cursor-pointer ${
                  isBgmPlaying
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white animate-pulse'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:border-pink-300'
                }`}
                title={isBgmPlaying ? 'Tạm dừng nhạc nền' : 'Bật nhạc nền'}
              >
                {isBgmPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div className="min-w-0">
                <p className="font-serif text-sm font-bold text-stone-800 dark:text-stone-100 truncate">
                  {currentBgmTrack.title}
                </p>
                <p className="text-xs text-pink-600 dark:text-pink-400 font-sans truncate">
                  {isBgmPlaying ? 'Đang phát trong nền...' : 'Bấm nút để bật nhạc nền'}
                </p>
              </div>
            </div>

            {/* Quick Volume Slider in Banner */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Volume2 className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgmVolume}
                onChange={(e) => bgmEngine.setVolume(parseFloat(e.target.value))}
                className="w-24 sm:w-32 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                title={`Âm lượng: ${Math.round(bgmVolume * 100)}%`}
              />
              <span className="text-xs font-mono text-stone-500 w-10 text-right">
                {Math.round(bgmVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Track List */}
          <div className="space-y-3">
            {TRACK_LIST.map((song, index) => {
              const isThisPlaying = isBgmPlaying && currentBgmTrack.id === song.id;
              return (
                <div
                  key={song.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                    isThisPlaying
                      ? 'bg-pink-50/80 dark:bg-pink-950/40 border-pink-300 dark:border-pink-800 shadow-2xs'
                      : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200/70 dark:border-stone-700 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-sm font-bold text-sky-500 w-6 shrink-0">
                      0{index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3
                        className={`font-serif text-sm font-semibold truncate transition-colors ${
                          isThisPlaying
                            ? 'text-pink-600 dark:text-pink-300 font-bold'
                            : 'text-stone-800 dark:text-stone-100 group-hover:text-sky-600 dark:group-hover:text-sky-400'
                        }`}
                      >
                        {song.title}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-sans truncate">
                        {song.artist} • {song.mood}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-stone-400 hidden sm:inline">
                      {song.duration}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (isThisPlaying) {
                          bgmEngine.pause();
                        } else {
                          bgmEngine.play(index);
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isThisPlaying
                          ? 'bg-pink-500 text-white border-pink-600 shadow-xs'
                          : 'bg-white dark:bg-stone-800 text-sky-600 dark:text-sky-400 border-stone-200 dark:border-stone-700 hover:bg-sky-50'
                      }`}
                    >
                      {isThisPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Đang phát</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Nghe thử ♪</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FAQ */}
      {activeTab === 'faq' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-700 pb-3">
            <Coffee className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-100">
              Câu Hỏi Thường Gặp (FAQ)
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Lịch đăng chương truyện của nhà Mel như thế nào?',
                a: 'Vì là trang phụ và Mel làm việc ngẫu hứng nên không có lịch cố định. Thường là các buổi tối thứ Bảy hoặc Chủ Nhật mỗi tuần nàng nhé!',
              },
              {
                q: 'Truyện có chuyển ver hoặc reup sang nơi khác được không?',
                a: 'Không được phép bạn nhé. Bản dịch thuộc công sức cá nhân phi lợi nhuận của Mel và tác giả gốc, nghiêm cấm mọi hành vi copy hoặc kinh doanh.',
              },
              {
                q: 'Làm sao khi không giải được mật khẩu chương?',
                a: 'Bạn xem kỹ bảng gợi ý ở tab "Password". Nếu vẫn vướng, có thể để lại bình luận ở cuối chương hoặc gửi mẩu giấy nhắn, Mel sẽ gợi ý thêm nha!',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-700 space-y-1.5"
              >
                <h3 className="font-serif text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                  <span className="text-pink-500">Q:</span>
                  <span>{item.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-sans leading-relaxed pl-5">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
