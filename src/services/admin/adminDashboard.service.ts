import { adminGet, adminList } from './adminApi'
import type { ActivityLog, DashboardOverview, ReviewSession, TaskStats } from './admin.types'

export const adminDashboardService = {
  getOverview: () => adminGet<DashboardOverview>('/api/admin/dashboard/overview'),
  getTaskStats: () => adminGet<TaskStats>('/api/admin/dashboard/tasks'),
  getLatestReviewSessions: () => adminList<ReviewSession>('/api/admin/review-sessions', { page: 1, limit: 3 }),
  getActivityLogs: () => adminList<ActivityLog>('/api/admin/activity-logs', { page: 1, limit: 10 }),
  getSystemHealth: () => adminGet('/api/admin/system-health'),
  getStorageUsage: () => adminGet('/api/admin/storage-usage'),
}
