import api from './api'

export interface RecoveryProposalAPI {
  proposal_id: string
  series_id: string
  created_by_user_id: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at?: string
}

export interface CreateRecoveryProposalPayload {
  title: string
  description: string
}

export const recoveryProposalService = {
  /**
   * GET /api/mangaka/series/:seriesId/recovery-proposals
   * Lấy danh sách các đề xuất cứu vãn của Mangaka cho một series cụ thể
   */
  listProposals: async (seriesId: string): Promise<RecoveryProposalAPI[]> => {
    const res = await api.get<{ success: boolean; data: RecoveryProposalAPI[] }>(
      `/api/mangaka/series/${seriesId}/recovery-proposals`
    )
    return res.data.data ?? []
  },

  /**
   * POST /api/mangaka/series/:seriesId/recovery-proposals
   * Gửi đề xuất cứu vãn mới cho series
   */
  createProposal: async (
    seriesId: string,
    payload: CreateRecoveryProposalPayload
  ): Promise<RecoveryProposalAPI> => {
    const res = await api.post<{ success: boolean; data: RecoveryProposalAPI }>(
      `/api/mangaka/series/${seriesId}/recovery-proposals`,
      payload
    )
    return res.data.data
  },
}

export default recoveryProposalService
