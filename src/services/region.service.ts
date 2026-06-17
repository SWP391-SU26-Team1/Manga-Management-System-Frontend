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

  /** POST /api/page-regions */
  create: async (
    seriesId: string,
    chapterId: string,
    pageId: string,
    payload: { region_type?: string; coordinates: any; label?: string }
  ): Promise<RegionAPI> => {
    const flatPayload = {
      page_id: pageId,
      x: Math.round(payload.coordinates?.x ?? 0),
      y: Math.round(payload.coordinates?.y ?? 0),
      width: Math.max(1, Math.round(payload.coordinates?.w ?? payload.coordinates?.width ?? 0)),
      height: Math.max(1, Math.round(payload.coordinates?.h ?? payload.coordinates?.height ?? 0)),
    }
    const res = await api.post<{ success: boolean; data: any }>(
      '/api/page-regions',
      flatPayload
    )
    const reg = res.data.data
    return {
      region_id: reg.region_id,
      page_id: reg.page_id,
      coordinates: {
        x: reg.x,
        y: reg.y,
        w: reg.width,
        h: reg.height
      },
      created_at: reg.created_at,
      updated_at: reg.updated_at
    }
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
