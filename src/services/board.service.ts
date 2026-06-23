import api from './api'

export interface BoardChapter {
  chapter_id: string
  series_id: string
  chapter_number: number
  title: string
  thumbnail_image_url?: string
  status: string
  publish_date?: string
}

export interface VotePayload {
  chapter_id?: string
  decision: 'APPROVE' | 'REJECT' | 'REVISE'
  note: string
  score?: number
}

export const boardService = {
  // --- 1. PROPOSALS / REVIEW SESSIONS ---
  getProposals: async (page = 1, limit = 10): Promise<any> => {
    const response = await api.get(`/api/board/proposals?page=${page}&limit=${limit}`)
    return response.data
  },

  getPendingProposals: async (): Promise<any[]> => {
    const response = await api.get('/api/board/proposals/pending')
    return response.data.data || []
  },

  getProposalById: async (sessionId: string): Promise<any> => {
    const response = await api.get(`/api/board/proposals/${sessionId}`)
    return response.data.data || response.data
  },

  getProposalDetail: async (sessionId: string): Promise<any> => {
    const response = await api.get(`/api/board/proposals/${sessionId}/detail`)
    return response.data.data || response.data
  },

  getProposalManuscripts: async (sessionId: string): Promise<any[]> => {
    const response = await api.get(`/api/board/proposals/${sessionId}/manuscripts`)
    return response.data.data || []
  },

  getProposalFiles: async (sessionId: string): Promise<any[]> => {
    const response = await api.get(`/api/board/proposals/${sessionId}/files`)
    return response.data.data || []
  },

  // --- 2. MANUSCRIPTS & DOCUMENTS ---
  getChapterManuscripts: async (chapterId: string): Promise<any[]> => {
    const response = await api.get(`/api/board/chapters/${chapterId}/manuscripts`)
    return response.data.data || []
  },

  getSeriesManuscripts: async (seriesId: string): Promise<any[]> => {
    const response = await api.get(`/api/board/series/${seriesId}/manuscripts`)
    return response.data.data || []
  },

  getManuscriptFiles: async (manuscriptId: string): Promise<any[]> => {
    const response = await api.get(`/api/board/manuscripts/${manuscriptId}/files`)
    return response.data.data || []
  },

  getPendingManuscripts: async (): Promise<any[]> => {
    const response = await api.get('/api/board/manuscripts/pending')
    return response.data.data || []
  },

  applyManuscriptDecision: async (manuscriptId: string, status: string, note?: string): Promise<any> => {
    const action = status.toLowerCase() === 'approved' || status.toLowerCase() === 'approve' ? 'approve' : 'reject'
    const response = await api.patch(`/api/board/manuscripts/${manuscriptId}/${action}`, { note })
    return response.data
  },

  // --- 3. VOTES ---
  getVote: async (sessionId: string): Promise<any[]> => {
    const response = await api.get(`/api/board/review-sessions/${sessionId}/votes`)
    return response.data.data || []
  },

  getVoteById: async (voteId: string): Promise<any> => {
    const response = await api.get(`/api/board/votes/${voteId}`)
    return response.data.data || response.data
  },

  saveVote: async (sessionId: string, vote: VotePayload): Promise<any> => {
    const response = await api.post(`/api/board/review-sessions/${sessionId}/votes`, vote)
    return response.data
  },

  updateVote: async (voteId: string, voteData: any): Promise<any> => {
    const response = await api.patch(`/api/board/votes/${voteId}`, voteData)
    return response.data
  },

  updateVoteStatus: async (voteId: string, status: string): Promise<any> => {
    const response = await api.patch(`/api/board/votes/${voteId}/status`, { status })
    return response.data
  },

  deleteVote: async (voteId: string): Promise<any> => {
    const response = await api.delete(`/api/board/votes/${voteId}`)
    return response.data
  },

  // --- 4. PROCESS RESULTS & DECISIONS ---
  processReviewSessionResult: async (sessionId: string, resultData: any): Promise<any> => {
    const response = await api.post(`/api/board/review-sessions/${sessionId}/process-result`, resultData)
    return response.data
  },

  applyChapterDecision: async (chapterId: string, status: string, note?: string): Promise<any> => {
    const action = status.toLowerCase() === 'approved' || status.toLowerCase() === 'approve' ? 'approve' : 'reject'
    const response = await api.patch(`/api/board/chapters/${chapterId}/${action}`, { note })
    return response.data
  },

  applySeriesDecision: async (seriesId: string, status: string, note?: string): Promise<any> => {
    const action = status.toLowerCase() === 'approved' || status.toLowerCase() === 'approve' ? 'approve' : 'reject'
    const response = await api.patch(`/api/board/series/${seriesId}/${action}`, { note })
    return response.data
  },

  updateSeriesBoardStatus: async (seriesId: string, action: 'publish' | 'archive' | 'hide' | 'ban'): Promise<any> => {
    const response = await api.patch(`/api/board/series/${seriesId}/${action}`)
    return response.data
  },

  updateChapterBoardStatus: async (chapterId: string, action: 'publish' | 'archive' | 'hide' | 'ban'): Promise<any> => {
    const response = await api.patch(`/api/board/chapters/${chapterId}/${action}`)
    return response.data
  },

  // --- 5. DECISION HISTORY ---
  getSeriesDecisionHistory: async (seriesId: string): Promise<any[]> => {
    const response = await api.get(`/api/board/series/${seriesId}/decision-history`)
    return response.data.data || []
  },

  getChapterDecisionHistory: async (chapterId: string): Promise<any[]> => {
    const response = await api.get(`/api/board/chapters/${chapterId}/decision-history`)
    return response.data.data || []
  },

  getReviewSessionHistory: async (sessionId: string): Promise<any[]> => {
    const response = await api.get(`/api/board/review-sessions/${sessionId}/history`)
    return response.data.data || []
  },

  // --- 6. RANKINGS ---
  getRankingPeriods: async (): Promise<any[]> => {
    const response = await api.get('/api/board/ranking-periods')
    return response.data.data || []
  },

  getSeriesRankings: async (): Promise<any[]> => {
    const response = await api.get('/api/board/series-rankings')
    return response.data.data || []
  },

  getChapterRankings: async (): Promise<any[]> => {
    const response = await api.get('/api/board/chapter-rankings')
    return response.data.data || []
  },

  getRankingPeriodById: async (periodId: string): Promise<any> => {
    const response = await api.get(`/api/board/ranking-periods/${periodId}`)
    return response.data.data || response.data
  },

  getSeriesRankingHistory: async (seriesId: string): Promise<any[]> => {
    const response = await api.get(`/api/board/rankings/series/${seriesId}/history`)
    return response.data.data || []
  },

  getChapterRankingHistory: async (chapterId: string): Promise<any[]> => {
    const response = await api.get(`/api/board/rankings/chapters/${chapterId}/history`)
    return response.data.data || []
  },

  // --- 7. NOTIFICATIONS ---
  getBoardNotifications: async (): Promise<any[]> => {
    const response = await api.get('/api/board/notifications')
    return response.data.data || []
  },

  getUnreadNotifications: async (): Promise<any[]> => {
    const response = await api.get('/api/board/notifications/unread')
    return response.data.data || []
  },

  markNotificationRead: async (id: string): Promise<any> => {
    const response = await api.patch(`/api/board/notifications/${id}/read`)
    return response.data
  },

  markAllNotificationsRead: async (): Promise<any> => {
    const response = await api.patch('/api/board/notifications/read-all')
    return response.data
  },

  deleteNotification: async (id: string): Promise<any> => {
    const response = await api.delete(`/api/board/notifications/${id}`)
    return response.data
  },

  sendNotification: async (notificationData: any): Promise<any> => {
    // Note: requires admin role in backend
    const response = await api.post('/api/board/notifications/decision-result', notificationData)
    return response.data
  },

  sendProposalApprovedNotification: async (data: any): Promise<any> => {
    const response = await api.post('/api/board/notifications/proposal-approved', data)
    return response.data
  },

  sendProposalRejectedNotification: async (data: any): Promise<any> => {
    const response = await api.post('/api/board/notifications/proposal-rejected', data)
    return response.data
  },

  // --- 8. MISC PENDING ITEMS ---
  getQueueChapters: async (): Promise<BoardChapter[]> => {
    const response = await api.get('/api/board/chapters/pending')
    return response.data.data || []
  },

  // Only returns series that have been through Tantou review (have an active review_session)
  // Uses getPendingProposals logic via proposals endpoint, not raw series status
  getReviewedSeries: async (): Promise<any[]> => {
    // Get series that already passed board vote (approved status)
    const response = await api.get('/api/series?status=approved')
    return response.data.data || []
  },

  getSeriesById: async (seriesId: string): Promise<any> => {
    const response = await api.get(`/api/series/${seriesId}`)
    return response.data.data || response.data
  }
}

export default boardService
