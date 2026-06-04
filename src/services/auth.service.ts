import api from './api'

export interface LoginPayload {
  identifier: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    username: string
    email: string
    role: string
    fullName: string
  }
  token: string
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', payload)
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout')
    localStorage.removeItem('mangaflow_user')
  },

  register: async (payload: { username: string; email: string; password: string; role: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', payload)
    return response.data
  },
}

export default authService
