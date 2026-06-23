import React, { useState, useEffect } from 'react'
import { FileText, Clock, CheckCircle, AlertTriangle, X, Eye, ThumbsUp, ThumbsDown, Edit3 } from 'lucide-react'
import { editorService, EditorManuscript } from '@/services/editor.service'

export default function ManuscriptReviewPage() {
  const [manuscripts, setManuscripts] = useState<EditorManuscript[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedManu, setSelectedManu] = useState<any | null>(null)
  
  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revise' | null>(null)
  const [note, setNote] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const loadManuscripts = async () => {
    setLoading(true)
    try {
      const list = await editorService.getPendingManuscripts()
      setManuscripts(list)
    } catch (err: any) {
      console.error(err)
      showToast('error', 'Không thể tải danh sách bản thảo chờ duyệt.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadManuscripts()
  }, [])

  const handleOpenDetail = async (manu: EditorManuscript) => {
    try {
      setLoading(true)
      const detail = await editorService.getManuscriptDetail(manu.manuscript_id)
      setSelectedManu(detail || manu)
      setNote('')
      setActionType(null)
    } catch (err) {
      console.error('Failed to load manuscript detail:', err)
      setSelectedManu(manu)
      setNote('')
      setActionType(null)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkflowAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedManu || !actionType) return

    setIsSubmitting(true)
    try {
      if (actionType === 'approve') {
        await editorService.approve(selectedManu.manuscript_id)
        showToast('success', 'Đã phê duyệt bản thảo thành công!')
      } else if (actionType === 'reject') {
        await editorService.reject(selectedManu.manuscript_id)
        if (note.trim()) {
          try {
            await editorService.sendInternalNotification(
              selectedManu.mangaka_id,
              `Bác bỏ bản thảo: ${selectedManu.title || 'Chương truyện'}`,
              note.trim(),
              `ms_fb:${selectedManu.manuscript_id}`
            )
          } catch (err) {
            console.error('Không thể gửi thông báo nội bộ:', err)
          }
        }
        showToast('success', 'Đã bác bỏ bản thảo thành công!')
      } else if (actionType === 'revise') {
        if (!note.trim()) {
          showToast('error', 'Vui lòng nhập lý do/yêu cầu chỉnh sửa!')
          setIsSubmitting(false)
          return
        }
        await editorService.requestRevision(selectedManu.manuscript_id, note.trim())
        try {
          await editorService.sendInternalNotification(
            selectedManu.mangaka_id,
            `Nhận xét bản thảo: ${selectedManu.title || 'Chương truyện'}`,
            note.trim(),
            `ms_fb:${selectedManu.manuscript_id}`
          )
        } catch (err) {
          console.error('Không thể gửi thông báo nội bộ:', err)
        }
        showToast('success', 'Đã gửi yêu cầu chỉnh sửa bản thảo!')
      }

      setSelectedManu(null)
      setActionType(null)
      setNote('')
      await loadManuscripts()
    } catch (err: any) {
      console.error(err)
      showToast('error', err.response?.data?.message || 'Thao tác phê duyệt thất bại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getImageUrl = (url?: string | null) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    return `${apiURL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  return (
    <div className="max-w-6xl mx-auto pb-16 font-sans text-manga-ink">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-manga-red text-white'
        }`}>
          <p className="font-bold text-xs uppercase tracking-wider">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">
          XEM XẾT BẢN THẢO (MANUSCRIPT REVIEW)
        </h1>
        <div className="h-1.5 w-24 bg-manga-red mt-3 mb-2" />
        <p className="text-xs font-bold text-gray-500 uppercase">
          Danh sách bản thảo kịch bản chính thức từ Mangaka nộp chờ ban biên tập duyệt sơ khảo
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white border-4 border-manga-ink p-4 flex items-center justify-between shadow-[4px_4px_0px_rgba(15,15,15,1)]">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Đang chờ duyệt</p>
            <p className="text-3xl font-manga font-bold text-orange-500">{manuscripts.length}</p>
          </div>
          <Clock className="w-8 h-8 text-orange-500 opacity-60" />
        </div>
        <div className="bg-white border-4 border-manga-ink p-4 flex items-center justify-between shadow-[4px_4px_0px_rgba(15,15,15,1)]">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Hạn xử lý</p>
            <p className="text-xs font-bold text-gray-700 mt-2">Ưu tiên xử lý nhanh để kịp tiến độ xuất bản</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-manga-red opacity-60" />
        </div>
        <div className="bg-white border-4 border-manga-ink p-4 flex items-center justify-between shadow-[4px_4px_0px_rgba(15,15,15,1)]">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Quy trình duyệt</p>
            <p className="text-xs font-bold text-gray-700 mt-2">Duyệt sơ khảo trước khi trình lên Hội đồng (Review Session)</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600 opacity-60" />
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white border-4 border-manga-ink shadow-[6px_6px_0px_rgba(15,15,15,1)]">
        <div className="p-4 border-b-4 border-manga-ink bg-gray-55">
          <h2 className="font-manga font-bold text-xl uppercase">Bản thảo đang chờ duyệt</h2>
        </div>

        {loading && manuscripts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-black border-t-manga-red rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold text-gray-500 uppercase text-xs">Đang tải danh sách bản thảo...</p>
          </div>
        ) : manuscripts.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Không có bản thảo nào cần xem xét</h3>
            <p className="text-xs font-bold text-gray-400 mt-2 uppercase">Hệ thống hiện tại sạch bóng yêu cầu duyệt bản thảo.</p>
          </div>
        ) : (
          <div className="divide-y-2 divide-manga-ink">
            {manuscripts.map((manu) => (
              <div key={manu.manuscript_id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-red-50/10 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-orange-500 text-white border-2 border-black font-extrabold text-[9px] px-2 py-0.5 uppercase">
                      CHỜ DUYỆT SƠ KHẢO
                    </span>
                    <span className="text-xs font-bold text-gray-400">Nộp ngày: {new Date(manu.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>

                  <h3 className="font-manga text-xl font-bold text-manga-ink uppercase leading-snug">
                    {manu.title || 'Bản thảo kịch bản'}
                  </h3>

                  <div className="text-xs font-bold text-gray-500">
                    Tác phẩm: <span className="text-manga-ink">{manu.series?.title || 'Không rõ'}</span>
                    {manu.chapter && (
                      <>
                        {' '}· Chương: <span className="text-manga-ink">Chương {manu.chapter.chapter_number}: {manu.chapter.title}</span>
                      </>
                    )}
                    {' '}· Tác giả: <span className="text-manga-red">{manu.mangaka?.name || manu.mangaka?.username || 'Mangaka'}</span>
                  </div>
                </div>

                <div className="flex gap-3 self-end md:self-auto">
                  <button
                    onClick={() => handleOpenDetail(manu)}
                    className="bg-white hover:bg-gray-100 border-2 border-black font-bold text-xs uppercase px-5 py-2.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> Xem chi tiết & Duyệt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manuscript Detail & Review Modal */}
      {selectedManu && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black w-full max-w-4xl shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-manga-red" />
                <span className="font-manga text-lg font-bold uppercase tracking-wider">Xem xét phê duyệt bản thảo</span>
              </div>
              <button 
                onClick={() => {
                  setSelectedManu(null)
                  setActionType(null)
                }} 
                className="text-white hover:text-manga-red cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-black text-white text-[9px] font-black uppercase px-2 py-0.5">
                  Tác phẩm: {selectedManu.series?.title || 'Không rõ'}
                </span>
                <span className="bg-gray-100 border border-black text-black text-[9px] font-black uppercase px-2 py-0.5">
                  {selectedManu.chapter?.chapter_number ? `Chương ${selectedManu.chapter.chapter_number}: ${selectedManu.chapter.title}` : 'Bản thảo tự do'}
                </span>
                <span className="bg-red-50 border border-manga-red text-manga-red text-[9px] font-black uppercase px-2 py-0.5">
                  Tác giả: {selectedManu.mangaka?.name || selectedManu.mangaka?.username || 'Mangaka'}
                </span>
              </div>

              <h2 className="font-manga text-2xl font-black text-manga-ink border-b-2 border-dashed border-gray-200 pb-2 uppercase">
                {selectedManu.title}
              </h2>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-gray-500">Nội dung kịch bản chữ</label>
                <div className="bg-gray-50 border-2 border-manga-ink p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-[35vh] overflow-y-auto">
                  {selectedManu.content || <em className="text-gray-400">Không có kịch bản chữ được viết...</em>}
                </div>
              </div>

              {/* Attachments if any */}
              {selectedManu.manuscript_file && selectedManu.manuscript_file.length > 0 && (
                <div className="space-y-1.5 border-t border-dashed border-gray-200 pt-3">
                  <label className="block text-xs font-black uppercase text-gray-500">Tệp đính kèm (Bản thảo phác thảo/PSD/ZIP)</label>
                  <div className="flex flex-wrap gap-3">
                    {selectedManu.manuscript_file.map((file: any) => (
                      <a
                        key={file.file_id}
                        href={getImageUrl(file.file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-zinc-50 border-2 border-manga-ink hover:bg-manga-red hover:text-white transition-colors px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-1.5"
                      >
                        📎 {file.file_name || 'Tải file đính kèm'}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Decision Area */}
              <div className="border-t-2 border-dashed border-gray-200 pt-4">
                {actionType === null ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase text-gray-500">Lựa chọn quyết định duyệt sơ khảo</label>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => setActionType('approve')}
                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white border-2 border-black font-manga font-bold text-sm uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ThumbsUp className="w-4 h-4" /> Phê duyệt (Approve)
                      </button>
                      <button
                        onClick={() => setActionType('revise')}
                        className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white border-2 border-black font-manga font-bold text-sm uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" /> Yêu cầu sửa (Revise)
                      </button>
                      <button
                        onClick={() => setActionType('reject')}
                        className="flex-1 py-3 bg-manga-red hover:bg-red-750 text-white border-2 border-black font-manga font-bold text-sm uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ThumbsDown className="w-4 h-4" /> Bác bỏ (Reject)
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleWorkflowAction} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-wider text-manga-ink flex items-center gap-1.5">
                        ✦ Quyết định đã chọn: 
                        <span className={`px-2 py-0.5 border border-black font-extrabold ${
                          actionType === 'approve' ? 'bg-green-100 text-green-800' :
                          actionType === 'reject' ? 'bg-red-100 text-manga-red' :
                          'bg-orange-100 text-orange-850'
                        }`}>
                          {actionType === 'approve' && 'PHÊ DUYỆT'}
                          {actionType === 'reject' && 'BÁC BỎ'}
                          {actionType === 'revise' && 'YÊU CẦU SỬA ĐỔI'}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActionType(null)}
                        className="text-xs font-bold text-gray-500 hover:underline uppercase"
                      >
                        Đổi quyết định
                      </button>
                    </div>

                    {(actionType === 'revise' || actionType === 'reject') && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black uppercase text-gray-500">
                          Nội dung yêu cầu chỉnh sửa / Lý do phản hồi {actionType === 'revise' && <span className="text-manga-red">*</span>}
                        </label>
                        <textarea
                          rows={3}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder={actionType === 'revise' ? "Mô tả chi tiết những phần cần sửa đổi, bổ sung kịch bản..." : "Ghi chú lý do bác bỏ bản thảo kịch bản..."}
                          className="w-full border-2 border-black p-3 text-sm font-semibold focus:outline-none focus:border-manga-red bg-white"
                          required={actionType === 'revise'}
                        />
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setActionType(null)}
                        className="flex-1 py-2.5 border-2 border-black bg-white hover:bg-gray-100 font-bold text-xs uppercase transition-colors cursor-pointer"
                      >
                        Quay lại lựa chọn
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 bg-black text-white border-2 border-black font-manga font-bold text-xs uppercase hover:bg-gray-900 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? 'Đang thực hiện...' : 'Xác nhận quyết định'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t-2 border-dashed border-gray-200 flex gap-4 bg-gray-50 flex-shrink-0 justify-end">
              <button
                onClick={() => {
                  setSelectedManu(null)
                  setActionType(null)
                }}
                className="px-6 py-2.5 border-2 border-black bg-white font-bold text-xs uppercase hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
