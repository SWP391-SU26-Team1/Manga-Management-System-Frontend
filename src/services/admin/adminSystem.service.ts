import { adminGet } from './adminApi'

export const adminSystemService = {
  getHealth: () => adminGet('/api/admin/system-health'),
  getStorageUsage: () => adminGet('/api/admin/storage-usage'),
  exportUsers: () => adminGet('/api/admin/export/users'),
  exportRankings: () => adminGet('/api/admin/export/rankings'),
  exportFullSystem: () => adminGet('/api/admin/export/full-system'),
}
