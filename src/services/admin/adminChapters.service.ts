import { adminDelete, adminGet, adminList, adminPatch, adminPost } from './adminApi'
import type { Chapter, ChapterDetail, ChapterStatus, EntityStats } from './admin.types'

export const adminChaptersService = {
  getStats: () => adminGet<EntityStats<ChapterStatus>>('/api/admin/dashboard/chapters'),
  list: (params?: { status?: ChapterStatus; keyword?: string; series_id?: string; page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc' }) =>
    adminList<Chapter>('/api/admin/chapters', params),
  getById: (chapterId: string) => adminGet<Chapter>(`/api/chapters/${chapterId}`),
  getDetail: (chapterId: string) => adminGet<ChapterDetail>(`/api/chapters/${chapterId}/detail`),
  create: (body: Partial<Chapter> & { series_id: string; chapter_number: number }) =>
    adminPost<Chapter>('/api/chapters', body),
  update: (chapterId: string, body: Partial<Chapter>) => adminPatch<Chapter>(`/api/chapters/${chapterId}`, body),
  updateStatus: (chapterId: string, status: ChapterStatus) =>
    adminPatch<Chapter>(`/api/admin/chapters/${chapterId}/status`, { status }),
  delete: (chapterId: string) => adminDelete(`/api/admin/chapters/${chapterId}`),
}
