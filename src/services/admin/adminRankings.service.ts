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
  listPeriods: () => adminList<RankingPeriod>('/api/admin/ranking-periods'),
  getPeriod: (periodId: string) => adminGet<RankingPeriod>(`/api/admin/ranking-periods/${periodId}`),
  createPeriod: (body: Omit<RankingPeriod, 'period_id'>) => adminPost<RankingPeriod>('/api/admin/ranking-periods', body),
  updatePeriod: (periodId: string, body: Partial<RankingPeriod>) =>
    adminPatch<RankingPeriod>(`/api/admin/ranking-periods/${periodId}`, body),
  updatePeriodStatus: (periodId: string, status: RankingPeriodStatus) =>
    adminPatch<RankingPeriod>(`/api/admin/ranking-periods/${periodId}/status`, { status }),
  deletePeriod: (periodId: string) => adminDelete(`/api/admin/ranking-periods/${periodId}`),

  listSeriesRankings: () => adminList<SeriesRanking>('/api/admin/series-rankings'),
  createSeriesRanking: (body: Omit<SeriesRanking, 'series_ranking_id'>) =>
    adminPost<SeriesRanking>('/api/admin/series-rankings', body),
  updateSeriesRanking: (rankingId: string, body: Partial<SeriesRanking>) =>
    adminPatch<SeriesRanking>(`/api/admin/series-rankings/${rankingId}`, body),
  deleteSeriesRanking: (rankingId: string) => adminDelete(`/api/admin/series-rankings/${rankingId}`),

  listChapterRankings: () => adminList<ChapterRanking>('/api/admin/chapter-rankings'),
  createChapterRanking: (body: Omit<ChapterRanking, 'chapter_ranking_id'>) =>
    adminPost<ChapterRanking>('/api/admin/chapter-rankings', body),
  updateChapterRanking: (rankingId: string, body: Partial<ChapterRanking>) =>
    adminPatch<ChapterRanking>(`/api/admin/chapter-rankings/${rankingId}`, body),
  deleteChapterRanking: (rankingId: string) => adminDelete(`/api/admin/chapter-rankings/${rankingId}`),
}
