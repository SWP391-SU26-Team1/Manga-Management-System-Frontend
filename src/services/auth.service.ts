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
  avatar_url?: string   // snake_case — actual backend field
  avatarUrl?: string    // camelCase fallback
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
  // Ưu tiên avatar_url (snake_case từ backend), fallback camelCase, sau đó pravatar
  avatarUrl: user.avatar_url || user.avatarUrl || `https://i.pravatar.cc/150?u=${user.username}`,
  bio: user.bio || '',
  stats: user.stats || { projectsCompleted: 0, activeProjects: 0 }
})


export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const normalizedPayload = {
      email: payload.email.toLowerCase().trim(),
      password: payload.password
    }
    const response = await api.post<BackendAuthResponse>('/api/auth/login', normalizedPayload)
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
    const normalizedPayload = {
      ...payload,
      email: payload.email.toLowerCase().trim()
    }
    const response = await api.post<BackendAuthResponse>('/api/auth/register', normalizedPayload)
    const { token, user } = response.data.data
    return {
      token,
      user: mapBackendUser(user)
    }
  },

  loginWithGoogle: async (idToken: string): Promise<AuthResponse> => {
    const response = await api.post<BackendAuthResponse>('/api/auth/login-google', { idToken })
    const { token, user } = response.data.data
    return {
      token,
      user: mapBackendUser(user)
    }
  },
}

export default authService

