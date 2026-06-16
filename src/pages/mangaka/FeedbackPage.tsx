import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { CheckCircle, AlertCircle, MessageSquare } from 'lucide-react'
import { EditorFeedback } from '@/data/mangakaMockData'
import { FeedbackCard } from '@/components/mangaka/FeedbackCard'
import { feedbackService } from '@/services/feedback.service'
import { seriesService } from '@/services/series.service'
import { chapterService } from '@/services/chapter.service'

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<EditorFeedback[]>([])
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Resolved'>('Open')
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadFeedbacks = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Load series and map them
      const series = await seriesService.getAll()
      const sMap: Record<string, string> = {}
      series.forEach((s) => {
        sMap[s._id] = s.title
      })

      // 2. Load chapters for all series and map them
      const cMap: Record<string, { chapterNumber: number; seriesId: string }> = {}
      await Promise.all(
        series.map(async (s) => {
          try {
            const chapters = await chapterService.getBySeriesId(s._id)
            chapters.forEach((c) => {
              cMap[c._id] = {
                chapterNumber: c.chapter_number,
                seriesId: s._id,
              }
            })
          } catch (e) {
            console.error('Failed to load chapters for series', s._id, e)
          }
        })
      )

      // 3. Load feedbacks
      const rawFeedbacks = await feedbackService.getAll()

      // 4. Resolve submission details for each feedback in parallel
      const mappedFeedbacks: EditorFeedback[] = await Promise.all(
        rawFeedbacks.map(async (fb) => {
          try {
            let pageNumber: number | undefined
            let chapterNumber: number | undefined
            let seriesId = ''
            let seriesTitle = 'Tác phẩm lẻ'

            if (fb.submission_id) {
              const subDetail = await feedbackService.getSubmissionDetail(fb.submission_id)
              if (subDetail && subDetail.page) {
                pageNumber = subDetail.page.page_number
                const chapterId = subDetail.page.chapter_id
                const chapterInfo = cMap[chapterId]
                if (chapterInfo) {
                  chapterNumber = chapterInfo.chapterNumber
                  seriesId = chapterInfo.seriesId
                  seriesTitle = sMap[seriesId] || 'Tác phẩm lẻ'
                }
              }
            }

            // Severity heuristic if not provided
            let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium'
            const lowerContent = fb.content.toLowerCase()
            if (lowerContent.includes('critical') || lowerContent.includes('gấp') || lowerContent.includes('khẩn cấp') || lowerContent.includes('lỗi nặng')) {
              severity = 'Critical'
            } else if (lowerContent.includes('high') || lowerContent.includes('quan trọng') || lowerContent.includes('sai lệch')) {
              severity = 'High'
            } else if (lowerContent.includes('low') || lowerContent.includes('nhẹ') || lowerContent.includes('tham khảo')) {
              severity = 'Low'
            }

            return {
              id: fb.feedback_id,
              sender: fb.mangaka?.name || fb.mangaka?.username || 'Editor',
              seriesId,
              seriesTitle,
              chapterNumber,
              pageNumber,
              content: fb.content,
              severity,
              status: (fb.status as any) || 'Open',
              createdAt: fb.created_at,
            }
          } catch (e) {
            console.error('Failed to load metadata for feedback', fb.feedback_id, e)
            return {
              id: fb.feedback_id,
              sender: fb.mangaka?.name || fb.mangaka?.username || 'Editor',
              seriesId: '',
              seriesTitle: 'Không rõ tác phẩm',
              content: fb.content,
              severity: 'Medium' as const,
              status: 'Open' as const,
              createdAt: fb.created_at,
            }
          }
        })
      )

      setFeedbacks(mappedFeedbacks)
    } catch (err: any) {
      console.error(err)
      setError('Không thể tải nhận xét từ Editor. Vui lòng kiểm tra lại kết nối.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeedbacks()
  }, [])

  // Handler to resolve feedback
  const handleResolveFeedback = async (id: string) => {
    try {
      await feedbackService.delete(id)
      await loadFeedbacks()
    } catch (err) {
      console.error(err)
      alert('Không thể đánh dấu đã xử lý. Lỗi: ' + ((err as any).response?.data?.message || (err as any).message))
    }
  }

  // Handler to reply to feedback
  const handleReplyFeedback = async (id: string, replyContent: string) => {
    try {
      const fb = feedbacks.find(f => f.id === id)
      if (!fb) return
      
      const updatedContent = `${fb.content}\n\n[Mangaka Phản hồi]: ${replyContent}`
      await feedbackService.reply(id, updatedContent)
      await loadFeedbacks()
    } catch (err) {
      console.error(err)
      alert('Không thể gửi phản hồi. Lỗi: ' + ((err as any).response?.data?.message || (err as any).message))
    }
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
          NHẬN XÉT TỪ TANTOU EDITOR
        </h1>
        <div className="h-1.5 w-24 bg-manga-red mb-3" />
        <p className="text-sm font-bold text-gray-600">
          Xem nhận xét của Tantou Editor (Biên tập viên phụ trách) về kịch bản, phác thảo nhân vật, 
          chì chi tiết hoặc các yêu cầu chỉnh sửa trước khi nộp bản thảo lên Ban biên tập.
          Ðây là luồng phản hồi riêng biệt với việc duyệt kết quả trợ lý.
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
        {loading ? (
          <div className="border-4 border-dashed border-gray-200 bg-white p-12 text-center text-gray-400 font-bold uppercase text-sm">
            Đang tải dữ liệu nhận xét từ Editor...
          </div>
        ) : error ? (
          <div className="border-4 border-manga-red text-manga-red bg-white p-12 text-center font-bold">
            Có lỗi xảy ra: {error}
          </div>
        ) : filteredFeedbacks.length > 0 ? (
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
      {/* Footer */}
      <footer className="mt-16 pt-8 border-t-2 border-manga-ink flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-gray-500">
        <div className="font-manga text-2xl text-manga-red">MangaFlow</div>
        <div>© 2026 MangaFlow System. Gangan Press Co. Ltd. All rights reserved.</div>
        <div className="flex items-center gap-6">
          
          <a href="#" className="hover:text-manga-red transition-colors">Quy tắc xuất bản</a>
          <a href="#" className="hover:text-manga-red transition-colors">Hỗ trợ Mangaka</a>
        </div>
      </footer>
    </div>
  )
}
