import React, { useState, useEffect } from 'react'
import { MessageSquareText, Clock, ArrowLeftRight, CheckCircle2, History, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { editorService, ApiFeedback } from '@/services/editor.service'

interface DisplayFeedback {
  id: string
  submissionId?: string
  series: string
  chapter: string
  page: string
  mangaka: string
  status: 'WAITING' | 'RESUBMITTED' | 'RESOLVED'
  date: string
  items: number
  notes: string
}

export default function FeedbackResubmitPage() {
  const [feedbackList, setFeedbackList] = useState<DisplayFeedback[]>([])
  const [activeTab, setActiveTab] = useState<'WAITING' | 'RESUBMITTED' | 'RESOLVED'>('RESUBMITTED')
  const [selectedFeedback, setSelectedFeedback] = useState<string>('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await editorService.getFeedbacks()
      const data = res.data || res
      const list = Array.isArray(data) ? data : (data.feedbacks || data.items || [])

      const mapped: DisplayFeedback[] = list.map((f: any) => {
        const mapStatus = (s: string): DisplayFeedback['status'] => {
          switch (s?.toLowerCase()) {
            case 'needs_revision': return 'WAITING'
            case 'pending': return 'RESUBMITTED'
            case 'approved': case 'rejected': case 'resolved': return 'RESOLVED'
            default: return 'WAITING'
          }
        }

        return {
          id: f.feedback_id || f.id,
          submissionId: f.submission_id || f.submission?.submission_id,
          series: f.submission?.page?.chapter?.series?.title || '—',
          chapter: f.submission?.page?.chapter?.title || '—',
          page: f.submission?.page?.page_number ? `P.${String(f.submission.page.page_number).padStart(2, '0')}` : '—',
          mangaka: f.mangaka?.name || f.mangaka?.username || f.assistant?.name || f.assistant?.username || '—',
          status: mapStatus(f.submission?.submission_status || f.status),
          date: f.created_at ? new Date(f.created_at).toLocaleDateString('vi-VN') : '—',
          items: f.items_count || 1,
          notes: f.content || '',
        }
      })

      setFeedbackList(mapped)
      if (mapped.length > 0) {
        setSelectedFeedback(mapped[0].id)
      }
    } catch (err: any) {
      console.error('Failed to load feedbacks:', err)
      setError('Không thể tải danh sách phản hồi.')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleApproveResubmission = async () => {
    const item = feedbackList.find(f => f.id === selectedFeedback)
    if (!item) return
    try {
      if (item.submissionId) {
        await editorService.approveSubmission(item.submissionId)
      } else {
        await editorService.updateFeedback(item.id, { content: item.notes })
      }
      setFeedbackList(prev => prev.map(f => f.id === selectedFeedback ? { ...f, status: 'RESOLVED' } : f))
      showToast(`Đã DUYỆT bản sửa của ${item.series} ${item.chapter} - ${item.page}!`)
    } catch (err: any) {
      console.error('Failed to approve:', err)
      showToast('Lỗi khi duyệt bản sửa!')
    }
  }

  const handleRejectResubmission = async () => {
    const item = feedbackList.find(f => f.id === selectedFeedback)
    if (!item) return
    try {
      if (item.submissionId) {
        await editorService.requestSubmissionRevision(item.submissionId, item.notes || 'Cần sửa đổi thêm.')
      } else {
        await editorService.updateFeedback(item.id, { content: item.notes })
      }
      setFeedbackList(prev => prev.map(f => f.id === selectedFeedback ? { ...f, status: 'WAITING' } : f))
      showToast(`Đã yêu cầu ${item.mangaka} sửa lại ${item.chapter} - ${item.page} thêm lần nữa!`)
    } catch (err: any) {
      console.error('Failed to reject:', err)
      showToast('Lỗi khi gửi yêu cầu sửa!')
    }
  }

  const filtered = feedbackList.filter(f => f.status === activeTab)
  const waitingCount = feedbackList.filter(f => f.status === 'WAITING').length
  const resubmittedCount = feedbackList.filter(f => f.status === 'RESUBMITTED').length
  const resolvedCount = feedbackList.filter(f => f.status === 'RESOLVED').length

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-manga-red mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">Đang tải phản hồi...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center border-4 border-red-500 p-8 bg-white">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
          <button onClick={fetchFeedbacks} className="bg-manga-ink text-white font-bold text-xs uppercase px-4 py-2 hover:bg-black transition-colors">Thử lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 flex gap-6 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-manga-ink text-white px-6 py-3 border-4 border-manga-red shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle className="w-5 h-5 text-green-400" />
          {toastMessage}
        </div>
      )}
      {/* Left Column: List */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4">
        <div>
          <h1 className="font-manga text-2xl font-bold uppercase text-manga-ink leading-none">PHẢN HỒI</h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase mt-1 tracking-wider">Theo dõi & So sánh bản nộp lại</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 border-2 border-manga-ink">
          <button onClick={() => setActiveTab('WAITING')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase transition-colors ${activeTab === 'WAITING' ? 'bg-white border-2 border-manga-ink text-manga-ink' : 'text-gray-500 hover:text-manga-ink'}`}>
            Đang Chờ ({waitingCount})
          </button>
          <button onClick={() => setActiveTab('RESUBMITTED')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase transition-colors ${activeTab === 'RESUBMITTED' ? 'bg-white border-2 border-manga-ink text-manga-ink' : 'text-gray-500 hover:text-manga-ink'}`}>
            Đã Nộp Lại ({resubmittedCount})
          </button>
          <button onClick={() => setActiveTab('RESOLVED')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase transition-colors ${activeTab === 'RESOLVED' ? 'bg-white border-2 border-manga-ink text-manga-ink' : 'text-gray-500 hover:text-manga-ink'}`}>
            Đã Xử Lý ({resolvedCount})
          </button>
        </div>

        {/* List */}
        <div className="flex-1 bg-white border-4 border-manga-ink overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs font-bold uppercase">Không có dữ liệu</div>
          ) : (
            <div className="divide-y-2 divide-gray-100">
              {filtered.map(item => (
                <div key={item.id} onClick={() => setSelectedFeedback(item.id)}
                  className={`p-4 cursor-pointer transition-colors ${selectedFeedback === item.id ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-manga-ink">{item.series}</h3>
                      <div className="text-[10px] font-bold text-manga-red">{item.chapter} - {item.page}</div>
                    </div>
                    <span className="bg-orange-100 text-orange-600 px-2 py-0.5 text-[10px] font-bold rounded-sm border border-orange-200">
                      {item.items} góp ý
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{item.notes}</p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 mt-2">
                    <Clock className="w-3 h-3" /> {item.date} · {item.mangaka}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Compare View */}
      <div className="flex-1 bg-white border-4 border-manga-ink flex flex-col">
        {selectedFeedback ? (
          <>
            <div className="p-4 border-b-4 border-manga-ink bg-manga-ink text-white flex justify-between items-center">
              <div>
                <h2 className="font-manga text-xl font-bold uppercase tracking-wider">So Sánh Bản Thảo</h2>
                <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase">Kiểm tra xem tác giả đã sửa theo góp ý chưa</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleRejectResubmission} className="px-4 py-2 bg-white text-manga-ink text-xs font-bold uppercase hover:bg-gray-100 transition-colors flex items-center gap-2 border-2 border-white">
                  <MessageSquareText className="w-4 h-4" /> Vẫn Cần Sửa
                </button>
                <button onClick={handleApproveResubmission} className="px-4 py-2 bg-green-500 text-white text-xs font-bold uppercase hover:bg-green-600 transition-colors flex items-center gap-2 border-2 border-green-400">
                  <CheckCircle2 className="w-4 h-4" /> Duyệt Bản Sửa
                </button>
              </div>
            </div>

            <div className="flex-1 flex bg-[#e8e8e8] p-6 gap-6 relative">
              {/* V1 */}
              <div className="flex-1 flex flex-col">
                <div className="bg-white px-3 py-2 border-2 border-manga-ink border-b-0 flex justify-between items-center">
                  <span className="font-bold text-xs text-manga-ink uppercase flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-500" /> Bản Cũ (Có lỗi)
                  </span>
                </div>
                <div className="flex-1 bg-white border-2 border-manga-ink p-2 relative shadow-lg">
                  <img src="https://placehold.co/400x550/f0f0f0/a0a0a0?text=Old+Version" alt="Old" className="w-full h-full object-contain" />
                  <div className="absolute top-[30%] left-[40%] w-16 h-16 border-2 border-red-500 bg-red-500/20"></div>
                </div>
              </div>

              {/* Icon Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-manga-ink rounded-full flex items-center justify-center z-10 text-manga-ink shadow-lg">
                <ArrowLeftRight className="w-5 h-5" />
              </div>

              {/* V2 */}
              <div className="flex-1 flex flex-col">
                <div className="bg-white px-3 py-2 border-2 border-manga-ink border-b-0 flex justify-between items-center">
                  <span className="font-bold text-xs text-green-600 uppercase flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Bản Mới (Đã sửa)
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">
                    {(() => {
                      const item = feedbackList.find(f => f.id === selectedFeedback)
                      return item ? `Nộp: ${item.date}` : ''
                    })()}
                  </span>
                </div>
                <div className="flex-1 bg-white border-2 border-manga-ink p-2 relative shadow-lg">
                  <img src="https://placehold.co/400x550/ffffff/808080?text=New+Resubmitted+Version" alt="New" className="w-full h-full object-contain" />
                  <div className="absolute top-[30%] left-[40%] w-16 h-16 border-2 border-green-500 border-dashed"></div>
                </div>
              </div>
            </div>

            {/* Editor's Notes */}
            <div className="h-48 border-t-4 border-manga-ink bg-white p-4">
              <h3 className="font-bold text-xs uppercase text-manga-ink mb-2 flex items-center gap-2">
                <MessageSquareText className="w-4 h-4" /> Góp Ý Ban Đầu Của Bạn
              </h3>
              <div className="bg-gray-50 border-2 border-gray-200 p-3 text-sm text-gray-700">
                {(() => {
                  const item = feedbackList.find(f => f.id === selectedFeedback)
                  return item?.notes || 'Không có ghi chú.'
                })()}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 font-bold text-sm uppercase">
            Chọn một bản thảo bên trái để so sánh
          </div>
        )}
      </div>
    </div>
  )
}
