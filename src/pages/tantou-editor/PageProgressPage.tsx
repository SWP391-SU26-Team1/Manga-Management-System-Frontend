import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Search, ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Clock, Loader2, X, Image, Maximize2, Download, BellRing } from 'lucide-react'
import { editorService } from '@/services/editor.service'

interface DisplayPage {
  page: string
  status: string
  assignee: string
  meetingDate: string
  deadline: string
  revisions: number
  notes: string
  image_url?: string
  task_id?: string
  page_id?: string
}

interface DisplayChapter {
  id: string
  chapter: string
  chapter_number: number
  submitDate: string
  deadline: string
  approvedCount: number
  totalCount: number
  progress: number
  isLate: boolean
  latePagesCount: number
  status?: string
  series_id?: string
  pages: DisplayPage[]
  created_at?: string
  isVirtual?: boolean
}

interface DisplaySeriesProgress {
  id: string
  series: string
  status: string
  publishSchedule?: string
  chapters: DisplayChapter[]
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
  const navigate = useNavigate()
  const [progressData, setProgressData] = useState<DisplaySeriesProgress[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set()) // Lưu trữ ID Series được mở rộng
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [pageStatuses, setPageStatuses] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProgressChapter, setSelectedProgressChapter] = useState<DisplayChapter | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [isReadingMode, setIsReadingMode] = useState(false)
  const [activeManuscript, setActiveManuscript] = useState<any | null>(null)
  const [isLoadingManuscript, setIsLoadingManuscript] = useState(false)
  const [rejectingPageId, setRejectingPageId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<string>('')
  const [rawTasks, setRawTasks] = useState<any[]>([])

  useEffect(() => {
    if (!selectedProgressChapter) {
      setActiveManuscript(null)
      return
    }

    const fetchManuscript = async () => {
      setIsLoadingManuscript(true)
      try {
        const res = await editorService.getManuscripts({ chapterId: selectedProgressChapter.id })
        const list = res.data || res || []
        if (list.length > 0) {
          const manuscriptId = list[0].manuscript_id || list[0].id
          const detail = await editorService.getManuscriptDetail(manuscriptId)
          const detailData = detail.data || detail
          setActiveManuscript(detailData)
        } else {
          setActiveManuscript(null)
        }
      } catch (err) {
        console.error('Failed to fetch manuscript details:', err)
        setActiveManuscript(null)
      } finally {
        setIsLoadingManuscript(false)
      }
    }

    fetchManuscript()
  }, [selectedProgressChapter])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [seriesRes, chaptersRes, pagesRes, tasksRes] = await Promise.all([
        editorService.getSeries({ limit: 100 }),
        editorService.getChapters({ limit: 100 }),
        editorService.getPages({ limit: 100 }),
        editorService.getPageTasks({ limit: 1000 })
      ])

      const seriesData = seriesRes.data || seriesRes
      const seriesList = Array.isArray(seriesData) ? seriesData : (seriesData.series || seriesData.items || [])
      
      const chaptersData = chaptersRes.data || chaptersRes
      const chaptersList = Array.isArray(chaptersData) ? chaptersData : (chaptersData.chapters || chaptersData.items || [])

      const pagesData = pagesRes.data || pagesRes
      const pagesList = Array.isArray(pagesData) ? pagesData : (pagesData.pages || pagesData.items || [])

      const tasksData = tasksRes.data || tasksRes
      const tasksList = Array.isArray(tasksData) ? tasksData : (tasksData.tasks || tasksData.items || [])
      setRawTasks(tasksList)

      const seriesMap: Record<string, any> = {}
      const activeSeriesIds = new Set<string>()
      seriesList.forEach((s: any) => {
        seriesMap[s.series_id || s.id] = { 
          title: s.title, 
          status: String(s.status || '').toLowerCase(),
          publishSchedule: s.publishSchedule || 'Weekly',
          proposedStartDate: s.proposedStartDate,
          extensions: s.extensions || {}
        }
        activeSeriesIds.add(s.series_id || s.id)
      })

      // Gom nhóm trang theo Chapter ID
      const pagesByChapter: Record<string, any[]> = {}
      pagesList.forEach((p: any) => {
        if (!pagesByChapter[p.chapter_id]) {
          pagesByChapter[p.chapter_id] = []
        }
        pagesByChapter[p.chapter_id].push(p)
      })

      // Gom nhóm Chapter theo Series ID
      const seriesProgressMap: Record<string, DisplaySeriesProgress> = {}

      // Khởi tạo cho tất cả series của Tantou trước để đảm cả bộ truyện trống cũng hiện diện
      seriesList.forEach((s: any) => {
        const seriesId = s.series_id || s.id
        seriesProgressMap[seriesId] = {
          id: seriesId,
          series: s.title,
          status: String(s.status || '').toLowerCase(),
          publishSchedule: s.publishSchedule || 'Weekly',
          chapters: []
        }
      })

      const activeChapters = chaptersList.filter((ch: any) => activeSeriesIds.has(ch.series_id))

      activeChapters.forEach((ch: any) => {
        const seriesId = ch.series_id
        const seriesInfo = seriesMap[seriesId] || { title: ch.series?.title || '—', status: 'unknown' }

        if (!seriesProgressMap[seriesId]) {
          seriesProgressMap[seriesId] = {
            id: seriesId,
            series: seriesInfo.title,
            status: seriesInfo.status,
            publishSchedule: seriesInfo.publishSchedule,
            chapters: []
          }
        }

        const rawPages = pagesByChapter[ch.chapter_id] || []
        
        const pages: DisplayPage[] = rawPages.map((p: any) => {
          const tasksForPage = tasksList.filter((t: any) => t.page_id === p.page_id)
          tasksForPage.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
          const task = tasksForPage[0]
          
          let pageStatus = p.status || 'draft'
          if (pageStatus.toLowerCase() === 'completed') pageStatus = 'APPROVED'
          else if (pageStatus.toLowerCase() === 'review') pageStatus = 'SUBMITTED'

          return {
            page: `P.${String(p.page_number || 0).padStart(2, '0')}`,
            status: pageStatus.toUpperCase(),
            assignee: task?.assignee?.username || task?.assistant?.username || '—',
            meetingDate: p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '—',
            deadline: task?.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '—',
            revisions: task?.revision_count || 0,
            notes: task?.notes || task?.content || '',
            image_url: p.image_url || '',
            task_id: task?.task_id || '',
            page_id: p.page_id || '',
          }
        })

        pages.sort((a, b) => a.page.localeCompare(b.page))

        const approvedCount = pages.filter(p => p.status === 'APPROVED' || p.status === 'COMPLETED').length
        let progress = pages.length > 0 ? Math.round((approvedCount / pages.length) * 100) : 0
        if (['pending_review', 'under_review', 'approved', 'completed', 'published'].includes(String(ch.status || '').toLowerCase())) {
          progress = 100
        }

        // Tính toán deadline chương truyện và kiểm tra trễ hạn
        let chapterDeadline = '—'
        let chapterDeadlineDate: Date | null = null;

        // Find all chapters of this series to find the latest published one
        const seriesChapters = chaptersList.filter((c: any) => c.series_id === ch.series_id)
        const publishedChaps = seriesChapters.filter((c: any) => 
          ['approved', 'completed', 'published', 'đã hoàn thành', 'đã xuất bản'].includes(String(c.status || '').toLowerCase())
        )

        let latestPublishedChap: any = null
        if (publishedChaps.length > 0) {
          publishedChaps.sort((a: any, b: any) => (b.chapter_number || 0) - (a.chapter_number || 0))
          latestPublishedChap = publishedChaps[0]
        }

        let baselineDate: Date | null = null
        let chapNumDiff = 0

        if (latestPublishedChap) {
          if (ch.chapter_number <= latestPublishedChap.chapter_number) {
            const thisChapPublished = seriesChapters.find((c: any) => c.chapter_id === ch.chapter_id && ['approved', 'completed', 'published', 'đã hoàn thành', 'đã xuất bản'].includes(String(c.status || '').toLowerCase()))
            if (thisChapPublished) {
              baselineDate = new Date(thisChapPublished.publish_date || thisChapPublished.created_at || thisChapPublished.updated_at)
              chapNumDiff = 0
            } else {
              baselineDate = new Date(latestPublishedChap.publish_date || latestPublishedChap.created_at || latestPublishedChap.updated_at)
              chapNumDiff = ch.chapter_number - latestPublishedChap.chapter_number
            }
          } else {
            baselineDate = new Date(latestPublishedChap.publish_date || latestPublishedChap.created_at || latestPublishedChap.updated_at)
            chapNumDiff = ch.chapter_number - latestPublishedChap.chapter_number
          }
        } else {
          const proposedStr = seriesInfo?.proposedStartDate || seriesInfo?.created_at || ch.series?.created_at
          if (proposedStr) {
            baselineDate = new Date(proposedStr)
            chapNumDiff = (ch.chapter_number || 1) - 1
          }
        }

        if (baselineDate && !isNaN(baselineDate.getTime())) {
          let intervalDays = 7
          const schedule = String(seriesInfo?.publishSchedule || ch.series?.publishSchedule || 'Weekly').toLowerCase()
          if (schedule.includes('bi-weekly')) {
            intervalDays = 14
          } else if (schedule.includes('monthly')) {
            intervalDays = 30
          }
          chapterDeadlineDate = new Date(baselineDate.getTime() + chapNumDiff * intervalDays * 24 * 60 * 60 * 1000)
          
          const extDateStr = seriesInfo?.extensions?.[ch.chapter_id || ch.id]
          if (extDateStr) {
            const extDate = new Date(extDateStr)
            if (!isNaN(extDate.getTime())) {
              chapterDeadlineDate = extDate
            }
          }
          
          chapterDeadline = chapterDeadlineDate.toLocaleDateString('vi-VN')
        }

        // Fallback if no proposedStartDate was found or parsed
        if (!chapterDeadlineDate) {
          rawPages.forEach((p: any) => {
            const task = tasksList.find((t: any) => t.page_id === p.page_id)
            if (task?.deadline) {
              const d = new Date(task.deadline)
              if (chapterDeadlineDate === null || d < chapterDeadlineDate) {
                chapterDeadlineDate = d;
                chapterDeadline = d.toLocaleDateString('vi-VN')
              }
            }
          })
        }

        let isLate = false;
        let latePagesCount = 0;
        const now = new Date()

        if (chapterDeadlineDate) {
          const isChapDone = ['approved', 'completed', 'published'].includes(String(ch.status || '').toLowerCase())
          if (!isChapDone && chapterDeadlineDate < now) {
            isLate = true
            rawPages.forEach((p: any) => {
              if (!['approved', 'completed'].includes(p.status.toLowerCase())) {
                latePagesCount++
              }
            })
            if (latePagesCount === 0) latePagesCount = 1
          }
        }

        // Align with backend overdue alert logic: if chapter has any task that is past deadline and not completed
        const chapterPageIds = rawPages.map((p: any) => p.page_id)
        const isChapCompletedOrPublished = ['completed', 'published'].includes(String(ch.status || '').toLowerCase())
        const hasOverdueTask = !isChapCompletedOrPublished && tasksList.some((t: any) => 
          chapterPageIds.includes(t.page_id) && 
          t.deadline && 
          new Date(t.deadline) < now && 
          String(t.status || '').toLowerCase() !== 'completed'
        )

        if (hasOverdueTask) {
          isLate = true
          // Calculate latePagesCount
          rawPages.forEach((p: any) => {
            const hasOverduePageTask = tasksList.some((t: any) => 
              t.page_id === p.page_id && 
              t.deadline && 
              new Date(t.deadline) < now && 
              String(t.status || '').toLowerCase() !== 'completed'
            )
            if (hasOverduePageTask) {
              latePagesCount++
            }
          })
          if (latePagesCount === 0) latePagesCount = 1
        }

        seriesProgressMap[seriesId].chapters.push({
          id: ch.chapter_id || ch.id,
          chapter: ch.title || `Ch.${ch.chapter_number}`,
          chapter_number: ch.chapter_number || 0,
          status: ch.status,
          series_id: seriesId,
          submitDate: ch.created_at ? new Date(ch.created_at).toLocaleDateString('vi-VN') : '—',
          deadline: chapterDeadline,
          approvedCount,
          totalCount: pages.length,
          progress,
          isLate,
          latePagesCount,
          pages,
          created_at: ch.created_at
        })
      })



      // 4. Tính toán chương ảo cho các series đã xuất bản
      const currentDate = new Date();
      Object.values(seriesProgressMap).forEach(series => {
        if (series.status === 'published') {
          const hasActiveChapter = series.chapters.some(c => {
            const isDone = ['approved', 'completed', 'published', 'đã hoàn thành', 'đã xuất bản'].includes(String(c.status || '').toLowerCase()) || c.progress === 100;
            return !isDone;
          });
          
          if (!hasActiveChapter) {
            const publishedChaps = series.chapters.filter(c => ['approved', 'completed', 'published', 'đã hoàn thành', 'đã xuất bản'].includes(String(c.status || '').toLowerCase()) || c.progress === 100);
            
            let latestChapNum = 0;
            const seriesInfo = seriesMap[series.id];
            let lastPublishDateStr = seriesInfo?.proposedStartDate || (series as any).created_at || new Date().toISOString();
            
            if (publishedChaps.length > 0) {
              publishedChaps.sort((a, b) => b.chapter_number - a.chapter_number);
              const latest = publishedChaps[0];
              latestChapNum = latest.chapter_number || 0;
              if (latest.created_at) {
                lastPublishDateStr = latest.created_at;
              }
            }
            
            const lastDate = new Date(lastPublishDateStr);
            let intervalDays = 7;
            const schedule = String(series.publishSchedule || '').toLowerCase();
            if (schedule.includes('bi-weekly')) {
              intervalDays = 14;
            } else if (schedule.includes('monthly')) {
              intervalDays = 30;
            }
            
            let virtualDeadlineDate = new Date(lastDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
            const extDateStr = seriesInfo?.extensions?.[`virtual_${series.id}`];
            if (extDateStr) {
              const extDate = new Date(extDateStr);
              if (!isNaN(extDate.getTime())) {
                virtualDeadlineDate = extDate;
              }
            }
            const isLate = virtualDeadlineDate < currentDate;
            
            series.chapters.push({
              id: `virtual_${series.id}`,
              chapter: `Chương ${latestChapNum + 1} (Dự kiến)`,
              chapter_number: latestChapNum + 1,
              status: 'CHƯA KHỞI TẠO',
              series_id: series.id,
              submitDate: '—',
              deadline: virtualDeadlineDate.toLocaleDateString('vi-VN'),
              approvedCount: 0,
              totalCount: 0,
              progress: 0,
              isLate: isLate,
              latePagesCount: isLate ? 1 : 0,
              pages: [],
              created_at: new Date().toISOString(),
              isVirtual: true
            });
          }
        }
      });

      const mapped = Object.values(seriesProgressMap).map(sp => {
        sp.chapters.sort((a, b) => b.chapter_number - a.chapter_number)
        return sp
      })

      // Sắp xếp các bộ truyện theo bảng chữ cái
      mapped.sort((a, b) => a.series.localeCompare(b.series))

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
      p.chapters.some(ch => ch.chapter.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleApprovePage = async (chapterId: string, page: any) => {
    try {
      if (page.task_id) {
        const rawTask = rawTasks.find((t) => t.task_id === page.task_id)
        const isTransitionable = rawTask && ['submitted', 'review'].includes(rawTask.status.toLowerCase())
        if (!isTransitionable) {
          await editorService.overrideTaskStatus(page.task_id, 'review')
        }
        await editorService.approveTask(page.task_id)
      }
      await editorService.updatePageStatus(page.page_id, 'completed')
      setPageStatuses(prev => ({ ...prev, [`${chapterId}-${page.page}`]: 'APPROVED' }))
      showToast(`Đã DUYỆT trang ${page.page} thành công!`)
    } catch (err: any) {
      console.error(err)
      showToast('Không thể duyệt trang: ' + (err.message || ''))
    }
  }

  const handleRejectPage = (pageTaskId: string) => {
    setRejectingPageId(pageTaskId)
    setRejectReason('')
  }

  const handleConfirmReject = async (page: any) => {
    if (!rejectReason.trim()) {
      showToast('Vui lòng nhập lý do cần sửa!')
      return
    }
    try {
      if (page.task_id) {
        const rawTask = rawTasks.find((t) => t.task_id === page.task_id)
        const isTransitionable = rawTask && ['submitted', 'review'].includes(rawTask.status.toLowerCase())
        if (!isTransitionable) {
          await editorService.overrideTaskStatus(page.task_id, 'review')
        }
        await editorService.requestTaskRevision(page.task_id, rejectReason.trim())
        await editorService.updatePageStatus(page.page_id, 'review')
        await editorService.updateChapterStatus(selectedProgressChapter!.id, 'rejected')
      }
      setPageStatuses(prev => ({ ...prev, [`${selectedProgressChapter!.id}-${page.page}`]: 'NEED_FIX' }))
      showToast(`Đã gửi yêu cầu chỉnh sửa trang ${page.page} thành công!`)
      setRejectingPageId(null)
      setRejectReason('')
    } catch (err: any) {
      console.error(err)
      showToast('Không thể gửi yêu cầu sửa: ' + (err.message || ''))
    }
  }

  const handleSubmitToBoard = async () => {
    if (!selectedProgressChapter) return
    try {
      await editorService.createEditorReviewSession({
        series_id: selectedProgressChapter.series_id,
        chapter_id: selectedProgressChapter.id,
        name: `Duyệt Chapter - ${selectedProgressChapter.chapter}`
      })
      await editorService.updateChapterStatus(selectedProgressChapter.id, 'under_review')
      showToast('Đã nộp chapter lên Hội đồng duyệt thành công!')
      setSelectedProgressChapter(null)
      fetchData()
    } catch (err: any) {
      console.error(err)
      showToast('Có lỗi xảy ra khi nộp lên Hội đồng.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-manga-red mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">Đang tải tiến độ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-manga-ink text-white px-6 py-3 border-4 border-manga-red shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          {toastMessage}
        </div>
      )}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none">CHAPTER / PAGE</h1>
          <p className="text-sm font-bold text-gray-500 mt-2">Theo dõi tiến độ từng chapter và từng trang bản thảo</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Tìm series hoặc chapter..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border-2 border-manga-ink focus:outline-none focus:border-red-600 text-sm font-bold transition-colors" />
        </div>
      </div>

      <div className="space-y-4">
        {error ? (
          <div className="text-center border-4 border-red-500 p-8 bg-white my-6">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
            <button onClick={fetchData} className="bg-manga-ink text-white font-bold text-xs uppercase px-4 py-2 hover:bg-black transition-colors">Thử lại</button>
          </div>
        ) : filteredProgress.length > 0 ?
          filteredProgress.map((series) => (
          <div key={series.id} className="border-2 border-manga-ink bg-white">
            {/* Accordion Header: Tên Bộ Truyện */}
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors" onClick={() => toggleExpand(series.id)}>
              <div className="flex items-center gap-4">
                {expandedChapters.has(series.id) ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                <div className="flex-1 flex items-start gap-3 pt-1">
                  <span className="font-manga text-xl font-bold text-manga-ink leading-tight">{series.series}</span>

                </div>
              </div>
              
              <div className="flex items-center gap-8 text-sm font-bold">
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 uppercase">Trạng Thái</div>
                  <div className="text-gray-600">
                    {series.status === 'published' ? (
                      <span className="text-green-600 font-bold">Đã xuất bản</span>
                    ) : (
                      <span className="text-gray-500 font-bold">Đang vẽ</span>
                    )}
                  </div>
                </div>
                

              </div>
            </div>

            {/* Accordion Content: Bảng Danh Sách Chapter */}
            {expandedChapters.has(series.id) && (
              <div className="border-t-2 border-gray-100 p-4 bg-gray-50/50">
                {series.chapters && series.chapters.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tên Chapter</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tiến Độ</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ngày Tạo</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Dự kiến ra mắt</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Số Trang</th>
                        <th className="px-4 py-2 w-40"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {series.chapters.map((chapter) => {
                        const dynamicApproved = chapter.pages.filter(p => {
                          const status = pageStatuses[`${chapter.id}-${p.page}`] || p.status
                          return status === 'APPROVED' || status === 'COMPLETED'
                        }).length
                        const dynamicProgress = chapter.pages.length > 0 ? Math.round((dynamicApproved / chapter.pages.length) * 100) : 0

                        return (
                          <tr key={chapter.id} className="hover:bg-white transition-colors">
                            <td className="px-4 py-3 font-bold text-sm text-manga-ink align-middle">
                              <span 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedProgressChapter(chapter)
                                }}
                                className="hover:text-manga-red hover:underline cursor-pointer transition-colors"
                              >
                                {chapter.chapter}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              {dynamicProgress === 100 ? (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold border border-green-200 uppercase rounded-sm whitespace-nowrap">
                                  Đã Hoàn Thành
                                </span>
                              ) : chapter.isLate ? (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold border border-red-200 uppercase rounded-sm whitespace-nowrap">
                                  Trễ Hạn
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 uppercase rounded-sm whitespace-nowrap">
                                  Đang Vẽ
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 align-middle">
                              <div className="flex items-center gap-2 max-w-[180px]">
                                <span className="text-xs font-bold text-gray-500">{dynamicApproved}/{chapter.pages.length} trang</span>
                                <div className="h-2 flex-1 bg-gray-200 rounded overflow-hidden">
                                  <div className={`h-full ${dynamicProgress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${dynamicProgress}%` }} />
                                </div>
                                <span className="text-xs font-extrabold text-gray-700">{dynamicProgress}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 align-middle">{chapter.submitDate}</td>
                            <td className="px-4 py-3 text-xs text-gray-500 align-middle">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400" /> {chapter.deadline}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400 font-bold align-middle">{chapter.pages.length} trang</td>
                            <td className="px-4 py-3 align-middle">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedProgressChapter(chapter)
                                }} 
                                className="px-3 py-1 bg-white border-2 border-manga-ink hover:bg-manga-ink hover:text-white text-[10px] font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                              >
                                Xem bản thảo
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-gray-400 font-bold text-xs bg-gray-50/50">
                    Chưa có chapter nào được tạo cho series này.
                  </div>
                )}
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-12 text-gray-400 text-sm font-bold border-2 border-gray-200 bg-white">
            Không có dữ liệu tiến độ nào
          </div>
        )}
      </div>

      {/* Chapter Manuscript Modal (Popol) */}
      {selectedProgressChapter && (() => {
        const dynamicApproved = selectedProgressChapter.pages.filter(p => {
          const status = pageStatuses[`${selectedProgressChapter.id}-${p.page}`] || p.status
          return status === 'APPROVED' || status === 'COMPLETED'
        }).length
        const dynamicProgress = selectedProgressChapter.pages.length > 0 ? Math.round((dynamicApproved / selectedProgressChapter.pages.length) * 100) : 0

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
            <div className="bg-white border-4 border-manga-ink w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-md overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-gray-50 border-b-4 border-manga-ink p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-manga text-lg font-bold text-manga-ink">
                    {selectedProgressChapter.chapter} - Chi Tiết Bản Thảo Hình Ảnh
                  </span>
                  
                  {/* ĐỌC TRUYỆN BUTTON IN HEADER */}
                  {selectedProgressChapter.pages && selectedProgressChapter.pages.length > 0 && selectedProgressChapter.status !== 'draft' && (
                    <button 
                      onClick={() => setIsReadingMode(true)}
                      className="ml-4 bg-manga-red hover:bg-red-600 text-white px-3.5 py-1 border-2 border-black font-extrabold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer flex items-center gap-1.5"
                    >
                      <Maximize2 className="w-3.5 h-3.5" /> Đọc Truyện
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedProgressChapter(null)}
                  className="w-8 h-8 flex items-center justify-center border-2 border-manga-ink hover:bg-manga-red hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-2 border-dashed border-gray-300 p-4 rounded bg-[#FAF9F6] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                    <div>
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Tổng số trang</div>
                      <div className="text-xl font-black text-manga-ink">{selectedProgressChapter.pages.length} trang</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Đã duyệt</div>
                      <div className="text-xl font-black text-green-600">
                        {dynamicApproved} trang
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Hạn chót chương</div>
                      <div className="text-xl font-black text-gray-600">{selectedProgressChapter.deadline}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Tiến độ hoàn thành</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-black text-manga-red">{dynamicProgress}%</div>
                        <div className="h-2 flex-1 bg-gray-200 border border-gray-300 rounded overflow-hidden">
                          <div className="h-full bg-manga-red" style={{ width: `${dynamicProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

              {/* Manuscript Document Box */}
              {isLoadingManuscript ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-4 rounded text-center text-xs font-bold text-gray-400 uppercase flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  Đang tải kịch bản bản thảo...
                </div>
              ) : activeManuscript ? (
                <div className="bg-blue-50/55 border-2 border-dashed border-blue-300 p-4 rounded flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.03)]">
                  <div className="flex-1">
                    <div className="text-[10px] text-blue-500 font-extrabold uppercase mb-1">
                      Kịch bản / Bản thảo truyện chữ của chương
                    </div>
                    <div className="text-sm font-bold text-manga-ink leading-tight">
                      {activeManuscript.title || 'Bản thảo kịch bản'}
                    </div>
                    {activeManuscript.description && (
                      <p className="text-xs text-gray-500 font-bold mt-1">
                        Mô tả: {activeManuscript.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {activeManuscript.files && activeManuscript.files.length > 0 ? (
                      activeManuscript.files.map((file: any) => (
                        <a
                          key={file.file_id || file.id}
                          href={file.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white border-2 border-black font-bold text-[10px] uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5" /> Tải: {file.file_name || 'Bản thảo'}
                        </a>
                      ))
                    ) : activeManuscript.file_url ? (
                      <a
                        href={activeManuscript.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Download className="w-4 h-4" /> Tải về bản thảo
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">Không có tệp kịch bản đính kèm</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-4 rounded text-center text-xs font-bold text-gray-400 uppercase">
                  Chương này chưa được tác giả tải lên bản thảo kịch bản chữ.
                </div>
              )}

              {/* Conditional rendering based on chapter status */}
              {selectedProgressChapter.status === 'draft' ? (
                <div className="bg-yellow-50 border-4 border-dashed border-[#D69E2E] p-8 text-center flex flex-col items-center justify-center gap-3 manga-shadow-sm">
                  <AlertCircle className="w-10 h-10 text-[#D69E2E] shrink-0" />
                  <h3 className="font-manga text-lg font-bold uppercase text-[#D69E2E]">Bản vẽ chưa được nộp</h3>
                  <p className="text-xs text-gray-500 font-bold max-w-md">
                    Chapter này hiện đang ở trạng thái Bản nháp. Vui lòng đợi Mangaka hoàn tất bản thảo vẽ thô và bấm Nộp Chapter để hiển thị danh sách trang vẽ bên phía Editor.
                  </p>
                </div>
              ) : (
                /* Pages Grid Section */
                <div>
                  <h3 className="font-manga text-sm font-bold uppercase tracking-wider text-manga-ink mb-4 border-b-2 border-manga-ink pb-2">
                    Danh sách trang vẽ của chương
                  </h3>

                  {selectedProgressChapter.pages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {selectedProgressChapter.pages.map((page: any, idx: number) => {
                        const currentStatus = pageStatuses[`${selectedProgressChapter.id}-${page.page}`] || page.status

                        return (
                          <div 
                            key={idx}
                            className="border-2 border-manga-ink bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all flex flex-col group rounded overflow-hidden"
                          >
                            {/* Image view */}
                            <div className="relative h-64 bg-gray-100 border-b-2 border-manga-ink overflow-hidden flex items-center justify-center">
                              {page.image_url ? (
                                <>
                                  <img 
                                    src={page.image_url} 
                                    alt={page.page} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 cursor-pointer"
                                    onClick={() => setLightboxImage(page.image_url)}
                                  />
                                  <button 
                                    onClick={() => setLightboxImage(page.image_url)}
                                    className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded transition-colors"
                                  >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center p-4 text-center">
                                  <Image className="w-10 h-10 text-gray-300 mb-2" />
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">Chưa có hình ảnh</span>
                                </div>
                              )}
                            </div>

                            {/* Page Info */}
                            <div className="p-3 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-sm text-manga-ink">{page.page}</span>
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-extrabold border border-purple-200 uppercase rounded-sm">
                                  {getFriendlyPageStatus(currentStatus)}
                                </span>
                              </div>

                              <div className="text-[10px] text-gray-500 font-bold flex items-center gap-1.5">
                                <div className="w-3.5 h-3.5 rounded-full bg-manga-ink text-white flex items-center justify-center text-[7px] font-bold">
                                  {page.assignee.charAt(0).toUpperCase()}
                                </div>
                                <span>Họa sĩ: <strong className="text-gray-700">{page.assignee}</strong></span>
                              </div>

                              {page.notes && (
                                <div className="mt-0.5 border-t border-dashed border-gray-200 pt-1.5">
                                  <p className="text-[10px] text-gray-400 italic line-clamp-2" title={page.notes}>
                                    Ghi chú: {page.notes}
                                  </p>
                                </div>
                              )}


                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 font-bold border-2 border-dashed border-gray-300 bg-gray-50">
                      Chương này chưa được tác giả phân chia trang bản thảo nào.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t-2 border-gray-200 py-3 px-6 flex justify-end gap-3 flex-shrink-0">
              {selectedProgressChapter.status === 'pending_review' && (
                <button 
                  disabled={dynamicProgress < 100 || rejectingPageId !== null}
                  onClick={handleSubmitToBoard}
                  className={`px-6 py-2 border-2 font-extrabold text-xs uppercase tracking-wider transition-all rounded-sm flex items-center gap-1.5 ${
                    dynamicProgress === 100 && rejectingPageId === null
                      ? 'bg-green-600 hover:bg-green-700 text-white border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                      : 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Nộp lên Hội đồng
                </button>
              )}
              {selectedProgressChapter.isLate && (
                <button 
                  onClick={() => {
                    const seriesInfo = progressData.find(s => s.id === selectedProgressChapter.series_id)
                    const seriesTitle = seriesInfo ? seriesInfo.series : ''
                    let daysLate = 'vài'
                    if (selectedProgressChapter.deadline) {
                      const parts = selectedProgressChapter.deadline.split('/')
                      if (parts.length === 3) {
                        const deadlineDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
                        const now = new Date()
                        if (now > deadlineDate) {
                          daysLate = String(Math.floor((now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24)))
                        }
                      }
                    }
                    navigate(`/dashboard/tantou-editor/series-defense?tab=deadline&series=${encodeURIComponent(seriesTitle)}&chapter=${encodeURIComponent(selectedProgressChapter.chapter)}&msg=late&daysLate=${daysLate}`)
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 border-2 border-black font-extrabold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                >
                  Nhắc deadline
                </button>
              )}
              <button 
                onClick={() => setSelectedProgressChapter(null)}
                className="bg-manga-ink hover:bg-black text-white px-6 py-2 border-2 border-black font-extrabold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )})()}

      {/* Lightbox full-screen viewer */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors p-2"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Manga page preview" 
            className="max-w-full max-h-full object-contain border-4 border-white shadow-2xl rounded animate-in zoom-in-95 duration-200"
          />
        </div>
      )}

      {/* Immersive Scrollable Webtoon Reader Mode */}
      {isReadingMode && selectedProgressChapter && (
        <div className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col overflow-hidden animate-in fade-in duration-300">
          {/* Sticky Header Bar */}
          <div className="bg-zinc-900 border-b-2 border-zinc-800 py-3 px-6 flex items-center justify-between flex-shrink-0 text-white shadow-md">
            <div className="flex items-center gap-3">
              <span className="bg-manga-red text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wider border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                CHẾ ĐỘ ĐỌC
              </span>
              <h2 className="font-manga text-sm font-bold tracking-wide">
                {selectedProgressChapter.chapter} - Bản Thảo Dạng Cuộn
              </h2>
            </div>
            <button 
              onClick={() => setIsReadingMode(false)}
              className="bg-zinc-800 hover:bg-manga-red text-white px-4 py-1.5 rounded-sm border border-zinc-700 hover:border-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              Thoát Chế Độ Đọc
            </button>
          </div>

          {/* Scrollable Webtoon Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-zinc-950 scrollbar-thin scrollbar-thumb-zinc-800">
            <div className="max-w-[800px] w-full flex flex-col items-center">
              {selectedProgressChapter.pages && selectedProgressChapter.pages.length > 0 ? (
                selectedProgressChapter.pages.map((page: any, idx: number) => (
                  <div key={idx} className="w-full flex flex-col items-center mb-6 relative group">
                    {/* Page Label Overlay on hover */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {page.page} - {getFriendlyPageStatus(page.status)}
                    </div>
                    {page.image_url ? (
                      <img 
                        src={page.image_url} 
                        alt={page.page} 
                        className="w-full object-contain border-2 border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
                      />
                    ) : (
                      <div className="w-full aspect-[3/4] max-h-[1000px] bg-zinc-900 border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-500 rounded p-6">
                        <Image className="w-12 h-12 mb-3 text-zinc-700" />
                        <span className="font-extrabold text-sm text-zinc-600 uppercase tracking-wide">
                          {page.page} chưa cập nhật bản thảo hình vẽ
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 text-center py-24 font-bold">
                  Không có trang truyện nào để hiển thị trong chế độ đọc.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
