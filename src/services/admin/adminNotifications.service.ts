import { adminDelete, adminGet, adminList, adminPatch, adminPost } from './adminApi'
import type { Notification } from './admin.types'

export const adminNotificationsService = {
  getStats: () => adminGet('/api/dashboard/notifications'),
  list: (params?: { page?: number; limit?: number }) => adminList<Notification>('/api/notifications', params),
  getById: (notificationId: string) => adminGet<Notification>(`/api/notifications/${notificationId}`),
  create: (body: Pick<Notification, 'user_id' | 'title'> & Partial<Notification>) =>
    adminPost<Notification>('/api/notifications', body),
  update: (notificationId: string, body: Partial<Notification>) =>
    adminPatch<Notification>(`/api/notifications/${notificationId}`, body),
  delete: (notificationId: string) => adminDelete(`/api/notifications/${notificationId}`),
}
