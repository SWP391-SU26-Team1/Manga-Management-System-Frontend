import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, XCircle, Check, Edit3, Shield, Loader2, MoreHorizontal, XSquare } from 'lucide-react'
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
  mangakaId?: string
  createdAt: string
}

const mapApiStatusToDisplay = (s: string): DisplayManuscript['status'] => {
  switch (s?.toLowerCase()) {
    case 'submitted': return 'SUBMITTED'
    case 'in_review': case 'in review': return 'IN_REVIEW'
    case 'approved': return 'APPROVED'
    case 'rejected': case 'needs_revision': case 'needs revision': return 'REJECTED'
    default: return 'SUBMITTED'
  }
}

export default function ManuscriptReviewPage() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'manuscript' ? 'MANUSCRIPT' : 'SERIES'
  const [activeTab, setActiveTab] = useState<'MANUSCRIPT' | 'SERIES'>(initialTab)

  const targetId = searchParams.get('id') || ''

  // Manuscript state
  const [manuscripts, setManuscripts] = useState<DisplayManuscript[]>([])
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string>(
    initialTab === 'MANUSCRIPT' ? targetId : ''
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Series state
  const [seriesList, setSeriesList] = useState<DisplaySeries[]>([])
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(
    initialTab === 'SERIES' ? targetId : ''
  )

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    const currentId = searchParams.get('id') || ''
    if (tabParam === 'manuscript') {
      setActiveTab('MANUSCRIPT')
      setSelectedManuscriptId(currentId)
      setSelectedSeriesId('')
    } else {
      setActiveTab('SERIES')
      setSelectedSeriesId(currentId)
      setSelectedManuscriptId('')
    }
  }, [searchParams])
  const [loadingSeries, setLoadingSeries] = useState(false)
  const [reviewSessions, setReviewSessions] = useState<ApiReviewSession[]>([])

  // viewedIds state to track read/unread series and manuscripts
  const [viewedIds, setViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('viewed_review_items')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const markAsViewed = (id: string) => {
    setViewedIds((prev) => {
      if (prev.includes(id)) return prev
      const updated = [...prev, id]
      localStorage.setItem('viewed_review_items', JSON.stringify(updated))
      return updated
    })
  }

  // deletedIds state to track hidden/deleted review items
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('deleted_review_items')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const handleDeleteItem = (id: string) => {
    setDeletedIds((prev) => {
      if (prev.includes(id)) return prev
      const updated = [...prev, id]
      localStorage.setItem('deleted_review_items', JSON.stringify(updated))
      return updated
    })
    if (selectedManuscriptId === id) setSelectedManuscriptId('')
    if (selectedSeriesId === id) setSelectedSeriesId('')
  }

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  useEffect(() => {
    const handleCloseMenu = () => setActiveMenuId(null)
    window.addEventListener('click', handleCloseMenu)
    return () => window.removeEventListener('click', handleCloseMenu)
  }, [])

  useEffect(() => {
    if (selectedManuscriptId) {
      markAsViewed(selectedManuscriptId)
    }
  }, [selectedManuscriptId])

  useEffect(() => {
    if (selectedSeriesId) {
      markAsViewed(selectedSeriesId)
    }
  }, [selectedSeriesId])
  const [isSubmittingSeries, setIsSubmittingSeries] = useState(false)

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Feedback comment list input (general comment)
  const [rejectionReason, setRejectionReason] = useState('')

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false)

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

      const filteredList = list.filter(m => ['draft', 'submitted', 'in_review', 'approved', 'rejected', 'needs_revision'].includes(m.status?.toLowerCase()))

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
      const queryId = searchParams.get('id')
      if (queryId && displayList.some(item => item.id === queryId)) {
        setSelectedManuscriptId(queryId)
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
      const [pendingRes, approvedRes, sessionsRes] = await Promise.all([
        editorService.getSeries({ status: 'pending_review' }),
        editorService.getSeries({ status: 'approved' }),
        editorService.getReviewSessions({ limit: 100 })
      ])

      const pData = pendingRes.data || pendingRes
      const pList = Array.isArray(pData) ? pData : (pData.series || pData.items || [])

      const aData = approvedRes.data || approvedRes
      const aList = Array.isArray(aData) ? aData : (aData.series || aData.items || [])

      const combinedList = [...pList, ...aList]

      const displayList: DisplaySeries[] = combinedList.map((s: any) => ({
        id: s.series_id,
        title: s.title,
        genre: s.genre || '—',
        status: s.status,
        description: s.description || 'Chưa có tóm tắt.',
        coverImageUrl: s.cover_image_url || 'https://placehold.co/300x450/e0e0e0/808080?text=No+Cover',
        mangaka: 'Tác giả ẩn danh',
        createdAt: s.created_at ? new Date(s.created_at).toLocaleDateString('vi-VN') : '—'
      }))

      const finalFilteredList: DisplaySeries[] = []

      for (const s of displayList) {
        try {
          const rawDetail = await editorService.getSeriesDetail(s.id)
          const detail = rawDetail.data || rawDetail
          const hasAssignedEditor = detail.series_member?.some((m: any) => m.role_in_series === 'editor')
          if (!hasAssignedEditor) {
            const owner = detail.series_member?.find((m: any) => m.role_in_series === 'owner')
            if (owner?.users) {
              s.mangaka = owner.users.name || owner.users.username || 'Tác giả ẩn danh'
              s.mangakaId = owner.users.user_id || owner.user_id
            }
            finalFilteredList.push(s)
          }
        } catch (e) {
          console.error('Failed to get series owner/members for:', s.id, e)
          finalFilteredList.push(s)
        }
      }

      const sessData = sessionsRes.data || sessionsRes
      const sessList: ApiReviewSession[] = Array.isArray(sessData)
        ? sessData
        : (sessData.data || sessData.sessions || sessData.items || [])

      setReviewSessions(sessList)

      const filteredList = finalFilteredList.filter(s =>
        !sessList.some(session => session.series_id === s.id && ['pending', 'in_progress'].includes(session.status))
      )

      setSeriesList(filteredList)
      const queryId = searchParams.get('id')
      if (queryId && filteredList.some(item => item.id === queryId)) {
        setSelectedSeriesId(queryId)
      } else {
        setSelectedSeriesId('')
      }
    } catch (err) {
      console.error('Failed to fetch series for review:', err)
    } finally {
      setLoadingSeries(false)
    }
  }

  // Filtered lists excluding deleted/hidden items
  const visibleManuscripts = manuscripts.filter(m => !deletedIds.includes(m.id))
  const visibleSeries = seriesList.filter(s => !deletedIds.includes(s.id))

  // Get active manuscript
  const activeManuscript = manuscripts.find(m => m.id === selectedManuscriptId)

  // Get active series
  const activeSeries = selectedSeriesId ? seriesList.find(s => s.id === selectedSeriesId) : undefined

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

  const updateManuscriptStatusInList = (mId: string, newStatus: DisplayManuscript['status']) => {
    setManuscripts(prev => prev.map(m => m.id === mId ? { ...m, status: newStatus } : m))
  }

  const handleRejectChapterFlow = async (mId: string) => {
    if (!activeManuscript) return
    if (!rejectionReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối!')
      return
    }
    try {
      setLoading(true)
      // Đảm bảo bản thảo ở trạng thái 'submitted' trước khi reject (xử lý trường hợp bị kẹt ở 'draft')
      try {
        await editorService.overrideManuscriptStatus(mId, 'submitted')
      } catch (_) { /* ignore if already submitted */ }
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

      updateManuscriptStatusInList(mId, 'REJECTED')
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
      // Đảm bảo bản thảo ở trạng thái 'submitted' trước khi approve (xử lý trường hợp bị kẹt ở 'draft')
      try {
        await editorService.overrideManuscriptStatus(mId, 'submitted')
      } catch (_) { /* ignore if already submitted */ }
      await editorService.approveManuscript(mId)
      
      // Approve chapter directly
      if (activeManuscript.chapterId) {
        await editorService.updateChapterStatus(activeManuscript.chapterId, 'approved')
      }

      // Gửi thông báo đến Mangaka
      if (activeManuscript.mangakaId) {
        await editorService.sendInternalNotification(
          activeManuscript.mangakaId,
          "Duyệt bản thảo thành công",
          `Bản thảo [${activeManuscript.chapter}] thuộc bộ truyện [${activeManuscript.series}] đã được phê duyệt thành công.`,
          `ms_approved:${mId}`
        ).catch(errNotif => {
          console.error('Failed to notify mangaka of manuscript approval:', errNotif)
        })
      }

      updateManuscriptStatusInList(mId, 'APPROVED')
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
    const visibleIds = visibleManuscripts.map(m => m.id)
    if (selectedIds.length === visibleIds.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(visibleIds)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      showToast('Chưa chọn chương truyện nào để duyệt!')
      return
    }
    try {
      for (const id of selectedIds) {
        await editorService.approveManuscript(id)
        
        // Gửi thông báo đến Mangaka
        const ms = manuscripts.find(m => m.id === id)
        if (ms && ms.mangakaId) {
          await editorService.sendInternalNotification(
            ms.mangakaId,
            "Duyệt bản thảo thành công",
            `Bản thảo [${ms.chapter}] thuộc bộ truyện [${ms.series}] đã được phê duyệt thành công.`,
            `ms_approved:${id}`
          ).catch(e => console.error('Failed to notify bulk approve:', e))
        }
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
      showToast('Chưa chọn chương truyện nào để từ chối!')
      return
    }
    try {
      for (const id of selectedIds) {
        await editorService.rejectManuscript(id)
        
        // Gửi thông báo đến Mangaka
        const ms = manuscripts.find(m => m.id === id)
        if (ms && ms.mangakaId) {
          await editorService.sendInternalNotification(
            ms.mangakaId,
            `Từ chối bản thảo ${ms.chapter}`,
            "Chương truyện bị từ chối duyệt theo yêu cầu của Biên tập viên.",
            `ms_fb:${id}`
          ).catch(e => console.error('Failed to notify bulk reject:', e))
        }
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
      showToast(`Đã phê duyệt Series thành công! Trạng thái hiện tại: Đang vẽ.`)

      const targetSeries = seriesList.find(s => s.id === sId)
      const seriesTitle = targetSeries ? targetSeries.title : 'Series mới'

      // Gửi thông báo đến Mangaka
      if (targetSeries && targetSeries.mangakaId) {
        await editorService.sendInternalNotification(
          targetSeries.mangakaId,
          "Duyệt tác phẩm mới",
          `Chúc mừng! Đề xuất tác phẩm mới [${seriesTitle}] của bạn đã được phê duyệt đưa vào sản xuất (Trạng thái: Đang vẽ).`,
          "series_approved"
        ).catch(errNotif => {
          console.error('Failed to notify mangaka of series approval:', errNotif)
        })
      }

      // Gửi thông báo đến toàn bộ các Admin và Board member trong hệ thống
      try {
        const systemAdminsAndBoard = [
          '8915af7c-1825-43cb-bce8-614abf1143c7', // phat123 (admin)
          '11111111-1111-1111-1111-111111111111', // admin01 (admin)
          '3790bad3-ac55-4d31-9176-a7318aab0429', // Admin (admin)
          '2c38fe0d-cd90-45cf-adcd-e5794ae46200', // Toaster (admin)
          '75770833-7b5e-4fc9-a633-b30ca303fa29', // luanAdmin0101 (admin)
          '029d5fd5-d073-47b5-8cd2-6edce019edd7', // Phongtt (board)
          'a1780a4d-fdb8-4aaf-8747-d2ca45512dfd', // Editorial_Board (board)
          '5a0d4321-beb5-4c10-bebd-0b05f20e11b4', // huhuhuu (board)
          '8c91ee85-be04-4a60-b99b-6957fb63eeca', // board_accept (board)
          '0983b7c1-d1cd-4de8-8ec7-6e3e140cfe3c', // ChiefEditor (board)
          '03f618c4-b208-4b07-9741-a954b68195ee', // phong (board)
          '7bce43df-62b2-40dd-a41a-975686ae7ab9'  // truongtamphong (board)
        ]

        await Promise.all(
          systemAdminsAndBoard.map(userId =>
            editorService.sendInternalNotification(
              userId,
              "Series mới đã được duyệt",
              `Tác phẩm [${seriesTitle}] đã được Tantou Editor phê duyệt trực tiếp (Trạng thái: Đang vẽ).`,
              "series_approved_by_tantou"
            ).catch(errNotif => {
              console.error(`Lỗi khi gửi thông báo cho admin/board ${userId}:`, errNotif)
            })
          )
        )
      } catch (errNotifs) {
        console.error("Lỗi khi xử lý gửi thông báo đề xuất series:", errNotifs)
      }

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

      const targetSeries = seriesList.find(s => s.id === sId)
      const seriesTitle = targetSeries ? targetSeries.title : 'Series mới'

      // Gửi thông báo đến Mangaka
      if (targetSeries && targetSeries.mangakaId) {
        await editorService.sendInternalNotification(
          targetSeries.mangakaId,
          "Yêu cầu chỉnh sửa Series",
          `Hồ sơ tác phẩm [${seriesTitle}] của bạn cần chỉnh sửa thêm theo yêu cầu của Biên tập viên.`,
          "series_revision_requested"
        ).catch(errNotif => {
          console.error('Failed to notify mangaka of series revision:', errNotif)
        })
      }

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

      const targetSeries = seriesList.find(s => s.id === sId)
      const seriesTitle = targetSeries ? targetSeries.title : 'Series mới'

      // Gửi thông báo đến Mangaka
      if (targetSeries && targetSeries.mangakaId) {
        await editorService.sendInternalNotification(
          targetSeries.mangakaId,
          "Từ chối hồ sơ Series",
          `Yêu cầu đề xuất tác phẩm [${seriesTitle}] của bạn đã bị từ chối duyệt.`,
          "series_rejected"
        ).catch(errNotif => {
          console.error('Failed to notify mangaka of series rejection:', errNotif)
        })
      }

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
      <div className="w-[260px] flex-shrink-0 flex flex-col bg-white border-4 border-manga-ink overflow-hidden">
        <div className="p-4 border-b-4 border-manga-ink bg-manga-ink text-white flex-shrink-0">
          <h2 className="font-manga text-xl font-bold uppercase tracking-wider">
            {activeTab === 'MANUSCRIPT' ? 'Duyệt Bản Thảo' : 'Duyệt Đề Xuất Series'}
          </h2>
          <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase">
            {activeTab === 'MANUSCRIPT'
              ? `${visibleManuscripts.length} Bản Thảo Hiện Có`
              : `${visibleSeries.length} Đề xuất mới chờ duyệt`
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
                  checked={selectedIds.length === visibleManuscripts.length && visibleManuscripts.length > 0}
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
              {visibleManuscripts.length === 0 ? (
                <div className="p-4 text-center text-xs font-bold text-gray-400">Không có bản thảo nào cần duyệt</div>
              ) : (
                visibleManuscripts.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectManuscript(m.id)}
                    className={`p-3 border-2 cursor-pointer transition-all flex items-start gap-2 group relative ${selectedManuscriptId === m.id
                      ? 'border-manga-ink bg-red-50/50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : viewedIds.includes(m.id)
                        ? 'border-gray-200 bg-zinc-50/50 opacity-70 hover:opacity-100 hover:border-gray-300'
                        : 'border-manga-ink bg-white hover:border-black font-extrabold shadow-sm'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(m.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelectId(m.id) }}
                      className="mt-1 w-4 h-4 border-2 border-manga-ink accent-manga-ink"
                    />
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm truncate pr-2 ${viewedIds.includes(m.id) ? 'font-semibold text-gray-500' : 'font-extrabold text-gray-900'}`}>{m.series}</span>
                        {getStatusBadge(m.status)}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-bold ${viewedIds.includes(m.id) ? 'text-manga-red/70' : 'text-manga-red'}`}>{m.chapter}</span>
                        <span className={`font-bold truncate max-w-[100px] ${viewedIds.includes(m.id) ? 'text-gray-400' : 'text-gray-600'}`}>{m.mangaka}</span>
                      </div>
                    </div>

                    {/* Three-dot action button */}
                    <div className="absolute right-2 top-2 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenuId(activeMenuId === m.id ? null : m.id)
                        }}
                        className="p-1 hover:bg-gray-200 border-2 border-transparent hover:border-manga-ink transition-all hidden group-hover:block bg-white shadow-sm rounded-full"
                      >
                        <MoreHorizontal className="w-4 h-4 text-manga-ink" />
                      </button>

                      {/* Dropdown Menu (Speech bubble tooltip style) */}
                      {activeMenuId === m.id && (
                        <div className="absolute right-0 mt-3 bg-white border border-gray-200 shadow-xl rounded-xl py-2 min-w-[200px] z-30 font-sans text-gray-800 normal-case">
                          {/* Triangle Pointer pointing upwards to the three-dot button */}
                          <div className="absolute bottom-full right-3 w-3 h-3 bg-white border-t border-l border-gray-200 transform translate-y-[7px] rotate-45" />
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const isRead = viewedIds.includes(m.id)
                              if (isRead) {
                                setViewedIds(prev => {
                                  const updated = prev.filter(id => id !== m.id)
                                  localStorage.setItem('viewed_review_items', JSON.stringify(updated))
                                  return updated
                                })
                              } else {
                                markAsViewed(m.id)
                              }
                              setActiveMenuId(null)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-3 text-sm font-semibold transition-colors"
                          >
                            <Check className="w-4 h-4 text-gray-700" />
                            {viewedIds.includes(m.id) ? 'Đánh dấu là chưa đọc' : 'Đánh dấu là đã đọc'}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteItem(m.id)
                              setActiveMenuId(null)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-3 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                          >
                            <XSquare className="w-4 h-4" />
                            Xóa thông báo này
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Series List */
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
            {visibleSeries.length === 0 ? (
              <div className="p-4 text-center text-xs font-bold text-gray-400">Không có series mới nào cần duyệt</div>
            ) : (
              visibleSeries.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSeriesId(s.id)}
                  className={`p-3 border-2 cursor-pointer transition-all flex items-start gap-2 group relative ${selectedSeriesId === s.id
                    ? 'border-manga-ink bg-red-50/50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : (viewedIds.includes(s.id) || s.status === 'approved')
                      ? 'border-gray-200 bg-zinc-50/50 opacity-70 hover:opacity-100 hover:border-gray-300'
                      : 'border-manga-ink bg-white hover:border-black font-extrabold shadow-sm'
                    }`}
                >
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm truncate pr-2 ${(viewedIds.includes(s.id) || s.status === 'approved') ? 'font-semibold text-gray-500' : 'font-extrabold text-gray-900'}`}>{s.title}</span>
                      {hasActiveSession(s.id) ? (
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold border border-yellow-700 px-2 py-0.5">CHỜ HỘI ĐỒNG</span>
                      ) : s.status === 'approved' ? (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold border border-green-700 px-2 py-0.5">ĐÃ DUYỆT</span>
                      ) : (
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold border border-orange-700 px-2 py-0.5">ĐÃ NỘP</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-bold ${(viewedIds.includes(s.id) || s.status === 'approved') ? 'text-manga-red/70' : 'text-manga-red'}`}>{s.genre}</span>
                      <span className={`font-bold truncate max-w-[120px] ${(viewedIds.includes(s.id) || s.status === 'approved') ? 'text-gray-400' : 'text-gray-600'}`}>{s.mangaka}</span>
                    </div>
                  </div>

                  {/* Three-dot action button */}
                  <div className="absolute right-2 top-2 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveMenuId(activeMenuId === s.id ? null : s.id)
                      }}
                      className="p-1 hover:bg-gray-200 border-2 border-transparent hover:border-manga-ink transition-all hidden group-hover:block bg-white shadow-sm rounded-full"
                    >
                      <MoreHorizontal className="w-4 h-4 text-manga-ink" />
                    </button>

                    {/* Dropdown Menu (Speech bubble tooltip style) */}
                    {activeMenuId === s.id && (
                      <div className="absolute right-0 mt-3 bg-white border border-gray-200 shadow-xl rounded-xl py-2 min-w-[200px] z-30 font-sans text-gray-800 normal-case">
                        {/* Triangle Pointer pointing upwards */}
                        <div className="absolute bottom-full right-3 w-3 h-3 bg-white border-t border-l border-gray-200 transform translate-y-[7px] rotate-45" />
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const isRead = viewedIds.includes(s.id)
                            if (isRead) {
                              setViewedIds(prev => {
                                const updated = prev.filter(id => id !== s.id)
                                localStorage.setItem('viewed_review_items', JSON.stringify(updated))
                                return updated
                              })
                            } else {
                              markAsViewed(s.id)
                            }
                            setActiveMenuId(null)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-3 text-sm font-semibold transition-colors"
                        >
                          <Check className="w-4 h-4 text-gray-700" />
                          {(viewedIds.includes(s.id) || s.status === 'approved') ? 'Đánh dấu là chưa đọc' : 'Đánh dấu là đã đọc'}
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteItem(s.id)
                            setActiveMenuId(null)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-3 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                        >
                          <XSquare className="w-4 h-4" />
                          Xóa thông báo này
                        </button>
                      </div>
                    )}
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
              <div className="bg-gray-50 border-b-2 border-manga-ink p-3 flex-shrink-0 flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap text-[11px] leading-tight">
                  <span className="font-extrabold text-gray-500 uppercase tracking-wide">{activeManuscript.series}</span>
                  <span className="text-gray-300 font-bold">|</span>
                  <span className="font-extrabold text-manga-red uppercase">{activeManuscript.chapter} - Kịch bản chữ</span>
                </div>

                {activeManuscript.content && (
                  <button
                    onClick={() => setIsScriptModalOpen(true)}
                    className="w-full py-1.5 bg-manga-ink text-white font-extrabold text-[10px] uppercase tracking-wider hover:bg-[#E63946] border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none cursor-pointer text-center"
                  >
                    Đọc kịch bản
                  </button>
                )}
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
                    <div className="whitespace-pre-wrap break-words break-all text-sm text-gray-800 font-medium leading-relaxed font-sans">
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
            <div className="w-[280px] flex-shrink-0 flex flex-col bg-white border-4 border-manga-ink p-4 h-full min-h-0 overflow-hidden gap-4">
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

                                    {activeManuscript.status === 'APPROVED' ? (
                    <div className="flex flex-col items-center justify-center py-4 bg-green-50 border-2 border-green-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-green-700 rounded gap-2 p-3 text-center my-2">
                      <Check className="w-8 h-8 text-green-600 bg-green-100 rounded-full p-1" />
                      <span className="font-manga text-xs font-bold uppercase tracking-wider">ĐÃ PHÊ DUYỆT</span>
                      <span className="text-[10px] text-gray-600 font-bold leading-normal">
                        Bản thảo này đã được phê duyệt thành công. Bạn không thể thực hiện thêm thao tác duyệt lúc này.
                      </span>
                    </div>
                  ) : activeManuscript.status === 'REJECTED' ? (
                    <div className="flex flex-col items-center justify-center py-4 bg-red-50 border-2 border-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-red-700 rounded gap-2 p-3 text-center my-2">
                      <XCircle className="w-8 h-8 text-red-600 bg-red-100 rounded-full p-1" />
                      <span className="font-manga text-xs font-bold uppercase tracking-wider">ĐÃ TỪ CHỐI</span>
                      <span className="text-[10px] text-gray-600 font-bold leading-normal">
                        Bản thảo này đã bị từ chối phê duyệt. Bạn không thể thực hiện thêm thao tác duyệt lúc này.
                      </span>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                <button
                  onClick={async () => {
                    try {
                      await editorService.archiveManuscript(activeManuscript.id);
                      setManuscripts(prev => {
                        const filtered = prev.filter(m => m.id !== activeManuscript.id)
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
            <div className="w-[280px] bg-white border-4 border-manga-ink p-4 flex items-center justify-center text-center">
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
              {activeSeries.status === 'approved' ? (
                <div className="border-t-2 border-manga-ink pt-3 flex flex-col gap-2 flex-shrink-0">
                  <div className="bg-green-50 border-4 border-green-500 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 animate-pulse" />
                    <div>
                      <h4 className="font-extrabold text-sm text-manga-ink uppercase">HỒ SƠ ĐÃ ĐƯỢC PHÊ DUYỆT</h4>
                      <p className="text-xs text-gray-600 font-bold mt-1">Series này đã được phê duyệt. Bạn không thể thực hiện thêm thao tác duyệt lúc này.</p>
                    </div>
                  </div>
                </div>
              ) : hasActiveSession(activeSeries.id) ? (
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

      {/* Script Modal Popup */}
      {isScriptModalOpen && activeManuscript && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink w-full max-w-5xl h-[85vh] flex flex-col shadow-[8px_8px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gray-50 border-b-4 border-manga-ink py-4 px-6 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="font-manga text-lg font-black uppercase text-manga-ink leading-none">
                  {activeManuscript.series}
                </h3>
                <p className="text-xs text-manga-red font-bold uppercase mt-1.5">
                  {activeManuscript.chapter} — Kịch bản chi tiết
                </p>
              </div>
              <button
                onClick={() => setIsScriptModalOpen(false)}
                className="p-1 bg-white border-2 border-manga-ink hover:bg-red-50 hover:text-manga-red transition-all cursor-pointer"
                title="Đóng"
              >
                <XSquare className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-[#FAF9F6] select-text">
              <div className="max-w-3xl mx-auto">
                <div className="border-b-2 border-dashed border-manga-ink/20 pb-4 mb-6">
                  <h1 className="text-3xl font-black text-manga-ink mb-2">
                    {activeManuscript.chapter}
                  </h1>
                  <p className="text-xs text-gray-500 font-extrabold uppercase tracking-wide">
                    Tác giả: <span className="text-manga-red">{activeManuscript.mangaka}</span>
                  </p>
                </div>
                <div className="whitespace-pre-wrap break-words break-all text-base md:text-lg text-gray-800 font-medium leading-loose font-sans">
                  {activeManuscript.content}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t-4 border-manga-ink p-4 bg-gray-50 flex justify-end flex-shrink-0">
              <button
                onClick={() => setIsScriptModalOpen(false)}
                className="px-6 py-2.5 bg-manga-ink text-white font-extrabold text-xs uppercase tracking-wider hover:bg-black border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none cursor-pointer"
              >
                Đóng kịch bản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
