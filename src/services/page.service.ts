import api from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageAPI {
  _id: string
  chapter_id: string
  page_number: number
  status: string
  image_url?: string | null
  created_at?: string
}

const mapPage = (data: any): PageAPI => {
  if (!data) return data
  return {
    _id: data.page_id || data._id || '',
    chapter_id: data.chapter_id,
    page_number: data.page_number,
    status: data.status,
    image_url: data.image_url,
    created_at: data.created_at,
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const pageService = {
  /** GET /api/chapters/:chapterId/pages */
  getByChapterId: async (chapterId: string): Promise<PageAPI[]> => {
    const res = await api.get<{ success: boolean; data: any[] }>(
      `/api/chapters/${chapterId}/pages`
    )
    return (res.data.data ?? []).map(mapPage)
  },
}

export default pageService
