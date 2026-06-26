import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { PenTool, Layers, Clock, Eye, AlertTriangle, Loader2, BookOpen, ChevronRight, Trash2, X } from 'lucide-react'
import assistantService from '@/services/assistant.service'

interface DrawingPageAPI {
  page_id: string
  page_number: number
  chapter_id: string
  image_url?: string
  status: string
  created_at: string
  updated_at: string
  chapter?: {
    chapter_id: string
    chapter_number: number
    title: string
    series_id: string
  }
  page_version?: Array<{
    version_id: string
    version_number: number
    version_type: string
    image_url: string
    created_at: string
  }>
  page_task?: Array<{
    task_id: string
    task_type: string
    status: string
    deadline: string
    content: string
    assistant_id: string
  }>
}

export default function DrawingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filterParam = searchParams.get('filter')

  const [pages, setPages] = useState<DrawingPageAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    return filterParam === 'local_drafts' ? 'local_drafts' : 'ALL'
  })

  // Selector lists states
  const [selectorSeriesList, setSelectorSeriesList] = useState<any[]>([])
  const [selectorChaptersMap, setSelectorChaptersMap] = useState<Record<string, any[]>>({})
  const [selectorPagesMap, setSelectorPagesMap] = useState<Record<string, any[]>>({})
  
  // Quick Selector selected states
  const [quickSeriesId, setQuickSeriesId] = useState<string>('')
  const [quickChapterId, setQuickChapterId] = useState<string>('')
  const [quickPageId, setQuickPageId] = useState<string>('')
  
  // Custom states for rich cards & filtering
  const [seriesNamesMap, setSeriesNamesMap] = useState<Record<string, string>>({})
  const [filterSeriesId, setFilterSeriesId] = useState<string>('ALL')
  const [filterTaskType, setFilterTaskType] = useState<string>('ALL')

  const [localDraftPageIds, setLocalDraftPageIds] = useState<string[]>([])

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Delete draft modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetPageId, setDeleteTargetPageId] = useState<string | null>(null)

  const handleDeleteDraftClick = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteTargetPageId(pageId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteDraft = () => {
    if (!deleteTargetPageId) return
    localStorage.removeItem(`mangaflow_drawing_draft_${deleteTargetPageId}`)
    showToast('Đã xóa bản nháp nét vẽ thành công!')
    
    // Refresh page list
    loadDrawingPages()
    
    // Close modal
    setShowDeleteConfirm(false)
    setDeleteTargetPageId(null)
  }

  const getLocalDraftPageIds = (): string[] => {
    const draftIds: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('mangaflow_drawing_draft_')) {
        const pageId = key.replace('mangaflow_drawing_draft_', '')
        try {
          const raw = localStorage.getItem(key)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.strokes && parsed.strokes.length > 0) {
              draftIds.push(pageId)
            }
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
    return draftIds
  }

  const loadDrawingPages = async () => {
    setLoading(true)
    setError(null)
    try {
      const draftIds = getLocalDraftPageIds()
      setLocalDraftPageIds(draftIds)

      const data = await assistantService.listDrawingPages()
      const merged = [...data]

      // Identify missing pages that have local drafts but aren't returned in the active drawing pages list
      const existingPageIds = new Set(data.map(p => p.page_id))
      const missingDraftIds = draftIds.filter(id => !existingPageIds.has(id))

      if (missingDraftIds.length > 0) {
        const promises = missingDraftIds.map(async (pageId) => {
          try {
            const detail = await assistantService.getDrawingPageDetail(pageId)
            return detail
          } catch (e) {
            console.warn(`Error fetching drawing page detail for draft ${pageId}:`, e)
            return null
          }
        })
        const details = await Promise.all(promises)
        details.forEach(detail => {
          if (detail) {
            merged.push(detail)
          }
        })
      }

      setPages(merged)
    } catch (err: any) {
      console.error(err)
      setError('Không thể kết nối máy chủ để tải danh sách trang đang vẽ.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDrawingPages()
    loadSelectorsData()
  }, [])

  useEffect(() => {
    if (filterParam === 'local_drafts') {
      setStatusFilter('local_drafts')
    } else {
      setStatusFilter('ALL')
    }
  }, [filterParam])

  const loadSelectorsData = async () => {
    try {
      const res = await assistantService.listMyTasks({ limit: 100 })
      if (res && res.success && Array.isArray(res.data)) {
        const seriesMap: Record<string, { series_id: string; title: string }> = {}
        const chaptersMap: Record<string, Record<string, { chapter_id: string; title: string; chapter_number: number }>> = {}
        const pagesMap: Record<string, Record<string, { page_id: string; page_number: number }>> = {}
        const namesMap: Record<string, string> = {}

        res.data.forEach((task: any) => {
          const page = task.page
          if (!page) return
          const chapter = page.chapter
          if (!chapter) return
          const series = chapter.series
          if (!series) return

          namesMap[series.series_id] = series.title
          
          seriesMap[series.series_id] = {
            series_id: series.series_id,
            title: series.title
          }

          if (!chaptersMap[series.series_id]) {
            chaptersMap[series.series_id] = {}
          }
          chaptersMap[series.series_id][chapter.chapter_id] = {
            chapter_id: chapter.chapter_id,
            title: chapter.title,
            chapter_number: chapter.chapter_number || 0
          }

          if (!pagesMap[chapter.chapter_id]) {
            pagesMap[chapter.chapter_id] = {}
          }
          pagesMap[chapter.chapter_id][page.page_id] = {
            page_id: page.page_id,
            page_number: page.page_number
          }
        })

        const seriesList = Object.values(seriesMap)

        const finalChaptersMap: Record<string, any[]> = {}
        Object.keys(chaptersMap).forEach(seriesId => {
          finalChaptersMap[seriesId] = Object.values(chaptersMap[seriesId]).sort((a, b) => a.chapter_number - b.chapter_number)
        })

        const finalPagesMap: Record<string, any[]> = {}
        Object.keys(pagesMap).forEach(chapterId => {
          finalPagesMap[chapterId] = Object.values(pagesMap[chapterId]).sort((a, b) => a.page_number - b.page_number)
        })

        setSeriesNamesMap(namesMap)
        setSelectorSeriesList(seriesList)
        setSelectorChaptersMap(finalChaptersMap)
        setSelectorPagesMap(finalPagesMap)

        // Set initial values for Quick Selector
        if (seriesList.length > 0) {
          const firstSeriesId = seriesList[0].series_id
          setQuickSeriesId(firstSeriesId)
          
          const chapters = finalChaptersMap[firstSeriesId] || []
          if (chapters.length > 0) {
            const firstChapterId = chapters[0].chapter_id
            setQuickChapterId(firstChapterId)
            
            const pages = finalPagesMap[firstChapterId] || []
            if (pages.length > 0) {
              setQuickPageId(pages[0].page_id)
            }
          }
        }
      }
    } catch (e) {
      console.error('Lỗi khi tải dữ liệu cho bộ chọn:', e)
    }
  }

  const handleQuickSeriesChange = (seriesId: string) => {
    setQuickSeriesId(seriesId)
    const chapters = selectorChaptersMap[seriesId] || []
    if (chapters.length > 0) {
      const firstChapterId = chapters[0].chapter_id
      setQuickChapterId(firstChapterId)
      const pages = selectorPagesMap[firstChapterId] || []
      if (pages.length > 0) {
        setQuickPageId(pages[0].page_id)
      } else {
        setQuickPageId('')
      }
    } else {
      setQuickChapterId('')
      setQuickPageId('')
    }
  }

  const handleQuickChapterChange = (chapterId: string) => {
    setQuickChapterId(chapterId)
    const pages = selectorPagesMap[chapterId] || []
    if (pages.length > 0) {
      setQuickPageId(pages[0].page_id)
    } else {
      setQuickPageId('')
    }
  }

  const handleQuickGo = () => {
    if (!quickPageId) return
    navigate(`/dashboard/assistant/drawing-studio?pageId=${quickPageId}`)
  }

  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop'
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    return `${apiURL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  // Filter pages using multiple criteria
  const filteredPages = pages.filter(page => {
    // 1. Status Filter Tab
    if (statusFilter === 'local_drafts') {
      if (!localDraftPageIds.includes(page.page_id)) return false
    } else if (statusFilter !== 'ALL' && page.status !== statusFilter) {
      return false
    }
    
    // 2. Series Filter Dropdown
    if (filterSeriesId !== 'ALL' && page.chapter?.series_id !== filterSeriesId) return false
    
    // 3. Task Type Filter Dropdown
    if (filterTaskType !== 'ALL') {
      const hasMatchingTask = page.page_task?.some(task => task.task_type.toLowerCase() === filterTaskType.toLowerCase())
      if (!hasMatchingTask) return false
    }
    
    return true
  })

  return (
    <div className="max-w-[1200px] mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">VẼ & CHỈNH SỬA</h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3 mb-2" />
          <p className="text-sm font-semibold text-gray-500">
            Quản lý các trang phân cảnh đang vẽ nháp, sửa nét hoặc tô màu do Mangaka phân công
          </p>
        </div>
      </div>

      {/* Quick Access Widget */}
      {selectorSeriesList.length > 0 && (
        <div className="border-4 border-manga-ink bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8">
          <h2 className="font-manga text-lg font-bold uppercase text-manga-red mb-3">TRUY CẬP NHANH PHÒNG VẼ</h2>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Bộ truyện</label>
              <select
                value={quickSeriesId}
                onChange={(e) => handleQuickSeriesChange(e.target.value)}
                className="w-full border-2 border-black p-2.5 font-bold text-xs uppercase focus:outline-none bg-white cursor-pointer"
              >
                {selectorSeriesList.map(s => (
                  <option key={s.series_id} value={s.series_id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Chương</label>
              <select
                value={quickChapterId}
                onChange={(e) => handleQuickChapterChange(e.target.value)}
                disabled={!quickSeriesId || (selectorChaptersMap[quickSeriesId] || []).length === 0}
                className="w-full border-2 border-black p-2.5 font-bold text-xs uppercase focus:outline-none bg-white cursor-pointer disabled:opacity-50"
              >
                {(selectorChaptersMap[quickSeriesId] || []).map(c => (
                  <option key={c.chapter_id} value={c.chapter_id}>CH.{c.chapter_number}: {c.title}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Trang vẽ</label>
              <select
                value={quickPageId}
                onChange={(e) => setQuickPageId(e.target.value)}
                disabled={!quickChapterId || (selectorPagesMap[quickChapterId] || []).length === 0}
                className="w-full border-2 border-black p-2.5 font-bold text-xs uppercase focus:outline-none bg-white cursor-pointer disabled:opacity-50"
              >
                {(selectorPagesMap[quickChapterId] || []).map(p => (
                  <option key={p.page_id} value={p.page_id}>Trang {p.page_number}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleQuickGo}
              disabled={!quickPageId}
              className="w-full md:w-auto bg-[#E63946] text-white border-2 border-black font-black uppercase px-6 py-2.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer shrink-0"
            >
              Vào Phòng Vẽ
            </button>
          </div>
        </div>
      )}

      {/* Filter & Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 bg-gray-50 border-2 border-black p-4 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 text-xs font-bold uppercase border-2 transition-colors cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-manga-ink text-white border-manga-ink' : 'bg-white text-gray-500 border-gray-200 hover:border-manga-ink'
            }`}
          >
            Tất cả ({pages.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-4 py-2 text-xs font-bold uppercase border-2 transition-colors cursor-pointer ${
              statusFilter === 'in_progress' ? 'bg-manga-ink text-white border-manga-ink' : 'bg-white text-gray-500 border-gray-200 hover:border-manga-ink'
            }`}
          >
            Đang thực hiện ({pages.filter(p => p.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setStatusFilter('local_drafts')}
            className={`px-4 py-2 text-xs font-bold uppercase border-2 transition-colors cursor-pointer ${
              statusFilter === 'local_drafts' ? 'bg-manga-ink text-white border-manga-ink' : 'bg-white text-gray-500 border-gray-200 hover:border-manga-ink'
            }`}
          >
            Nháp nét vẽ ({localDraftPageIds.length})
          </button>
          <button
            onClick={() => setStatusFilter('review')}
            className={`px-4 py-2 text-xs font-bold uppercase border-2 transition-colors cursor-pointer ${
              statusFilter === 'review' ? 'bg-manga-ink text-white border-manga-ink' : 'bg-white text-gray-500 border-gray-200 hover:border-manga-ink'
            }`}
          >
            Chờ duyệt ({pages.filter(p => p.status === 'review').length})
          </button>
        </div>

        {/* Dropdowns filters */}
        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
          {/* Filter Series */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-[10px] font-black uppercase text-gray-500 whitespace-nowrap">Bộ truyện:</span>
            <select
              value={filterSeriesId}
              onChange={(e) => setFilterSeriesId(e.target.value)}
              className="border-2 border-black px-2 py-1 font-bold text-xs bg-white uppercase focus:outline-none cursor-pointer w-full sm:w-[150px]"
            >
              <option value="ALL">-- TẤT CẢ --</option>
              {selectorSeriesList.map(s => (
                <option key={s.series_id} value={s.series_id}>{s.title}</option>
              ))}
            </select>
          </div>

          {/* Filter Task Type */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-[10px] font-black uppercase text-gray-500 whitespace-nowrap">Công việc:</span>
            <select
              value={filterTaskType}
              onChange={(e) => setFilterTaskType(e.target.value)}
              className="border-2 border-black px-2 py-1 font-bold text-xs bg-white uppercase focus:outline-none cursor-pointer w-full sm:w-[150px]"
            >
              <option value="ALL">-- TẤT CẢ --</option>
              <option value="inking">VẼ NÉT (INKING)</option>
              <option value="coloring">TÔ MÀU (COLORING)</option>
              <option value="lettering">ĐI CHỮ (LETTERING)</option>
              <option value="cleaning">LÀM SẠCH (CLEANING)</option>
              <option value="sfx">HIỆU ỨNG (SFX)</option>
              <option value="background">PHÔNG NỀN (BACKGROUND)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex items-center justify-center flex-col gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-manga-red" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải danh sách trang vẽ...</span>
        </div>
      ) : error ? (
        <div className="bg-[#FFF5F5] border-4 border-manga-ink p-8 text-center manga-shadow-sm">
          <AlertTriangle className="w-12 h-12 text-[#E63946] mx-auto mb-3" />
          <h3 className="font-bold text-[#E63946]">{error}</h3>
          <button
            onClick={loadDrawingPages}
            className="mt-4 bg-[#E63946] text-white px-4 py-2 border-2 border-black font-bold uppercase text-xs hover:bg-white hover:text-[#E63946] transition-colors"
          >
            Tải lại
          </button>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
          <PenTool className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Không có trang nào đang vẽ</h3>
          <p className="text-sm text-gray-400 mt-2 font-medium">Bạn sẽ nhận được phân công vẽ phác thảo hoặc tô màu từ Mangaka chính.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => {
            const sortedVersions = [...(page.page_version || [])].sort((a, b) => b.version_number - a.version_number)
            const latestImage = sortedVersions[0]?.image_url || page.image_url || ''
            
            const myTasksOnPage = page.page_task || []
            
            // Calculate deadline & overdue state
            const activeTasks = myTasksOnPage.filter(t => t.status !== 'completed' && t.status !== 'approved')
            const mainTask = activeTasks[0] || myTasksOnPage[0]
            const deadlineStr = mainTask?.deadline ? new Date(mainTask.deadline).toLocaleDateString('vi-VN') : 'N/A'
            const isOverdue = mainTask?.deadline ? new Date(mainTask.deadline).getTime() < Date.now() && (mainTask.status !== 'completed' && mainTask.status !== 'approved') : false
            
            // Calculate region progress
            const totalTasks = myTasksOnPage.length
            const completedTasksCount = myTasksOnPage.filter(t => t.status === 'completed' || t.status === 'approved').length
            
            const isWaitingReview = page.status === 'review'
            const isRevision = myTasksOnPage.some(t => t.status === 'needs_revision' || t.status === 'rejected')
            const hasLocalDraft = localDraftPageIds.includes(page.page_id)
            const buttonText = isWaitingReview 
              ? 'Xem chi tiết' 
              : (hasLocalDraft 
                  ? 'Vẽ Tiếp (Bản Nháp)' 
                  : (isRevision ? 'Sửa ngay' : 'Vẽ ngay'))
            const buttonBgClass = isWaitingReview 
              ? 'bg-zinc-500 border-zinc-500 hover:bg-zinc-600 hover:border-black text-white' 
              : 'bg-manga-ink hover:bg-[#E63946] text-white'
            
            return (
              <div
                key={page.page_id}
                className="bg-white border-4 border-manga-ink manga-shadow hover:translate-y-[-2px] transition-all flex flex-col group overflow-hidden"
              >
                <div className="relative aspect-[4/5] bg-zinc-100 border-b-4 border-manga-ink overflow-hidden flex items-center justify-center">
                  {latestImage ? (
                    <img
                      src={getImageUrl(latestImage)}
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
                      <Eye className="w-4 h-4" /> {isWaitingReview ? 'Xem Bản Vẽ' : 'Vào Không Gian Vẽ'}
                    </button>
                  </div>
                  
                  <div className="absolute top-3 left-3 bg-white border-2 border-manga-ink px-2.5 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    Trang {page.page_number}
                  </div>

                  {hasLocalDraft && (
                    <div className="absolute bottom-3 left-3 bg-[#FFEEDB] text-[#E65C00] border-2 border-black px-2 py-0.5 text-[9px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-1 z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E65C00] animate-ping" />
                      Nháp nét vẽ chưa nộp
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-0.5 border text-[9px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                      page.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700 border-blue-400'
                        : page.status === 'review'
                        ? 'bg-purple-100 text-purple-700 border-purple-400'
                        : page.status === 'draft'
                        ? 'bg-zinc-100 text-zinc-700 border-zinc-400'
                        : 'bg-amber-100 text-amber-700 border-amber-400'
                    }`}>
                      {page.status === 'in_progress' 
                        ? 'Đang vẽ' 
                        : page.status === 'review' 
                        ? 'Chờ duyệt' 
                        : page.status === 'draft' 
                        ? 'Chưa vẽ' 
                        : 'Cần sửa'}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    {/* Series Title */}
                    <div className="text-[10px] font-black uppercase tracking-wider text-manga-red">
                      {seriesNamesMap[page.chapter?.series_id || ''] || 'BỘ TRUYỆN'}
                    </div>
                    {/* Chapter Title */}
                    <h4 className="font-manga text-xl font-bold text-manga-ink uppercase leading-tight truncate">
                      {page.chapter?.title || `Chương ${page.chapter?.chapter_number}`}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Mã phân cảnh: {page.page_id.slice(0, 8)}
                    </p>
                  </div>

                  {/* Deadline & Region Progress Info */}
                  <div className="bg-gray-50 border-2 border-dotted border-gray-300 p-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                      <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                      <span>Hạn nộp:</span>
                      <span className={isOverdue ? 'text-red-600 font-extrabold' : 'text-gray-800'}>
                        {deadlineStr} {isOverdue && '(QUÁ HẠN!)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                      <Layers className="w-3.5 h-3.5 text-gray-400" />
                      <span>Tiến độ vùng:</span>
                      <span className="text-gray-800 font-extrabold">
                        {completedTasksCount} / {totalTasks} hoàn thành
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t-2 border-dashed border-gray-200 pt-3">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                      Nhiệm vụ của bạn ({totalTasks}):
                    </p>
                    <div className="space-y-1 max-h-[80px] overflow-y-auto pr-1">
                      {myTasksOnPage.map((task, idx) => (
                        <div key={task.task_id || idx} className="flex items-center justify-between text-xs font-semibold text-gray-700">
                          <span className="truncate">• {task.task_type.toUpperCase()}</span>
                          <span className={`text-[9px] font-bold px-1.5 uppercase border ${
                            (task.status === 'completed' || task.status === 'approved') ? 'text-green-600 bg-green-50 border-green-300' :
                            task.status === 'submitted' ? 'text-purple-600 bg-purple-50 border-purple-300' :
                            (task.status === 'needs_revision' || task.status === 'rejected') ? 'text-red-600 bg-red-50 border-red-300' :
                            'text-blue-600 bg-blue-50 border-blue-300'
                          }`}>
                            {task.status === 'approved' ? 'approved' : task.status === 'rejected' ? 'needs_revision' : task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {hasLocalDraft ? (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => navigate(`/dashboard/assistant/drawing-studio?pageId=${page.page_id}`)}
                        className={`flex-1 py-2.5 font-bold text-xs uppercase border-2 border-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${buttonBgClass}`}
                      >
                        <span>{buttonText}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteDraftClick(page.page_id, e)}
                        title="Xóa bản nháp nét vẽ"
                        className="px-3 bg-red-50 text-red-600 hover:bg-[#E63946] hover:text-white border-2 border-black transition-colors flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/dashboard/assistant/drawing-studio?pageId=${page.page_id}`)}
                      className={`w-full mt-2 py-2.5 font-bold text-xs uppercase border-2 border-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${buttonBgClass}`}
                    >
                      <span>{buttonText}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Draft Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black w-full max-w-md shadow-[8px_8px_0px_0px_rgba(230,57,70,1)] animate-zoom-in text-manga-ink font-bold font-sans">
            <div className="bg-manga-ink p-4 text-white flex justify-between items-center">
              <h3 className="font-manga text-xl uppercase font-bold tracking-wide">Xác nhận xóa bản nháp</h3>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteTargetPageId(null)
                }} 
                className="hover:text-[#E63946] transition cursor-pointer bg-transparent border-none text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="mb-4 text-gray-800 font-semibold">
                Hành động này sẽ xóa hoàn toàn các nét vẽ chưa nộp (bản vẽ dở) lưu trên máy của bạn cho trang này.
              </p>
              <p className="mb-6 text-manga-red font-black">Bạn có chắc chắn muốn xóa không?</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteTargetPageId(null)
                  }} 
                  className="flex-1 py-3 border-2 border-black font-bold text-xs uppercase hover:bg-gray-150 transition cursor-pointer bg-white text-black"
                >
                  Hủy / Giữ lại
                </button>
                <button 
                  onClick={confirmDeleteDraft}
                  className="flex-1 py-3 bg-[#E63946] text-white border-2 border-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 transition cursor-pointer flex items-center justify-center"
                >
                  Đồng ý xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-manga-ink text-white border-4 border-black px-4 py-3 font-bold uppercase text-xs z-[1000] shadow-[4px_4px_0px_rgba(0,0,0,1)] font-sans">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
