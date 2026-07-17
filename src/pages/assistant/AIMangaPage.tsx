import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Sparkles,
  Cpu,
  Wand2,
  Image as ImageIcon,
  Check,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  Clock,
  ArrowRight,
  Send,
  X,
  Layers,
  Download,
  History
} from 'lucide-react'
import assistantService from '@/services/assistant.service'
import api from '@/services/api'

// Simple Helper for Image URL resolution
const getImageUrl = (url?: string | null) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `http://localhost:5000${url}`
}

const translateTaskType = (type: string) => {
  if (!type) return ''
  const maps: { [key: string]: string } = {
    sketch: 'Vẽ phác thảo (Sketch)',
    inking: 'Vẽ đi nét (Inking)',
    coloring: 'Tô màu (Coloring)',
    background: 'Vẽ bối cảnh (Background)',
    cleanup: 'Làm sạch nét (Cleanup)'
  }
  return maps[type.toLowerCase()] || type.toUpperCase()
}

const translateStatus = (status: string) => {
  if (!status) return ''
  const maps: { [key: string]: string } = {
    assigned: 'CHỜ NHẬN',
    in_progress: 'ĐANG LÀM',
    needs_revision: 'CẦN SỬA',
    rejected: 'CẦN SỬA',
    submitted: 'CHỜ DUYỆT',
    completed: 'ĐÃ DUYỆT',
    approved: 'ĐÃ DUYỆT'
  }
  return maps[status.toLowerCase()] || status.toUpperCase()
}

const AI_MODEL_OPTIONS = [
  {
    id: 'stabilityai/stable-diffusion-xl-base-1.0',
    name: 'Tính năng 1: Tô màu đè lên nét vẽ gốc (Image-to-Image)',
    desc: 'Dựa trên cấu trúc nét vẽ của bản thảo gốc để đắp màu đè lên. Phù hợp nhất cho việc tô màu giữ đúng khung tranh.',
    type: 'Tô màu theo nét'
  },
  {
    id: 'black-forest-labs/FLUX.1-schnell',
    name: 'Tính năng 2: Sinh ảnh mới hoàn toàn bằng AI (Text-to-Image)',
    desc: 'Tự động vẽ và tạo ra bức ảnh mới hoàn toàn từ nội dung mô tả prompt của bạn, không giữ nét vẽ gốc.',
    type: 'Sinh ảnh tự do'
  }
]

const PROMPT_SUGGESTIONS = {
  colors: [
    { label: 'Màu rực rỡ', tag: 'vibrant colors' },
    { label: 'Bảng màu Neon', tag: 'neon palette' },
    { label: 'Màu Pastel dịu', tag: 'soft pastel colors' },
    { label: 'Tông màu ấm', tag: 'warm tones' },
    { label: 'Tông màu lạnh', tag: 'cool tones' }
  ],
  styles: [
    { label: 'Phong cách Anime', tag: 'anime style' },
    { label: 'Phong cách Studio Ghibli', tag: 'Studio Ghibli style' },
    { label: 'Màu nước cổ điển', tag: 'classic watercolor painting' },
    { label: 'Vẽ kỹ thuật số', tag: 'professional digital painting' }
  ],
  lighting: [
    { label: 'Ánh hoàng hôn', tag: 'sunset warm lighting' },
    { label: 'Ánh sáng dịu', tag: 'soft ambient light' },
    { label: 'Tương phản cao', tag: 'high contrast shading' },
    { label: 'Đổ bóng Cel-shading', tag: 'clean cel shading' }
  ]
}

export default function AIMangaPage() {
  const navigate = useNavigate()

  // State variables
  const [tasks, setTasks] = useState<any[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [selectedTask, setSelectedTask] = useState<any>(null)
  
  const [prompt, setPrompt] = useState<string>('')
  const [model, setModel] = useState<string>('stabilityai/stable-diffusion-xl-base-1.0')
  const [refImageUrl, setRefImageUrl] = useState<string>('')

  // UI state
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [aiStatus, setAiStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle')
  const [aiResultImageUrl, setAiResultImageUrl] = useState<string>('')
  const [suggestionId, setSuggestionId] = useState<string>('')
  const [aiError, setAiError] = useState<string>('')
  
  // Submission popup state
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitNote, setSubmitNote] = useState('Tô màu thông minh bằng AI Assistant')
  const [submitting, setSubmitting] = useState(false)

  // Local Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // AI Attempt History (Frontend-only using localStorage)
  const [aiHistory, setAiHistory] = useState<any[]>([])

  const addToHistory = (item: {
    suggestion_id: string
    prompt: string
    ai_model: string
    status: 'processing' | 'completed' | 'failed' | 'applied' | 'rejected'
    image_url?: string
    created_at: string
  }) => {
    if (!selectedTaskId) return
    const key = `manga_ai_history_${selectedTaskId}`
    const currentHistory = localStorage.getItem(key)
    const list = currentHistory ? JSON.parse(currentHistory) : []
    
    const idx = list.findIndex((x: any) => x.suggestion_id === item.suggestion_id)
    if (idx > -1) {
      list[idx] = { ...list[idx], ...item }
    } else {
      list.unshift(item)
    }
    
    localStorage.setItem(key, JSON.stringify(list))
    setAiHistory(list)
  }

  // Load Assistant active tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true)
      try {
        const response = await assistantService.listMyTasks({ limit: 100 })
        if (response && response.success && Array.isArray(response.data)) {
          // Filter tasks that require drawing/coloring/sketching/inking and are active
          const activeList = response.data.filter(t => 
            (t.status === 'assigned' || 
             t.status === 'in_progress' || 
             t.status === 'needs_revision' || 
             t.status === 'rejected') && 
            (t.task_type.toLowerCase() === 'coloring' ||
             t.task_type.toLowerCase() === 'drawing' ||
             t.task_type.toLowerCase() === 'inking' ||
             t.task_type.toLowerCase() === 'sketch' ||
             t.task_type.toLowerCase() === 'cleanup' ||
             t.task_type.toLowerCase() === 'background')
          )
          setTasks(activeList)
          if (activeList.length > 0) {
            setSelectedTaskId(activeList[0].task_id)
          }
        }
      } catch (err) {
        console.error('Failed to load active drawing tasks:', err)
        showToast('Không thể kết nối máy chủ để tải danh sách nhiệm vụ.')
      } finally {
        setLoadingTasks(false)
      }
    }
    fetchTasks()
  }, [])

  // Update selected task details when task selection changes
  useEffect(() => {
    if (selectedTaskId) {
      const task = tasks.find(t => t.task_id === selectedTaskId)
      setSelectedTask(task || null)
      // Reset AI result when switching task
      setAiStatus('idle')
      setAiResultImageUrl('')
      setSuggestionId('')
      setAiError('')
      
      // Auto-populate reference image if it exists
      if (task?.page?.image_url) {
        setRefImageUrl(task.page.image_url)
      } else {
        setRefImageUrl('')
      }

      // Load task history
      const savedHistory = localStorage.getItem(`manga_ai_history_${selectedTaskId}`)
      setAiHistory(savedHistory ? JSON.parse(savedHistory) : [])
    } else {
      setSelectedTask(null)
      setRefImageUrl('')
      setAiHistory([])
    }
  }, [selectedTaskId, tasks])

  // Append tags to prompt field
  const handleAddTag = (tag: string) => {
    if (!prompt.includes(tag)) {
      setPrompt(prev => prev ? `${prev}, ${tag}` : tag)
    }
  }

  // Polling Status with Exponential Backoff
  const pollAiSuggestion = async (sId: string) => {
    let delay = 2000 // Start with 2 seconds
    const maxTime = 60000 // 60 seconds timeout
    let elapsed = 0

    const executePoll = async () => {
      if (elapsed >= maxTime) {
        setAiStatus('failed')
        setAiError('Hết thời gian xử lý AI (AI processing timeout). Vui lòng thử lại!')
        addToHistory({
          suggestion_id: sId,
          prompt: prompt || 'Tô màu AI',
          ai_model: model,
          status: 'failed',
          created_at: new Date().toISOString()
        })
        return
      }

      try {
        const response = await assistantService.getAiSuggestion(sId)
        if (response && response.success && response.data) {
          const { status, result_data } = response.data
          
          if (status === 'completed') {
            setAiStatus('completed')
            setAiResultImageUrl(result_data?.image_url || '')
            setSuggestionId(sId)
            showToast('Tô màu AI hoàn tất!')
            addToHistory({
              suggestion_id: sId,
              prompt: response.data.prompt || prompt,
              ai_model: response.data.ai_model || model,
              status: 'completed',
              image_url: result_data?.image_url || '',
              created_at: response.data.created_at || new Date().toISOString()
            })
            return
          } else if (status === 'failed') {
            setAiStatus('failed')
            setAiError(result_data?.error || 'AI Server báo lỗi khi sinh ảnh. Hãy thử đổi Prompt.')
            addToHistory({
              suggestion_id: sId,
              prompt: response.data.prompt || prompt,
              ai_model: response.data.ai_model || model,
              status: 'failed',
              created_at: response.data.created_at || new Date().toISOString()
            })
            return
          }
        }
      } catch (pollErr: any) {
        console.error('AI polling error:', pollErr)
      }

      // Schedule next poll with backoff
      setTimeout(() => {
        elapsed += delay
        // Exponential backoff strategy
        if (delay === 2000) delay = 4000
        else if (delay === 4000) delay = 8000
        else delay = 10000 // Max delay of 10s
        executePoll()
      }, delay)
    }

    executePoll()
  }

  // Trigger start coloring job
  const handleStartColoring = async () => {
    if (!selectedTaskId) {
      showToast('Vui lòng chọn một nhiệm vụ vẽ trước!')
      return
    }

    setAiStatus('processing')
    setAiError('')
    setAiResultImageUrl('')

    try {
      const payload = {
        prompt: prompt.trim() || undefined,
        reference_image_url: refImageUrl.trim() || undefined
      }
      
      const response = await assistantService.startAiColoring(selectedTaskId, payload)
      if (response && response.success && response.data) {
        const sId = response.data.suggestion_id
        setSuggestionId(sId)
        // Add to history
        addToHistory({
          suggestion_id: sId,
          prompt: prompt.trim() || 'Tự động tối ưu theo yêu cầu tác giả',
          ai_model: model,
          status: 'processing',
          created_at: new Date().toISOString()
        })
        // Start polling suggestions
        pollAiSuggestion(sId)
      } else {
        setAiStatus('failed')
        setAiError('Yêu cầu khởi chạy AI bị từ chối từ Backend.')
      }
    } catch (err: any) {
      console.error('Failed to trigger AI coloring:', err)
      setAiStatus('failed')
      setAiError(err?.response?.data?.message || err?.message || 'Lỗi hệ thống khi khởi động AI.')
    }
  }

  // Reject Suggestion
  const handleReject = async () => {
    if (!suggestionId) return
    try {
      await assistantService.rejectAiSuggestion(suggestionId)
      showToast('Đã hủy bỏ kết quả gợi ý của AI.')
      
      // Update history status to 'rejected'
      const key = `manga_ai_history_${selectedTaskId}`
      const currentHistory = localStorage.getItem(key)
      if (currentHistory) {
        const list = JSON.parse(currentHistory)
        const idx = list.findIndex((x: any) => x.suggestion_id === suggestionId)
        if (idx > -1) {
          list[idx].status = 'rejected'
          localStorage.setItem(key, JSON.stringify(list))
          setAiHistory(list)
        }
      }

      setAiStatus('idle')
      setAiResultImageUrl('')
      setSuggestionId('')
    } catch (err) {
      console.error('Failed to reject suggestion:', err)
      showToast('Lỗi khi gửi yêu cầu hủy gợi ý.')
    }
  }

  // Download Image to Computer
  const handleDownload = async () => {
    if (!aiResultImageUrl) return
    try {
      const response = await fetch(getImageUrl(aiResultImageUrl))
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `manga-ai-coloring-${selectedTaskId.slice(0, 8)}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showToast('Đã tải ảnh màu xuống máy của bạn!')
    } catch (err) {
      console.error('Failed to download image:', err)
      // Fallback
      window.open(getImageUrl(aiResultImageUrl), '_blank')
      showToast('Đang mở hình ảnh ở tab mới để tải xuống...')
    }
  }

  // Confirm and Submit drawing task
  const handleConfirmSubmit = async () => {
    if (!selectedTaskId || !aiResultImageUrl) return
    setSubmitting(true)
    try {
      await assistantService.createSubmission(selectedTaskId, {
        file_url: aiResultImageUrl,
        submission_notes: submitNote,
        suggestion_id: suggestionId
      })
      showToast('Nộp bài vẽ bằng AI thành công!')
      
      // Update history status to 'applied'
      const key = `manga_ai_history_${selectedTaskId}`
      const currentHistory = localStorage.getItem(key)
      if (currentHistory) {
        const list = JSON.parse(currentHistory)
        const idx = list.findIndex((x: any) => x.suggestion_id === suggestionId)
        if (idx > -1) {
          list[idx].status = 'applied'
          localStorage.setItem(key, JSON.stringify(list))
          setAiHistory(list)
        }
      }

      setShowSubmitModal(false)
      // Redirect to tasks page after delay
      setTimeout(() => {
        navigate('/dashboard/assistant/tasks')
      }, 1500)
    } catch (err: any) {
      console.error('Failed to submit drawing using AI:', err)
      showToast(`Gửi bài thất bại: ${err?.response?.data?.message || err?.message || 'Lỗi hệ thống'}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-16 font-sans text-manga-ink p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b-4 border-black pb-6">
        <div>
          <div className="flex items-center gap-2 text-manga-red mb-1">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Trợ lý nghệ thuật</span>
          </div>
          <h1 className="font-manga text-4xl font-extrabold uppercase leading-none tracking-wide">
            AI MANGA COLORING
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-2">
            Tự động tô màu thông minh bằng Trí tuệ nhân tạo (AI Engine) tích hợp sâu vào nhiệm vụ vẽ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: Controls & Prompts (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Section 1: Task Selector */}
          <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000000]">
            <h2 className="font-manga text-md font-bold uppercase text-manga-red mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" /> 1. CHỌN NHIỆM VỤ CẦN TÔ MÀU
            </h2>
            
            {loadingTasks ? (
              <div className="py-4 text-center text-xs font-bold text-gray-400">Đang tải danh sách nhiệm vụ...</div>
            ) : tasks.length === 0 ? (
              <div className="bg-amber-50 border-2 border-dashed border-amber-300 p-4 text-center text-xs font-bold text-amber-700">
                Bạn hiện không có nhiệm vụ vẽ hay tô màu nào đang hoạt động.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Nhiệm vụ đang làm</label>
                  <div className="relative">
                    <select
                      value={selectedTaskId}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                      className="w-full border-2 border-black p-3 font-bold text-xs uppercase focus:outline-none focus:border-manga-red bg-white cursor-pointer appearance-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {tasks.map(t => (
                        <option key={t.task_id} value={t.task_id}>
                          {t.page?.chapter?.series?.title || 'Unknown Series'} - {t.page?.chapter?.title || 'Chương ?'} (Trang {t.page?.page_number})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 absolute right-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {selectedTask && (
                  <div className="bg-gray-50 border border-black p-3.5 space-y-2 text-xs font-bold">
                     <div className="flex flex-col gap-1.5 border-b border-zinc-200 pb-2 mb-2">
                      <span className="text-gray-400">Mô tả việc:</span>
                      <span className="text-manga-ink whitespace-pre-wrap leading-relaxed font-semibold">
                        {selectedTask.content || selectedTask.description || 'Tô màu phân cảnh'}
                      </span>
                    </div>
                     <div className="flex justify-between">
                      <span className="text-gray-400">Loại Task:</span>
                      <span className="bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded text-[10px] uppercase">
                        {translateTaskType(selectedTask.task_type)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trạng thái:</span>
                      <span className="text-manga-red uppercase text-[10px]">
                        {translateStatus(selectedTask.status)}
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Attempt History */}
                {selectedTaskId && (
                  <div className="border-t border-dashed border-zinc-300 pt-4 mt-4">
                    <h3 className="text-xs font-black uppercase text-manga-ink mb-3 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-manga-red animate-pulse" /> Lịch sử sinh ảnh ({aiHistory.length} lần thử)
                    </h3>

                    {aiHistory.length === 0 ? (
                      <p className="text-[10px] text-gray-400 italic">Chưa có lượt thử nghiệm nào cho nhiệm vụ này.</p>
                    ) : (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {aiHistory.map((item, index) => {
                          const isCurrent = suggestionId === item.suggestion_id
                          return (
                            <div 
                              key={item.suggestion_id} 
                              className={`border p-2 flex gap-2 items-center justify-between text-[11px] transition ${
                                isCurrent 
                                  ? 'border-manga-red bg-red-50/50 shadow-[2px_2px_0px_0px_#E63946]' 
                                  : 'border-zinc-300 bg-white hover:border-black'
                              }`}
                            >
                              <div className="flex gap-2 items-center min-w-0 flex-1">
                                {/* Thumbnail */}
                                {item.status === 'completed' && item.image_url ? (
                                  <img 
                                    src={getImageUrl(item.image_url)} 
                                    alt="Thumb" 
                                    className="w-10 h-10 object-cover border border-black flex-shrink-0 cursor-pointer"
                                    onClick={() => {
                                      setAiResultImageUrl(item.image_url)
                                      setAiStatus('completed')
                                      setSuggestionId(item.suggestion_id)
                                      setPrompt(item.prompt || '')
                                      setModel(item.ai_model || 'stabilityai/stable-diffusion-xl-base-1.0')
                                      showToast('Đã tải lại kết quả này vào không gian làm việc!')
                                    }}
                                  />
                                ) : item.status === 'processing' ? (
                                  <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center border border-dashed border-zinc-400 flex-shrink-0">
                                    <Clock className="w-4 h-4 text-zinc-500 animate-spin" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-red-50 flex items-center justify-center border border-zinc-300 flex-shrink-0">
                                    <AlertTriangle className="w-4 h-4 text-manga-red" />
                                  </div>
                                )}

                                {/* Meta details */}
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold truncate text-manga-ink">
                                    Lần #{aiHistory.length - index}: {item.prompt || 'Không có mô tả'}
                                  </div>
                                  <div className="text-[9px] text-gray-400 flex gap-1.5 items-center mt-0.5 font-bold">
                                    <span>{new Date(item.created_at).toLocaleTimeString()}</span>
                                    <span>•</span>
                                    <span className={`uppercase font-black ${
                                      item.status === 'completed' ? 'text-emerald-600' :
                                      item.status === 'applied' ? 'text-blue-600' :
                                      item.status === 'rejected' ? 'text-zinc-500' :
                                      item.status === 'processing' ? 'text-amber-500' : 'text-manga-red'
                                    }`}>
                                      {item.status === 'completed' ? 'Hoàn tất' :
                                       item.status === 'applied' ? 'Đã nộp' :
                                       item.status === 'rejected' ? 'Đã hủy' :
                                       item.status === 'processing' ? 'Đang chạy' : 'Thất bại'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="flex gap-1.5 flex-shrink-0">
                                {item.status === 'completed' && (
                                  <button
                                    onClick={() => {
                                      setAiResultImageUrl(item.image_url)
                                      setAiStatus('completed')
                                      setSuggestionId(item.suggestion_id)
                                      setPrompt(item.prompt || '')
                                      setModel(item.ai_model || 'stabilityai/stable-diffusion-xl-base-1.0')
                                      showToast('Đã tải lại kết quả này!')
                                    }}
                                    className="px-2 py-1 bg-black text-white hover:bg-zinc-800 text-[9px] font-black uppercase tracking-wider cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] border border-black active:translate-y-0.5 active:shadow-none"
                                  >
                                    Xem
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: AI Prompt Input */}
          <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000000]">
            <h2 className="font-manga text-md font-bold uppercase text-manga-ink mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5" /> 2. CẤU HÌNH & CHỈ DẪN AI
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                  Chọn mô hình AI (Model)
                </label>
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full border-2 border-black p-3 font-bold text-xs uppercase focus:outline-none focus:border-manga-red bg-white cursor-pointer appearance-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {AI_MODEL_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.type} - {opt.id.split('/').pop()}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-3 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 leading-snug font-medium">
                  {AI_MODEL_OPTIONS.find(opt => opt.id === model)?.desc}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                  Chỉ dẫn tô màu (Prompt)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ví dụ: vibrant anime colors, sunset warm light, Studio Ghibli style..."
                  rows={4}
                  className="w-full border-2 border-black p-3 font-bold text-xs focus:outline-none focus:border-manga-red focus:shadow-[2px_2px_0px_0px_rgba(230,57,70,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
                <p className="text-[9px] text-gray-400 font-medium leading-relaxed mt-1">
                  💡 Hệ thống đã được tích hợp **Auto-Enrichment** tự động dịch tiếng Việt và tự bổ sung chi tiết nghệ thuật từ nội dung yêu cầu của Task.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="border border-zinc-200 bg-zinc-50 p-3 space-y-3">
                <div className="text-[10px] font-black uppercase tracking-wider text-manga-red">Mẹo viết Prompt nhanh:</div>
                
                <div className="space-y-2">
                  <div className="text-[9px] font-black text-gray-400 uppercase">Màu sắc chủ đạo:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.colors.map(s => (
                      <button
                        key={s.tag}
                        onClick={() => handleAddTag(s.tag)}
                        className="bg-white border border-black hover:border-manga-red hover:text-manga-red px-2 py-1 text-[9px] font-bold uppercase transition cursor-pointer"
                      >
                        + {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[9px] font-black text-gray-400 uppercase">Phong cách nghệ thuật:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.styles.map(s => (
                      <button
                        key={s.tag}
                        onClick={() => handleAddTag(s.tag)}
                        className="bg-white border border-black hover:border-manga-red hover:text-manga-red px-2 py-1 text-[9px] font-bold uppercase transition cursor-pointer"
                      >
                        + {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[9px] font-black text-gray-400 uppercase">Ánh sáng & Bóng đổ:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.lighting.map(s => (
                      <button
                        key={s.tag}
                        onClick={() => handleAddTag(s.tag)}
                        className="bg-white border border-black hover:border-manga-red hover:text-manga-red px-2 py-1 text-[9px] font-bold uppercase transition cursor-pointer"
                      >
                        + {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Trigger Button */}
              <button
                disabled={!selectedTaskId || aiStatus === 'processing'}
                onClick={handleStartColoring}
                className="w-full bg-[#E63946] text-white border-4 border-black font-black uppercase py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Cpu className="w-5 h-5 animate-pulse" />
                TÔ MÀU BẰNG AI
              </button>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Preview Workspace (2/3 width) */}
        <div className="lg:col-span-2">
          
          <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] min-h-[600px] flex flex-col">
            
            {/* Workspace Header */}
            <div className="bg-black p-4 text-white flex justify-between items-center border-b-4 border-black">
              <h3 className="font-manga text-md uppercase font-bold tracking-wide flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-manga-red" />
                KHÔNG GIAN LÀM VIỆC & SO SÁNH BẢN VẼ
              </h3>
              {aiStatus === 'completed' && (
                <div className="bg-emerald-500 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider animate-bounce">
                  Hoàn tất sinh ảnh
                </div>
              )}
            </div>

            {/* Main Interactive Canvas Area */}
            <div className="flex-1 bg-zinc-150 p-6 flex items-center justify-center relative min-h-[450px]">
              
              {/* State A: Idle (No AI request yet) */}
              {aiStatus === 'idle' && (
                <div className="w-full max-w-lg text-center space-y-4">
                  {selectedTask?.page?.image_url ? (
                    <div className="space-y-3">
                      <div className="relative border-4 border-black inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-[450px] overflow-hidden bg-white">
                        <img 
                          src={getImageUrl(selectedTask.page.image_url)} 
                          alt="Bản thảo gốc" 
                          className="max-h-[380px] w-auto object-contain block"
                        />
                        <span className="absolute bottom-3 left-3 bg-black text-white px-2 py-1 text-[9px] font-black uppercase tracking-widest border-2 border-white">
                          Bản thảo gốc
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                        Trang {selectedTask.page.page_number} - Chọn cấu hình và bấm "TÔ MÀU BẰNG AI" để bắt đầu.
                      </p>
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-3">
                      <ImageIcon className="w-16 h-16 mx-auto text-gray-300 stroke-[1.5]" />
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        Chọn một nhiệm vụ vẽ ở cột trái để hiển thị bản vẽ gốc.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* State B: Processing (AI works in background) */}
              {aiStatus === 'processing' && (
                <div className="w-full max-w-md text-center p-8 bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000000] space-y-6 animate-pulse">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-4 border-dashed border-manga-red rounded-full animate-spin"></div>
                    <Cpu className="w-10 h-10 absolute inset-0 m-auto text-[#E63946]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-manga text-lg font-black uppercase text-manga-ink tracking-wide">AI đang xử lý bản thảo...</h3>
                    <p className="text-xs text-gray-500 font-semibold px-4">
                      Tác vụ sinh ảnh AI đang chạy ngầm trên Cloud Engine ( Groq & Hugging Face). Quá trình này thường mất từ **5 đến 30 giây** tùy thuộc vào độ phức tạp của Prompt.
                    </p>
                  </div>
                  <div className="border border-zinc-200 bg-zinc-50 p-3 rounded flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-manga-red animate-spin" />
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Đang Polling định kỳ...</span>
                  </div>
                </div>
              )}

              {/* State C: Failed */}
              {aiStatus === 'failed' && (
                <div className="w-full max-w-lg bg-white border-4 border-black p-8 shadow-[4px_4px_0px_0px_rgba(230,57,70,1)] text-center space-y-5">
                  <AlertTriangle className="w-16 h-16 mx-auto text-[#E63946] stroke-[1.5]" />
                  <div className="space-y-2">
                    <h3 className="font-manga text-lg font-black text-[#E63946] uppercase">Lỗi xử lý AI</h3>
                    <p className="text-xs font-semibold text-gray-700 bg-red-50 p-4 border border-red-200 max-h-[150px] overflow-y-auto leading-relaxed">
                      {aiError}
                    </p>
                  </div>
                  <button
                    onClick={handleStartColoring}
                    className="px-6 py-2.5 bg-black text-white hover:bg-gray-800 text-xs font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    Thử lại tác vụ
                  </button>
                </div>
              )}

              {/* State D: Completed (Preview Colored Image vs Original) */}
              {aiStatus === 'completed' && (
                <div className="w-full h-full flex flex-col md:flex-row gap-6 justify-center items-center p-2">
                  
                  {/* Left panel: Original */}
                  <div className="flex-1 flex flex-col items-center">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-wider">Ảnh Phác Thảo Gốc</h4>
                    <div className="border-4 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] max-h-[350px] max-w-full overflow-hidden">
                      <img 
                        src={getImageUrl(selectedTask?.page?.image_url)} 
                        alt="Sketch" 
                        className="max-h-[320px] max-w-full w-auto object-contain block"
                      />
                    </div>
                  </div>

                  {/* Arrow separator */}
                  <div className="hidden md:block">
                    <ArrowRight className="w-8 h-8 text-black stroke-[3]" />
                  </div>

                  {/* Right panel: AI Colored */}
                  <div className="flex-1 flex flex-col items-center">
                    <h4 className="text-[10px] font-black uppercase text-manga-red mb-2 tracking-wider">Tô Màu Bằng AI</h4>
                    <div className="border-4 border-[#E63946] bg-white shadow-[4px_4px_0px_0px_#E63946] max-h-[350px] max-w-full overflow-hidden relative">
<img 
                        src={getImageUrl(aiResultImageUrl)} 
                        alt="Colored by AI" 
                        className="max-h-[320px] max-w-full w-auto object-contain block"
                      />
                      <div className="absolute top-2 right-2 bg-[#E63946] text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border border-white">
                        AI Result
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Bottom Actions panel */}
            {aiStatus === 'completed' && (
              <div className="bg-gray-100 p-5 border-t-4 border-black flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="text-xs font-bold text-gray-600 max-w-sm text-center lg:text-left">
                  Bản vẽ đã được tô màu thành công. Bạn có thể nộp bài ngay bằng tác phẩm AI hoặc hủy bỏ để vẽ tay/sinh ảnh lại.
                </div>
                
                <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
                  <button
                    onClick={handleReject}
                    className="flex-1 lg:flex-none px-5 py-3 border-2 border-black bg-white font-bold text-xs uppercase hover:bg-gray-150 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" /> Bỏ qua / Hủy
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="flex-1 lg:flex-none px-5 py-3 border-2 border-black bg-blue-50 text-blue-700 font-bold text-xs uppercase hover:bg-blue-100 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Download className="w-4 h-4" /> Tải ảnh về
                  </button>

                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex-1 lg:flex-none px-5 py-3 bg-emerald-500 text-white border-2 border-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-600 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Nộp bài bằng ảnh AI
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black w-full max-w-md shadow-[8px_8px_0px_0px_rgba(230,57,70,1)] animate-zoom-in text-manga-ink font-bold">
            <div className="bg-manga-ink p-4 text-white flex justify-between items-center">
              <h3 className="font-manga text-xl uppercase font-bold tracking-wide">Xác nhận nộp bài</h3>
              <button 
                onClick={() => setShowSubmitModal(false)} 
                className="hover:text-[#E63946] transition cursor-pointer bg-transparent border-none text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed font-semibold">
                Bạn đang đồng ý sử dụng tác phẩm tô màu bằng AI để làm bài nộp chính thức cho nhiệm vụ này.
              </p>
              
              <div>
                <label className="text-xs font-black uppercase tracking-wider mb-2 block text-gray-500">Ghi chú nộp bài</label>
                <textarea
                  value={submitNote}
                  onChange={(e) => setSubmitNote(e.target.value)}
                  placeholder="Ghi chú đính kèm..."
                  rows={3}
                  className="w-full border-2 border-black p-3 text-xs font-bold bg-white focus:outline-none focus:border-manga-red"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowSubmitModal(false)} 
                  className="flex-1 py-3 border-2 border-black font-bold text-xs uppercase hover:bg-gray-150 transition cursor-pointer"
                >
                  Quay lại
                </button>
                <button 
                  onClick={handleConfirmSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#E63946] text-white border-2 border-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> {submitting ? 'Đang nộp...' : 'Gửi bài nộp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Local Toast Toast Message Overlay */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[9999] bg-black text-white border-4 border-manga-red px-6 py-4 shadow-[4px_4px_0px_0px_#000000] animate-slide-in font-bold text-xs uppercase tracking-wider">
          {toastMessage}
        </div>
      )}

    </div>
  )
}
