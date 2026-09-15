import React, { useState, useEffect } from 'react';
import { Heart, Users, Eye, Sparkles, Activity, MessageSquare, BookmarkCheck } from 'lucide-react';
import {
  subscribeToGlobalStats,
  startActiveReaderHeartbeat,
  recordSiteVisit,
} from '../lib/realtimeService';
import { GlobalRealtimeStats } from '../types';

export const Footer: React.FC = () => {
  // Visitor counter state with real cloud Firestore synchronization
  const [stats, setStats] = useState<GlobalRealtimeStats>({
    totalVisits: 0,
    activeReaders: 1,
    totalFollowers: 0,
    totalComments: 0,
    totalLikes: 0,
  });
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);

  useEffect(() => {
    // 1. Record this visit to Firestore
    recordSiteVisit();

    // 2. Start realtime reader presence heartbeat across all connected devices/browsers
    const unsubscribeHeartbeat = startActiveReaderHeartbeat((liveCount) => {
      setStats((prev) => ({ ...prev, activeReaders: liveCount }));
    });

    // 3. Listen to live global stats changes from Firestore
    const unsubscribeStats = subscribeToGlobalStats((cloudStats) => {
      setStats((prev) => ({
        ...cloudStats,
        activeReaders: prev.activeReaders || cloudStats.activeReaders,
      }));
      setIsLiveConnected(true);
    });

    return () => {
      unsubscribeHeartbeat();
      unsubscribeStats();
    };
  }, []);

  return (
    <footer
      id="main-footer"
      className="mt-20 border-t border-pink-200/80 dark:border-stone-800 bg-gradient-to-b from-white/90 via-pink-50/50 to-amber-50/60 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 text-stone-700 dark:text-stone-300 relative overflow-hidden transition-colors duration-300"
    >
      {/* Decorative cherry petal background accents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between border-b border-pink-100 dark:border-stone-800 pb-8">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl select-none">🌸</span>
              <span className="font-serif text-2xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-amber-600 dark:from-pink-400 dark:via-rose-300 dark:to-amber-300 bg-clip-text text-transparent">
                better and better
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Realtime
              </span>
            </div>

            <p className="font-serif text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md leading-relaxed italic">
              "Một chiếc thuyền nhỏ lênh đênh ngược gió, chở theo những trang truyện thanh xuân và những mùa hè ngọt ngào không bao giờ kết thúc."
            </p>
          </div>

          {/* Social Links (Facebook / WordPress / Wattpad) */}
          <div className="md:col-span-6 flex flex-col md:items-end space-y-3">
            <span className="text-xs font-semibold tracking-wider text-pink-600 dark:text-pink-400 uppercase font-sans">
              Kết nối cùng Mellifluous
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                id="footer-social-facebook"
                className="group flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-xs transition-all cursor-pointer"
                title="Facebook của Mel"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-xs font-medium font-sans">Facebook</span>
              </a>

              <a
                href="https://wordpress.com"
                target="_blank"
                rel="noreferrer"
                id="footer-social-wordpress"
                className="group flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 hover:shadow-xs transition-all cursor-pointer"
                title="Trang chính WordPress của Mel"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.158 12.786l-2.698 7.84c.806.236 1.657.365 2.54.365 1.047 0 2.05-.181 2.986-.508l-2.828-7.697zm-6.68 1.488c0 1.258.455 2.41 1.218 3.31L3.43 8.358c-.607 1.144-.952 2.45-.952 3.837 0 .736.098 1.448.279 2.126l3.72 1.953zm15.094-1.953c0-.987-.354-1.67-.658-2.202-.405-.658-.785-1.215-.785-1.873 0-.734.557-1.417 1.342-1.417.062 0 .12.008.18.014A9.92 9.92 0 0 0 12 2C6.477 2 2 6.477 2 12c0 2.106.653 4.06 1.768 5.673l5.01-13.73c.33-.861.633-1.165 1.215-1.165h.05c.583 0 .886.304 1.216 1.165l3.882 10.638 1.39-4.248c.152-.48.228-.962.228-1.447z" />
                </svg>
                <span className="text-xs font-medium font-sans">WordPress</span>
              </a>

              <a
                href="https://wattpad.com"
                target="_blank"
                rel="noreferrer"
                id="footer-social-wattpad"
                className="group flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 hover:shadow-xs transition-all cursor-pointer"
                title="Wattpad của Mel"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M5.4 3h3.6l3.6 13.2L16.2 3h3.6l-5.4 18h-3.6L5.4 3z" />
                </svg>
                <span className="text-xs font-medium font-sans">Wattpad</span>
              </a>
            </div>
          </div>
        </div>

        {/* Realtime Live Visitor Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-stone-800/70 border border-pink-100 dark:border-stone-800 shadow-2xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-sans">
                Lượt ghé thăm
              </span>
              <strong className="font-mono text-sm sm:text-base font-bold text-stone-800 dark:text-stone-100">
                {stats.totalVisits.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-stone-800/70 border border-pink-100 dark:border-stone-800 shadow-2xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-sans">
                Đang trực tuyến
              </span>
              <strong className="font-mono text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                {stats.activeReaders} người
              </strong>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-stone-800/70 border border-pink-100 dark:border-stone-800 shadow-2xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-sans">
                Lượt yêu thích
              </span>
              <strong className="font-mono text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400">
                {stats.totalLikes.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-stone-800/70 border border-pink-100 dark:border-stone-800 shadow-2xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-sans">
                Bình luận độc giả
              </span>
              <strong className="font-mono text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400">
                {stats.totalComments.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Realtime Status Indicator & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs pt-4 border-t border-pink-100/60 dark:border-stone-800">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Cơ sở dữ liệu đám mây kết nối thời gian thực qua Firestore Cloud</span>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p className="font-serif text-stone-600 dark:text-stone-400">
              © 2026 <strong className="text-pink-600 dark:text-pink-400">better and better</strong> 🌸 Mellifluous. All rights reserved.
            </p>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-sans">
              Bản dịch phi thương mại • Số liệu được ghi nhận tự động trên mọi thiết bị và trình duyệt
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
