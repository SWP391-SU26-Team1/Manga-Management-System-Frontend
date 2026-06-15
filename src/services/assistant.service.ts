import api from './api'

// ─── Interfaces ──────────────────────────────────────────────────────────────

export type TaskStatus = 'assigned' | 'in_progress' | 'submitted' | 'needs_revision' | 'completed' | 'cancelled' | 'rejected'
export type TaskType = 'inking' | 'coloring' | 'lettering' | 'cleaning' | 'sfx' | 'background'
export type PriorityType = 'Low' | 'Medium' | 'High' | 'Urgent'

export interface PageTask {
  task_id: string
  page_id: string
  assistant_id: string | null
  assigned_by: string
  task_type: TaskType
  status: TaskStatus
  priority: PriorityType
  description: string
  deadline: string
  created_at: string
  updated_at: string
  page?: {
    page_id: string
    page_number: number
    image_url: string | null
    chapter?: {
      chapter_id: string
      title: string
      series?: {
        series_id: string
        title: string
      }
    }
  }
  users?: {
    user_id: string
    username: string
    email: string
    name?: string
  }
}

export interface PageTaskDetail extends PageTask {
  regions: any[]
  annotations: any[]
  feedbacks: PageTaskFeedback[]
}

export interface PageTaskFeedback {
  feedback_id: string
  task_id?: string
  submission_id?: string | null
  assistant_id: string | null
  mangaka_id: string | null
  content: string // actual text content
  feedback_content?: string // fallback
  feedback_type?: string
  status?: string
  created_at: string
}

export interface AssistantSubmission {
  submission_id: string
  task_id: string
  assistant_id: string
  file_url: string
  submission_notes: string | null
  status: 'pending' | 'approved' | 'needs_revision' | 'rejected'
  created_at: string
  updated_at: string
}

export interface DashboardOverview {
  assistant_id: string
  total_tasks: number
  assigned?: number
  in_progress?: number
  submitted?: number
  needs_revision?: number
  completed?: number
  cancelled?: number
  rejected?: number
  overdue_tasks: number
}

export interface DashboardPerformance {
  assistant_id: string
  total_tasks: number
  completed_tasks: number
  overdue_tasks: number
  completion_rate_pct: number
  avg_completion_hours: number | null
}

export interface PerformanceBreakdownItem {
  task_id: string
  status: TaskStatus
  task_type: TaskType
  deadline: string
  series_title?: string
  chapter_title?: string
}

export interface PerformanceBySeriesItem {
  series_id: string
  title: string
  total: number
  completed: number
}

export interface PerformanceByChapterItem {
  chapter_id: string
  title: string
  total: number
  completed: number
}

export interface AssistantNotification {
  notification_id: string
  user_id: string
  title: string
  content: string
  type: string
  is_read: boolean
  created_at: string
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const assistantService = {
  // --- Page Tasks ---
  listMyTasks: async (filters?: {
    status?: string
    task_type?: string
    deadline_before?: string
    overdue?: string
    page?: number
    limit?: number
  }): Promise<{ success: boolean; data: PageTask[]; pagination?: any }> => {
    const res = await api.get('/api/assistant/page-tasks', { params: filters })
    return res.data
  },

  getTaskById: async (taskId: string): Promise<PageTask> => {
    const res = await api.get<{ success: boolean; data: PageTask }>(`/api/assistant/page-tasks/${taskId}`)
    return res.data.data
  },

  getTaskDetail: async (taskId: string): Promise<PageTaskDetail> => {
    const res = await api.get<{ success: boolean; data: PageTaskDetail }>(`/api/assistant/page-tasks/${taskId}/detail`)
    return res.data.data
  },

  startTask: async (taskId: string): Promise<PageTask> => {
    const res = await api.patch<{ success: boolean; data: PageTask }>(`/api/assistant/page-tasks/${taskId}/start`)
    return res.data.data
  },

  submitTaskWorkflow: async (taskId: string, content?: string): Promise<PageTask> => {
    const res = await api.patch<{ success: boolean; data: PageTask }>(`/api/assistant/page-tasks/${taskId}/submit`, { content })
    return res.data.data
  },

  resubmitTaskWorkflow: async (taskId: string, content?: string): Promise<PageTask> => {
    const res = await api.patch<{ success: boolean; data: PageTask }>(`/api/assistant/page-tasks/${taskId}/resubmit`, { content })
    return res.data.data
  },

  holdTaskWorkflow: async (taskId: string): Promise<PageTask> => {
    const res = await api.patch<{ success: boolean; data: PageTask }>(`/api/assistant/page-tasks/${taskId}/hold`)
    return res.data.data
  },

  // --- Submissions ---
  createSubmission: async (
    taskId: string,
    payload: { file_url: string; submission_notes?: string }
  ): Promise<AssistantSubmission> => {
    const res = await api.post<{ success: boolean; data: AssistantSubmission }>(
      `/api/assistant/page-tasks/${taskId}/submissions`,
      payload
    )
    return res.data.data
  },

  listTaskSubmissions: async (taskId: string): Promise<AssistantSubmission[]> => {
    const res = await api.get<{ success: boolean; data: AssistantSubmission[] }>(
      `/api/assistant/page-tasks/${taskId}/submissions`
    )
    return res.data.data
  },

  getSubmissionById: async (submissionId: string): Promise<AssistantSubmission> => {
    const res = await api.get<{ success: boolean; data: AssistantSubmission }>(
      `/api/assistant/page-submissions/${submissionId}`
    )
    return res.data.data
  },

  // --- Feedbacks on submissions ---
  listSubmissionFeedbacks: async (submissionId: string): Promise<PageTaskFeedback[]> => {
    const res = await api.get<{ success: boolean; data: PageTaskFeedback[] }>(
      `/api/assistant/page-submissions/${submissionId}/feedbacks`
    )
    return res.data.data
  },

  createSubmissionFeedback: async (submissionId: string, content: string): Promise<PageTaskFeedback> => {
    const res = await api.post<{ success: boolean; data: PageTaskFeedback }>(
      `/api/assistant/page-submissions/${submissionId}/feedbacks`,
      { content }
    )
    return res.data.data
  },

  // --- Dashboard & Performance ---
  getOverview: async (): Promise<DashboardOverview> => {
    const res = await api.get<{ success: boolean; data: DashboardOverview }>('/api/assistant/dashboard/overview')
    return res.data.data
  },

  getPerformance: async (): Promise<DashboardPerformance> => {
    const res = await api.get<{ success: boolean; data: DashboardPerformance }>('/api/assistant/dashboard/performance')
    return res.data.data
  },

  getBreakdown: async (): Promise<PerformanceBreakdownItem[]> => {
    const res = await api.get<{ success: boolean; data: PerformanceBreakdownItem[] }>('/api/assistant/performance/breakdown')
    return res.data.data
  },

  getBySeries: async (): Promise<PerformanceBySeriesItem[]> => {
    const res = await api.get<{ success: boolean; data: PerformanceBySeriesItem[] }>('/api/assistant/performance/by-series')
    return res.data.data
  },

  getByChapter: async (): Promise<PerformanceByChapterItem[]> => {
    const res = await api.get<{ success: boolean; data: PerformanceByChapterItem[] }>('/api/assistant/performance/by-chapter')
    return res.data.data
  },

  // --- Notifications ---
  listNotifications: async (filters?: { is_read?: boolean; page?: number; limit?: number }): Promise<{ success: boolean; data: AssistantNotification[]; pagination?: any }> => {
    const res = await api.get('/api/assistant/notifications', { params: filters })
    return res.data
  },

  getUnreadNotifications: async (): Promise<{ count: number; items: AssistantNotification[] }> => {
    const res = await api.get<{ success: boolean; data: { count: number; items: AssistantNotification[] } }>('/api/assistant/notifications/unread')
    return res.data.data
  },

  markRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/api/assistant/notifications/${notificationId}/read`)
  },

  markAllRead: async (): Promise<void> => {
    await api.patch('/api/assistant/notifications/read-all')
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/api/assistant/notifications/${notificationId}`)
  },
}

export default assistantService
