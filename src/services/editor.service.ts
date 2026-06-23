import api from './api'

export interface EditorManuscript {
  manuscript_id: string
  mangaka_id: string
  series_id: string
  chapter_id?: string
  title?: string
  content?: string
  file_url?: string
  status: string
  created_at: string
  updated_at?: string
  series?: {
    series_id: string
    title: string
  }
  chapter?: {
    chapter_id: string
    chapter_number: number
    title: string
  }
  mangaka?: {
    user_id: string
    username: string
    name: string | null
  }
}

export const editorService = {
  /** GET /api/editor/review/manuscripts/pending - Lấy danh sách bản thảo chờ duyệt */
  getPendingManuscripts: async (): Promise<EditorManuscript[]> => {
    const res = await api.get<{ success: boolean; data: any[] }>('/api/editor/review/manuscripts/pending')
    return res.data.data ?? []
  },

  /** GET /api/editor/review/manuscripts/:manuscriptId/detail - Chi tiết bản thảo */
  getManuscriptDetail: async (manuscriptId: string): Promise<any> => {
    const res = await api.get<{ success: boolean; data: any }>(`/api/editor/review/manuscripts/${manuscriptId}/detail`)
    return res.data.data
  },

  /** PATCH /api/editor/manuscripts/:manuscriptId/start-review - Bắt đầu review bản thảo */
  startReview: async (manuscriptId: string): Promise<any> => {
    const res = await api.patch<{ success: boolean; data: any }>(`/api/editor/manuscripts/${manuscriptId}/start-review`, {})
    return res.data.data
  },

  /** PATCH /api/editor/manuscripts/:manuscriptId/approve - Phê duyệt bản thảo */
  approve: async (manuscriptId: string): Promise<any> => {
    const res = await api.patch<{ success: boolean; data: any }>(`/api/editor/manuscripts/${manuscriptId}/approve`, {})
    return res.data.data
  },

  /** PATCH /api/editor/manuscripts/:manuscriptId/reject - Bác bỏ bản thảo */
  reject: async (manuscriptId: string): Promise<any> => {
    const res = await api.patch<{ success: boolean; data: any }>(`/api/editor/manuscripts/${manuscriptId}/reject`, {})
    return res.data.data
  },

  /** PATCH /api/editor/manuscripts/:manuscriptId/request-revision - Yêu cầu chỉnh sửa bản thảo */
  requestRevision: async (manuscriptId: string, note?: string): Promise<any> => {
    const res = await api.patch<{ success: boolean; data: any }>(
      `/api/editor/manuscripts/${manuscriptId}/request-revision`,
      { note }
    )
    return res.data.data
  },

  /** POST /api/internal/notifications - Gửi thông báo nội bộ cho user */
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
