import api from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SeriesAPI {
  _id: string
  title: string
  description: string
  genre?: string
  cover_image?: string | null
  status: string
  view_count?: number
  created_at: string
  updated_at?: string
}

export interface CreateSeriesPayload {
  title: string
  description: string
  genre?: string
  cover_image?: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Lấy message lỗi thân thiện từ axios error */
export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string } } }).response
    if (res?.data?.message) return res.data.message
  }
  return 'Có lỗi xảy ra, vui lòng thử lại.'
}

const mapSeries = (data: any): SeriesAPI => {
  if (!data) return data
  return {
    _id: data.series_id || data._id || '',
    title: data.title,
    description: data.description,
    genre: data.genre,
    cover_image: data.cover_image_url || data.cover_image || null,
    status: data.status,
    view_count: data.view_count,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const seriesService = {
  /** GET /api/mangaka/series — danh sách series của mangaka hiện tại */
  getAll: async (): Promise<SeriesAPI[]> => {
    const res = await api.get<{ success: boolean; data: any[] }>('/api/mangaka/series')
    return (res.data.data ?? []).map(mapSeries)
  },

  /** GET /api/mangaka/series/:seriesId */
  getById: async (seriesId: string): Promise<SeriesAPI> => {
    const res = await api.get<{ success: boolean; data: any }>(`/api/mangaka/series/${seriesId}`)
    return mapSeries(res.data.data)
  },

  /** POST /api/mangaka/series — tạo series mới */
  create: async (payload: CreateSeriesPayload): Promise<SeriesAPI> => {
    const mappedPayload = {
      title: payload.title,
      description: payload.description,
      genre: payload.genre,
      cover_image_url: payload.cover_image || null,
    }
    const res = await api.post<{ success: boolean; data: any }>('/api/mangaka/series', mappedPayload)
    return mapSeries(res.data.data)
  },

  /** PATCH /api/mangaka/series/:seriesId/submit-review — nộp series lên board */
  submitReview: async (seriesId: string): Promise<SeriesAPI> => {
    const res = await api.patch<{ success: boolean; data: any }>(
      `/api/mangaka/series/${seriesId}/submit-review`
    )
    return mapSeries(res.data.data)
  },

  /** GET /api/mangaka/series/:seriesId/members — lấy danh sách thành viên dự án */
  getMembers: async (seriesId: string): Promise<any[]> => {
    const res = await api.get<{ success: boolean; data: any[] }>(
      `/api/mangaka/series/${seriesId}/members`
    )
    return res.data.data ?? []
  },
}

export default seriesService
