// ─── Series (cho User view) ─────────────────────────────────────────────────

export interface PublishedSeries {
  id: string
  title: string
  description: string
  genre: string
  coverImageUrl: string | null
  status: 'PUBLISHING' | 'COMPLETED' | 'HIATUS'
  viewCount: number
  totalChapters: number
  latestChapterNumber: number
  latestChapterDate: string
  rating: number
  ratingCount: number
  authorName: string
  authorAvatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface SeriesTeamMember {
  userId: string
  name: string
  avatarUrl: string | null
  roleInSeries: string
}

export interface SeriesDetail extends PublishedSeries {
  editorName: string | null
  editorAvatarUrl: string | null
  publishSchedule: string | null
  genres: string[]
  teamMembers: SeriesTeamMember[]
  totalViews?: number
  totalLikes?: number
}

// ─── Chapter (đã publish) ───────────────────────────────────────────────────

export interface PublishedChapter {
  id: string
  seriesId: string
  title: string
  chapterNumber: number
  publishedAt: string
  thumbnailUrl: string | null
  pageCount: number
  isRead: boolean
  isNew: boolean
}

// ─── Page (ảnh trang manga) ──────────────────────────────────────────────────

export interface MangaPage {
  id: string
  chapterId: string
  pageNumber: number
  imageUrl: string
}

// ─── Reading History ─────────────────────────────────────────────────────────

export interface ReadingHistoryItem {
  seriesId: string
  seriesTitle: string
  seriesCoverUrl: string | null
  seriesGenre: string
  lastChapterId: string
  lastChapterNumber: number
  lastChapterTitle: string
  lastPageNumber: number
  totalPages: number
  progressPercent: number
  lastReadAt: string
  isCompleted: boolean
}

export interface ContinueReading {
  seriesId: string
  seriesTitle: string
  seriesCoverUrl: string | null
  chapterId: string
  chapterNumber: number
  chapterTitle: string
  currentPage: number
  totalPages: number
  progressPercent: number
  lastReadAt: string
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchParams {
  query?: string
  genre?: string
  status?: 'PUBLISHING' | 'COMPLETED' | 'HIATUS' | ''
  sort?: 'popular' | 'latest' | 'az' | 'rating' | 'views'
  page?: number
  limit?: number
}

export interface SearchResult {
  series: PublishedSeries[]
  total: number
  page: number
  totalPages: number
}

export interface SearchSuggestion {
  id: string
  title: string
  coverImageUrl: string | null
  genre: string
  authorName: string
  rating: number
  totalChapters: number
}

// ─── Rankings ────────────────────────────────────────────────────────────────

export type RankingPeriodType = 'week' | 'month' | 'all_time'

export interface RankedSeries {
  rankPosition: number
  previousRank: number | null
  trendDirection: 'up' | 'down' | 'same' | 'new'
  trendChange: number
  seriesId: string
  title: string
  coverImageUrl: string | null
  genre: string
  authorName: string
  score: number
  totalVotes: number
  viewCount: number
  totalChapters: number
}

export interface RankingPeriod {
  id: string
  name: string
  startDate: string
  endDate: string
}

export interface RankingData {
  period: RankingPeriod
  periodType: RankingPeriodType
  rankings: RankedSeries[]
  totalSeries: number
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface SeriesComment {
  id: string
  userId: string
  userName: string
  userAvatarUrl: string | null
  content: string
  createdAt: string
}

// ─── Favorites ───────────────────────────────────────────────────────────────

export interface FavoriteSeries {
  seriesId: string
  title: string
  coverImageUrl: string | null
  genre: string
  lastChapterRead: number
  totalChapters: number
  addedAt: string
}

// ─── User Profile (Reader-specific) ──────────────────────────────────────────

export interface ReaderProfile {
  id: string
  username: string
  email: string
  fullName: string
  avatarUrl: string | null
  bio: string
  role: 'USER'
  createdAt: string
  readingStats: {
    totalSeriesRead: number
    totalChaptersRead: number
    totalFollowing: number
    totalReadingHours: number
  }
}

// ─── Reader Settings ─────────────────────────────────────────────────────────

export interface ReaderSettings {
  theme: 'dark' | 'light' | 'sepia'
  pageWidth: 'narrow' | 'medium' | 'wide'
  autoScroll: boolean
  autoScrollSpeed: number
}

// ─── Genre ───────────────────────────────────────────────────────────────────

export interface Genre {
  id: string
  name: string
  slug: string
  icon: string
  seriesCount: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const GENRES: Genre[] = [
  { id: '1',  name: 'Action',       slug: 'action',       icon: '⚔️',  seriesCount: 0 },
  { id: '2',  name: 'Fantasy',      slug: 'fantasy',      icon: '🧙',  seriesCount: 0 },
  { id: '3',  name: 'Romance',      slug: 'romance',      icon: '💕',  seriesCount: 0 },
  { id: '4',  name: 'Sci-Fi',       slug: 'sci-fi',       icon: '🚀',  seriesCount: 0 },
  { id: '5',  name: 'Sports',       slug: 'sports',       icon: '⚽',  seriesCount: 0 },
  { id: '6',  name: 'Comedy',       slug: 'comedy',       icon: '😂',  seriesCount: 0 },
  { id: '7',  name: 'Drama',        slug: 'drama',        icon: '🎭',  seriesCount: 0 },
  { id: '8',  name: 'Horror',       slug: 'horror',       icon: '👻',  seriesCount: 0 },
  { id: '9',  name: 'Mystery',      slug: 'mystery',      icon: '🔍',  seriesCount: 0 },
  { id: '10', name: 'Slice of Life', slug: 'slice-of-life', icon: '🌸', seriesCount: 0 },
  { id: '11', name: 'Mecha',        slug: 'mecha',        icon: '🤖',  seriesCount: 0 },
  { id: '12', name: 'School',       slug: 'school',       icon: '🏫',  seriesCount: 0 },
  { id: '13', name: 'Manga',        slug: 'manga',        icon: '🇯🇵',  seriesCount: 0 },
  { id: '14', name: 'Manhwa',       slug: 'manhwa',       icon: '🇰🇷',  seriesCount: 0 },
  { id: '15', name: 'Manhua',       slug: 'manhua',       icon: '🇨🇳',  seriesCount: 0 },
]

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  theme: 'dark',
  pageWidth: 'medium',
  autoScroll: false,
  autoScrollSpeed: 50,
}
