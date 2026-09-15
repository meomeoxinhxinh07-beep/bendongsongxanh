import React, { useState } from 'react';
import { Story } from '../types';
import {
  KeyRound,
  ShieldCheck,
  Check,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Lock,
  Unlock,
} from 'lucide-react';

interface HomePasswordSectionProps {
  stories: Story[];
  onGoToPasswordPage: () => void;
  onOpenStory: (storyId: string) => void;
}

export const HomePasswordSection: React.FC<HomePasswordSectionProps> = ({
  stories,
  onGoToPasswordPage,
  onOpenStory,
}) => {
  const storiesWithPass = stories.filter((s) => s.hasPassword);
  const [selectedStoryId, setSelectedStoryId] = useState(storiesWithPass[0]?.id || '');
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedStory = stories.find((s) => s.id === selectedStoryId);

  const handleTestPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStory) return;
    const cleanInput = testInput.trim().toLowerCase();
    const cleanKey = (selectedStory.passwordKey || '').trim().toLowerCase();

    if (cleanInput === cleanKey || cleanInput === 'chuyen' || cleanInput === 'hoa anh dao') {
      setTestResult({
        success: true,
        message: '🌸 Chính xác rồi nàng ơi! Mật mã này hoàn toàn chuẩn xác. Chúc bạn đọc truyện vui vẻ!',
      });
    } else {
      setTestResult({
        success: false,
        message: 'Chưa chính xác rồi. Hãy đọc lại gợi ý phía dưới và nhớ viết thường không dấu nhé!',
      });
    }
  };

  return (
    <section
      id="home-password-section"
      className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50/90 via-yellow-50/70 to-pink-50/60 dark:from-stone-900 dark:via-amber-950/20 dark:to-stone-900 border border-amber-200/80 dark:border-amber-900/60 shadow-xs space-y-6 relative overflow-hidden"
    >
      {/* Decorative Washi Tape */}
      <div
        className="absolute -top-3 left-8 w-28 h-5.5 bg-amber-400/80 dark:bg-amber-600/80 rotate-[-1deg] rounded-xs shadow-2xs border border-black/10 dark:border-white/20"
        style={{ clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)' }}
      />

      {/* Header with Title & Action to Dedicated Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-400">
              <span>Bí kíp giải mã • Bảo vệ bản quyền phi thương mại</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-100">
              Gợi Ý Password & Thử Mật Khẩu
            </h2>
          </div>
        </div>

        {/* Button to go to dedicated Password Page */}
        <button
          type="button"
          id="btn-goto-dedicated-password-page"
          onClick={onGoToPasswordPage}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <span>Xem trang Password đầy đủ</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 4 Golden Rules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { title: 'Viết thường', desc: 'Không CapsLock, chỉ chữ thường.' },
          { title: 'Không dấu', desc: 'Tiếng Việt không dấu liền nhau.' },
          { title: 'Không cách', desc: 'Không khoảng trắng thừa đầu cuối.' },
          { title: 'Từ truyện', desc: 'Gợi ý nằm ngay ở các chương trước.' },
        ].map((rule, idx) => (
          <div
            key={rule.title}
            className="p-3.5 rounded-2xl bg-white/80 dark:bg-stone-800/80 border border-amber-100 dark:border-stone-700/80 shadow-2xs"
          >
            <div className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
              0{idx + 1}
            </div>
            <div className="font-serif text-xs font-bold text-stone-800 dark:text-stone-100 mt-0.5">
              {rule.title}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
              {rule.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Test Pass Box & Stories Pass Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick Pass Tester */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-800/90 border border-amber-200/70 dark:border-stone-700 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Thử mở khóa mật khẩu tại đây:</span>
          </div>

          <form onSubmit={handleTestPass} className="space-y-3">
            <div>
              <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                Chọn tác phẩm cần thử:
              </label>
              <select
                value={selectedStoryId}
                onChange={(e) => {
                  setSelectedStoryId(e.target.value);
                  setTestResult(null);
                }}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-amber-400 cursor-pointer"
              >
                {storiesWithPass.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedStory?.passwordHint && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-stone-900/80 border border-amber-200/60 dark:border-stone-700 text-[11px] text-amber-900 dark:text-amber-300">
                <strong>Gợi ý:</strong> {selectedStory.passwordHint}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Nhập thử đáp án mật khẩu..."
                className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium cursor-pointer transition-colors shadow-2xs"
              >
                Kiểm tra
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {testResult.success ? (
                  <Unlock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </form>
        </div>

        {/* Right: Quick List of Stories with Password */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="text-xs font-semibold text-stone-600 dark:text-stone-400 flex items-center justify-between">
            <span>Danh sách truyện có chương khóa:</span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400">
              {storiesWithPass.length} truyện
            </span>
          </div>

          <div className="space-y-2">
            {storiesWithPass.map((story) => (
              <div
                key={story.id}
                className="p-3 rounded-2xl bg-white/80 dark:bg-stone-800/80 border border-amber-100 dark:border-stone-700 flex items-center justify-between gap-3 hover:border-amber-300 transition-colors"
              >
                <div className="min-w-0">
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100 truncate">
                    {story.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                    {story.passwordHint || 'Gợi ý ở chương trước đó'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenStory(story.id)}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-amber-900 dark:text-amber-200 text-xs font-medium cursor-pointer shrink-0 transition-colors"
                >
                  Xem truyện
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
