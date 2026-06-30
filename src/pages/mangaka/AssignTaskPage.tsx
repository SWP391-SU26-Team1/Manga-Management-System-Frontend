import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, Link } from 'react-router'
import { AlertTriangle, Info, X, ClipboardList, ZoomIn, ZoomOut, Maximize, CheckCircle, RefreshCw } from 'lucide-react'
import { TaskTable, DisplayTask } from '@/components/mangaka/TaskTable'
import { seriesService, SeriesAPI } from '@/services/series.service'
import { chapterService, ChapterAPI } from '@/services/chapter.service'
import { pageService, PageAPI } from '@/services/page.service'
import { taskService, TaskAPI, LAYER_TYPE_MAP, TaskType } from '@/services/task.service'
import { regionService } from '@/services/region.service'
import { uploadService } from '@/services/upload.service'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AreaMarkup {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
  saved?: boolean
}

// Layer options displayed in UI
type UILayerType = 'Line Art' | 'Background' | 'Panel Frame' | 'Speech Balloon' | 'Screentone'

// ─── Main Component ───────────────────────────────────────────────────────────

function AssignTaskContent() {
  const [searchParams] = useSearchParams()

  // Data from API
  const [seriesList, setSeriesList] = useState<SeriesAPI[]>([])
  const [chapters, setChapters] = useState<ChapterAPI[]>([])
  const [pages, setPages] = useState<PageAPI[]>([])
  const [tasks, setTasks] = useState<TaskAPI[]>([])
  const [members, setMembers] = useState<any[]>([])

  // Selections
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [selectedChapterId, setSelectedChapterId] = useState('')
  const [selectedPageId, setSelectedPageId] = useState('')

  // Form fields
  const [assignedTo, setAssignedTo] = useState('')
  const [layerType, setLayerType] = useState<UILayerType>('Line Art')
  const [deadline, setDeadline] = useState('')
  const [priority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [taskSuccessMsg, setTaskSuccessMsg] = useState('')
  const [taskWarningMsg, setTaskWarningMsg] = useState('')

  // Image state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Annotation / drawing
  const [annotations, setAnnotations] = useState<AreaMarkup[]>([])
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Loading flags
  const [isLoadingSeries, setIsLoadingSeries] = useState(true)
  const [isLoadingChapters, setIsLoadingChapters] = useState(false)
  const [isLoadingPages, setIsLoadingPages] = useState(false)
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingPages, setIsUploadingPages] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isReplacingImage, setIsReplacingImage] = useState(false)

  const handleUploadPages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (!selectedSeriesId || !selectedChapterId) {
      setUploadError('Vui lòng chọn series và chapter trước!')
      return
    }

    setIsUploadingPages(true)
    setUploadError('')
    try {
      const filesArray = Array.from(files)
      // Upload each file to Cloudinary in parallel
      const uploadPromises = filesArray.map(file => uploadService.uploadSingle(file, 'pages'))
      const uploadResults = await Promise.all(uploadPromises)

      // Format payload for bulk creation (omit page_number to let backend calculate automatically)
      const bulkPayload = uploadResults.map((res) => ({
        image_url: res.secure_url
      }))

      // Create page entries in Database
      const createdPages = await pageService.bulkCreate(selectedSeriesId, selectedChapterId, bulkPayload)
      
      // Update local pages state
      setPages(createdPages)
      
      // Auto select the first created page
      if (createdPages.length > 0) {
        setSelectedPageId(createdPages[0]._id)
      }
      
      setSuccessMsg('Đã tải lên các trang phác thảo thô thành công!')
    } catch (err: any) {
      console.error(err)
      setUploadError(err.response?.data?.message || err.message || 'Lỗi khi tải trang lên, vui lòng thử lại.')
    } finally {
      setIsUploadingPages(false)
    }
  }

  const handleBeforeUpload = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (isUploadingPages) {
      e.preventDefault()
      return
    }
    if (tasks.length === 0) {
      e.preventDefault()
      setTaskWarningMsg('Bạn phải điền đầy đủ thông tin giao task và hoàn tất giao task cho trang hiện tại trước khi tải trang tiếp theo!')
      setTimeout(() => {
        setTaskWarningMsg('')
      }, 5000)
    }
  }

  const handleReplacePageImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (!selectedSeriesId || !selectedChapterId || !selectedPageId) {
      alert('Vui lòng chọn trang cần thay thế ảnh!')
      return
    }

    const file = files[0]
    setIsReplacingImage(true)
    try {
      const res = await uploadService.uploadSingle(file, 'pages')
      const updatedPage = await pageService.update(
        selectedSeriesId,
        selectedChapterId,
        selectedPageId,
        { image_url: res.secure_url }
      )
      
      // Cập nhật state list pages cục bộ
      setPages(prevPages => prevPages.map(p => p._id === selectedPageId ? updatedPage : p))
      setPreviewUrl(res.secure_url)
      alert('Đã thay thế ảnh của trang thành công!')
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.message || err.message || 'Lỗi khi thay thế ảnh, vui lòng thử lại.')
    } finally {
      setIsReplacingImage(false)
    }
  }

  // ── Load series on mount ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchSeries = async () => {
      setIsLoadingSeries(true)
      try {
        const list = await seriesService.getAll()
        setSeriesList(list)

        const paramSeriesId = searchParams.get('seriesId')
        const active = paramSeriesId && list.some(s => s._id === paramSeriesId)
          ? paramSeriesId
          : list[0]?._id ?? ''
        setSelectedSeriesId(active)
      } catch {
        // silent
      } finally {
        setIsLoadingSeries(false)
      }
    }
    fetchSeries()
  }, [searchParams])

  // ── Load chapters and members when series changes ──────────────────────────
  useEffect(() => {
    if (!selectedSeriesId) {
      setChapters([])
      setMembers([])
      setPages([])
      setTasks([])
      setAnnotations([])
      return
    }
    const fetchChaptersAndMembers = async () => {
      setIsLoadingChapters(true)
      setChapters([])
      setPages([])
      setTasks([])
      setAnnotations([])
      try {
        const [chs, mems] = await Promise.all([
          chapterService.getBySeriesId(selectedSeriesId),
          seriesService.getMembers(selectedSeriesId)
        ])
        setChapters(chs)
        
        // Filter members that are assistants
        const assistants = mems.filter((m: any) => m.users?.role === 'assistant')
        setMembers(assistants)

        const paramChapterId = searchParams.get('chapterId')
        const active = paramChapterId && chs.some(c => c._id === paramChapterId)
          ? paramChapterId
          : chs[0]?._id ?? ''
        setSelectedChapterId(active)
      } catch {
        // silent
      } finally {
        setIsLoadingChapters(false)
      }
    }
    fetchChaptersAndMembers()
  }, [selectedSeriesId])

  // ── Load pages when chapter changes ───────────────────────────────────────
  useEffect(() => {
    if (!selectedChapterId) { setPages([]); return }
    const fetch = async () => {
      setIsLoadingPages(true)
      setPages([])
      setTasks([])
      setAnnotations([])
      try {
        const pgs = await pageService.getByChapterId(selectedChapterId)
        setPages(pgs)

        const paramPageId = searchParams.get('pageId')
        const active = paramPageId && pgs.some(p => p._id === paramPageId)
          ? paramPageId
          : pgs[0]?._id ?? ''
        setSelectedPageId(active)
      } catch {
        // silent
      } finally {
        setIsLoadingPages(false)
      }
    }
    fetch()
  }, [selectedChapterId])

  // Derived active objects
  const activeSeries = seriesList.find(s => s._id === selectedSeriesId)
  const activeChapter = chapters.find(c => c._id === selectedChapterId)
  const activePage = pages.find(p => p._id === selectedPageId)

  // ── Set previewUrl when page changes ──────────────────────────────────────
  useEffect(() => {
    if (activePage?.image_url) {
      setPreviewUrl(activePage.image_url)
    } else {
      setPreviewUrl(null)
    }
  }, [activePage])

  // ── Load tasks and regions when page changes ──────────────────────────────────────────
  useEffect(() => {
    if (!selectedSeriesId || !selectedChapterId || !selectedPageId) { 
      setTasks([])
      setAnnotations([])
      return 
    }
    const fetchPageData = async () => {
      setIsLoadingTasks(true)
      try {
        const [ts, regs] = await Promise.all([
          taskService.getByPage(selectedSeriesId, selectedChapterId, selectedPageId),
          regionService.getByPage(selectedSeriesId, selectedChapterId, selectedPageId)
        ])
        setTasks(ts)

        // Map backend regions to local annotations state
        const mappedAnns: AreaMarkup[] = regs.map((r: any) => ({
          id: r.region_id,
          x: r.coordinates?.x ?? r.x ?? 0,
          y: r.coordinates?.y ?? r.y ?? 0,
          w: r.coordinates?.w ?? r.coordinates?.width ?? r.width ?? 0,
          h: r.coordinates?.h ?? r.coordinates?.height ?? r.height ?? 0,
          label: r.label || 'Vùng',
          saved: true
        }))
        setAnnotations(mappedAnns)
      } catch {
        setTasks([])
        setAnnotations([])
      } finally {
        setIsLoadingTasks(false)
      }
    }
    fetchPageData()
  }, [selectedSeriesId, selectedChapterId, selectedPageId])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSuccessMsg('')

    if (!selectedPageId) { setFormError('Vui lòng chọn trang bản thảo!'); return }
    if (!assignedTo) { setFormError('Vui lòng chọn trợ lý phụ trách!'); return }
    
    // Find the selected region to link
    let selectedAnn = annotations.find(a => a.id === activeAnnotationId)
    if (!selectedAnn && annotations.length > 0) {
      selectedAnn = annotations[0]
    }
    if (!selectedAnn) { setFormError('Vui lòng khoanh vùng tối thiểu 1 vị trí trên ảnh!'); return }
    
    if (note.trim().length < 10) { setFormError('Yêu cầu công việc phải đạt tối thiểu 10 ký tự!'); return }
    if (!deadline) { setFormError('Vui lòng chọn thời hạn nộp!'); return }

    const selectedDate = new Date(deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) { setFormError('Hạn chót không được chọn ngày trong quá khứ!'); return }

    setIsSubmitting(true)
    try {
      const apiTaskType: TaskType = LAYER_TYPE_MAP[layerType] ?? 'inking'
      let dbRegionId = selectedAnn.id

      // If the region is newly drawn locally, save it on backend first
      if (selectedAnn.id.startsWith('vung-')) {
        const newReg = await regionService.create(selectedSeriesId, selectedChapterId, selectedPageId, {
          region_type: apiTaskType,
          coordinates: {
            x: selectedAnn.x,
            y: selectedAnn.y,
            w: selectedAnn.w,
            h: selectedAnn.h
          },
          label: selectedAnn.label
        })
        dbRegionId = newReg.region_id
      }

      await taskService.create(selectedSeriesId, selectedChapterId, selectedPageId, {
        assigned_to: assignedTo,
        task_type: apiTaskType,
        priority,
        description: note.trim(),
        deadline,
        region_id: dbRegionId
      })

      setTaskSuccessMsg('Đã giao nhiệm vụ thành công!')
      setTimeout(() => {
        setTaskSuccessMsg('')
      }, 4000)
      setNote('')
      setAssignedTo('')
      setActiveAnnotationId(null)

      // Reload tasks & regions
      const [ts, regs] = await Promise.all([
        taskService.getByPage(selectedSeriesId, selectedChapterId, selectedPageId),
        regionService.getByPage(selectedSeriesId, selectedChapterId, selectedPageId)
      ])
      setTasks(ts)

      const mappedAnns: AreaMarkup[] = regs.map((r: any) => ({
        id: r.region_id,
        x: r.coordinates?.x ?? r.x ?? 0,
        y: r.coordinates?.y ?? r.y ?? 0,
        w: r.coordinates?.w ?? r.coordinates?.width ?? r.width ?? 0,
        h: r.coordinates?.h ?? r.coordinates?.height ?? r.height ?? 0,
        label: r.label || 'Vùng',
        saved: true
      }))
      setAnnotations(mappedAnns)
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } }
      setFormError(e?.response?.data?.message ?? 'Giao task thất bại, vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(t => t._id === taskId)
    try {
      await taskService.delete(selectedSeriesId, selectedChapterId, selectedPageId, taskId)
      
      // If task had a region, delete the region as well
      if (taskToDelete?.region_id) {
        try {
          await regionService.delete(selectedSeriesId, selectedChapterId, selectedPageId, taskToDelete.region_id)
        } catch {
          // silent fallback
        }
      }
      
      setTasks(prev => prev.filter(t => t._id !== taskId))

      // Refresh regions
      const regs = await regionService.getByPage(selectedSeriesId, selectedChapterId, selectedPageId)
      const mappedAnns: AreaMarkup[] = regs.map((r: any) => ({
        id: r.region_id,
        x: r.coordinates?.x ?? r.x ?? 0,
        y: r.coordinates?.y ?? r.y ?? 0,
        w: r.coordinates?.w ?? r.coordinates?.width ?? r.width ?? 0,
        h: r.coordinates?.h ?? r.coordinates?.height ?? r.height ?? 0,
        label: r.label || 'Vùng',
        saved: true
      }))
      setAnnotations(mappedAnns)
      setActiveAnnotationId(null)
    } catch {
      alert('Không thể xóa task, vui lòng thử lại.')
    }
  }

  const handleAssignTask = async (taskId: string) => {
    try {
      await taskService.assign(selectedSeriesId, selectedChapterId, selectedPageId, taskId)
      setTaskSuccessMsg('Giao việc thành công!')
      setTimeout(() => {
        setTaskSuccessMsg('')
      }, 4000)
      
      // Reload tasks
      const ts = await taskService.getByPage(selectedSeriesId, selectedChapterId, selectedPageId)
      setTasks(ts)
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } }
      alert(e?.response?.data?.message ?? 'Giao việc thất bại, vui lòng thử lại.')
    }
  }

  // ── Drawing handlers ───────────────────────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return
    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100 / zoom
    const y = ((e.clientY - rect.top) / rect.height) * 100 / zoom
    setIsDrawing(true)
    setStartPos({ x, y })
    setCurrentPos({ x, y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !imageContainerRef.current) return
    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(((e.clientX - rect.left) / rect.width) * 100 / zoom, 100))
    const y = Math.max(0, Math.min(((e.clientY - rect.top) / rect.height) * 100 / zoom, 100))
    setCurrentPos({ x, y })
  }

  const handleMouseUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const width = Math.abs(currentPos.x - startPos.x)
    const height = Math.abs(currentPos.y - startPos.y)
    if (width > 2 && height > 2) {
      const newId = `vung-${Date.now()}`
      const newAnnotation: AreaMarkup = {
        id: newId,
        x: Math.min(startPos.x, currentPos.x),
        y: Math.min(startPos.y, currentPos.y),
        w: width,
        h: height,
        label: `Vùng ${annotations.length + 1}`,
      }
      setAnnotations([...annotations, newAnnotation])
      setActiveAnnotationId(newId)
      setNote(prev => prev + (prev ? '\n' : '') + `Yêu cầu tại [${newAnnotation.label}]: `)
    }
  }

  // Map TaskAPI to display format for TaskTable (resolves assistant names)
  const displayTasks: DisplayTask[] = tasks.map(t => ({
    id: t._id,
    chapterId: t.chapter_id,
    pageId: t.page_id,
    chapterNumber: activeChapter?.chapter_number || 'N/A',
    pageNumber: activePage?.page_number || 'N/A',
    assignedTo: t.assigned_to_name || t.assigned_to,
    layerType: t.task_type,
    deadline: t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : '',
    priority: t.priority,
    note: t.description,
    status: t.status,
    regions: [],
  }))

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none mb-1">
          CHIA KHUNG TRANG & GIAO TASK
        </h1>
        <div className="h-1.5 w-24 bg-manga-red mb-3" />
        <p className="text-sm font-bold text-gray-600">
          Vẽ phác thảo phân cảnh và chia ô trực quan (Panels) trên trang bản thảo thô, sau đó ủy thác vẽ chi tiết cho trợ lý studio.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white border-2 border-manga-ink p-4">
        {/* Series */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Series:</span>
          {isLoadingSeries ? (
            <span className="text-xs font-bold text-gray-400">Đang tải...</span>
          ) : (
            <select
              value={selectedSeriesId}
              onChange={e => setSelectedSeriesId(e.target.value)}
              className="border-2 border-manga-ink px-2.5 py-1.5 font-bold text-xs bg-white uppercase focus:outline-none"
            >
              {seriesList.length === 0 && <option value="">-- Chưa có series --</option>}
              {seriesList.map(s => (
                <option key={s._id} value={s._id}>{s.title}</option>
              ))}
            </select>
          )}
        </div>

        {/* Chapter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Chapter:</span>
          {isLoadingChapters ? (
            <span className="text-xs font-bold text-gray-400">Đang tải...</span>
          ) : (
            <select
              value={selectedChapterId}
              onChange={e => setSelectedChapterId(e.target.value)}
              disabled={chapters.length === 0}
              className="border-2 border-manga-ink px-2.5 py-1.5 font-bold text-xs bg-white uppercase focus:outline-none disabled:opacity-50"
            >
              {chapters.length === 0 && <option value="">-- Chưa có chapter --</option>}
              {chapters.map(c => (
                <option key={c._id} value={c._id}>CH.{c.chapter_number}: {c.title}</option>
              ))}
            </select>
          )}
        </div>

        {/* Page */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Trang:</span>
          {isLoadingPages ? (
            <span className="text-xs font-bold text-gray-400">Đang tải...</span>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={selectedPageId}
                onChange={e => setSelectedPageId(e.target.value)}
                disabled={pages.length === 0}
                className="border-2 border-manga-ink px-2.5 py-1.5 font-bold text-xs bg-white uppercase focus:outline-none disabled:opacity-50"
              >
                {pages.length === 0 && <option value="">-- Chưa có trang --</option>}
                {pages.map(p => (
                  <option key={p._id} value={p._id}>Trang {p.page_number}</option>
                ))}
              </select>

              {pages.length > 0 && (
                <label 
                  onClick={handleBeforeUpload}
                  className="bg-manga-red hover:bg-red-700 text-white font-bold text-xs uppercase px-3 py-1.5 border-2 border-manga-ink cursor-pointer hover:translate-y-0.5 transition-all flex items-center gap-1.5"
                >
                  {isUploadingPages ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <span>+ Tải Thêm Trang</span>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingPages}
                    onChange={handleUploadPages}
                  />
                </label>
              )}
            </div>
          )}

        </div>
      </div>

      {/* No pages warning & upload zone */}
      {!isLoadingChapters && !isLoadingPages && chapters.length > 0 && pages.length === 0 && (
        <div className="border-4 border-dashed border-manga-ink p-8 mb-6 bg-white text-center flex flex-col items-center justify-center gap-4 manga-shadow-sm">
          <div className="bg-yellow-50 border border-yellow-400 p-3 flex items-center gap-2 text-yellow-800 font-bold text-xs uppercase">
            <Info className="w-4 h-4 shrink-0 text-manga-red" />
            Chapter này hiện chưa có trang nào trong cơ sở dữ liệu!
          </div>
          
          <div className="max-w-md">
            <h3 className="font-manga text-xl font-bold uppercase text-manga-ink mb-1">
              Tải lên các trang phác thảo thô
            </h3>
            <p className="text-xs text-gray-500 font-bold mb-4">
              Tải lên các tệp hình ảnh phác thảo (Name/Draft) của từng trang để tiến hành chia khung và giao việc cho trợ lý.
            </p>
            
            {uploadError && (
              <div className="bg-red-50 border-2 border-[#E63946] p-2.5 text-xs font-bold text-[#E63946] mb-4">
                {uploadError}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 border-2 border-green-500 p-2.5 text-xs font-bold text-green-700 mb-4">
                {successMsg}
              </div>
            )}
            
            <label className="inline-block bg-manga-red hover:bg-red-700 text-white font-manga font-bold text-xs uppercase px-6 py-3 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 transition-all cursor-pointer">
              {isUploadingPages ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang tải lên...
                </span>
              ) : (
                'Chọn nhiều ảnh để tải lên'
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={isUploadingPages}
                onChange={handleUploadPages}
              />
            </label>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">

        {/* Left: Image Upload Area */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-manga-red" />
              Khoanh vùng vẽ lỗi trực tiếp trên bản thảo bên dưới
            </span>
          </div>

          <div className="border-4 border-manga-ink manga-shadow relative bg-[#f7f7f7] flex items-center justify-center p-6 w-full" style={{ minHeight: 650 }}>
            {previewUrl ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="absolute top-0 right-0 flex gap-2 z-10 bg-white/80 backdrop-blur p-1 border-2 border-manga-ink flex-wrap items-center">
                  <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} type="button" className="p-1.5 hover:bg-gray-200 border-r border-manga-ink/20" title="Phóng to"><ZoomIn className="w-4 h-4" /></button>
                  <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} type="button" className="p-1.5 hover:bg-gray-200 border-r border-manga-ink/20" title="Thu nhỏ"><ZoomOut className="w-4 h-4" /></button>
                  <button onClick={() => setZoom(1)} type="button" className="p-1.5 hover:bg-gray-200 border-r border-manga-ink/20" title="Mặc định"><Maximize className="w-4 h-4" /></button>
                  <label className="p-1.5 hover:bg-gray-100 text-manga-ink flex items-center gap-1 text-xs font-bold uppercase cursor-pointer disabled:opacity-50" title="Thay thế ảnh cho trang này">
                    <RefreshCw className={`w-3.5 h-3.5 ${isReplacingImage ? 'animate-spin' : ''}`} />
                    {isReplacingImage ? 'Đang thay...' : 'Thay Thế Ảnh'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isReplacingImage}
                      onChange={handleReplacePageImage}
                    />
                  </label>
                </div>

                <div className="w-full flex-1 flex items-center justify-center mt-10 overflow-hidden">
                  <div
                    ref={imageContainerRef}
                    className="relative inline-block border-2 border-manga-ink bg-white shadow-sm"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                      cursor: 'crosshair',
                      aspectRatio: '1200/1700',
                      height: '600px',
                      maxWidth: '100%'
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Bản thảo Preview"
                      className="w-full h-full object-fill pointer-events-none select-none transition-transform"
                      style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                      draggable={false}
                    />

                    {annotations.map(ann => {
                      const isActive = ann.id === activeAnnotationId
                      return (
                        <div
                          key={ann.id}
                          onMouseDown={e => { e.stopPropagation(); setActiveAnnotationId(ann.id) }}
                          className={`absolute border-2 ${isActive ? 'border-manga-red bg-manga-red/20 z-20' : 'border-manga-red border-dashed bg-manga-red/5 z-10'} group transition-colors`}
                          style={{ left: `${ann.x}%`, top: `${ann.y}%`, width: `${ann.w}%`, height: `${ann.h}%` }}
                        >
                          <div className="absolute -top-6 left-[-2px] bg-manga-red text-white text-[10px] font-bold px-1.5 py-0.5 whitespace-nowrap">{ann.label}</div>
                          {isActive && (
                            <button
                              type="button"
                              onMouseDown={e => {
                                e.stopPropagation()
                                setAnnotations(annotations.filter(a => a.id !== ann.id))
                                if (activeAnnotationId === ann.id) setActiveAnnotationId(null)
                              }}
                              className="absolute -top-6 right-0 bg-manga-ink text-white p-0.5 hover:bg-red-700 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )
                    })}

                    {isDrawing && (
                      <div
                        className="absolute border-2 border-dashed border-manga-red bg-manga-red/20 pointer-events-none z-30"
                        style={{
                          left: `${Math.min(startPos.x, currentPos.x)}%`,
                          top: `${Math.min(startPos.y, currentPos.y)}%`,
                          width: `${Math.abs(currentPos.x - startPos.x)}%`,
                          height: `${Math.abs(currentPos.y - startPos.y)}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-lg border-4 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center p-10 text-center">
                <Info className="w-12 h-12 text-gray-400 mb-3" />
                <h3 className="font-manga text-xl font-bold uppercase text-gray-500 mb-1">Trang chưa có hình ảnh bản thảo</h3>
                <p className="text-sm font-bold text-gray-400 max-w-xs">Hình ảnh bản thảo thô của trang sẽ hiển thị ở đây sau khi tải bản thảo lên ở mục Quản lý Bản thảo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Form to Assign Task */}
        <div className="lg:col-span-2">
          <div className="bg-white border-4 border-manga-ink manga-shadow-sm flex flex-col">
            <div className="bg-manga-ink text-white p-4 font-manga text-xl font-bold uppercase tracking-wider">
              Phiếu Giao Việc
            </div>

            <form onSubmit={handleCreateTask} className="p-5 flex flex-col gap-4 font-bold text-sm text-manga-ink">
              {/* Feedback messages */}
              {formError && (
                <div className="bg-red-50 border border-manga-red p-2.5 text-xs text-manga-red uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {formError}
                </div>
              )}


              {/* Context summary */}
              <div className="border border-manga-ink p-3 bg-gray-50 text-xs">
                <span className="text-gray-400 block uppercase mb-1">Giao việc cho đối tượng:</span>
                <p className="text-manga-ink">
                  Series: <strong className="text-manga-red">{activeSeries?.title ?? '—'}</strong><br />
                  Chương: <strong>{activeChapter ? `${activeChapter.title} (CH.${activeChapter.chapter_number})` : '—'}</strong><br />
                  Trang: <strong>Trang {activePage?.page_number ?? 'N/A'}</strong>
                </p>
              </div>

              {activeAnnotationId && (
                <div className="bg-red-50 border border-manga-red p-2.5 text-xs text-manga-red font-bold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-manga-red rounded-sm flex-shrink-0" />
                    <span>Đang liên kết: {annotations.find(a => a.id === activeAnnotationId)?.label}</span>
                  </div>
                  <button type="button" onClick={() => setActiveAnnotationId(null)} className="text-manga-red hover:text-red-700"><X className="w-4 h-4" /></button>
                </div>
              )}

              {/* Assigned To */}
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1.5">Trợ lý phụ trách *</label>
                <select
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  required
                  className="w-full border-2 border-manga-ink px-3 py-2 text-sm focus:outline-none focus:border-manga-red bg-white"
                >
                  <option value="">-- Chọn trợ lý phụ trách --</option>
                  {members.map(m => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.users?.name || m.users?.username} (ID: {m.user_id.substring(0, 8)})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Chọn một trợ lý tham gia vẽ series này</p>
              </div>

              {/* Layer Type */}
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1.5">Lớp vẽ (Layer Type) *</label>
                <select
                  value={layerType}
                  onChange={e => setLayerType(e.target.value as UILayerType)}
                  className="w-full border-2 border-manga-ink px-3 py-2 text-sm focus:outline-none focus:border-manga-red bg-white"
                >
                  <option value="Panel Frame">Panel Frame (Bản phân khung)</option>
                  <option value="Line Art">Line Art (Nét thô nhân vật)</option>
                  <option value="Background">Background (Vẽ bối cảnh)</option>
                  <option value="Speech Balloon">Speech Balloon (Chèn thoại)</option>
                  <option value="Screentone">Screentone (Tông màu & Đánh bóng)</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  → API type: <code className="bg-gray-100 px-1">{LAYER_TYPE_MAP[layerType]}</code>
                </p>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1.5">Hạn chót hoàn thành *</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full border-2 border-manga-ink px-3 py-2 text-sm focus:outline-none focus:border-manga-red"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1.5">Yêu cầu vẽ chi tiết *</label>
                <textarea
                  rows={3}
                  required
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ghi chú kỹ thuật: nét thô dày 2px, đổ screentone chấm mịn..."
                  className="w-full border-2 border-manga-ink px-3 py-2 text-sm focus:outline-none focus:border-manga-red resize-none"
                />
                <span className={`text-[10px] font-bold ${note.length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                  {note.length} / 10+ ký tự
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || pages.length === 0}
                className="w-full bg-manga-red hover:bg-red-700 text-white font-manga font-bold text-sm uppercase py-3 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang giao...
                  </span>
                ) : 'Giao Task'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Task table */}
      <div className="mt-8">
        <h2 className="font-manga text-2xl font-bold uppercase text-manga-ink mb-4 flex items-center gap-1">
          <ClipboardList className="w-6 h-6 text-manga-red" />
          DANH SÁCH NHIỆM VỤ ĐÃ GIAO
          {isLoadingTasks && <span className="ml-2 w-4 h-4 border-2 border-manga-ink border-t-manga-red rounded-full animate-spin inline-block" />}
        </h2>
        <TaskTable tasks={displayTasks} onDeleteTask={handleDeleteTask} onAssignTask={handleAssignTask} />
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

      {/* Floating Toast Notification */}
      {taskSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-bounce duration-300">
          <div className="border-4 border-manga-ink manga-shadow-sm p-4 flex items-center gap-3 bg-white text-emerald-800 min-w-[320px]">
            <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
            <div className="flex-1">
              <p className="font-manga text-sm font-black uppercase tracking-wider text-manga-ink">Thành Công!</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">{taskSuccessMsg}</p>
            </div>
            <button 
              type="button" 
              onClick={() => setTaskSuccessMsg('')} 
              className="ml-2 hover:bg-zinc-100 p-1 text-gray-400 hover:text-manga-ink border-none bg-transparent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Warning Toast Notification */}
      {taskWarningMsg && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-bounce duration-300">
          <div className="border-4 border-manga-ink manga-shadow-sm p-4 flex items-center gap-3 bg-white text-manga-red min-w-[320px]">
            <AlertTriangle className="w-6 h-6 text-manga-red shrink-0" />
            <div className="flex-1">
              <p className="font-manga text-sm font-black uppercase tracking-wider text-manga-ink">Cảnh Báo!</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">{taskWarningMsg}</p>
            </div>
            <button 
              type="button" 
              onClick={() => setTaskWarningMsg('')} 
              className="ml-2 hover:bg-zinc-100 p-1 text-gray-400 hover:text-manga-ink border-none bg-transparent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AssignTaskPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-lg font-bold">Đang tải trang giao nhiệm vụ...</div>}>
      <AssignTaskContent />
    </Suspense>
  )
}
