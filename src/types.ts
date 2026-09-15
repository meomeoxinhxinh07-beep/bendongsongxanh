export interface Story {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  translator: string;
  status: 'completed' | 'ongoing';
  genre: string[];
  summary: string;
  totalChapters: number;
  completedChapters: number;
  mainChaptersCount?: number;
  extraChaptersCount?: number;
  coverImage: string;
  colorTheme: string;
  hasPassword: boolean;
  passwordHint?: string;
  passwordKey?: string;
  updatedAt: string;
  views: number;
  likes: number;
  featured?: boolean;
}

export interface Chapter {
  id: string;
  storyId: string;
  chapterNumber: number;
  title: string;
  publishedAt: string;
  isLocked: boolean;
  content: string;
  translatorNote?: string;
  wordCount: number;
  isExtra?: boolean; // true nếu là phiên ngoại / ngoại truyện
  partType?: 'main' | 'extra'; // 'main': chính truyện, 'extra': phiên ngoại
  extraNumber?: number; // Thứ tự phiên ngoại (1, 2, 3...)
}

export interface Announcement {
  id: string;
  title: string;
  tag: 'Thông báo' | 'Lịch đăng' | 'Nhắc nhở' | 'Lưu ý';
  content: string;
  date: string;
  isPinned?: boolean;
}

export interface RecentUpdate {
  id: string;
  storyId: string;
  storyTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  timeAgo: string;
  isLocked: boolean;
  status: 'completed' | 'ongoing';
}

export type ActiveTab = 'home' | 'completed' | 'ongoing' | 'password' | 'other' | 'about';

export interface CommentReply {
  id: string;
  user: string;
  avatar: string;
  text: string;
  createdAt: string;
  isAuthor?: boolean;
  userEmail?: string;
}

export interface RealtimeComment {
  id: string;
  storyId: string;
  chapterId?: string;
  chapterNumber?: number;
  user: string;
  userEmail?: string;
  userId?: string;
  isAuthor?: boolean;
  avatar: string;
  text: string;
  createdAt: string;
  rating?: number;
  replies?: CommentReply[];
}

export interface ReaderLetter {
  id: string;
  sender: string;
  senderEmail?: string;
  senderUid?: string;
  avatar: string;
  content: string;
  type: 'public' | 'private';
  tag: string;
  time?: string;
  createdAt: string;
  likes: number;
  replyFromMel?: string;
  repliedAt?: string;
  repliedBy?: string;
  secretLookupCode?: string;
}

export interface StoryRealtimeStats {
  views: number;
  likes: number;
  followers: number;
  ratingSum: number;
  ratingCount: number;
  commentCount: number;
}

export interface GlobalRealtimeStats {
  totalVisits: number;
  activeReaders: number;
  totalFollowers: number;
  totalComments: number;
  totalLikes: number;
}

