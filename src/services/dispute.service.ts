import api from './api'

export interface DisputeOpinion {
  leaning: 'AUTHOR' | 'EDITOR' | 'COMPROMISE'
  reason: string
  submitted_at: string
}

export interface DisputeCaseDetail {
  id: string
  projectTitle: string
  issue: string
  authorName: string
  authorAvatar: string
  authorOpinion: string
  authorSketches: string[]
  editorName: string
  editorAvatar: string
  editorOpinion: string
  editorMetricLabel: string
  editorMetricValue: number
  editorMetricTarget: number
  status: 'PENDING' | 'DECIDED'
  chiefDecision?: 'AUTHOR' | 'EDITOR' | 'COMPROMISE'
  chiefCompromise?: string
  chiefNextActions?: string
  memberOpinion?: DisputeOpinion
}

export const disputeService = {
  // GET /api/disputes - Fetches lists of active and resolved disputes (maps to proposed DISPUTE_REPORT table)
  getAll: async (): Promise<DisputeCaseDetail[]> => {
    const response = await api.get<DisputeCaseDetail[]>('/api/disputes')
    return response.data
  },

  // GET /api/disputes/:caseId - Fetches details of a specific dispute
  getById: async (caseId: string): Promise<DisputeCaseDetail> => {
    const response = await api.get<DisputeCaseDetail>(`/api/disputes/${caseId}`)
    return response.data
  },

  // POST /api/disputes/:caseId/opinion - Submits Member Editor opinion on a dispute (maps to proposed DISPUTE_OPINION table)
  saveOpinion: async (caseId: string, leaning: string, reason: string): Promise<DisputeOpinion> => {
    const response = await api.post<DisputeOpinion>(`/api/disputes/${caseId}/opinion`, {
      leaning,
      reason
    })
    return response.data
  }
}

export default disputeService
