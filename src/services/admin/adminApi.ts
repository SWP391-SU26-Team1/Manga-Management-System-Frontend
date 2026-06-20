import api from '@/services/api'
import type { ApiListResponse, ApiResponse } from './admin.types'

type QueryParams = Record<string, string | number | boolean | undefined | null>

export const unwrapAdminResponse = <T>(payload: ApiResponse<T> | T): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data
  }

  return payload as T
}

export const adminGet = async <T>(url: string, params?: QueryParams): Promise<T> => {
  const response = await api.get<ApiResponse<T> | T>(url, { params })
  return unwrapAdminResponse<T>(response.data)
}

export const adminList = async <T>(url: string, params?: QueryParams): Promise<ApiListResponse<T>> => {
  const response = await api.get<ApiListResponse<T>>(url, { params })
  return response.data
}

export const adminPost = async <T, TBody = unknown>(url: string, body?: TBody): Promise<T> => {
  const response = await api.post<ApiResponse<T>>(url, body)
  return unwrapAdminResponse<T>(response.data)
}

export const adminPatch = async <T, TBody = unknown>(url: string, body?: TBody): Promise<T> => {
  const response = await api.patch<ApiResponse<T>>(url, body)
  return unwrapAdminResponse<T>(response.data)
}

export const adminDelete = async <T = null>(url: string): Promise<T> => {
  const response = await api.delete<ApiResponse<T>>(url)
  return unwrapAdminResponse<T>(response.data)
}
