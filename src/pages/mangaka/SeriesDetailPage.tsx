import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import {
  BookOpen, Clock, Layers, PlusSquare,
  FileCheck, ClipboardList, CheckCircle, AlertCircle, BarChart2
} from 'lucide-react'
import { mangakaStore, Series, Chapter, BoardReview } from '@/data/mangakaMockData'

const TABS = ['Danh sách Chapter', 'Trạng thái Board Review']

export default function SeriesDetailPage() {
  const { seriesId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [series, setSeries] = useState<Series | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [boardReviews, setBoardReviews] = useState<BoardReview[]>([])

  useEffect(() => {
    if (seriesId) {
      const s = mangakaStore.getSeries().find(s => s.id === seriesId)
      if (s) {
        setSeries(s)
        setChapters(
          mangakaStore.getChapters()
            .filter(c => c.seriesId === seriesId)
            .sort((a, b) => b.chapterNumber - a.chapterNumber)
        )
        // Filter board reviews for this series
        setBoardReviews(
          mangakaStore.getBoardReviews().filter(r => r.seriesId === seriesId)
        )
      }
    }
  }, [seriesId])

  if (!series) {
    return <div className="p-8 text-center font-bold text-red-500">Đang tải hoặc Không tìm thấy Series!</div>
  }

  const getSeriesStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Waiting Review': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'In Production': return 'bg-green-100 text-green-700 border-green-300'
      case 'Draft': return 'bg-gray-100 text-gray-500 border-gray-300'
      default: return 'bg-gray-100 text-gray-500 border-gray-300'
    }
  }

  const getChapterStatusClasses = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Waiting Review': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'Drawing': return 'bg-green-100 text-green-700 border-green-300'
      case 'Sketching': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'Draft': return 'bg-gray-100 text-gray-500 border-gray-300'
      case 'Need Fix': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-500 border-gray-300'
    }
  }

  const getBoardReviewStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="px-3 py-1 border-2 border-green-500 bg-green-50 text-green-700 font-black text-[10px] uppercase">✓ Đã duyệt</span>
      case 'Waiting':
        return <span className="px-3 py-1 border-2 border-orange-400 bg-orange-50 text-orange-700 font-black text-[10px] uppercase">⏳ Đang xét duyệt</span>
      case 'Need Fix':
        return <span className="px-3 py-1 border-2 border-manga-red bg-red-50 text-red-700 font-black text-[10px] uppercase">✗ Cần chỉnh sửa</span>
      default:
        return <span className="px-3 py-1 border-2 border-gray-300 bg-gray-50 text-gray-500 font-black text-[10px] uppercase">{status}</span>
    }
  }

  return (
    <div className="pb-16">
      {/* Title block */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-manga-red" />
            {series.title}
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-1">Chi tiết tác phẩm & trạng thái Board Review</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Cover & Info */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white border-4 border-manga-ink manga-shadow overflow-hidden">
            <div className="aspect-[3/4] bg-gray-200 border-b-4 border-manga-ink relative">
              {series.coverUrl ? (
                <img src={series.coverUrl} alt={series.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <BookOpen className="w-16 h-16 mb-2" />
                  <span className="font-bold text-sm">NO COVER</span>
                </div>
              )}
            </div>
            <div className="p-5 space-y-3">
              <h2 className="text-xl font-black uppercase tracking-tight leading-none">{series.title}</h2>
              <div className="flex flex-wrap gap-1.5">
                {series.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 border border-manga-ink text-[10px] font-bold uppercase bg-gray-50">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-4">{series.description}</p>

              <div className="pt-2 space-y-2 border-t-2 border-dashed border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold text-xs uppercase">Trạng thái:</span>
                  <span className={`px-2 py-0.5 font-bold uppercase text-[10px] border-2 ${getSeriesStatusColor(series.status)}`}>
                    {series.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold text-xs uppercase">Tạo ngày:</span>
                  <span className="font-bold text-xs">{new Date(series.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold text-xs uppercase">Deadline:</span>
                  <span className="font-bold text-xs text-red-600">{new Date(series.nextDeadline).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 space-y-2">
                <Link
                  to={`/dashboard/mangaka/series/${series.id}/create-chapter`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-manga-red text-white font-manga font-bold text-xs uppercase border-2 border-manga-ink hover:bg-red-700 transition-colors"
                >
                  <PlusSquare className="w-4 h-4" /> Tạo Chapter
                </Link>
                <Link
                  to="/dashboard/mangaka/assign-task"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-manga-ink font-bold text-xs uppercase border-2 border-manga-ink hover:bg-gray-50 transition-colors"
                >
                  <ClipboardList className="w-4 h-4" /> Giao việc trợ lý
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Chapter', value: chapters.length, icon: Layers },
              { label: 'Đang vẽ', value: chapters.filter(c => c.status === 'Drawing').length, icon: Clock },
              { label: 'Hoàn thành', value: chapters.filter(c => c.status === 'Completed').length, icon: CheckCircle },
            ].map(stat => (
              <div key={stat.label} className="bg-white border-2 border-manga-ink p-3 text-center">
                <stat.icon className="w-4 h-4 mx-auto mb-1 text-manga-red" />
                <div className="font-manga text-2xl font-bold leading-none">{stat.value}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Tabbed Content */}
        <div className="flex-1 min-w-0">
          {/* Tab headers */}
          <div className="flex border-b-4 border-manga-ink mb-0">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`px-5 py-3 font-manga font-bold text-sm uppercase border-2 border-b-0 transition-colors flex items-center gap-2 ${
                  activeTab === idx
                    ? 'bg-manga-ink text-white border-manga-ink'
                    : 'bg-white text-manga-ink border-manga-ink hover:bg-gray-50'
                }`}
              >
                {idx === 0 ? <Layers className="w-4 h-4" /> : <BarChart2 className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white border-4 border-t-0 border-manga-ink manga-shadow">

            {/* ── TAB 0: Chapter list ── */}
            {activeTab === 0 && (
              <>
                <div className="p-4 border-b-2 border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-500 uppercase">{chapters.length} chapter</span>
                </div>
                <div className="divide-y-2 divide-gray-100">
                  {chapters.map(chapter => (
                    <div key={chapter.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-red-50/20 transition-colors">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-manga text-2xl font-bold text-manga-red">CH.{chapter.chapterNumber}</span>
                          <h3 className="font-bold text-base">{chapter.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5" /> {chapter.totalPages} trang
                          </span>
                          <span className="flex items-center gap-1 text-red-600">
                            <Clock className="w-3.5 h-3.5" /> Deadline: {new Date(chapter.deadline).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 font-bold uppercase text-[10px] border-2 ${getChapterStatusClasses(chapter.status)}`}>
                          {chapter.status}
                        </span>
                        <button
                          onClick={() => navigate('/dashboard/mangaka/manuscripts')}
                          className="p-2 border-2 border-manga-ink bg-white hover:bg-manga-ink hover:text-white transition-colors"
                          title="Xem bản thảo"
                        >
                          <FileCheck className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {chapters.length === 0 && (
                    <div className="p-12 text-center text-gray-400 font-bold">
                      Series này chưa có chapter nào.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── TAB 1: Board Review Status ── */}
            {activeTab === 1 && (
              <div className="p-6">
                {/* Status summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Đã trình', value: boardReviews.length, color: 'text-manga-ink' },
                    { label: 'Chờ duyệt', value: boardReviews.filter(r => r.status === 'Waiting').length, color: 'text-orange-500' },
                    { label: 'Đã duyệt', value: boardReviews.filter(r => r.status === 'Approved').length, color: 'text-green-600' },
                  ].map(stat => (
                    <div key={stat.label} className="border-2 border-manga-ink p-4 text-center">
                      <div className={`font-manga text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Board reviews list */}
                {boardReviews.length > 0 ? (
                  <div className="space-y-3">
                    {boardReviews.map(review => (
                      <div key={review.id} className="border-2 border-manga-ink p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-sm mb-0.5">
                            {review.chapterId || 'Hồ sơ series'}
                          </div>
                          <div className="text-[11px] text-gray-400 font-bold uppercase">
                            Ngày nộp: {new Date(review.submittedAt).toLocaleDateString('vi-VN')}
                          </div>
                          {review.feedback && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                              Phản hồi: {review.feedback}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0">
                          {getBoardReviewStatusBadge(review.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-gray-200">
                    <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-400 text-sm">Chưa có lần trình duyệt nào cho series này.</p>
                    <p className="text-xs text-gray-400 font-bold mt-1 uppercase">
                      Trạng thái xét duyệt sẽ xuất hiện ở đây sau khi bạn nộp hồ sơ lên Hội đồng.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
