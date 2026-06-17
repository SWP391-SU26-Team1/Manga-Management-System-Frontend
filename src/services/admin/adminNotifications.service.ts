import { adminDelete, adminGet, adminList, adminPatch, adminPost } from './adminApi'
import type { Notification } from './admin.types'

export const adminNotificationsService = {
  getStats: () => adminGet('/api/admin/dashboard/notifications'),
  list: (params?: { page?: number; limit?: number }) => adminList<Notification>('/api/admin/notifications', params),
  getById: (notificationId: string) => adminGet<Notification>(`/api/admin/notifications/${notificationId}`),
  create: (body: Pick<Notification, 'user_id' | 'title'> & Partial<Notification>) =>
    adminPost<Notification>('/api/admin/notifications', body),
  update: (notificationId: string, body: Partial<Notification>) =>
    adminPatch<Notification>(`/api/admin/notifications/${notificationId}`, body),
  delete: (notificationId: string) => adminDelete(`/api/admin/notifications/${notificationId}`),
}
