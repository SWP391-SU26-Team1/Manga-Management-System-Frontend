import { adminDelete, adminList, adminPatch, adminPost } from './adminApi'
import type { PageRegion } from './admin.types'

export const adminPageRegionsService = {
  list: (params?: { page_id?: string; page?: number; limit?: number }) =>
    adminList<PageRegion>('/api/admin/page-regions', params),
  create: (body: Pick<PageRegion, 'page_id' | 'x' | 'y' | 'width' | 'height'>) =>
    adminPost<PageRegion>('/api/admin/page-regions', body),
  update: (regionId: string, body: Partial<Pick<PageRegion, 'x' | 'y' | 'width' | 'height'>>) =>
    adminPatch<PageRegion>(`/api/admin/page-regions/${regionId}`, body),
  delete: (regionId: string) => adminDelete(`/api/admin/page-regions/${regionId}`),
}
