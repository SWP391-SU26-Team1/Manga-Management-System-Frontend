import { adminGet } from './adminApi'
import type { Chapter, Series, User } from './admin.types'

export type AdminSearchResult = {
  users: Pick<User, 'user_id' | 'username' | 'email' | 'role' | 'status'>[]
  series: Pick<Series, 'series_id' | 'title' | 'status'>[]
  chapters: Pick<Chapter, 'chapter_id' | 'title' | 'chapter_number' | 'status'>[]
}

export const adminSearchService = {
  search: (keyword: string) => adminGet<AdminSearchResult>('/api/admin/search', { keyword }),
}
