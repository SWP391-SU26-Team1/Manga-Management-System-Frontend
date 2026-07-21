import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { FileEdit, FileText, Trash2, Edit, Save, X, Eye, BookOpen, Layers, Clock, AlertTriangle, Loader2, Send } from 'lucide-react'
import assistantService from '@/services/assistant.service'

interface ManuscriptFile {
  file_id: string
  file_url: string
  file_name: string
  file_type: string
  description: string
  uploaded_at: string
}

interface DraftManuscript {
  manuscript_id: string
  title: string
  content: string
  status: string
  series_id: string
  chapter_id: string
  created_at: string
  updated_at: string
  series?: {
    series_id: string
    title: string
  }
  chapter?: {
    chapter_id: string
    chapter_number: number
    title: string
  }
  manuscript_file?: ManuscriptFile[]
}

interface DraftPage {
  page_id: string
  page_number: number
  chapter_id: string
  status: string
  created_at: string
  updated_at: string
  chapter?: {
    chapter_id: string
    chapter_number: number
    title: string
    series_id: string
  }
  page_region?: Array<{
    region_id: string
    x: number
    y: number
    width: number
    height: number
  }>
  page_version?: Array<{
    version_id: string
    version_number: number
    version_type: string
    image_url: string
  }>
}

export default function DraftsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'manuscripts' | 'pages'>('manuscripts')
  
  // Data lists
  const [manuscripts, setManuscripts] = useState<DraftManuscript[]>([])
  const [draftPages, setDraftPages] = useState<DraftPage[]>([])
  
  // Loading & Error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Manuscript Edit Modal State
  const [editingManuscript, setEditingManuscript] = useState<DraftManuscript | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [viewingManuscript, setViewingManuscript] = useState<DraftManuscript | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean
    type: 'submit' | 'delete'
    id: string
    title: string
  }>({ show: false, type: 'submit', id: '', title: '' })

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      if (activeTab === 'manuscripts') {
        const list = await assistantService.listDraftManuscripts()
        
        // Fetch detailed info for each manuscript to load files list (since list API doesn't return files)
        const detailedList = await Promise.all(
          list.map(async (manu) => {
            try {
              const detail = await assistantService.getManuscriptDetail(manu.manuscript_id)
              return {
                ...manu,
                manuscript_file: detail.manuscript_file || []
              }
            } catch (err) {
              console.error(`Failed to load details for manuscript ${manu.manuscript_id}:`, err)
              return { ...manu, manuscript_file: [] }
            }
          })
        )
        
        // Remove duplicate manuscripts by manuscript_id if any (defensive check)
        const uniqueManuscripts = detailedList.filter((item, index, self) =>
          self.findIndex(t => t.manuscript_id === item.manuscript_id) === index
        )

        // Sort by updated_at or created_at descending
        const sortedManuscripts = uniqueManuscripts.sort((a, b) => {
          const tA = new Date(a.updated_at || a.created_at).getTime()
          const tB = new Date(b.updated_at || b.created_at).getTime()
          return tB - tA
        })
        
        setManuscripts(sortedManuscripts)
      } else {
        const data = await assistantService.listDraftPages()
        setDraftPages(data)
      }
    } catch (err: any) {
      console.error(err)
      setError('Không thể tải danh sách bản nháp từ hệ thống API.')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  // Manuscript Edit
  const handleOpenEdit = (manu: DraftManuscript) => {
    setEditingManuscript(manu)
    const cleanT = (manu.title || '').replace(/^\[ĐÃ DUYỆT\]\s*/i, '').replace(/^\[GỢI Ý\]\s*/i, '')
    setEditTitle(cleanT)
    setEditContent(manu.content || '')
  }

  const handleSaveEdit = async () => {
    if (!editingManuscript) return
    setIsSaving(true)
    try {
      const cleanT = editTitle.replace(/^\[ĐÃ DUYỆT\]\s*/i, '').replace(/^\[GỢI Ý\]\s*/i, '')
      const suggestionTitle = `[GỢI Ý] ${cleanT}`
      await assistantService.updateManuscriptDraft(editingManuscript.manuscript_id, {
        title: suggestionTitle,
        content: editContent,
      })
      showToast('success', 'Đã cập nhật bản thảo nháp thành công!')
      setEditingManuscript(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      showToast('error', 'Cập nhật bản thảo thất bại.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleApproveManuscript = async (manu: DraftManuscript) => {
    setIsApproving(true)
    try {
      const cleanTitle = (manu.title || '').replace(/^\[ĐÃ DUYỆT\]\s*/i, '').replace(/^\[GỢI Ý\]\s*/i, '')
      const approvedTitle = `[ĐÃ DUYỆT] ${cleanTitle}`
      await assistantService.updateManuscriptDraft(manu.manuscript_id, {
        title: approvedTitle
      })
      showToast('success', 'Đã duyệt bản thảo thành công!')
      setViewingManuscript(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      showToast('error', 'Duyệt bản thảo thất bại.')
    } finally {
      setIsApproving(false)
    }
  }

  // Handlers for Delete/Submit are now processed via the custom confirm modal component.

  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop'
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    return `${apiURL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-16 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className={`manga-border manga-shadow-sm p-4 flex items-center gap-3 bg-white ${
            toast.type === 'success' ? 'border-emerald-500 text-emerald-800' : 'border-manga-red text-manga-red'
          }`}>
            <span className="font-manga text-sm font-black uppercase tracking-wider">
              {toast.type === 'success' ? 'THÀNH CÔNG!' : 'THẤT BẠI!'}
            </span>
            <span className="text-xs font-bold text-gray-700">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">BẢN THẢO CỦA TÔI</h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3 mb-2" />
          <p className="text-sm font-semibold text-gray-500">
            Quản lý bản thảo nháp và trang phân cảnh nháp đang xây dựng trước khi hoạt động
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-4 border-manga-ink bg-white manga-shadow-sm mb-6 max-w-md">
        <button
          onClick={() => setActiveTab('manuscripts')}
          className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider border-r-2 border-manga-ink transition-colors cursor-pointer ${
            activeTab === 'manuscripts' ? 'bg-manga-ink text-white' : 'hover:bg-gray-150 text-gray-600 bg-white'
          }`}
        >
          Bản thảo nháp ({activeTab === 'manuscripts' && !loading ? manuscripts.length : '...'})
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'pages' ? 'bg-manga-ink text-white' : 'hover:bg-gray-150 text-gray-600 bg-white'
          }`}
        >
          Trang Nháp ({activeTab === 'pages' && !loading ? draftPages.length : '...'})
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex items-center justify-center flex-col gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-manga-red" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải bản nháp...</span>
        </div>
      ) : error ? (
        <div className="bg-[#FFF5F5] border-4 border-manga-ink p-8 text-center manga-shadow-sm">
          <AlertTriangle className="w-12 h-12 text-[#E63946] mx-auto mb-3" />
          <h3 className="font-bold text-[#E63946]">{error}</h3>
        </div>
      ) : activeTab === 'manuscripts' ? (
        /* --- MANUSCRIPT DRAFTS LIST --- */
        manuscripts.length === 0 ? (
          <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Không có bản thảo nháp nào</h3>
            <p className="text-sm text-gray-400 mt-2 font-medium">Bản thảo nháp sẽ xuất hiện ở đây khi bạn tạo nháp.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {manuscripts.map((manu) => {
              const isApproved = manu.title.includes('[ĐÃ DUYỆT]')
              const isSuggestion = manu.title.includes('[GỢI Ý]')
              const cleanTitle = manu.title.replace(/^\[ĐÃ DUYỆT\]\s*/i, '').replace(/^\[GỢI Ý\]\s*/i, '')

              return (
                <div
                  key={manu.manuscript_id}
                  className="bg-white border-4 border-manga-ink p-6 manga-shadow hover:translate-y-[-2px] transition-all relative flex flex-col md:flex-row md:items-start justify-between gap-6"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      {isApproved ? (
                        <span className="bg-[#D1FAE5] border border-[#10B981] text-[#065F46] text-[10px] font-bold uppercase px-2 py-0.5">
                          ĐÃ DUYỆT BẢN NHÁP (CHAPTER)
                        </span>
                      ) : isSuggestion ? (
                        <span className="bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-[10px] font-bold uppercase px-2 py-0.5">
                          GỢI Ý TỪ TRỢ LÝ
                        </span>
                      ) : (
                        <span className="bg-[#FFEDD5] border border-[#F97316] text-[#9A3412] text-[10px] font-bold uppercase px-2 py-0.5">
                          ĐANG SOẠN
                        </span>
                      )}
                      <span className="text-xs font-bold text-gray-400">ID: {manu.manuscript_id.slice(0, 8)}</span>
                    </div>
                    
                    <div>
                      <h3 className="font-manga text-xl font-bold text-manga-ink uppercase leading-snug">
                        {cleanTitle}
                      </h3>
                    <p className="text-xs font-bold text-gray-500 mt-1">
                      Series: <span className="text-manga-ink">{manu.series?.title || 'Chưa liên kết'}</span> · Chương: <span className="text-manga-ink">{manu.chapter?.title || `Ch. ${manu.chapter?.chapter_number || '?'}`}</span>
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-3 bg-gray-50 p-3 border-2 border-dashed border-gray-200">
                    {manu.content || 'Không có nội dung kịch bản...'}
                  </p>

                  {manu.manuscript_file && manu.manuscript_file.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <p className="text-[10px] font-black uppercase text-gray-450 tracking-wider">Tài liệu đính kèm:</p>
                      <div className="flex flex-wrap gap-2">
                        {manu.manuscript_file.map(file => (
                          <a
                            key={file.file_id}
                            href={getImageUrl(file.file_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-zinc-100 hover:bg-manga-red hover:text-white border border-gray-300 hover:border-manga-ink transition-colors px-2 py-1 text-[10px] font-bold uppercase truncate max-w-[200px] block"
                            title={file.file_name}
                          >
                            📎 {file.file_name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Cập nhật lúc: {new Date(manu.updated_at).toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 shrink-0 self-end md:self-auto">
                  <button
                    onClick={() => handleOpenEdit(manu)}
                    className="flex-1 md:w-[130px] flex items-center justify-center gap-1.5 px-4 py-2 border-2 border-manga-ink bg-white hover:bg-zinc-100 font-bold text-xs uppercase transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Edit className="w-3.5 h-3.5" /> Góp ý cho Tác giả
                  </button>
                  <button
                    onClick={() => setViewingManuscript(manu)}
                    className="flex-1 md:w-[130px] flex items-center justify-center gap-1.5 px-4 py-2 border-2 border-black bg-[#E63946] text-white hover:bg-red-750 font-bold text-xs uppercase transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem bản thảo
                  </button>
                  <button
                    onClick={() => setConfirmModal({ show: true, type: 'delete', id: manu.manuscript_id, title: manu.title })}
                    className="flex-1 md:w-[130px] flex items-center justify-center gap-1.5 px-4 py-2 border-2 border-manga-ink bg-white hover:bg-red-50 hover:text-manga-red transition-colors text-gray-700 font-bold text-xs uppercase cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )
      ) : (
        /* --- DRAFT PAGES LIST --- */
        draftPages.length === 0 ? (
          <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
            <Layers className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Không có trang nháp nào</h3>
            <p className="text-sm text-gray-400 mt-2 font-medium">Trang vẽ nháp phân cảnh sẽ xuất hiện khi có yêu cầu phác thảo từ Mangaka.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftPages.map((page) => {
              const latestVersion = page.page_version?.[page.page_version.length - 1]
              const preview = latestVersion?.image_url || ''
              return (
                <div
                  key={page.page_id}
                  className="bg-white border-4 border-manga-ink manga-shadow hover:translate-y-[-2px] transition-all flex flex-col group overflow-hidden"
                >
                  <div className="relative aspect-[4/5] bg-zinc-155 border-b-4 border-manga-ink overflow-hidden flex items-center justify-center">
                    {preview ? (
                      <img
                        src={getImageUrl(preview)}
                        alt={`Page ${page.page_number}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Layers className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Chưa có bản vẽ phác thảo</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => navigate(`/dashboard/assistant/drawing-studio?pageId=${page.page_id}`)}
                        className="bg-white text-manga-ink px-4 py-2.5 font-bold uppercase text-xs flex items-center gap-2 hover:bg-manga-red hover:text-white transition-colors border-2 border-manga-ink shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer"
                      >
                        <Eye className="w-4 h-4" /> Mở Drawing Workspace
                      </button>
                    </div>
                    
                    <div className="absolute top-3 left-3 bg-white border-2 border-manga-ink px-2 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      Trang {page.page_number}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="font-manga text-lg font-bold text-manga-ink uppercase leading-none truncate">
                        {page.chapter?.title || `Chương ${page.chapter?.chapter_number || '?'}`}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 truncate">
                        Mã trang: {page.page_id.slice(0, 8)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 border-t-2 border-dashed border-gray-200 pt-3 text-[11px] font-bold text-gray-650">
                      <div>
                        <span className="text-gray-400 block uppercase text-[9px] tracking-wider mb-0.5">Vùng nhiệm vụ:</span>
                        <span>{page.page_region?.length || 0} Vùng</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block uppercase text-[9px] tracking-wider mb-0.5">Phiên bản vẽ:</span>
                        <span>{page.page_version?.length || 0} Bản</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Manuscript Edit Modal */}
      {editingManuscript && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-manga-ink w-full max-w-4xl shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <div className="bg-manga-ink text-white p-4 flex justify-between items-center border-b-2 border-manga-ink">
              <h3 className="font-manga text-xl uppercase font-bold tracking-wide">Góp ý cho Tác giả</h3>
              <button onClick={() => setEditingManuscript(null)} className="hover:text-manga-red transition-colors bg-transparent border-none cursor-pointer text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 border-2 border-manga-ink text-xs font-bold space-y-1">
                <p>Series: <span className="text-gray-700">{editingManuscript.series?.title || 'N/A'}</span></p>
                <p>Chương: <span className="text-gray-700">{editingManuscript.chapter?.title || 'N/A'}</span></p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tiêu đề kịch bản</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full border-2 border-manga-ink p-3 font-bold text-sm focus:border-manga-red outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nội dung góp ý / chỉnh sửa kịch bản (Script Suggestion Content)</label>
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={8}
                  className="w-full border-2 border-manga-ink p-3 text-sm focus:border-manga-red outline-none resize-none font-medium bg-white"
                  placeholder="Viết nội dung kịch bản chi tiết ở đây..."
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setEditingManuscript(null)}
                  className="flex-1 py-3 border-2 border-manga-ink font-bold text-xs uppercase hover:bg-gray-100 transition-colors bg-white"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !(editTitle || '').trim() || !(editContent || '').trim()}
                  className="flex-1 py-3 bg-[#E63946] text-white border-2 border-black font-black uppercase transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? 'Đang gửi góp ý...' : 'Gửi góp ý cho Tác giả'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Viewing Manuscript Modal */}
      {viewingManuscript && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-manga-ink w-full max-w-4xl shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
            <div className="bg-black text-white p-4 flex justify-between items-center border-b-2 border-black flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#E63946]" />
                <span className="font-manga text-lg font-bold uppercase tracking-wider">Xem Chi Tiết Bản Thảo</span>
              </div>
              <button onClick={() => setViewingManuscript(null)} className="text-white hover:text-[#E63946] cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-black text-white text-[9px] font-black uppercase px-2 py-0.5">
                  Tác phẩm: {viewingManuscript.series?.title || 'Không rõ'}
                </span>
                <span className="bg-gray-100 border border-black text-black text-[9px] font-black uppercase px-2 py-0.5">
                  {viewingManuscript.chapter?.chapter_number ? `Chương ${viewingManuscript.chapter.chapter_number}: ${viewingManuscript.chapter.title}` : 'Không rõ chương'}
                </span>
              </div>

              <h2 className="font-manga text-2xl font-black text-manga-ink border-b-2 border-dashed border-gray-200 pb-2 uppercase">
                {viewingManuscript.title.replace(/^\[ĐÃ DUYỆT\]\s*/i, '').replace(/^\[GỢI Ý\]\s*/i, '')}
              </h2>

              <div className="bg-gray-50 border-2 border-manga-ink p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
                {viewingManuscript.content || <em className="text-gray-400">Không có nội dung bản thảo...</em>}
              </div>
            </div>

            <div className="p-4 border-t-2 border-dashed border-gray-200 flex gap-4 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => setViewingManuscript(null)}
                className="flex-1 py-3 border-2 border-manga-ink font-bold text-xs uppercase hover:bg-gray-100 transition-colors bg-white cursor-pointer"
              >
                Quay lại
              </button>
              <button
                onClick={() => handleApproveManuscript(viewingManuscript)}
                disabled={isApproving}
                className="flex-1 py-3 bg-[#E63946] text-white border-2 border-black font-black uppercase transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-red-650 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isApproving ? 'Đang duyệt...' : 'Duyệt bản thảo nháp'}
              </button>
            </div>
          </div>
        </div>
      )}
       {/* Custom Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-manga-ink w-full max-w-md shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center gap-3 text-manga-red mb-4">
              <AlertTriangle className="w-8 h-8 shrink-0 text-[#E63946]" />
              <h3 className="font-manga text-2xl font-bold uppercase text-manga-ink">
                {confirmModal.type === 'delete' ? 'XÁC NHẬN XÓA' : 'XÁC NHẬN NỘP'}
              </h3>
            </div>
            
            <p className="text-sm font-bold text-gray-700 mb-6 leading-relaxed">
              {confirmModal.type === 'delete' ? (
                <>Bạn có chắc chắn muốn xóa bản thảo nháp <strong>"{confirmModal.title}"</strong> này không? Hành động này sẽ xóa vĩnh viễn và không thể khôi phục.</>
              ) : (
                <>Bạn có chắc chắn muốn nộp bản thảo nháp <strong>"{confirmModal.title}"</strong> này? Sau khi nộp, bản thảo sẽ được gửi đến Mangaka và đổi trạng thái trên hệ thống.</>
              )}
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
                  const { id, type } = confirmModal
                  setConfirmModal(prev => ({ ...prev, show: false }))
                  if (type === 'delete') {
                    try {
                      await assistantService.deleteManuscriptDraft(id)
                      showToast('success', 'Đã xóa bản thảo thành công!')
                      loadData()
                    } catch (err: any) {
                      console.error(err)
                      showToast('error', 'Xóa bản thảo thất bại.')
                    }
                  } else {
                    try {
                      await assistantService.updateManuscriptDraft(id, { status: 'submitted' })
                      showToast('success', 'Đã nộp bản thảo thành công!')
                      loadData()
                    } catch (err: any) {
                      console.error(err)
                      showToast('error', 'Nộp bản thảo thất bại.')
                    }
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
