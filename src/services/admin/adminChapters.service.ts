import { adminDelete, adminGet, adminList, adminPatch, adminPost } from './adminApi'
import type { Chapter, ChapterStatus } from './admin.types'

export const adminChaptersService = {
  list: (params?: { status?: ChapterStatus; keyword?: string; page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc' }) =>
    adminList<Chapter>('/api/chapters', params),
  getById: (chapterId: string) => adminGet<Chapter>(`/api/chapters/${chapterId}`),
  create: (body: Partial<Chapter> & { series_id: string; chapter_number: number }) =>
    adminPost<Chapter>('/api/chapters', body),
  update: (chapterId: string, body: Partial<Chapter>) => adminPatch<Chapter>(`/api/chapters/${chapterId}`, body),
  updateStatus: (chapterId: string, status: ChapterStatus) =>
    adminPatch<Chapter>(`/api/chapters/${chapterId}/status`, { status }),
  delete: (chapterId: string) => adminDelete(`/api/chapters/${chapterId}`),
}
