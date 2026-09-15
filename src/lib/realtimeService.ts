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
} from './firebase';
import { GlobalRealtimeStats, StoryRealtimeStats, RealtimeComment, Story, Chapter, Announcement, ReaderLetter, CommentReply } from '../types';
export type { ReaderLetter, RealtimeComment, CommentReply, GlobalRealtimeStats, StoryRealtimeStats };
import { STORIES, SAMPLE_CHAPTERS, ANNOUNCEMENTS } from '../data/mockData';

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
          avatar: item.avatar || '🌸',
          text: item.text,
          createdAt: item.createdAt || new Date().toISOString(),
          rating: item.rating,
          replies: item.replies || [],
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
  userEmail?: string;
  userId?: string;
  isAuthor?: boolean;
  avatar?: string;
  text: string;
  rating?: number;
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
      avatar: comment.avatar || '🌸',
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
 * Post an author or reader reply to an existing comment.
 */
export const postCommentReply = async (
  commentId: string,
  reply: {
    user: string;
    text: string;
    avatar?: string;
    isAuthor?: boolean;
    userEmail?: string;
  }
): Promise<void> => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const snap = await getDoc(commentRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const currentReplies: CommentReply[] = data.replies || [];

    const newReplyItem: CommentReply = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user: reply.user.trim(),
      avatar: reply.avatar || (reply.isAuthor ? '🌸' : '💬'),
      text: reply.text.trim(),
      createdAt: new Date().toISOString(),
      isAuthor: Boolean(reply.isAuthor),
      userEmail: reply.userEmail,
    };

    await updateDoc(commentRef, {
      replies: [...currentReplies, newReplyItem],
      lastRepliedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to post comment reply:', err);
    throw err;
  }
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
 * Subscribe to published stories from Firestore.
 * If no stories are in Firestore yet, provides default or empty array depending on publication mode.
 */
export const subscribeToPublishedStories = (
  callback: (stories: Story[]) => void
): (() => void) => {
  const storiesColl = collection(db, 'stories');

  return onSnapshot(
    storiesColl,
    (snapshot) => {
      if (snapshot.empty) {
        // Fallback to local storage or empty
        try {
          const local = localStorage.getItem('mel_published_stories');
          if (local) {
            callback(JSON.parse(local));
            return;
          }
        } catch {}
        callback([]);
      } else {
        const list: Story[] = [];
        snapshot.forEach((d) => {
          const item = d.data() as Story;
          list.push({ ...item, id: d.id });
        });
        // Sort by updatedAt descending
        list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        callback(list);
      }
    },
    (err) => {
      console.warn('Stories snapshot warning:', err);
      // Fallback to local storage
      try {
        const local = localStorage.getItem('mel_published_stories');
        if (local) {
          callback(JSON.parse(local));
          return;
        }
      } catch {}
      callback([]);
    }
  );
};

/**
 * Save or publish a story into Firestore.
 */
export const publishStory = async (story: Story): Promise<void> => {
  try {
    const storyRef = doc(db, 'stories', story.id);
    await setDoc(storyRef, {
      ...story,
      views: story.views ?? 0,
      likes: story.likes ?? 0,
      updatedAt: new Date().toISOString(),
      publishedAt: story.updatedAt || new Date().toISOString(),
    });

    // Initialize clean stats for this story
    const statsRef = doc(db, 'story_stats', story.id);
    const snap = await getDoc(statsRef);
    if (!snap.exists()) {
      await setDoc(statsRef, {
        storyId: story.id,
        views: 0,
        likes: 0,
        followers: 0,
        ratingSum: 0,
        ratingCount: 0,
        commentCount: 0,
        updatedAt: new Date().toISOString(),
      });
    }

    // Also backup to localStorage
    try {
      const local = localStorage.getItem('mel_published_stories');
      const list: Story[] = local ? JSON.parse(local) : [];
      const idx = list.findIndex((s) => s.id === story.id);
      if (idx >= 0) list[idx] = story;
      else list.unshift(story);
      localStorage.setItem('mel_published_stories', JSON.stringify(list));
    } catch {}
  } catch (err) {
    console.error('Failed to publish story:', err);
    throw err;
  }
};

/**
 * Delete a story from Firestore.
 */
export const deleteStory = async (storyId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'stories', storyId));
    await deleteDoc(doc(db, 'story_stats', storyId));

    try {
      const local = localStorage.getItem('mel_published_stories');
      if (local) {
        const list: Story[] = JSON.parse(local);
        const filtered = list.filter((s) => s.id !== storyId);
        localStorage.setItem('mel_published_stories', JSON.stringify(filtered));
      }
    } catch {}
  } catch (err) {
    console.error('Failed to delete story:', err);
    throw err;
  }
};

/**
 * Subscribe to chapters for a story.
 */
export const subscribeToStoryChapters = (
  storyId: string,
  callback: (chapters: Chapter[]) => void
): (() => void) => {
  const chaptersColl = collection(db, 'chapters');
  const q = query(chaptersColl, where('storyId', '==', storyId), orderBy('chapterNumber', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // Fallback to sample chapters or local
        const sample = SAMPLE_CHAPTERS[storyId] || [];
        callback(sample);
      } else {
        const list: Chapter[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as Chapter), id: d.id });
        });
        callback(list);
      }
    },
    (err) => {
      console.warn(`Chapters snapshot error for ${storyId}:`, err);
      callback(SAMPLE_CHAPTERS[storyId] || []);
    }
  );
};

/**
 * Publish a new chapter or extra for a story.
 */
export const publishChapter = async (chapter: Chapter): Promise<void> => {
  try {
    const chapterRef = doc(db, 'chapters', chapter.id);
    await setDoc(chapterRef, {
      ...chapter,
      publishedAt: chapter.publishedAt || new Date().toISOString(),
    });

    // Update story completedChapters count if needed
    const storyRef = doc(db, 'stories', chapter.storyId);
    const storySnap = await getDoc(storyRef);
    if (storySnap.exists()) {
      const data = storySnap.data() as Story;
      const currentCompleted = data.completedChapters || 0;
      const newCompleted = Math.max(currentCompleted, chapter.chapterNumber);
      await updateDoc(storyRef, {
        completedChapters: newCompleted,
        updatedAt: 'Vừa đăng',
      });
    }
  } catch (err) {
    console.error('Failed to publish chapter:', err);
    throw err;
  }
};

/**
 * Delete a chapter from Firestore.
 */
export const deleteChapter = async (chapterId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'chapters', chapterId));
  } catch (err) {
    console.error('Failed to delete chapter:', err);
    throw err;
  }
};

/**
 * Subscribe to Announcements / Notice board posts.
 */
export const subscribeToAnnouncements = (
  callback: (announcements: Announcement[]) => void
): (() => void) => {
  const coll = collection(db, 'announcements');
  const q = query(coll, orderBy('date', 'desc'), limit(20));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(ANNOUNCEMENTS);
      } else {
        const list: Announcement[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as Announcement), id: d.id });
        });
        callback(list);
      }
    },
    (err) => {
      console.warn('Announcements snapshot warning:', err);
      callback(ANNOUNCEMENTS);
    }
  );
};

/**
 * Publish an announcement.
 */
export const publishAnnouncement = async (announcement: Announcement): Promise<void> => {
  try {
    const noticeRef = doc(db, 'announcements', announcement.id);
    await setDoc(noticeRef, {
      ...announcement,
      date: announcement.date || new Date().toLocaleDateString('vi-VN'),
    });
  } catch (err) {
    console.error('Failed to publish announcement:', err);
    throw err;
  }
};

/**
 * Delete an announcement.
 */
export const deleteAnnouncement = async (announcementId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'announcements', announcementId));
  } catch (err) {
    console.error('Failed to delete announcement:', err);
    throw err;
  }
};

/**
 * Seed initial sample stories with STRICTLY 0 stats into Firestore.
 * Allows the author to have clean initial stories with zero views/likes/comments.
 */
export const seedSampleStoriesWithZeroStats = async (): Promise<void> => {
  try {
    const batch = writeBatch(db);

    for (const s of STORIES) {
      const storyRef = doc(db, 'stories', s.id);
      batch.set(storyRef, {
        ...s,
        views: 0,
        likes: 0,
        updatedAt: 'Vừa đăng',
      });

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

    // Reset global site stats to 0
    await resetAllMetricsToZero();
  } catch (err) {
    console.error('Failed to seed clean stories:', err);
    throw err;
  }
};

/**
 * Clear all stories and chapters from Firestore for a 100% clean publication slate.
 */
export const clearAllStoriesAndChapters = async (): Promise<void> => {
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

    try {
      localStorage.removeItem('mel_published_stories');
    } catch {}
  } catch (err) {
    console.error('Failed to clear stories:', err);
    throw err;
  }
};
