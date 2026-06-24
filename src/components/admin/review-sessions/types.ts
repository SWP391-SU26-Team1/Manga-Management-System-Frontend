import type {
  Chapter,
  PaginationMeta,
  ReviewSession,
  ReviewSessionProcessResult,
  ReviewSessionStatus,
  Series,
  Vote,
  VoteStatus,
} from '@/services/admin/admin.types'

export type StatusFilter = 'all' | ReviewSessionStatus
export type VoteStatusFilter = 'all' | VoteStatus
export type WorkflowAction = 'start' | 'pause' | 'complete' | 'finish' | 'cancel' | 'finalize'
export type DetailTab = 'overview' | 'votes'
export type ToastState = { type: 'success' | 'error'; message: string } | null

export type ReviewSessionFormValues = {
  series_id: string
  chapter_id: string
  series_query: string
  chapter_query: string
  name: string
  description: string
}

export type VoteFormValues = {
  decision: string
  score: string
  note: string
  status: VoteStatus
}

export type SessionResultMap = Record<string, ReviewSessionProcessResult>
export type VoteCountMap = Record<string, number>

export type ConfirmState =
  | {
      title: string
      message: string
      confirmLabel: string
      tone?: 'danger' | 'warning'
      onConfirm: () => void | Promise<void>
    }
  | null

export const REVIEW_STATUSES: ReviewSessionStatus[] = [
  'pending',
  'in_progress',
  'completed',
  'finished',
  'paused',
  'cancelled',
]

export const VOTE_STATUSES: VoteStatus[] = ['submitted', 'verified']

export const emptyPagination: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
}

export const emptySessionForm: ReviewSessionFormValues = {
  series_id: '',
  chapter_id: '',
  series_query: '',
  chapter_query: '',
  name: '',
  description: '',
}

export type SeriesOption = Partial<Pick<Series, 'id' | 'series_id' | 'seriesId' | 'title' | 'status'>> & {
  _id?: string
  seriesID?: string
  series_uuid?: string
  seriesUuid?: string
  uuid?: string
  value?: string
  title: string
}

export type ChapterOption = Partial<
  Pick<Chapter, 'id' | 'chapter_id' | 'chapterId' | 'chapter_number' | 'title' | 'series_id' | 'seriesId' | 'status'>
> & {
  _id?: string
  chapterID?: string
  chapter_uuid?: string
  chapterUuid?: string
  seriesID?: string
  series_uuid?: string
  seriesUuid?: string
  uuid?: string
  value?: string
}

export const emptyVoteForm: VoteFormValues = {
  decision: 'approved',
  score: '8',
  note: '',
  status: 'submitted',
}

export type SessionActionHandler = (session: ReviewSession, action: WorkflowAction) => void
export type SessionProcessHandler = (session: ReviewSession) => void
export type SessionHandler = (session: ReviewSession) => void
export type VoteHandler = (vote: Vote) => void
