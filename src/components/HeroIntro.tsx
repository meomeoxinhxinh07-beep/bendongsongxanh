

import React from 'react';
import {
  Heart,
  Compass,
  Sparkles,
  Feather,
  ShieldAlert,
} from 'lucide-react';

interface HeroIntroProps {
  onExploreClick: () => void;
  onPasswordHelpClick: () => void;
  onAuthorStudioClick?: () => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({
  onExploreClick,
  onPasswordHelpClick,
  onAuthorStudioClick,
}) => {
  return (
    <section
      id="hero-intro-section"
      className="relative overflow-hidden rounded-3xl border border-pink-200/80 dark:border-pink-900/40 bg-gradient-to-br from-pink-50/80 via-white/70 to-amber-50/80 dark:from-stone-900/90 dark:via-stone-900/70 dark:to-stone-800/80 shadow-sm backdrop-blur-xs p-6 sm:p-8 md:p-10 mb-8 transition-all duration-300"
    >
      {/* Decorative dreamy background glows */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-gradient-to-br from-pink-300/25 to-amber-300/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-gradient-to-tr from-sky-300/20 to-emerald-300/15 blur-3xl pointer-events-none" />

      {/* Decorative vintage postage stamp in the corner */}
      <div className="hidden sm:block absolute top-6 right-6 select-none opacity-85 rotate-3 hover:rotate-0 transition-transform duration-300 pointer-events-none">
        <div className="w-16 h-20 p-1.5 bg-amber-50 dark:bg-stone-800 border-2 border-dashed border-pink-300 dark:border-pink-700/60 rounded-sm shadow-xs flex flex-col items-center justify-between text-center">
          <span className="text-[9px] font-mono tracking-widest text-pink-500 font-bold">VN POST</span>
          <span className="text-xl">🌸</span>
          <span className="text-[8px] font-mono text-stone-500">2026 • 25¢</span>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl space-y-5">
        {/* Blog Banner Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/90 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800/80 text-pink-800 dark:text-pink-300 text-xs font-sans font-medium shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
          <span>Mùa hè • Thanh xuân • Ngôn tình thuần ngọt</span>
        </div>

        {/* Main Title of Blog: "better and better" */}
        <div className="space-y-1">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-800 dark:text-stone-100 leading-tight">
            better and better
          </h1>
          <p className="text-xs sm:text-sm text-pink-600 dark:text-pink-400 font-sans tracking-widest uppercase">
            Mỗi ngày đều là một chương mới tốt đẹp hơn
          </p>
        </div>

        {/* Greeting Box formatted as requested by client */}
        <div className="p-5 sm:p-7 rounded-2xl bg-white/75 dark:bg-stone-800/70 border border-pink-100 dark:border-stone-700/80 shadow-xs space-y-3.5">
          {/* Title: Xin chào, tớ là Mellifluous */}
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
              <span>Xin chào, tớ là Mellifluous</span>
              <span className="text-pink-500">🌷</span>
            </h2>

            {/* Subtitle: ━ Một chiếc thuyền nhỏ lênh đênh ngược gió */}
            <p className="font-serif text-sm sm:text-base font-medium text-pink-700 dark:text-pink-300 italic flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-pink-500 shrink-0 inline" />
              <span>━ Một chiếc thuyền nhỏ lênh đênh ngược gió</span>
            </p>
          </div>

          {/* Introduction paragraph */}
          <p className="text-sm sm:text-[15px] leading-relaxed text-stone-700 dark:text-stone-300 font-sans">
            Đây là trang phụ của tớ, đăng linh ta linh tinh. Đăng truyện song song với trang chính, cập nhật muộn và không thường xuyên, phòng ngừa trang chính bị khóa.
          </p>

          {/* Note in italics with special border decoration */}
          <div className="pt-2 border-t border-pink-100/80 dark:border-stone-700/60">
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-rose-800 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="italic font-serif leading-relaxed">
                Truyện trong nhà được chuyển ngữ dưới sự cho phép của tác giả với mục đích phi lợi nhuận, sẽ có mật khẩu để đảm bảo công sức của tác giả lẫn dịch giả.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive CTA buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            id="hero-explore-btn"
            onClick={onExploreClick}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-medium text-sm shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Feather className="w-4 h-4" />
            <span>Khám phá các bộ truyện</span>
          </button>

          <button
            type="button"
            id="hero-password-guide-btn"
            onClick={onPasswordHelpClick}
            className="px-4 py-2.5 rounded-xl bg-white/90 dark:bg-stone-800 hover:bg-pink-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Heart className="w-4 h-4 text-pink-500" />
            <span>Xem hướng dẫn giải pass</span>
          </button>

          {onAuthorStudioClick && (
            <button
              type="button"
              id="hero-author-studio-btn"
              onClick={onAuthorStudioClick}
              className="px-4 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100/80 dark:bg-pink-950/60 dark:hover:bg-pink-900/60 text-pink-700 dark:text-pink-300 border border-pink-200/80 dark:border-pink-800/80 font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
              title="Mở bảng điều khiển xuất bản & đưa các chỉ số về 0"
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>Xuất bản & Đặt số liệu về 0</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
