import { adminDelete, adminGet, adminList, adminPatch, adminPost } from './adminApi'
import type { User, UserRole, UserStatus } from './admin.types'

export type ListUsersParams = {
  role?: UserRole
  status?: UserStatus
  keyword?: string
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export const adminUsersService = {
  getStats: () => adminGet('/api/admin/dashboard/users'),
  list: (params?: ListUsersParams) => adminList<User>('/api/admin/users', params),
  getById: (userId: string) => adminGet<User>(`/api/admin/users/${userId}`),
  create: (body: Partial<User> & { username: string; email: string; password: string; role: UserRole }) =>
    adminPost<User>('/api/admin/users', body),
  update: (userId: string, body: Partial<User> & { password?: string }) =>
    adminPatch<User>(`/api/admin/users/${userId}`, body),
  updateStatus: (userId: string, status: UserStatus) =>
    adminPatch<User>(`/api/admin/users/${userId}/status`, { status }),
  updateRole: (userId: string, role: UserRole) =>
    adminPatch<User>(`/api/admin/users/${userId}/role`, { role }),
  delete: (userId: string) => adminDelete(`/api/admin/users/${userId}`),
}
