import React from 'react';
import { Compass, Sparkles, Heart, Shield, BookOpen, Coffee, Feather } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div id="about-mellifluous-view" className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Intro Header */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-stone-800 border border-pink-200/80 dark:border-stone-700 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-36 h-36 rounded-full p-2 bg-gradient-to-tr from-pink-200 via-rose-100 to-amber-200 dark:from-pink-950 dark:to-stone-700 shadow-md shrink-0">
            <div className="w-full h-full rounded-full bg-white dark:bg-stone-800 flex items-center justify-center text-4xl shadow-inner select-none">
              🌸
            </div>
          </div>

          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-800 dark:text-pink-300 text-xs font-medium">
              <Sparkles className="w-3 h-3 text-pink-500" />
              <span>Chủ nhà Mellifluous</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100">
              Xin chào, tớ là Mellifluous
            </h1>
            <p className="font-serif italic text-pink-600 dark:text-pink-400 font-medium">
              ━ Một chiếc thuyền nhỏ lênh đênh ngược gió
            </p>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
              Mellifluous có nghĩa là "ngọt ngào như mật, êm dịu rót vào tai". Đây là nơi mình góp nhặt những câu chuyện tình thanh xuân vườn trường, ngọt ngào và chữa lành nhất để sẻ chia cùng những bạn đọc có cùng tình yêu với mùa hè và hoa anh đào.
            </p>
          </div>
        </div>
      </div>

      {/* Philosophy & Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-pink-50/70 dark:bg-stone-800/80 border border-pink-200 dark:border-stone-700 space-y-2">
          <div className="p-2 w-fit rounded-xl bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-bold text-stone-800 dark:text-stone-100">
            Thuần Ngọt & Thanh Xuân
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            Chỉ dịch những bộ truyện có kết thúc viên mãn (Happy Ending), nhẹ nhàng, không cẩu huyết hay ngược tâm sâu sắc.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 space-y-2">
          <div className="p-2 w-fit rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-bold text-stone-800 dark:text-stone-100">
            Phi Thương Mại 100%
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            Tất cả truyện được chuyển ngữ phi lợi nhuận. Mật khẩu được cài đặt chỉ nhằm bảo vệ chất xám và tránh tình trạng reup tràn lan.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-sky-50/70 dark:bg-stone-800/80 border border-sky-200 dark:border-stone-700 space-y-2">
          <div className="p-2 w-fit rounded-xl bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300">
            <Coffee className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-bold text-stone-800 dark:text-stone-100">
            Cảm Ơn Bạn Đọc
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            Mỗi bình luận, mỗi lượt ghé thăm và lượt thả tim của các bạn chính là nguồn động lực lớn nhất để Mel tiếp tục chèo lái chiếc thuyền nhỏ này.
          </p>
        </div>
      </div>
    </div>
  );
};
