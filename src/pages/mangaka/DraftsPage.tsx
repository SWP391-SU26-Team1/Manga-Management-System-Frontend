import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { FileEdit, FileText, Trash2, Edit, Save, X, Eye, BookOpen, Clock, AlertTriangle, Send } from 'lucide-react'
import { seriesService, SeriesAPI } from '@/services/series.service'
import { chapterService } from '@/services/chapter.service'
import { manuscriptService, ManuscriptAPI } from '@/services/manuscript.service'

interface EnrichedDraft {
  id: string
  title: string
  content: string
  status: string
  seriesId: string
  seriesTitle: string
  chapterId?: string
  chapterNumber?: number
  chapterTitle?: string
  createdAt: string
  updatedAt?: string
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<EnrichedDraft[]>([])
  const [seriesList, setSeriesList] = useState<SeriesAPI[]>([])
  
  // UI states
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' })
  
  // Edit modal state
  const [editingManuscript, setEditingManuscript] = useState<EnrichedDraft | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean
    type: 'delete' | 'submit'
    id: string
    title: string
  }>({ show: false, type: 'delete', id: '', title: '' })

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const sl = await seriesService.getAll()
      setSeriesList(sl)

      // Fetch all chapters & manuscripts for all series in parallel
      const chsPromises = sl.map(s => chapterService.getBySeriesId(s._id).catch(() => []))
      const msPromises = sl.map(s => manuscriptService.getBySeriesId(s._id).catch(() => []))

      const chsResults = await Promise.all(chsPromises)
      const msResults = await Promise.all(msPromises)

      const allChapters = chsResults.flat()
      const allManuscripts = msResults.flat()

      // Enrich and filter draft manuscripts (status: 'draft')
      const enriched = allManuscripts
        .filter((m: any) => m.status === 'draft')
        .map((m: any) => {
          const series = sl.find(s => s._id === m.series_id)
          const chapter = allChapters.find(ch => ch._id === m.chapter_id)

          return {
            id: m._id,
            title: m.title || 'Bản thảo không tên',
            content: m.content || '',
            status: m.status,
            seriesId: m.series_id,
            seriesTitle: series?.title || 'Không rõ',
            chapterId: m.chapter_id,
            chapterNumber: chapter?.chapter_number,
            chapterTitle: chapter?.title,
            createdAt: m.created_at,
            updatedAt: m.updated_at
          }
        })
        // Sort by updated_at or created_at descending
        .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())

      // Remove duplicate manuscripts by id if any (defensive check)
      const uniqueDrafts = enriched.filter((item, index, self) =>
        self.findIndex(t => t.id === item.id) === index
      )

      setDrafts(uniqueDrafts)
    } catch (err) {
      console.error(err)
      showToast('error', 'Không thể tải danh sách bản thảo nháp.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenEdit = (m: EnrichedDraft) => {
    setEditingManuscript(m)
    const cleanT = m.title.replace(/^\[ĐÃ DUYỆT\]\s*/i, '').replace(/^\[GỢI Ý\]\s*/i, '')
    setEditTitle(cleanT)
    setEditContent(m.content)
  }

  const handleSaveEdit = async () => {
    if (!editingManuscript) return
    setIsSaving(true)
    try {
      await manuscriptService.update(editingManuscript.id, {
        title: editTitle.trim(),
        content: editContent.trim()
      })
      showToast('success', 'Đã lưu chỉnh sửa bản thảo thành công!')
      setEditingManuscript(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      showToast('error', err.response?.data?.message || 'Không thể lưu bản thảo.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-2 max-w-7xl mx-auto flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
          toast.type === 'success' ? 'bg-[#4BB543] text-white' : 'bg-[#E63946] text-white'
        }`}>
          <p className="font-bold text-xs uppercase tracking-wider">{toast.message}</p>
        </div>
      )}

      <div className="flex gap-8">
        {/* Main Left Area */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-black uppercase select-none">
                BẢN THẢO NHÁP ĐANG SOẠN
              </h1>
              <div className="w-28 h-2 bg-[#E63946] mt-2 mb-4"></div>
              <p className="text-[13px] text-gray-500 font-bold leading-normal">
                Nơi xem và chốt bản thảo nháp được phối hợp giữa bạn và Trợ lý trước khi nộp chính thức lên ban biên tập duyệt.
              </p>
            </div>
            <Link
              to="/dashboard/mangaka/create-manuscript"
              className="bg-[#E63946] text-white border-2 border-black font-bold uppercase py-2.5 px-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 text-xs"
            >
              + TẠO BẢN THẢO MỚI
            </Link>
          </div>

          {/* Draft List */}
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-black border-t-[#E63946] rounded-full animate-spin mx-auto mb-4" />
              <p className="font-bold text-gray-500 uppercase text-xs">Đang đồng bộ dữ liệu bản thảo nháp...</p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="border-4 border-dashed border-gray-300 p-16 text-center bg-gray-50">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="font-bold text-gray-700 mb-2 uppercase text-sm">Không tìm thấy bản thảo nháp nào</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
                Hiện tại chưa có bản thảo nháp nào được tạo cho các tác phẩm của bạn. Hãy tạo mới bản thảo để cộng tác cùng Trợ lý.
              </p>
              <Link
                to="/dashboard/mangaka/create-manuscript"
                className="inline-block px-5 py-2.5 border-2 border-black bg-white font-bold text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
              >
                Gửi bản thảo cho trợ lý
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {drafts.map(m => {
                const isApproved = m.title.includes('[ĐÃ DUYỆT]')
                const isSuggestion = m.title.includes('[GỢI Ý]')
                const cleanTitle = m.title.replace(/^\[ĐÃ DUYỆT\]\s*/i, '').replace(/^\[GỢI Ý\]\s*/i, '')

                return (
                  <div key={m.id} className="bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
                    <div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-black text-white text-[9px] font-black uppercase px-2 py-0.5">
                          {m.seriesTitle}
                        </span>
                        <span className="bg-gray-100 border border-black text-black text-[9px] font-black uppercase px-2 py-0.5">
                          {m.chapterNumber !== undefined ? `Chương ${m.chapterNumber}: ${m.chapterTitle}` : 'Không rõ chương'}
                        </span>
                        {isApproved ? (
                          <span className="bg-[#D1FAE5] border border-[#10B981] text-[#065F46] text-[9px] font-black uppercase px-2 py-0.5">
                            ĐÃ DUYỆT BẢN NHÁP (CHAPTER)
                          </span>
                        ) : isSuggestion ? (
                          <span className="bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-[9px] font-black uppercase px-2 py-0.5">
                            GỢI Ý TỪ TRỢ LÝ
                          </span>
                        ) : (
                          <span className="bg-[#FFEDD5] border border-[#F97316] text-[#9A3412] text-[9px] font-black uppercase px-2 py-0.5">
                            ĐANG SOẠN
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-manga text-xl font-bold text-manga-ink leading-tight mb-2 uppercase">
                        {cleanTitle}
                      </h3>

                    {/* Content Preview */}
                    <div className="bg-gray-50 border-2 border-gray-200 p-3 mb-4 rounded-none max-h-40 overflow-y-auto">
                      <p className="text-xs text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">
                        {m.content || <em className="text-gray-400">Không có nội dung kịch bản chữ...</em>}
                      </p>
                    </div>
                  </div>

                  {/* Footer Stats & Actions */}
                  <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-auto">
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Cập nhật: {new Date(m.updatedAt || m.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#E63946] text-white border-2 border-black font-black uppercase hover:bg-red-650 transition-colors cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none text-xs"
                      >
                        <FileEdit className="w-4 h-4" /> Xem & Sửa
                      </button>

                      <button
                        onClick={() => setConfirmModal({ show: true, type: 'delete', id: m.id, title: m.title })}
                        className="px-3 py-2.5 border-2 border-black font-bold text-xs uppercase hover:bg-red-50 text-manga-red transition-colors cursor-pointer bg-white"
                        title="Xóa bản nháp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

        {/* Right Info Sidebar */}
        <div className="w-[280px] flex-shrink-0">
          <div className="border-4 border-black bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <div className="bg-black text-white p-3.5 font-bold text-xs uppercase text-center border-b-4 border-black">
              QUY TRÌNH HỢP TÁC NHÁP
            </div>
            <div className="p-4 flex flex-col gap-4 text-xs font-bold leading-normal text-gray-700">
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 border-2 border-black flex items-center justify-center font-bold text-[10px] bg-white rounded-none flex-shrink-0">
                  1
                </div>
                <p className="pt-0.5 text-gray-900 uppercase tracking-wide">
                  Tác giả tạo bản thảo nháp ban đầu.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 border-2 border-black flex items-center justify-center font-bold text-[10px] bg-white rounded-none flex-shrink-0">
                  2
                </div>
                <p className="pt-0.5">
                  Trợ lý vào cùng xem, bổ sung lời thoại, bản thảo nháp hoặc đính kèm bản vẽ phác thảo.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 border-2 border-black flex items-center justify-center font-bold text-[10px] bg-white rounded-none flex-shrink-0">
                  3
                </div>
                <p className="pt-0.5">
                  Cả 2 trao đổi và chỉnh sửa đồng bộ thời gian thực trên hệ thống.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 border-2 border-black flex items-center justify-center font-bold text-[10px] bg-white rounded-none flex-shrink-0 text-white bg-manga-red">
                  4
                </div>
                <p className="pt-0.5 text-manga-red">
                  Tác giả chốt ý tưởng bản thảo nháp và tiến hành **Giao việc trợ lý** vẽ truyện dựa trên kịch bản đã thống nhất.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Script Modal */}
      {editingManuscript && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-manga-ink w-full max-w-4xl shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#E63946]" />
                <h3 className="font-manga text-lg font-bold uppercase tracking-wider">
                  Cộng tác bản thảo nháp
                </h3>
              </div>
              <button
                onClick={() => setEditingManuscript(null)}
                className="text-white hover:text-[#E63946] transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <span className="bg-gray-100 border border-black text-black text-[9px] font-black uppercase px-2 py-0.5 inline-block mb-2">
                  Tác phẩm: {editingManuscript.seriesTitle}
                </span>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tiêu đề bản thảo nháp</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full border-2 border-manga-ink p-3 font-bold text-sm focus:border-manga-red outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nội dung bản thảo nháp (Manuscript Content)</label>
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={12}
                  className="w-full border-2 border-manga-ink p-3 text-sm focus:border-manga-red outline-none resize-y font-mono bg-white leading-relaxed"
                  placeholder="Viết nội dung bản thảo nháp chi tiết ở đây..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-2 border-dashed border-gray-200 flex gap-4 bg-gray-50">
              <button
                onClick={() => setEditingManuscript(null)}
                className="flex-1 py-3 border-2 border-manga-ink font-bold text-xs uppercase hover:bg-gray-100 transition-colors bg-white cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving || !editTitle.trim() || !editContent.trim()}
                className="flex-1 py-3 bg-[#E63946] text-white border-2 border-black font-black uppercase transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'Đang lưu nháp...' : 'Lưu bản thảo nháp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal (Delete) */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-manga-ink w-full max-w-md shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center gap-3 text-[#E63946] mb-4">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <h3 className="font-manga text-2xl font-bold uppercase text-manga-ink">
                XÁC NHẬN XÓA
              </h3>
            </div>
            
            <p className="text-sm font-bold text-gray-700 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa bản thảo nháp <strong>"{confirmModal.title}"</strong> này không? Hành động này không thể khôi phục.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                className="flex-1 py-2.5 border-2 border-manga-ink font-bold text-xs uppercase hover:bg-gray-100 transition-colors bg-white cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={async () => {
                  const { id } = confirmModal
                  setConfirmModal(prev => ({ ...prev, show: false }))
                  try {
                    await manuscriptService.delete(id)
                    showToast('success', 'Đã xóa bản thảo nháp thành công!')
                    loadData()
                  } catch (err: any) {
                    console.error(err)
                    showToast('error', 'Xóa bản thảo nháp thất bại.')
                  }
                }}
                className="flex-1 py-2.5 bg-[#E63946] text-white border-2 border-black font-black uppercase transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none text-xs cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
