import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Upload,
  Send,
  Calendar,
  X,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { AssistantTask } from '@/data/assistantMockData'
import assistantService, { PageTask, AssistantSubmission as BackendSubmission, PageTaskFeedback } from '@/services/assistant.service'
import uploadService from '@/services/upload.service'

interface FeedbackComment {
  author: string;
  role: string;
  avatar: string;
  timeAgo: string;
  content: string;
  isUrgent?: boolean;
  isApproved?: boolean;
}

interface TimelineStep {
  date: string;
  label: string;
  done: boolean;
  active: boolean;
  key: string;
}

const getTaskTypeName = (type: string) => {
  const maps: Record<string, string> = {
    inking: 'Character Lineart',
    coloring: 'Coloring',
    lettering: 'Lettering',
    cleaning: 'Cleaning',
    sfx: 'SFX Design',
    background: 'Background'
  }
  return maps[type] || type.toUpperCase()
}

const mapBackendTaskToAssistantTask = (task: PageTask): AssistantTask => {
  let mappedStatus: AssistantTask['status'] = 'Not Started'
  if (task.status === 'in_progress') mappedStatus = 'In Progress'
  else if (task.status === 'submitted') mappedStatus = 'Submitted'
  else if (task.status === 'needs_revision' || task.status === 'rejected') mappedStatus = 'Need Fix'
  else if (task.status === 'completed' || task.status === 'approved') mappedStatus = 'Approved'
  else if (task.status === 'assigned') mappedStatus = 'Not Started'

  return {
    id: task.task_id,
    seriesTitle: task.page?.chapter?.series?.title || 'Unknown Series',
    chapterNumber: task.page?.chapter?.title ? parseInt(task.page.chapter.title.replace(/\D/g, '')) || 1 : 1,
    pageNumber: task.page?.page_number || 1,
    layerType: getTaskTypeName(task.task_type),
    assignedBy: task.users?.name || task.users?.username || 'Mangaka/Editor',
    deadline: task.deadline ? task.deadline.split('T')[0] : '',
    status: mappedStatus,
    priority: task.priority || 'Medium',
    note: task.description || '',
    referenceUrl: task.page?.image_url || undefined,
  }
}

const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  let interval = Math.floor(seconds / 31536000)
  if (interval >= 1) return `${interval} năm trước`
  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) return `${interval} tháng trước`
  interval = Math.floor(seconds / 86400)
  if (interval >= 1) return `${interval} ngày trước`
  interval = Math.floor(seconds / 3600)
  if (interval >= 1) return `${interval} giờ trước`
  interval = Math.floor(seconds / 60)
  if (interval >= 1) return `${interval} phút trước`
  return 'Vừa xong'
}

export default function FeedbackPage() {
  const location = useLocation()
  const [tasks, setTasks] = useState<AssistantTask[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  
  // API details states
  const [submissions, setSubmissions] = useState<BackendSubmission[]>([])
  const [activeFeedbacks, setActiveFeedbacks] = useState<FeedbackComment[]>([])
  const [activeTimeline, setActiveTimeline] = useState<TimelineStep[]>([])
  
  // Loading & Submission states
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState('')

  const [noteContent, setNoteContent] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeMarkerId, setActiveMarkerId] = useState<number | null>(null)

  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop'
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    return `${apiURL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const parseMarkersFromComments = () => {
    const parsedMarkers: Array<{ index: number; x: number; y: number; text: string }> = []
    activeFeedbacks.forEach((fb) => {
      if (!fb.content) return
      const lines = fb.content.split('\n')
      lines.forEach((line) => {
        const match = line.match(/Điểm\s*số\s*(\d+)\s*\(vị\s*trí\s*ngang\s*(\d+)%,\s*dọc\s*(\d+)%\):\s*(.*)/i)
        if (match) {
          parsedMarkers.push({
            index: parseInt(match[1], 10),
            x: parseFloat(match[2]),
            y: parseFloat(match[3]),
            text: match[4] || ''
          })
        }
      })
    })
    return parsedMarkers
  }

  // Load tasks on mount
  useEffect(() => {
    loadTasks()
  }, [])

  // Sync selected task from routing location state
  useEffect(() => {
    if (location.state?.selectedTaskId) {
      setSelectedTaskId(location.state.selectedTaskId)
    }
  }, [location.state])

  // Load submissions and feedbacks when selectedTaskId changes
  useEffect(() => {
    if (!selectedTaskId) return
    loadTaskDetailsAndFeedbacks(selectedTaskId)
  }, [selectedTaskId])

  const loadTasks = async () => {
    setIsLoadingTasks(true)
    try {
      const res = await assistantService.listMyTasks({ limit: 100 })
      if (res && res.success) {
        // Filter tasks that are in progress, need revision or review
        const relevant = res.data
          .map(mapBackendTaskToAssistantTask)
          .filter(t => ['Need Fix', 'Submitted', 'In Progress', 'Approved'].includes(t.status))
        
        setTasks(relevant)

        // Select first task if selectedTaskId is not present
        if (relevant.length > 0 && (!selectedTaskId || !relevant.find(t => t.id === selectedTaskId))) {
          setSelectedTaskId(relevant[0].id)
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách nhiệm vụ:', err)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  const loadTaskDetailsAndFeedbacks = async (taskId: string) => {
    setIsLoadingDetails(true)
    try {
      // 1. Fetch submissions of this task
      const subs = await assistantService.listTaskSubmissions(taskId)
      setSubmissions(subs || [])

      // 2. Map timeline from task & submissions
      const activeTaskData = tasks.find(t => t.id === taskId)
      const mockTaskObj = activeTaskData ? {
        created_at: new Date().toISOString(), // Fallback
        deadline: activeTaskData.deadline,
        status: activeTaskData.status
      } : { created_at: '', deadline: '', status: '' }

      // Build dynamic timeline based on task status & overdue state
      const steps: TimelineStep[] = []
      
      if (activeTaskData) {
        const isApproved = activeTaskData.status === 'Approved'
        const isSubmitted = activeTaskData.status === 'Submitted'
        
        // Parse deadline
        const deadlineDate = activeTaskData.deadline ? new Date(activeTaskData.deadline) : null
        const today = new Date()
        const isOverdue = deadlineDate ? (today.getTime() > deadlineDate.getTime() && !isApproved) : false

        const sortedSubs = [...(subs || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        
        // Safe format helper for step dates
        const formatStepDate = (dateStr?: string) => {
          if (!dateStr) return ''
          const d = new Date(dateStr)
          if (isNaN(d.getTime())) return ''
          return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
        }

        // Active step indexing:
        // 0: Nhận nhiệm vụ (Active if In Progress / Need Fix and not overdue)
        // 1: Nộp bản v1 (Active if Submitted and not overdue)
        // 2: Hạn chót (Active if overdue)
        // 3: Hoàn thành (Active if Approved)
        let activeIdx = 0
        if (isApproved) {
          activeIdx = 3
        } else if (isOverdue) {
          activeIdx = 2
        } else if (isSubmitted) {
          activeIdx = 1
        } else {
          activeIdx = 0
        }

        // Step 1: Nhận nhiệm vụ
        steps.push({
          date: formatStepDate(activeTaskData.createdAt || new Date().toISOString()),
          label: 'Nhận nhiệm vụ',
          active: activeIdx === 0,
          done: activeIdx >= 0,
          key: 'assign'
        })

        // Step 2: Nộp bản v1 (Chờ duyệt)
        const latestSub = sortedSubs[sortedSubs.length - 1]
        let subLabel = 'Nộp bản v1 (Chờ duyệt)'
        if (latestSub) {
          const subVer = sortedSubs.length
          const statusText = latestSub.status === 'approved' ? 'Đã duyệt' : latestSub.status === 'needs_revision' ? 'Yêu cầu sửa' : 'Chờ duyệt'
          subLabel = `Nộp bản v${subVer} (${statusText})`
        }
        steps.push({
          date: latestSub ? formatStepDate(latestSub.created_at) : '',
          label: subLabel,
          active: activeIdx === 1,
          done: activeIdx >= 1 || !!latestSub,
          key: 'submission'
        })

        // Step 3: Hạn chót (Deadline)
        steps.push({
          date: formatStepDate(activeTaskData.deadline),
          label: isOverdue ? 'Quá hạn nộp bài' : 'Hạn chót (Deadline)',
          active: activeIdx === 2,
          done: activeIdx >= 2 || isApproved,
          key: 'deadline'
        })

        // Step 4: Hoàn thành
        const approvedSub = sortedSubs.find(s => s.status === 'approved')
        steps.push({
          date: approvedSub ? formatStepDate(approvedSub.created_at) : '',
          label: 'Hoàn thành',
          active: activeIdx === 3,
          done: activeIdx === 3,
          key: 'completed'
        })
      }
      
      setActiveTimeline(steps)

      // 3. Load feedbacks for the latest submission if available
      const latestSub = subs?.[0] // Sort default by descending from API
      if (latestSub) {
        const feedbacksList = await assistantService.listSubmissionFeedbacks(latestSub.submission_id)
        const mappedComments: FeedbackComment[] = feedbacksList.map(fb => {
          const isMangaka = !!fb.mangaka_id
          return {
            author: isMangaka ? 'Akira Tanaka' : 'Trợ lý Kenji',
            role: isMangaka ? 'Mangaka' : 'Trợ lý',
            avatar: isMangaka ? 'AT' : 'KT',
            timeAgo: timeAgo(fb.created_at),
            content: fb.content,
            isUrgent: fb.status === 'urgent',
            isApproved: fb.status === 'approved'
          }
        })
        setActiveFeedbacks(mappedComments)
      } else {
        // No submissions yet
        setActiveFeedbacks([{
          author: 'Hệ thống',
          role: 'Thông báo',
          avatar: 'SYS',
          timeAgo: 'Hiện tại',
          content: 'Nhiệm vụ này chưa có bản nộp nào. Hãy đính kèm tệp và gửi bản nộp đầu tiên của bạn để nhận phản hồi từ Mangaka.'
        }])
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết phản hồi:', err)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  // Get active task object
  const activeTask = tasks.find(t => t.id === selectedTaskId)

  // Remaining days label helper
  const getRemainingDaysText = (task: AssistantTask) => {
    if (!task.deadline) return ''
    const deadlineDate = new Date(task.deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return `Quá hạn ${Math.abs(diffDays)} ngày`
    } else if (diffDays === 0) {
      return 'Hôm nay'
    } else {
      return `${diffDays} ngày`
    }
  }

  // Status visual mapping helper
  const getStatusConfig = (status: AssistantTask['status']) => {
    switch (status) {
      case 'Need Fix':
        return { label: 'REVISION', bg: 'bg-[#FFF5F5]', text: 'text-[#E63946]', border: 'border-[#E63946]' }
      case 'Submitted':
        return { label: 'REVIEW', bg: 'bg-[#FAF5FF]', text: 'text-[#9F7AEA]', border: 'border-[#9F7AEA]' }
      case 'Approved':
        return { label: 'APPROVED', bg: 'bg-[#E6FFFA]', text: 'text-[#38B2AC]', border: 'border-[#38B2AC]' }
      default:
        return { label: 'PENDING', bg: 'bg-[#FFFDF0]', text: 'text-[#D69E2E]', border: 'border-[#D69E2E]' }
    }
  }

  // Handle file select & Cloudinary upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setIsUploading(true)
    try {
      const res = await uploadService.uploadSingle(file, 'submissions')
      setUploadedFileUrl(res.secure_url)
      showToast('success', 'Đã tải tệp lên Cloudinary thành công!')
    } catch (err) {
      console.error(err)
      showToast('error', 'Tải tệp lên Cloudinary thất bại.')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setIsUploading(true)
    try {
      const res = await uploadService.uploadSingle(file, 'submissions')
      setUploadedFileUrl(res.secure_url)
      showToast('success', 'Đã tải tệp lên Cloudinary thành công!')
    } catch (err) {
      console.error(err)
      showToast('error', 'Tải tệp lên Cloudinary thất bại.')
    } finally {
      setIsUploading(false)
    }
  }

  // Determine current/next version to suggest
  const getNextVersionText = () => {
    return `v${submissions.length + 1}`
  }

  // Submit resubmission form
  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTask) return

    if (!noteContent.trim()) {
      showToast('error', 'Vui lòng nhập ghi chú chỉnh sửa theo phản hồi!')
      return
    }

    if (!uploadedFileUrl) {
      showToast('error', 'Vui lòng đợi tệp tải lên Cloudinary thành công!')
      return
    }

    setIsSubmitting(true)
    try {
      // Create real submission in backend database
      await assistantService.createSubmission(activeTask.id, {
        file_url: uploadedFileUrl,
        submission_notes: noteContent
      })
      
      showToast('success', `Đã nộp thành công bản sửa đổi ${getNextVersionText()} cho Task #${activeTask.id}!`)
      
      // Clear Form & Reload
      setNoteContent('')
      setUploadedFile(null)
      setUploadedFileUrl('')
      
      await loadTasks()
      await loadTaskDetailsAndFeedbacks(activeTask.id)
    } catch (err: any) {
      console.error(err)
      showToast('error', `Gửi bản sửa đổi thất bại: ${err?.message || 'Lỗi hệ thống'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text })
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  const formatDate = (dateStr: string) => {
    try {
      return dateStr.split('-').reverse().join('/')
    } catch {
      return dateStr
    }
  }

  const getCommentsCountText = (taskId: string) => {
    // If it's the active task, we can use loaded activeFeedbacks length (excluding system notification)
    if (taskId === selectedTaskId) {
      const actualComments = activeFeedbacks.filter(fb => fb.avatar !== 'SYS')
      return `${actualComments.length} góp ý`
    }
    return 'Phản hồi'
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-16 font-sans relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce duration-300">
          <div className={`manga-border manga-shadow-sm p-4 flex items-center gap-3 bg-white ${
            toastMessage.type === 'success' ? 'border-emerald-500 text-emerald-800' : 'border-[#E63946] text-[#E63946]'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-[#E63946] shrink-0" />
            )}
            <div>
              <p className="font-manga text-sm font-black uppercase tracking-wider">
                {toastMessage.type === 'success' ? 'THÀNH CÔNG!' : 'CẢNH BÁO!'}
              </p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">{toastMessage.text}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="ml-2 hover:bg-gray-100 p-1 bg-transparent border-none">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-manga text-[36px] font-black uppercase text-manga-ink leading-tight tracking-wide flex items-center gap-3">
            PHẢN HỒI & NỘP LẠI
          </h1>
          <div className="h-1.5 w-32 bg-[#E63946] mt-2 shadow-[1px_1px_0px_rgba(0,0,0,1)]" />
          <p className="text-xs font-bold text-gray-500 mt-2">Xem xét chi tiết góp ý của nhóm sáng tạo và nộp lại bản sửa đổi hoàn thiện.</p>
        </div>
      </div>

      {isLoadingTasks ? (
        <div className="py-24 flex items-center justify-center flex-col gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#E63946]" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải danh sách nhiệm vụ...</span>
        </div>
      ) : (
        /* Main 3-Column Responsive Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1: NHIỆM VỤ CÓ PHẢN HỒI (Sidebar List) - 4/12 width */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white border-2 border-manga-ink p-3 shadow-none">
              <h2 className="font-manga text-sm font-black uppercase tracking-wider text-manga-ink">
                NHIỆM VỤ CẦN XỬ LÝ
              </h2>
            </div>

            <div className="flex flex-col gap-3 max-h-[680px] overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-300 p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-400">Không có nhiệm vụ cần phản hồi</p>
                </div>
              ) : (
                tasks.map((task) => {
                  const isActive = task.id === selectedTaskId
                  const status = getStatusConfig(task.status)
                  return (
                    <button
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id)
                        setUploadedFile(null)
                        setUploadedFileUrl('')
                      }}
                      className={`w-full text-left bg-white border-2 transition-all flex flex-col justify-between p-4 relative cursor-pointer outline-none ${
                        isActive 
                          ? 'border-[#E63946] shadow-[3px_3px_0px_0px_rgba(230,57,70,1)] scale-[1.01]' 
                          : 'border-manga-ink hover:border-[#E63946] hover:translate-y-[-1px] shadow-[2px_2px_0px_0px_rgba(15,15,15,1)] hover:shadow-[3px_3px_0px_0px_rgba(15,15,15,1)]'
                      }`}
                    >
                      {/* Card Header Info */}
                      <div className="flex items-center justify-between w-full gap-2 mb-2">
                        <span className="font-manga text-xs font-extrabold text-[#E63946]">
                          #{task.id}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 border ${status.text} ${status.bg} ${status.border} tracking-wide rounded-none`}>
                          {status.label}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="mb-3">
                        <h3 className="font-manga text-[15px] font-black text-manga-ink leading-tight truncate">
                          {task.seriesTitle}
                        </h3>
                        <p className="text-[11px] font-semibold text-gray-500 truncate mt-0.5">
                          {task.layerType} - Ch.{task.chapterNumber}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 mt-1 text-[10px] font-bold text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{formatDate(task.deadline)}</span>
                        </div>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 text-[9px] font-black">
                          {getCommentsCountText(task.id)}
                        </span>
                      </div>

                      {/* Active Indicator */}
                      {isActive && (
                        <div className="mt-2 text-[#E63946] text-[10px] font-black flex items-center gap-0.5 border-t border-red-100 pt-2 w-full animate-pulse">
                          <ChevronRight className="w-3 h-3 shrink-0" /> ĐANG XEM
                        </div>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Column 2: THÔNG TIN CHI TIẾT & TIẾN TRÌNH (Middle) - 3/12 width */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {isLoadingDetails ? (
              <div className="bg-white border-2 border-manga-ink p-8 text-center text-xs font-bold text-gray-400 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#E63946]" />
                <span>Đang tải thông tin...</span>
              </div>
            ) : activeTask ? (
              <>
                {/* Task Title Header Card */}
                <div className="bg-[#1C1C1F] text-white border-2 border-manga-ink p-4 shadow-[3px_3px_0px_rgba(15,15,15,1)]">
                  <p className="text-[10px] font-black text-red-400 tracking-wider">TASK #{activeTask.id}</p>
                  <h2 className="font-manga text-lg font-black mt-1 leading-tight tracking-wide">{activeTask.layerType}</h2>
                  <p className="text-xs font-semibold text-zinc-400 mt-1 truncate">{activeTask.seriesTitle} - Ch.{activeTask.chapterNumber}</p>
                </div>

                {/* Box 1: THÔNG TIN NHIỆM VỤ */}
                <div className="bg-white border-2 border-manga-ink p-4 shadow-[3px_3px_0px_rgba(15,15,15,1)] flex flex-col gap-3.5">
                  <h3 className="font-manga text-xs font-black uppercase tracking-wider text-manga-ink border-b-2 border-manga-ink pb-1.5 flex items-center justify-between">
                    <span>THÔNG TIN NHIỆM VỤ</span>
                  </h3>
                  
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-400">Loại:</span>
                      <span className="text-manga-ink">{activeTask.layerType}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-400">Deadline:</span>
                      <span className="text-manga-ink">{formatDate(activeTask.deadline)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold items-center">
                      <span className="text-gray-400">Còn lại:</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-none uppercase tracking-wide ${
                        getRemainingDaysText(activeTask).includes('Quá hạn')
                          ? 'bg-red-50 text-[#E63946] border border-red-200' 
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}>
                        {getRemainingDaysText(activeTask)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Box 1.5: BẢN VẼ & ĐIỂM LỖI */}
                {submissions.length > 0 && (
                  <div className="bg-white border-2 border-manga-ink p-4 shadow-[3px_3px_0px_rgba(15,15,15,1)] flex flex-col gap-2">
                    <h3 className="font-manga text-xs font-black uppercase tracking-wider text-manga-ink border-b-2 border-manga-ink pb-1.5">
                      BẢN VẼ & ĐIỂM LỖI
                    </h3>
                    <div className="relative border border-gray-200 bg-gray-100 overflow-hidden flex items-center justify-center">
                      <img
                        src={getImageUrl(submissions[0].file_url)}
                        alt="Latest Submission"
                        className="w-full h-auto object-contain block"
                      />
                      {parseMarkersFromComments().map((marker) => (
                        <div
                          key={marker.index}
                          className="absolute z-20"
                          style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 cursor-pointer transition-all ${
                              activeMarkerId === marker.index
                                ? 'bg-manga-red border-white text-white scale-110'
                                : 'bg-white border-manga-red text-[#E63946]'
                            }`}
                            onClick={() => setActiveMarkerId(activeMarkerId === marker.index ? null : marker.index)}
                            title={marker.text}
                          >
                            {marker.index}
                          </div>
                          {activeMarkerId === marker.index && (
                            <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-white text-zinc-800 border-2 border-manga-ink p-2 w-40 z-30 text-[10px] font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                              <p className="text-[9px] text-[#E63946] uppercase font-black">Lỗi #{marker.index}</p>
                              <p className="mt-0.5 leading-snug">{marker.text}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold text-center mt-1 uppercase">
                      Click vào các điểm tròn đỏ trên ảnh để xem chi tiết lỗi cần sửa
                    </p>
                  </div>
                )}

                {/* Box 2: TIẾN TRÌNH NỘP BÀI */}
                <div className="bg-white border-2 border-manga-ink p-4 shadow-[3px_3px_0px_rgba(15,15,15,1)] flex flex-col">
                  <h3 className="font-manga text-xs font-black uppercase tracking-wider text-manga-ink border-b-2 border-manga-ink pb-1.5 mb-4">
                    TIẾN TRÌNH NỘP BÀI
                  </h3>

                  {/* Vertical Timeline */}
                  <div className="flex flex-col relative pl-4 border-l-2 border-zinc-200 gap-6 my-2">
                    {activeTimeline.map((step, idx) => {
                      return (
                        <div key={idx} className="relative flex flex-col gap-0.5">
                          {/* Bullet point indicator */}
                          <div className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            step.active 
                              ? 'border-[#E63946] bg-[#E63946] shadow-[0_0_6px_rgba(230,57,70,0.5)] animate-pulse' 
                              : step.done 
                                ? 'border-[#E63946] bg-white' 
                                : 'border-zinc-300 bg-white'
                          }`}>
                            {step.active && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                            {!step.active && step.done && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E63946]" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-gray-400">{step.date}</span>
                            {step.label.includes('góp ý') && (
                              <span className="bg-red-50 text-[#E63946] px-1 text-[8px] font-black border border-red-200">REVISION</span>
                            )}
                          </div>
                          <p className={`text-xs font-bold leading-tight ${
                            step.done ? 'text-manga-ink' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border-2 border-manga-ink p-8 text-center text-xs font-bold text-gray-400">
                Hãy chọn nhiệm vụ để xem chi tiết
              </div>
            )}
          </div>

          {/* Column 3: NHẬN XÉT CHI TIẾT & FORM NỘP LẠI (Right) - 5/12 width */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {isLoadingDetails ? (
              <div className="bg-white border-2 border-manga-ink p-16 text-center text-xs font-bold text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
                <span>Đang tải thông tin phản hồi...</span>
              </div>
            ) : activeTask ? (
              <>
                {/* LATEST FEEDBACK messages */}
                <div className="bg-white border-2 border-manga-ink shadow-[3px_3px_0px_rgba(15,15,15,1)]">
                  {/* Section title header */}
                  <div className="bg-[#1C1C1F] text-white border-b-2 border-manga-ink p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-manga text-xs font-black uppercase tracking-wider">PHẢN HỒI CUỐI CÙNG</h3>
                      <span className="bg-gray-700 text-zinc-300 text-[8px] font-black px-1.5 py-0.5 rounded-none uppercase tracking-wide">
                        {getCommentsCountText(activeTask.id)}
                      </span>
                    </div>
                    <span className="bg-[#E63946] text-white font-manga text-[9px] font-black px-2 py-0.5 shadow-sm">
                      TASK #{activeTask.id}
                    </span>
                  </div>

                  {/* Comment list */}
                  <div className="p-4 flex flex-col gap-4 divide-y divide-zinc-100 max-h-[350px] overflow-y-auto">
                    {activeFeedbacks.map((comment, idx) => (
                      <div key={idx} className={`pt-4 first:pt-0 flex gap-3.5 items-start`}>
                        {/* Avatar initials with neo style */}
                        <div className="w-9 h-9 rounded-full bg-zinc-950 text-white font-black text-xs flex items-center justify-center shrink-0 border border-black shadow-sm bg-[#E63946]">
                          {comment.avatar}
                        </div>

                        {/* Comment body */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-manga-ink leading-none">{comment.author}</span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{comment.role}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[9px] text-gray-400 font-bold">{comment.timeAgo}</span>
                              {comment.isUrgent && (
                                <span className="bg-[#FFF5F5] text-[#E63946] border border-[#FFF5F5] px-1 py-0.5 text-[8px] font-black tracking-wider uppercase leading-none">URGENT</span>
                              )}
                              {comment.isApproved && (
                                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-1 py-0.5 text-[8px] font-black tracking-wider uppercase leading-none">APPROVED</span>
                              )}
                            </div>
                          </div>

                          {/* Content text */}
                          <div className="mt-2 bg-zinc-50/50 p-3 border border-zinc-100 text-xs font-medium text-gray-600 leading-relaxed break-words whitespace-pre-line">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NỘP BẢN SỬA ĐỔI FORM */}
                <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_rgba(15,15,15,1)]">
                  <h3 className="font-manga text-[15px] font-black uppercase tracking-wider text-manga-ink border-b-2 border-manga-ink pb-2 mb-4 flex items-center gap-2">
                    <Upload className="w-4.5 h-4.5 text-[#E63946]" /> NỘP BẢN SỬA ĐỔI – TASK #{activeTask.id}
                  </h3>

                  <form onSubmit={handleResubmit} className="flex flex-col gap-4">
                    {/* Note Textarea */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                        Ghi chú chỉnh sửa theo phản hồi <span className="text-[#E63946]">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Ghi chú các chi tiết bạn đã sửa theo đóng góp ý kiến (ví dụ: đã sửa biểu cảm Hiroshi ở panel 3...)"
                        className="w-full text-xs p-3 font-semibold text-gray-700 bg-zinc-50/50 border border-zinc-300 focus:outline-none focus:border-[#E63946] focus:bg-white resize-none transition-all placeholder:text-gray-400 font-sans"
                        required
                      />
                    </div>

                    {/* Info row: version */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                        Phiên bản nộp <span className="text-[#E63946]">*</span>
                      </label>
                      <input
                        type="text"
                        disabled
                        value={`${getNextVersionText()} (Đề xuất dựa trên lịch sử nộp)`}
                        className="w-full text-xs px-3 py-2 font-bold text-gray-400 bg-zinc-100 border border-zinc-300 cursor-not-allowed"
                      />
                    </div>

                    {/* Drag and Drop Zone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                        Đính kèm tệp bản sửa đổi <span className="text-[#E63946]">*</span>
                      </label>

                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".psd,.ai,.png,.jpg,.jpeg,.zip"
                        className="hidden"
                      />

                      <div 
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed border-zinc-300 hover:border-[#E63946] bg-zinc-50/30 hover:bg-red-50/5 p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                          uploadedFile ? 'border-emerald-500 bg-emerald-50/10' : ''
                        }`}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
                            <p className="text-xs font-bold text-[#E63946]">Đang tải tệp lên Cloudinary...</p>
                          </div>
                        ) : uploadedFile ? (
                          <>
                            <FileText className="w-10 h-10 text-emerald-500 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-emerald-700 truncate max-w-[250px]">{uploadedFile.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setUploadedFile(null)
                                setUploadedFileUrl('')
                              }}
                              className="bg-red-100 text-[#E63946] hover:bg-[#E63946] hover:text-white px-2 py-1 text-[9px] font-black mt-1 uppercase transition-colors shrink-0 cursor-pointer border-none"
                            >
                              Xóa tệp
                            </button>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 shrink-0 group-hover:scale-105 transition-transform" />
                            <p className="text-xs font-bold text-gray-700">Kéo thả hoặc click để đính kèm *</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                              Hỗ trợ tệp: .psd · .ai · .png · .jpg · .zip
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Form Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="w-full bg-[#E63946] hover:bg-white text-white hover:text-[#E63946] border-2 border-[#E63946] py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_rgba(15,15,15,1)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(15,15,15,1)] transition-all mt-2 active:scale-[0.98] disabled:opacity-65"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>ĐANG GỬI...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 shrink-0" />
                          <span>GỬI BẢN SỬA ĐỔI</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : null}
          </div>

        </div>
      )}
    </div>
  )
}
