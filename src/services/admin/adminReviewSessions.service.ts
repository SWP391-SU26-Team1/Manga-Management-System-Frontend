import { adminDelete, adminGet, adminList, adminPatch, adminPost } from './adminApi'
import type { ReviewSession, ReviewSessionStatus } from './admin.types'

export const adminReviewSessionsService = {
  list: (params?: { page?: number; limit?: number; status?: ReviewSessionStatus }) =>
    adminList<ReviewSession>('/api/admin/review-sessions', params),
  getById: (sessionId: string) => adminGet<ReviewSession>(`/api/admin/review-sessions/${sessionId}`),
  create: (body: Partial<ReviewSession> & { series_id: string }) => adminPost<ReviewSession>('/api/review-sessions', body),
  update: (sessionId: string, body: Partial<ReviewSession>) =>
    adminPatch<ReviewSession>(`/api/admin/review-sessions/${sessionId}`, body),
  updateStatus: (sessionId: string, status: ReviewSessionStatus) =>
    adminPatch<ReviewSession>(`/api/admin/review-sessions/${sessionId}/status`, { status }),
  delete: (sessionId: string) => adminDelete(`/api/admin/review-sessions/${sessionId}`),
}
