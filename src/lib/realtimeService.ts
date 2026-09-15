import {
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  increment,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  arrayUnion,
} from './firebase';
import { GlobalRealtimeStats, StoryRealtimeStats, RealtimeComment, Story, Chapter, Announcement, ReaderLetter, CommentReply } from '../types';
export type { ReaderLetter, RealtimeComment, CommentReply, GlobalRealtimeStats, StoryRealtimeStats };
import {
  STORIES,
  SAMPLE_CHAPTERS,
  ANNOUNCEMENTS,
  saveCustomChapterToStorage,
  deleteCustomChapterFromStorage,
  getStoredCustomChapters,
  getStoryChapters,
} from '../data/mockData';

// Active memory listeners for instant UI synchronization
const activeStorySubscribers = new Set<(stories: Story[]) => void>();
const activeAnnouncementSubscribers = new Set<(announcements: Announcement[]) => void>();
const activeChapterSubscribers = new Map<string, Set<(chapters: Chapter[]) => void>>();

const notifyStorySubscribers = (stories: Story[]) => {
  activeStorySubscribers.forEach((cb) => {
    try {
      cb(stories);
    } catch (e) {
      console.warn('Story subscriber callback error:', e);
    }
  });
};

const notifyAnnouncementSubscribers = (announcements: Announcement[]) => {
  activeAnnouncementSubscribers.forEach((cb) => {
    try {
      cb(announcements);
    } catch (e) {
      console.warn('Announcement subscriber callback error:', e);
    }
  });
};

const notifyChapterSubscribers = (storyId: string, chapters: Chapter[]) => {
  const set = activeChapterSubscribers.get(storyId);
  if (set) {
    set.forEach((cb) => {
      try {
        cb(chapters);
      } catch (e) {
        console.warn('Chapter subscriber callback error:', e);
      }
    });
  }
};

// Constants
const STATS_DOC_ID = 'aggregate_stats';
const ACTIVE_PRESENCE_COLLECTION = 'reader_presences';
const CONFIG_DOC_ID = 'main_config';

// Client session unique ID to avoid counting duplicate visits in the same session
const getSessionVisitorId = (): string => {
  try {
    let vid = sessionStorage.getItem('mel_visitor_id');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
      sessionStorage.setItem('mel_visitor_id', vid);
    }
    return vid;
  } catch {
    return 'v_' + Math.random().toString(36).substring(2, 12);
  }
};

/**
 * Kiểm tra xem người dùng có đang truy cập qua đường liên kết chính thức (public URL / shared link / custom domain)
 * hay trong môi trường sandbox nội bộ (localhost / ais-dev-).
 * Đảm bảo các con số, số liệu thống kê chỉ được bắt đầu tính kể từ khi trang web chính thức được ra mắt, public và được tạo đường liên kết.
 */
export const isPublicOfficialSite = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  const isDevHost =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('ais-dev-') ||
    host.includes('.internal');
  return !isDevHost;
};

/**
 * Record a real visit across any device and browser.
 * Only begins counting visits when accessed via the official public link / domain.
 * Starts from 1 (the first real public visitor) instead of arbitrary numbers.
 * Only increments totalVisits once per browser session.
 */
export const recordSiteVisit = async (): Promise<void> => {
  try {
    // Chỉ ghi nhận lượt truy cập khi website đã chính thức ra mắt / public
    if (!isPublicOfficialSite()) {
      return;
    }

    const sessionKey = 'mel_visited_recorded';
    const alreadyRecorded = sessionStorage.getItem(sessionKey);
    const statsDocRef = doc(db, 'site_stats', STATS_DOC_ID);

    if (!alreadyRecorded) {
      sessionStorage.setItem(sessionKey, 'true');

      const docSnap = await getDoc(statsDocRef);
      if (!docSnap.exists()) {
        await setDoc(statsDocRef, {
          totalVisits: 1, // First real visitor on public launch
          totalFollowers: 0,
          totalComments: 0,
          totalLikes: 0,
          lastVisitAt: new Date().toISOString(),
        });
      } else {
        await updateDoc(statsDocRef, {
          totalVisits: increment(1),
          lastVisitAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn('Realtime visit tracking error:', err);
  }
};

/**
 * Realtime Presence Heartbeat: Keeps track of actual active readers online right now.
 * Writes a timestamp to reader_presences and cleans up dead sessions.
 */
export const startActiveReaderHeartbeat = (onCountChange: (count: number) => void): (() => void) => {
  const visitorId = getSessionVisitorId();
  const presenceDocRef = doc(db, ACTIVE_PRESENCE_COLLECTION, visitorId);

  // Send initial heartbeat
  const beat = async () => {
    try {
      await setDoc(presenceDocRef, {
        visitorId,
        lastActive: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) : 'web',
      });
    } catch {
      // Ignore transient network errors
    }
  };

  beat();
  const beatInterval = setInterval(beat, 25000); // Pulse every 25s

  // Listen to active readers within the last 70 seconds
  const presencesQuery = query(collection(db, ACTIVE_PRESENCE_COLLECTION));
  const unsubscribeListener = onSnapshot(
    presencesQuery,
    (snapshot) => {
      const threshold = Date.now() - 75000;
      let liveCount = 0;
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.lastActive && data.lastActive >= threshold) {
          liveCount++;
        }
      });
      // Return genuine active readers count (at least 1 for the current session)
      onCountChange(Math.max(1, liveCount));
    },
    (err) => {
      console.warn('Heartbeat listener warning:', err);
      onCountChange(1);
    }
  );

  return () => {
    clearInterval(beatInterval);
    unsubscribeListener();
  };
};

/**
 * Subscribe to global site statistics in real time.
 * Defaults strictly to 0 if database is fresh.
 */
export const subscribeToGlobalStats = (
  callback: (stats: GlobalRealtimeStats) => void
): (() => void) => {
  const statsDocRef = doc(db, 'site_stats', STATS_DOC_ID);
  return onSnapshot(
    statsDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          totalVisits: data.totalVisits ?? 0,
          activeReaders: data.activeReaders ?? 1,
          totalFollowers: data.totalFollowers ?? 0,
          totalComments: data.totalComments ?? 0,
          totalLikes: data.totalLikes ?? 0,
        });
      } else {
        callback({
          totalVisits: 0,
          activeReaders: 1,
          totalFollowers: 0,
          totalComments: 0,
          totalLikes: 0,
        });
      }
    },
    (error) => {
      console.warn('Global stats snapshot warning:', error);
      callback({
        totalVisits: 0,
        activeReaders: 1,
        totalFollowers: 0,
        totalComments: 0,
        totalLikes: 0,
      });
    }
  );
};

/**
 * Subscribe to realtime stats for a specific story (views, likes, followers, ratings).
 * Baseline is strictly 0.
 */
export const subscribeToStoryStats = (
  storyId: string,
  initialViews: number = 0,
  initialLikes: number = 0,
  callback: (stats: StoryRealtimeStats) => void
): (() => void) => {
  const storyDocRef = doc(db, 'story_stats', storyId);

  return onSnapshot(
    storyDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          views: data.views !== undefined ? Number(data.views) : (initialViews || 0),
          likes: data.likes !== undefined ? Number(data.likes) : (initialLikes || 0),
          followers: data.followers ?? 0,
          ratingSum: data.ratingSum ?? 0,
          ratingCount: data.ratingCount ?? 0,
          commentCount: data.commentCount ?? 0,
        });
      } else {
        callback({
          views: initialViews || 0,
          likes: initialLikes || 0,
          followers: 0,
          ratingSum: 0,
          ratingCount: 0,
          commentCount: 0,
        });
      }
    },
    (err) => {
      console.warn(`Story stats snapshot warning for ${storyId}:`, err);
      callback({
        views: initialViews || 0,
        likes: initialLikes || 0,
        followers: 0,
        ratingSum: 0,
        ratingCount: 0,
        commentCount: 0,
      });
    }
  );
};

/**
 * Increment story views when a reader views the story details or chapters.
 * Only records views on the official public link / domain.
 */
export const recordStoryView = async (storyId: string): Promise<void> => {
  try {
    // Chỉ tăng lượt xem khi độc giả đọc truyện trên trang web chính thức / public link
    if (!isPublicOfficialSite()) {
      return;
    }

    const sessionKey = `mel_viewed_story_${storyId}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, 'true');

    const storyDocRef = doc(db, 'story_stats', storyId);
    const snap = await getDoc(storyDocRef);

    if (!snap.exists()) {
      await setDoc(storyDocRef, {
        storyId,
        views: 1,
        likes: 0,
        followers: 0,
        ratingSum: 0,
        ratingCount: 0,
        commentCount: 0,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(storyDocRef, {
        views: increment(1),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Record story view error:', err);
  }
};

/**
 * Like or unlike a story in real time.
 */
export const toggleStoryLike = async (storyId: string, isLiking: boolean): Promise<void> => {
  try {
    const storyDocRef = doc(db, 'story_stats', storyId);
    const snap = await getDoc(storyDocRef);
    const delta = isLiking ? 1 : -1;

    if (!snap.exists()) {
      await setDoc(storyDocRef, {
        storyId,
        views: 1,
        likes: Math.max(0, delta),
        followers: 0,
        ratingSum: 0,
        ratingCount: 0,
        commentCount: 0,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(storyDocRef, {
        likes: increment(delta),
        updatedAt: new Date().toISOString(),
      });
    }

    // Update global likes
    const globalDocRef = doc(db, 'site_stats', STATS_DOC_ID);
    await updateDoc(globalDocRef, {
      totalLikes: increment(delta),
    }).catch(() => {});
  } catch (err) {
    console.warn('Toggle story like error:', err);
  }
};

/**
 * Follow or unfollow a story in real time.
 */
export const toggleStoryFollow = async (storyId: string, isFollowing: boolean): Promise<void> => {
  try {
    const storyDocRef = doc(db, 'story_stats', storyId);
    const snap = await getDoc(storyDocRef);
    const delta = isFollowing ? 1 : -1;

    if (!snap.exists()) {
      await setDoc(storyDocRef, {
        storyId,
        views: 1,
        likes: 0,
        followers: Math.max(0, delta),
        ratingSum: 0,
        ratingCount: 0,
        commentCount: 0,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(storyDocRef, {
        followers: increment(delta),
        updatedAt: new Date().toISOString(),
      });
    }

    // Update global followers count
    const globalDocRef = doc(db, 'site_stats', STATS_DOC_ID);
    await updateDoc(globalDocRef, {
      totalFollowers: increment(delta),
    }).catch(() => {});
  } catch (err) {
    console.warn('Toggle story follow error:', err);
  }
};

/**
 * Submit a real reader rating (1-5 stars) for a story.
 */
export const submitStoryRating = async (storyId: string, stars: number): Promise<void> => {
  try {
    const storyDocRef = doc(db, 'story_stats', storyId);
    const snap = await getDoc(storyDocRef);

    if (!snap.exists()) {
      await setDoc(storyDocRef, {
        storyId,
        views: 1,
        likes: 0,
        followers: 0,
        ratingSum: stars,
        ratingCount: 1,
        commentCount: 0,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(storyDocRef, {
        ratingSum: increment(stars),
        ratingCount: increment(1),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Submit story rating error:', err);
  }
};

/**
 * Subscribe to realtime comments for a story or specific chapter.
 */
export const subscribeToComments = (
  storyId: string,
  chapterNumber: number | null,
  callback: (comments: RealtimeComment[]) => void
): (() => void) => {
  const commentsColl = collection(db, 'comments');
  const q = query(
    commentsColl,
    where('storyId', '==', storyId),
    orderBy('createdAt', 'desc'),
    limit(60)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: RealtimeComment[] = [];
      snapshot.forEach((d) => {
        const item = d.data();
        list.push({
          id: d.id,
          storyId: item.storyId,
          chapterId: item.chapterId,
          chapterNumber: item.chapterNumber,
          user: item.user || 'Độc giả yêu truyện',
          userEmail: item.userEmail,
          userId: item.userId,
          isAuthor: Boolean(item.isAuthor),
          isCollaborator: Boolean(item.isCollaborator),
          roleBadge: item.roleBadge || (item.isAuthor ? 'Tác giả' : item.isCollaborator ? 'Cộng sự' : undefined),
          avatar: item.avatar || '🌸',
          text: item.text,
          createdAt: item.createdAt || new Date().toISOString(),
          rating: item.rating,
          replies: (item.replies || []).map((r: any) => ({
            ...r,
            isAuthor: Boolean(r.isAuthor),
            isCollaborator: Boolean(r.isCollaborator),
            roleBadge: r.roleBadge || (r.isAuthor ? 'Tác giả' : r.isCollaborator ? 'Cộng sự' : undefined),
          })),
        });
      });

      if (chapterNumber !== null && chapterNumber !== undefined) {
        const chapterList = list.filter(
          (c) => c.chapterNumber === chapterNumber || !c.chapterNumber
        );
        callback(chapterList);
      } else {
        callback(list);
      }
    },
    (err) => {
      console.warn(`Comments snapshot error for ${storyId}:`, err);
      callback([]);
    }
  );
};

/**
 * Add a new real comment from any device/reader.
 */
export const postRealtimeComment = async (comment: {
  storyId: string;
  chapterNumber?: number;
  chapterId?: string;
  user: string;
  userEmail?: string | null;
  userId?: string | null;
  isAuthor?: boolean;
  isCollaborator?: boolean;
  roleBadge?: string;
  avatar?: string;
  text: string;
  rating?: number | null;
}): Promise<void> => {
  try {
    const commentsColl = collection(db, 'comments');
    await addDoc(commentsColl, {
      storyId: comment.storyId,
      chapterNumber: comment.chapterNumber || null,
      chapterId: comment.chapterId || null,
      user: comment.user.trim() || 'Bạn đọc yêu truyện',
      userEmail: comment.userEmail || null,
      userId: comment.userId || null,
      isAuthor: Boolean(comment.isAuthor),
      isCollaborator: Boolean(comment.isCollaborator),
      roleBadge: comment.roleBadge || (comment.isAuthor ? 'Tác giả' : comment.isCollaborator ? 'Cộng sự' : null),
      avatar: comment.avatar || (comment.isAuthor ? '🌸' : comment.isCollaborator ? '🌿' : '🌸'),
      text: comment.text.trim(),
      rating: comment.rating || null,
      replies: [],
      createdAt: new Date().toISOString(),
    });

    // Increment comment count on story_stats
    const storyDocRef = doc(db, 'story_stats', comment.storyId);
    await updateDoc(storyDocRef, {
      commentCount: increment(1),
    }).catch(async () => {
      await setDoc(storyDocRef, {
        storyId: comment.storyId,
        views: 1,
        likes: 0,
        followers: 0,
        commentCount: 1,
        ratingSum: 0,
        ratingCount: 0,
        updatedAt: new Date().toISOString(),
      });
    });

    // Increment global comment count
    const globalDocRef = doc(db, 'site_stats', STATS_DOC_ID);
    await updateDoc(globalDocRef, {
      totalComments: increment(1),
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to post realtime comment:', err);
    throw err;
  }
};

/**
 * Post an author, collaborator, or reader reply to an existing comment.
 * Visitors can reply freely without logging in.
 */
export const postCommentReply = async (
  commentId: string,
  reply: {
    user: string;
    text: string;
    avatar?: string;
    isAuthor?: boolean;
    isCollaborator?: boolean;
    roleBadge?: string;
    userEmail?: string | null;
  }
): Promise<CommentReply> => {
  const fallbackUser = reply.isAuthor
    ? 'Mellifluous (Tác giả)'
    : reply.isCollaborator
    ? 'Cộng sự BQT'
    : 'Bạn đọc';

  const defaultAvatar = reply.isAuthor ? '🌸' : reply.isCollaborator ? '🌿' : '💬';

  const newReplyItem: CommentReply = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user: (reply.user && reply.user.trim()) || fallbackUser,
    avatar: reply.avatar || defaultAvatar,
    text: reply.text.trim(),
    createdAt: new Date().toISOString(),
    isAuthor: Boolean(reply.isAuthor),
    isCollaborator: Boolean(reply.isCollaborator),
    roleBadge: reply.roleBadge || (reply.isAuthor ? 'Tác giả' : reply.isCollaborator ? 'Cộng sự' : undefined),
    userEmail: reply.userEmail || null,
  };

  try {
    const commentRef = doc(db, 'comments', commentId);
    try {
      await updateDoc(commentRef, {
        replies: arrayUnion(newReplyItem),
        lastRepliedAt: new Date().toISOString(),
      });
    } catch (atomicErr) {
      console.warn('arrayUnion failed, trying fallback getDoc + updateDoc:', atomicErr);
      const snap = await getDoc(commentRef);
      if (snap.exists()) {
        const data = snap.data();
        const currentReplies: CommentReply[] = data.replies || [];
        await updateDoc(commentRef, {
          replies: [...currentReplies, newReplyItem],
          lastRepliedAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error('Failed to post comment reply to Firestore:', err);
  }

  return newReplyItem;
};

/**
 * Delete a comment (Author / Moderator only)
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'comments', commentId));
  } catch (err) {
    console.error('Failed to delete comment:', err);
    throw err;
  }
};

/* ========================================================================
 * READER LETTERS & CONFESSIONS (HÒM THƯ TÂM SỰ CỦA ĐỘC GIẢ & TÁC GIẢ HỒI ĐÁP)
 * ======================================================================== */

/**
 * Subscribe to realtime reader letters and confessions.
 */
export const subscribeToReaderLetters = (
  callback: (letters: ReaderLetter[]) => void
): (() => void) => {
  const lettersColl = collection(db, 'reader_letters');
  const q = query(lettersColl, orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ReaderLetter[] = [];
      snapshot.forEach((d) => {
        const item = d.data();
        list.push({
          id: d.id,
          sender: item.sender || 'Bạn đọc giấu tên',
          senderEmail: item.senderEmail,
          senderUid: item.senderUid,
          avatar: item.avatar || '💌',
          content: item.content || '',
          type: item.type === 'private' ? 'private' : 'public',
          tag: item.tag || '🌸 Lời nhắn gửi',
          time: item.time || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'),
          createdAt: item.createdAt || new Date().toISOString(),
          likes: item.likes || 0,
          replyFromMel: item.replyFromMel,
          repliedAt: item.repliedAt,
          repliedBy: item.repliedBy,
        });
      });
      callback(list);
    },
    (err) => {
      console.warn('Reader letters snapshot error:', err);
      // Fallback to local storage if any
      try {
        const saved = localStorage.getItem('mel_reader_letters_cache');
        if (saved) callback(JSON.parse(saved));
        else callback([]);
      } catch {
        callback([]);
      }
    }
  );
};

/**
 * Submit a reader letter/confession to Firestore.
 */
export const sendReaderLetter = async (letter: {
  sender: string;
  senderEmail?: string;
  senderUid?: string;
  avatar?: string;
  content: string;
  type: 'public' | 'private';
  tag?: string;
  userEmail?: string;
  userId?: string;
}): Promise<{ id: string; secretLookupCode?: string }> => {
  try {
    const lettersColl = collection(db, 'reader_letters');
    const secretLookupCode =
      letter.type === 'private'
        ? `MEL-${Math.floor(10000 + Math.random() * 90000)}`
        : undefined;

    const docRef = await addDoc(lettersColl, {
      sender: letter.sender.trim() || 'Bạn đọc yêu mến',
      senderEmail: letter.senderEmail || letter.userEmail || null,
      senderUid: letter.senderUid || letter.userId || null,
      avatar: letter.avatar || '💌',
      content: letter.content.trim(),
      type: letter.type,
      tag: letter.tag || '🌸 Lời nhắn gửi',
      time: 'Vừa xong',
      createdAt: new Date().toISOString(),
      likes: 0,
      replyFromMel: null,
      repliedAt: null,
      repliedBy: null,
      secretLookupCode: secretLookupCode || null,
    });
    return { id: docRef.id, secretLookupCode };
  } catch (err) {
    console.error('Failed to send reader letter:', err);
    throw err;
  }
};

/**
 * Author or collaborator replies to a reader's letter/confession.
 */
export const replyToReaderLetter = async (
  letterId: string,
  replyText: string,
  authorName: string = 'Mellifluous (Tác giả)'
): Promise<void> => {
  try {
    const letterRef = doc(db, 'reader_letters', letterId);
    await updateDoc(letterRef, {
      replyFromMel: replyText.trim(),
      repliedAt: new Date().toISOString(),
      repliedBy: authorName,
    });
  } catch (err) {
    console.error('Failed to reply to reader letter:', err);
    throw err;
  }
};

/**
 * Delete a reader letter (Author / Moderator only)
 */
export const deleteReaderLetter = async (letterId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'reader_letters', letterId));
  } catch (err) {
    console.error('Failed to delete reader letter:', err);
    throw err;
  }
};

/**
 * Toggle like for a reader letter
 */
export const toggleLetterLike = async (letterId: string): Promise<void> => {
  try {
    const letterRef = doc(db, 'reader_letters', letterId);
    await updateDoc(letterRef, {
      likes: increment(1),
    });
  } catch (err) {
    console.warn('Failed to like letter:', err);
  }
};


/**
 * Register follower/email subscription in real time.
 */
export const subscribeNewsletter = async (
  email: string,
  targetStoryId: string = 'all'
): Promise<void> => {
  try {
    const coll = collection(db, 'newsletter_subscribers');
    await addDoc(coll, {
      email: email.trim().toLowerCase(),
      targetStoryId,
      subscribedAt: new Date().toISOString(),
    });

    const globalDocRef = doc(db, 'site_stats', STATS_DOC_ID);
    await updateDoc(globalDocRef, {
      totalFollowers: increment(1),
    }).catch(() => {});
  } catch (err) {
    console.warn('Newsletter subscription error:', err);
    throw err;
  }
};

/* ========================================================================
 * PUBLISHING & DYNAMIC CONTENT MANAGEMENT (TÁC GIẢ ĐĂNG BÀI KỂ TỪ KHI XUẤT BẢN)
 * ======================================================================== */

/**
 * Check if the site is in official publishing mode.
 */
export const getPublishingStatus = async (): Promise<{
  isPublished: boolean;
  publishedAt: string | null;
  totalStoriesCount: number;
}> => {
  try {
    const cfgRef = doc(db, 'site_config', CONFIG_DOC_ID);
    const snap = await getDoc(cfgRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        isPublished: Boolean(data.isPublished),
        publishedAt: data.publishedAt || null,
        totalStoriesCount: data.totalStoriesCount || 0,
      };
    }
  } catch (e) {
    console.warn('Failed to load site config:', e);
  }
  return { isPublished: false, publishedAt: null, totalStoriesCount: 0 };
};

/**
 * Set the official publishing status of the site.
 */
export const setPublishingStatus = async (isPublished: boolean): Promise<void> => {
  const cfgRef = doc(db, 'site_config', CONFIG_DOC_ID);
  await setDoc(
    cfgRef,
    {
      isPublished,
      publishedAt: isPublished ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};

/**
 * Reset ALL website metrics to default 0 (Khởi tạo Website chính thức từ 0).
 * Clears visits, likes, followers, comments so tracking only starts from publication!
 */
export const resetAllMetricsToZero = async (): Promise<void> => {
  try {
    // 1. Reset Global site stats to 0
    const statsDocRef = doc(db, 'site_stats', STATS_DOC_ID);
    await setDoc(statsDocRef, {
      totalVisits: 1, // The current author
      totalFollowers: 0,
      totalComments: 0,
      totalLikes: 0,
      activeReaders: 1,
      lastResetAt: new Date().toISOString(),
      resetReason: 'Official site publication reset',
    });

    // 2. Reset story_stats for existing stories
    const storiesSnap = await getDocs(collection(db, 'story_stats'));
    const batch = writeBatch(db);
    storiesSnap.forEach((d) => {
      batch.set(d.ref, {
        storyId: d.id,
        views: 0,
        likes: 0,
        followers: 0,
        ratingSum: 0,
        ratingCount: 0,
        commentCount: 0,
        updatedAt: new Date().toISOString(),
      });
    });
    await batch.commit();

    // 3. Mark site as officially published
    await setPublishingStatus(true);

    // Clear local session storage markers
    sessionStorage.removeItem('mel_visited_recorded');
  } catch (err) {
    console.error('Reset all metrics error:', err);
    throw err;
  }
};

/**
 * Get current list of stories from localStorage or default sample stories.
 */
export const getStoredStories = (): Story[] => {
  try {
    const raw = localStorage.getItem('mel_published_stories');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return STORIES;
};

/**
 * Get current list of announcements from localStorage or default sample.
 */
export const getStoredAnnouncements = (): Announcement[] => {
  try {
    const raw = localStorage.getItem('mel_announcements');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return ANNOUNCEMENTS;
};

/**
 * Subscribe to published stories from Firestore with immediate local fallback.
 */
export const subscribeToPublishedStories = (
  callback: (stories: Story[]) => void
): (() => void) => {
  // 1. Immediately provide current stories
  const initial = getStoredStories();
  callback(initial);

  // 2. Register for local broadcasts
  activeStorySubscribers.add(callback);

  // 3. Connect to Firestore
  let unsubFirestore: (() => void) | null = null;
  try {
    const storiesColl = collection(db, 'stories');
    unsubFirestore = onSnapshot(
      storiesColl,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Story[] = [];
          snapshot.forEach((d) => {
            const item = d.data() as Story;
            list.push({ ...item, id: d.id });
          });
          list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
          try {
            localStorage.setItem('mel_published_stories', JSON.stringify(list));
          } catch {}
          callback(list);
        }
      },
      (err) => {
        console.warn('Stories Firestore snapshot warning:', err);
      }
    );
  } catch (e) {
    console.warn('Firestore subscription unavailable:', e);
  }

  return () => {
    activeStorySubscribers.delete(callback);
    if (unsubFirestore) unsubFirestore();
  };
};

/**
 * Save or publish a story with dual-engine persistence (Local + Firestore).
 * Guarantees zero failures and prevents undefined field crashes.
 */
export const publishStory = async (story: Story): Promise<void> => {
  // 1. Sanitize all fields to eliminate any undefined values
  const cleanStory: Story = {
    id: story.id,
    title: story.title.trim(),
    originalTitle: (story.originalTitle || '').trim(),
    author: story.author.trim(),
    translator: (story.translator || 'Mellifluous').trim(),
    status: story.status || 'ongoing',
    genre: Array.isArray(story.genre) && story.genre.length > 0 ? story.genre : ['Ngôn tình', 'Ngọt sủng'],
    summary: (story.summary || '').trim(),
    totalChapters: Number(story.totalChapters) || 1,
    completedChapters: Number(story.completedChapters) || 0,
    mainChaptersCount: Number(story.mainChaptersCount) || Number(story.totalChapters) || 1,
    extraChaptersCount: Number(story.extraChaptersCount) || 0,
    coverImage: story.coverImage || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
    colorTheme: story.colorTheme || 'from-pink-100 to-rose-200 dark:from-pink-950/40 dark:to-rose-900/40',
    hasPassword: Boolean(story.hasPassword),
    passwordHint: (story.passwordHint || '').trim(),
    passwordKey: (story.passwordKey || '').trim().toLowerCase(),
    updatedAt: 'Vừa đăng',
    views: story.views ?? 0,
    likes: story.likes ?? 0,
    featured: Boolean(story.featured),
  };

  // 2. Synchronously persist into localStorage
  try {
    const currentList = getStoredStories();
    const idx = currentList.findIndex((s) => s.id === cleanStory.id);
    let updatedList: Story[];
    if (idx >= 0) {
      updatedList = [...currentList];
      updatedList[idx] = cleanStory;
    } else {
      updatedList = [cleanStory, ...currentList];
    }
    localStorage.setItem('mel_published_stories', JSON.stringify(updatedList));
    notifyStorySubscribers(updatedList);
  } catch (localErr) {
    console.warn('Local storage save warning:', localErr);
  }

  // 3. Attempt Firestore cloud sync (safe, non-blocking)
  try {
    const storyRef = doc(db, 'stories', cleanStory.id);
    await setDoc(storyRef, {
      ...cleanStory,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    });

    const statsRef = doc(db, 'story_stats', cleanStory.id);
    await setDoc(
      statsRef,
      {
        storyId: cleanStory.id,
        views: 0,
        likes: 0,
        followers: 0,
        ratingSum: 0,
        ratingCount: 0,
        commentCount: 0,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (firestoreErr) {
    console.warn('Firestore cloud sync warning (stored locally):', firestoreErr);
  }
};

/**
 * Delete a story with dual-engine persistence (Local + Firestore).
 */
export const deleteStory = async (storyId: string): Promise<void> => {
  // 1. Remove from localStorage
  try {
    const currentList = getStoredStories();
    const updatedList = currentList.filter((s) => s.id !== storyId);
    localStorage.setItem('mel_published_stories', JSON.stringify(updatedList));
    localStorage.removeItem(`mel_chapters_${storyId}`);
    notifyStorySubscribers(updatedList);
  } catch (localErr) {
    console.warn('Local delete warning:', localErr);
  }

  // 2. Remove from Firestore
  try {
    await deleteDoc(doc(db, 'stories', storyId));
    await deleteDoc(doc(db, 'story_stats', storyId));
  } catch (firestoreErr) {
    console.warn('Firestore delete warning:', firestoreErr);
  }
};

/**
 * Subscribe to chapters for a story with automatic merge of custom chapters.
 */
export const subscribeToStoryChapters = (
  storyId: string,
  callback: (chapters: Chapter[]) => void
): (() => void) => {
  // 1. Provide combined local and sample chapters immediately
  const initial = getStoryChapters(storyId);
  callback(initial);

  // 2. Register for memory updates
  if (!activeChapterSubscribers.has(storyId)) {
    activeChapterSubscribers.set(storyId, new Set());
  }
  activeChapterSubscribers.get(storyId)!.add(callback);

  // 3. Connect to Firestore
  let unsubFirestore: (() => void) | null = null;
  try {
    const chaptersColl = collection(db, 'chapters');
    const q = query(chaptersColl, where('storyId', '==', storyId), orderBy('chapterNumber', 'asc'));

    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Chapter[] = [];
          snapshot.forEach((d) => {
            list.push({ ...(d.data() as Chapter), id: d.id });
          });
          callback(list);
        }
      },
      (err) => {
        console.warn(`Chapters snapshot error for ${storyId}:`, err);
      }
    );
  } catch (e) {
    console.warn('Firestore chapter subscription error:', e);
  }

  return () => {
    const set = activeChapterSubscribers.get(storyId);
    if (set) set.delete(callback);
    if (unsubFirestore) unsubFirestore();
  };
};

/**
 * Publish a new chapter or extra for a story with dual-engine persistence.
 */
export const publishChapter = async (chapter: Chapter): Promise<void> => {
  // 1. Sanitize all fields to eliminate undefined values
  const cleanChapter: Chapter = {
    id: chapter.id,
    storyId: chapter.storyId,
    chapterNumber: Number(chapter.chapterNumber) || 1,
    title: chapter.title.trim(),
    publishedAt: chapter.publishedAt || new Date().toISOString(),
    isLocked: Boolean(chapter.isLocked),
    content: chapter.content.trim(),
    translatorNote: (chapter.translatorNote || '').trim(),
    wordCount: Number(chapter.wordCount) || (chapter.content ? chapter.content.trim().split(/\s+/).length : 0),
    isExtra: Boolean(chapter.isExtra),
    extraNumber: chapter.extraNumber || (chapter.isExtra ? Number(chapter.chapterNumber) : 0),
    partType: chapter.partType || (chapter.isExtra ? 'extra' : 'main'),
  };

  // 2. Save chapter to localStorage
  saveCustomChapterToStorage(cleanChapter);

  // 3. Update story completedChapters in localStorage
  try {
    const stories = getStoredStories();
    const target = stories.find((s) => s.id === cleanChapter.storyId);
    if (target) {
      target.completedChapters = Math.max(target.completedChapters || 0, cleanChapter.chapterNumber);
      target.updatedAt = 'Vừa đăng';
      localStorage.setItem('mel_published_stories', JSON.stringify(stories));
      notifyStorySubscribers(stories);
    }
  } catch (err) {
    console.warn('Update story chapters count warning:', err);
  }

  // 4. Notify chapter listeners
  const allChapters = getStoryChapters(cleanChapter.storyId);
  notifyChapterSubscribers(cleanChapter.storyId, allChapters);

  // 5. Cloud sync to Firestore
  try {
    const chapterRef = doc(db, 'chapters', cleanChapter.id);
    await setDoc(chapterRef, {
      ...cleanChapter,
      publishedAt: new Date().toISOString(),
    });

    const storyRef = doc(db, 'stories', cleanChapter.storyId);
    await updateDoc(storyRef, {
      completedChapters: cleanChapter.chapterNumber,
      updatedAt: 'Vừa đăng',
    }).catch(() => {});
  } catch (firestoreErr) {
    console.warn('Firestore publish chapter warning (saved locally):', firestoreErr);
  }
};

/**
 * Delete a chapter with dual persistence.
 */
export const deleteChapter = async (storyId: string, chapterId: string): Promise<void> => {
  deleteCustomChapterFromStorage(storyId, chapterId);
  notifyChapterSubscribers(storyId, getStoryChapters(storyId));

  try {
    await deleteDoc(doc(db, 'chapters', chapterId));
  } catch (err) {
    console.warn('Firestore delete chapter warning:', err);
  }
};

/**
 * Subscribe to Announcements / Notice board posts.
 */
export const subscribeToAnnouncements = (
  callback: (announcements: Announcement[]) => void
): (() => void) => {
  // 1. Provide stored announcements immediately
  callback(getStoredAnnouncements());

  // 2. Register active memory listener
  activeAnnouncementSubscribers.add(callback);

  // 3. Connect to Firestore
  let unsubFirestore: (() => void) | null = null;
  try {
    const coll = collection(db, 'announcements');
    const q = query(coll, orderBy('date', 'desc'), limit(20));

    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Announcement[] = [];
          snapshot.forEach((d) => {
            list.push({ ...(d.data() as Announcement), id: d.id });
          });
          try {
            localStorage.setItem('mel_announcements', JSON.stringify(list));
          } catch {}
          callback(list);
        }
      },
      (err) => {
        console.warn('Announcements snapshot warning:', err);
      }
    );
  } catch (e) {
    console.warn('Firestore announcement subscription error:', e);
  }

  return () => {
    activeAnnouncementSubscribers.delete(callback);
    if (unsubFirestore) unsubFirestore();
  };
};

/**
 * Publish an announcement with dual persistence.
 */
export const publishAnnouncement = async (announcement: Announcement): Promise<void> => {
  const cleanAnn: Announcement = {
    id: announcement.id,
    title: announcement.title.trim(),
    tag: announcement.tag || 'Thông báo',
    content: announcement.content.trim(),
    date: announcement.date || new Date().toLocaleDateString('vi-VN'),
    isPinned: Boolean(announcement.isPinned),
  };

  try {
    const current = getStoredAnnouncements();
    const updated = [cleanAnn, ...current.filter((a) => a.id !== cleanAnn.id)];
    localStorage.setItem('mel_announcements', JSON.stringify(updated));
    notifyAnnouncementSubscribers(updated);
  } catch (err) {
    console.warn('Local announcement save warning:', err);
  }

  try {
    const noticeRef = doc(db, 'announcements', cleanAnn.id);
    await setDoc(noticeRef, cleanAnn);
  } catch (firestoreErr) {
    console.warn('Firestore announcement save warning:', firestoreErr);
  }
};

/**
 * Delete an announcement with dual persistence.
 */
export const deleteAnnouncement = async (announcementId: string): Promise<void> => {
  try {
    const current = getStoredAnnouncements();
    const updated = current.filter((a) => a.id !== announcementId);
    localStorage.setItem('mel_announcements', JSON.stringify(updated));
    notifyAnnouncementSubscribers(updated);
  } catch (err) {
    console.warn('Local announcement delete warning:', err);
  }

  try {
    await deleteDoc(doc(db, 'announcements', announcementId));
  } catch (firestoreErr) {
    console.warn('Firestore announcement delete warning:', firestoreErr);
  }
};

/**
 * Seed initial sample stories with STRICTLY 0 stats.
 */
export const seedSampleStoriesWithZeroStats = async (): Promise<void> => {
  // 1. Seed into localStorage with 0 stats
  const cleanZeroStories: Story[] = STORIES.map((s) => ({
    ...s,
    views: 0,
    likes: 0,
    updatedAt: 'Vừa đăng',
  }));

  try {
    localStorage.setItem('mel_published_stories', JSON.stringify(cleanZeroStories));
    localStorage.setItem('mel_announcements', JSON.stringify(ANNOUNCEMENTS));
    notifyStorySubscribers(cleanZeroStories);
    notifyAnnouncementSubscribers(ANNOUNCEMENTS);
  } catch (err) {
    console.warn('Local seed error:', err);
  }

  // 2. Seed into Firestore
  try {
    const batch = writeBatch(db);

    for (const s of cleanZeroStories) {
      const storyRef = doc(db, 'stories', s.id);
      batch.set(storyRef, s);

      const statsRef = doc(db, 'story_stats', s.id);
      batch.set(statsRef, {
        storyId: s.id,
        views: 0,
        likes: 0,
        followers: 0,
        ratingSum: 0,
        ratingCount: 0,
        commentCount: 0,
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed sample chapters
    for (const [storyId, chapters] of Object.entries(SAMPLE_CHAPTERS)) {
      for (const ch of chapters) {
        const chRef = doc(db, 'chapters', ch.id);
        batch.set(chRef, ch);
      }
    }

    // Seed sample announcements
    for (const ann of ANNOUNCEMENTS) {
      const annRef = doc(db, 'announcements', ann.id);
      batch.set(annRef, ann);
    }

    await batch.commit();
    await resetAllMetricsToZero();
  } catch (err) {
    console.warn('Firestore seed warning (local seed applied):', err);
  }
};

/**
 * Clear all stories and chapters for a 100% clean publication slate.
 */
export const clearAllStoriesAndChapters = async (): Promise<void> => {
  try {
    localStorage.setItem('mel_published_stories', JSON.stringify([]));
    localStorage.setItem('mel_announcements', JSON.stringify([]));
    notifyStorySubscribers([]);
    notifyAnnouncementSubscribers([]);
  } catch (err) {
    console.warn('Local clear warning:', err);
  }

  try {
    const storiesSnap = await getDocs(collection(db, 'stories'));
    const chaptersSnap = await getDocs(collection(db, 'chapters'));
    const announcementsSnap = await getDocs(collection(db, 'announcements'));
    const statsSnap = await getDocs(collection(db, 'story_stats'));

    const batch = writeBatch(db);
    storiesSnap.forEach((d) => batch.delete(d.ref));
    chaptersSnap.forEach((d) => batch.delete(d.ref));
    announcementsSnap.forEach((d) => batch.delete(d.ref));
    statsSnap.forEach((d) => batch.delete(d.ref));

    await batch.commit();
    await resetAllMetricsToZero();
  } catch (err) {
    console.warn('Firestore clear warning (local cleared):', err);
  }
};
