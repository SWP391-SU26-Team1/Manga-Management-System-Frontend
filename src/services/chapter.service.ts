import api from './api'
import { getErrorMessage } from './series.service'

export { getErrorMessage }

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChapterAPI {
  _id: string
  series_id: string
  title: string
  chapter_number: number
  status: string
  created_at: string
  updated_at?: string
}

export interface CreateChapterPayload {
  title: string
  chapter_number: number
}

const mapChapter = (data: any): ChapterAPI => {
  if (!data) return data
  return {
    _id: data.chapter_id || data._id || '',
    series_id: data.series_id,
    title: data.title,
    chapter_number: data.chapter_number,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const chapterService = {
  /** GET /api/mangaka/series/:seriesId/chapters */
  getBySeriesId: async (seriesId: string): Promise<ChapterAPI[]> => {
    const res = await api.get<{ success: boolean; data: any[] }>(
      `/api/mangaka/series/${seriesId}/chapters`
    )
    return (res.data.data ?? []).map(mapChapter)
  },

  /** POST /api/mangaka/series/:seriesId/chapters */
  create: async (seriesId: string, payload: CreateChapterPayload): Promise<ChapterAPI> => {
    const res = await api.post<{ success: boolean; data: any }>(
      `/api/mangaka/series/${seriesId}/chapters`,
      payload
    )
    return mapChapter(res.data.data)
  },
}

export default chapterService
