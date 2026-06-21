import React, { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { editorService } from '@/services/editor.service'

interface DisplayPage {
  page: string
  status: string
  assignee: string
  meetingDate: string
  deadline: string
  revisions: number
  notes: string
}

interface DisplayChapterProgress {
  id: string
  series: string
  chapter: string
  submitDate: string
  deadline: string
  approvedCount: number
  totalCount: number
  progress: number
  isLate?: boolean
  latePagesCount?: number
  pages: DisplayPage[]
}

const getFriendlyPageStatus = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'SUBMITTED': return 'ĐÃ NỘP'
    case 'APPROVED': return 'ĐÃ DUYỆT'
    case 'REJECTED': return 'ĐÃ TỪ CHỐI'
    case 'IN_REVIEW': case 'IN REVIEW': return 'ĐANG DUYỆT'
    case 'NEED_FIX': case 'NEED-FIX': return 'CẦN SỬA ĐỔI'
    case 'DRAFT': return 'BẢN NHÁP'
    default: return status || '—'
  }
}

export default function PageProgressPage() {
  const [progressData, setProgressData] = useState<DisplayChapterProgress[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [pageStatuses, setPageStatuses] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await editorService.getPendingSubmissions()
      const data = res.data || res
      const submissions = Array.isArray(data) ? data : (data.submissions || data.items || [])

      const mapped: DisplayChapterProgress[] = submissions.map((sub: any, idx: number) => {
        const pages: DisplayPage[] = (sub.pages || []).map((p: any) => ({
          page: `P.${String(p.page_number || 0).padStart(2, '0')}`,
          status: p.status || 'SUBMITTED',
          assignee: p.assignee?.username || sub.submitter?.username || '—',
          meetingDate: p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '—',
          deadline: p.deadline ? new Date(p.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '—',
          revisions: p.revision_count || 0,
          notes: p.notes || '',
        }))

        const approvedCount = pages.filter(p => p.status === 'approved' || p.status === 'APPROVED').length
        const totalCount = pages.length || 1
        const progress = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0

        return {
          id: sub.submission_id || sub.id || `sub-${idx}`,
          series: sub.series?.title || sub.series_title || '—',
          chapter: sub.chapter?.title || `Ch.${sub.chapter?.chapter_number || idx + 1}`,
          submitDate: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('vi-VN') : '—',
          deadline: sub.deadline ? new Date(sub.deadline).toLocaleDateString('vi-VN') : '—',
          approvedCount,
          totalCount,
          progress,
          isLate: sub.is_overdue || false,
          latePagesCount: sub.overdue_pages_count || 0,
          pages,
        }
      })

      setProgressData(mapped)
      if (mapped.length > 0) {
        setExpandedChapters(new Set([mapped[0].id]))
      }
    } catch (err: any) {
      console.error('Failed to load page progress:', err)
      setError('Không thể tải dữ liệu tiến độ trang.')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const filteredProgress = progressData.filter(
    (p) =>
      p.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.chapter.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleExpand = (id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => {
    setExpandedChapters(new Set(filteredProgress.map(c => c.id)))
  }

  const collapseAll = () => {
    setExpandedChapters(new Set())
  }

  const handleApprovePage = async (chapterId: string, pageName: string) => {
    setPageStatuses(prev => ({ ...prev, [`${chapterId}-${pageName}`]: 'APPROVED' }))
    showToast(`Đã DUYỆT trang ${pageName} thành công!`)
  }

  const handleRejectPage = async (chapterId: string, pageName: string) => {
    setPageStatuses(prev => ({ ...prev, [`${chapterId}-${pageName}`]: 'NEED_FIX' }))
    showToast(`Đã yêu cầu sửa lại trang ${pageName}!`)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-manga-red mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">Đang tải tiến độ trang...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center border-4 border-red-500 p-8 bg-white">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
          <button onClick={fetchData} className="bg-manga-ink text-white font-bold text-xs uppercase px-4 py-2 hover:bg-black transition-colors">Thử lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-manga-ink text-white px-6 py-3 border-4 border-manga-red shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle className="w-5 h-5 text-green-400" />
          {toastMessage}
        </div>
      )}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none">CHAPTER / PAGE</h1>
          <p className="text-sm font-bold text-gray-500 mt-2">Theo dõi tiến độ từng chapter và từng trang bản thảo</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Tìm series hoặc chapter..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border-2 border-manga-ink focus:outline-none focus:border-red-600 text-sm font-bold transition-colors" />
        </div>
        <button onClick={expandAll} className="px-4 py-2 border-2 border-manga-ink bg-white hover:bg-gray-50 text-sm font-bold transition-colors">Mở rộng tất cả</button>
        <button onClick={collapseAll} className="px-4 py-2 border-2 border-manga-ink bg-white hover:bg-gray-50 text-sm font-bold transition-colors">Thu gọn tất cả</button>
      </div>

      <div className="space-y-4">
        {filteredProgress.length > 0 ? filteredProgress.map((chapter) => (
          <div key={chapter.id} className="border-2 border-manga-ink bg-white">
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleExpand(chapter.id)}>
              <div className="flex items-center gap-4">
                {expandedChapters.has(chapter.id) ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-manga-ink">{chapter.series}</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold">{chapter.chapter}</span>
                  {chapter.isLate && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold border border-red-200 ml-2">
                      <AlertCircle className="w-3 h-3" /> {chapter.latePagesCount} trang trễ hạn
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-8 text-sm font-bold">
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 uppercase">Nộp: {chapter.submitDate}</div>
                  <div className="text-gray-600">Deadline: {chapter.deadline}</div>
                </div>
                <div className="w-48">
                  <div className="flex justify-between text-[10px] mb-1 uppercase">
                    <span className="text-gray-500">{chapter.approvedCount}/{chapter.totalCount} đã duyệt</span>
                    <span className={chapter.progress === 100 ? 'text-green-600' : 'text-manga-ink'}>{chapter.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100">
                    <div className={`h-full ${chapter.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${chapter.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {expandedChapters.has(chapter.id) && chapter.pages && chapter.pages.length > 0 && (
              <div className="border-t-2 border-gray-100 p-4 bg-gray-50/50">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Trang</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Người Xử Lý</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ngày Nộp</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Deadline</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Số Lần Sửa</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ghi Chú</th>
                      <th className="px-4 py-2 w-40"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {chapter.pages.map((page, idx) => (
                      <tr key={idx} className="hover:bg-white transition-colors">
                        <td className="px-4 py-3 font-bold text-sm text-manga-ink">{page.page}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200 uppercase">{getFriendlyPageStatus(page.status)}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold">{page.assignee.charAt(0)}</div>
                          {page.assignee}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{page.meetingDate}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" /> {page.deadline}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{page.revisions || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{page.notes || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {pageStatuses[`${chapter.id}-${page.page}`] === 'APPROVED' ? (
                              <span className="flex-1 px-2 py-1 bg-green-100 border border-green-500 text-green-700 text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                              </span>
                            ) : pageStatuses[`${chapter.id}-${page.page}`] === 'NEED_FIX' ? (
                              <span className="flex-1 px-2 py-1 bg-orange-100 border border-orange-500 text-orange-700 text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Yêu cầu sửa
                              </span>
                            ) : (
                              <>
                                <button onClick={() => handleApprovePage(chapter.id, page.page)} className="flex-1 px-2 py-1 bg-white border border-green-500 text-green-600 text-[10px] font-bold uppercase hover:bg-green-50 transition-colors flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Duyệt
                                </button>
                                <button onClick={() => handleRejectPage(chapter.id, page.page)} className="flex-1 px-2 py-1 bg-white border border-orange-500 text-orange-600 text-[10px] font-bold uppercase hover:bg-orange-50 transition-colors flex items-center justify-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Sửa
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-12 text-gray-400 text-sm font-bold border-2 border-gray-200 bg-white">
            Không có dữ liệu tiến độ nào
          </div>
        )}
      </div>
    </div>
  )
}
