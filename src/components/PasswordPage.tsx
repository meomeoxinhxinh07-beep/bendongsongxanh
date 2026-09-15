import React, { useState } from 'react';
import { Story } from '../types';
import { KeyRound, ShieldCheck, Heart, Sparkles, HelpCircle, Check, AlertCircle } from 'lucide-react';

interface PasswordPageProps {
  stories: Story[];
  onOpenStory: (storyId: string) => void;
}

export const PasswordPage: React.FC<PasswordPageProps> = ({ stories, onOpenStory }) => {
  const [testStoryId, setTestStoryId] = useState(stories[0]?.id || '');
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedStory = stories.find((s) => s.id === testStoryId);

  const handleTestPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStory) return;
    const cleanInput = testInput.trim().toLowerCase();
    const cleanKey = (selectedStory.passwordKey || '').trim().toLowerCase();

    if (cleanInput === cleanKey || cleanInput === 'chuyen' || cleanInput === 'hoa anh dao') {
      setTestResult({
        success: true,
        message: 'Chính xác rồi nàng ơi! 🌸 Đây đúng là mật khẩu của bộ truyện này. Chúc nàng đọc truyện vui vẻ!',
      });
    } else {
      setTestResult({
        success: false,
        message: 'Chưa chính xác rồi. Hãy đọc lại gợi ý phía dưới và kiểm tra xem có dấu cách hay chữ in hoa không nhé!',
      });
    }
  };

  return (
    <div id="password-guide-page" className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Letter Note */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50/80 to-pink-50/70 dark:from-stone-800 dark:via-stone-900 dark:to-amber-950/40 border border-amber-200 dark:border-stone-700 shadow-sm space-y-4">
        {/* Envelope tape */}
        <div className="absolute -top-3 left-10 w-24 h-6 bg-amber-300/80 dark:bg-amber-700/80 rotate-[-1deg] rounded-xs shadow-2xs border-y border-white/60" />

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100">
              Góc Hướng Dẫn & Gợi Ý Password
            </h1>
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-serif italic">
              Bức thư ngọt ngào gửi các nàng đọc truyện tại better and better
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-stone-800/80 border border-amber-100 dark:border-stone-700 space-y-3">
          <h2 className="font-serif text-base font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Tại sao nhà Mel lại cài mật khẩu?</span>
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300 font-sans">
            Truyện trong nhà được chuyển ngữ dưới sự cho phép của tác giả với mục đích phi lợi nhuận. Việc cài password nhẹ nhàng cho một số chương then chốt là để <em>bảo vệ công sức của cả tác giả lẫn dịch giả</em>, tránh bị các trang web reup tự động quét bài làm biến mất truyện.
          </p>
        </div>
      </div>

      {/* 4 Golden Rules for Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            num: '01',
            title: 'Viết thường',
            desc: 'Tất cả pass đều viết thường, không bật CapsLock (trừ khi có ghi chú đặc biệt).',
            icon: 'abc',
          },
          {
            num: '02',
            title: 'Không dấu',
            desc: 'Viết tiếng Việt không dấu (ví dụ: "hoa anh đào" -> "hoa anh dao").',
            icon: '🌸',
          },
          {
            num: '03',
            title: 'Không dấu cách',
            desc: 'Nếu câu trả lời có nhiều từ, hãy viết liền không dấu cách (vd: "muahenamay").',
            icon: '✏️',
          },
          {
            num: '04',
            title: 'Đọc kỹ văn án & C.1',
            desc: '90% câu trả lời đều nằm ngay ở tên trường học, tên món đồ kỷ niệm của 2 nhân vật chính.',
            icon: '📖',
          },
        ].map((rule) => (
          <div
            key={rule.num}
            className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs space-y-2 relative overflow-hidden"
          >
            <span className="text-2xl font-serif font-bold text-amber-500/40 block">
              {rule.num}
            </span>
            <h3 className="font-serif text-base font-bold text-stone-800 dark:text-stone-100">
              {rule.title}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
              {rule.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Table of Story Password Hints */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-700 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif text-xl font-bold text-stone-800 dark:text-stone-100">
              Bảng Gợi Ý Pass Từng Bộ Truyện
            </h2>
          </div>
          <span className="text-xs text-pink-600 dark:text-pink-400 font-serif italic">
            Cập nhật thường xuyên
          </span>
        </div>

        <div className="space-y-3">
          {stories
            .filter((s) => s.hasPassword)
            .map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm select-none">💌</span>
                    <h3 className="font-serif text-base font-bold text-stone-800 dark:text-stone-100">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-[13px] text-stone-600 dark:text-stone-300 font-serif italic">
                    Gợi ý: "{s.passwordHint}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenStory(s.id)}
                  className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-800 dark:bg-stone-700 dark:hover:bg-pink-950/60 dark:text-pink-300 text-xs font-medium transition-colors cursor-pointer shrink-0"
                >
                  Đến truyện →
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Interactive Pass Testing Simulator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-pink-50/80 to-amber-50/80 dark:from-stone-900 dark:to-stone-800 border border-pink-200 dark:border-stone-700 shadow-xs space-y-4">
        <div className="space-y-1">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <span>Hộp kiểm tra thử Password</span>
            <span className="text-base">🧪</span>
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
            Nàng có thể thử gõ câu trả lời vào đây xem đã đúng định dạng của nhà Mel chưa nhé!
          </p>
        </div>

        <form onSubmit={handleTestPass} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label htmlFor="test-story-select" className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                Chọn truyện để test:
              </label>
              <select
                id="test-story-select"
                value={testStoryId}
                onChange={(e) => {
                  setTestStoryId(e.target.value);
                  setTestResult(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 text-xs sm:text-sm"
              >
                {stories
                  .filter((s) => s.hasPassword)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
              </select>
            </div>

            <div className="sm:col-span-5">
              <label htmlFor="test-password-input" className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                Nhập câu trả lời của bạn:
              </label>
              <input
                id="test-password-input"
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Ví dụ: chuyen hoặc hoa anh dao..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 text-xs sm:text-sm focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                Kiểm tra
              </button>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 border text-xs sm:text-sm ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800'
              }`}
            >
              {testResult.success ? (
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <p className="font-serif leading-relaxed">{testResult.message}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
