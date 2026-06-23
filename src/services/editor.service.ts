import api from './api'

// ==================== TYPES ====================

// Series
export interface ApiSeries {
  series_id: string
  title: string
  description: string
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'hidden' | 'archived' | 'deleted' | 'rejected' | 'banned'
  genre: string
  cover_image_url: string
  view_count: number
  created_at: string
}

// Chapter
export interface ApiChapter {
  chapter_id: string
  series_id: string
  title: string
  chapter_number: number
  status: string
  description?: string
  created_at?: string
}

// Page
export interface ApiPage {
  page_id: string
  chapter_id: string
  page_number: number
  image_url: string
  status: string
}

// Page Task
export interface ApiPageTask {
  task_id: string
  page_id: string
  task_type: string
  status: string
  title?: string
  description?: string
  assistant_id: string
  assignee?: { user_id: string; username: string }
  deadline: string
  created_at?: string
  // Nested from detail
  page?: ApiPage
  chapter?: ApiChapter
  series?: ApiSeries
}

// Annotation
export interface ApiAnnotation {
  annotation_id: string
  page_id?: string
  task_id?: string
  region_id?: string
  content: string
  coordinates: Record<string, number>
  status: 'open' | 'resolved' | 'dismissed'
  created_at?: string
  author?: { user_id: string; username: string }
}

// Manuscript
export interface ApiManuscript {
  manuscript_id: string
  series_id?: string
  chapter_id?: string
  title: string
  description?: string
  status: string
  created_at?: string
  series?: ApiSeries
  chapter?: ApiChapter
  files?: ApiManuscriptFile[]
  mangaka?: { user_id: string; username: string; name?: string }
}

// Manuscript File
export interface ApiManuscriptFile {
  file_id: string
  manuscript_id: string
  file_url: string
  file_name: string
  file_type: string
  file_size?: number
  status: string
}

// Review Session
export interface ApiReviewSession {
  session_id: string
  series_id?: string
  chapter_id?: string
  title: string
  name?: string
  description?: string
  status: string
  deadline?: string
  created_at?: string
  series?: ApiSeries
  chapter?: ApiChapter
}

// Vote
export interface ApiVote {
  vote_id: string
  session_id: string
  voter_id: string
  decision: string
  score: number
  note: string
  status: string
  voter?: { user_id: string; username: string }
}

// Feedback
export interface ApiFeedback {
  feedback_id: string
  submission_id: string
  content: string
  created_at?: string
  author?: { user_id: string; username: string }
  mangaka_id?: string
  assistant_id?: string
}

// Ranking
export interface ApiRankingEntry {
  series_id: string
  title: string
  rank: number
  score: number
  view_count?: number
  genre?: string
  series?: ApiSeries
}

// Ranking Period
export interface ApiRankingPeriod {
  period_id: string
  name: string
  start_date: string
  end_date: string
  status: string
}

// User
export interface ApiUser {
  user_id: string
  username: string
  email: string
  role: string
  status: string
}

// Dashboard Overview (schema may vary from backend)
export interface ApiEditorDashboard {
  [key: string]: any
}

// Alert
export interface ApiAlert {
  alert_id: string
  type: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  title: string
  series_id: string
  series_title: string
  detail: string
  time: string
  action?: string
  action_path?: string
  is_resolved: boolean
}

// Report
export interface ApiReport {
  report_id: string
  title: string
  type: 'MONTHLY' | 'CHAPTER' | 'ALERT'
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED'
  created_at: string
  updated_at: string
  series_count?: number
  content: string
}

// Proposal
export interface ApiProposal {
  proposal_id: string
  type: 'RECOVERY' | 'NEW_SERIES' | 'PUBLISH_CHAPTER' | 'SCHEDULE_CHANGE'
  series_title: string
  details: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
  metadata: any
  rejection_reason?: string | null
}

// Team Member
export interface ApiTeamMember {
  user_id: string
  name: string
  role: 'Mangaka' | 'Assistant'
  series_title: string
  series_id: string
  status: 'ACTIVE' | 'WARNING' | 'AT_RISK' | 'LATE' | 'IDLE'
  workload: number
  next_deadline: string
  avatar_url?: string | null
  performance_score?: number
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SingleResponse<T> {
  success: boolean
  data: T
}

// ==================== SERVICE ====================

export const editorService = {

  // ---------- Dashboard ----------
  getDashboardOverview: async () => {
    const res = await api.get('/api/editor/dashboard/overview')
    return res.data
  },

  getSeriesProgress: async (seriesId: string) => {
    const res = await api.get(`/api/editor/dashboard/series/${seriesId}/progress`)
    return res.data
  },

  getChapterProgress: async (chapterId: string) => {
    const res = await api.get(`/api/editor/dashboard/chapters/${chapterId}/progress`)
    return res.data
  },

  getTaskSummary: async () => {
    const res = await api.get('/api/editor/dashboard/tasks/summary')
    return res.data
  },

  getAssistantsWorkload: async () => {
    const res = await api.get('/api/editor/dashboard/assistants/workload')
    return res.data
  },

  getAssistantPerformance: async (id: string) => {
    const res = await api.get(`/api/editor/dashboard/assistants/${id}/performance`)
    return res.data
  },

  // ---------- Series ----------
  getSeries: async (params?: { status?: string; page?: number; limit?: number }) => {
    const res = await api.get('/api/editor/series', { params })
    return res.data
  },

  getSeriesById: async (seriesId: string) => {
    const res = await api.get(`/api/editor/series/${seriesId}`)
    return res.data
  },

  getSeriesDetail: async (seriesId: string) => {
    const res = await api.get(`/api/editor/series/${seriesId}/detail`)
    return res.data
  },

  updateSeries: async (seriesId: string, body: { title?: string; description?: string }) => {
    const res = await api.patch(`/api/editor/series/${seriesId}`, body)
    return res.data
  },

  updateSeriesStatus: async (seriesId: string, status: string) => {
    const res = await api.patch(`/api/editor/series/${seriesId}/status`, { status })
    return res.data
  },

  hideSeries: async (seriesId: string) => {
    const res = await api.patch(`/api/editor/series/${seriesId}/hide`)
    return res.data
  },

  archiveSeries: async (seriesId: string) => {
    const res = await api.patch(`/api/editor/series/${seriesId}/archive`)
    return res.data
  },

  republishSeries: async (seriesId: string) => {
    const res = await api.patch(`/api/editor/series/${seriesId}/republish`)
    return res.data
  },

  // ---------- Series Members ----------
  getSeriesMembers: async (seriesId: string) => {
    const res = await api.get(`/api/editor/series/${seriesId}/members`)
    return res.data
  },

  addSeriesMember: async (seriesId: string, body: { user_id: string; role_in_series?: string }) => {
    const res = await api.post(`/api/editor/series/${seriesId}/members`, body)
    return res.data
  },

  updateSeriesMember: async (seriesId: string, memberId: string, body: { role_in_series?: string }) => {
    const res = await api.patch(`/api/editor/series/${seriesId}/members/${memberId}`, body)
    return res.data
  },

  removeSeriesMember: async (seriesId: string, memberId: string) => {
    const res = await api.delete(`/api/editor/series/${seriesId}/members/${memberId}`)
    return res.data
  },

  // ---------- Chapters ----------
  getChapters: async (params?: { seriesId?: string; page?: number; limit?: number }) => {
    const res = await api.get('/api/chapters', { params })
    return res.data
  },

  getChapterDetail: async (chapterId: string) => {
    const res = await api.get(`/api/chapters/${chapterId}/detail`)
    return res.data
  },

  updateChapterStatus: async (chapterId: string, status: string) => {
    const res = await api.patch(`/api/chapters/${chapterId}/status`, { status })
    return res.data
  },

  // ---------- Pages ----------
  getPages: async (params?: { chapterId?: string; page?: number; limit?: number }) => {
    const res = await api.get('/api/pages', { params })
    return res.data
  },

  getPageDetail: async (pageId: string) => {
    const res = await api.get(`/api/pages/${pageId}/detail`)
    return res.data
  },

  updatePageStatus: async (pageId: string, status: string) => {
    const res = await api.patch(`/api/pages/${pageId}/status`, { status })
    return res.data
  },

  // ---------- Manuscripts ----------
  getManuscripts: async (params?: { seriesId?: string; chapterId?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get('/api/editor/review/manuscripts', { params })
    return res.data
  },

  getPendingManuscripts: async () => {
    const res = await api.get('/api/editor/review/manuscripts/pending')
    return res.data
  },

  getManuscriptById: async (manuscriptId: string) => {
    const res = await api.get(`/api/editor/review/manuscripts/${manuscriptId}`)
    return res.data
  },

  getManuscriptDetail: async (manuscriptId: string) => {
    const res = await api.get(`/api/editor/review/manuscripts/${manuscriptId}/detail`)
    return res.data
  },

  startManuscriptReview: async (manuscriptId: string) => {
    const res = await api.patch(`/api/editor/manuscripts/${manuscriptId}/start-review`)
    return res.data
  },

  approveManuscript: async (manuscriptId: string) => {
    const res = await api.patch(`/api/editor/manuscripts/${manuscriptId}/approve`)
    return res.data
  },

  rejectManuscript: async (manuscriptId: string) => {
    const res = await api.patch(`/api/editor/manuscripts/${manuscriptId}/reject`)
    return res.data
  },

  requestManuscriptRevision: async (manuscriptId: string) => {
    const res = await api.patch(`/api/editor/manuscripts/${manuscriptId}/request-revision`)
    return res.data
  },

  publishManuscript: async (manuscriptId: string) => {
    const res = await api.patch(`/api/editor/manuscripts/${manuscriptId}/publish`)
    return res.data
  },

  archiveManuscript: async (manuscriptId: string) => {
    const res = await api.patch(`/api/editor/manuscripts/${manuscriptId}/archive`)
    return res.data
  },

  overrideManuscriptStatus: async (manuscriptId: string, status: string) => {
    const res = await api.patch(`/api/editor/manuscripts/${manuscriptId}/override-status`, { status })
    return res.data
  },

  bulkApproveManuscripts: async (manuscriptIds: string[], note?: string) => {
    const res = await api.patch('/api/editor/manuscripts/bulk/approve', { manuscript_ids: manuscriptIds, note })
    return res.data
  },

  bulkRejectManuscripts: async (manuscriptIds: string[], note?: string) => {
    const res = await api.patch('/api/editor/manuscripts/bulk/reject', { manuscript_ids: manuscriptIds, note })
    return res.data
  },

  bulkUpdateManuscriptStatus: async (manuscriptIds: string[], status: string, note?: string) => {
    const res = await api.patch('/api/editor/manuscripts/bulk/status', { manuscript_ids: manuscriptIds, status, note })
    return res.data
  },

  // ---------- Manuscript Files ----------
  getManuscriptFiles: async (params?: { manuscriptId?: string }) => {
    const res = await api.get('/api/manuscript-files', { params })
    return res.data
  },

  // ---------- Page Tasks (Editor) ----------
  getEditorReviewTasks: async (params?: { status?: string; assistant_id?: string; series_id?: string }) => {
    const res = await api.get('/api/editor/review/page-tasks', { params })
    return res.data
  },

  getPendingReviewTasks: async () => {
    const res = await api.get('/api/editor/review/page-tasks/pending')
    return res.data
  },

  getReviewTaskDetail: async (taskId: string) => {
    const res = await api.get(`/api/editor/review/page-tasks/${taskId}/detail`)
    return res.data
  },

  startReviewTask: async (taskId: string) => {
    const res = await api.patch(`/api/editor/page-tasks/${taskId}/start-review`)
    return res.data
  },

  approveTask: async (taskId: string) => {
    const res = await api.patch(`/api/editor/page-tasks/${taskId}/approve`)
    return res.data
  },

  requestTaskRevision: async (taskId: string, content: string) => {
    const res = await api.patch(`/api/editor/page-tasks/${taskId}/request-revision`, { content })
    return res.data
  },

  rejectTask: async (taskId: string) => {
    const res = await api.patch(`/api/editor/page-tasks/${taskId}/reject`)
    return res.data
  },

  completeTask: async (taskId: string) => {
    const res = await api.patch(`/api/editor/page-tasks/${taskId}/complete`)
    return res.data
  },

  overrideTaskStatus: async (taskId: string, status: string) => {
    const res = await api.patch(`/api/editor/page-tasks/${taskId}/override-status`, { status })
    return res.data
  },

  bulkApproveTasks: async (taskIds: string[], note?: string) => {
    const res = await api.patch('/api/editor/page-tasks/bulk/approve', { task_ids: taskIds, note })
    return res.data
  },

  bulkRejectTasks: async (taskIds: string[], note?: string) => {
    const res = await api.patch('/api/editor/page-tasks/bulk/reject', { task_ids: taskIds, note })
    return res.data
  },

  bulkRequestTaskRevision: async (taskIds: string[], note?: string) => {
    const res = await api.patch('/api/editor/page-tasks/bulk/request-revision', { task_ids: taskIds, note })
    return res.data
  },

  bulkUpdateTaskStatus: async (taskIds: string[], status: string, note?: string) => {
    const res = await api.patch('/api/editor/page-tasks/bulk/status', { task_ids: taskIds, status, note })
    return res.data
  },

  // ---------- Page Tasks (General) ----------
  getPageTasks: async (params?: { pageId?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get('/api/page-tasks', { params })
    return res.data
  },

  getReviewTaskById: async (taskId: string) => {
    const res = await api.get(`/api/editor/review/page-tasks/${taskId}`)
    return res.data
  },

  getPageTaskById: async (taskId: string) => {
    const res = await api.get(`/api/page-tasks/${taskId}`)
    return res.data
  },

  // ---------- Annotations ----------
  getAnnotationsByPage: async (pageId: string, params?: { page?: number; limit?: number }) => {
    const res = await api.get(`/api/editor/pages/${pageId}/annotations`, { params })
    return res.data
  },

  getAnnotationsByRegion: async (regionId: string, params?: { page?: number; limit?: number }) => {
    const res = await api.get(`/api/editor/page-regions/${regionId}/annotations`, { params })
    return res.data
  },

  getAnnotationsByTask: async (taskId: string, params?: { page?: number; limit?: number }) => {
    const res = await api.get(`/api/editor/page-tasks/${taskId}/annotations`, { params })
    return res.data
  },

  getAnnotationById: async (annotationId: string) => {
    const res = await api.get(`/api/editor/annotations/${annotationId}`)
    return res.data
  },

  createAnnotation: async (pageId: string, body: { taskId?: string; regionId?: string; content: string; coordinates?: Record<string, number> }) => {
    const res = await api.post(`/api/editor/pages/${pageId}/annotations`, body)
    return res.data
  },

  updateAnnotation: async (annotationId: string, body: { content?: string; coordinates?: Record<string, number> }) => {
    const res = await api.patch(`/api/editor/annotations/${annotationId}`, body)
    return res.data
  },

  deleteAnnotation: async (annotationId: string) => {
    const res = await api.delete(`/api/editor/annotations/${annotationId}`)
    return res.data
  },

  updateAnnotationStatus: async (annotationId: string, status: 'open' | 'resolved' | 'dismissed') => {
    const res = await api.patch(`/api/editor/annotations/${annotationId}/status`, { status })
    return res.data
  },

  // ---------- Feedbacks ----------
  getFeedbacks: async (taskId?: string) => {
    const url = taskId ? `/api/editor/page-tasks/${taskId}/feedbacks` : '/api/editor/feedbacks'
    const res = await api.get(url)
    return res.data
  },

  getFeedbackById: async (feedbackId: string) => {
    const res = await api.get(`/api/page-task-feedbacks/${feedbackId}`)
    return res.data
  },

  createFeedback: async (taskId: string, body: { content: string; mangaka_id?: string; assistant_id?: string }) => {
    const res = await api.post(`/api/editor/page-tasks/${taskId}/feedbacks`, body)
    return res.data
  },

  updateFeedbackStatus: async (feedbackId: string, status: string) => {
    const res = await api.patch(`/api/editor/page-task-feedbacks/${feedbackId}/status`, { status })
    return res.data
  },

  updateFeedback: async (feedbackId: string, body: { content: string }) => {
    const res = await api.patch(`/api/editor/page-task-feedbacks/${feedbackId}`, body)
    return res.data
  },

  deleteFeedback: async (feedbackId: string) => {
    const res = await api.delete(`/api/editor/page-task-feedbacks/${feedbackId}`)
    return res.data
  },

  getSubmissionFeedbacks: async (submissionId: string) => {
    const res = await api.get(`/api/page-submissions/${submissionId}/feedbacks`)
    return res.data
  },

  // ---------- Review (Page Submissions) ----------
  getPendingSubmissions: async () => {
    const res = await api.get('/api/review/page-submissions/pending')
    return res.data
  },

  getSubmissionById: async (submissionId: string) => {
    const res = await api.get(`/api/review/page-submissions/${submissionId}`)
    return res.data
  },

  approveSubmission: async (submissionId: string) => {
    const res = await api.patch(`/api/review/page-submissions/${submissionId}/approve`)
    return res.data
  },

  rejectSubmission: async (submissionId: string) => {
    const res = await api.patch(`/api/review/page-submissions/${submissionId}/reject`)
    return res.data
  },

  requestSubmissionRevision: async (submissionId: string, content: string) => {
    const res = await api.patch(`/api/review/page-submissions/${submissionId}/request-revision`, { content })
    return res.data
  },

  // ---------- Review Sessions ----------
  getReviewSessions: async (params?: { seriesId?: string; chapterId?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get('/api/editor/review-sessions', { params })
    return res.data
  },

  getReviewSessionById: async (sessionId: string) => {
    const res = await api.get(`/api/editor/review-sessions/${sessionId}`)
    return res.data
  },

  getReviewSessionDetail: async (sessionId: string) => {
    const res = await api.get(`/api/editor/review-sessions/${sessionId}/detail`)
    return res.data
  },

  updateReviewSession: async (sessionId: string, body: { name?: string; description?: string }) => {
    const res = await api.patch(`/api/editor/review-sessions/${sessionId}`, body)
    return res.data
  },

  pauseReviewSession: async (sessionId: string) => {
    const res = await api.patch(`/api/editor/review-sessions/${sessionId}/pause`)
    return res.data
  },

  createEditorReviewSession: async (body: { series_id?: string; chapter_id?: string; name: string; description?: string }) => {
    const res = await api.post('/api/editor/review-sessions', body)
    return res.data
  },

  startReviewSession: async (sessionId: string) => {
    const res = await api.patch(`/api/editor/review-sessions/${sessionId}/start`)
    return res.data
  },

  completeReviewSession: async (sessionId: string) => {
    const res = await api.patch(`/api/editor/review-sessions/${sessionId}/complete`)
    return res.data
  },

  cancelReviewSession: async (sessionId: string) => {
    const res = await api.patch(`/api/editor/review-sessions/${sessionId}/cancel`)
    return res.data
  },

  finishReviewSession: async (sessionId: string) => {
    const res = await api.patch(`/api/editor/review-sessions/${sessionId}/finish`)
    return res.data
  },

  // ---------- Votes ----------
  getVotes: async (params?: { sessionId?: string; page?: number; limit?: number }) => {
    const res = await api.get('/api/votes', { params })
    return res.data
  },

  castVote: async (body: { sessionId: string; score: number; comment?: string }) => {
    const res = await api.post('/api/votes', body)
    return res.data
  },

  // ---------- Rankings ----------
  getTopSeriesRankings: async (params?: { period_id?: string; genre?: string; limit?: number }) => {
    const res = await api.get('/api/rankings/series/top', { params })
    return res.data
  },

  getTopChaptersRankings: async (params?: { period_id?: string; limit?: number }) => {
    const res = await api.get('/api/rankings/chapters/top', { params })
    return res.data
  },

  getRankingPeriods: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get('/api/ranking-periods', { params })
    return res.data
  },

  getRankingPeriodById: async (periodId: string) => {
    const res = await api.get(`/api/rankings/periods/${periodId}`)
    return res.data
  },

  createRankingPeriod: async (body: any) => {
    const res = await api.post('/api/rankings/periods', body)
    return res.data
  },

  updateRankingPeriod: async (periodId: string, body: any) => {
    const res = await api.patch(`/api/rankings/periods/${periodId}`, body)
    return res.data
  },

  updateRankingPeriodStatus: async (periodId: string, status: string) => {
    const res = await api.patch(`/api/rankings/periods/${periodId}/status`, { status })
    return res.data
  },

  calculateRankingPeriod: async (periodId: string) => {
    const res = await api.post(`/api/rankings/periods/${periodId}/calculate`)
    return res.data
  },

  recalculateRankingPeriod: async (periodId: string) => {
    const res = await api.post(`/api/rankings/periods/${periodId}/recalculate`)
    return res.data
  },

  getRankingPeriodSummary: async (periodId: string) => {
    const res = await api.get(`/api/rankings/periods/${periodId}/summary`)
    return res.data
  },

  exportRankingPeriod: async (periodId: string) => {
    const res = await api.get(`/api/rankings/periods/${periodId}/export`, { responseType: 'blob' })
    return res.data
  },

  getSeriesRankingTrend: async (seriesId: string) => {
    const res = await api.get(`/api/rankings/series/${seriesId}/trend`)
    return res.data
  },

  getSeriesRiskAnalysis: async (seriesId: string) => {
    const res = await api.get(`/api/rankings/series/${seriesId}/risk-analysis`)
    return res.data
  },

  getSeriesHistory: async (seriesId: string) => {
    const res = await api.get(`/api/rankings/series/${seriesId}/history`)
    return res.data
  },

  getChapterHistory: async (chapterId: string) => {
    const res = await api.get(`/api/rankings/chapters/${chapterId}/history`)
    return res.data
  },

  checkRiskAll: async () => {
    const res = await api.post('/api/rankings/check-risk-all')
    return res.data
  },

  sendRiskWarning: async (seriesId: string, body: any) => {
    const res = await api.post(`/api/rankings/series/${seriesId}/send-risk-warning`, body)
    return res.data
  },

  // ---------- Alerts ----------
  getAlerts: async (params?: { type?: string }) => {
    const res = await api.get('/api/editor/alerts', { params })
    return res.data
  },

  resolveAlert: async (alertId: string) => {
    const res = await api.patch(`/api/editor/alerts/${alertId}/resolve`)
    return res.data
  },

  // ---------- Reports ----------
  getReports: async (params?: { status?: string }) => {
    const res = await api.get('/api/editor/reports', { params })
    return res.data
  },

  createReport: async (body: { title: string; type: 'MONTHLY' | 'CHAPTER' | 'ALERT'; content: string }) => {
    const res = await api.post('/api/editor/reports', body)
    return res.data
  },

  updateReport: async (reportId: string, body: { title?: string; content?: string; status?: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' }) => {
    const res = await api.patch(`/api/editor/reports/${reportId}`, body)
    return res.data
  },

  submitReport: async (reportId: string) => {
    const res = await api.post(`/api/editor/reports/${reportId}/submit`)
    return res.data
  },

  // ---------- Proposals ----------
  getProposals: async (params?: { type?: string }) => {
    const res = await api.get('/api/editor/proposals', { params })
    return res.data
  },

  createProposal: async (body: {
    type: 'RECOVERY' | 'NEW_SERIES' | 'PUBLISH_CHAPTER' | 'SCHEDULE_CHANGE';
    series_title: string;
    details: string;
    metadata: any;
  }) => {
    const res = await api.post('/api/editor/proposals', body)
    return res.data
  },

  // Tantou submits a pending_review series to the Editorial Board (creates review_session)
  submitSeriesToBoard: async (seriesId: string) => {
    const res = await api.post(`/api/editor/series/${seriesId}/submit-to-board`)
    return res.data
  },

  // ---------- Team ----------
  getTeamMembers: async (params?: { role?: string }) => {
    const res = await api.get('/api/editor/team', { params })
    return res.data
  },

  createTeamMember: async (body: {
    user_id?: string;
    name: string;
    role: 'Mangaka' | 'Assistant';
    series_id: string;
    workload: number;
    next_deadline: string;
  }) => {
    const res = await api.post('/api/editor/team', body)
    return res.data
  },

  updateTeamMember: async (userId: string, body: {
    role?: 'Mangaka' | 'Assistant';
    series_id?: string;
    status?: string;
    workload?: number;
    next_deadline?: string;
  }) => {
    const res = await api.patch(`/api/editor/team/${userId}`, body)
    return res.data
  },

  deleteTeamMember: async (userId: string) => {
    const res = await api.delete(`/api/editor/team/${userId}`)
    return res.data
  },

  nudgeTeamMember: async (userId: string) => {
    const res = await api.post(`/api/editor/team/${userId}/nudge`)
    return res.data
  },

  createMeeting: async (body: {
    user_id: string;
    meeting_date: string;
    meeting_time: string;
    notes?: string;
  }) => {
    const res = await api.post('/api/editor/meetings', body)
    return res.data
  },

  // ---------- Notifications ----------
  getNotifications: async () => {
    const res = await api.get('/api/editor/notifications')
    return res.data
  },

  getUnreadNotifications: async () => {
    const res = await api.get('/api/editor/notifications/unread')
    return res.data
  },

  markAllNotificationsRead: async () => {
    const res = await api.patch('/api/editor/notifications/read-all')
    return res.data
  },

  markNotificationRead: async (notificationId: string) => {
    const res = await api.patch(`/api/editor/notifications/${notificationId}/read`)
    return res.data
  },

  deleteNotification: async (notificationId: string) => {
    const res = await api.delete(`/api/editor/notifications/${notificationId}`)
    return res.data
  },
  // ---------- Auth / Settings ----------
  getCurrentUser: async () => {
    const res = await api.get('/api/auth/me')
    return res.data
  },

  changePassword: async (body: { currentPassword: string; newPassword: string }) => {
    const res = await api.patch('/api/auth/change-password', body)
    return res.data
  },

  sendInternalNotification: async (userId: string, title: string, content: string, type: string): Promise<any> => {
    const res = await api.post('/api/internal/notifications', {
      user_id: userId,
      title,
      content,
      type
    }, {
      headers: {
        'x-internal-secret': 'change-me-to-a-strong-random-secret'
      }
    })
    return res.data
  }
}

export default editorService
