import React, { useState, useRef, useEffect } from 'react'
import { FileImage, CheckCircle2, AlertCircle, XCircle, ChevronLeft, ChevronRight, MessageSquarePlus, ZoomIn, ZoomOut, Check, Edit3, Trash2, Shield, Play, Loader2 } from 'lucide-react'
import { editorService, ApiManuscript, ApiManuscriptFile, ApiAnnotation, ApiReviewSession } from '@/services/editor.service'

interface DisplayAnnotation {
  id: string
  x: number
  y: number
  w: number
  h: number
  comment: string
}

interface DisplayManuscript {
  id: string
  series: string
  chapter: string
  status: 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED'
  mangaka: string
  pages: { pageId: string; pageNum: string; image: string }[]
  annotations: Record<string, DisplayAnnotation[]>
}

interface DisplaySeries {
  id: string
  title: string
  genre: string
  status: string
  description: string
  coverImageUrl: string
  mangaka: string
  createdAt: string
}

const mapApiStatusToDisplay = (s: string): DisplayManuscript['status'] => {
  switch (s?.toLowerCase()) {
    case 'submitted': return 'SUBMITTED'
    case 'in_review': case 'in review': return 'IN_REVIEW'
    case 'approved': return 'APPROVED'
    case 'rejected': return 'REJECTED'
    default: return 'SUBMITTED'
  }
}

export default function ManuscriptReviewPage() {
  const [activeTab, setActiveTab] = useState<'MANUSCRIPT' | 'SERIES'>('MANUSCRIPT')
  
  // Manuscript state
  const [manuscripts, setManuscripts] = useState<DisplayManuscript[]>([])
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Series state
  const [seriesList, setSeriesList] = useState<DisplaySeries[]>([])
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('')
  const [loadingSeries, setLoadingSeries] = useState(false)
  const [reviewSessions, setReviewSessions] = useState<ApiReviewSession[]>([])
  const [isSubmittingSeries, setIsSubmittingSeries] = useState(false)
  
  // Current page indexes
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Annotation list active focus state
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)
  
  // Modal drawing states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [annotationBox, setAnnotationBox] = useState({ x: 30, y: 30, w: 40, h: 30 })
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null)
  const [annCommentInput, setAnnCommentInput] = useState('')
  
  // Feedback comment list input (general comment)
  const [generalComment, setGeneralComment] = useState('')
  
  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(100)

  // Drag & Resize state in Modal Canvas
  const imageRef = useRef<HTMLDivElement>(null)
  const [dragMode, setDragMode] = useState<'NONE' | 'MOVE' | 'RESIZE'>('NONE')
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startAnnotation, setStartAnnotation] = useState(annotationBox)

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  useEffect(() => {
    if (activeTab === 'MANUSCRIPT') {
      fetchManuscripts()
    } else {
      fetchSeriesToReview()
    }
  }, [activeTab])

  const fetchManuscripts = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await editorService.getManuscripts()
      const data = res.data || res
      const list: ApiManuscript[] = Array.isArray(data) ? data : (data.manuscripts || data.items || [])

      const displayList: DisplayManuscript[] = list.map(m => ({
        id: m.manuscript_id,
        series: m.series?.title || m.title || '—',
        chapter: m.chapter?.title || `Ch.${m.chapter?.chapter_number || ''}`,
        status: mapApiStatusToDisplay(m.status),
        mangaka: m.mangaka?.name || m.mangaka?.username || '—',
        pages: (m.files || []).map((f: ApiManuscriptFile, idx: number) => ({
          pageId: f.file_id,
          pageNum: `P.${String(idx + 1).padStart(2, '0')}`,
          image: f.file_url || `https://placehold.co/600x850/e0e0e0/808080?text=Page+${idx + 1}`
        })),
        annotations: {}
      }))

      // Sort: SUBMITTED first (cần duyệt gấp), then IN_REVIEW, then others
      const statusOrder: Record<string, number> = { SUBMITTED: 0, IN_REVIEW: 1, APPROVED: 2, REJECTED: 3 }
      displayList.sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9))

      setManuscripts(displayList)
      if (displayList.length > 0) {
        const firstId = displayList[0].id
        setSelectedManuscriptId(firstId)
        fetchManuscriptDetail(firstId, displayList)
      } else {
        setSelectedManuscriptId('')
      }
    } catch (err: any) {
      console.error('Failed to load manuscripts:', err)
      setError('Không thể tải danh sách bản thảo.')
    } finally {
      setLoading(false)
    }
  }

  const fetchManuscriptDetail = async (mId: string, currentManuscripts?: DisplayManuscript[]) => {
    try {
      const detail = await editorService.getManuscriptDetail(mId)
      const files = detail.files || []
      
      const pages = files.map((f: ApiManuscriptFile, idx: number) => ({
        pageId: f.file_id,
        pageNum: `P.${String(idx + 1).padStart(2, '0')}`,
        image: f.file_url || `https://placehold.co/600x850/e0e0e0/808080?text=Page+${idx + 1}`
      }))
      
      if (pages.length === 0) {
        pages.push({ pageId: `${mId}-placeholder`, pageNum: 'P.01', image: 'https://placehold.co/600x850/e0e0e0/808080?text=No+Pages' })
      }

      // Fetch annotations for all pages in this manuscript
      const annotationsMap: Record<string, DisplayAnnotation[]> = {}
      for (const p of pages) {
        if (!p.pageId.endsWith('-placeholder')) {
          try {
            const annRes = await editorService.getAnnotationsByPage(p.pageId)
            const annList = annRes.data || annRes || []
            annotationsMap[p.pageId] = annList.map((a: any) => ({
              id: a.annotation_id,
              x: a.coordinates?.x || 30,
              y: a.coordinates?.y || 30,
              w: a.coordinates?.w || 40,
              h: a.coordinates?.h || 30,
              comment: a.content || ''
            }))
          } catch (err) {
            console.error(`Failed to load annotations for page ${p.pageId}:`, err)
            annotationsMap[p.pageId] = []
          }
        }
      }

      const updateList = (prev: DisplayManuscript[]) => prev.map(m => {
        if (m.id === mId) {
          return {
            ...m,
            pages,
            annotations: annotationsMap
          }
        }
        return m
      })

      if (currentManuscripts) {
        setManuscripts(updateList(currentManuscripts))
      } else {
        setManuscripts(prev => updateList(prev))
      }
    } catch (err) {
      console.error('Failed to fetch manuscript detail:', err)
      showToast('Không thể tải chi tiết trang vẽ.')
    }
  }

  const fetchSeriesToReview = async () => {
    try {
      setLoadingSeries(true)
      const [seriesRes, sessionsRes] = await Promise.all([
        editorService.getSeries({ status: 'pending_review' }),
        editorService.getReviewSessions({ limit: 100 })
      ])
      
      const data = seriesRes.data || seriesRes
      const list = Array.isArray(data) ? data : (data.series || data.items || [])
      
      const displayList: DisplaySeries[] = list.map((s: any) => ({
        id: s.series_id,
        title: s.title,
        genre: s.genre || '—',
        status: s.status,
        description: s.description || 'Chưa có tóm tắt.',
        coverImageUrl: s.cover_image_url || 'https://placehold.co/300x450/e0e0e0/808080?text=No+Cover',
        mangaka: 'Tác giả ẩn danh',
        createdAt: s.created_at ? new Date(s.created_at).toLocaleDateString('vi-VN') : '—'
      }))
      
      for (const s of displayList) {
        try {
          const detail = await editorService.getSeriesDetail(s.id)
          const owner = detail.series_member?.find((m: any) => m.role_in_series === 'owner')
          if (owner?.users) {
            s.mangaka = owner.users.name || owner.users.username || 'Tác giả ẩn danh'
          }
        } catch (e) {
          console.error('Failed to get series owner for:', s.id, e)
        }
      }

      const sessData = sessionsRes.data || sessionsRes
      const sessList: ApiReviewSession[] = Array.isArray(sessData)
        ? sessData
        : (sessData.data || sessData.sessions || sessData.items || [])

      setReviewSessions(sessList)
      
      const filteredList = displayList.filter(s => 
        !sessList.some(session => session.series_id === s.id && ['pending', 'in_progress'].includes(session.status))
      )
      
      setSeriesList(filteredList)
      if (filteredList.length > 0) {
        setSelectedSeriesId(filteredList[0].id)
      } else {
        setSelectedSeriesId('')
      }
    } catch (err) {
      console.error('Failed to fetch series for review:', err)
    } finally {
      setLoadingSeries(false)
    }
  }

  // Get active manuscript
  const activeManuscript = manuscripts.find(m => m.id === selectedManuscriptId)
  const activePage = activeManuscript?.pages?.[currentPageIndex] || activeManuscript?.pages?.[0]
  const activeAnnotations = activePage ? (activeManuscript?.annotations?.[activePage.pageId] || []) : []

  // Get active series
  const activeSeries = seriesList.find(s => s.id === selectedSeriesId) || seriesList[0]

  const hasActiveSession = (seriesId: string) => {
    return reviewSessions.some(
      session => session.series_id === seriesId && ['pending', 'in_progress'].includes(session.status)
    )
  }

  // Handle manuscript change
  const handleSelectManuscript = (id: string) => {
    setSelectedManuscriptId(id)
    setCurrentPageIndex(0)
    setActiveAnnotationId(null)
    
    const m = manuscripts.find(item => item.id === id)
    const hasDetail = m && m.pages.length > 0 && !m.pages[0].pageId.endsWith('-placeholder')
    if (!hasDetail) {
      fetchManuscriptDetail(id)
    }
  }

  // Next and Prev Page
  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
      setActiveAnnotationId(null)
    }
  }

  const handleNextPage = () => {
    if (activeManuscript && currentPageIndex < activeManuscript.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1)
      setActiveAnnotationId(null)
    }
  }

  // Start Review
  const handleStartReview = async (mId: string) => {
    try {
      await editorService.startManuscriptReview(mId)
      setManuscripts(prev => prev.map(m => m.id === mId ? { ...m, status: 'IN_REVIEW' } : m))
      showToast(`Đã bắt đầu phiên duyệt cho ${activeManuscript?.chapter}!`)
    } catch (err: any) {
      console.error('Failed to start review:', err)
      showToast('Lỗi khi bắt đầu phiên duyệt!')
    }
  }

  const getFriendlyErrorMessage = (errorMsg: string, defaultMsg: string) => {
    if (!errorMsg) return defaultMsg
    const msg = errorMsg.toLowerCase()
    
    if (msg.includes("request revision") || msg.includes("request-revision")) {
      if (msg.includes("approved")) {
        return 'Không thể yêu cầu chỉnh sửa bản thảo đã được phê duyệt!'
      }
      if (msg.includes("rejected")) {
        return 'Bản thảo này đã bị từ chối từ trước!'
      }
      return 'Không thể yêu cầu chỉnh sửa bản thảo ở trạng thái hiện tại!'
    }
    
    if (msg.includes("approve")) {
      if (msg.includes("approved")) {
        return 'Bản thảo này đã được phê duyệt từ trước!'
      }
      if (msg.includes("rejected")) {
        return 'Không thể phê duyệt bản thảo đã bị từ chối!'
      }
      return 'Không thể phê duyệt bản thảo ở trạng thái hiện tại!'
    }
    
    if (msg.includes("reject")) {
      if (msg.includes("approved")) {
        return 'Không thể từ chối bản thảo đã được phê duyệt!'
      }
      if (msg.includes("rejected")) {
        return 'Bản thảo này đã bị từ chối từ trước!'
      }
      return 'Không thể từ chối bản thảo ở trạng thái hiện tại!'
    }
    
    if (msg.includes("cannot perform") || msg.includes("cannot request")) {
      return 'Không thể thực hiện hành động này ở trạng thái hiện tại!'
    }
    
    return errorMsg
  }

  // Approve Chapter
  const handleApproveChapter = async (mId: string) => {
    try {
      await editorService.approveManuscript(mId)
      setManuscripts(prev => prev.map(m => m.id === mId ? { ...m, status: 'APPROVED' } : m))
      showToast(`Đã PHÊ DUYỆT toàn bộ ${activeManuscript?.chapter} - ${activeManuscript?.series}!`)
    } catch (err: any) {
      console.error('Failed to approve:', err)
      const msg = err?.response?.data?.message || ''
      showToast(getFriendlyErrorMessage(msg, 'Lỗi khi phê duyệt bản thảo!'))
    }
  }

  const handleRejectChapter = async (mId: string) => {
    try {
      await editorService.rejectManuscript(mId)
      setManuscripts(prev => prev.map(m => m.id === mId ? { ...m, status: 'REJECTED' } : m))
      showToast(`Đã TỪ CHỐI bản thảo ${activeManuscript?.chapter} - ${activeManuscript?.series}!`)
    } catch (err: any) {
      console.error('Failed to reject:', err)
      const msg = err?.response?.data?.message || ''
      showToast(getFriendlyErrorMessage(msg, 'Lỗi khi từ chối bản thảo!'))
    }
  }

  const handleRequestRevision = async (mId: string) => {
    try {
      await editorService.requestManuscriptRevision(mId)
      const annCount = activeAnnotations.length
      setManuscripts(prev => prev.map(m => m.id === mId ? { ...m, status: 'REJECTED' } : m))
      showToast(`Đã gửi yêu cầu chỉnh sửa cho ${activeManuscript?.chapter} với ${annCount} góp ý chi tiết!`)
    } catch (err: any) {
      console.error('Failed to request revision:', err)
      const msg = err?.response?.data?.message || ''
      showToast(getFriendlyErrorMessage(msg, 'Lỗi khi gửi yêu cầu chỉnh sửa!'))
    }
  }

  // Annotation functions
  const handleOpenAnnotationModal = (ann?: DisplayAnnotation) => {
    if (ann) {
      setEditingAnnId(ann.id)
      setAnnotationBox({ x: ann.x, y: ann.y, w: ann.w, h: ann.h })
      setAnnCommentInput(ann.comment)
    } else {
      setEditingAnnId(null)
      setAnnotationBox({ x: 30, y: 30, w: 40, h: 30 })
      setAnnCommentInput('')
    }
    setIsModalOpen(true)
  }

  const handleSaveAnnotation = async () => {
    if (!annCommentInput) {
      alert('Vui lòng điền nội dung góp ý!')
      return
    }

    try {
      if (editingAnnId) {
        await editorService.updateAnnotation(editingAnnId, {
          content: annCommentInput,
          coordinates: annotationBox,
        })
      } else {
        await editorService.createAnnotation(activePage?.pageId || '', {
          content: annCommentInput,
          coordinates: annotationBox,
        })
      }

      // Update local state
      setManuscripts(prev => prev.map(m => {
        if (m.id === activeManuscript?.id && activePage) {
          const pageAnns = m.annotations[activePage.pageId] || []
          let updatedAnns: DisplayAnnotation[]
          if (editingAnnId) {
            updatedAnns = pageAnns.map(a => a.id === editingAnnId ? { ...a, ...annotationBox, comment: annCommentInput } : a)
          } else {
            const newAnn: DisplayAnnotation = {
              id: 'ann-' + Date.now(),
              ...annotationBox,
              comment: annCommentInput
            }
            updatedAnns = [...pageAnns, newAnn]
          }
          return { ...m, annotations: { ...m.annotations, [activePage.pageId]: updatedAnns } }
        }
        return m
      }))

      setIsModalOpen(false)
      showToast(editingAnnId ? 'Đã cập nhật góp ý!' : 'Đã thêm góp ý mới cho trang vẽ!')
    } catch (err: any) {
      console.error('Failed to save annotation:', err)
      showToast('Lỗi khi lưu góp ý!')
    }
  }

  const handleDeleteAnnotation = async (annId: string) => {
    try {
      await editorService.deleteAnnotation(annId)
      setManuscripts(prev => prev.map(m => {
        if (m.id === activeManuscript?.id && activePage) {
          const pageAnns = m.annotations[activePage.pageId] || []
          return { ...m, annotations: { ...m.annotations, [activePage.pageId]: pageAnns.filter(a => a.id !== annId) } }
        }
        return m
      }))
      setActiveAnnotationId(null)
      showToast('Đã xóa góp ý thành công.')
    } catch (err: any) {
      console.error('Failed to delete annotation:', err)
      showToast('Lỗi khi xóa góp ý!')
    }
  }

  // Bulk options
  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === manuscripts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(manuscripts.map(m => m.id))
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      alert('Chưa chọn chương truyện nào để duyệt!')
      return
    }
    try {
      for (const id of selectedIds) {
        await editorService.approveManuscript(id)
      }
      setManuscripts(prev => prev.map(m => selectedIds.includes(m.id) ? { ...m, status: 'APPROVED' } : m))
      showToast(`Đã duyệt hàng loạt ${selectedIds.length} chương truyện thành công!`)
      setSelectedIds([])
    } catch (err: any) {
      console.error('Failed to bulk approve:', err)
      showToast('Lỗi khi duyệt hàng loạt!')
    }
  }

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) {
      alert('Chưa chọn chương truyện nào để từ chối!')
      return
    }
    try {
      for (const id of selectedIds) {
        await editorService.rejectManuscript(id)
      }
      setManuscripts(prev => prev.map(m => selectedIds.includes(m.id) ? { ...m, status: 'REJECTED' } : m))
      showToast(`Đã từ chối hàng loạt ${selectedIds.length} chương truyện!`)
      setSelectedIds([])
    } catch (err: any) {
      console.error('Failed to bulk reject:', err)
      showToast('Lỗi khi từ chối hàng loạt!')
    }
  }

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return
    try {
      for (const id of selectedIds) {
        await editorService.archiveManuscript(id)
      }
      setManuscripts(prev => prev.filter(m => !selectedIds.includes(m.id)))
      showToast(`Đã lưu trữ hàng loạt ${selectedIds.length} chương truyện!`)
      setSelectedIds([])
    } catch (err: any) {
      console.error('Failed to bulk archive:', err)
      showToast('Lỗi khi lưu trữ hàng loạt!')
    }
  }

  // Series actions
  const handleApproveSeries = async (sId: string) => {
    if (isSubmittingSeries) return
    try {
      setIsSubmittingSeries(true)
      await editorService.submitSeriesToBoard(sId)
      showToast(`Đã nộp đề xuất duyệt Series lên Hội Đồng Biên Tập!`)
      await fetchSeriesToReview()
    } catch (err: any) {
      console.error('Failed to submit series:', err)
      const msg = err?.response?.data?.message || ''
      showToast(msg || 'Lỗi khi nộp lên Hội Đồng!')
    } finally {
      setIsSubmittingSeries(false)
    }
  }

  const handleRequestRevisionSeries = async (sId: string) => {
    try {
      await editorService.updateSeriesStatus(sId, 'draft')
      showToast(`Đã gửi yêu cầu chỉnh sửa hồ sơ Series về cho Mangaka.`)
      fetchSeriesToReview()
    } catch (err: any) {
      console.error('Failed to request revision:', err)
      showToast('Lỗi khi gửi yêu cầu chỉnh sửa!')
    }
  }

  const handleRejectSeries = async (sId: string) => {
    try {
      await editorService.updateSeriesStatus(sId, 'rejected')
      showToast(`Đã từ chối duyệt hồ sơ Series.`)
      fetchSeriesToReview()
    } catch (err: any) {
      console.error('Failed to reject series:', err)
      showToast('Lỗi khi từ chối Series!')
    }
  }

  // Mouse drag handles
  const handleMouseDown = (e: React.MouseEvent, mode: 'MOVE' | 'RESIZE') => {
    e.stopPropagation()
    setDragMode(mode)
    setStartPos({ x: e.clientX, y: e.clientY })
    setStartAnnotation({ ...annotationBox })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragMode === 'NONE' || !imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const deltaX = e.clientX - startPos.x
    const deltaY = e.clientY - startPos.y
    const percentX = (deltaX / rect.width) * 100
    const percentY = (deltaY / rect.height) * 100

    if (dragMode === 'MOVE') {
      let newX = startAnnotation.x + percentX
      let newY = startAnnotation.y + percentY
      if (newX < 0) newX = 0
      if (newY < 0) newY = 0
      if (newX + startAnnotation.w > 100) newX = 100 - startAnnotation.w
      if (newY + startAnnotation.h > 100) newY = 100 - startAnnotation.h
      setAnnotationBox(prev => ({ ...prev, x: newX, y: newY }))
    } else if (dragMode === 'RESIZE') {
      let newW = startAnnotation.w + percentX
      let newH = startAnnotation.h + percentY
      if (newW < 5) newW = 5
      if (newH < 5) newH = 5
      if (startAnnotation.x + newW > 100) newW = 100 - startAnnotation.x
      if (startAnnotation.y + newH > 100) newH = 100 - startAnnotation.y
      setAnnotationBox(prev => ({ ...prev, w: newW, h: newH }))
    }
  }

  const handleMouseUp = () => {
    setDragMode('NONE')
  }

  const getStatusBadge = (status: DisplayManuscript['status']) => {
    switch (status) {
      case 'APPROVED': return <span className="bg-green-100 text-green-700 text-[10px] font-bold border border-green-700 px-2 py-0.5">ĐÃ PHÊ DUYỆT</span>
      case 'REJECTED': return <span className="bg-red-100 text-red-700 text-[10px] font-bold border border-red-700 px-2 py-0.5">ĐÃ TỪ CHỐI</span>
      case 'IN_REVIEW': return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-700 px-2 py-0.5">ĐANG DUYỆT</span>
      case 'SUBMITTED': return <span className="bg-orange-100 text-orange-700 text-[10px] font-bold border border-orange-700 px-2 py-0.5">ĐÃ NỘP</span>
    }
  }

  // Loading state
  if (loading && activeTab === 'MANUSCRIPT') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-manga-red mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">Đang tải bản thảo...</p>
        </div>
      </div>
    )
  }

  if (loadingSeries && activeTab === 'SERIES') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-manga-red mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">Đang tải danh sách series chờ duyệt...</p>
        </div>
      </div>
    )
  }

  if (error && activeTab === 'MANUSCRIPT') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center border-4 border-red-500 p-8 bg-white">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
          <button onClick={fetchManuscripts} className="bg-manga-ink text-white font-bold text-xs uppercase px-4 py-2 hover:bg-black transition-colors">
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: 'calc(100vh - 132px)' }} className="flex gap-6 pb-4 relative overflow-hidden">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-manga-ink text-white px-6 py-3 border-4 border-manga-red shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          {toastMessage}
        </div>
      )}

      {/* Left Column: Chapters/Series list & Tab controls */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white border-4 border-manga-ink overflow-hidden">
        <div className="p-4 border-b-4 border-manga-ink bg-manga-ink text-white flex-shrink-0">
          <h2 className="font-manga text-xl font-bold uppercase tracking-wider">
            {activeTab === 'MANUSCRIPT' ? 'Duyệt Bản Thảo' : 'Duyệt Đề Xuất Series'}
          </h2>
          <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase">
            {activeTab === 'MANUSCRIPT' 
              ? `${manuscripts.length} Bản Thảo Hiện Có` 
              : `${seriesList.length} Đề xuất mới chờ duyệt`
            }
          </p>
        </div>

        {/* Neo-brutalist Tab Bar */}
        <div className="grid grid-cols-2 border-b-4 border-manga-ink bg-gray-100 flex-shrink-0">
          <button 
            onClick={() => setActiveTab('MANUSCRIPT')}
            className={`py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all border-r-2 border-manga-ink ${
              activeTab === 'MANUSCRIPT' 
                ? 'bg-manga-red text-white' 
                : 'bg-white text-manga-ink hover:bg-red-50'
            }`}
          >
            Duyệt Chapter
          </button>
          <button 
            onClick={() => setActiveTab('SERIES')}
            className={`py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'SERIES' 
                ? 'bg-manga-red text-white' 
                : 'bg-white text-manga-ink hover:bg-red-50'
            }`}
          >
            Duyệt Series Mới
          </button>
        </div>

        {activeTab === 'MANUSCRIPT' ? (
          <>
            {/* Bulk Action Controls */}
            <div className="p-2 border-b-2 border-manga-ink bg-gray-100 flex items-center justify-between flex-shrink-0">
              <label className="flex items-center gap-2 text-xs font-bold text-manga-ink cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 border-2 border-manga-ink accent-manga-ink"
                  checked={selectedIds.length === manuscripts.length && manuscripts.length > 0} 
                  onChange={toggleSelectAll} 
                />
                Tất cả
              </label>
              {selectedIds.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  <button onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-2 py-1 uppercase border border-black">
                    Duyệt ({selectedIds.length})
                  </button>
                  <button onClick={handleBulkReject} className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-2 py-1 uppercase border border-black">
                    Từ chối ({selectedIds.length})
                  </button>
                  <button onClick={handleBulkArchive} className="bg-gray-600 hover:bg-gray-700 text-white font-bold text-[10px] px-2 py-1 uppercase border border-black">
                    Lưu trữ ({selectedIds.length})
                  </button>
                </div>
              )}
            </div>

            {/* Manuscripts List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
              {manuscripts.length === 0 ? (
                <div className="p-4 text-center text-xs font-bold text-gray-400">Không có bản thảo nào cần duyệt</div>
              ) : (
                manuscripts.map((m) => (
                  <div 
                    key={m.id}
                    onClick={() => handleSelectManuscript(m.id)}
                    className={`p-3 border-2 cursor-pointer transition-all flex items-start gap-2 ${
                      selectedManuscriptId === m.id 
                        ? 'border-manga-ink bg-red-50/50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                        : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(m.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelectId(m.id) }}
                      className="mt-1 w-4 h-4 border-2 border-manga-ink accent-manga-ink"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-manga-ink truncate pr-2">{m.series}</span>
                        {getStatusBadge(m.status)}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-manga-red">{m.chapter} · {m.pages.length} trang</span>
                        <span className="text-gray-500 font-bold truncate max-w-[100px]">{m.mangaka}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Series List */
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
            {seriesList.length === 0 ? (
              <div className="p-4 text-center text-xs font-bold text-gray-400">Không có series mới nào cần duyệt</div>
            ) : (
              seriesList.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => setSelectedSeriesId(s.id)}
                  className={`p-3 border-2 cursor-pointer transition-all flex items-start gap-2 ${
                    selectedSeriesId === s.id 
                      ? 'border-manga-ink bg-red-50/50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                      : 'border-gray-200 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-manga-ink truncate pr-2">{s.title}</span>
                      {hasActiveSession(s.id) ? (
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold border border-yellow-700 px-2 py-0.5">CHỜ HỘI ĐỒNG</span>
                      ) : (
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold border border-orange-700 px-2 py-0.5">ĐÃ NỘP</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-manga-red">{s.genre}</span>
                      <span className="text-gray-500 font-bold truncate max-w-[120px]">{s.mangaka}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Middle Column: Viewer Canvas or Series Detail Card */}
      {activeTab === 'MANUSCRIPT' ? (
        activeManuscript && activePage ? (
          <div className="flex-1 bg-gray-200 border-4 border-manga-ink flex flex-col overflow-hidden relative">
            <div className="bg-gray-50 border-b-2 border-gray-200 py-2 px-4 text-center flex-shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-manga-ink tracking-wide uppercase">{activeManuscript.series}</span>
                <span className="text-gray-400">|</span>
                <span className="font-bold text-sm text-manga-red">{activeManuscript.chapter} - {activePage.pageNum}</span>
              </div>
              
              {activeManuscript.status === 'SUBMITTED' && (
                <button 
                  onClick={() => handleStartReview(activeManuscript.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-3 py-1 flex items-center gap-1 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <Play className="w-3.5 h-3.5" /> Bắt đầu duyệt
                </button>
              )}
            </div>

            {/* Viewer Toolbar */}
            <div className="h-12 bg-white border-b-2 border-manga-ink flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"><ZoomOut className="w-4 h-4" /></button>
                <span className="text-xs font-bold w-12 text-center">{zoomLevel}%</span>
                <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"><ZoomIn className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!activePage.pageId.endsWith('-placeholder') && (
                  <button 
                    onClick={() => handleOpenAnnotationModal()}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 transition-colors bg-manga-ink text-white border-manga-ink hover:bg-black"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5 flex-shrink-0" /> Góp ý vùng ảnh
                  </button>
                )}
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-6 bg-[#e8e8e8] relative">
              <div className="relative bg-white shadow-xl border border-gray-300 transition-transform duration-150" style={{ transform: `scale(${zoomLevel / 100})` }}>
                <img src={activePage.image} alt={activePage.pageNum} className="max-w-full h-auto object-contain max-h-[600px] select-none" draggable={false} />
                {activeAnnotations.map((ann, idx) => (
                  <div 
                    key={ann.id}
                    onClick={() => setActiveAnnotationId(ann.id)}
                    className={`absolute border-2 flex items-start justify-end p-1 cursor-pointer transition-all ${
                      activeAnnotationId === ann.id ? 'border-red-500 bg-red-500/20 scale-105 ring-4 ring-red-300 animate-pulse' : 'border-red-500 bg-red-500/10 hover:bg-red-500/20'
                    }`}
                    style={{ left: `${ann.x}%`, top: `${ann.y}%`, width: `${ann.w}%`, height: `${ann.h}%` }}
                  >
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1 rounded-sm">{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Thumbnails & Nav */}
            <div className="bg-white border-t-2 border-manga-ink flex flex-col flex-shrink-0">
              <div className="h-16 px-4 py-2 border-b border-gray-100 flex items-center gap-2 overflow-x-auto bg-gray-50">
                {activeManuscript.pages.map((page, idx) => (
                  <button key={page.pageId} onClick={() => { setCurrentPageIndex(idx); setActiveAnnotationId(null) }}
                    className={`h-12 w-9 border-2 flex-shrink-0 flex items-center justify-center font-bold text-xs transition-all ${
                      currentPageIndex === idx ? 'border-manga-red bg-manga-red text-white scale-105 shadow-sm' : 'border-gray-300 bg-white hover:border-manga-ink text-gray-600'
                    }`}
                  >{page.pageNum}</button>
                ))}
              </div>
              <div className="h-12 flex items-center justify-between px-4">
                <button onClick={handlePrevPage} disabled={currentPageIndex === 0}
                  className={`flex items-center gap-1 text-xs font-bold transition-colors ${currentPageIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-manga-ink'}`}
                ><ChevronLeft className="w-4 h-4" /> Trang trước</button>
                <span className="text-xs font-bold text-gray-500">Trang {currentPageIndex + 1} / {activeManuscript.pages.length}</span>
                <button onClick={handleNextPage} disabled={currentPageIndex === activeManuscript.pages.length - 1}
                  className={`flex items-center gap-1 text-xs font-bold transition-colors ${currentPageIndex === activeManuscript.pages.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-manga-ink'}`}
                >Trang tiếp <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-gray-100 border-4 border-manga-ink flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-400 font-bold text-base">Vui lòng chọn bản thảo ở cột bên trái để review.</p>
          </div>
        )
      ) : (
        /* Series Details & Decisions Panel (Unified Container) */
        activeSeries ? (
          <div className="flex-1 bg-[#e8e8e8] border-4 border-manga-ink flex flex-col overflow-y-auto p-4 items-center justify-center">
            <div className="bg-white border-4 border-manga-ink p-6 w-full max-w-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] my-auto animate-in zoom-in-95 duration-200 flex flex-col gap-4 overflow-y-auto max-h-full">
              {/* Header Badge */}
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 flex-shrink-0">
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 border border-orange-700 uppercase">Series Chờ Duyệt</span>
                <span>{activeSeries.createdAt}</span>
              </div>

              {/* Series Content: Cover & Information */}
              <div className="flex gap-6 items-start flex-shrink-0">
                {/* Cover Image */}
                <div className="w-28 h-40 border-2 border-manga-ink shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-gray-100 flex-shrink-0">
                  <img 
                    src={activeSeries.coverImageUrl} 
                    alt={activeSeries.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/300x450/e0e0e0/808080?text=No+Cover'
                    }}
                  />
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                  <h2 className="font-manga text-xl font-bold text-manga-ink uppercase leading-tight border-b-2 border-dashed border-gray-200 pb-1.5 truncate" title={activeSeries.title}>
                    {activeSeries.title}
                  </h2>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-manga-ink">
                    <div className="bg-gray-50 p-1.5 border border-gray-200 min-w-0">
                      <p className="text-gray-400 uppercase text-[8px] font-bold">Tác giả</p>
                      <p className="text-manga-red truncate" title={activeSeries.mangaka}>{activeSeries.mangaka}</p>
                    </div>
                    <div className="bg-gray-50 p-1.5 border border-gray-200 min-w-0">
                      <p className="text-gray-400 uppercase text-[8px] font-bold">Thể loại</p>
                      <p className="text-manga-ink truncate" title={activeSeries.genre}>{activeSeries.genre}</p>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-[10px] uppercase font-extrabold text-manga-ink mb-1">Tóm tắt nội dung</h4>
                    <div className="bg-gray-50 p-2 border border-gray-200 max-h-24 overflow-y-auto text-[11px] text-gray-600 leading-normal font-medium whitespace-pre-wrap">
                      {activeSeries.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Warnings / Guidelines (Thông tin lưu ý) */}
              <div className="border-t-2 border-dashed border-gray-200 pt-3 flex-shrink-0">
                <h4 className="font-bold text-xs uppercase text-manga-ink mb-1.5">Thông tin lưu ý</h4>
                <div className="bg-blue-50 border-2 border-blue-600 p-3 text-[10px] text-blue-700 font-bold leading-normal">
                  <ul className="space-y-1 list-disc pl-4">
                    <li>Vui lòng kiểm tra kỹ nội dung, thuyết minh, thể loại và hình ảnh bìa của Series.</li>
                    <li>Hành động <span className="font-bold text-manga-red">"Nộp lên Hội Đồng"</span> sẽ tạo một phiên duyệt mới trên Hội Đồng Biên Tập.</li>
                    <li>Bạn có thể trao đổi trực tiếp với Mangaka nếu hồ sơ chưa đạt yêu cầu trước khi quyết định từ chối.</li>
                  </ul>
                </div>
              </div>

              {/* Decisions / Action buttons at the bottom */}
              {hasActiveSession(activeSeries.id) ? (
                <div className="border-t-2 border-manga-ink pt-3 flex flex-col gap-2 flex-shrink-0">
                  <div className="bg-yellow-50 border-4 border-yellow-500 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
                    <Shield className="w-8 h-8 text-yellow-600 flex-shrink-0 animate-pulse" />
                    <div>
                      <h4 className="font-extrabold text-sm text-manga-ink uppercase">HỒ SƠ ĐÃ ĐƯỢC NỘP LÊN HỘI ĐỒNG</h4>
                      <p className="text-xs text-gray-600 font-bold mt-1">Đang chờ Hội Đồng Biên Tập bỏ phiếu duyệt. Bạn không thể thực hiện thêm thao tác lúc này.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t-2 border-manga-ink pt-3 flex flex-col gap-2 flex-shrink-0">
                  <h3 className="font-bold text-xs uppercase text-manga-ink mb-1">Quyết Định Duyệt Series</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => handleApproveSeries(activeSeries.id)}
                      disabled={isSubmittingSeries}
                      className={`bg-manga-red hover:bg-red-700 text-white py-2.5 flex items-center justify-center gap-1.5 font-bold transition-all text-[11px] uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                        isSubmittingSeries ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmittingSeries ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> ĐANG NỘP...
                        </>
                      ) : (
                        '🚀 NỘP LÊN HỘI ĐỒNG'
                      )}
                    </button>
                    
                    <button 
                      onClick={() => handleRequestRevisionSeries(activeSeries.id)}
                      className="bg-orange-50 hover:bg-orange-100 border-2 border-orange-500 text-orange-600 py-2.5 flex items-center justify-center gap-1.5 font-bold transition-all text-[11px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Yêu cầu sửa đổi
                    </button>
                    
                    <button 
                      onClick={() => handleRejectSeries(activeSeries.id)}
                      className="bg-red-50 hover:bg-red-100 border-2 border-red-600 text-red-700 py-2.5 flex items-center justify-center gap-1.5 font-bold transition-all text-[11px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Từ chối Series
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-gray-100 border-4 border-manga-ink flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-400 font-bold text-base">Không có đề xuất series mới nào cần review.</p>
          </div>
        )
      )}

      {/* Right Column: Decisions & Action feedback depending on selected Tab */}
      {activeTab === 'MANUSCRIPT' ? (
        activeManuscript ? (
          <div className="w-80 flex-shrink-0 flex flex-col gap-4 h-full min-h-0 overflow-y-auto pr-1">
            <div className="bg-white border-4 border-manga-ink p-4 flex flex-col gap-2.5">
              <h3 className="font-bold text-xs uppercase text-manga-ink border-b-2 border-gray-100 pb-2 mb-1">Quyết Định Chương</h3>
              
              <button 
                onClick={() => handleApproveChapter(activeManuscript.id)}
                className="w-full bg-green-50 hover:bg-green-100 border-2 border-green-600 text-green-700 py-2.5 flex items-center justify-center gap-2 font-bold transition-all text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(22,163,74,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <CheckCircle2 className="w-4 h-4" /> PHÊ DUYỆT CHƯƠNG
              </button>
              
              <button 
                onClick={() => handleRequestRevision(activeManuscript.id)}
                className="w-full bg-orange-50 hover:bg-orange-100 border-2 border-orange-500 text-orange-600 py-2.5 flex items-center justify-center gap-2 font-bold transition-all text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <AlertCircle className="w-4 h-4" /> YÊU CẦU SỬA ĐỔI
              </button>
              
              <button 
                onClick={() => handleRejectChapter(activeManuscript.id)}
                className="w-full bg-red-50 hover:bg-red-100 border-2 border-red-600 text-red-700 py-2.5 flex items-center justify-center gap-2 font-bold transition-all text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <XCircle className="w-4 h-4" /> TỪ CHỐI BẢN THẢO
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    await editorService.archiveManuscript(activeManuscript.id);
                    setManuscripts(prev => prev.filter(m => m.id !== activeManuscript.id));
                    showToast(`Đã LƯU TRỮ bản thảo ${activeManuscript.chapter}!`);
                  } catch(e) {
                    showToast('Lỗi khi lưu trữ bản thảo!');
                  }
                }}
                className="w-full bg-gray-50 hover:bg-gray-100 border-2 border-gray-600 text-gray-700 py-2.5 flex items-center justify-center gap-2 font-bold transition-all text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(75,85,99,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                LƯU TRỮ BẢN THẢO
              </button>
            </div>

            {/* Annotations List */}
            <div className="bg-white border-4 border-manga-ink p-4 flex flex-col min-h-0 overflow-hidden flex-shrink">
              <h3 className={`font-bold text-xs uppercase text-manga-ink pb-2 flex items-center justify-between flex-shrink-0 ${
                activeAnnotations.length > 0 ? 'border-b-2 border-gray-100 mb-3' : 'mb-1'
              }`}>
                Danh Sách Góp Ý ({activePage?.pageNum || 'P.01'})
                <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{activeAnnotations.length}</span>
              </h3>
              
              {activeAnnotations.length > 0 && (
                <div className="overflow-y-auto mb-2 space-y-3 pr-1 min-h-0 flex-shrink">
                  {activeAnnotations.map((ann, idx) => (
                    <div key={ann.id} onClick={() => setActiveAnnotationId(ann.id)}
                      className={`p-3 border-2 cursor-pointer relative group transition-all ${
                        activeAnnotationId === ann.id 
                          ? 'border-red-500 bg-red-50/50 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)]' 
                          : 'border-orange-200 bg-orange-50/20 hover:border-orange-400 hover:bg-orange-50/30'
                      }`}
                    >
                      <span className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">{idx + 1}</span>
                      <p className="text-xs font-medium text-gray-700 mt-1 pl-1 leading-relaxed">{ann.comment}</p>
                      {!activePage?.pageId.endsWith('-placeholder') && (
                        <div className="mt-2.5 flex justify-end gap-2 border-t border-dotted border-gray-200 pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleOpenAnnotationModal(ann) }} className="p-1 hover:bg-gray-100 text-gray-500 hover:text-manga-ink rounded" title="Chỉnh sửa góp ý"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteAnnotation(ann.id) }} className="p-1 hover:bg-red-50 text-red-500 rounded" title="Xóa góp ý"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!activePage?.pageId.endsWith('-placeholder') && (
                <div className={`flex flex-col gap-2 flex-shrink-0 ${
                  activeAnnotations.length > 0 ? 'border-t-2 border-gray-100 pt-2' : ''
                }`}>
                  <textarea className="w-full h-20 border-2 border-gray-200 p-2 text-xs focus:outline-none focus:border-manga-ink resize-none font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-manga-ink/10 transition-all duration-200"
                    placeholder="Nhập nội dung góp ý chung..." value={generalComment} onChange={(e) => setGeneralComment(e.target.value)} />
                  <button onClick={() => { if (!generalComment) return; showToast('Đã lưu ý kiến nhận xét chung của bạn!'); setGeneralComment('') }}
                    className="w-full bg-manga-ink hover:bg-black text-white font-bold text-[10px] uppercase tracking-wider py-2 transition-all border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                  >Gửi nhận xét chung</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-80 bg-white border-4 border-manga-ink p-4 flex items-center justify-center text-center">
            <p className="text-xs font-bold text-gray-400">Chọn bản thảo ở danh sách bên để quyết định.</p>
          </div>
        )
      ) : (
        null
      )}

      {/* Modal Annotation */}
      {isModalOpen && activePage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
          <div className="bg-white border-4 border-manga-ink flex flex-col h-[90vh] w-[90vw] max-w-6xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b-2 border-manga-ink flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h3 className="font-manga text-xl font-bold tracking-wide uppercase text-manga-ink">
                {editingAnnId ? 'Cập Nhật Vùng Góp Ý' : 'Khoanh Vùng Góp Ý'}
              </h3>
              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 border-2 border-gray-300 font-bold text-sm hover:bg-gray-100 transition-colors uppercase tracking-wider">Hủy</button>
                <button onClick={handleSaveAnnotation} className="px-6 py-2 bg-manga-ink text-white font-bold text-sm hover:bg-black transition-colors uppercase tracking-wider flex items-center gap-2">
                  <Check className="w-4 h-4" /> Lưu góp ý
                </button>
              </div>
            </div>
            <div className="flex-1 flex overflow-hidden min-h-0">
              <div className="flex-1 overflow-auto bg-[#e8e8e8] flex items-center justify-center p-8 relative"
                onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <div className="relative inline-block shadow-2xl min-w-[300px] min-h-[400px] bg-white flex items-center justify-center" ref={imageRef}>
                  <img src={activePage.image} alt={activePage.pageNum} className="max-h-[60vh] object-contain select-none" draggable={false} />
                  <div className={`absolute border-2 border-red-500 bg-red-500/10 flex items-start justify-end p-1 ${dragMode === 'MOVE' ? 'cursor-grabbing' : 'cursor-grab'}`}
                    style={{ left: `${annotationBox.x}%`, top: `${annotationBox.y}%`, width: `${annotationBox.w}%`, height: `${annotationBox.h}%` }}
                    onMouseDown={(e) => handleMouseDown(e, 'MOVE')}>
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1 rounded-sm">!</span>
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full translate-x-1/2 translate-y-1/2 cursor-se-resize shadow-md hover:scale-125 transition-transform"
                      onMouseDown={(e) => handleMouseDown(e, 'RESIZE')} />
                  </div>
                </div>
              </div>
              <div className="w-80 border-l-2 border-manga-ink p-5 flex flex-col gap-4 bg-gray-50 flex-shrink-0">
                <h4 className="font-bold text-xs uppercase text-manga-ink">Nội dung góp ý chi tiết</h4>
                <textarea className="flex-1 border-2 border-manga-ink p-3 text-sm focus:outline-none focus:border-red-500 font-medium bg-white resize-none"
                  placeholder="Mô tả chi tiết những gì tác giả cần chỉnh sửa trong vùng ảnh đã khoanh đỏ..."
                  value={annCommentInput} onChange={(e) => setAnnCommentInput(e.target.value)} required />
                <div className="text-[10px] text-gray-500 leading-normal font-medium bg-white p-3 border border-gray-200">
                  <span className="font-bold text-manga-red">Hướng dẫn:</span> Kéo khung đỏ trên bản thảo để di chuyển vùng khoanh đỏ, nắm kéo núm đỏ ở góc dưới để co giãn. Sau đó điền bình luận và nhấn "Lưu góp ý".
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
