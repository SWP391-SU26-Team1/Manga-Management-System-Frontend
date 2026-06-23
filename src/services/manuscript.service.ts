import api from './api'
import { getErrorMessage } from './series.service'

export { getErrorMessage }

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ManuscriptAPI {
  _id: string
  mangaka_id: string
  series_id: string
  chapter_id?: string
  title?: string
  content?: string
  file_url?: string
  status: string
  created_at: string
  updated_at?: string
}

export interface CreateManuscriptPayload {
  mangaka_id: string
  series_id: string
  chapter_id?: string
  title?: string
  content?: string
  file_url?: string
  status?: string
}

export interface CreateManuscriptFilePayload {
  manuscript_id: string
  file_url: string
  file_name?: string
  file_type?: string
  description?: string
}

const mapManuscript = (data: any): ManuscriptAPI => {
  if (!data) return data
  return {
    _id: data.manuscript_id || data._id || '',
    mangaka_id: data.mangaka_id,
    series_id: data.series_id,
    chapter_id: data.chapter_id,
    title: data.title,
    content: data.content,
    file_url: data.file_url,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const manuscriptService = {
  /** GET /api/manuscripts?seriesId=... - Danh sách bản thảo của series */
  getBySeriesId: async (seriesId: string): Promise<ManuscriptAPI[]> => {
    const res = await api.get<{ success: boolean; data: any[] }>(`/api/manuscripts`, {
      params: { seriesId }
    })
    return (res.data.data ?? []).map(mapManuscript)
  },

  /** POST /api/manuscripts - Tạo manuscript mới */
  create: async (payload: CreateManuscriptPayload): Promise<ManuscriptAPI> => {
    const res = await api.post<{ success: boolean; data: any }>('/api/manuscripts', payload)
    return mapManuscript(res.data.data)
  },

  /** POST /api/manuscript-files - Thêm file đính kèm vào manuscript */
  addFile: async (payload: CreateManuscriptFilePayload): Promise<any> => {
    const res = await api.post<{ success: boolean; data: any }>('/api/manuscript-files', payload)
    return res.data.data
  },

  /** PATCH /api/manuscripts/:manuscriptId/submit - Nộp bản thảo lên Editor */
  submit: async (manuscriptId: string): Promise<ManuscriptAPI> => {
    const res = await api.patch<{ success: boolean; data: any }>(`/api/manuscripts/${manuscriptId}/submit`)
    return mapManuscript(res.data.data)
  },

  /** PATCH /api/mangaka/series/:seriesId/manuscripts/:manuscriptId/revise - Quay lại trạng thái nháp để sửa */
  revise: async (seriesId: string, manuscriptId: string): Promise<ManuscriptAPI> => {
    const res = await api.patch<{ success: boolean; data: any }>(
      `/api/mangaka/series/${seriesId}/manuscripts/${manuscriptId}/revise`
    )
    return mapManuscript(res.data.data)
  },

  /** PATCH /api/manuscripts/:manuscriptId - Cập nhật bản thảo */
  update: async (manuscriptId: string, payload: { title?: string; content?: string; file_url?: string }): Promise<ManuscriptAPI> => {
    const res = await api.patch<{ success: boolean; data: any }>(`/api/manuscripts/${manuscriptId}`, payload)
    return mapManuscript(res.data.data)
  },

  /** DELETE /api/manuscripts/:manuscriptId - Xóa bản thảo */
  delete: async (manuscriptId: string): Promise<void> => {
    await api.delete(`/api/manuscripts/${manuscriptId}`)
  }
}

export default manuscriptService
