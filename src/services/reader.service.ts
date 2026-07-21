import api from './api'
import { rankingService } from './ranking.service'
import { PublishedSeries, PublishedChapter, MangaPage, ReadingHistoryItem, SearchParams, SearchResult, SeriesDetail } from '@/types/reader.types'

const mapStatus = (status: string | undefined): 'PUBLISHING' | 'COMPLETED' | 'HIATUS' => {
  if (!status) return 'PUBLISHING';
  const s = status.toLowerCase();
  if (s === 'completed') return 'COMPLETED';
  if (s === 'hiatus') return 'HIATUS';
  return 'PUBLISHING';
};

const mapSeries = (s: any): PublishedSeries => {
  // If the backend returns chapter array, we can calculate these, otherwise default to 0
  const totalChapters = s.chapter ? s.chapter.length : 0;
  let latestChapterNumber = 0;
  let latestChapterDate = s.updated_at;
  if (s.chapter && s.chapter.length > 0) {
    const latestChapter = s.chapter.reduce((prev: any, current: any) => 
      (prev.chapter_number > current.chapter_number) ? prev : current
    );
    latestChapterNumber = latestChapter.chapter_number;
    latestChapterDate = latestChapter.publish_date || latestChapter.created_at || s.updated_at;
  }

  // If the backend returns series_member array, find the mangaka
  let authorName = 'Unknown Author';
  let authorAvatarUrl = null;
  if (s.series_member && s.series_member.length > 0) {
    const mangaka = s.series_member.find((m: any) => m.role_in_series === 'owner' || m.role_in_series === 'mangaka');
    if (mangaka && mangaka.users) {
      authorName = mangaka.users.name || mangaka.users.username || 'Unknown Author';
      authorAvatarUrl = mangaka.users.avatar_url;
    }
  }

  return {
    id: s.series_id,
    title: s.title,
    description: s.description || '',
    genre: s.genre || 'Uncategorized',
    coverImageUrl: s.cover_image_url || null,
    status: mapStatus(s.status),
    viewCount: s.view_count || s.total_views || 0,
    totalLikes: s.total_likes || s.like_count || s.likes || 0,
    totalChapters,
    latestChapterNumber,
    latestChapterDate: latestChapterDate || s.updated_at,
    rating: s.rating || 0,
    ratingCount: s.rating_count || 0,
    authorName,
    authorAvatarUrl,
    createdAt: s.publish_date || s.created_at,
    updatedAt: s.updated_at
  }
}

export const readerService = {
  // --- Series ---

  getFeatured: async (): Promise<PublishedSeries[]> => {
    try {
      const res = await api.get('/api/series', {
        params: { status: 'published', sort: 'view_count', order: 'desc', limit: 4 }
      });
      return (res.data.data || []).map(mapSeries);
    } catch (error) {
      console.error('Error fetching featured series:', error);
      return [];
    }
  },

  getLatestUpdates: async (limit: number = 10): Promise<PublishedSeries[]> => {
    try {
      const res = await api.get('/api/series', {
        params: { status: 'published', sort: 'updated_at', order: 'desc', limit }
      });
      return (res.data.data || []).map(mapSeries);
    } catch (error) {
      console.error('Error fetching latest updates:', error);
      return [];
    }
  },

  getTopViews: async (limit: number = 5): Promise<PublishedSeries[]> => {
    try {
      const data = await rankingService.getTopSeries(50);
      const sorted = data.sort((a, b) => (b.series?.view_count || 0) - (a.series?.view_count || 0)).slice(0, limit);
      return sorted.map(r => ({
        id: r.series_id,
        title: r.series?.title || '',
        description: '',
        genre: r.series?.genre || 'Uncategorized',
        coverImageUrl: r.series?.cover_image_url || null,
        status: mapStatus(r.series?.status as string),
        viewCount: r.series?.view_count || 0,
        totalLikes: r.total_vote || 0,
        totalChapters: 0,
        latestChapterNumber: 0,
        latestChapterDate: r.created_at,
        rating: 0,
        ratingCount: 0,
        authorName: r.series?.author || 'Đang cập nhật',
        authorAvatarUrl: null,
        createdAt: r.created_at,
        updatedAt: r.created_at
      }));
    } catch (error) {
      console.error('Error fetching top views series:', error);
      return [];
    }
  },

  getTopLikes: async (limit: number = 5): Promise<PublishedSeries[]> => {
    try {
      const data = await rankingService.getTopSeries(50);
      const sorted = data.sort((a, b) => (b.total_vote || 0) - (a.total_vote || 0)).slice(0, limit);
      return sorted.map(r => ({
        id: r.series_id,
        title: r.series?.title || '',
        description: '',
        genre: r.series?.genre || 'Uncategorized',
        coverImageUrl: r.series?.cover_image_url || null,
        status: mapStatus(r.series?.status as string),
        viewCount: r.series?.view_count || 0,
        totalLikes: r.total_vote || 0,
        totalChapters: 0,
        latestChapterNumber: 0,
        latestChapterDate: r.created_at,
        rating: 0,
        ratingCount: 0,
        authorName: r.series?.author || 'Đang cập nhật',
        authorAvatarUrl: null,
        createdAt: r.created_at,
        updatedAt: r.created_at
      }));
    } catch (error) {
      console.error('Error fetching top likes series:', error);
      return [];
    }
  },

  getSeriesByUser: async (userId: string, limit: number = 10): Promise<PublishedSeries[]> => {
    try {
      const res = await api.get('/api/series', {
        params: { user_id: userId, status: 'published', limit }
      });
      return (res.data.data || []).map(mapSeries);
    } catch (error) {
      console.error('Error fetching series by user:', error);
      return [];
    }
  },

  getSeriesDetail: async (seriesId: string): Promise<SeriesDetail | null> => {
    try {
      const res = await api.get(`/api/series/${seriesId}/detail`);
      if (!res.data.data) return null;
      const s = res.data.data;
      const base = mapSeries(s);

      const teamMembers = (s.series_member || []).map((m: any) => ({
        userId: m.user_id,
        name: m.users?.name || m.users?.username || 'Unknown',
        avatarUrl: m.users?.avatar_url || null,
        roleInSeries: m.role_in_series
      }));

      const editor = teamMembers.find((m: any) =>
        m.roleInSeries === 'editor' ||
        m.roleInSeries === 'tantou_editor' ||
        m.roleInSeries === 'tantou'
      );

      // Lọc 1 user = 1 like cho toàn bộ Series (để công bằng giữa các mangaka có nhiều/ít chapter)
      let uniqueLikes = 0;
      if (s.chapter) {
        const uniqueUsers = new Set();
        s.chapter.forEach((c: any) => {
          c.chapter_like?.forEach((like: any) => {
            const uid = typeof like === 'string' ? like : like.user_id;
            if (uid) uniqueUsers.add(uid);
          });
        });
        uniqueLikes = uniqueUsers.size;
      }
      const totalLikes = uniqueLikes > 0 ? uniqueLikes : (s.total_likes || 0);

      return {
        ...base,
        editorName: editor ? editor.name : null,
        editorAvatarUrl: editor ? editor.avatarUrl : null,
        publishSchedule: 'Hàng tuần',
        genres: base.genre ? base.genre.split(',').map((g: string) => g.trim()) : [],
        teamMembers,
        totalViews: s.total_views || 0,
        totalLikes: totalLikes,
        chaptersData: s.chapter || []
      }
    } catch (error) {
      console.error('Error fetching series detail:', error);
      return null;
    }
  },

  searchSeries: async (params: SearchParams): Promise<SearchResult> => {
    try {
      // Vì Backend hiện tại chỉ hỗ trợ search theo title (query.ilike("title", ...)),
      // Để tìm được theo Tác Giả, ta sẽ fetch 1 lượng lớn truyện về và tự filter ở Frontend.
      const apiParams: any = { status: 'published', limit: 200 };

      const res = await api.get('/api/series', { params: apiParams });

      let items = (res.data.data || []).map(mapSeries);

      // 1. Filter theo query (Title hoặc Author)
      if (params.query) {
        const q = params.query.toLowerCase();
        items = items.filter((item: PublishedSeries) =>
          item.title.toLowerCase().includes(q) ||
          item.authorName.toLowerCase().includes(q)
        );
      }

      // 2. Filter theo genre
      if (params.genre) {
        items = items.filter((item: PublishedSeries) =>
          item.genre === params.genre ||
          item.genre.includes(params.genre!)
        );
      }

      // 3. Phân trang cục bộ
      const limit = params.limit || 12;
      const total = items.length;
      const page = params.page || 1;
      const paginatedItems = items.slice((page - 1) * limit, page * limit);

      return {
        series: paginatedItems,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1
      }
    } catch (error) {
      console.error('Error searching series:', error);
      return { series: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  // --- Chapters & Pages ---

  getPublishedChapters: async (seriesId: string, sortOrder: 'newest' | 'oldest' = 'newest'): Promise<PublishedChapter[]> => {
    try {
      const res = await api.get('/api/chapters', {
        params: {
          seriesId,
          status: 'published',
          sort: 'chapter_number',
          order: sortOrder === 'newest' ? 'desc' : 'asc',
          limit: 1000 // Get all for reader view
        }
      });
      return (res.data.data || []).map((c: any) => ({
        id: c.chapter_id,
        seriesId: c.series_id,
        title: c.title || `Chapter ${c.chapter_number}`,
        chapterNumber: c.chapter_number,
        publishedAt: c.publish_date || c.created_at,
        thumbnailUrl: c.thumbnail_image_url || null,
        pageCount: 0, // Not provided in list API
        isRead: false,
        isNew: false
      }));
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return [];
    }
  },

  getChapterPages: async (chapterId: string): Promise<MangaPage[]> => {
    try {
      const res = await api.get(`/api/chapters/${chapterId}/pages`, {
        params: { sort: 'page_number', order: 'asc', limit: 200 }
      });

      return (res.data.data || [])
        .filter((p: any) => p.chapter_id === chapterId)
        .map((p: any) => ({
          id: p.page_id,
          chapterId: p.chapter_id,
          pageNumber: p.page_number,
          imageUrl: p.image_url
        }));
    } catch (error) {
      console.error('Error fetching chapter pages:', error);
      return [];
    }
  },

  toggleChapterLike: async (chapterId: string): Promise<boolean> => {
    try {
      await api.post('/api/chapter-likes', { chapter_id: chapterId });
      return true;
    } catch (error) {
      console.error('Error toggling chapter like:', error);
      return false;
    }
  },

  // --- History & Favorites (Kept Mocked or Partial) ---

  getReadingHistory: async (): Promise<ReadingHistoryItem[]> => {
    try {
      let token = null;
      try {
        const userStr = sessionStorage.getItem('mangaflow_user');
        if (userStr) token = JSON.parse(userStr).token;
      } catch (e) {}

      if (!token) {
        // Fallback to localStorage for unauthenticated users
        const local = localStorage.getItem('localReadingHistory');
        return local ? JSON.parse(local) : [];
      }

      const res = await api.get('/api/bookmarks?limit=100');
      return (res.data.data || []).map((b: any) => ({
        seriesId: b.series_id,
        seriesTitle: b.series?.title || 'Unknown Series',
        seriesCoverUrl: b.series?.cover_image_url || null,
        seriesGenre: b.series?.genre || '',
        lastChapterId: b.last_read_chapter_id,
        lastChapterNumber: b.chapter?.chapter_number || 0,
        lastChapterTitle: b.chapter?.title || `Chương ${b.chapter?.chapter_number || 0}`,
        lastPageNumber: 1,
        totalPages: 1,
        progressPercent: 100,
        lastReadAt: b.updated_at,
        isCompleted: true
      }));
    } catch (error) {
      console.error('Error fetching reading history:', error);
      return [];
    }
  },

  saveReadingProgress: async (data: { series_id: string, chapter_id: string, page_number: number }) => {
    try {
      let token = null;
      try {
        const userStr = sessionStorage.getItem('mangaflow_user');
        if (userStr) token = JSON.parse(userStr).token;
      } catch (e) {}

      if (!token) {
        // Save to localStorage for unauthenticated users
        const local = localStorage.getItem('localReadingHistory');
        let history = local ? JSON.parse(local) : [];

        // Remove existing entry for this series if exists
        history = history.filter((h: any) => h.seriesId !== data.series_id);

        // Fetch series detail to get title/cover for the history card
        // This is a simplified fetch just to get basic info for local storage
        try {
          const sRes = await api.get(`/api/series/${data.series_id}`);
          const s = sRes.data.data;
          const cRes = await api.get(`/api/chapters`, { params: { seriesId: data.series_id } });
          const c = (cRes.data.data || []).find((ch: any) => ch.chapter_id === data.chapter_id);

          history.unshift({
            seriesId: data.series_id,
            seriesTitle: s?.title || 'Unknown Series',
            seriesCoverUrl: s?.cover_image_url || null,
            seriesGenre: s?.genre || '',
            lastChapterId: data.chapter_id,
            lastChapterNumber: c?.chapter_number || 0,
            lastChapterTitle: c?.title || `Chương ${c?.chapter_number || 0}`,
            lastPageNumber: 1,
            totalPages: 1,
            progressPercent: 100,
            lastReadAt: new Date().toISOString(),
            isCompleted: true
          });

          localStorage.setItem('localReadingHistory', JSON.stringify(history.slice(0, 50))); // Keep last 50
        } catch (e) {
          console.error("Could not fetch details for local history", e);
          // Add minimal info if fetch fails
          history.unshift({
            seriesId: data.series_id,
            lastChapterId: data.chapter_id,
            lastReadAt: new Date().toISOString()
          });
          localStorage.setItem('localReadingHistory', JSON.stringify(history.slice(0, 50)));
        }
        window.dispatchEvent(new Event('mangaflow_history_update'));
        return true;
      }

      await api.post('/api/bookmarks', {
        series_id: data.series_id,
        last_read_chapter_id: data.chapter_id,
      });
      window.dispatchEvent(new Event('mangaflow_history_update'));
      return true;
    } catch (error) {
      console.error('Error saving reading progress:', error);
      return false;
    }
  },

  checkFavorite: async (seriesId: string): Promise<boolean> => {
    return false;
  },

  toggleFavorite: async (seriesId: string): Promise<boolean> => {
    return true;
  },

  logView: async (seriesId: string, chapterId: string): Promise<void> => {
    try {
      // Chống duplicate: reload hay qua lại chương 'Đã Đọc' không tăng view trong 24h, sau 1 ngày mới cộng lại
      const VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 giờ
      const storageKey = `mangaflow_viewed_chapters`;
      const now = Date.now();

      let viewedMap: Record<string, number> = {};
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            viewedMap = parsed;
          }
        }
      } catch (e) { /* ignore parse errors */ }

      const lastViewed = viewedMap[chapterId];
      if (lastViewed && typeof lastViewed === 'number' && (now - lastViewed) < VIEW_COOLDOWN_MS) {
        // Đã log view chapter này trong vòng 1 ngày (Đã đọc), bỏ qua
        return;
      }

      await api.post('/api/view-logs', { series_id: seriesId, chapter_id: chapterId });

      // Ghi nhận thời điểm đã log
      viewedMap[chapterId] = now;

      // Dọn dẹp các entry cũ hơn 1 ngày để không phình localStorage
      for (const key of Object.keys(viewedMap)) {
        if ((now - viewedMap[key]) >= VIEW_COOLDOWN_MS) {
          delete viewedMap[key];
        }
      }
      localStorage.setItem(storageKey, JSON.stringify(viewedMap));
    } catch (error) {
      console.error('Error logging view:', error);
    }
  },

  getSeriesComments: async (seriesId: string): Promise<any[]> => {
    try {
      const res = await api.get(`/api/series/${seriesId}/comments`);
      return res.data.data || [];
    } catch (error) {
      console.error('Error fetching series comments:', error);
      return [];
    }
  },

  getChapterComments: async (chapterId: string): Promise<any[]> => {
    try {
      const res = await api.get(`/api/chapters/${chapterId}/comments`);
      return res.data.data || [];
    } catch (error) {
      console.error('Error fetching chapter comments:', error);
      return [];
    }
  },

  postChapterComment: async (chapterId: string, content: string, parentCommentId?: string): Promise<boolean> => {
    try {
      await api.post(`/api/chapters/${chapterId}/comments`, { chapter_id: chapterId, content, parent_comment_id: parentCommentId });
      return true;
    } catch (error) {
      console.error('Error posting chapter comment:', error);
      return false;
    }
  },

  getUpcomingChapters: async (): Promise<any[]> => {
    try {
      const res = await api.get('/api/chapters?status=approved&limit=5&sort=created_at&order=desc');
      const chapters = res.data.data || [];

      const seriesPromises = chapters.map(async (ch: any) => {
        try {
          const seriesRes = await api.get(`/api/series/${ch.series_id}`);
          return {
            ...ch,
            seriesTitle: seriesRes.data.data?.title || 'Unknown',
            seriesCover: seriesRes.data.data?.cover_image_url || ''
          };
        } catch (e) {
          return { ...ch, seriesTitle: 'Unknown', seriesCover: '' };
        }
      });

      return Promise.all(seriesPromises);
    } catch (error) {
      console.error('Error fetching upcoming chapters:', error);
      return [];
    }
  }
}
