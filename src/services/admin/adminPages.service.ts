import { adminDelete, adminGet, adminList, adminPatch, adminPost } from './adminApi'
import type { Page, PageStatus } from './admin.types'

export const adminPagesService = {
  list: (params?: { status?: PageStatus; page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc' }) =>
    adminList<Page>('/api/admin/pages', params),
  getById: (pageId: string) => adminGet<Page>(`/api/admin/pages/${pageId}`),
  create: (body: Partial<Page> & { chapter_id: string; page_number: number }) => adminPost<Page>('/api/pages', body),
  update: (pageId: string, body: Partial<Page>) => adminPatch<Page>(`/api/pages/${pageId}`, body),
  updateStatus: (pageId: string, status: PageStatus) =>
    adminPatch<Page>(`/api/admin/pages/${pageId}/status`, { status }),
  retryOcr: (pageId: string) => adminPost<Page>(`/api/admin/pages/${pageId}/retry-ocr`),
  delete: (pageId: string) => adminDelete(`/api/admin/pages/${pageId}`),
}
