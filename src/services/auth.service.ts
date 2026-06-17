import api from './api'

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
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
  }
  token: string
}

interface BackendUser {
  user_id: string
  username: string
  email: string
  role: string
  name?: string
  avatarUrl?: string
  bio?: string
  stats?: any
}

interface BackendAuthResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: BackendUser
  }
}

const mapBackendUser = (user: BackendUser) => ({
  id: user.user_id,
  username: user.username,
  email: user.email,
  role: user.role.toUpperCase(), // e.g. "mangaka" -> "MANGAKA"
  fullName: user.name || user.username,
  avatarUrl: user.avatarUrl || `https://i.pravatar.cc/150?u=${user.username}`,
  bio: user.bio || `Mô tả về ${user.username}.`,
  stats: user.stats || { projectsCompleted: 0, activeProjects: 0 }
})

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<BackendAuthResponse>('/api/auth/login', payload)
    const { token, user } = response.data.data
    return {
      token,
      user: mapBackendUser(user)
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // Ignored if API logout fails, we still clean up client-side
    } finally {
      localStorage.removeItem('mangaflow_user')
    }
  },

  register: async (payload: { username: string; email: string; password: string; role: string }): Promise<AuthResponse> => {
    const response = await api.post<BackendAuthResponse>('/api/auth/register', payload)
    const { token, user } = response.data.data
    return {
      token,
      user: mapBackendUser(user)
    }
  },
}

export default authService

