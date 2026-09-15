import React from 'react';
import { CheckCircle2, Clock, KeyRound, Sparkles, ChevronDown, ChevronUp, MailOpen, Mail } from 'lucide-react';

export type LetterTab = 'completed' | 'ongoing' | 'password' | 'other';

interface LetterNavCardsProps {
  activeLetter: LetterTab | null;
  onSelectLetter: (tab: LetterTab) => void;
  completedCount: number;
  ongoingCount: number;
}

export const LetterNavCards: React.FC<LetterNavCardsProps> = ({
  activeLetter,
  onSelectLetter,
  completedCount,
  ongoingCount,
}) => {
  const letters = [
    {
      id: 'completed' as LetterTab,
      title: 'Truyện đã hoàn thành',
      subtitle: 'Trọn vẹn tình đầu • Kết thúc viên mãn (HE)',
      desc: 'Những câu chuyện đã kết thúc trọn vẹn, yên tâm lọt hố không lo đợi chương mới.',
      count: `${completedCount} bộ truyện`,
      // Color: Soft Cherry Blossom Pink
      bgLight: 'bg-gradient-to-br from-pink-50/95 via-rose-50/85 to-pink-100/70',
      borderLight: 'border-pink-300 hover:border-pink-400',
      bgDark: 'dark:from-pink-950/40 dark:via-rose-950/30 dark:to-stone-900',
      borderDark: 'dark:border-pink-800/70 dark:hover:border-pink-600',
      tapeColor: 'bg-pink-400/90 dark:bg-pink-500/80',
      icon: <CheckCircle2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />,
      stampEmoji: '🌸',
      stampText: 'FULL',
      stampBg: 'bg-pink-200 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
      rotation: 'rotate-1',
      accentColor: 'text-pink-700 dark:text-pink-300',
      tagBadge: 'Đã hoàn (Full)',
    },
    {
      id: 'ongoing' as LetterTab,
      title: 'Truyện chưa hoàn thành',
      subtitle: 'Đang tiến hành • Đón chờ từng chương mới',
      desc: 'Cùng Mel đồng hành mỗi tuần, theo dõi từng bước chân ngọt ngào của các nhân vật.',
      count: `${ongoingCount} bộ truyện`,
      // Color: Mint / Soft Summer Leaf Green
      bgLight: 'bg-gradient-to-br from-emerald-50/95 via-teal-50/85 to-green-100/70',
      borderLight: 'border-emerald-300 hover:border-emerald-400',
      bgDark: 'dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-stone-900',
      borderDark: 'dark:border-emerald-800/70 dark:hover:border-emerald-600',
      tapeColor: 'bg-emerald-400/90 dark:bg-emerald-500/80',
      icon: <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      stampEmoji: '🍃',
      stampText: 'UPDATING',
      stampBg: 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
      rotation: '-rotate-2',
      accentColor: 'text-emerald-700 dark:text-emerald-300',
      tagBadge: 'Đang ra chương',
    },
    {
      id: 'password' as LetterTab,
      title: 'Gợi ý Password',
      subtitle: 'Mật khẩu bảo vệ • Gợi ý giải pass dễ thương',
      desc: 'Bí kíp mở khóa các chương VIP phi lợi nhuận. Hướng dẫn chi tiết và thử giải mật khẩu.',
      count: 'Quy tắc & Thử pass',
      // Color: Warm Pastel Sunbeam Yellow
      bgLight: 'bg-gradient-to-br from-amber-50/95 via-yellow-50/85 to-amber-100/70',
      borderLight: 'border-amber-300 hover:border-amber-400',
      bgDark: 'dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-stone-900',
      borderDark: 'dark:border-amber-800/70 dark:hover:border-amber-600',
      tapeColor: 'bg-amber-400/90 dark:bg-amber-500/80',
      icon: <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      stampEmoji: '💌',
      stampText: 'SECRET',
      stampBg: 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
      rotation: 'rotate-2',
      accentColor: 'text-amber-700 dark:text-amber-300',
      tagBadge: 'Khu vực mật mã',
    },
    {
      id: 'other' as LetterTab,
      title: 'Một số mục khác',
      subtitle: 'Tâm sự chiếc thuyền • Nhạc hè • Góc đọc',
      desc: 'Góc nhỏ Mel chia sẻ chuyện phiếm, hòm thư thầm kín & công khai cùng playlist thanh xuân.',
      count: 'Hòm thư & Playlist',
      // Color: Sky Blue / Summer Breeze
      bgLight: 'bg-gradient-to-br from-sky-50/95 via-blue-50/85 to-cyan-100/70',
      borderLight: 'border-sky-300 hover:border-sky-400',
      bgDark: 'dark:from-sky-950/40 dark:via-blue-950/30 dark:to-stone-900',
      borderDark: 'dark:border-sky-800/70 dark:hover:border-sky-600',
      tapeColor: 'bg-sky-400/90 dark:bg-sky-500/80',
      icon: <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
      stampEmoji: '🎐',
      stampText: 'EXTRA',
      stampBg: 'bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200',
      rotation: '-rotate-1',
      accentColor: 'text-sky-700 dark:text-sky-300',
      tagBadge: 'Tâm sự & Nhạc',
    },
  ];

  return (
    <section id="letter-navigation-section" className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-pink-600 dark:text-pink-400">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span>Thư tình mùa hạ • 4 phong thư đặc biệt</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 mt-1">
            Những phong thư gửi đến độc giả
          </h2>
        </div>

        {activeLetter && (
          <div className="inline-flex items-center gap-2 text-xs text-pink-600 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/60 px-3.5 py-1.5 rounded-full border border-pink-200 dark:border-pink-800/70 animate-in fade-in shadow-2xs">
            <MailOpen className="w-3.5 h-3.5 animate-pulse text-pink-500" />
            <span className="font-medium">Đang mở phong thư bên dưới (Chạm lại để gập)</span>
          </div>
        )}
      </div>

      {/* Grid of 4 elegant vintage letters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
        {letters.map((card) => {
          const isSelected = activeLetter === card.id;
          return (
            <button
              key={card.id}
              id={`letter-card-${card.id}`}
              type="button"
              onClick={() => onSelectLetter(card.id)}
              className={`group relative text-left p-4 sm:p-5 rounded-3xl border-2 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between
                ${card.bgLight} ${card.borderLight} ${card.bgDark} ${card.borderDark}
                ${card.rotation} hover:rotate-0 hover:-translate-y-1
                ${
                  isSelected
                    ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-stone-50 dark:ring-offset-stone-950 scale-102 rotate-0 shadow-lg font-medium border-pink-400 dark:border-pink-500'
                    : ''
                }`}
            >
              {/* Triangular Downward Indicator Arrow when letter is active */}
              {isSelected && (
                <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
                  <div className="w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-pink-500 dark:border-t-pink-400 drop-shadow-sm" />
                </div>
              )}

              {/* Decorative Washi Tape Effect at top center */}
              <div
                className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-4.5 ${card.tapeColor} opacity-90 rounded-xs shadow-xs rotate-[-1deg] border border-black/10 dark:border-white/20`}
                style={{
                  clipPath: 'polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)',
                }}
              />

              {/* Inner vintage stitched container */}
              <div className="border border-dashed border-stone-300/80 dark:border-stone-700/80 rounded-2xl p-3.5 sm:p-4 bg-white/40 dark:bg-stone-900/40 backdrop-blur-2xs flex flex-col justify-between h-full">
                {/* Envelope Header: Stamp and Icon */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-white/90 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700/80 shadow-2xs">
                      {card.icon}
                    </div>

                    {/* Stamp with serrated look */}
                    <div
                      className={`flex flex-col items-center justify-center px-2 py-0.5 rounded-sm border border-dashed border-stone-400/80 ${card.stampBg} shadow-2xs rotate-2 group-hover:rotate-4 transition-transform`}
                    >
                      <span className="text-sm select-none leading-tight">{card.stampEmoji}</span>
                      <span className="text-[7.5px] font-mono font-bold tracking-wider leading-none mt-0.5">
                        {card.stampText}
                      </span>
                    </div>
                  </div>

                  {/* Card Title & Content */}
                  <div className="space-y-1 relative z-10">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-serif text-base font-bold text-stone-800 dark:text-stone-100 group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors leading-snug">
                        {card.title}
                      </h3>
                      {isSelected ? (
                        <MailOpen className="w-4 h-4 text-pink-500 shrink-0" />
                      ) : (
                        <Mail className="w-3.5 h-3.5 text-stone-400 group-hover:text-pink-500 shrink-0 transition-colors" />
                      )}
                    </div>
                    <p className={`text-[11px] font-serif font-medium ${card.accentColor} italic line-clamp-1`}>
                      {card.subtitle}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-300 font-sans line-clamp-2 leading-relaxed pt-1">
                      {card.desc}
                    </p>
                  </div>
                </div>

                {/* Card Footer with badge and interactive toggle arrow */}
                <div className="mt-4 pt-2.5 border-t border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between text-xs">
                  <span className="font-sans text-[11px] font-medium text-stone-500 dark:text-stone-400">
                    {card.count}
                  </span>

                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 font-semibold text-[11px] border border-pink-300 dark:border-pink-800 shadow-2xs">
                      <span>Đang mở • Gập lại</span>
                      <ChevronUp className="w-3.5 h-3.5 animate-bounce" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 dark:bg-stone-800/90 text-stone-600 dark:text-stone-300 group-hover:bg-pink-50 dark:group-hover:bg-stone-700 group-hover:text-pink-600 dark:group-hover:text-pink-300 text-[11px] font-medium border border-stone-200 dark:border-stone-700 transition-all shadow-2xs">
                      <span>Mở thư</span>
                      <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

