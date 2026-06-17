import type {
  ActivityLog,
  Chapter,
  Notification,
  Page,
  PageRegion,
  PageTask,
  ReviewSession,
  Series,
  User,
  Vote as AdminVote,
} from '@/services/admin/admin.types'

export const adminOverview = {
  total_users: 12482,
  total_series: 1240,
  total_chapters: 85400,
  total_pages: 85400,
  total_tasks: 342,
  pending_tasks: 154,
  completed_tasks: 811,
  active_review_sessions: 18,
  total_notifications: 5,
}

export const adminTaskStats = {
  total: 342,
  by_status: {
    pending: 154,
    assigned: 42,
    in_progress: 78,
    submitted: 21,
    review: 19,
    approved: 811,
    needs_revision: 12,
    completed: 811,
    on_hold: 7,
    cancelled: 0,
    rejected: 0,
  },
  overdue: 68,
}

export const adminUsers: User[] = [
  {
    user_id: 'usr-admin-001',
    username: 'John Doe',
    email: 'john.doe@mangaflow.io',
    role: 'admin',
    status: 'active',
    created_at: '2024-05-12T09:00:00Z',
    avatar_url: 'https://i.pravatar.cc/120?u=admin-john',
  },
  {
    user_id: 'usr-editor-018',
    username: 'Sarah Connor',
    email: 's.connor@work.manga',
    role: 'editor',
    status: 'active',
    created_at: '2024-04-02T09:00:00Z',
    avatar_url: 'https://i.pravatar.cc/120?u=editor-sarah',
  },
  {
    user_id: 'usr-assistant-044',
    username: 'Michael Scott',
    email: 'm.scott@paper.co',
    role: 'assistant',
    status: 'suspended',
    created_at: '2024-03-15T09:00:00Z',
    avatar_url: 'https://i.pravatar.cc/120?u=assistant-michael',
  },
]

export const adminSeries: Series[] = [
  {
    series_id: 'SR-10293',
    title: 'Shadow Realm',
    description: 'Editorial archive entry',
    cover_image_url: '/images/cover-1.png',
    genre: 'Dark Fantasy, Action',
    status: 'approved',
    view_count: 12402,
    created_at: '2024-05-14T08:30:00Z',
  },
  {
    series_id: 'NC-55210',
    title: 'Neon Circuitry',
    cover_image_url: '/images/cover-2.png',
    genre: 'Cyberpunk, SciFi',
    status: 'pending_review',
    view_count: 850,
    created_at: '2024-05-10T08:30:00Z',
  },
  {
    series_id: 'PW-33812',
    title: 'Petal Whispers',
    cover_image_url: '/images/cover-3.png',
    genre: 'Slice of Life',
    status: 'banned',
    view_count: 5112,
    created_at: '2024-05-04T08:30:00Z',
  },
  {
    series_id: 'IC-99021',
    title: 'Iron Court',
    cover_image_url: '/images/cover-4.png',
    genre: 'Sports, Shonen',
    status: 'approved',
    view_count: 3340,
    created_at: '2024-04-29T08:30:00Z',
  },
]

export const adminChapters: Chapter[] = [
  {
    chapter_id: 'ch-phantom-142',
    series_id: 'phantom-guild',
    chapter_number: 142,
    title: 'The Final Stand',
    thumbnail_image_url: '/images/cover-1.png',
    status: 'published',
    view_count: 18420,
    publish_date: '2024-05-24',
    created_at: '2024-05-24T10:00:00Z',
  },
  {
    chapter_id: 'ch-sakura-89',
    series_id: 'sakura-high',
    chapter_number: 89,
    title: 'Under the Petals',
    thumbnail_image_url: '/images/cover-2.png',
    status: 'pending_review',
    publish_date: '2024-05-22',
    created_at: '2024-05-22T10:00:00Z',
  },
  {
    chapter_id: 'ch-moonlight-12',
    series_id: 'moonlight-academy',
    chapter_number: 12,
    title: 'Lunar Awakening',
    thumbnail_image_url: '/images/cover-3.png',
    status: 'draft',
    publish_date: '2024-05-20',
    created_at: '2024-05-20T10:00:00Z',
  },
  {
    chapter_id: 'ch-steel-55',
    series_id: 'steel-warriors',
    chapter_number: 55,
    title: 'Gear Shift',
    thumbnail_image_url: '/images/cover-4.png',
    status: 'published',
    publish_date: '2024-05-18',
    created_at: '2024-05-18T10:00:00Z',
  },
]

export const adminPages: Page[] = [
  {
    page_id: 'pg-crimson-001',
    chapter_id: 'ch-crimson-42',
    page_number: 1,
    image_url: '/images/cover-1.png',
    status: 'completed',
    width: 840,
    height: 1188,
    created_at: '2024-05-21T10:00:00Z',
  },
  {
    page_id: 'pg-crimson-002',
    chapter_id: 'ch-crimson-42',
    page_number: 2,
    image_url: '/images/hero.png',
    status: 'review',
    width: 840,
    height: 1188,
    created_at: '2024-05-21T10:10:00Z',
  },
  {
    page_id: 'pg-crimson-003',
    chapter_id: 'ch-crimson-42',
    page_number: 3,
    image_url: '/images/cover-4.png',
    status: 'in_progress',
    width: 840,
    height: 1188,
    created_at: '2024-05-21T10:20:00Z',
  },
]

export const adminPageRegions: PageRegion[] = [
  { region_id: 'reg-01', page_id: 'pg-crimson-002', x: 8, y: 12, width: 38, height: 22, created_at: '2024-05-21T10:00:00Z' },
  { region_id: 'reg-02', page_id: 'pg-crimson-002', x: 6, y: 40, width: 54, height: 27, created_at: '2024-05-21T10:00:00Z' },
  { region_id: 'reg-03', page_id: 'pg-crimson-002', x: 70, y: 24, width: 25, height: 18, created_at: '2024-05-21T10:00:00Z' },
]

export const adminPageTasks: PageTask[] = [
  {
    task_id: 'task-ocr-001',
    page_id: 'pg-crimson-002',
    task_type: 'OCR Refinement',
    status: 'needs_revision',
    deadline: '2024-05-27T18:00:00Z',
    content: 'Fix overlapping text regions in panel 3 where character hair interferes with bubble detection.',
    created_at: '2024-05-21T12:00:00Z',
  },
  {
    task_id: 'task-letter-002',
    page_id: 'pg-crimson-002',
    task_type: 'Lettering QC',
    status: 'in_progress',
    deadline: '2024-05-28T18:00:00Z',
    content: 'Verify translated bubble spacing before publication.',
    created_at: '2024-05-21T12:30:00Z',
  },
]

export const adminReviewSessions: ReviewSession[] = [
  {
    session_id: 'rev-blue-lock-241',
    series_id: 'blue-lock',
    chapter_id: 'blue-lock-241',
    name: 'Blue Lock - Ch. 241',
    description: 'Editorial quality check',
    created_at: '2024-05-16T08:00:00Z',
    status: 'pending',
  },
  {
    session_id: 'rev-one-piece-1104',
    series_id: 'one-piece',
    chapter_id: 'one-piece-1104',
    name: 'One Piece - Ch. 1104',
    description: 'Translation proofing',
    created_at: '2024-05-16T08:30:00Z',
    status: 'in_progress',
  },
  {
    session_id: 'rev-sakamoto-152',
    series_id: 'sakamoto-days',
    chapter_id: 'sakamoto-152',
    name: 'Sakamoto Days - Ch. 152',
    description: 'SFX redraw review',
    created_at: '2024-05-16T09:00:00Z',
    status: 'pending',
  },
]

export const adminActivityLogs: ActivityLog[] = [
  {
    log_id: 'log-001',
    user_id: 'usr-092',
    action: 'Manga asset uploaded',
    entity_type: 'page',
    description: '"Spy x Family" Chapter 94 assets were synced to CDN by User-092.',
    created_at: '2024-05-16T09:58:00Z',
  },
  {
    log_id: 'log-002',
    action: 'Task flagged: overdue',
    entity_type: 'task',
    description: 'Review session for "Jujutsu Kaisen" passed the 48-hour threshold without approval.',
    created_at: '2024-05-16T09:46:00Z',
  },
  {
    log_id: 'log-003',
    action: 'New editor assigned',
    entity_type: 'user',
    description: 'Akira Tanaka has been added to the editorial team for "Oshi no Ko".',
    created_at: '2024-05-16T09:00:00Z',
  },
  {
    log_id: 'log-004',
    action: 'System backup completed',
    entity_type: 'system',
    description: 'Weekly redundancy check across Tokyo-1 and SF-0 regions finished with 0 errors.',
    created_at: '2024-05-16T07:00:00Z',
  },
]

export const adminVotes: AdminVote[] = [
  { vote_id: 'vote-001', voter_id: 'editor-01', session_id: 'rev-blue-lock-241', decision: 'approve', score: 9, status: 'submitted', created_at: '2024-05-16T10:00:00Z' },
  { vote_id: 'vote-002', voter_id: 'board-02', session_id: 'rev-one-piece-1104', decision: 'revise', score: 7, status: 'verified', created_at: '2024-05-16T10:30:00Z' },
]

export const adminNotifications: Notification[] = [
  { notification_id: 'noti-001', user_id: 'usr-editor-018', title: 'New review assigned', content: 'Blue Lock - Ch. 241 is waiting for your approval.', type: 'review', is_read: false, created_at: '2024-05-16T09:00:00Z' },
  { notification_id: 'noti-002', user_id: 'usr-admin-001', title: 'System backup completed', content: 'All regions reported healthy.', type: 'system', is_read: true, created_at: '2024-05-16T07:00:00Z' },
]
