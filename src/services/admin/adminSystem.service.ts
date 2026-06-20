import api from '@/services/api'
import { adminGet, adminList, unwrapAdminResponse } from './adminApi'
import type { ActivityLog } from './admin.types'

export type ImportResult = {
  imported?: number
  skipped?: number
  errors?: string[]
  [key: string]: unknown
}

const importFile = async (url: string, file: File): Promise<ImportResult> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return unwrapAdminResponse<ImportResult>(response.data)
}

export const adminSystemService = {
  getActivityLogs: (params?: { page?: number; limit?: number }) => adminList<ActivityLog>('/api/admin/activity-logs', params),
  getStorageUsage: () => adminGet('/api/admin/storage-usage'),
  getTrustScore: () => adminGet('/api/admin/trust-score'),
  getHealth: () => adminGet('/api/admin/system-health'),
  exportFullSystem: () => adminGet('/api/admin/export/full-system'),
  importUsers: (file: File) => importFile('/api/admin/import/users', file),
  importSeries: (file: File) => importFile('/api/admin/import/series', file),
}
