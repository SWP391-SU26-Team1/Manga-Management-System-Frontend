import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Plus, BookOpen, Clock, AlertTriangle, FileText, CheckCircle, Tag, CalendarDays } from 'lucide-react'
import { SeriesCard } from '@/components/mangaka/SeriesCard'
import { seriesService, SeriesAPI, getErrorMessage } from '@/services/series.service'
import { chapterService } from '@/services/chapter.service'

const filters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Bản nháp', value: 'draft' },
  { label: 'Đang vẽ', value: 'in_production' },
  { label: 'Chờ duyệt', value: 'under_review' },
  { label: 'Đã xuất bản', value: 'published' },
]

export default function SeriesPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [seriesList, setSeriesList] = useState<SeriesAPI[]>([])
  const [chapterCounts, setChapterCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [counts, setCounts] = useState({
    total: 0, active: 0, waiting: 0, published: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const list = await seriesService.getAll()
        setSeriesList(list)
        setCounts({
          total: list.length,
          active: list.filter(s => s.status === 'in_production').length,
          waiting: list.filter(s => s.status === 'under_review').length,
          published: list.filter(s => s.status === 'published').length,
        })

        // Load chapter counts for each series
        const counts: Record<string, number> = {}
        await Promise.all(
          list.map(async (s) => {
            try {
              const chapters = await chapterService.getBySeriesId(s._id)
              counts[s._id] = chapters.length
            } catch {
              counts[s._id] = 0
            }
          })
        )
        setChapterCounts(counts)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered =
    activeFilter === 'all'
      ? seriesList
      : seriesList.filter(s => s.status === activeFilter)

  return (
    <div className="max-w-6xl mx-auto pb-16 relative">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none">
            DANH SÁCH SERIES
          </h1>
          <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none mt-1">
            CỦA TÔI
          </h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3" />
        </div>
        <Link
          to="/dashboard/mangaka/create-series"
          className="flex items-center gap-2 bg-manga-red text-white font-manga font-bold text-lg uppercase px-6 py-4 border-2 border-manga-ink manga-shadow hover:translate-y-0.5 hover:manga-shadow-none transition-all mt-2"
        >
          <Plus className="w-5 h-5" />
          TẠO SERIES MỚI
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Tổng tác phẩm', value: counts.total, icon: BookOpen },
          { label: 'Đang sáng tác', value: counts.active, icon: CheckCircle },
          { label: 'Chờ phê duyệt', value: counts.waiting, icon: Clock, red: counts.waiting > 0 },
          { label: 'Đã xuất bản', value: counts.published, icon: FileText },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`bg-white border-2 border-manga-ink p-3 flex flex-col items-center manga-shadow-sm ${
                stat.red ? 'border-manga-red bg-red-50/10' : ''
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${stat.red ? 'text-manga-red animate-pulse' : 'text-manga-ink'}`} />
              <span className={`font-manga text-2xl font-bold ${stat.red ? 'text-manga-red' : 'text-manga-ink'}`}>
                {stat.value}
              </span>
              <span className="text-[9px] font-bold text-gray-500 uppercase text-center leading-tight mt-1">
                {stat.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b-2 border-manga-ink pb-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-2 font-bold text-sm border-2 transition-all ${
              activeFilter === f.value
                ? 'bg-manga-ink text-white border-manga-ink manga-shadow-sm'
                : 'bg-white text-manga-ink border-manga-ink hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-manga-red p-4 mb-6 flex items-center gap-2 text-manga-red font-bold text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
          <div className="w-10 h-10 border-4 border-manga-ink border-t-manga-red rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-gray-500 uppercase text-sm">Đang tải danh sách series...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="font-manga text-2xl font-bold uppercase text-gray-500 mb-1">Không tìm thấy series nào</h3>
          <p className="text-sm font-bold text-gray-400">
            Hãy đổi bộ lọc hoặc bấm nút "Tạo series mới" để thêm tác phẩm manga.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((s) => (
            <SeriesCard
              key={s._id}
              series={{
                id: s._id,
                title: s.title,
                description: s.description,
                tags: s.genre ? s.genre.split(', ') : [],
                coverUrl: s.cover_image ?? null,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                status: s.status as any,
                nextDeadline: s.updated_at ?? s.created_at,
                createdAt: s.created_at,
              }}
              chapterCount={chapterCounts[s._id] ?? 0}
              onCreateChapter={() => {}}
            />

          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t-2 border-manga-ink flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-gray-500">
        <div className="font-manga text-2xl text-manga-red">MangaFlow</div>
        <div>© 2026 MangaFlow System. Gangan Press Co. Ltd. All rights reserved.</div>
        <div className="flex items-center gap-6">
          <Link to="/dashboard/mangaka" className="hover:text-manga-red transition-colors flex items-center gap-1">
            <CalendarDays className="w-4 h-4" /> Lịch trình
          </Link>
          <a href="#" className="hover:text-manga-red transition-colors">Quy tắc xuất bản</a>
          <a href="#" className="hover:text-manga-red transition-colors">Hỗ trợ Mangaka</a>
        </div>
      </footer>
    </div>
  )
}
