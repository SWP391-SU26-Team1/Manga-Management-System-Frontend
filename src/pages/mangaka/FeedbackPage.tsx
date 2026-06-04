import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, MessageSquare } from 'lucide-react'
import { mangakaStore, EditorFeedback } from '@/data/mangakaMockData'
import { FeedbackCard } from '@/components/mangaka/FeedbackCard'

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<EditorFeedback[]>([])
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Resolved'>('Open')
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All')

  // Load feedbacks on mount
  useEffect(() => {
    const list = mangakaStore.getEditorFeedbacks()
    const hasDrStone = list.some((f) => f.seriesTitle === "Tiến Sĩ Đá (Dr. Stone)")
    if (!hasDrStone) {
      mangakaStore.reset()
    }
    setFeedbacks(mangakaStore.getEditorFeedbacks())
  }, [])

  // Handler to resolve feedback
  const handleResolveFeedback = (id: string) => {
    mangakaStore.resolveFeedback(id)
    setFeedbacks(mangakaStore.getEditorFeedbacks())
  }

  // Handler to reply to feedback
  const handleReplyFeedback = (id: string, replyContent: string) => {
    mangakaStore.replyFeedback(id, replyContent)
    setFeedbacks(mangakaStore.getEditorFeedbacks())
  }

  // Calculate statistics
  const totalCount = feedbacks.length
  const openCount = feedbacks.filter((f) => f.status === 'Open').length
  const resolvedCount = feedbacks.filter((f) => f.status === 'Resolved').length

  // Filter and sort feedbacks (newest first)
  const filteredFeedbacks = feedbacks
    .filter((f) => {
      const matchStatus = statusFilter === 'All' || f.status === statusFilter
      const matchSeverity = severityFilter === 'All' || f.severity === severityFilter
      return matchStatus && matchSeverity
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="max-w-4xl mx-auto pb-16 font-sans text-manga-ink">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none mb-1">
          GÓP Ý TỪ BIÊN TẬP VIÊN
        </h1>
        <div className="h-1.5 w-24 bg-manga-red mb-3" />
        <p className="text-sm font-bold text-gray-600">
          Xem nhận xét của Editor (Biên tập viên) về kịch bản nháp, phác thảo nhân vật, chì chi tiết hoặc các yêu cầu chỉnh sửa khẩn cấp trước khi xuất bản.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border-2 border-manga-ink p-4 text-center">
          <div className="text-4xl font-extrabold text-manga-ink">{totalCount}</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            Tổng góp ý
          </div>
        </div>
        <div className="bg-white border-2 border-manga-ink p-4 text-center">
          <div className="text-4xl font-extrabold text-manga-red">{openCount}</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            Chờ xử lý (Open)
          </div>
        </div>
        <div className="bg-white border-2 border-manga-ink p-4 text-center">
          <div className="text-4xl font-extrabold text-green-600">{resolvedCount}</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            Đã hoàn thành
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap gap-6 mb-6 bg-white border-2 border-manga-ink p-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-manga-red uppercase tracking-wider flex items-center gap-1">
            ✦ ĐỘ LỌC:
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border-2 border-manga-ink px-2.5 py-1.5 font-bold text-xs bg-white uppercase focus:outline-none"
          >
            <option value="All">Tất cả</option>
            <option value="Open">Chờ xử lý (Open)</option>
            <option value="Resolved">Đã hoàn thành</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Độ nghiêm trọng:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="border-2 border-manga-ink px-2.5 py-1.5 font-bold text-xs bg-white uppercase focus:outline-none"
          >
            <option value="All">Mọi mức độ</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="flex flex-col gap-6">
        {filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map((fb) => (
            <FeedbackCard
              key={fb.id}
              feedback={fb}
              onResolve={handleResolveFeedback}
              onReply={handleReplyFeedback}
            />
          ))
        ) : (
          <div className="border-4 border-dashed border-gray-200 bg-white p-12 text-center text-gray-400 font-bold uppercase text-sm">
            Không tìm thấy góp ý nào khớp với bộ lọc.
          </div>
        )}
      </div>

      {/* Footer Info Box */}
      <div className="mt-8 border-2 border-blue-400 bg-blue-50/50 p-4 text-xs text-blue-800 tracking-wide font-bold uppercase leading-relaxed">
        <div className="text-blue-900 font-extrabold mb-1">
          Tương tác trực tiếp với Biên tập viên:
        </div>
        Tất cả phản hồi và đánh dấu Đã xử lý (Resolved) của bạn sẽ gửi thông báo trực tiếp đến tài khoản quản lý của Editor phụ trách. Vui lòng thảo luận kỹ trước khi nhấn Đã xử lý để tránh việc Editor phải từ chối lại.
      </div>
    </div>
  )
}
