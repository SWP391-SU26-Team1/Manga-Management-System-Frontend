import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, Link } from 'react-router'
import { Upload, AlertTriangle, Info, X, ClipboardList, ZoomIn, ZoomOut, Maximize, Trash2, Save } from 'lucide-react'
import { TaskTable } from '@/components/mangaka/TaskTable'
import { mangakaStore, Series, Chapter, MangaPage, LayerTask, Assistant } from '@/data/mangakaMockData'

interface AreaMarkup {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
}

function AssignTaskContent() {
  const [searchParams] = useSearchParams()

  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [pages, setPages] = useState<MangaPage[]>([])
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [tasks, setTasks] = useState<LayerTask[]>([])

  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [selectedChapterId, setSelectedChapterId] = useState('')
  const [selectedPageId, setSelectedPageId] = useState('')
  const [selectedAssistantId, setSelectedAssistantId] = useState('')
  const [layerType, setLayerType] = useState<LayerTask['layerType']>('Line Art')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState<LayerTask['priority']>('Medium')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState('')

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [annotations, setAnnotations] = useState<AreaMarkup[]>([])
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    const sList = mangakaStore.getSeries()
    setSeriesList(sList)
    setAssistants(mangakaStore.getAssistants())
    setTasks(mangakaStore.getTasks())

    const paramSeriesId = searchParams.get('seriesId')
    const activeSeriesId =
      paramSeriesId && sList.some((s) => s.id === paramSeriesId)
        ? paramSeriesId
        : sList[0]?.id || ''
    setSelectedSeriesId(activeSeriesId)
  }, [searchParams])

  useEffect(() => {
    if (!selectedSeriesId) return
    const cList = mangakaStore.getChapters(selectedSeriesId)
    setChapters(cList)

    const paramChapterId = searchParams.get('chapterId')
    const activeChapterId =
      paramChapterId && cList.some((c) => c.id === paramChapterId)
        ? paramChapterId
        : cList[0]?.id || ''
    setSelectedChapterId(activeChapterId)
  }, [selectedSeriesId, searchParams])

  useEffect(() => {
    if (!selectedChapterId) {
      setPages([])
      return
    }
    const pList = mangakaStore.getPages(selectedChapterId)
    setPages(pList)

    const paramPageId = searchParams.get('pageId')
    const activePageId =
      paramPageId && pList.some((p) => p.id === paramPageId)
        ? paramPageId
        : pList[0]?.id || ''
    setSelectedPageId(activePageId)
  }, [selectedChapterId, searchParams])

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!selectedPageId) { setFormError('Vui lòng chọn trang bản thảo!'); return }
    if (!selectedAssistantId) { setFormError('Vui lòng chọn trợ lý đảm nhận!'); return }
    if (annotations.length === 0) { setFormError('Vui lòng khoanh vùng (vẽ box) tối thiểu 1 vị trí trên ảnh!'); return }
    if (note.trim().length < 10) { setFormError('Yêu cầu công việc (mô tả) phải đạt tối thiểu 10 ký tự!'); return }
    if (!deadline) { setFormError('Vui lòng chọn thời hạn nộp!'); return }

    const selectedDate = new Date(deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) { setFormError('Hạn chót (deadline) không được chọn ngày trong quá khứ!'); return }

    const assistant = assistants.find((a) => a.id === selectedAssistantId)

    mangakaStore.addTask({
      chapterId: selectedChapterId,
      pageId: selectedPageId,
      assignedTo: assistant?.name || 'Trợ lý',
      layerType,
      deadline,
      priority,
      note: note.trim(),
      regions: annotations,
    })

    alert('Đã giao nhiệm vụ thành công cho trợ lý!')
    setTasks(mangakaStore.getTasks())
    setNote('')
  }

  const handleDeleteTask = (taskId: string) => {
    mangakaStore.deleteTask(taskId)
    setTasks(mangakaStore.getTasks())
  }

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
      setNote((prev) => prev + (prev ? '\n' : '') + `Sửa lỗi tại [${newAnnotation.label}]: `)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError('')
    if (!file) return

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setUploadError('Chỉ hỗ trợ định dạng PNG, JPG, JPEG, WEBP')
      return
    }

    setSelectedImage(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setAnnotations([])
    setActiveAnnotationId(null)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setAnnotations([])
    setActiveAnnotationId(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleChangeImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const activeSeries = seriesList.find((s) => s.id === selectedSeriesId)
  const activeChapter = chapters.find((c) => c.id === selectedChapterId)
  const activePage = pages.find((p) => p.id === selectedPageId)

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
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Series:</span>
          <select
            value={selectedSeriesId}
            onChange={(e) => setSelectedSeriesId(e.target.value)}
            className="border-2 border-manga-ink px-2.5 py-1.5 font-bold text-xs bg-white uppercase focus:outline-none"
          >
            {seriesList.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Chapter:</span>
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            disabled={chapters.length === 0}
            className="border-2 border-manga-ink px-2.5 py-1.5 font-bold text-xs bg-white uppercase focus:outline-none disabled:opacity-50"
          >
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>CH.{c.chapterNumber}: {c.title}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Trang:</span>
          <select
            value={selectedPageId}
            onChange={(e) => setSelectedPageId(e.target.value)}
            disabled={pages.length === 0}
            className="border-2 border-manga-ink px-2.5 py-1.5 font-bold text-xs bg-white uppercase focus:outline-none disabled:opacity-50"
          >
            {pages.map((p) => (
              <option key={p.id} value={p.id}>Trang {p.pageNumber}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">

        {/* Left: Image Upload Area */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-manga-red" />
              Tải lên trang bản thảo để xem trước và giao việc
            </span>
          </div>

          <div className="border-4 border-manga-ink manga-shadow relative bg-[#f7f7f7] flex items-center justify-center p-6 w-full" style={{ minHeight: 650 }}>
            {previewUrl ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="absolute top-0 right-0 flex gap-2 z-10 bg-white/80 backdrop-blur p-1 border-2 border-manga-ink">
                  <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} className="p-1.5 hover:bg-gray-200 border-r border-manga-ink/20" title="Phóng to"><ZoomIn className="w-4 h-4" /></button>
                  <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="p-1.5 hover:bg-gray-200 border-r border-manga-ink/20" title="Thu nhỏ"><ZoomOut className="w-4 h-4" /></button>
                  <button onClick={() => setZoom(1)} className="p-1.5 hover:bg-gray-200 border-r border-manga-ink/20" title="Mặc định"><Maximize className="w-4 h-4" /></button>
                  <button onClick={() => setAnnotations([])} className="p-1.5 hover:bg-red-100 text-red-600 flex items-center gap-1 text-xs font-bold uppercase border-r border-manga-ink/20" title="Xóa tất cả vùng"><Trash2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => alert('Đã lưu nháp task!')} className="p-1.5 hover:bg-green-100 text-green-700 flex items-center gap-1 text-xs font-bold uppercase mr-2" title="Lưu nháp task"><Save className="w-3.5 h-3.5" /></button>
                  
                  <button onClick={handleChangeImageClick} type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase border-2 border-manga-ink bg-white hover:bg-gray-100 transition-colors shadow-sm">
                    Đổi ảnh
                  </button>
                  <button onClick={handleRemoveImage} type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase border-2 border-manga-ink bg-white hover:bg-gray-100 text-manga-red transition-colors shadow-sm">
                    <X className="w-4 h-4" /> Xóa ảnh
                  </button>
                </div>

                <div className="w-full flex-1 flex items-center justify-center mt-10 overflow-hidden">
                  <div
                    ref={imageContainerRef}
                    className="relative inline-block max-w-full"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ cursor: 'crosshair' }}
                  >
                    <img
                      src={previewUrl}
                      alt="Bản thảo Preview"
                      className="max-w-full max-h-[600px] object-contain shadow-sm pointer-events-none select-none transition-transform"
                      style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                      draggable={false}
                    />

                    {annotations.map((ann) => {
                      const isActive = ann.id === activeAnnotationId
                      return (
                        <div
                          key={ann.id}
                          onMouseDown={(e) => { e.stopPropagation(); setActiveAnnotationId(ann.id) }}
                          className={`absolute border-2 ${isActive ? 'border-manga-red bg-manga-red/20 z-20' : 'border-manga-red border-dashed bg-manga-red/5 z-10'} group transition-colors`}
                          style={{ left: `${ann.x}%`, top: `${ann.y}%`, width: `${ann.w}%`, height: `${ann.h}%` }}
                        >
                          <div className="absolute -top-6 left-[-2px] bg-manga-red text-white text-[10px] font-bold px-1.5 py-0.5 whitespace-nowrap">
                            {ann.label}
                          </div>
                          {isActive && (
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.stopPropagation()
                                setAnnotations(annotations.filter((a) => a.id !== ann.id))
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

                <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={handleImageChange} />
              </div>
            ) : (
              <div
                className="w-full max-w-lg border-2 border-dashed border-gray-400 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center p-10 cursor-pointer group"
                onClick={handleChangeImageClick}
                style={{ minHeight: 400 }}
              >
                <div className="w-16 h-16 bg-white border-2 border-manga-ink rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-manga-ink" />
                </div>
                <h3 className="font-manga text-xl font-bold uppercase text-manga-ink mb-2">Tải lên trang bản thảo Manga</h3>
                <p className="text-sm font-bold text-gray-500 mb-6 text-center">Kéo thả ảnh vào đây hoặc bấm để chọn ảnh</p>
                <div className="text-xs font-bold text-gray-400 bg-white px-3 py-1.5 border border-gray-200 rounded mb-6">
                  Hỗ trợ: PNG, JPG, JPEG, WEBP
                </div>
                <button type="button" className="px-6 py-2.5 font-bold uppercase text-sm bg-manga-ink text-white border-2 border-transparent group-hover:border-manga-red transition-colors">
                  Chọn ảnh
                </button>
                {uploadError && (
                  <p className="mt-4 text-xs font-bold text-manga-red flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {uploadError}
                  </p>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={handleImageChange} />
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
              {formError && (
                <div className="bg-red-50 border border-manga-red p-2.5 text-xs text-manga-red uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {formError}
                </div>
              )}

              <div className="border border-manga-ink p-3 bg-gray-50 text-xs">
                <span className="text-gray-400 block uppercase mb-1">Giao việc cho đối tượng:</span>
                <p className="text-manga-ink">
                  Series: <strong className="text-manga-red">{activeSeries?.title}</strong><br />
                  Chương: <strong>{activeChapter?.title} (CH.{activeChapter?.chapterNumber})</strong><br />
                  Trang: <strong>Trang {activePage?.pageNumber || 'N/A'}</strong>
                </p>
              </div>

              {activeAnnotationId && (
                <div className="bg-red-50 border border-manga-red p-2.5 text-xs text-manga-red font-bold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-manga-red rounded-sm flex-shrink-0" />
                    <span>Đang liên kết: {annotations.find((a) => a.id === activeAnnotationId)?.label}</span>
                  </div>
                  <button type="button" onClick={() => setActiveAnnotationId(null)} className="text-manga-red hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-widest mb-1.5">Chọn Trợ lý phụ trách *</label>
                <select
                  value={selectedAssistantId}
                  onChange={(e) => setSelectedAssistantId(e.target.value)}
                  required
                  className="w-full border-2 border-manga-ink px-3 py-2 text-sm focus:outline-none focus:border-manga-red bg-white"
                >
                  <option value="">-- CHỌN TRỢ LÝ --</option>
                  {assistants.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest mb-1.5">Lớp vẽ (Layer Type) *</label>
                <select
                  value={layerType}
                  onChange={(e) => setLayerType(e.target.value as LayerTask['layerType'])}
                  className="w-full border-2 border-manga-ink px-3 py-2 text-sm focus:outline-none focus:border-manga-red bg-white"
                >
                  <option value="Panel Frame">Panel Frame (Bản phân khung)</option>
                  <option value="Line Art">Line Art (Nét thô nhân vật)</option>
                  <option value="Background">Background (Vẽ bối cảnh)</option>
                  <option value="Speech Balloon">Speech Balloon (Chèn thoại/Lời thoại)</option>
                  <option value="Screentone">Screentone (Tông màu & Đánh bóng)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest mb-1.5">Hạn chót hoàn thành (Deadline) *</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border-2 border-manga-ink px-3 py-2 text-sm focus:outline-none focus:border-manga-red"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest mb-1.5">Mức độ khẩn cấp (Priority) *</label>
                <div className="flex border-2 border-manga-ink bg-white text-xs text-center font-bold">
                  {(['Low', 'Medium', 'High', 'Urgent'] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 border-r border-manga-ink last:border-none uppercase transition-colors ${priority === p ? 'bg-manga-red text-white' : 'hover:bg-gray-100'}`}
                    >
                      {p === 'Urgent' ? 'Khẩn' : p === 'High' ? 'Cao' : p === 'Medium' ? 'Vừa' : 'Thấp'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest mb-1.5">Yêu cầu vẽ chi tiết (Tối thiểu 10 ký tự) *</label>
                <textarea
                  rows={3}
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú kỹ thuật: nét thô dày 2px, đổ screentone chấm mịn..."
                  className="w-full border-2 border-manga-ink px-3 py-2 text-sm focus:outline-none focus:border-manga-red resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-manga-red hover:bg-red-700 text-white font-manga font-bold text-sm uppercase py-3 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                Giao Task
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
        </h2>
        <TaskTable tasks={tasks} onDeleteTask={handleDeleteTask} />
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-manga-ink text-white py-6 px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold">
        <div className="font-manga text-2xl text-manga-red">MangaFlow</div>
        <div className="text-gray-400">© 2026 MangaFlow System. Gangan Press Co. Ltd.</div>
        <div className="flex items-center gap-6 text-gray-400">
          <Link to="/dashboard/mangaka/settings" className="hover:text-white transition-colors">Quy tắc xuất bản</Link>
          <Link to="/dashboard/mangaka/settings" className="hover:text-white transition-colors">Hỗ trợ Mangaka</Link>
        </div>
      </footer>
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
