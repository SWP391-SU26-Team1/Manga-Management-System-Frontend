import api from './api'

export interface BackendFeedback {
  feedback_id: string
  submission_id: string
  mangaka_id: string | null
  assistant_id: string | null
  content: string
  created_at: string
  status?: string
  mangaka?: {
    user_id: string
    username: string
    name: string | null
  } | null
  assistant?: {
    user_id: string
    username: string
    name: string | null
  } | null
  submission?: {
    submission_id: string
    submission_status: string
    version_number: number
    page?: {
      page_number: number
      chapter?: {
        chapter_number: number
        series?: {
          title: string
        }
      }
    }
  } | null
}

export const feedbackService = {
  /** GET /api/page-task-feedbacks - Lấy tất cả feedback */
  getAll: async (): Promise<BackendFeedback[]> => {
    const res = await api.get<{ success: boolean; data: BackendFeedback[] }>('/api/page-task-feedbacks')
    return res.data.data ?? []
  },

  /** GET /api/review/page-submissions/:submissionId - Lấy chi tiết submission */
  getSubmissionDetail: async (submissionId: string): Promise<any> => {
    const res = await api.get<{ success: boolean; data: any }>(`/api/review/page-submissions/${submissionId}`)
    return res.data.data
  },

  /** PATCH /api/page-task-feedbacks/:feedbackId - Cập nhật nội dung feedback (Dùng để trả lời) */
  reply: async (feedbackId: string, content: string): Promise<BackendFeedback> => {
    const res = await api.patch<{ success: boolean; data: BackendFeedback }>(
      `/api/page-task-feedbacks/${feedbackId}`,
      { content }
    )
    return res.data.data
  },

  /** DELETE /api/page-task-feedbacks/:feedbackId - Xóa feedback (Đánh dấu đã giải quyết) */
  delete: async (feedbackId: string): Promise<void> => {
    await api.delete(`/api/page-task-feedbacks/${feedbackId}`)
  },
}

export default feedbackService
