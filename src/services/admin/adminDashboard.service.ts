import { adminGet, adminList } from './adminApi'
import type {
  DashboardOverview,
  NotificationStats,
  RankingStats,
  ReviewSession,
  ReviewStats,
  SeriesStats,
  StorageUsage,
  SystemHealth,
  TaskStats,
  UserStats,
} from './admin.types'

export const adminDashboardService = {
  getOverview: () => adminGet<DashboardOverview>('/api/admin/dashboard/overview'),
  getUserStats: () => adminGet<UserStats>('/api/admin/dashboard/users'),
  getSeriesStats: () => adminGet<SeriesStats>('/api/admin/dashboard/series'),
  getTaskStats: () => adminGet<TaskStats>('/api/admin/dashboard/tasks'),
  getReviewStats: () => adminGet<ReviewStats>('/api/admin/dashboard/reviews'),
  getRankingStats: () => adminGet<RankingStats>('/api/admin/dashboard/rankings'),
  getNotificationStats: () => adminGet<NotificationStats>('/api/admin/dashboard/notifications'),
  getLatestReviewSessions: () => adminList<ReviewSession>('/api/admin/review-sessions', { page: 1, limit: 5 }),
  getSystemHealth: () => adminGet<SystemHealth>('/api/admin/system-health'),
  getStorageUsage: () => adminGet<StorageUsage>('/api/admin/storage-usage'),
}
