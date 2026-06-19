import api from './api'

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
  /** GET /api/board/rankings/series/top - Lấy danh sách xếp hạng series (board prefix) */
  getTopSeries: async (limit: number = 20): Promise<BackendSeriesRanking[]> => {
    const response = await api.get<{ success: boolean; data: BackendSeriesRanking[] }>(
      '/api/board/rankings/series/top',
      { params: { limit } }
    )
    return response.data.data ?? []
  },

  /** Alias cho getTopSeries — dùng cho Dashboard widget */
  getWeekly: async (): Promise<RankingEntry[]> => {
    const response = await api.get('/api/board/rankings/series/top')
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
