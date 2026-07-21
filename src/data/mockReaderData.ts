import { PublishedSeries, PublishedChapter, MangaPage, ReadingHistoryItem, RankedSeries } from '@/types/reader.types'

export const MOCK_PUBLISHED_SERIES: PublishedSeries[] = [
  {
    id: 's_1',
    title: 'Astra & Kronos',
    description: 'Một bộ truyện về không gian và những chuyến phiêu lưu giả tưởng.',
    genre: 'Sci-Fi',
    coverImageUrl: 'https://i.pravatar.cc/300?u=s_1',
    status: 'PUBLISHING',
    viewCount: 15420,
    totalChapters: 24,
    latestChapterNumber: 24,
    latestChapterDate: new Date().toISOString(),
    rating: 4.8,
    ratingCount: 320,
    authorName: 'Tác giả 1',
    authorAvatarUrl: 'https://i.pravatar.cc/150?u=a_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 's_2',
    title: 'Học Viện Phép Thuật',
    description: 'Cuộc sống học đường với phép thuật và những bí ẩn.',
    genre: 'Fantasy',
    coverImageUrl: 'https://i.pravatar.cc/300?u=s_2',
    status: 'COMPLETED',
    viewCount: 45000,
    totalChapters: 120,
    latestChapterNumber: 120,
    latestChapterDate: new Date().toISOString(),
    rating: 4.9,
    ratingCount: 1200,
    authorName: 'Tác giả 2',
    authorAvatarUrl: 'https://i.pravatar.cc/150?u=a_2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 's_3',
    title: 'Bloodline Burst',
    description: 'Chiến đấu vì dòng máu gia tộc',
    genre: 'Action',
    coverImageUrl: 'https://i.pravatar.cc/300?u=s_3',
    status: 'PUBLISHING',
    viewCount: 9500,
    totalChapters: 15,
    latestChapterNumber: 15,
    latestChapterDate: new Date().toISOString(),
    rating: 4.5,
    ratingCount: 150,
    authorName: 'Tác giả 3',
    authorAvatarUrl: 'https://i.pravatar.cc/150?u=a_3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 's_4',
    title: 'Cú đập bầu trời',
    description: 'Vượt qua giới hạn trong môn thể thao yêu thích.',
    genre: 'Sports',
    coverImageUrl: 'https://i.pravatar.cc/300?u=s_4',
    status: 'PUBLISHING',
    viewCount: 22000,
    totalChapters: 56,
    latestChapterNumber: 56,
    latestChapterDate: new Date().toISOString(),
    rating: 4.7,
    ratingCount: 890,
    authorName: 'Tác giả 4',
    authorAvatarUrl: 'https://i.pravatar.cc/150?u=a_4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

export const MOCK_TRENDING_SERIES: RankedSeries[] = MOCK_PUBLISHED_SERIES.map((s, index) => ({
  rankPosition: index + 1,
  previousRank: index + 2,
  trendDirection: 'up',
  trendChange: 1,
  seriesId: s.id,
  title: s.title,
  coverImageUrl: s.coverImageUrl,
  genre: s.genre,
  authorName: s.authorName,
  score: s.rating * 100,
  totalVotes: s.ratingCount,
  viewCount: s.viewCount,
  totalChapters: s.totalChapters
}))

export const MOCK_HISTORY: ReadingHistoryItem[] = [
  {
    seriesId: 's_1',
    seriesTitle: 'Astra & Kronos',
    seriesCoverUrl: 'https://i.pravatar.cc/300?u=s_1',
    seriesGenre: 'Sci-Fi',
    lastChapterId: 'c_1',
    lastChapterNumber: 1,
    lastChapterTitle: 'Khởi đầu mới',
    lastPageNumber: 12,
    totalPages: 24,
    progressPercent: 50,
    lastReadAt: new Date().toISOString(),
    isCompleted: false,
  }
]

export const MOCK_CHAPTERS: Record<string, PublishedChapter[]> = {
  's_1': Array.from({ length: 24 }).map((_, i) => ({
    id: `c_s1_${i + 1}`,
    seriesId: 's_1',
    title: `Chương ${i + 1}`,
    chapterNumber: i + 1,
    publishedAt: new Date(Date.now() - (24 - i) * 86400000).toISOString(),
    thumbnailUrl: null,
    pageCount: 20,
    isRead: false,
    isNew: i > 20
  })),
  's_2': Array.from({ length: 120 }).map((_, i) => ({
    id: `c_s2_${i + 1}`,
    seriesId: 's_2',
    title: `Chương ${i + 1}`,
    chapterNumber: i + 1,
    publishedAt: new Date(Date.now() - (120 - i) * 86400000).toISOString(),
    thumbnailUrl: null,
    pageCount: 20,
    isRead: false,
    isNew: i > 115
  })),
  's_3': Array.from({ length: 15 }).map((_, i) => ({
    id: `c_s3_${i + 1}`,
    seriesId: 's_3',
    title: `Chương ${i + 1}`,
    chapterNumber: i + 1,
    publishedAt: new Date(Date.now() - (15 - i) * 86400000).toISOString(),
    thumbnailUrl: null,
    pageCount: 20,
    isRead: false,
    isNew: i > 12
  })),
  's_4': Array.from({ length: 56 }).map((_, i) => ({
    id: `c_s4_${i + 1}`,
    seriesId: 's_4',
    title: `Chương ${i + 1}`,
    chapterNumber: i + 1,
    publishedAt: new Date(Date.now() - (56 - i) * 86400000).toISOString(),
    thumbnailUrl: null,
    pageCount: 20,
    isRead: false,
    isNew: i > 50
  }))
}

const generatePages = (chapterId: string, count: number = 20) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `p_${chapterId}_${i + 1}`,
    chapterId: chapterId,
    pageNumber: i + 1,
    imageUrl: `https://placehold.co/800x1200/282828/eae0d0?text=Trang+${i + 1}`
  }))
}

// Generate pages for some key chapters so user can read them
export const MOCK_PAGES: Record<string, MangaPage[]> = {
  'c_s1_1': generatePages('c_s1_1'),
  'c_s1_2': generatePages('c_s1_2'),
  'c_s2_1': generatePages('c_s2_1'),
  'c_s3_1': generatePages('c_s3_1'),
  'c_s3_15': generatePages('c_s3_15'), // Latest chapter of s_3
  'c_s4_1': generatePages('c_s4_1')
}
