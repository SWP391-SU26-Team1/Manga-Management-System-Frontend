import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import {
  CheckCircle,
  AlertTriangle,
  Download,
  Layers,
  Sparkles,
  RefreshCw,
  Maximize2,
  X,
} from 'lucide-react'
import { AssistantSubmission } from '@/data/mangakaMockData'
import taskService from '@/services/task.service'
import seriesService from '@/services/series.service'
import chapterService from '@/services/chapter.service'
import feedbackService from '@/services/feedback.service'

const filters = ['Tất cả', 'Chờ duyệt', 'Cần chỉnh sửa', 'Đã duyệt & Đóng gói', 'Quá hạn']

export default function SubmissionPage() {
  const [submissionsList, setSubmissionsList] = useState<AssistantSubmission[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [activeFilter, setActiveFilter] = useState('Tất cả')
  const [comment, setComment] = useState('')
  const [isMerging, setIsMerging] = useState(false)
  const [mergeStep, setMergeStep] = useState('')
  const [markers, setMarkers] = useState<{x: number, y: number, text: string, id: string}[]>([])
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawTasks, setRawTasks] = useState<any[]>([])
  const [seriesMap, setSeriesMap] = useState<Record<string, string>>({})
  const [chaptersMap, setChaptersMap] = useState<Record<string, { title: string; seriesId: string }>>({})

  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [zoomTitle, setZoomTitle] = useState<string>('')
  
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop'
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    return `${apiURL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Fetch all series
      const series = await seriesService.getAll()
      const sMap: Record<string, string> = {}
      series.forEach((s) => {
        sMap[s._id] = s.title
      })
      setSeriesMap(sMap)

      // 2. Fetch chapters for all series
      const cMap: Record<string, { title: string; seriesId: string }> = {}
      await Promise.all(
        series.map(async (s) => {
          try {
            const chapters = await chapterService.getBySeriesId(s._id)
            chapters.forEach((c) => {
              cMap[c._id] = {
                title: `${s.title} (CH.${c.chapter_number})`,
                seriesId: s._id,
              }
            })
          } catch (e) {
            console.error('Failed to load chapters for series', s._id, e)
          }
        })
      )
      setChaptersMap(cMap)

      // 3. Fetch all tasks globally
      const tasks = await taskService.getAllTasks({ limit: 1000 })
      setRawTasks(tasks)

      // Fetch pending submissions to map correct file URLs
      let pendingSubs: any[] = []
      try {
        pendingSubs = await feedbackService.getPendingSubmissions()
      } catch (subErr) {
        console.error('Failed to load pending submissions from backend:', subErr)
      }

      const subMap: Record<string, string> = {}
      const subIdMap: Record<string, string> = {}
      pendingSubs.forEach((sub: any) => {
        if (sub.task_id) {
          subMap[sub.task_id] = sub.file_url
          subIdMap[sub.task_id] = sub.submission_id
        }
      })

      // 4. Map tasks to AssistantSubmission
      const mapped: AssistantSubmission[] = tasks
        .filter((t) => t.assistant_id && t.page_id && ['submitted', 'needs_revision', 'rejected', 'approved', 'completed'].includes(t.status))
        .map((t) => {
          const chapterInfo = cMap[t.page?.chapter_id]
          const chapterTitle = chapterInfo ? chapterInfo.title : 'Nhiệm vụ lẻ'
          
          let displayStatus: 'Pending' | 'Need Fix' | 'Approved' = 'Pending'
          if (t.status === 'submitted') {
            displayStatus = 'Pending'
          } else if (t.status === 'needs_revision' || t.status === 'rejected') {
            displayStatus = 'Need Fix'
          } else if (t.status === 'approved' || t.status === 'completed') {
            displayStatus = 'Approved'
          }

          const layerLabels: Record<string, string> = {
            inking: 'Line Art',
            coloring: 'Screentone',
            lettering: 'Speech Balloon',
            cleaning: 'Cleaning',
            sfx: 'SFX',
            background: 'Background',
          }
          const layerType = layerLabels[t.task_type] || t.task_type || 'Bản vẽ'

          // previewUrl: the drawing file submitted by the assistant (or fallback to original page if none)
          // originalImageUrl: the original draft uploaded by the mangaka (always t.page.image_url)
          const assistantFileUrl = subMap[t.task_id] || t.page?.image_url
          const originalDraftUrl = t.page?.image_url

          return {
            id: t.task_id,
            submissionId: subIdMap[t.task_id] || undefined,
            assistantName: t.assistant?.name || t.assistant?.username || 'Trợ lý',
            chapterTitle,
            pageNumber: t.page?.page_number || 1,
            layerType,
            submittedAt: t.updated_at || t.created_at || new Date().toISOString(),
            fileName: `task_${t.task_id.slice(0, 8)}.psd`,
            previewUrl: getImageUrl(assistantFileUrl),
            originalImageUrl: getImageUrl(originalDraftUrl),
            note: t.content || '',
            status: displayStatus,
          }
        })

      setSubmissionsList(mapped)
      
      if (mapped.length > 0) {
        setSelectedId((prev) => {
          const stillExists = mapped.some((m) => m.id === prev)
          return stillExists ? prev : mapped[0].id
        })
      }
    } catch (e) {
      console.error(e)
      setError('Không thể tải danh sách submission từ backend. Vui lòng kiểm tra lại kết nối.')
    } finally {
      setLoading(false)
    }
  }

  const refreshSubmissions = () => {
    loadData()
    setMarkers([])
    setActiveMarkerId(null)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomImage(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const selected = submissionsList.find((s) => s.id === selectedId) || submissionsList[0]

  const handleMergeLayer = async () => {
    if (!selected) return

    const rawTask = rawTasks.find((t) => t.task_id === selected.id)
    if (!rawTask) {
      alert('Không tìm thấy thông tin task tương ứng.')
      return
    }

    const pageId = rawTask.page_id
    const chapterId = rawTask.page?.chapter_id
    const chapterInfo = chaptersMap[chapterId]
    const seriesId = chapterInfo?.seriesId

    if (!seriesId || !chapterId || !pageId) {
      alert('Không tìm thấy thông tin Series/Chapter liên quan để thực hiện duyệt.')
      return
    }

    try {
      setIsMerging(true)
      
      // Nếu có nhận xét ghi kèm, tiến hành đăng feedback trước khi duyệt
      if (selected.submissionId && comment.trim()) {
        setMergeStep('Đang lưu nhận xét của Mangaka...')
        await feedbackService.createSubmissionFeedback(selected.submissionId, comment.trim())
      }

      setMergeStep('Đang gọi API phê duyệt từ backend...')

      if (selected.submissionId) {
        await feedbackService.approveSubmission(selected.submissionId)
      } else {
        await taskService.approveTask(seriesId, chapterId, pageId, selected.id)
      }

      setMergeStep("Trích xuất layer 'Assistant submission'...")
      setTimeout(() => {
        setMergeStep('Đang khử nhiễu & căn chỉnh tọa độ ô khung...')
        setTimeout(() => {
          setMergeStep('Đang hòa trộn layer vào bản thảo gốc (Speech balloon & Panel Frame)...')
          setTimeout(() => {
            setIsMerging(false)
            setMergeStep('')
            setComment('')
            setToastMessage(`Đã kết hợp layer thành công cho submission của ${selected.assistantName}! Bản thảo chính đã được cập nhật.`)
            setTimeout(() => {
              setToastMessage(null)
            }, 5000)
            loadData()
          }, 800)
        }, 800)
      }, 800)
    } catch (err) {
      setIsMerging(false)
      setMergeStep('')
      console.error(err)
      alert('Không thể phê duyệt task. Lỗi: ' + ((err as any).response?.data?.message || (err as any).message))
    }
  }

  const handleReject = async () => {
    if (!selected) return
    if (!comment.trim() && markers.length === 0) {
      alert('Vui lòng nhập nhận xét hoặc click chọn điểm lỗi trên ảnh để gửi yêu cầu sửa chữa!')
      return
    }

    const rawTask = rawTasks.find((t) => t.task_id === selected.id)
    if (!rawTask) {
      alert('Không tìm thấy thông tin task tương ứng.')
      return
    }

    const pageId = rawTask.page_id
    const chapterId = rawTask.page?.chapter_id
    const chapterInfo = chaptersMap[chapterId]
    const seriesId = chapterInfo?.seriesId

    if (!seriesId || !chapterId || !pageId) {
      alert('Không tìm thấy thông tin Series/Chapter liên quan để thực hiện gửi yêu cầu chỉnh sửa.')
      return
    }

    let finalComment = comment.trim()
    if (markers.length > 0) {
      const markerNotes = markers
        .map(
          (m, idx) =>
            `- Điểm số ${idx + 1} (vị trí ngang ${Math.round(m.x)}%, dọc ${Math.round(m.y)}%): ${m.text || 'Cần chỉnh sửa nét vẽ'}`
        )
        .join('\n')
      finalComment = finalComment
        ? `${finalComment}\n\nChi tiết các điểm lỗi cần sửa:\n${markerNotes}`
        : `Yêu cầu chỉnh sửa chi tiết các điểm sau:\n${markerNotes}`
    }

    try {
      setLoading(true)
      if (selected.submissionId) {
        await feedbackService.requestRevisionSubmission(selected.submissionId, finalComment)
      } else {
        await taskService.requestRevision(seriesId, chapterId, pageId, selected.id, {
          feedback_content: finalComment,
          feedback_type: 'revision_request',
        })
      }
      alert(`Đã gửi yêu cầu chỉnh sửa thành công cho ${selected.assistantName}.`)
      setComment('')
      setMarkers([])
      loadData()
    } catch (err) {
      console.error(err)
      alert('Không thể gửi yêu cầu chỉnh sửa. Lỗi: ' + ((err as any).response?.data?.message || (err as any).message))
    } finally {
      setLoading(false)
    }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (selected?.status === 'Approved') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newMarker = { x, y, text: '', id: `marker-${Date.now()}` };
    setMarkers([...markers, newMarker]);
    setActiveMarkerId(newMarker.id);
  }

  const handleZoomImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (selected?.status === 'Approved') return;
    if (zoomTitle === "Bản Phác Thảo Gốc") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newMarker = { x, y, text: '', id: `marker-${Date.now()}` };
    setMarkers([...markers, newMarker]);
    setActiveMarkerId(newMarker.id);
  }

  const updateMarkerText = (id: string, text: string) => {
    setMarkers(markers.map(m => m.id === id ? { ...m, text } : m));
  }

  const deleteMarker = (id: string) => {
    setMarkers(markers.filter(m => m.id !== id));
    if (activeMarkerId === id) setActiveMarkerId(null);
  }

  const filteredSubmissions = submissionsList.filter((sub) => {
    if (activeFilter === 'Tất cả') return true
    if (activeFilter === 'Chờ duyệt') return sub.status === 'Pending'
    if (activeFilter === 'Cần chỉnh sửa') return sub.status === 'Need Fix'
    if (activeFilter === 'Đã duyệt & Đóng gói') return sub.status === 'Approved'
    if (activeFilter === 'Quá hạn') return false
    return true
  })

  const getStatusBadge = (status: AssistantSubmission['status']) => {
    switch (status) {
      case 'Approved':
        return <span className="bg-manga-ink text-white border-manga-ink border px-2 py-0.5 text-[9px] font-bold uppercase whitespace-nowrap">Đã duyệt</span>
      case 'Need Fix':
        return <span className="bg-manga-red text-white border-manga-ink border px-2 py-0.5 text-[9px] font-bold uppercase whitespace-nowrap">Cần sửa</span>
      default:
        return <span className="bg-white text-manga-ink border-manga-ink border px-2 py-0.5 text-[9px] font-bold uppercase whitespace-nowrap">Chờ duyệt</span>
    }
  }

  if (loading && submissionsList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto pb-16 pt-10 text-center">
        <div className="inline-block bg-white border-4 border-manga-ink p-8 manga-shadow-sm">
          <RefreshCw className="w-10 h-10 text-manga-red animate-spin mx-auto mb-4" />
          <h2 className="font-manga text-xl font-bold uppercase">Đang tải dữ liệu...</h2>
          <p className="text-xs font-bold text-gray-500 mt-2">Vui lòng chờ trong giây lát trong khi chúng tôi tải dữ liệu từ backend.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto pb-16 pt-10 text-center">
        <div className="inline-block bg-white border-4 border-manga-red p-8 manga-shadow-sm">
          <AlertTriangle className="w-10 h-10 text-manga-red mx-auto mb-4" />
          <h2 className="font-manga text-xl font-bold uppercase text-manga-red">Lỗi tải dữ liệu</h2>
          <p className="text-xs font-bold text-gray-700 mt-2">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 bg-manga-ink text-white font-bold text-xs uppercase px-4 py-2 border-2 border-manga-ink hover:bg-gray-800 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-manga text-5xl font-bold uppercase text-manga-ink leading-none">
            SUBMISSION CHỜ DUYỆT
          </h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3 mb-2" />
          <p className="text-sm font-bold text-gray-500">
            Kiểm tra kết quả vẽ thô/background của trợ lý gửi lên, nhận xét và phê duyệt (Merge Layer) trực tiếp vào bản thảo.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Chờ duyệt', value: submissionsList.filter((s) => s.status === 'Pending').length, key: 'pending' },
          { label: 'Cần chỉnh sửa', value: submissionsList.filter((s) => s.status === 'Need Fix').length, key: 'revision', red: submissionsList.filter((s) => s.status === 'Need Fix').length > 0 },
          { label: 'Đã duyệt & Ghép', value: submissionsList.filter((s) => s.status === 'Approved').length, key: 'approved' },
          { label: 'Tổng số bản vẽ', value: submissionsList.length, key: 'total' },
        ].map((s) => (
          <div
            key={s.key}
            className={`bg-white border-2 border-manga-ink p-4 flex flex-col items-center manga-shadow-sm ${
              s.red ? 'border-manga-red bg-red-50/10' : ''
            }`}
          >
            <span className={`font-manga text-4xl font-bold ${s.red ? 'text-manga-red' : 'text-manga-ink'}`}>
              {s.value}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase text-center mt-1">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 font-bold text-xs uppercase border-2 transition-all ${
              activeFilter === f
                ? 'bg-manga-ink text-white border-manga-ink'
                : 'bg-white text-manga-ink border-manga-ink hover:bg-gray-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Three Columns Workspace Layout */}
      {selected ? (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">
          {/* Left: Submission List */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-manga-ink manga-shadow-sm">
              <div className="bg-manga-ink text-white px-4 py-3">
                <h2 className="font-manga text-base font-bold uppercase">Danh sách submission</h2>
              </div>
              <div className="divide-y-2 divide-manga-ink max-h-[500px] overflow-y-auto">
                {filteredSubmissions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selected.id === s.id ? 'bg-red-50 border-l-4 border-l-manga-red' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-bold text-sm leading-tight text-manga-ink">{s.chapterTitle}</p>
                      {getStatusBadge(s.status)}
                    </div>
                    <p className="text-xs font-bold text-gray-500">
                      {s.assistantName} · Trang {s.pageNumber}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                      Lớp: {s.layerType} · {new Date(s.submittedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                ))}
                {filteredSubmissions.length === 0 && (
                  <div className="p-8 text-center text-gray-400 font-bold text-sm">
                    Không có submission nào phù hợp.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center: Interactive Image Preview */}
          <div className="lg:col-span-3">
            <div className="bg-white border-2 border-manga-ink manga-shadow-sm">
              <div className="bg-manga-red text-white px-4 py-3 flex items-center justify-between">
                <h2 className="font-manga text-base font-bold uppercase">Xem bản vẽ chi tiết</h2>
                {selected.status === 'Approved' && (
                  <span className="bg-white text-manga-red font-manga font-bold text-[10px] px-2 py-0.5 border border-white">
                    ĐÃ KẾT HỢP LAYER
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mb-1.5">Bản Phác Thảo Gốc</p>
                    <div className="border-2 border-manga-ink bg-gray-100 relative overflow-hidden group flex items-center justify-center min-h-[300px]">
                      <div className="relative inline-block w-full">
                        <img
                          src={selected.originalImageUrl || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop"}
                          alt="Original Outline"
                          className="w-full h-auto object-contain block grayscale contrast-125"
                        />
                        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
                        <button
                          onClick={() => {
                            setZoomImage(selected.originalImageUrl || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop")
                            setZoomTitle("Bản Phác Thảo Gốc")
                          }}
                          className="absolute bottom-2 right-2 bg-white border border-manga-ink p-1.5 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] z-10"
                          title="Phóng to"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-manga-ink" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mb-1.5">
                      {selected.status === 'Approved' ? 'Bản thảo đã hòa trộn' : 'Bản vẽ Trợ lý gửi'}
                    </p>
                    <div className={`border-2 bg-gray-100 relative overflow-hidden group flex items-center justify-center min-h-[300px] ${selected.status === 'Approved' ? 'border-green-500' : 'border-manga-red'}`}>
                      <div className="relative inline-block w-full">
                        <img
                          src={selected.previewUrl}
                          alt="Submitted Layer"
                          className={`w-full h-auto object-contain block ${selected.status !== 'Approved' ? 'cursor-crosshair' : ''}`}
                          onClick={handleImageClick}
                        />
                        {selected.status !== 'Approved' && (
                          <div className="absolute border-2 border-manga-red bg-red-500/10 pointer-events-none" style={{ top: '15%', left: '10%', width: '80%', height: '70%' }}>
                            <span className="absolute -top-4 left-0 text-[8px] font-bold bg-manga-red text-white px-1 uppercase">
                              {selected.layerType} Layer
                            </span>
                          </div>
                        )}
                        {markers.map((marker, index) => (
                          <div 
                            key={marker.id}
                            className="absolute z-20"
                            style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: 'translate(-50%, -50%)' }}
                            onClick={(e) => { e.stopPropagation(); setActiveMarkerId(marker.id); }}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-pointer transition-colors ${
                              activeMarkerId === marker.id ? 'bg-manga-red border-white text-white scale-110' : 'bg-white border-manga-red text-manga-red'
                            }`}>
                              {index + 1}
                            </div>
                            {activeMarkerId === marker.id && (
                              <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white border-2 border-manga-ink manga-shadow-sm p-2 w-48 z-30" onClick={e => e.stopPropagation()}>
                                <textarea 
                                  autoFocus
                                  value={marker.text}
                                  onChange={(e) => updateMarkerText(marker.id, e.target.value)}
                                  placeholder="Nhập lỗi cần sửa..."
                                  className="w-full text-xs font-bold border border-gray-300 p-1 mb-1 focus:outline-none"
                                  rows={2}
                                />
                                <div className="flex justify-between">
                                  <button className="text-[10px] text-red-600 font-bold uppercase hover:underline" onClick={() => deleteMarker(marker.id)}>Xóa</button>
                                  <button className="text-[10px] text-manga-ink font-bold uppercase hover:underline" onClick={() => setActiveMarkerId(null)}>Xong</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setZoomImage(selected.previewUrl)
                            setZoomTitle(selected.status === 'Approved' ? "Bản thảo đã hòa trộn" : `Bản vẽ Trợ lý gửi (${selected.layerType})`)
                          }}
                          className="absolute bottom-2 right-2 bg-white border border-manga-ink p-1.5 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] z-10"
                          title="Phóng to"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-manga-ink" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {selected.status === 'Approved' && (
                  <div className="bg-green-50 border-2 border-green-500 p-3 text-green-800 text-xs font-bold flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="uppercase text-[10px] text-green-700 font-black">Trạng thái hoàn thành</p>
                      <p className="leading-tight mt-0.5">
                        Layer <code className="bg-white px-1 border border-green-300 font-mono">[{selected.layerType}]</code> từ file của {selected.assistantName} đã được hòa trộn thành công đè lên bản thảo chính.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions / Comments Review Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-manga-ink manga-shadow-sm">
              <div className="bg-manga-ink text-white px-4 py-3">
                <h2 className="font-manga text-base font-bold uppercase">Hành động phê duyệt</h2>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {[
                  { label: 'Trợ lý', value: selected.assistantName },
                  { label: 'Nhiệm vụ', value: `${selected.chapterTitle} - Trang ${selected.pageNumber}` },
                  { label: 'Lớp vẽ', value: selected.layerType },
                  { label: 'Thời điểm nộp', value: new Date(selected.submittedAt).toLocaleDateString('vi-VN') },
                  { label: 'Tên File PSD', value: selected.fileName },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-0.5 border-b border-dashed border-gray-200 pb-2 last:border-0"
                  >
                    <span className="text-[10px] font-bold uppercase text-gray-400">{row.label}</span>
                    <span className="font-bold text-sm text-manga-ink leading-tight">{row.value}</span>
                  </div>
                ))}

                {selected.status === 'Pending' && (
                  <div className="mt-2">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                      Nhận xét / Yêu cầu chỉnh sửa
                    </span>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      placeholder="Nếu có yêu cầu chỉnh sửa, hãy điền lý do tại đây trước khi chọn 'Yêu cầu chỉnh sửa'..."
                      className="w-full border-2 border-manga-ink px-3 py-2 text-sm font-bold resize-none focus:outline-none focus:border-manga-red bg-white"
                    />
                    {markers.length > 0 && (
                      <div className="mt-2 text-xs text-manga-red font-bold">
                        * Đã đánh dấu {markers.length} điểm lỗi trên ảnh. 
                        Nội dung comment sẽ tự động đính kèm các điểm lỗi này.
                      </div>
                    )}
                  </div>
                )}

                {isMerging ? (
                  <div className="bg-red-50 border-2 border-manga-red p-3 flex flex-col items-center justify-center text-center gap-2">
                    <RefreshCw className="w-5 h-5 text-manga-red animate-spin" />
                    <span className="text-[10px] font-manga font-black text-manga-red uppercase tracking-wider">
                      {mergeStep}
                    </span>
                  </div>
                ) : selected.status === 'Approved' ? (
                  <div className="bg-manga-ink text-white p-3 font-manga font-bold text-center border-2 border-manga-ink uppercase">
                    BẢN VẼ ĐÃ ĐƯỢC PHÊ DUYỆT
                  </div>
                ) : selected.status === 'Need Fix' ? (
                  <div className="bg-red-50 border-2 border-manga-red text-manga-red p-3 font-bold text-center text-xs uppercase">
                    Yêu cầu chỉnh sửa đã gửi
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleMergeLayer}
                      className="w-full bg-manga-red text-white font-manga font-bold text-sm uppercase py-2.5 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <Layers className="w-4 h-4" /> Ghép file & Phê duyệt
                    </button>
                    <button
                      onClick={handleReject}
                      className="w-full bg-white text-manga-ink font-bold text-xs uppercase py-2 border-2 border-manga-ink hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Yêu cầu chỉnh sửa
                    </button>
                  </>
                )}

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      if (selected.previewUrl) {
                        window.open(selected.previewUrl, '_blank')
                      } else {
                        alert('Không có file hoặc URL để tải về.')
                      }
                    }}
                    className="flex-1 bg-white text-manga-ink font-bold text-xs uppercase py-2 border border-manga-ink hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải file PSD/Ảnh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-2" />
          <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Tuyệt vời! Không có submission nào</h3>
          <p className="text-sm font-bold text-gray-400 mt-1">
            Không có bản vẽ nào từ trợ lý đang đợi bạn phê duyệt lúc này.
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t-2 border-manga-ink flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-gray-500">
        <div className="font-manga text-2xl text-manga-red">MangaFlow</div>
        <div>© 2026 MangaFlow System. Gangan Press Co. Ltd. All rights reserved.</div>
        <div className="flex items-center gap-6">
          
          <a href="#" className="hover:text-manga-red transition-colors">Quy tắc xuất bản</a>
          <a href="#" className="hover:text-manga-red transition-colors">Hỗ trợ Mangaka</a>
        </div>
      </footer>

      {/* Lightbox / Zoom Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div 
            className="bg-white border-4 border-manga-ink p-4 max-w-6xl w-full max-h-[95vh] flex flex-col relative manga-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setZoomImage(null)}
              className="absolute -top-3 -right-3 bg-manga-red text-white p-2 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all rounded-none z-[10000]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-2 flex items-center justify-between border-b-2 border-dashed border-manga-ink pb-2">
              <span className="font-manga text-lg font-black uppercase text-manga-ink">{zoomTitle}</span>
              <span className="text-xs font-bold text-gray-500">Nhấn ESC hoặc click bên ngoài để đóng</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
              {/* Left Column: Zoomed Image */}
              <div className="flex-1 overflow-auto bg-gray-100 border-2 border-manga-ink flex items-center justify-center min-h-[350px] p-4 relative">
                <div className="relative inline-block">
                  <img 
                    src={zoomImage} 
                    alt="Zoomed preview" 
                    className={`max-h-[70vh] w-auto max-w-full block ${zoomTitle !== "Bản Phác Thảo Gốc" && selected?.status !== 'Approved' ? 'cursor-crosshair' : ''}`}
                    onClick={handleZoomImageClick}
                  />
                  
                  {/* Render markers in Lightbox modal */}
                  {zoomTitle !== "Bản Phác Thảo Gốc" && markers.map((marker, index) => (
                    <div 
                      key={marker.id}
                      className="absolute z-20"
                      style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: 'translate(-50%, -50%)' }}
                      onClick={(e) => { e.stopPropagation(); setActiveMarkerId(marker.id); }}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-pointer transition-colors ${
                        activeMarkerId === marker.id ? 'bg-manga-red border-white text-white scale-110' : 'bg-white border-manga-red text-manga-red'
                      }`}>
                        {index + 1}
                      </div>
                      {activeMarkerId === marker.id && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white border-2 border-manga-ink manga-shadow-sm p-2 w-48 z-30" onClick={e => e.stopPropagation()}>
                          <textarea 
                            autoFocus
                            value={marker.text}
                            onChange={(e) => updateMarkerText(marker.id, e.target.value)}
                            placeholder="Nhập lỗi cần sửa..."
                            className="w-full text-xs font-bold border border-gray-300 p-1 mb-1 focus:outline-none"
                            rows={2}
                          />
                          <div className="flex justify-between">
                            <button className="text-[10px] text-red-600 font-bold uppercase hover:underline" onClick={() => deleteMarker(marker.id)}>Xóa</button>
                            <button className="text-[10px] text-manga-ink font-bold uppercase hover:underline" onClick={() => setActiveMarkerId(null)}>Xong</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Feedback Control Panel */}
              {zoomTitle !== "Bản Phác Thảo Gốc" && selected?.status !== 'Approved' && (
                <div className="w-full md:w-80 flex flex-col gap-4 border-2 border-manga-ink p-4 bg-white overflow-y-auto">
                  <h3 className="font-manga text-sm font-bold uppercase text-manga-ink border-b-2 border-manga-ink pb-1">
                    Bảng Điều Khiển Sửa Lỗi
                  </h3>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                      Nhận xét chung
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      placeholder="Nhập lý do / nhận xét chung cần sửa..."
                      className="w-full border-2 border-manga-ink px-2 py-1 text-xs font-bold resize-none focus:outline-none focus:border-manga-red bg-white"
                    />
                  </div>

                  <div className="flex-1 min-h-[150px] flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500 block">
                      Danh sách điểm lỗi ({markers.length})
                    </label>
                    <div className="flex-1 overflow-y-auto border border-gray-200 p-2 flex flex-col gap-2 max-h-[250px]">
                      {markers.map((marker, index) => (
                        <div key={marker.id} className={`p-2 border-2 text-xs font-bold transition-all ${activeMarkerId === marker.id ? 'border-manga-red bg-red-50/20' : 'border-gray-300 bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="bg-manga-red text-white font-mono px-1 text-[10px]">
                              Điểm #{index + 1}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              x: {Math.round(marker.x)}%, y: {Math.round(marker.y)}%
                            </span>
                          </div>
                          <input
                            type="text"
                            value={marker.text}
                            onChange={(e) => updateMarkerText(marker.id, e.target.value)}
                            placeholder="Nhập mô tả lỗi..."
                            className="w-full text-xs font-bold border border-gray-300 p-1 mb-1 focus:outline-none"
                          />
                          <div className="flex justify-between mt-1">
                            <button
                              onClick={() => deleteMarker(marker.id)}
                              className="text-[9px] text-red-600 font-bold uppercase hover:underline"
                            >
                              Xóa điểm
                            </button>
                            <button
                              onClick={() => setActiveMarkerId(activeMarkerId === marker.id ? null : marker.id)}
                              className="text-[9px] text-manga-ink font-bold uppercase hover:underline"
                            >
                              {activeMarkerId === marker.id ? 'Thu nhỏ' : 'Chọn'}
                            </button>
                          </div>
                        </div>
                      ))}
                      {markers.length === 0 && (
                        <div className="text-center text-gray-400 py-6 text-xs italic">
                          Click trực tiếp lên ảnh bên trái để đánh dấu các vị trí lỗi cần sửa.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <button
                      onClick={async () => {
                        if (selected.status === 'Need Fix') {
                          alert('Nhiệm vụ này đã được gửi yêu cầu chỉnh sửa trước đó và đang ở bên phía Trợ lý để sửa. Bạn cần đợi Trợ lý nộp bài mới để có thể duyệt hoặc tiếp tục yêu cầu chỉnh sửa.')
                          return
                        }
                        await handleReject()
                        setZoomImage(null)
                      }}
                      className="w-full bg-manga-red text-white font-manga font-bold text-xs uppercase py-2 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Gửi yêu cầu sửa
                    </button>
                    <button
                      onClick={() => setZoomImage(null)}
                      className="w-full bg-white text-manga-ink font-bold text-xs uppercase py-1.5 border-2 border-manga-ink hover:bg-gray-100 transition-colors"
                    >
                      Hủy / Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification ở góc dưới bên phải */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-[9999] animate-bounce duration-300">
          <div className="bg-white border-2 border-manga-ink manga-shadow-sm p-4 flex items-center gap-3 text-manga-ink max-w-sm rounded-none">
            <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="font-manga text-sm font-black uppercase tracking-wider text-manga-ink">Thành Công!</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">{toastMessage}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="ml-2 hover:bg-gray-100 p-1 bg-transparent border-none cursor-pointer">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
