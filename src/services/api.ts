import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Allow the browser to send and receive HttpOnly cookies (refresh token)
  withCredentials: true,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStoredUser = (): { token?: string } | null => {
  try {
    const raw = localStorage.getItem('mangaflow_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const clearSession = () => {
  localStorage.removeItem('mangaflow_user')
}

const updateStoredToken = (token: string) => {
  try {
    const raw = localStorage.getItem('mangaflow_user')
    if (raw) {
      const user = JSON.parse(raw)
      localStorage.setItem('mangaflow_user', JSON.stringify({ ...user, token }))
    }
  } catch {
    // ignore
  }
}

// Track whether we are currently refreshing to prevent concurrent refresh calls
let isRefreshing = false
let failedQueue: Array<{ resolve: (value: string) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  failedQueue = []
}

// ─── Request Interceptor ──────────────────────────────────────────────────────

// Attach the latest Access Token from localStorage to every outgoing request
api.interceptors.request.use((config) => {
  const user = getStoredUser()
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

// ─── Response Interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only intercept 401 errors that have not been retried yet
    // Also skip the /refresh endpoint itself to avoid infinite loops
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh') &&
      !originalRequest.url?.includes('/api/auth/login')
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request and wait for the new token
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Call refresh endpoint — the HttpOnly cookie is sent automatically
        const { data } = await api.post<{ success: boolean; data: { token: string } }>(
          '/api/auth/refresh'
        )
        const newToken = data.data.token

        // Persist updated token in localStorage
        updateStoredToken(newToken)

        // Update the authorization header for the failed request and retry it
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)

        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed — the session is truly expired; force logout
        processQueue(refreshError, null)
        clearSession()
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register'
        ) {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
