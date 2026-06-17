import { adminDelete, adminGet, adminList, adminPatch, adminPost } from './adminApi'
import type { RankingPeriodStatus } from './admin.types'

export type RankingPeriod = {
  period_id: string
  name: string
  period_type?: string
  start_date: string
  end_date: string
  calculated_at?: string
  status?: RankingPeriodStatus
}

export type SeriesRanking = {
  series_ranking_id: string
  period_id: string
  series_id: string
  rank_position?: number
  score?: number
  total_vote?: number
}

export type ChapterRanking = {
  chapter_ranking_id: string
  period_id: string
  series_id: string
  chapter_id: string
  rank_position?: number
  score?: number
  total_vote?: number
}

export const adminRankingsService = {
  getStats: () => adminGet('/api/dashboard/rankings'),
  listPeriods: (params?: { page?: number; limit?: number }) => adminList<RankingPeriod>('/api/ranking-periods', params),
  getPeriod: (periodId: string) => adminGet<RankingPeriod>(`/api/ranking-periods/${periodId}`),
  createPeriod: (body: Omit<RankingPeriod, 'period_id'>) => adminPost<RankingPeriod>('/api/ranking-periods', body),
  updatePeriod: (periodId: string, body: Partial<RankingPeriod>) =>
    adminPatch<RankingPeriod>(`/api/ranking-periods/${periodId}`, body),
  updatePeriodStatus: (periodId: string, status: RankingPeriodStatus) =>
    adminPatch<RankingPeriod>(`/api/ranking-periods/${periodId}/status`, { status }),
  deletePeriod: (periodId: string) => adminDelete(`/api/ranking-periods/${periodId}`),

  listSeriesRankings: (params?: { page?: number; limit?: number }) => adminList<SeriesRanking>('/api/series-rankings', params),
  createSeriesRanking: (body: Omit<SeriesRanking, 'series_ranking_id'>) =>
    adminPost<SeriesRanking>('/api/series-rankings', body),
  updateSeriesRanking: (rankingId: string, body: Partial<SeriesRanking>) =>
    adminPatch<SeriesRanking>(`/api/series-rankings/${rankingId}`, body),
  deleteSeriesRanking: (rankingId: string) => adminDelete(`/api/series-rankings/${rankingId}`),

  listChapterRankings: (params?: { page?: number; limit?: number }) => adminList<ChapterRanking>('/api/chapter-rankings', params),
  createChapterRanking: (body: Omit<ChapterRanking, 'chapter_ranking_id'>) =>
    adminPost<ChapterRanking>('/api/chapter-rankings', body),
  updateChapterRanking: (rankingId: string, body: Partial<ChapterRanking>) =>
    adminPatch<ChapterRanking>(`/api/chapter-rankings/${rankingId}`, body),
  deleteChapterRanking: (rankingId: string) => adminDelete(`/api/chapter-rankings/${rankingId}`),
}
