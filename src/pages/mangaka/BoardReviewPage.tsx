import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { CheckSquare, Clock, CheckCircle, AlertCircle, FileText, ChevronRight, X } from 'lucide-react'
import { BoardReview } from '@/data/mangakaMockData'
import { seriesService } from '@/services/series.service'
import { manuscriptService } from '@/services/manuscript.service'
import api from '@/services/api'

export default function BoardReviewPage() {
  const [reviews, setReviews] = useState<BoardReview[]>([])
  const [selectedReview, setSelectedReview] = useState<BoardReview | null>(null)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [revisionNote, setRevisionNote] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const slist = await seriesService.getAll()
      
      const mPromises = slist.map(async (s) => {
        try {
          const msList = await manuscriptService.getBySeriesId(s._id)
          return msList.map((m: any) => {
            let status: 'Waiting' | 'Approved' | 'Need Fix' = 'Waiting'
            if (m.status === 'submitted' || m.status === 'pending_review') status = 'Waiting'
            else if (m.status === 'approved' || m.status === 'published') status = 'Approved'
            else if (m.status === 'rejected') status = 'Need Fix'

            return {
              id: m._id,
              seriesId: s.title,
              chapterId: m.chapter ? `Ch.${m.chapter.chapter_number} - ${m.chapter.title}` : (m.title || 'Bản thảo'),
              submittedAt: m.created_at,
              status,
              feedback: m.content || m.description || 'Chưa có nhận xét từ Hội đồng',
              seriesIdRaw: s._id
            } as any
          })
        } catch {
          return []
        }
      })

      const results = await Promise.all(mPromises)
      setReviews(results.flat())
    } catch (err) {
      console.error('Lỗi khi tải danh sách review:', err)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: "Đã trình", value: reviews.length, icon: FileText, color: "text-blue-600" },
    { label: "Chờ duyệt", value: reviews.filter(r => r.status === 'Waiting').length, icon: Clock, color: "text-orange-500" },
    { label: "Đã duyệt", value: reviews.filter(r => r.status === 'Approved').length, icon: CheckCircle, color: "text-green-600" },
    { label: "Cần sửa", value: reviews.filter(r => r.status === 'Need Fix').length, icon: AlertCircle, color: "text-red-600" }
  ]

  const handleSubmitRevision = async () => {
    if (!selectedReview) return;
    try {
      setLoading(true)
      // 1. Update manuscript description first
      await api.patch(`/api/manuscripts/${selectedReview.id}`, { description: revisionNote })
      // 2. Submit the manuscript
      await manuscriptService.submit(selectedReview.id)
      
      alert(`Đã nộp bản sửa đổi cho bản thảo thành công!`);
      setIsSubmitModalOpen(false);
      setSelectedReview(null);
      setRevisionNote('');
      await fetchReviews()
    } catch (err: any) {
      console.error(err)
      alert('Không thể nộp bản sửa đổi. Lỗi: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-red tracking-wide mb-2">
            BOARD REVIEW
          </h1>
          <p className="text-gray-600 font-bold">Theo dõi trạng thái phê duyệt từ Hội đồng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border-4 border-manga-ink manga-shadow p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">{stat.label}</p>
              <p className={`text-3xl font-manga font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <stat.icon className={`w-10 h-10 ${stat.color} opacity-50`} />
          </div>
        ))}
      </div>

      <div className="bg-white border-4 border-manga-ink manga-shadow">
        <div className="p-4 border-b-4 border-manga-ink bg-gray-50">
          <h2 className="font-manga font-bold text-xl uppercase">Danh sách trình duyệt</h2>
        </div>
        <div className="divide-y-2 divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-bold">Đang tải dữ liệu trình duyệt từ Hội đồng...</div>
          ) : (
            <>
              {reviews.map(review => (
                <div key={review.id} className="p-6 flex items-center justify-between hover:bg-red-50/30 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-20 bg-gray-200 border-2 border-manga-ink flex items-center justify-center font-bold text-xs uppercase text-gray-400">Ảnh</div>
                    <div>
                      <h3 className="font-bold text-lg">{review.seriesId} - {review.chapterId}</h3>
                      <p className="text-sm text-gray-500 font-bold">Ngày nộp: {new Date(review.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-4 py-1.5 border-2 border-manga-ink font-bold text-sm uppercase ${
                      review.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      review.status === 'Waiting' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {review.status}
                    </span>
                    <button 
                      onClick={() => setSelectedReview(review)}
                      className="p-2 border-2 border-manga-ink hover:bg-manga-ink hover:text-white transition-colors"
                      title="Xem chi tiết"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="p-8 text-center text-gray-500 font-bold">Chưa có bản thảo nào được trình lên Hội đồng.</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink manga-shadow max-w-2xl w-full">
            <div className="p-4 border-b-4 border-manga-ink flex justify-between items-center bg-gray-50">
              <h2 className="font-manga font-bold text-xl uppercase">Chi tiết Review</h2>
              <button onClick={() => setSelectedReview(null)} className="hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                <div>
                  <p className="text-gray-500">Series / Chapter</p>
                  <p className="text-lg">{selectedReview.seriesId} - {selectedReview.chapterId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Trạng thái</p>
                  <span className={`px-3 py-1 border-2 border-manga-ink uppercase inline-block mt-1 ${
                    selectedReview.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    selectedReview.status === 'Waiting' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>{selectedReview.status}</span>
                </div>
              </div>
              
              {selectedReview.feedback && (
                <div>
                  <p className="text-gray-500 font-bold mb-2 text-sm uppercase">Feedback từ Hội đồng:</p>
                  <div className="p-4 border-2 border-red-200 bg-red-50 text-gray-800 text-sm whitespace-pre-line">
                    {selectedReview.feedback}
                  </div>
                </div>
              )}

              {selectedReview.status === 'Need Fix' && (
                <div className="flex justify-end pt-4 border-t-2 border-gray-100">
                  <button 
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="bg-manga-red text-white font-manga font-bold px-6 py-2 border-2 border-manga-ink hover:bg-red-700 uppercase"
                  >
                    Nộp bản sửa đổi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Revision Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink manga-shadow max-w-lg w-full">
            <div className="p-4 border-b-4 border-manga-ink flex justify-between items-center bg-gray-50">
              <h2 className="font-manga font-bold text-xl uppercase">Nộp bản sửa đổi</h2>
              <button onClick={() => setIsSubmitModalOpen(false)} className="hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Ghi chú sửa đổi</label>
                <textarea 
                  value={revisionNote}
                  onChange={e => setRevisionNote(e.target.value)}
                  className="w-full border-2 border-manga-ink p-3 h-32 focus:ring-2 focus:ring-manga-red"
                  placeholder="Mô tả những gì đã sửa theo yêu cầu..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-6 py-2 border-2 border-manga-ink font-bold hover:bg-gray-100 uppercase"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSubmitRevision}
                  className="bg-manga-ink text-white font-manga font-bold px-6 py-2 border-2 border-black hover:bg-gray-800 uppercase"
                >
                  Gửi đi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
