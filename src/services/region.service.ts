import api from './api'

export interface RegionAPI {
  region_id: string
  page_id: string
  region_type?: string
  coordinates: {
    x: number
    y: number
    w: number
    h: number
  }
  label?: string
  created_at?: string
  updated_at?: string
}

export const regionService = {
  /** GET /api/mangaka/series/:seriesId/chapters/:chapterId/pages/:pageId/regions */
  getByPage: async (
    seriesId: string,
    chapterId: string,
    pageId: string
  ): Promise<RegionAPI[]> => {
    const res = await api.get<{ success: boolean; data: any[] }>(
      `/api/mangaka/series/${seriesId}/chapters/${chapterId}/pages/${pageId}/regions`
    )
    return res.data.data ?? []
  },

  /** POST /api/mangaka/series/:seriesId/chapters/:chapterId/pages/:pageId/regions */
  create: async (
    seriesId: string,
    chapterId: string,
    pageId: string,
    payload: { region_type?: string; coordinates: any; label?: string }
  ): Promise<RegionAPI> => {
    const res = await api.post<{ success: boolean; data: RegionAPI }>(
      `/api/mangaka/series/${seriesId}/chapters/${chapterId}/pages/${pageId}/regions`,
      payload
    )
    return res.data.data
  },

  /** DELETE /api/mangaka/series/:seriesId/chapters/:chapterId/pages/:pageId/regions/:regionId */
  delete: async (
    seriesId: string,
    chapterId: string,
    pageId: string,
    regionId: string
  ): Promise<void> => {
    await api.delete(
      `/api/mangaka/series/${seriesId}/chapters/${chapterId}/pages/${pageId}/regions/${regionId}`
    )
  }
}

export default regionService
