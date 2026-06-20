import api from '@/services/api'
import { adminDelete, adminGet, adminPatch, adminPost } from './adminApi'
import type { ApiListResponse, PaginationMeta, ReviewSession, ReviewSessionStatus } from './admin.types'

export type ListReviewSessionsParams = {
  page?: number
  limit?: number
  status?: ReviewSessionStatus
}

export type CreateReviewSessionPayload = {
  series_id: string
  chapter_id?: string
  name: string
  description?: string
}

export type UpdateReviewSessionPayload = Partial<Pick<CreateReviewSessionPayload, 'name' | 'description'>>

export type ReviewSessionStats = {
  total?: number
  by_status?: Partial<Record<ReviewSessionStatus, number>>
  pending?: number
  in_progress?: number
  completed?: number
  finished?: number
  paused?: number
  cancelled?: number
}

type ReviewSessionListData =
  | ReviewSession[]
  | {
      sessions?: ReviewSession[]
      reviewSessions?: ReviewSession[]
      items?: ReviewSession[]
      results?: ReviewSession[]
      pagination?: PaginationMeta
      total?: number
      page?: number
      limit?: number
      totalPages?: number
    }

type RawReviewSessionListResponse =
  | ApiListResponse<ReviewSession>
  | {
      success?: boolean
      message?: string
      data?: ReviewSessionListData
      sessions?: ReviewSession[]
      reviewSessions?: ReviewSession[]
      pagination?: PaginationMeta
      total?: number
      page?: number
      limit?: number
      totalPages?: number
    }
  | ReviewSession[]

const ADMIN_REVIEW_SESSIONS_ENDPOINT = '/api/admin/review-sessions'
const ADMIN_REVIEW_STATS_ENDPOINT = '/api/admin/dashboard/reviews'

const buildPagination = (
  total: number,
  params?: ListReviewSessionsParams,
  partial?: Partial<PaginationMeta>,
): PaginationMeta => {
  const page = partial?.page ?? params?.page ?? 1
  const limit = partial?.limit ?? params?.limit ?? 10
  const safeTotal = partial?.total ?? total

  return {
    page,
    limit,
    total: safeTotal,
    totalPages: partial?.totalPages ?? Math.max(1, Math.ceil(safeTotal / limit)),
  }
}

const normalizeReviewSessionList = (
  payload: RawReviewSessionListResponse,
  params?: ListReviewSessionsParams,
): ApiListResponse<ReviewSession> => {
  if (Array.isArray(payload)) {
    return {
      success: true,
      message: '',
      data: payload,
      pagination: buildPagination(payload.length, params),
    }
  }

  const envelope = payload as {
    success?: boolean
    message?: string
    data?: ReviewSessionListData
    sessions?: ReviewSession[]
    reviewSessions?: ReviewSession[]
    pagination?: PaginationMeta
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }

  const nestedData = envelope.data

  if (Array.isArray(nestedData)) {
    return {
      success: envelope.success ?? true,
      message: envelope.message ?? '',
      data: nestedData,
      pagination:
        envelope.pagination ??
        buildPagination(nestedData.length, params, {
          total: envelope.total,
          page: envelope.page,
          limit: envelope.limit,
          totalPages: envelope.totalPages,
        }),
    }
  }

  const sessions =
    nestedData?.sessions ??
    nestedData?.reviewSessions ??
    nestedData?.items ??
    nestedData?.results ??
    envelope.sessions ??
    envelope.reviewSessions ??
    []

  const pagination =
    envelope.pagination ??
    nestedData?.pagination ??
    buildPagination(sessions.length, params, {
      total: envelope.total ?? nestedData?.total,
      page: envelope.page ?? nestedData?.page,
      limit: envelope.limit ?? nestedData?.limit,
      totalPages: envelope.totalPages ?? nestedData?.totalPages,
    })

  return {
    success: envelope.success ?? true,
    message: envelope.message ?? '',
    data: sessions,
    pagination,
  }
}

export const adminReviewSessionsService = {
  list: async (params?: ListReviewSessionsParams) => {
    const response = await api.get<RawReviewSessionListResponse>(ADMIN_REVIEW_SESSIONS_ENDPOINT, { params })
    return normalizeReviewSessionList(response.data, params)
  },
  getById: (sessionId: string) => adminGet<ReviewSession>(`${ADMIN_REVIEW_SESSIONS_ENDPOINT}/${sessionId}`),
  create: (body: CreateReviewSessionPayload) =>
    adminPost<ReviewSession, CreateReviewSessionPayload>(ADMIN_REVIEW_SESSIONS_ENDPOINT, body),
  update: (sessionId: string, body: UpdateReviewSessionPayload) =>
    adminPatch<ReviewSession, UpdateReviewSessionPayload>(`${ADMIN_REVIEW_SESSIONS_ENDPOINT}/${sessionId}`, body),
  updateStatus: (sessionId: string, status: ReviewSessionStatus) =>
    adminPatch<ReviewSession>(`${ADMIN_REVIEW_SESSIONS_ENDPOINT}/${sessionId}/status`, { status }),
  delete: (sessionId: string) => adminDelete(`${ADMIN_REVIEW_SESSIONS_ENDPOINT}/${sessionId}`),
  start: (sessionId: string) =>
    adminPatch<ReviewSession>(`${ADMIN_REVIEW_SESSIONS_ENDPOINT}/${sessionId}/status`, { status: 'in_progress' }),
  pause: (sessionId: string) =>
    adminPatch<ReviewSession>(`${ADMIN_REVIEW_SESSIONS_ENDPOINT}/${sessionId}/status`, { status: 'paused' }),
  complete: (sessionId: string) =>
    adminPatch<ReviewSession>(`${ADMIN_REVIEW_SESSIONS_ENDPOINT}/${sessionId}/status`, { status: 'completed' }),
  finish: (sessionId: string) =>
    adminPatch<ReviewSession>(`${ADMIN_REVIEW_SESSIONS_ENDPOINT}/${sessionId}/status`, { status: 'finished' }),
  cancel: (sessionId: string) =>
    adminPatch<ReviewSession>(`${ADMIN_REVIEW_SESSIONS_ENDPOINT}/${sessionId}/status`, { status: 'cancelled' }),
  getStats: () => adminGet<ReviewSessionStats>(ADMIN_REVIEW_STATS_ENDPOINT),
}
