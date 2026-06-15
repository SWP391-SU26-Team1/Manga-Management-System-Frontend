import React from 'react'
import { Link } from 'react-router'
import { ArrowRight, CheckCircle2, Edit2, ListOrdered, Clock, BookOpen, Loader2 } from 'lucide-react'
import { SeriesAPI } from '@/services/series.service'
import { ChapterAPI } from '@/services/chapter.service'

interface ManuscriptManagerProps {
  seriesList?: SeriesAPI[]
  allChapters?: ChapterAPI[]
}

type ChapterStatus = 'completed' | 'in_progress' | 'draft' | 'pending' | 'submitted'

const getStatusDetails = (status: string) => {
  switch (status) {
    case 'completed':
      return { label: 'Hoàn thiện', icon: CheckCircle2, color: 'text-manga-red', badgeStyle: 'text-manga-red border-manga-ink font-bold' }
    case 'submitted':
      return { label: 'Chờ duyệt', icon: Clock, color: 'text-blue-600', badgeStyle: 'bg-blue-50 text-blue-600 border-blue-300' }
    case 'in_progress':
      return { label: 'Đang vẽ', icon: Edit2, color: 'text-manga-ink', badgeStyle: 'bg-white border-2 border-manga-ink' }
    case 'draft':
    default:
      return { label: 'Phác thảo', icon: ListOrdered, color: 'text-gray-500', badgeStyle: 'bg-gray-100 text-gray-500 border-gray-300' }
  }
}

// Static cover images for visual variety
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
]

export function ManuscriptManager({ seriesList = [], allChapters = [] }: ManuscriptManagerProps) {
  const isLoading = seriesList.length === 0

  // Lấy 3 chapter mới nhất (sort theo chapter_number desc) từ tất cả series
  const recentChapters = [...allChapters]
    .sort((a, b) => b.chapter_number - a.chapter_number)
    .slice(0, 3)

  // Build series lookup
  const seriesMap = Object.fromEntries(seriesList.map((s) => [s._id, s]))

  return (
    <div className="bg-white manga-border manga-shadow-sm flex flex-col mb-8">
      {/* Header */}
      <div className="bg-manga-ink text-white p-4 flex justify-between items-center">
        <h2 className="font-manga text-2xl font-bold uppercase tracking-wider">
          Quản lý bản thảo
        </h2>
        <Link
          to="/dashboard/mangaka/series"
          className="text-manga-red text-sm font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
        >
          Xem tất cả <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-manga-red" />
          </div>
        ) : recentChapters.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-400 font-bold">
            Chưa có bản thảo chương nào.
          </div>
        ) : (
          recentChapters.map((chapter, idx) => {
            const { label: statusLabel, icon: StatusIcon, color: iconColor, badgeStyle } = getStatusDetails(chapter.status)
            const coverImg = COVER_IMAGES[idx % COVER_IMAGES.length]
            const series = seriesMap[chapter.series_id]

            return (
              <div key={chapter._id} className="flex flex-col group">
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-manga-ink text-white px-3 py-1 font-manga font-bold text-sm">
                    CH.{chapter.chapter_number}
                  </span>
                  <StatusIcon className={`w-5 h-5 ${iconColor}`} />
                </div>

                {/* Series name badge */}
                {series && (
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 truncate">
                    {series.title}
                  </span>
                )}

                {/* Visual Preview */}
                <div className="aspect-[4/3] bg-gray-200 border-2 border-manga-ink mb-4 relative overflow-hidden group-hover:manga-shadow-sm transition-shadow">
                  {chapter.status === 'completed' || chapter.status === 'in_progress' ? (
                    <img
                      src={series?.cover_image || coverImg}
                      alt={`Chương ${chapter.chapter_number}`}
                      className="w-full h-full object-cover grayscale contrast-125"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = coverImg
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
                      <BookOpen className="w-8 h-8 text-gray-300 mb-1" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bản phác thảo</span>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-xl mb-3 truncate" title={chapter.title}>
                  {chapter.title}
                </h3>

                <div className="border-t-2 border-dashed border-manga-ink pt-3 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Trạng thái</span>
                  <span className={`px-2 py-0.5 border font-bold text-sm uppercase ${badgeStyle}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
