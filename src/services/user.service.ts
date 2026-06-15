import api from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfileAPI {
  id: string
  username: string
  email: string
  role: string
  fullName: string
  avatarUrl?: string
  bio?: string
  stats?: {
    followers?: number
    projectsCompleted?: number
    activeProjects?: number
    rating?: number
  }
  publications?: string[]
  skills?: string[]
}

interface BackendUser {
  user_id: string
  username: string
  email: string
  role: string
  name?: string
  full_name?: string
  avatar_url?: string
  avatarUrl?: string
  bio?: string
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

const mapUser = (u: BackendUser): UserProfileAPI => ({
  id: u.user_id,
  username: u.username,
  email: u.email,
  role: u.role ? u.role.toUpperCase() : 'MANGAKA',
  fullName: u.full_name || u.name || u.username,
  avatarUrl: u.avatar_url || u.avatarUrl || undefined,
  bio: u.bio || undefined,
})

// ─── Service ─────────────────────────────────────────────────────────────────

export const userService = {
  /**
   * GET /api/auth/me — lấy thông tin người dùng hiện tại từ token
   */
  getMe: async (): Promise<UserProfileAPI> => {
    const res = await api.get<{ success: boolean; data: BackendUser }>('/api/auth/me')
    return mapUser(res.data.data)
  },

  /**
   * GET /api/users/:userId — lấy thông tin người dùng theo ID
   */
  getUserById: async (userId: string): Promise<UserProfileAPI> => {
    const res = await api.get<{ success: boolean; data: BackendUser }>(`/api/users/${userId}`)
    return mapUser(res.data.data)
  },

  /**
   * PATCH /api/users/:userId — cập nhật hồ sơ người dùng
   */
  updateProfile: async (
    userId: string,
    payload: { name?: string; email?: string; bio?: string; avatar_url?: string }
  ): Promise<UserProfileAPI> => {
    const res = await api.patch<{ success: boolean; data: BackendUser }>(
      `/api/users/${userId}`,
      payload
    )
    return mapUser(res.data.data)
  },
}

export default userService
