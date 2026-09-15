import React, { useState, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  BookOpen,
  Bookmark,
  Key,
  Heart,
  Info,
  Menu,
  X,
  Music,
  Home,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { bgmEngine, AudioTrack, TRACK_LIST } from '../utils/audioPlayer';
import { useAuth } from '../lib/authContext';

interface NavbarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSearch: () => void;
  isPetalsEnabled: boolean;
  onTogglePetals: () => void;
  onOpenAuthorModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isDarkMode,
  onToggleDarkMode,
  onOpenSearch,
  isPetalsEnabled,
  onTogglePetals,
  onOpenAuthorModal,
}) => {
  const { user, isAuthor, openAuthModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(TRACK_LIST[0]);


  useEffect(() => {
    const unsubscribe = bgmEngine.subscribe((state) => {
      setIsMusicPlaying(state.isPlaying);
      setCurrentTrack(state.track);
    });
    return unsubscribe;
  }, []);

  const handleToggleMusic = () => {
    bgmEngine.togglePlay();
  };

  interface NavItem {
    id: ActiveTab;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    badge?: string;
  }

  // 6 desktop navigation items with full, complete labels (never truncated or clipped)
  const desktopNavItems: NavItem[] = [
    {
      id: 'home',
      label: 'Trang chủ',
      shortLabel: 'Trang chủ',
      icon: <Home className="w-3.5 h-3.5 stroke-[1.75]" />,
    },
    {
      id: 'completed',
      label: 'Truyện đã hoàn',
      shortLabel: 'Truyện đã hoàn',
      icon: <BookOpen className="w-3.5 h-3.5 stroke-[1.75]" />,
    },
    {
      id: 'ongoing',
      label: 'Đang tiến hành',
      shortLabel: 'Đang tiến hành',
      icon: <Bookmark className="w-3.5 h-3.5 stroke-[1.75]" />,
    },
    {
      id: 'password',
      label: 'Gợi ý Password',
      shortLabel: 'Gợi ý Password',
      icon: <Key className="w-3.5 h-3.5 stroke-[1.75]" />,
      badge: 'VIP',
    },
    {
      id: 'other',
      label: 'Góc tâm sự & Nhạc',
      shortLabel: 'Góc tâm sự & Nhạc',
      icon: <Heart className="w-3.5 h-3.5 stroke-[1.75]" />,
    },
    {
      id: 'about',
      label: 'Về Mellifluous',
      shortLabel: 'Về Mellifluous',
      icon: <Info className="w-3.5 h-3.5 stroke-[1.75]" />,
    },
  ];

  // Mobile navigation includes the exact same clean items
  const mobileNavItems: NavItem[] = desktopNavItems;

  const handleSelect = (tab: ActiveTab) => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  const isHomeActive = currentTab === 'home';

  return (
    <header
      id="main-navbar"
      className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md transition-colors duration-300 border-b
        bg-white/95 border-pink-100/80 text-stone-800
        dark:bg-stone-900/95 dark:border-stone-800/90 dark:text-stone-100 shadow-xs"
    >
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 lg:gap-3 box-border">
        {/* =================================================================== */}
        {/* 1. BRAND LOGO (CLICK TO RETURN HOME)                                */}
        {/* =================================================================== */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            id="navbar-logo-btn"
            onClick={() => handleSelect('home')}
            className="group flex items-center gap-2 text-left focus:outline-hidden cursor-pointer p-1 -ml-1 rounded-xl transition-all duration-200 hover:bg-pink-50/70 dark:hover:bg-stone-800/60"
            title="Nhấp để về Trang chủ (better and better)"
            aria-label="Về Trang chủ blog Mellifluous"
          >
            {/* Flower Logo Icon Stamp */}
            <div className="relative shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-pink-200 via-rose-100 to-amber-100 dark:from-pink-950/60 dark:via-rose-900/40 dark:to-amber-950/40 border border-pink-300/50 dark:border-pink-500/30 shadow-2xs group-hover:scale-105 transition-all">
              <span className="text-xs sm:text-sm select-none">🌸</span>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
              </span>
            </div>

            {/* Title & Subtitle block */}
            <div className="flex flex-col justify-center min-w-0">
              <span className="font-serif text-sm sm:text-base lg:text-lg font-bold tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-amber-600 dark:from-pink-400 dark:via-rose-300 dark:to-amber-300 bg-clip-text text-transparent whitespace-nowrap leading-tight group-hover:opacity-90">
                better and better
              </span>
              <span className="hidden xs:block text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 font-sans tracking-tight whitespace-nowrap leading-tight">
                Mellifluous ━ Mùa hạ
              </span>
            </div>
          </button>
        </div>

        {/* =================================================================== */}
        {/* 2. CENTERED DESKTOP NAVIGATION (FULL LABELS, NEVER OVERLAPPING)     */}
        {/* =================================================================== */}
        <nav
          aria-label="Thanh điều hướng chính"
          className="hidden lg:flex items-center justify-center gap-1 xl:gap-1.5 flex-1 min-w-0 px-1"
        >
          {desktopNavItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`group relative px-2 lg:px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-[13px] font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-pink-100/90 text-pink-900 dark:bg-pink-950/80 dark:text-pink-200 font-semibold shadow-2xs border border-pink-200/80 dark:border-pink-800'
                    : 'text-stone-600 hover:text-pink-600 hover:bg-pink-50/70 dark:text-stone-300 dark:hover:text-pink-300 dark:hover:bg-stone-800/60'
                }`}
              >
                <span
                  className={`shrink-0 transition-colors ${
                    isActive
                      ? 'text-pink-600 dark:text-pink-400'
                      : 'text-stone-400 dark:text-stone-500 group-hover:text-pink-600 dark:group-hover:text-pink-300'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="whitespace-nowrap leading-none">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-amber-400 text-amber-950 rounded-full dark:bg-amber-500 dark:text-stone-950 shadow-2xs leading-none">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* =================================================================== */}
        {/* 3. ACTION CONTROLS (AUTHOR STUDIO, USER, UTILITY TOOLBAR)           */}
        {/* =================================================================== */}
        <div id="navbar-action-controls" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Author Studio & Publishing Reset Button - ONLY FOR AUTHOR & COLLABORATORS */}
          {isAuthor && onOpenAuthorModal && (
            <button
              type="button"
              id="navbar-author-studio-btn"
              onClick={onOpenAuthorModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-pink-100/90 hover:bg-pink-200/90 text-pink-800 dark:bg-pink-950/80 dark:text-pink-300 dark:hover:bg-pink-900/80 border border-pink-200/80 dark:border-pink-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              title="Trung tâm Quản lý bài đăng & Đưa số liệu về 0 (Chỉ dành cho Tác giả)"
            >
              <span className="select-none text-xs">🌸</span>
              <span className="whitespace-nowrap leading-none font-medium">Bàn làm việc Tác giả</span>
            </button>
          )}

          {/* User Account / Google Login Button */}
          <button
            type="button"
            id="navbar-auth-btn"
            onClick={openAuthModal}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
              user
                ? isAuthor
                  ? 'bg-rose-50 dark:bg-pink-950/80 text-rose-700 dark:text-pink-300 border-rose-200 dark:border-pink-800'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-transparent'
            }`}
            title={
              user
                ? isAuthor
                  ? 'Tài khoản Tác giả / Quản trị viên (Nhấp để quản lý)'
                  : 'Tài khoản Độc giả (Nhấp để quản lý)'
                : 'Đăng nhập Google để gửi bình luận & tâm tư'
            }
          >
            {user ? (
              <>
                <div className="w-5 h-5 rounded-full bg-pink-200 dark:bg-pink-900 text-pink-700 dark:text-pink-300 flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.displayName || user.email || 'M')[0].toUpperCase()}</span>
                  )}
                </div>
                <span className="font-serif truncate max-w-[85px] leading-none">
                  {isAuthor ? '🌸 Mel' : (user.displayName || 'Độc giả')}
                </span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5" />
                <span className="inline font-medium leading-none">Đăng nhập</span>
              </>
            )}
          </button>

          {/* Compact Reading Utilities Group (Search, Music, Petals, Theme) */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-stone-100/90 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700/80 shadow-2xs">
            {/* Search Button */}
            <button
              type="button"
              id="navbar-search-btn"
              onClick={onOpenSearch}
              className="flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg text-stone-600 hover:text-pink-600 hover:bg-white dark:bg-transparent dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-pink-300 transition-all cursor-pointer"
              title="Tìm kiếm truyện và chương (Ctrl+K / ⌘K)"
              aria-label="Tìm kiếm truyện"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Background Music Toggle Button */}
            <button
              type="button"
              id="navbar-bgm-btn"
              onClick={handleToggleMusic}
              className={`flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg transition-all cursor-pointer ${
                isMusicPlaying
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-pink-600 hover:bg-white dark:text-stone-300 dark:hover:bg-stone-700'
              }`}
              title={
                isMusicPlaying
                  ? `Đang phát nhạc: ${currentTrack.title} (Nhấp để tạm dừng)`
                  : 'Bật nhạc nền thư giãn khi đọc truyện'
              }
              aria-label={isMusicPlaying ? 'Tạm dừng nhạc nền' : 'Bật nhạc nền'}
            >
              {isMusicPlaying ? (
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-2.5 bg-white animate-bounce rounded-full" />
                  <span className="w-0.5 h-3.5 bg-white animate-bounce delay-100 rounded-full" />
                  <span className="w-0.5 h-2 bg-white animate-bounce delay-200 rounded-full" />
                </div>
              ) : (
                <Music className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Sakura Petals Toggle Button */}
            <button
              type="button"
              id="navbar-petals-toggle-btn"
              onClick={onTogglePetals}
              className={`hidden sm:flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg transition-all cursor-pointer ${
                isPetalsEnabled
                  ? 'bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 shadow-2xs'
                  : 'text-stone-400 hover:text-pink-600 hover:bg-white dark:text-stone-500 dark:hover:bg-stone-700'
              }`}
              title={
                isPetalsEnabled
                  ? 'Cánh hoa rơi: Đang BẬT (Nhấp để tắt hiệu ứng)'
                  : 'Cánh hoa rơi: Đang TẮT (Nhấp để bật cánh hoa bồng bềnh)'
              }
              aria-label={isPetalsEnabled ? 'Tắt hiệu ứng hoa rơi' : 'Bật hiệu ứng hoa rơi'}
            >
              <span
                className={`text-xs sm:text-sm leading-none transition-transform select-none ${
                  isPetalsEnabled ? 'scale-110 drop-shadow-xs' : 'grayscale opacity-50'
                }`}
              >
                🌸
              </span>
            </button>

            {/* Dark / Light Mode Switch */}
            <button
              type="button"
              id="toggle-theme-btn"
              onClick={onToggleDarkMode}
              className="flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg text-stone-600 hover:text-amber-500 hover:bg-white dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-amber-300 transition-colors cursor-pointer"
              title={
                isDarkMode
                  ? 'Chuyển sang giao diện Ban ngày rực rỡ'
                  : 'Chuyển sang giao diện Đêm hè ngắm sao'
              }
              aria-label="Đổi giao diện sáng tối"
            >
              {isDarkMode ? (
                <Sun className="w-3.5 h-3.5 text-amber-300 transition-transform duration-200" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-stone-600 transition-transform duration-200" />
              )}
            </button>
          </div>

          {/* Mobile & Tablet Hamburger Menu Button (Visible on < lg: 1024px) */}
          <button
            type="button"
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-100 text-stone-700 hover:bg-pink-100/70 hover:text-pink-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 cursor-pointer transition-colors"
            aria-label="Mở menu chuyển hướng"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            ) : (
              <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            )}
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. RESPONSIVE MOBILE & TABLET DRAWER NAVIGATION (lg:hidden)         */}
      {/* =================================================================== */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop overlay to easily dismiss when tapping outside */}
          <div
            className="fixed inset-0 top-14 sm:top-16 bg-black/40 backdrop-blur-2xs z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            id="mobile-drawer-nav"
            className="relative z-50 lg:hidden border-t border-pink-100 dark:border-stone-800 bg-white/98 dark:bg-stone-900/98 px-3.5 sm:px-6 pt-3 pb-6 space-y-3 backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold tracking-wider text-pink-600 dark:text-pink-400 uppercase">
                Điều hướng blog Mellifluous
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Đóng</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* All Navigation Links including Home */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {mobileNavItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-pink-100 text-pink-900 dark:bg-pink-950/70 dark:text-pink-200 font-semibold border border-pink-200 dark:border-pink-800 shadow-xs'
                        : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`shrink-0 ${
                          isActive
                            ? 'text-pink-600 dark:text-pink-400'
                            : 'text-stone-400 dark:text-stone-500'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-300 text-amber-950 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dedicated Media & Effects Control Cards inside Drawer */}
            <div className="pt-2.5 border-t border-stone-200/80 dark:border-stone-800 space-y-2">
              <div className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider px-1">
                Tiện ích đọc truyện
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Music Card Switch */}
                <button
                  type="button"
                  onClick={handleToggleMusic}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isMusicPlaying
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Music className="w-4 h-4 shrink-0" />
                    <div className="text-left min-w-0">
                      <div className="text-xs font-semibold truncate">
                        {isMusicPlaying ? 'Đang phát nhạc nền ♪' : 'Nhạc nền mùa hè'}
                      </div>
                      <div className="text-[10px] opacity-80 truncate">
                        {isMusicPlaying ? currentTrack.title : 'Bấm để bật giai điệu êm dịu'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/20 shrink-0">
                    {isMusicPlaying ? 'Tạm dừng' : 'Bật'}
                  </span>
                </button>

                {/* Petals Card Switch */}
                <button
                  type="button"
                  onClick={onTogglePetals}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isPetalsEnabled
                      ? 'bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-200 border border-pink-200 dark:border-pink-800 font-semibold shadow-xs'
                      : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm select-none">🌸</span>
                    <div className="text-left">
                      <div className="text-xs font-semibold">Cánh hoa anh đào rơi</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400">
                        {isPetalsEnabled ? 'Đang rơi bồng bềnh' : 'Đã tạm tắt hiệu ứng'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/80 dark:bg-stone-900/80 shadow-2xs shrink-0">
                    {isPetalsEnabled ? 'BẬT' : 'TẮT'}
                  </span>
                </button>
              </div>

              {/* Mobile Account Profile / Login Card */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs transition-all cursor-pointer ${
                    user
                      ? isAuthor
                        ? 'bg-rose-50 dark:bg-pink-950/70 text-rose-800 dark:text-pink-300 border-rose-200 dark:border-pink-800/80 font-medium'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-full bg-white/30 dark:bg-black/20 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{user ? (user.displayName || user.email || 'M')[0].toUpperCase() : '👤'}</span>
                      )}
                    </div>
                    <div className="text-left truncate">
                      <div className="font-semibold truncate">
                        {user ? (isAuthor ? '🌸 Mellifluous (Tác giả)' : (user.displayName || 'Độc giả')) : 'Đăng nhập tài khoản'}
                      </div>
                      <div className="text-[10px] opacity-80 truncate">
                        {user ? user.email : 'Đăng nhập Gmail để bình luận & gửi tâm tư'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/25 shrink-0">
                    {user ? 'Tài khoản' : 'Đăng nhập'}
                  </span>
                </button>
              </div>

              {/* Author Publishing Studio Button in Mobile Drawer - ONLY FOR AUTHORS */}
              {isAuthor && onOpenAuthorModal && (
                <button
                  type="button"
                  id="mobile-author-studio-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuthorModal();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-medium text-xs shadow-sm mt-2 cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-serif font-bold">
                    <span>🌸</span>
                    <span>Bàn làm việc Tác giả & Xuất bản</span>
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                    Quản trị
                  </span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
