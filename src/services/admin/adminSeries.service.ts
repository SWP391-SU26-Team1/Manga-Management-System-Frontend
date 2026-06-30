import { adminDelete, adminGet, adminList, adminPatch, adminPost } from './adminApi'
import type { Series, SeriesDetail, SeriesStats, SeriesStatus } from './admin.types'

export type ListSeriesParams = {
  status?: SeriesStatus
  genre?: string
  keyword?: string
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export const adminSeriesService = {
  getStats: () => adminGet<SeriesStats>('/api/admin/dashboard/series'),
  list: (params?: ListSeriesParams) => adminList<Series>('/api/series', params),
  getById: (seriesId: string) => adminGet<Series>(`/api/series/${seriesId}`),
  getDetail: (seriesId: string) => adminGet<SeriesDetail>(`/api/series/${seriesId}/detail`),
  create: (body: Partial<Series> & { title: string }) => adminPost<Series>('/api/series', body),
  update: (seriesId: string, body: Partial<Series>) => adminPatch<Series>(`/api/series/${seriesId}`, body),
  updateStatus: (seriesId: string, status: SeriesStatus) =>
    adminPatch<Series>(`/api/admin/series/${seriesId}/status`, { status }),
  delete: (seriesId: string) => adminDelete(`/api/admin/series/${seriesId}`),
}
