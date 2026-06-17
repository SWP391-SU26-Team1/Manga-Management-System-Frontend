import { adminGet, adminList } from './adminApi'
import type { ActivityLog, DashboardOverview, ReviewSession, TaskStats } from './admin.types'

export const adminDashboardService = {
  getOverview: () => adminGet<DashboardOverview>('/api/admin/dashboard/overview'),
  getUserStats: () => adminGet('/api/admin/dashboard/users'),
  getSeriesStats: () => adminGet('/api/admin/dashboard/series'),
  getTaskStats: () => adminGet<TaskStats>('/api/admin/dashboard/tasks'),
  getReviewStats: () => adminGet('/api/admin/dashboard/reviews'),
  getRankingStats: () => adminGet('/api/admin/dashboard/rankings'),
  getNotificationStats: () => adminGet('/api/admin/dashboard/notifications'),
  getLatestReviewSessions: () => adminList<ReviewSession>('/api/admin/review-sessions', { page: 1, limit: 3 }),
  getActivityLogs: () => adminList<ActivityLog>('/api/activity-logs', { page: 1, limit: 10 }),
  getSystemHealth: () => adminGet('/api/system-health'),
  getStorageUsage: () => adminGet('/api/storage-usage'),
}
