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
  period?: Pick<RankingPeriod, 'period_id' | 'name' | 'status'> | null
  series?: { series_id: string; title: string; cover_image_url?: string | null } | null
}

export type ChapterRanking = {
  chapter_ranking_id: string
  period_id: string
  series_id: string
  chapter_id: string
  rank_position?: number
  score?: number
  total_vote?: number
  period?: Pick<RankingPeriod, 'period_id' | 'name' | 'status'> | null
  series?: { series_id: string; title: string } | null
  chapter?: { chapter_id: string; chapter_number: number; title?: string | null } | null
}

export const adminRankingsService = {
  getStats: () => adminGet('/api/admin/dashboard/rankings'),
  listPeriods: (params?: { status?: RankingPeriodStatus; page?: number; limit?: number }) => adminList<RankingPeriod>('/api/admin/ranking-periods', params),
  getPeriod: (periodId: string) => adminGet<RankingPeriod>(`/api/admin/ranking-periods/${periodId}`),
  createPeriod: (body: Omit<RankingPeriod, 'period_id'>) => adminPost<RankingPeriod>('/api/admin/ranking-periods', body),
  updatePeriod: (periodId: string, body: Partial<RankingPeriod>) =>
    adminPatch<RankingPeriod>(`/api/admin/ranking-periods/${periodId}`, body),
  updatePeriodStatus: (periodId: string, status: RankingPeriodStatus) =>
    adminPatch<RankingPeriod>(`/api/admin/ranking-periods/${periodId}/status`, { status }),
  deletePeriod: (periodId: string) => adminDelete(`/api/admin/ranking-periods/${periodId}`),

  listSeriesRankings: (params?: { page?: number; limit?: number }) => adminList<SeriesRanking>('/api/admin/series-rankings', params),
  createSeriesRanking: (body: Omit<SeriesRanking, 'series_ranking_id'>) =>
    adminPost<SeriesRanking>('/api/admin/series-rankings', body),
  updateSeriesRanking: (rankingId: string, body: Partial<SeriesRanking>) =>
    adminPatch<SeriesRanking>(`/api/admin/series-rankings/${rankingId}`, body),
  deleteSeriesRanking: (rankingId: string) => adminDelete(`/api/admin/series-rankings/${rankingId}`),

  listChapterRankings: (params?: { page?: number; limit?: number }) => adminList<ChapterRanking>('/api/admin/chapter-rankings', params),
  createChapterRanking: (body: Omit<ChapterRanking, 'chapter_ranking_id'>) =>
    adminPost<ChapterRanking>('/api/admin/chapter-rankings', body),
  updateChapterRanking: (rankingId: string, body: Partial<ChapterRanking>) =>
    adminPatch<ChapterRanking>(`/api/admin/chapter-rankings/${rankingId}`, body),
  deleteChapterRanking: (rankingId: string) => adminDelete(`/api/admin/chapter-rankings/${rankingId}`),
}
