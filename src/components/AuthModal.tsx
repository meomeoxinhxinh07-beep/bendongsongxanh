import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import {
  X,
  Sparkles,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Heart,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LogOut,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthor,
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    quickAuthorLogin,
    quickReaderLogin,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'google' | 'guest' | 'email_login' | 'email_register'>('google');
  const [guestNickname, setGuestNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Trình duyệt đang chặn cửa sổ đăng nhập Google. Vui lòng cho phép mở popup hoặc chuyển sang tab "Biệt hiệu Độc giả" / "Email" bên cạnh.');
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Cửa sổ đăng nhập đã được đóng lại.');
      } else if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'này';
        setErrorMsg(
          `Tên miền "${currentDomain}" chưa được thêm vào mục Authorized Domains trong Firebase Console. Quý độc giả có thể dùng tab "Biệt hiệu Độc giả" hoặc "Email & Mật khẩu" để tham gia ngay!`
        );
      } else {
        setErrorMsg('Không thể kết nối với dịch vụ Google: ' + (err.message || 'Vui lòng thử lại hoặc chọn email bên dưới'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestNickname.trim()) {
      quickReaderLogin('Bạn đọc yêu dấu');
    } else {
      quickReaderLogin(guestNickname.trim());
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === 'email_login') {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, displayName);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Email hoặc mật khẩu không chính xác.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Mật khẩu cần ít nhất 6 ký tự.');
      } else {
        setErrorMsg(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cửa sổ Đăng nhập và Đăng ký tài khoản"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-pink-200 dark:border-stone-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent Ribbon */}
        <div className="h-2 bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-pink-100 dark:border-stone-800 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-pink-100 dark:bg-pink-950/80 text-pink-600 text-sm">
                🌸
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-100">
                {user ? 'Tài khoản của bạn' : 'Đăng nhập / Đăng ký'}
              </h2>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
              better and better ━ Không gian ngôn tình của Mellifluous
            </p>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* If already logged in */}
          {user ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-pink-50/70 dark:bg-stone-800/80 border border-pink-200/80 dark:border-pink-900/40 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs shrink-0 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.displayName || user.email || 'M')[0].toUpperCase()}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-sm sm:text-base font-bold text-stone-800 dark:text-stone-100 truncate">
                      {user.displayName || 'Thành viên Mellifluous'}
                    </h3>
                    {isAuthor && (
                      <span className="px-2 py-0.5 rounded-full bg-pink-600 text-white text-[10px] font-semibold tracking-wide uppercase shadow-2xs">
                        🌸 Tác giả / Quản trị viên
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                    {user.email || 'Đăng nhập Google'}
                  </p>
                  <p className="text-[11px] text-pink-600 dark:text-pink-400 font-medium mt-0.5">
                    {user.roleTitle}
                  </p>
                </div>
              </div>

              {isAuthor ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Quyền hạn Tác giả & Quản trị viên đã kích hoạt</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Bạn có toàn quyền: Đăng tác phẩm mới, viết & cập nhật chương, trả lời bình luận và tâm tư của độc giả, kiểm duyệt nội dung và quản lý số liệu.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-pink-600 dark:text-pink-400">
                    <Heart className="w-4 h-4" />
                    <span>Tài khoản độc giả thân thiết</span>
                  </div>
                  <p className="text-[11px]">
                    Bạn có thể gửi bình luận, gửi tâm tư thư tay đến Mellifluous, đánh giá và lưu các bộ truyện yêu thích.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAuthModal}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login & Register Options */
            <div className="space-y-4">
              {/* Role Explanatory Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-50 via-rose-50/50 to-amber-50/50 dark:from-stone-800 dark:via-pink-950/20 dark:to-stone-800 border border-pink-200/80 dark:border-pink-900/40 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-pink-700 dark:text-pink-300">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span>Hệ thống tài khoản Mellifluous</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                  • <strong>Độc giả:</strong> Đăng nhập với bất kỳ tài khoản Gmail nào để gửi tâm sự, bình luận và nhận lời hồi đáp từ Mellifluous.<br />
                  • <strong>Tác giả & Cộng sự:</strong> Đăng nhập bằng Gmail được chỉ định để tự động nhận quyền Quản trị, đăng bài và trả lời độc giả.
                </p>
              </div>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('google')}
                  className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer truncate ${
                    activeTab === 'google'
                      ? 'bg-white dark:bg-stone-700 text-pink-600 dark:text-pink-300 font-semibold shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('guest')}
                  className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer truncate ${
                    activeTab === 'guest'
                      ? 'bg-white dark:bg-stone-700 text-pink-600 dark:text-pink-300 font-semibold shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  🌸 Biệt hiệu Độc giả
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('email_login')}
                  className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer truncate ${
                    activeTab === 'email_login'
                      ? 'bg-white dark:bg-stone-700 text-pink-600 dark:text-pink-300 font-semibold shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('email_register')}
                  className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer truncate ${
                    activeTab === 'email_register'
                      ? 'bg-white dark:bg-stone-700 text-pink-600 dark:text-pink-300 font-semibold shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  Đăng ký
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="leading-tight">{errorMsg}</p>
                </div>
              )}

              {/* Tab 1: Primary Google Sign-In */}
              {activeTab === 'google' && (
                <div className="space-y-4 pt-1">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleGoogleLogin}
                    className="w-full py-3 px-4 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 font-medium text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    {/* Google standard colorful G logo */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{isLoading ? 'Đang kết nối Google...' : 'Đăng nhập nhanh bằng tài khoản Gmail'}</span>
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
                    <span className="flex-shrink mx-3 text-[11px] text-stone-400 uppercase font-sans">
                      Dành cho Tác giả & Ban Quản trị
                    </span>
                    <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
                  </div>

                  {/* Automated Author & Collaborator Role Activation Note */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 flex items-start gap-2.5 text-xs text-stone-600 dark:text-stone-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-stone-800 dark:text-stone-200">
                        Cấp quyền tự động & Bảo mật danh tính
                      </p>
                      <p className="text-[11.5px] leading-relaxed text-stone-500 dark:text-stone-400">
                        Tác giả và Ban quản trị chỉ cần đăng nhập bằng tài khoản Gmail của mình. Hệ thống sẽ tự động xác thực và kích hoạt toàn quyền Tác giả & Quản trị viên mà không công khai danh sách tài khoản.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Biệt hiệu Độc giả (Instant nickname login - no password or OAuth needed) */}
              {activeTab === 'guest' && (
                <form onSubmit={handleGuestSubmit} className="space-y-4 pt-1">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-stone-800 dark:to-pink-950/20 border border-pink-200/80 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    <span className="font-semibold text-pink-700 dark:text-pink-300">🌸 Dành cho độc giả: </span>
                    Chỉ cần nhập tên gọi hoặc biệt hiệu yêu thích của bạn, không cần đăng ký mật khẩu hay mở cửa sổ pop-up. Bạn có thể bình luận, lưu truyện và gửi tâm sự ngay!
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-pink-500" />
                      <span>Biệt hiệu / Tên của bạn:</span>
                    </label>
                    <input
                      type="text"
                      value={guestNickname}
                      onChange={(e) => setGuestNickname(e.target.value)}
                      placeholder="Ví dụ: Tiểu Mộc, Độc giả tháng Năm, Bé Bắp..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Vào đọc & bình luận ngay 🌸</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* Tab 3 & 4: Email Login / Register */}
              {(activeTab === 'email_login' || activeTab === 'email_register') && (
                <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1">
                  {activeTab === 'email_register' && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-pink-500" />
                        <span>Tên hiển thị / Biệt hiệu:</span>
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Ví dụ: Tiểu Mộc Lan, Bạn đọc yêu truyện..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-pink-500" />
                      <span>Địa chỉ Email:</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tenban@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-pink-500" />
                      <span>Mật khẩu:</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium text-xs sm:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <span>
                      {isLoading
                        ? 'Đang xử lý...'
                        : activeTab === 'email_login'
                        ? 'Đăng nhập'
                        : 'Tạo tài khoản mới'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
