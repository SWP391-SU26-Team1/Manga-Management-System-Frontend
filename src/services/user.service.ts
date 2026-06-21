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

  /**
   * GET /api/series-members and merge with seeding assistants
   */
  listAssistants: async (): Promise<UserProfileAPI[]> => {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>('/api/series-members')
      const members = res.data.data ?? []
      
      const assistantMap = new Map<string, UserProfileAPI>()
      members.forEach((m: any) => {
        if (m.users && m.users.role === 'assistant') {
          assistantMap.set(m.users.user_id, {
            id: m.users.user_id,
            username: m.users.username,
            email: m.users.email || '',
            role: 'ASSISTANT',
            fullName: m.users.name || m.users.username,
            avatarUrl: m.users.avatar_url || undefined,
          })
        }
      })

      const seedingAssistants = [
        { id: 'b11fbddd-0c1d-44e6-b07d-e2bebcee1d1e', username: 'TonyLee', fullName: 'TonyLee' },
        { id: '0ac0f439-a654-49fb-b283-19911b9165a4', username: 'assistant_shinpachi', fullName: 'Assistant Shinpachi' },
        { id: 'e52b8f6c-53de-4407-ba76-38eea13cf354', username: 'assistant_shinpachi2', fullName: 'Assistant Shinpachi 2' },
        { id: 'c1939a31-45b6-4bf8-bb02-61d4557f8a13', username: 'phuc', fullName: 'Phuc' },
      ]

      seedingAssistants.forEach(sa => {
        if (!assistantMap.has(sa.id)) {
          assistantMap.set(sa.id, {
            id: sa.id,
            username: sa.username,
            email: '',
            role: 'ASSISTANT',
            fullName: sa.fullName,
          })
        }
      })

      // Filter only valid RFC 4122 UUIDs to match backend Zod schema
      const rfc4122UuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
      return Array.from(assistantMap.values()).filter(a => rfc4122UuidRegex.test(a.id))
    } catch (err) {
      console.error('Failed to fetch assistants from series-members, falling back to seed list:', err)
      const fallbackList = [
        { id: 'b11fbddd-0c1d-44e6-b07d-e2bebcee1d1e', username: 'TonyLee', email: '', role: 'ASSISTANT', fullName: 'TonyLee' },
        { id: '0ac0f439-a654-49fb-b283-19911b9165a4', username: 'assistant_shinpachi', email: '', role: 'ASSISTANT', fullName: 'Assistant Shinpachi' },
        { id: 'e52b8f6c-53de-4407-ba76-38eea13cf354', username: 'assistant_shinpachi2', email: '', role: 'ASSISTANT', fullName: 'Assistant Shinpachi 2' },
        { id: 'c1939a31-45b6-4bf8-bb02-61d4557f8a13', username: 'phuc', email: '', role: 'ASSISTANT', fullName: 'Phuc' },
      ]
      const rfc4122UuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
      return fallbackList.filter(a => rfc4122UuidRegex.test(a.id))
    }
  },
}

export default userService
