import api from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TaskType = 'inking' | 'coloring' | 'lettering' | 'cleaning' | 'sfx' | 'background'

/** Map từ label hiển thị trong UI sang task_type của API */
export const LAYER_TYPE_MAP: Record<string, TaskType> = {
  'Line Art': 'inking',
  'Background': 'background',
  'Panel Frame': 'inking',
  'Speech Balloon': 'lettering',
  'Screentone': 'coloring',
}

export interface TaskAPI {
  _id: string
  page_id: string
  chapter_id: string
  series_id: string
  assigned_to: string          // userId của assistant
  assigned_to_name?: string    // tên hiển thị của assistant
  task_type: TaskType
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  description: string
  status: string
  deadline?: string
  created_at?: string
  region_id?: string
}

export interface CreateTaskPayload {
  assigned_to: string
  task_type: TaskType
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  description: string
  deadline?: string
  region_id?: string
}

const mapTask = (data: any): TaskAPI => {
  if (!data) return data
  const assistantObj = data.assistant || data.users || data['users!fk_page_task_assistant']
  const assistantName = assistantObj ? (assistantObj.name || assistantObj.username || '') : ''
  return {
    _id: data.task_id || data._id || '',
    page_id: data.page_id,
    chapter_id: data.chapter_id,
    series_id: data.series_id,
    assigned_to: data.assistant_id || data.assigned_to || '',
    assigned_to_name: assistantName,
    task_type: data.task_type,
    priority: data.priority || 'Medium',
    description: data.content || data.description || '',
    status: data.status,
    deadline: data.deadline,
    created_at: data.created_at,
    region_id: data.region_id,
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const taskService = {
  /** GET tasks cho một page cụ thể */
  getByPage: async (
    seriesId: string,
    chapterId: string,
    pageId: string
  ): Promise<TaskAPI[]> => {
    const res = await api.get<{ success: boolean; data: any[] }>(
      `/api/pages/${pageId}/tasks`
    )
    return (res.data.data ?? []).map(mapTask)
  },

  /** POST tạo task mới cho một page */
  create: async (
    seriesId: string,
    chapterId: string,
    pageId: string,
    payload: CreateTaskPayload
  ): Promise<TaskAPI> => {
    const mappedPayload = {
      task_type: payload.task_type,
      assistant_id: payload.assigned_to || null,
      region_id: payload.region_id || null,
      deadline: payload.deadline ? new Date(payload.deadline).toISOString() : undefined,
      content: payload.description,
    }
    const res = await api.post<{ success: boolean; data: any }>(
      `/api/mangaka/series/${seriesId}/chapters/${chapterId}/pages/${pageId}/tasks`,
      mappedPayload
    )
    return mapTask(res.data.data)
  },

  /** DELETE xóa task */
  delete: async (
    seriesId: string,
    chapterId: string,
    pageId: string,
    taskId: string
  ): Promise<void> => {
    await api.delete(
      `/api/mangaka/series/${seriesId}/chapters/${chapterId}/pages/${pageId}/tasks/${taskId}`
    )
  },

  /** GET /api/page-tasks - lấy tất cả task hệ thống với các bộ lọc */
  getAllTasks: async (filters?: { status?: string; limit?: number; page?: number }): Promise<any[]> => {
    const res = await api.get<{ success: boolean; data: any[] }>('/api/page-tasks', {
      params: filters,
    })
    return res.data.data ?? []
  },

  /** PATCH approve task qua endpoint của mangaka */
  approveTask: async (
    seriesId: string,
    chapterId: string,
    pageId: string,
    taskId: string
  ): Promise<any> => {
    const res = await api.patch<{ success: boolean; data: any }>(
      `/api/mangaka/series/${seriesId}/chapters/${chapterId}/pages/${pageId}/tasks/${taskId}/approve`
    )
    return res.data.data
  },

  /** POST yêu cầu chỉnh sửa task kèm feedback qua endpoint của mangaka */
  requestRevision: async (
    seriesId: string,
    chapterId: string,
    pageId: string,
    taskId: string,
    payload: { feedback_content: string; feedback_type?: string }
  ): Promise<any> => {
    const res = await api.post<{ success: boolean; data: any }>(
      `/api/mangaka/series/${seriesId}/chapters/${chapterId}/pages/${pageId}/tasks/${taskId}/request-revision`,
      payload
    )
    return res.data.data
  },
}

export default taskService
