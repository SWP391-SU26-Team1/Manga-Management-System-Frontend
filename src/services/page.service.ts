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
    return (res.data.data ?? [])
      .filter((p: any) => p.status !== 'deleted')
      .map(mapPage)
  },

  /** POST /api/mangaka/series/:seriesId/chapters/:chapterId/pages/bulk */
  bulkCreate: async (
    seriesId: string,
    chapterId: string,
    pages: { image_url: string; page_number?: number }[]
  ): Promise<PageAPI[]> => {
    const res = await api.post<{ success: boolean; data: any[] }>(
      `/api/mangaka/series/${seriesId}/chapters/${chapterId}/pages/bulk`,
      { pages }
    )
    return (res.data.data ?? []).map(mapPage)
  },

  /** DELETE /api/mangaka/series/:seriesId/chapters/:chapterId/pages/:pageId */
  delete: async (
    seriesId: string,
    chapterId: string,
    pageId: string
  ): Promise<void> => {
    await api.delete(
      `/api/mangaka/series/${seriesId}/chapters/${chapterId}/pages/${pageId}`
    )
  },

  /** PATCH /api/mangaka/series/:seriesId/chapters/:chapterId/pages/:pageId */
  update: async (
    seriesId: string,
    chapterId: string,
    pageId: string,
    payload: { image_url: string }
  ): Promise<PageAPI> => {
    const res = await api.patch<{ success: boolean; data: any }>(
      `/api/mangaka/series/${seriesId}/chapters/${chapterId}/pages/${pageId}`,
      payload
    )
    return mapPage(res.data.data)
  },

  /** GET /api/pages/:pageId - Lấy thông tin cơ bản một Page */
  getPageById: async (pageId: string): Promise<PageAPI> => {
    const res = await api.get<{ success: boolean; data: any }>(`/api/pages/${pageId}`)
    return mapPage(res.data.data)
  },

  /** GET /api/pages/:pageId/detail - Lấy chi tiết Page kèm regions, tasks, annotations */
  getPageDetail: async (pageId: string): Promise<any> => {
    const res = await api.get<{ success: boolean; data: any }>(`/api/pages/${pageId}/detail`)
    return res.data.data
  },
}

export default pageService
