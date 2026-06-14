import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Calendar, User, BookOpen, CheckCircle, Clock } from 'lucide-react'
import { boardStore, ReviewedSeries } from '@/data/boardMockData'
import { boardService } from '@/services/board.service'

export default function SeriesApprovalPage() {
  const [seriesList, setSeriesList] = useState<ReviewedSeries[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await boardService.getReviewedSeries()
        if (res && res.length > 0) {
          setSeriesList(res.map((s: any) => ({
            id: s.id || s.series_id,
            title: s.title,
            authorName: s.authorName || s.author_name || 'Tác giả',
            coverUrl: s.coverUrl || s.cover_image_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300&auto=format&fit=crop',
            genre: s.genre,
            synopsis: s.synopsis || s.description || '',
            submittedAt: s.submittedAt || s.created_at || new Date().toISOString(),
            tantouName: s.tantouName || s.editor_name || 'Biên tập viên',
            tantouOpinion: s.tantouOpinion || s.note || '',
            vote: s.vote ? {
              decision: s.vote.decision,
              note: s.vote.note || '',
              submittedAt: s.vote.submittedAt || s.vote.created_at
            } : undefined
          })))
        } else {
          setSeriesList(boardStore.getReviewedSeries())
        }
      } catch (err) {
        console.warn('API error fetching reviewed series, falling back to mock store:', err)
        setSeriesList(boardStore.getReviewedSeries())
      } finally {
        setLoading(false)
      }
    }
    fetchSeries()
  }, [])

  return (
    <div className="max-w-5xl mx-auto pb-16 font-sans">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase text-manga-ink leading-none">
          PHÊ DUYỆT TÁC PHẨM (SERIES)
        </h1>
        <div className="h-1.5 w-24 bg-manga-red mt-3 mb-2" />
        <p className="text-xs font-bold text-gray-500 uppercase">
          Danh sách các bộ truyện mới (Pilot) đã được Biên tập viên phụ trách (Tantou) duyệt sơ khảo, chờ hội đồng phê duyệt xuất bản
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-manga-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Đang tải dữ liệu tác phẩm...</p>
        </div>
      ) : seriesList.length === 0 ? (
        <div className="bg-white border-4 border-manga-ink p-12 text-center shadow-[6px_6px_0px_rgba(15,15,15,1)]">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Không có series nào chờ phê duyệt</h3>
          <p className="text-xs font-bold text-gray-400 uppercase mt-1">Hội đồng đã hoàn thành tất cả các phiên biểu quyết tác phẩm.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {seriesList.map((series) => (
            <div 
              key={series.id}
              className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_rgba(15,15,15,1)] transition-all flex flex-col md:flex-row gap-6 items-stretch"
            >
              {/* Cover Thumbnail */}
              <div className="w-full md:w-36 h-48 md:h-auto border-4 border-manga-ink overflow-hidden bg-zinc-100 flex-shrink-0 shadow-[2px_2px_0px_rgba(15,15,15,1)]">
                <img 
                  src={series.coverUrl} 
                  alt={series.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Series Information */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-manga-ink text-white text-[9px] font-black px-2.5 py-0.5 border-2 border-manga-ink uppercase">
                      TRẠNG THÁI: CHỜ DUYỆT
                    </span>
                    <span className="bg-zinc-100 text-manga-ink text-[9px] font-bold px-2 py-0.5 border border-manga-ink uppercase">
                      {series.genre}
                    </span>
                  </div>

                  <h3 className="font-manga text-2xl font-black text-manga-ink uppercase leading-none">
                    {series.title}
                  </h3>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-bold text-gray-600">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-manga-red" />
                      Tác giả: {series.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-manga-ink" />
                      Nộp ngày: {new Date(series.submittedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-gray-600 line-clamp-2 leading-relaxed">
                    <strong>Tóm tắt:</strong> {series.synopsis}
                  </p>

                  <div className="bg-[#fcfcfc] border-2 border-dashed border-gray-300 p-2.5 text-[11px] leading-relaxed text-zinc-600">
                    <strong>Ý kiến Tantou ({series.tantouName}):</strong> "{series.tantouOpinion}"
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between border-t-2 border-dashed border-gray-200 pt-3 mt-4">
                  <div>
                    {series.vote ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 bg-emerald-50 border-2 border-emerald-500 px-3 py-1 uppercase">
                        <CheckCircle className="w-4 h-4" />
                        Đã vote: {series.vote.decision === 'APPROVE' ? 'ĐỒNG Ý' : 'BÁC BỎ'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-manga-red bg-red-50 border-2 border-manga-red px-3 py-1 uppercase">
                        Chưa biểu quyết
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/dashboard/editorial-board/series-approval/${series.id}`}
                    className="bg-manga-ink text-white font-manga font-bold text-xs uppercase px-5 py-2 border-2 border-manga-ink shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] transition-all"
                  >
                    Xem & Biểu quyết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
