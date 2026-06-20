export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type ApiListResponse<T> = {
  success: boolean
  message: string
  data: T[]
  pagination: PaginationMeta
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type UserRole =
  | 'admin'
  | 'mangaka'
  | 'assistant'
  | 'editor'
  | 'board'
  | 'reviewer'
  | 'reader'

export type UserStatus = 'active' | 'suspended' | 'banned' | 'inactive'

export type SeriesStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'archived'
  | 'hidden'
  | 'banned'
  | 'deleted'

export type ChapterStatus = SeriesStatus

export type PageStatus =
  | 'draft'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'published'
  | 'archived'
  | 'hidden'
  | 'banned'
  | 'deleted'

export type PageTaskStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'submitted'
  | 'review'
  | 'approved'
  | 'needs_revision'
  | 'completed'
  | 'on_hold'
  | 'cancelled'
  | 'rejected'

export type ReviewSessionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'finished'
  | 'paused'
  | 'cancelled'

export type VoteStatus = 'submitted' | 'verified'

export type RankingPeriodStatus = 'pending' | 'calculating' | 'completed' | 'archived'

export type User = {
  user_id: string
  username: string
  email: string
  role: UserRole
  avatar_url?: string | null
  bio?: string | null
  name?: string | null
  gender?: string | null
  date_of_birth?: string | null
  status: UserStatus
  created_at: string
}

export type Series = {
  id?: string
  series_id: string
  seriesId?: string
  title: string
  description?: string | null
  cover_image_url?: string | null
  genre?: string | null
  status: SeriesStatus
  view_count?: number
  created_at: string
  updated_at?: string
}

export type SeriesDetail = Series & {
  chapter?: Chapter[]
  series_member?: Array<{
    series_member_id: string
    series_id: string
    user_id: string
    role_in_series: string
    users?: Pick<User, 'user_id' | 'username' | 'name' | 'avatar_url' | 'role'> | null
  }>
}

export type Chapter = {
  id?: string
  chapter_id: string
  chapterId?: string
  series_id: string
  seriesId?: string
  chapter_number: number
  title?: string | null
  thumbnail_image_url?: string | null
  status: ChapterStatus
  view_count?: number
  publish_date?: string | null
  created_at: string
  updated_at?: string
  series?: Pick<Series, 'series_id' | 'title'> | null
}

export type ChapterDetail = Chapter & {
  page?: Page[]
}

export type Page = {
  page_id: string
  chapter_id: string
  page_number: number
  image_url?: string | null
  status: PageStatus
  width?: number | null
  height?: number | null
  created_at: string
  updated_at?: string
}

export type PageRegion = {
  region_id: string
  page_id: string
  x: number
  y: number
  width: number
  height: number
  created_at: string
  updated_at?: string
}

export type PageTask = {
  task_id: string
  page_id: string
  assigned_by_id?: string | null
  region_id?: string | null
  assistant_id?: string | null
  task_type: string
  status: PageTaskStatus
  deadline?: string | null
  content?: string | null
  created_at: string
  updated_at?: string
  page?: Pick<Page, 'page_id' | 'page_number' | 'chapter_id'> | null
  assistant?: Pick<User, 'user_id' | 'username' | 'name' | 'avatar_url'> | null
  assigned_by?: Pick<User, 'user_id' | 'username' | 'name' | 'avatar_url'> | null
}

export type ReviewSession = {
  id?: string
  session_id: string
  sessionId?: string
  series_id: string
  seriesId?: string
  chapter_id?: string | null
  chapterId?: string | null
  created_by_user_id?: string | null
  createdByUserId?: string | null
  title?: string | null
  name?: string | null
  description?: string | null
  deadline?: string | null
  started_at?: string | null
  startedAt?: string | null
  ended_at?: string | null
  endedAt?: string | null
  created_at: string
  createdAt?: string
  updated_at?: string | null
  updatedAt?: string | null
  status: ReviewSessionStatus
  series?: Pick<Series, 'series_id' | 'title'> | null
  chapter?: Pick<Chapter, 'chapter_id' | 'chapter_number' | 'title'> | null
  created_by?: Pick<User, 'user_id' | 'username' | 'name'> | null
}

export type Vote = {
  id?: string
  vote_id: string
  voter_id: string
  session_id?: string | null
  decision?: string | null
  score?: number | null
  note?: string | null
  created_at: string
  status: VoteStatus
  users?: Pick<User, 'user_id' | 'username' | 'email'> | null
  voter?: Pick<User, 'user_id' | 'username' | 'name' | 'email'> | null
  session?: Pick<ReviewSession, 'session_id' | 'name' | 'status' | 'series_id' | 'chapter_id'> | null
}

export type ReviewSessionProcessResult = {
  session_id: string
  total_votes: number
  avg_score: number
  decision_count: Record<string, number>
  dominant_decision: string
}

export type Notification = {
  notification_id: string
  user_id: string
  title: string
  content?: string | null
  type?: string | null
  is_read: boolean
  created_at: string
  user?: Pick<User, 'user_id' | 'username' | 'name' | 'email' | 'role'> | null
}

export type ActivityLog = {
  log_id?: string
  user_id?: string
  action: string
  entity_type?: string
  entity_id?: string
  description?: string
  created_at: string
}

export type DashboardOverview = {
  total_users: number
  total_series: number
  total_chapters: number
  total_pages: number
  total_tasks: number
  pending_tasks: number
  completed_tasks: number
  active_review_sessions: number
  total_notifications: number
}

export type TaskStats = {
  total: number
  by_status: Partial<Record<PageTaskStatus, number>>
  overdue: number
}

export type EntityStats<TStatus extends string> = {
  total: number
  by_status?: Partial<Record<TStatus, number>>
  by_role?: Partial<Record<UserRole, number>>
}

export type UserStats = EntityStats<UserStatus> & {
  by_role: Partial<Record<UserRole, number>>
  by_status: Partial<Record<UserStatus, number>>
}

export type SeriesStats = EntityStats<SeriesStatus> & {
  by_status: Partial<Record<SeriesStatus, number>>
}

export type ReviewStats = EntityStats<ReviewSessionStatus> & {
  by_status: Partial<Record<ReviewSessionStatus, number>>
}

export type RankingStats = {
  total_periods: number
  total_series_rankings: number
  total_chapter_rankings: number
}

export type NotificationStats = {
  total: number
  unread: number
  by_type: Record<string, number>
}

export type SystemHealth = {
  status: 'ok' | string
  db_latency_ms: number
  counts: {
    users: number
    series: number
    tasks: number
  }
  timestamp: string
}

export type StorageUsage = {
  manuscript_files: { count: number }
  page_versions: { count: number }
}
