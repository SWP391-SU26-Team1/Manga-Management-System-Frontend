import api from './api'

// Interfaces mapping to ERD and UI schemas
export interface ChapterPage {
  page_id: string
  chapter_id: string
  page_number: number
  image_url: string
  status: string
  width?: number
  height?: number
}

export interface BoardChapter {
  chapter_id: string
  series_id: string
  chapter_number: number
  title: string
  thumbnail_image_url?: string
  status: string
  publish_date?: string
}

export interface BoardComment {
  comment_id: string
  user_id: string
  chapter_id: string
  parent_comment_id?: string
  content: string
  created_at: string
  username?: string // joined from USER
  role?: string     // joined from USER
}

export interface GradePayload {
  chapter_id: string
  drawing: number
  pacing: number
  layout: number
  dialogue: number
  finish: number
  note: string
}

export interface VotePayload {
  chapter_id: string
  decision: 'APPROVE' | 'REJECT' | 'REVISE'
  note: string
}

export interface BackendSeriesVotePayload {
  series_id: string
  decision: 'APPROVE' | 'REJECT'
  note: string
}

export const boardService = {
  // GET /api/board/chapters - Fetches chapters waiting review (filtering status='BOARD_REVIEW' from CHAPTER table)
  getQueueChapters: async (): Promise<BoardChapter[]> => {
    const response = await api.get<BoardChapter[]>('/api/board/chapters')
    return response.data
  },

  // GET /api/board/pages/:chapterId - Fetches list of Pages for Chapter (maps to PAGE table)
  getChapterPages: async (chapterId: string): Promise<ChapterPage[]> => {
    const response = await api.get<ChapterPage[]>(`/api/chapters/${chapterId}/pages`)
    return response.data
  },

  // GET /api/board/tasks - Fetches checklist tasks (maps to PAGE_TASK table for Member Editor)
  getTodayTasks: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/api/board/tasks')
    return response.data
  },

  // POST /api/board/tasks/toggle/:id - Toggles task status in PAGE_TASK
  toggleTask: async (taskId: string): Promise<any> => {
    const response = await api.post(`/api/board/tasks/toggle/${taskId}`)
    return response.data
  },

  // GET /api/comments?chapter_id={chapterId} - Fetches comments for a chapter (maps to COMMENT table)
  getComments: async (chapterId: string): Promise<BoardComment[]> => {
    const response = await api.get<BoardComment[]>(`/api/comments`, {
      params: { chapter_id: chapterId }
    })
    return response.data
  },

  // POST /api/comments - Posts comment to chapter discussion (maps to COMMENT table)
  addComment: async (chapterId: string, content: string): Promise<BoardComment> => {
    const response = await api.post<BoardComment>('/api/comments', {
      chapter_id: chapterId,
      content
    })
    return response.data
  },

  // GET /api/board/grades/:chapterId - Fetches grade for chapter (corresponds to proposed CHAPTER_GRADE table)
  getGrade: async (chapterId: string): Promise<GradePayload> => {
    const response = await api.get<GradePayload>(`/api/board/grades/${chapterId}`)
    return response.data
  },

  // POST /api/board/grades - Saves scoring for a chapter (corresponds to proposed CHAPTER_GRADE table)
  saveGrade: async (grade: GradePayload): Promise<GradePayload> => {
    const response = await api.post<GradePayload>('/api/board/grades', grade)
    return response.data
  },

  // GET /api/board/votes/:chapterId - Fetches vote for chapter (corresponds to proposed CHAPTER_VOTE table)
  getVote: async (chapterId: string): Promise<VotePayload> => {
    const response = await api.get<VotePayload>(`/api/board/votes/${chapterId}`)
    return response.data
  },

  // POST /api/board/votes - Submits voting decision for a chapter (corresponds to proposed CHAPTER_VOTE table)
  saveVote: async (vote: VotePayload): Promise<VotePayload> => {
    const response = await api.post<VotePayload>('/api/board/votes', vote)
    return response.data
  },

  // GET /api/board/series - Fetches series waiting review (maps to SERIES and REVIEW_SESSION tables)
  getReviewedSeries: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/api/board/series')
    return response.data
  },

  // GET /api/board/series/:seriesId - Fetches details of a reviewed series
  getSeriesById: async (seriesId: string): Promise<any> => {
    const response = await api.get<any>(`/api/board/series/${seriesId}`)
    return response.data
  },

  // POST /api/board/series-votes - Submits voting decision for a series (corresponds to SERIES_VOTE table)
  saveSeriesVote: async (vote: BackendSeriesVotePayload): Promise<BackendSeriesVotePayload> => {
    const response = await api.post<BackendSeriesVotePayload>('/api/board/series-votes', vote)
    return response.data
  },

  // POST /api/board/chapters/:chapterId/decision - Chief final decision on Chapter
  saveChapterDecision: async (chapterId: string, status: string, percent: number): Promise<any> => {
    const response = await api.post(`/api/board/chapters/${chapterId}/decision`, { status, percent })
    return response.data
  },

  // POST /api/board/series/:seriesId/decision - Chief final decision on Series
  saveSeriesDecision: async (seriesId: string, status: string, note?: string): Promise<any> => {
    const response = await api.post(`/api/board/series/${seriesId}/decision`, { status, note })
    return response.data
  },

  // POST /api/board/sessions - Initiates a new council discussion session
  createBoardSession: async (sessionData: { sessionName: string; seriesIds: string[]; memberIds: string[]; deadline: string }): Promise<any> => {
    const response = await api.post('/api/board/sessions', sessionData)
    return response.data
  },

  // GET /api/board/recovery - Fetches active recovery plans
  getRecoveryPlans: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/api/board/recovery')
    return response.data
  },

  // POST /api/board/recovery/:planId/evaluate - Evaluates recovery plans
  evaluateRecoveryPlan: async (planId: string, action: string, note?: string): Promise<any> => {
    const response = await api.post(`/api/board/recovery/${planId}/evaluate`, { action, note })
    return response.data
  }
}

export default boardService
