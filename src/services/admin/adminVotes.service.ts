import { adminDelete, adminGet, adminList, adminPatch, adminPost } from './adminApi'
import type { Vote, VoteStatus } from './admin.types'

export const adminVotesService = {
  list: (params?: { page?: number; limit?: number }) => adminList<Vote>('/api/votes', params),
  getById: (voteId: string) => adminGet<Vote>(`/api/votes/${voteId}`),
  create: (body: Partial<Vote> & { voter_id: string }) => adminPost<Vote>('/api/votes', body),
  update: (voteId: string, body: Partial<Vote>) => adminPatch<Vote>(`/api/votes/${voteId}`, body),
  updateStatus: (voteId: string, status: VoteStatus) =>
    adminPatch<Vote>(`/api/votes/${voteId}/status`, { status }),
  delete: (voteId: string) => adminDelete(`/api/votes/${voteId}`),
}
