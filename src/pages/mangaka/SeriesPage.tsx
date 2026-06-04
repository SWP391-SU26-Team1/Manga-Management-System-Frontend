import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Plus, BookOpen, Clock, AlertTriangle, FileText, CheckCircle, Tag } from 'lucide-react'
import { SeriesCard } from '@/components/mangaka/SeriesCard'
import { mangakaStore, Series } from '@/data/mangakaMockData'

const filters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Bản nháp', value: 'Draft' },
  { label: 'Đang vẽ', value: 'In Production' },
  { label: 'Chờ duyệt', value: 'Waiting Review' },
  { label: 'Đã xuất bản', value: 'Published' },
]

export default function SeriesPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    waiting: 0,
    published: 0,
    submissions: 0,
    feedbacks: 0,
  })

  useEffect(() => {
    const list = mangakaStore.getSeries()
    setSeriesList(list)

    const subs = mangakaStore.getSubmissions().filter((s) => s.status === 'Pending').length
    const fbs = mangakaStore.getEditorFeedbacks().filter((f) => f.status === 'Open').length

    setCounts({
      total: list.length,
      active: list.filter((s) => s.status === 'In Production').length,
      waiting: list.filter((s) => s.status === 'Waiting Review').length,
      published: list.filter((s) => s.status === 'Published').length,
      submissions: subs,
      feedbacks: fbs,
    })
  }, [])

  const handleCreateChapter = (seriesId: string) => {
    const title = prompt('Nhập tiêu đề cho Chapter mới:')
    if (!title) return
    const numStr = prompt('Nhập số thứ tự Chapter (ví dụ: 46):')
    if (!numStr) return
    const num = parseInt(numStr)
    if (isNaN(num)) {
      alert('Số thứ tự Chapter không hợp lệ!')
      return
    }
    const deadline = prompt(
      'Nhập hạn chót nộp bản thảo (YYYY-MM-DD):',
      new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]
    )
    if (!deadline) return

    mangakaStore.addChapter({
      seriesId,
      chapterNumber: num,
      title,
      deadline,
      totalPages: 20,
      status: 'Draft',
    })

    alert(`Đã tạo thành công Chương ${num}: ${title}!`)
    const list = mangakaStore.getSeries()
    setSeriesList(list)
  }

  const filtered =
    activeFilter === 'all'
      ? seriesList
      : seriesList.filter((s) => s.status === activeFilter)

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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
        {[
          { label: 'Tổng tác phẩm', value: counts.total, icon: BookOpen },
          { label: 'Đang sáng tác', value: counts.active, icon: CheckCircle },
          { label: 'Chờ phê duyệt', value: counts.waiting, icon: Clock },
          { label: 'Đã xuất bản', value: counts.published, icon: FileText },
          { label: 'Bản vẽ chờ duyệt', value: counts.submissions, icon: AlertTriangle, red: counts.submissions > 0 },
          { label: 'Editor Góp ý', value: counts.feedbacks, icon: Tag, red: counts.feedbacks > 0 },
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

      {/* Series Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="font-manga text-2xl font-bold uppercase text-gray-500 mb-1">Không tìm thấy series nào</h3>
          <p className="text-sm font-bold text-gray-400">
            Hãy đổi bộ lọc hoặc bấm nút "Tạo series mới" để thêm tác phẩm manga.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((s) => {
            const chs = mangakaStore.getChapters(s.id)
            return (
              <SeriesCard
                key={s.id}
                series={s}
                chapterCount={chs.length}
                onCreateChapter={handleCreateChapter}
              />
            )
          })}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 bg-manga-ink text-white py-6 px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold">
        <div className="font-manga text-2xl text-manga-red">MangaFlow</div>
        <div className="text-gray-400">© 2026 MangaFlow System. Gangan Press Co. Ltd.</div>
        <div className="flex items-center gap-6 text-gray-400">
          <button onClick={() => alert('Mở trang Quy tắc xuất bản')} className="hover:text-white transition-colors uppercase">Quy tắc xuất bản</button>
          <button onClick={() => alert('Mở trang Hỗ trợ Mangaka')} className="hover:text-white transition-colors uppercase">Hỗ trợ Mangaka</button>
        </div>
      </footer>
    </div>
  )
}
