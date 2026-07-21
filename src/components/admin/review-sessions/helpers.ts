import type {
  ApiListResponse,
  PaginationMeta,
  ReviewSession,
  ReviewSessionProcessResult,
  Vote,
} from '@/services/admin/admin.types'
import { emptyPagination } from './types'

export const getSessionId = (session: ReviewSession) => session.session_id || session.sessionId || session.id || ''

export const getVoteId = (vote: Vote) => vote.vote_id || vote.id || ''

export const getSessionName = (session: ReviewSession) => session.name || session.title || 'Phiên đánh giá chưa đặt tên'

export const getSeriesLabel = (session: ReviewSession) => session.series?.title || 'Chưa tải bộ truyện'

export const getChapterLabel = (session: ReviewSession) => {
  if (session.chapter?.title) return session.chapter.title
  if (session.chapter?.chapter_number) return `Chương ${session.chapter.chapter_number}`
  return session.chapter_id || session.chapterId ? 'Chưa tải chương' : 'Không đính kèm chương'
}

export const getCreatedByLabel = (session: ReviewSession) =>
  session.created_by?.name ||
  session.created_by?.username ||
  'Không rõ người tạo'

export const getVoterLabel = (vote: Vote) => {
  const data = vote.voter || vote.users
  return data?.name || data?.username || data?.email || 'Không rõ người biểu quyết'
}

export const getVoterAvatar = (vote: Vote) => {
  const data = vote.voter || vote.users
  return data?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getVoterLabel(vote))}&background=random`
}

export const isUuidLike = (value?: string | null) =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))

const pickUuid = (...values: Array<string | undefined | null>) => {
  const direct = values.find((value) => isUuidLike(value))
  return direct || ''
}

export const getSeriesOptionId = (series: {
  series_id?: string
  seriesId?: string
  seriesID?: string
  series_uuid?: string
  seriesUuid?: string
  uuid?: string
  value?: string
  id?: string
  _id?: string
}) => pickUuid(series.series_id, series.seriesId, series.seriesID, series.series_uuid, series.seriesUuid, series.uuid, series.value, series.id, series._id)

export const getChapterOptionId = (chapter: {
  chapter_id?: string
  chapterId?: string
  chapterID?: string
  chapter_uuid?: string
  chapterUuid?: string
  uuid?: string
  value?: string
  id?: string
  _id?: string
}) =>
  pickUuid(
    chapter.chapter_id,
    chapter.chapterId,
    chapter.chapterID,
    chapter.chapter_uuid,
    chapter.chapterUuid,
    chapter.uuid,
    chapter.value,
    chapter.id,
    chapter._id,
  )

export const getChapterSeriesOptionId = (chapter: {
  series_id?: string
  seriesId?: string
  seriesID?: string
  series_uuid?: string
  seriesUuid?: string
  series?: { series_id?: string; seriesId?: string; id?: string; _id?: string }
}) =>
  pickUuid(
    chapter.series_id,
    chapter.seriesId,
    chapter.seriesID,
    chapter.series_uuid,
    chapter.seriesUuid,
    chapter.series?.series_id,
    chapter.series?.seriesId,
    chapter.series?.id,
    chapter.series?._id,
  )

export const getChapterOptionLabel = (chapter: { chapter_number?: number; title?: string | null }) =>
  chapter.title || (chapter.chapter_number ? `Chương ${chapter.chapter_number}` : 'Chương chưa đặt tên')

export const formatDateTime = (value?: string | null, fallback = 'N/A') => {
  if (!value) return fallback

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const formatScore = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return 'N/A'
  return Number(value).toFixed(1).replace('.0', '')
}

export const normalizeListResponse = <T>(
  payload: ApiListResponse<T> | { data?: T[]; pagination?: PaginationMeta } | T[],
  page: number,
  limit: number,
) => {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      pagination: {
        ...emptyPagination,
        page,
        limit,
        total: payload.length,
        totalPages: Math.max(1, Math.ceil(payload.length / limit)),
      },
    }
  }

  const data = Array.isArray(payload?.data) ? payload.data : []
  const pagination = payload?.pagination || {
    ...emptyPagination,
    page,
    limit,
    total: data.length,
    totalPages: Math.max(1, Math.ceil(data.length / limit)),
  }

  return {
    data,
    pagination: {
      ...pagination,
      totalPages: Math.max(1, pagination.totalPages || 1),
    },
  }
}

export const getErrorMessage = (error: unknown) => {
  const apiError = error as { response?: { data?: { message?: string } }; message?: string }
  return apiError.response?.data?.message || apiError.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'
}

export const resultSummary = (result?: ReviewSessionProcessResult) => {
  if (!result) return null

  return {
    totalVotes: result.total_votes,
    avgScore: formatScore(result.avg_score),
    dominantDecision: result.dominant_decision || 'N/A',
  }
}
