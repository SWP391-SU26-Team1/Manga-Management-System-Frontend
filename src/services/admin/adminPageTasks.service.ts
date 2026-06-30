import { adminDelete, adminGet, adminList, adminPatch, adminPost } from './adminApi'
import type { PageTask, PageTaskStatus } from './admin.types'

export const adminPageTasksService = {
  list: (params?: { status?: PageTaskStatus; page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc' }) =>
    adminList<PageTask>('/api/admin/page-tasks', params),
  getById: (taskId: string) => adminGet<PageTask>(`/api/admin/page-tasks/${taskId}`),
  create: (body: Partial<PageTask> & { page_id: string; task_type: string }) =>
    adminPost<PageTask>('/api/page-tasks', body),
  update: (taskId: string, body: Partial<PageTask>) =>
    adminPatch<PageTask>(`/api/admin/page-tasks/${taskId}`, body),
  updateStatus: (taskId: string, status: PageTaskStatus) =>
    adminPatch<PageTask>(`/api/admin/page-tasks/${taskId}/status`, { status }),
  delete: (taskId: string) => adminDelete(`/api/admin/page-tasks/${taskId}`),
}
