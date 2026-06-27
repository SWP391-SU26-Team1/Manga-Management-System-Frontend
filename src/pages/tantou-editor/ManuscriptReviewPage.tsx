import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, XCircle, Check, Edit3, Shield, Loader2 } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { editorService, ApiManuscript, ApiReviewSession } from '@/services/editor.service'

interface DisplayManuscript {
  id: string
  seriesId?: string
  chapterId?: string
  series: string
  chapter: string
  status: 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED'
  mangaka: string
  mangakaId?: string
  pages?: { pageId: string; pageNum: string; image: string }[]
  annotations?: Record<string, any[]>
  content?: string
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
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'series' ? 'SERIES' : 'MANUSCRIPT'
  const [activeTab, setActiveTab] = useState<'MANUSCRIPT' | 'SERIES'>(initialTab)

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'series') {
      setActiveTab('SERIES')
    } else if (tabParam === 'manuscript') {
      setActiveTab('MANUSCRIPT')
    }
  }, [searchParams])

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

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Feedback comment list input (general comment)
  const [rejectionReason, setRejectionReason] = useState('')

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

      const filteredList = list.filter(m => ['submitted', 'in_review'].includes(m.status?.toLowerCase()))

      // Fetch full details for each filtered manuscript to get series, chapter, and mangaka info
      const detailedList = await Promise.all(
        filteredList.map(async (m) => {
          try {
            const rawDetail = await editorService.getManuscriptDetail(m.manuscript_id)
            return rawDetail.data || rawDetail
          } catch (e) {
            console.error(`Failed to fetch detail for ${m.manuscript_id}:`, e)
            return m
          }
        })
      )

      const displayList: DisplayManuscript[] = detailedList.map(m => ({
        id: m.manuscript_id,
        seriesId: m.series_id || m.series?.series_id,
        chapterId: m.chapter_id || m.chapter?.chapter_id,
        series: m.series?.title || m.title || '—',
        chapter: m.chapter
          ? (m.chapter.title
              ? `Chương ${m.chapter.chapter_number}: ${m.chapter.title}`
              : `Chương ${m.chapter.chapter_number}`)
          : (m.title || '—'),
        status: mapApiStatusToDisplay(m.status),
        mangaka: m.mangaka?.name || m.mangaka?.username || '—',
        mangakaId: m.mangaka?.user_id || m.mangaka_id,
        pages: [],
        annotations: {},
        content: m.content
      }))

      // Sort: SUBMITTED first, then IN_REVIEW, then others
      const statusOrder: Record<string, number> = { SUBMITTED: 0, IN_REVIEW: 1, APPROVED: 2, REJECTED: 3 }
      displayList.sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9))

      setManuscripts(displayList)
      if (displayList.length > 0) {
        const firstId = displayList[0].id
        setSelectedManuscriptId(firstId)
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
      const rawDetail = await editorService.getManuscriptDetail(mId)
      const detail = rawDetail.data || rawDetail

      const updateList = (prev: DisplayManuscript[]) => prev.map(m => {
        if (m.id === mId) {
          return {
            ...m,
            seriesId: detail.series_id || detail.series?.series_id || m.seriesId,
            chapterId: detail.chapter_id || detail.chapter?.chapter_id || m.chapterId,
            series: detail.series?.title || detail.title || m.series,
            chapter: detail.chapter
              ? (detail.chapter.title
                  ? `Chương ${detail.chapter.chapter_number}: ${detail.chapter.title}`
                  : `Chương ${detail.chapter.chapter_number}`)
              : (detail.title || m.chapter),
            mangaka: detail.mangaka?.name || detail.mangaka?.username || m.mangaka,
            mangakaId: detail.mangaka?.user_id || detail.mangaka_id || m.mangakaId,
            content: detail.content || m.content
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
      showToast('Không thể tải chi tiết bản thảo.')
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
          const rawDetail = await editorService.getSeriesDetail(s.id)
          const detail = rawDetail.data || rawDetail
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
    setRejectionReason('')

    const m = manuscripts.find(item => item.id === id)
    const hasDetail = m && m.content
    if (!hasDetail) {
      fetchManuscriptDetail(id)
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

  const removeManuscriptFromList = (mId: string) => {
    setManuscripts(prev => {
      const filtered = prev.filter(m => m.id !== mId)
      if (filtered.length > 0) {
        const nextSelected = filtered[0]
        setSelectedManuscriptId(nextSelected.id)
        const hasDetail = nextSelected.content
        if (!hasDetail) {
          fetchManuscriptDetail(nextSelected.id, filtered)
        }
      } else {
        setSelectedManuscriptId('')
      }
      return filtered
    })
  }

  const handleRejectChapterFlow = async (mId: string) => {
    if (!activeManuscript) return
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối!')
      return
    }
    try {
      setLoading(true)
      await editorService.rejectManuscript(mId)
      
      // Reject chapter directly
      if (activeManuscript.chapterId) {
        await editorService.updateChapterStatus(activeManuscript.chapterId, 'rejected')
      }

      // Create notification with rejection reason for Mangaka
      if (activeManuscript.mangakaId) {
        await editorService.sendInternalNotification(
          activeManuscript.mangakaId,
          `Từ chối bản thảo ${activeManuscript.chapter}`,
          rejectionReason.trim(),
          `ms_fb:${mId}`
        )
      }

      removeManuscriptFromList(mId)
      setRejectionReason('')
      showToast(`Đã từ chối bản thảo với lý do gửi tới Mangaka!`)
    } catch (err: any) {
      console.error('Failed to reject:', err)
      const msg = err?.response?.data?.message || ''
      showToast(getFriendlyErrorMessage(msg, 'Lỗi khi từ chối bản thảo!'))
    } finally {
      setLoading(false)
    }
  }

  const handleApproveChapterFlow = async (mId: string) => {
    if (!activeManuscript) return
    try {
      setLoading(true)
      await editorService.approveManuscript(mId)
      
      // Approve chapter directly
      if (activeManuscript.chapterId) {
        await editorService.updateChapterStatus(activeManuscript.chapterId, 'approved')
      }

      removeManuscriptFromList(mId)
      showToast(`Đã phê duyệt bản thảo thành công!`)
    } catch (err: any) {
      console.error('Failed to approve:', err)
      const msg = err?.response?.data?.message || ''
      showToast(getFriendlyErrorMessage(msg, 'Lỗi khi phê duyệt bản thảo!'))
    } finally {
      setLoading(false)
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
      setManuscripts(prev => {
        const filtered = prev.filter(m => !selectedIds.includes(m.id))
        if (filtered.length > 0) {
          const nextSelected = filtered[0]
          setSelectedManuscriptId(nextSelected.id)
          const hasDetail = nextSelected.content
          if (!hasDetail) {
            fetchManuscriptDetail(nextSelected.id, filtered)
          }
        } else {
          setSelectedManuscriptId('')
        }
        return filtered
      })
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
      setManuscripts(prev => {
        const filtered = prev.filter(m => !selectedIds.includes(m.id))
        if (filtered.length > 0) {
          const nextSelected = filtered[0]
          setSelectedManuscriptId(nextSelected.id)
          const hasDetail = nextSelected.content
          if (!hasDetail) {
            fetchManuscriptDetail(nextSelected.id, filtered)
          }
        } else {
          setSelectedManuscriptId('')
        }
        return filtered
      })
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
      setManuscripts(prev => {
        const filtered = prev.filter(m => !selectedIds.includes(m.id))
        if (filtered.length > 0) {
          const nextSelected = filtered[0]
          setSelectedManuscriptId(nextSelected.id)
          const hasDetail = nextSelected.content
          if (!hasDetail) {
            fetchManuscriptDetail(nextSelected.id, filtered)
          }
        } else {
          setSelectedManuscriptId('')
        }
        return filtered
      })
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
      await editorService.updateSeriesStatus(sId, 'approved')
      showToast(`Đã phê duyệt Series thành công!`)
      await fetchSeriesToReview()
    } catch (err: any) {
      console.error('Failed to approve series:', err)
      const msg = err?.response?.data?.message || ''
      showToast(msg || 'Lỗi khi phê duyệt Series!')
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
      await editorService.updateSeriesStatus(sId, 'draft')
      showToast(`Đã từ chối duyệt hồ sơ Series (đã chuyển về bản nháp).`)
      fetchSeriesToReview()
    } catch (err: any) {
      console.error('Failed to reject series:', err)
      showToast('Lỗi khi từ chối Series!')
    }
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
            onClick={() => setActiveTab('SERIES')}
            className={`py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all border-r-2 border-manga-ink ${activeTab === 'SERIES'
              ? 'bg-manga-red text-white'
              : 'bg-white text-manga-ink hover:bg-red-50'
              }`}
          >
            Duyệt Series Mới
          </button>
          <button
            onClick={() => setActiveTab('MANUSCRIPT')}
            className={`py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'MANUSCRIPT'
              ? 'bg-manga-red text-white'
              : 'bg-white text-manga-ink hover:bg-red-50'
              }`}
          >
            Duyệt Bản Thảo
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
                    className={`p-3 border-2 cursor-pointer transition-all flex items-start gap-2 ${selectedManuscriptId === m.id
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
                        <span className="font-bold text-manga-red">{m.chapter}</span>
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
                  className={`p-3 border-2 cursor-pointer transition-all flex items-start gap-2 ${selectedSeriesId === s.id
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
        <>
          {activeManuscript ? (
            <div className="flex-1 bg-white border-4 border-manga-ink flex flex-col overflow-hidden relative">
              {/* Header */}
              <div className="bg-gray-50 border-b-2 border-manga-ink py-2 px-4 text-center flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-manga-ink tracking-wide uppercase">{activeManuscript.series}</span>
                  <span className="text-gray-400">|</span>
                  <span className="font-bold text-sm text-manga-red">{activeManuscript.chapter} - Kịch bản chữ</span>
                </div>
              </div>

              {/* Script Content Viewer Area */}
              <div className="flex-1 overflow-y-auto p-8 bg-[#FAF9F6] flex flex-col select-text">
                {activeManuscript.content ? (
                  <div className="max-w-3xl mx-auto w-full">
                    <div className="border-b-2 border-dashed border-manga-ink/20 pb-4 mb-6">
                      <h1 className="text-2xl font-extrabold text-manga-ink mb-2">{activeManuscript.chapter}</h1>
                      <p className="text-xs text-gray-500 font-extrabold uppercase tracking-wide">
                        Tác giả: <span className="text-manga-red">{activeManuscript.mangaka}</span>
                      </p>
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-gray-800 font-medium leading-relaxed font-sans">
                      {activeManuscript.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-bold text-sm">Bản thảo này không có nội dung kịch bản chữ.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-gray-100 border-4 border-manga-ink flex flex-col items-center justify-center p-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-400 font-bold text-base">Vui lòng chọn bản thảo ở cột bên trái để review.</p>
            </div>
          )}
    
          {activeManuscript ? (
            <div className="w-[340px] flex-shrink-0 flex flex-col bg-white border-4 border-manga-ink p-4 h-full min-h-0 overflow-hidden gap-4">
              {/* Header */}
              <div className="border-b-4 border-manga-ink pb-3 mb-1 flex items-center justify-between">
                <h2 className="font-manga text-base font-bold uppercase tracking-wider text-manga-ink">Bảng Điều Khiển</h2>
                <span className="bg-manga-ink text-white font-bold text-[9px] px-2 py-0.5 uppercase tracking-wide border-2 border-black">Đánh giá</span>
              </div>

              {/* Quyết Định Chương */}
              <div className="flex flex-col gap-3">
                <h3 className="font-extrabold text-[11px] uppercase text-gray-500 tracking-wider">Trạng thái quyết định</h3>

                <div className="border-2 border-manga-ink bg-gray-50 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3 rounded-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-manga-ink flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-manga text-[11px] font-bold text-manga-ink uppercase tracking-wide">PHÊ DUYỆT TRỰC TIẾP</span>
                      <span className="text-[10px] text-gray-600 font-bold leading-normal">
                        Quyết định trực tiếp cho bản thảo kịch bản chữ này.
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-300 my-1" />

                  {/* Rejection input */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Lý do từ chối (nếu từ chối)</span>
                    <textarea
                      className="w-full h-20 border-2 border-gray-300 focus:border-red-500 p-2 text-xs font-semibold focus:outline-none focus:bg-white bg-white resize-none transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] focus:shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] leading-relaxed text-gray-800"
                      placeholder="Nhập lý do từ chối..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleApproveChapterFlow(activeManuscript.id)}
                      className="w-full bg-green-500 hover:bg-green-600 border-2 border-black text-white h-9 flex items-center justify-center gap-2 font-bold transition-all text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Đồng ý Duyệt
                    </button>
                    <button
                      onClick={() => handleRejectChapterFlow(activeManuscript.id)}
                      disabled={!rejectionReason.trim()}
                      className={`w-full h-9 flex items-center justify-center gap-2 font-bold transition-all text-xs uppercase tracking-wider border-2 ${
                        rejectionReason.trim()
                          ? 'bg-red-600 hover:bg-red-700 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer'
                          : 'bg-gray-150 text-gray-400 border-gray-300 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <XCircle className="w-4 h-4" /> Từ chối bản thảo
                    </button>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      await editorService.archiveManuscript(activeManuscript.id);
                      removeManuscriptFromList(activeManuscript.id);
                      showToast(`Đã LƯU TRỮ bản thảo ${activeManuscript.chapter}!`);
                    } catch (e) {
                      showToast('Lỗi khi lưu trữ bản thảo!');
                    }
                  }}
                  className="w-full bg-white hover:bg-gray-50 border-4 border-gray-400 hover:border-gray-500 text-gray-600 h-10 flex items-center justify-center gap-2 font-bold transition-all text-[11px] uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(156,163,175,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  LƯU TRỮ BẢN THẢO
                </button>
              </div>
              <div className="h-6 flex-shrink-0" />
            </div>
          ) : (
            <div className="w-80 bg-white border-4 border-manga-ink p-4 flex items-center justify-center text-center">
              <p className="text-xs font-bold text-gray-400">Chọn bản thảo ở danh sách bên để quyết định.</p>
            </div>
          )}
        </>
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
                    <li>Hành động <span className="font-bold text-manga-red">"Phê duyệt"</span> sẽ chính thức duyệt Series hoạt động trên hệ thống.</li>
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
                      className={`bg-manga-red hover:bg-red-700 text-white py-2.5 flex items-center justify-center gap-1.5 font-bold transition-all text-[11px] uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${isSubmittingSeries ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      {isSubmittingSeries ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> ĐANG DUYỆT...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> PHÊ DUYỆT SERIES
                        </>
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
                      <XCircle className="w-3.5 h-3.5" /> Từ chối
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-gray-100 border-4 border-manga-ink flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-400 font-bold text-base">Vui lòng chọn đề xuất ở cột bên trái để duyệt.</p>
          </div>
        )
      )}
    </div>
  )
}
