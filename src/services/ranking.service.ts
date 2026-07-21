import api from './api'
import { readerService } from './reader.service'

export interface BackendSeriesRanking {
  series_ranking_id: string
  period_id: string
  series_id: string
  rank_position: number
  score: number
  total_vote: number
  created_at: string
  series?: {
    title: string
    genre?: string
    status: string
    cover_image_url?: string | null
    view_count?: number
  }
  ranking_period?: {
    name: string
    start_date: string
    end_date: string
  }
}

export interface RiskAnalysis {
  series_id: string
  at_risk: boolean
  declining: boolean
  low_score: boolean
  recent_rankings: Array<{
    score: number
    rank_position: number
    created_at: string
  }>
}

export interface BackendNotification {
  notification_id: string
  user_id: string
  title: string
  content: string
  type: string
  metadata?: any
  is_read: boolean
  created_at: string
}

export interface RankingEntry {
  rank: number
  title: string
  votes: number
  trend: 'up' | 'down'
  changePercent: number
}

export const rankingService = {
  /** GET /api/ranking-periods - Lấy danh sách kỳ xếp hạng */
  getRankingPeriods: async (): Promise<any[]> => {
    try {
      const response = await api.get('/api/ranking-periods')
      return response.data.data?.data || response.data.data || []
    } catch (error) {
      console.error('Error fetching ranking periods:', error)
      return []
    }
  },

  /** GET /api/ranking-periods/:periodId/series-rankings - Lấy bảng xếp hạng theo kỳ */
  getSeriesRankingsByPeriod: async (periodId: string): Promise<BackendSeriesRanking[]> => {
    try {
      const response = await api.get(`/api/ranking-periods/${periodId}/series-rankings`)
      return response.data.data?.data || response.data.data || []
    } catch (error) {
      console.error('Error fetching series rankings for period:', error)
      return []
    }
  },

  /** GET /api/rankings/public/series/top - Lấy danh sách xếp hạng series */
  getTopSeries: async (limit: number = 20, period_id?: string): Promise<BackendSeriesRanking[]> => {
    try {
      // 1. Lấy danh sách series published từ /api/series thay vì dựa vào series_ranking
      const res = await api.get('/api/series', { 
        params: { limit, sort: 'view_count', order: 'desc', status: 'published' } 
      });
      const seriesList = res.data?.data?.data || res.data?.data || [];
      
      const topSeries = seriesList.slice(0, limit);
      
      // 2. Map sang cấu trúc BackendSeriesRanking và gọi API để lấy totalLikes và totalViews
      const detailedSeriesPromises = topSeries.map(async (s: any, idx: number) => {
        try {
          const detail = await readerService.getSeriesDetail(s.series_id);
          const actualViews = detail?.totalViews || s.view_count || 0;
          return {
            series_ranking_id: s.series_id,
            period_id: period_id || 'all-time',
            series_id: s.series_id,
            rank_position: idx + 1,
            score: actualViews,
            total_vote: detail?.totalLikes || 0,
            created_at: new Date().toISOString(),
            series: {
              title: s.title,
              genre: s.genre,
              status: s.status,
              cover_image_url: s.cover_image_url,
              view_count: actualViews
            }
          };
        } catch (err) {
          return {
            series_ranking_id: s.series_id,
            period_id: period_id || 'all-time',
            series_id: s.series_id,
            rank_position: idx + 1,
            score: s.view_count || 0,
            total_vote: 0,
            created_at: new Date().toISOString(),
            series: {
              title: s.title,
              genre: s.genre,
              status: s.status,
              cover_image_url: s.cover_image_url,
              view_count: s.view_count || 0
            }
          };
        }
      });
      
      return await Promise.all(detailedSeriesPromises);
    } catch (error) {
      console.error('Error in fallback ranking', error);
      return [];
    }
  },

  /** Alias cho getTopSeries — dùng cho Dashboard widget */
  getWeekly: async (): Promise<RankingEntry[]> => {
    const response = await api.get('/api/rankings/public/series/top')
    return response.data.data ?? []
  },

  /** GET /api/rankings/series/:seriesId/trend - Lấy biến động/xu hướng của series */
  getSeriesTrend: async (seriesId: string): Promise<{
    series_id: string
    trend: Array<{
      period_id: string
      period_name: string
      rank: number
      score: number
      change: number
    }>
  }> => {
    const response = await api.get<{ success: boolean; data: any }>(
      `/api/rankings/series/${seriesId}/trend`
    )
    return response.data.data
  },

  /** GET /api/rankings/series/:seriesId/risk-analysis - Phân tích rủi ro series */
  checkSeriesRisk: async (seriesId: string): Promise<RiskAnalysis> => {
    const response = await api.get<{ success: boolean; data: RiskAnalysis }>(
      `/api/rankings/series/${seriesId}/risk-analysis`
    )
    return response.data.data
  },

  /** GET /api/notifications - Lấy danh sách thông báo để trích xuất cảnh báo rủi ro */
  getNotifications: async (): Promise<BackendNotification[]> => {
    const response = await api.get<{ success: boolean; data: BackendNotification[] }>(
      '/api/notifications'
    )
    return response.data.data ?? []
  },

  /** PATCH /api/notifications/:id/read - Đánh dấu thông báo đã đọc */
  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/api/notifications/${notificationId}/read`)
  },

  /** PATCH /api/notifications/:id/acknowledge - Xác nhận rủi ro từ Editor */
  acknowledgeReminder: async (notificationId: string): Promise<void> => {
    await api.patch(`/api/notifications/${notificationId}/acknowledge`)
  },

  /** PATCH /api/mangaka/notifications/mark-all-read - Đánh dấu tất cả thông báo đã đọc */
  markAllRead: async (): Promise<void> => {
    await api.patch('/api/mangaka/notifications/mark-all-read')
  },

  /** DELETE /api/notifications/:id - Xóa thông báo */
  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/api/notifications/${notificationId}`)
  },
}

export default rankingService
