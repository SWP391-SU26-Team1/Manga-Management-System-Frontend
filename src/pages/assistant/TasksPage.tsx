import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { 
  Search, 
  ChevronDown, 
  Download, 
  Edit2, 
  Eye, 
  Check, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  X,
  PenTool,
  FileText,
  MessageSquare,
  Save,
  FileDown,
  CheckCircle2,
  Send,
  AlertTriangle,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  User,
  Paperclip,
  Upload,
  Loader2
} from 'lucide-react'
import { AssistantTask } from '@/data/assistantMockData'
import assistantService, { PageTask } from '@/services/assistant.service'
import uploadService from '@/services/upload.service'
import TaskDetailModal from '@/components/assistant/TaskDetailModal'
import userService from '@/services/user.service'

const getTaskTypeName = (type: string) => {
  if (!type) return 'NHIỆM VỤ'
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
    note: (task as any).content || task.description || '',
    referenceUrl: task.page?.image_url || undefined,
    regionId: (task as any).region_id || undefined,
    createdAt: task.created_at || '',
    assignedById: task.users?.user_id || '',
  }
}

export default function TasksPage() {
  const navigate = useNavigate()
  
  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop'
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    return `${apiURL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showToast('success', `Đã tải về thành công file ${filename}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback to open in new tab if CORS or other error occurs
      window.open(url, '_blank');
      showToast('success', `Đã mở link tải file trong tab mới`);
    }
  };

  const [tasks, setTasks] = useState<AssistantTask[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // Modal State for EDIT (SỬA) action
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<AssistantTask | null>(null)

  // Modal State for SUBMIT (NỘP) action
  const [submittingTask, setSubmittingTask] = useState<AssistantTask | null>(null)
  const [submitNotes, setSubmitNotes] = useState('')
  const [submitVersion, setSubmitVersion] = useState('v1.0')
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null)

  // Modal State for DOWNLOAD (TẢI FILE) action
  const [downloadingTask, setDownloadingTask] = useState<AssistantTask | null>(null)
  
  // Canvas Workspace State for VIEW (VIEW) action
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null)
  const [viewingTaskDetail, setViewingTaskDetail] = useState<any | null>(null)
  const [zoomLevel, setZoomLevel] = useState(55) // Default 55% from figma mockup
  const [activeTab, setActiveTab] = useState<'info' | 'feedback' | 'resources'>('info')
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(true)
  
  // Checklist item labels
  const CHECKLIST_ITEMS = [
    'Đọc kỹ brief & yêu cầu nhiệm vụ',
    'Tải đầy đủ file nguồn & tài nguyên',
    'Hoàn thành phần việc chính',
    'Tự kiểm tra chất lượng',
    'Chuẩn bị file nộp đúng định dạng',
    'Nộp bài và báo cáo tiến độ'
  ]

  // Checklist states: Record<taskId, boolean[]>
  const [checklistStates, setChecklistStates] = useState<Record<string, boolean[]>>(() => {
    const saved = localStorage.getItem('assistant_task_checklists')
    return saved ? JSON.parse(saved) : {}
  })

  // Progress notes: Record<taskId, string>
  const [progressNotes, setProgressNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('assistant_task_notes')
    return saved ? JSON.parse(saved) : {}
  })

  // Current editing progress note text in modal
  const [editingNote, setEditingNote] = useState('')
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'In Progress' | 'Not Started' | 'Submitted' | 'Need Fix' | 'Approved'>('ALL')
  const [sortByDeadline, setSortByDeadline] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [assignedUsers, setAssignedUsers] = useState<Record<string, { fullName: string; avatarUrl?: string }>>({})

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, sortByDeadline])

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadTasksData()
  }, [])

  useEffect(() => {
    if (!viewingTaskId) {
      setViewingTaskDetail(null)
      return
    }
    const loadDetail = async () => {
      try {
        const detail = await assistantService.getTaskDetail(viewingTaskId)
        
        // Load submissions and feedbacks associated with submissions
        try {
          const subs = await assistantService.listTaskSubmissions(viewingTaskId)
          if (subs && subs.length > 0) {
            const promises = subs.map(s => 
              assistantService.listSubmissionFeedbacks(s.submission_id)
                .catch(() => [] as any[])
            )
            const results = await Promise.all(promises)
            detail.feedbacks = results.flat().sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          }
        } catch (subErr) {
          console.error("Failed to load submission feedbacks for task detail:", subErr)
        }
        
        setViewingTaskDetail(detail)
      } catch (err) {
        console.error("Error loading viewing task detail:", err)
      }
    }
    loadDetail()
  }, [viewingTaskId])

  const loadAvatars = async (mappedTasks: AssistantTask[]) => {
    const userIds = Array.from(new Set(mappedTasks.map(t => t.assignedById).filter(Boolean))) as string[]
    for (const uid of userIds) {
      if (!assignedUsers[uid]) {
        try {
          const profile = await userService.getUserById(uid)
          setAssignedUsers(prev => ({
            ...prev,
            [uid]: {
              fullName: profile.fullName || profile.username,
              avatarUrl: profile.avatarUrl
            }
          }))
        } catch (err) {
          console.error("Failed to load user profile:", uid, err)
        }
      }
    }
  }

  const loadTasksData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await assistantService.listMyTasks()
      if (res && res.success) {
        const mapped = res.data.map(mapBackendTaskToAssistantTask)
        setTasks(mapped)
        loadAvatars(mapped)
      } else {
        setTasks([])
      }
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError("Không thể kết nối danh sách nhiệm vụ từ backend API.")
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }
  
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  
  const totalTasks = safeTasks.length
  const inProgressTasks = safeTasks.filter(t => t?.status === 'In Progress').length
  const pendingTasks = safeTasks.filter(t => t?.status === 'Not Started').length
  const reviewTasks = safeTasks.filter(t => t?.status === 'Submitted').length
  const revisionTasks = safeTasks.filter(t => t?.status === 'Need Fix').length
  const approvedTasks = safeTasks.filter(t => t?.status === 'Approved').length

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Urgent':
      case 'High': return 'text-[#E63946]'
      case 'Medium': return 'text-[#F4A261]'
      case 'Low': return 'text-[#A0AEC0]'
      default: return 'text-gray-400'
    }
  }

  const getPriorityText = (priority?: string) => {
    if (!priority) return 'UNASSIGNED';
    switch (priority) {
      case 'Urgent': return 'KHẨN CẤP'
      case 'High': return 'CAO'
      case 'Medium': return 'TRUNG BÌNH'
      case 'Low': return 'THẤP'
      default: return priority.toUpperCase()
    }
  }


  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Approved':
        return <span className="bg-[#E6FFFA] text-[#38B2AC] px-2 py-1 text-[10px] font-bold uppercase tracking-wider">APPROVED</span>
      case 'In Progress':
        return <span className="bg-[#EBF8FF] text-[#4299E1] px-2 py-1 text-[10px] font-bold uppercase tracking-wider">IN PROGRESS</span>
      case 'Submitted':
        return <span className="bg-[#FAF5FF] text-[#9F7AEA] px-2 py-1 text-[10px] font-bold uppercase tracking-wider">REVIEW</span>
      case 'Need Fix':
        return <span className="bg-[#FFF5F5] text-[#F56565] px-2 py-1 text-[10px] font-bold uppercase tracking-wider">REVISION</span>
      case 'Not Started':
        return <span className="bg-[#FFFDF0] text-[#D69E2E] px-2 py-1 text-[10px] font-bold uppercase tracking-wider">CHỜ NHẬN</span>
      default:
        return <span className="bg-gray-100 text-gray-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">{status || 'UNKNOWN'}</span>
    }
  }

  const getActionButton = (task: AssistantTask) => {
    switch (task.status) {
      case 'Approved':
        return (
          <button 
            onClick={() => handleOpenModal(task)}
            className="w-full flex items-center justify-center gap-1 mt-1.5 px-2 py-1 text-[10px] font-bold text-[#38B2AC] border border-[#38B2AC] hover:bg-[#E6FFFA] transition-colors cursor-pointer bg-white"
          >
            <Check className="w-3 h-3" /> ĐÃ DUYỆT
          </button>
        )
      case 'In Progress':
        return (
          <button 
            onClick={() => handleOpenSubmitModal(task)}
            className="w-full mt-1.5 px-2 py-1 text-[10px] font-bold text-white bg-[#E63946] border border-[#E63946] hover:bg-white hover:text-[#E63946] transition-colors cursor-pointer"
          >
            NỘP
          </button>
        )
      case 'Not Started':
        return (
          <button 
            onClick={() => handleAcceptTask(task)}
            className="w-full mt-1.5 px-2 py-1 text-[10px] font-bold text-white bg-amber-500 border border-amber-500 hover:bg-white hover:text-amber-500 transition-colors cursor-pointer"
          >
            NHẬN
          </button>
        )
      case 'Submitted':
        return (
          <button 
            onClick={() => handleOpenModal(task)}
            className="w-full mt-1.5 px-2 py-1 text-[10px] font-bold text-[#9F7AEA] border border-[#9F7AEA] hover:bg-[#FAF5FF] transition-colors cursor-pointer bg-white"
          >
            CHỜ DUYỆT
          </button>
        )
      case 'Need Fix':
        return (
          <button 
            onClick={() => handleOpenModal(task)}
            className="w-full mt-1.5 px-2 py-1 text-[10px] font-bold text-[#F56565] border border-[#F56565] hover:bg-[#FFF5F5] transition-colors cursor-pointer bg-white"
          >
            SỬA LẠI
          </button>
        )
      default:
        return null
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return dateStr.split('-').reverse().join('/');
    } catch {
      return dateStr;
    }
  }

  const formatTimelineDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const dateOnly = dateStr.split('T')[0]
      return dateOnly.split('-').reverse().join('/')
    } catch {
      return dateStr
    }
  }

  // Handle opening EDIT details modal
  const handleOpenModal = (task: AssistantTask) => {
    setSelectedTaskForModal(task)
    
    // Initialize checklist if not exists
    if (!checklistStates[task.id]) {
      const defaultChecked = task.status === 'Approved' 
        ? [true, true, true, true, true, true] 
        : task.status === 'Submitted'
          ? [true, true, true, true, true, false]
          : [true, true, false, false, false, false]
      
      const newChecklists = { ...checklistStates, [task.id]: defaultChecked }
      setChecklistStates(newChecklists)
      localStorage.setItem('assistant_task_checklists', JSON.stringify(newChecklists))
    }

    setEditingNote(progressNotes[task.id] || '')
  }

  // Handle toggle checklist item
  const handleToggleChecklist = (taskId: string, index: number) => {
    const current = checklistStates[taskId] || [false, false, false, false, false, false]
    const updated = [...current]
    updated[index] = !updated[index]
    
    const newChecklists = { ...checklistStates, [taskId]: updated }
    setChecklistStates(newChecklists)
    localStorage.setItem('assistant_task_checklists', JSON.stringify(newChecklists))
  }

  // Handle saving notes
  const handleSaveNotes = (taskId: string) => {
    const newNotes = { ...progressNotes, [taskId]: editingNote }
    setProgressNotes(newNotes)
    localStorage.setItem('assistant_task_notes', JSON.stringify(newNotes))
    showToast('success', 'Đã lưu ghi chú tiến độ thành công!')
  }

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text })
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Navigate to Feedback page and select the task
  const handleViewFeedbackPage = (taskId: string) => {
    setSelectedTaskForModal(null)
    setViewingTaskId(null)
    navigate('/dashboard/assistant/feedback', { state: { selectedTaskId: taskId } })
  }

  // Open submission modal
  const handleOpenSubmitModal = (task: AssistantTask) => {
    setSubmittingTask(task)
    setSubmitNotes('')
    setSubmitVersion('v1.5') // we can default to v1.5 or v1.0, figma screenshot says v1.0 but maybe task version is higher. Let's do v1.0.
    setAttachedFile(null)
  }

  // Handle final submission in the modal
  const handleSubmitResult = async (taskId: string) => {
    if (!uploadedFileUrl) {
      showToast('error', 'Vui lòng đính kèm file kết quả!')
      return
    }
    setIsSubmitting(true)
    try {
      await assistantService.createSubmission(taskId, {
        file_url: uploadedFileUrl,
        submission_notes: submitNotes
      })
      loadTasksData()
      setSubmittingTask(null)
      showToast('success', `Nộp kết quả thành công cho Task #${taskId}!`)
    } catch (err: any) {
      console.error(err)
      showToast('error', `Lỗi: ${err?.message || 'Không thể nộp kết quả'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle uploading files for submission
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingFile(true)
    try {
      const res = await uploadService.uploadSingle(file, 'submissions')
      setUploadedFileUrl(res.secure_url)
      setAttachedFile({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` })
      showToast('success', 'Đã tải file lên Cloudinary thành công!')
    } catch (err: any) {
      console.error(err)
      showToast('error', 'Không thể tải file lên Cloudinary.')
    } finally {
      setIsUploadingFile(false)
    }
  }

  // Submit revision / open submit modal from edit modal
  const handleModalSubmitAction = (task: AssistantTask) => {
    setSelectedTaskForModal(null)
    handleOpenSubmitModal(task)
  }

  // Accept task handler for the drawing workspace
  const handleAcceptTask = async (task: AssistantTask) => {
    try {
      await assistantService.startTask(task.id)
      loadTasksData() // refresh tasks in table and view
      showToast('success', `Đã nhận thành công Nhiệm vụ #${task.id}! Bắt đầu vẽ nào.`)
    } catch (err: any) {
      console.error(err)
      showToast('error', `Lỗi: ${err?.message || 'Không thể nhận nhiệm vụ'}`)
    }
  }

  // Get status color config for modal
  const getStatusConfigForModal = (status: AssistantTask['status']) => {
    switch (status) {
      case 'Approved':
        return { label: 'ĐÃ DUYỆT', bg: 'bg-[#E6FFFA]', text: 'text-[#38B2AC]', border: 'border-[#38B2AC]' }
      case 'Submitted':
        return { label: 'REVIEW', bg: 'bg-[#FAF5FF]', text: 'text-[#9F7AEA]', border: 'border-[#9F7AEA]' }
      case 'Need Fix':
        return { label: 'REVISION', bg: 'bg-[#FFF5F5]', text: 'text-[#F56565]', border: 'border-[#F56565]' }
      default:
        return { label: 'IN PROGRESS', bg: 'bg-[#EBF8FF]', text: 'text-[#4299E1]', border: 'border-[#4299E1]' }
    }
  }

  // Get dot color for priority
  const getPriorityDotColor = (priority?: string) => {
    switch (priority) {
      case 'Urgent':
      case 'High': return 'bg-[#E63946]'
      case 'Medium': return 'bg-[#F4A261]'
      case 'Low': return 'bg-[#A0AEC0]'
      default: return 'bg-gray-400'
    }
  }

  // Remaining days label helper for modal
  const getRemainingDaysText = (task: AssistantTask) => {
    if (task.id === '1042') return 'Còn 5 ngày'
    if (task.id === '1040') return 'Đã quá hạn'
    if (task.id === '1051') return 'Đã quá hạn'
    if (task.id === '1039') return 'Còn 1 ngày'

    const deadlineDate = new Date(task.deadline)
    const today = new Date('2026-06-09')
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return `Quá hạn ${Math.abs(diffDays)} ngày`
    } else if (diffDays === 0) {
      return 'Hạn hôm nay'
    } else {
      return `Còn ${diffDays} ngày`
    }
  }

  // Filtering logic
  const filteredTasks = safeTasks.filter(task => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch = 
      task.id.toLowerCase().includes(query) ||
      task.seriesTitle.toLowerCase().includes(query) ||
      task.layerType.toLowerCase().includes(query)
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'In Progress' && task.status === 'In Progress') ||
      (statusFilter === 'Not Started' && task.status === 'Not Started') ||
      (statusFilter === 'Submitted' && task.status === 'Submitted') ||
      (statusFilter === 'Need Fix' && task.status === 'Need Fix') ||
      (statusFilter === 'Approved' && task.status === 'Approved')
      
    return matchesSearch && matchesStatus
  })

  // Sorting logic
  if (sortByDeadline) {
    filteredTasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  } else {
    filteredTasks.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      if (dateB !== dateA) return dateB - dateA
      return b.id.localeCompare(a.id)
    })
  }

  const displayTasks = filteredTasks.slice((currentPage - 1) * 10, currentPage * 10);

  // Get current active viewed task for drawing workspace
  const viewedTask = safeTasks.find(t => t.id === viewingTaskId)

  return (
    <div className={`max-w-[1400px] mx-auto pb-12 font-sans ${viewingTaskId ? '' : 'relative'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[60] animate-bounce duration-300">
          <div className="manga-border manga-shadow-sm p-4 flex items-center gap-3 bg-white border-emerald-500 text-emerald-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p className="font-manga text-sm font-black uppercase tracking-wider">THÀNH CÔNG!</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">{toastMessage.text}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="ml-2 hover:bg-gray-100 p-1 bg-transparent border-none">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Main View: Tasks List OR Canvas Workspace (Figma Mode) */}
      {!viewingTaskId ? (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="font-manga text-[32px] font-bold uppercase text-manga-ink leading-tight">
                DANH SÁCH NHIỆM VỤ
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-1">
                Quản lý và theo dõi tất cả nhiệm vụ được giao
              </p>
            </div>
            <button className="text-gray-400 border-2 border-gray-200 px-4 py-2 font-bold uppercase text-xs flex items-center gap-2 hover:text-manga-ink hover:border-manga-ink transition-colors bg-white cursor-not-allowed opacity-50">
              <span className="text-lg leading-none mb-0.5">+</span> NHIỆM VỤ MỚI
            </button>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-5 gap-0 mb-6 border-2 border-manga-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
            <div className="p-4 border-r-2 border-manga-ink flex flex-col justify-center">
              <div className="font-manga text-[32px] leading-none font-bold text-manga-ink">{totalTasks}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">Tổng nhiệm vụ</div>
            </div>
            <div className="p-4 border-r-2 border-manga-ink flex flex-col justify-center bg-white">
              <div className="font-manga text-[32px] leading-none font-bold text-[#4299E1]">{inProgressTasks}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">Đang thực hiện</div>
            </div>
            <div className="p-4 border-r-2 border-manga-ink flex flex-col justify-center bg-white">
              <div className="font-manga text-[32px] leading-none font-bold text-[#D69E2E]">{pendingTasks}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">Chờ nhận việc</div>
            </div>
            <div className="p-4 border-r-2 border-manga-ink flex flex-col justify-center bg-white">
              <div className="font-manga text-[32px] leading-none font-bold text-[#F56565]">{revisionTasks}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">Cần sửa đổi</div>
            </div>
            <div className="p-4 flex flex-col justify-center bg-white">
              <div className="font-manga text-[32px] leading-none font-bold text-[#38B2AC]">{approvedTasks}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">Đã duyệt</div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 flex-wrap flex-1">
              {/* Search Box */}
              <div className="relative w-64 border-2 border-manga-ink shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white flex-shrink-0">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm Task ID, manga, loại..." 
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none bg-transparent placeholder:text-gray-400"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
                <span className="text-xs font-bold text-gray-500 uppercase hidden sm:block">Trạng thái:</span>
                
                <div className="flex flex-wrap gap-1">
                  <button 
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase border-2 transition-colors cursor-pointer ${
                      statusFilter === 'ALL' ? 'bg-[#E63946] text-white border-[#E63946]' : 'bg-white text-gray-500 border-gray-200 hover:text-manga-ink hover:border-manga-ink'
                    }`}
                  >
                    TẤT CẢ ({totalTasks})
                  </button>
                  <button 
                    onClick={() => setStatusFilter('In Progress')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase border-2 transition-colors cursor-pointer ${
                      statusFilter === 'In Progress' ? 'bg-[#E63946] text-white border-[#E63946]' : 'bg-white text-gray-500 border-gray-200 hover:text-manga-ink hover:border-manga-ink'
                    }`}
                  >
                    IN PROGRESS ({inProgressTasks})
                  </button>
                  <button 
                    onClick={() => setStatusFilter('Not Started')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase border-2 transition-colors cursor-pointer ${
                      statusFilter === 'Not Started' ? 'bg-[#E63946] text-white border-[#E63946]' : 'bg-white text-gray-500 border-gray-200 hover:text-manga-ink hover:border-manga-ink'
                    }`}
                  >
                    CHỜ NHẬN ({pendingTasks})
                  </button>
                  <button 
                    onClick={() => setStatusFilter('Submitted')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase border-2 transition-colors cursor-pointer ${
                      statusFilter === 'Submitted' ? 'bg-[#E63946] text-white border-[#E63946]' : 'bg-white text-gray-500 border-gray-200 hover:text-manga-ink hover:border-manga-ink'
                    }`}
                  >
                    REVIEW ({reviewTasks})
                  </button>
                  <button 
                    onClick={() => setStatusFilter('Need Fix')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase border-2 transition-colors cursor-pointer ${
                      statusFilter === 'Need Fix' ? 'bg-[#E63946] text-white border-[#E63946]' : 'bg-white text-gray-500 border-gray-200 hover:text-manga-ink hover:border-manga-ink'
                    }`}
                  >
                    REVISION ({revisionTasks})
                  </button>
                  <button 
                    onClick={() => setStatusFilter('Approved')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase border-2 transition-colors cursor-pointer ${
                      statusFilter === 'Approved' ? 'bg-[#E63946] text-white border-[#E63946]' : 'bg-white text-gray-500 border-gray-200 hover:text-manga-ink hover:border-manga-ink'
                    }`}
                  >
                    APPROVED ({approvedTasks})
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <button 
                onClick={() => setSortByDeadline(!sortByDeadline)}
                className="flex items-center justify-between gap-4 bg-white border-2 border-manga-ink px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <span className="flex items-center gap-1">
                  <span className="text-manga-ink">⇅ Sắp xếp: {sortByDeadline ? 'Deadline gần nhất' : 'Mới nhất trước'}</span>
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border-2 border-manga-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
            {displayTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-bold">
                Không tìm thấy nhiệm vụ nào thỏa mãn bộ lọc.
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#1A1A1A] text-white text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold border-r border-gray-700">TASK ID</th>
                    <th className="py-3 px-4 font-bold border-r border-gray-700">MANGA TITLE</th>
                    <th className="py-3 px-4 font-bold border-r border-gray-700">LOẠI NHIỆM VỤ</th>
                    <th className="py-3 px-4 font-bold border-r border-gray-700">DEADLINE</th>
                    <th className="py-3 px-4 font-bold border-r border-gray-700 text-center">TRẠNG THÁI</th>
                    <th className="py-3 px-4 font-bold border-r border-gray-700 text-center">ƯU TIÊN</th>
                    <th className="py-3 px-4 font-bold border-r border-gray-700 text-center">TÀI NGUYÊN</th>
                    <th className="py-3 px-4 font-bold text-center">HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-t-2 border-manga-ink">
                  {displayTasks.map(task => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors group border-b border-gray-200">
                      <td className="py-4 px-4 font-bold text-[#E63946] text-xs">#{task.id}</td>
                      <td className="py-4 px-4 font-bold text-manga-ink text-xs">{task.seriesTitle}</td>
                      <td className="py-4 px-4 text-gray-500 font-medium text-xs">{task.layerType}</td>
                      <td className="py-4 px-4 text-xs font-semibold text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(task.deadline)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(task.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`text-[12px] leading-none ${getPriorityColor(task.priority)}`}>●</span>
                          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{getPriorityText(task.priority)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={() => setDownloadingTask(task)}
                          className="bg-[#1A1A1A] text-white px-3 py-1.5 text-[10px] font-bold flex items-center justify-center gap-1.5 mx-auto hover:bg-[#E63946] transition-colors border border-[#1A1A1A] cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> TẢI FILE
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col items-center gap-1.5 w-[90px] mx-auto">
                          <div className="flex items-center justify-center gap-1 w-full">
                            <button 
                              onClick={() => handleOpenModal(task)}
                              className="flex-1 flex items-center justify-center gap-1 py-1 border border-gray-300 text-manga-ink hover:bg-gray-100 hover:border-manga-ink transition-colors bg-white cursor-pointer" 
                              title="Sửa"
                            >
                              <Edit2 className="w-3 h-3" /> <span className="text-[9px] font-bold">SỬA</span>
                            </button>
                            <button 
                              onClick={() => setViewingTaskId(task.id)}
                              className="flex-1 flex items-center justify-center gap-1 py-1 border border-gray-300 text-manga-ink hover:bg-gray-100 hover:border-manga-ink transition-colors bg-white cursor-pointer" 
                              title="Xem"
                            >
                              <Eye className="w-3 h-3" /> <span className="text-[9px] font-bold">VIEW</span>
                            </button>
                          </div>
                          {getActionButton(task)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination Footer */}
            <div className="bg-white border-t-2 border-manga-ink p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-semibold text-gray-500">
                Hiển thị {filteredTasks.length === 0 ? 0 : (currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, filteredTasks.length)} / {filteredTasks.length} nhiệm vụ
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 flex items-center justify-center border border-gray-300 text-gray-500 hover:bg-gray-50 bg-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.ceil(filteredTasks.length / 10) }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 flex items-center justify-center font-bold text-xs border cursor-pointer ${
                      currentPage === i + 1 
                        ? 'bg-[#E63946] text-white border-[#E63946]' 
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredTasks.length / 10)))}
                  disabled={currentPage === Math.ceil(filteredTasks.length / 10) || Math.ceil(filteredTasks.length / 10) === 0}
                  className="w-7 h-7 flex items-center justify-center border border-gray-300 text-gray-500 hover:bg-gray-50 bg-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* CANVAS WORKSPACE VIEW (Figma screen mockup) */
        (() => {
          const task = viewedTask || safeTasks[0];
          if (!task) return null;
          
          const currentRegionIndex = viewingTaskDetail?.regions?.findIndex((r: any) => r.region_id === task.regionId) ?? -1;
          const regionLabel = currentRegionIndex !== -1 ? `Vùng ${currentRegionIndex + 1}` : 'Vùng nhiệm vụ';
          
          // Status labels translated to match mockup
          const getStatusText = (status: AssistantTask['status']) => {
            switch (status) {
              case 'Not Started': return 'CHỜ NHẬN'
              case 'In Progress': return 'ĐANG LÀM'
              case 'Submitted': return 'REVIEW'
              case 'Need Fix': return 'CẦN SỬA'
              case 'Approved': return 'ĐÃ DUYỆT'
              default: return 'CHỜ NHẬN'
            }
          }
          const isNotStarted = task.status === 'Not Started';
          const isApproved = task.status === 'Approved';
          const isSubmitted = task.status === 'Submitted';
          
          const statusText = getStatusText(task.status);


          return (
            <div className="absolute inset-0 bg-[#141416] flex flex-col font-sans text-white select-none z-30 overflow-hidden">
              
              {/* Top Control Bar */}
              <div className="bg-[#1C1C1F] border-b-4 border-manga-ink p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0 z-10">
                {/* Left section: Breadcrumbs & Back */}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setViewingTaskId(null)}
                    className="flex items-center gap-1.5 bg-[#2A2A2E] hover:bg-[#E63946] hover:text-white text-zinc-300 font-black px-3 py-1.5 border border-zinc-700 hover:border-black transition-all cursor-pointer text-[10px] uppercase tracking-wider rounded-none"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Nhiệm vụ
                  </button>
                  
                  <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[11px]">
                    <span className="truncate">{task.seriesTitle}</span>
                    <span>&gt;</span>
                    <span className="truncate">Chương: Ch.{task.chapterNumber}</span>
                    <span>&gt;</span>
                    <span className="text-white">Trang {task.pageNumber}</span>
                  </div>

                  <span className={`text-[9px] font-black px-2 py-0.5 text-black rounded-none ${
                    task.status === 'Not Started' ? 'bg-[#F4A261]' :
                    task.status === 'In Progress' ? 'bg-[#4299E1] text-white' :
                    task.status === 'Need Fix' ? 'bg-[#E63946] text-white' :
                    task.status === 'Submitted' ? 'bg-[#9F7AEA] text-white' :
                    'bg-[#38B2AC] text-white'
                  }`}>
                    {statusText}
                  </span>
                </div>

                {/* Right section: Zoom controls & Mode selectors */}
                <div className="flex items-center gap-4">
                  {/* Zoom controls */}
                  <div className="flex items-center bg-[#2A2A2E] border border-zinc-700 overflow-hidden text-[11px] font-bold">
                    <button 
                      onClick={() => setZoomLevel(prev => Math.max(30, prev - 5))}
                      className="p-1.5 hover:bg-[#E63946] transition-colors cursor-pointer text-zinc-300 hover:text-white"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-white border-x border-zinc-700 py-1 font-mono text-[10px]">
                      {zoomLevel}%
                    </span>
                    <button 
                      onClick={() => setZoomLevel(prev => Math.min(150, prev + 5))}
                      className="p-1.5 hover:bg-[#E63946] transition-colors cursor-pointer text-zinc-300 hover:text-white"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Mode buttons */}
                  <div className="flex gap-1.5 font-black text-[10px] tracking-wider uppercase">
                    <button className="bg-[#E63946] text-white px-3 py-1.5 border border-black cursor-default">
                      VÙNG
                    </button>
                    <button className="bg-transparent border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 px-3 py-1.5 cursor-pointer">
                      KHÁC
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Workspace split panel */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* Left Area: Drawings sketch canvas sheet */}
                <div className="flex-1 bg-[#141416] overflow-auto flex items-center justify-center p-8 relative">
                  
                  {/* Canvas scale wrapper */}
                  <div 
                    className="origin-center transition-all duration-150 ease-out shrink-0"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                  >
                    {/* Drawing White Sheet (600x880px) */}
                    <div className="w-[600px] h-[880px] bg-white text-black border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col p-0">
                      {task.referenceUrl ? (
                        <div className="relative w-full h-full bg-zinc-50 select-none">
                          <img 
                            src={getImageUrl(task.referenceUrl)} 
                            alt="Reference Page Draft" 
                            className="w-full h-full object-fill pointer-events-none select-none"
                            draggable={false}
                          />

                          {/* Render regions */}
                          {viewingTaskDetail?.regions
                            ?.filter((r: any) => r.page_id === viewingTaskDetail.page_id)
                            ?.map((r: any, idx: number) => {
                            const rx = r.coordinates?.x ?? r.x ?? 0
                            const ry = r.coordinates?.y ?? r.y ?? 0
                            const rw = r.coordinates?.w ?? r.coordinates?.width ?? r.width ?? 0
                            const rh = r.coordinates?.h ?? r.coordinates?.height ?? r.height ?? 0
                            
                            // Check if this region belongs to the current task
                            const isCurrentTaskRegion = r.region_id === task.regionId
                            const isNearTop = ry < 7
                            const isTooShort = rh < 6
                            const verticalClass = isNearTop
                              ? (isTooShort ? 'top-full mt-0.5' : 'top-0')
                              : '-top-6'
                            
                            return (
                              <div
                                key={r.region_id}
                                className={`absolute border-2 ${
                                  isCurrentTaskRegion 
                                    ? 'border-[#E63946] bg-[#E63946]/20 z-20 shadow-[0_0_8px_rgba(230,57,70,0.5)]' 
                                    : 'border-zinc-400 border-dashed bg-zinc-400/5 z-10'
                                }`}
                                style={{
                                  left: `${rx}%`,
                                  top: `${ry}%`,
                                  width: `${rw}%`,
                                  height: `${rh}%`
                                }}
                              >
                                <div className={`absolute ${verticalClass} left-[-2px] text-white text-[9px] font-black uppercase tracking-wider py-0.5 px-1.5 border border-black z-30 ${
                                  isCurrentTaskRegion ? 'bg-[#E63946]' : 'bg-zinc-500'
                                }`}>
                                  {`Vùng ${idx + 1}`}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <>
                          {/* Top Sketch Panel (Art Task) */}
                          <div className="flex-1 border-4 border-black relative bg-[#FAF9F6] p-4 flex flex-col justify-between overflow-hidden">
                            
                            {/* Art task highlighted outline */}
                            <div className="absolute inset-0 border-[6px] border-[#E63946] pointer-events-none animate-pulse duration-1000" />
                            
                            {/* Figma Art Task badge */}
                            <div className="absolute top-2 left-2 bg-[#E63946] text-white text-[9px] font-black uppercase tracking-wider py-1 px-2.5 flex items-center gap-1 border border-black z-20">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" /> Art Task
                            </div>

                            {/* Top panel sketch detail */}
                            <div className="w-full h-full flex flex-col items-center justify-center relative mt-3">
                              {/* Character 1 Oval sketch */}
                              <div className="absolute left-1/4 top-1/4 flex flex-col items-center">
                                <div className="w-20 h-28 border-4 border-zinc-300 rounded-full flex items-center justify-center bg-white shadow-sm">
                                  <div className="w-4 h-4 border-2 border-zinc-300 rounded-full" />
                                </div>
                                <div className="h-16 w-1 border-2 border-zinc-300 mt-[-2px]" />
                                <div className="w-16 h-0.5 border border-zinc-300 mt-2 rotate-12" />
                              </div>

                              {/* Character 2 Oval sketch */}
                              <div className="absolute right-1/4 top-1/4 flex flex-col items-center">
                                <div className="w-20 h-28 border-4 border-zinc-300 rounded-full flex items-center justify-center bg-white shadow-sm">
                                  <div className="w-4 h-4 border-2 border-zinc-300 rounded-full" />
                                </div>
                                <div className="h-16 w-1 border-2 border-zinc-300 mt-[-2px]" />
                                <div className="w-16 h-0.5 border border-zinc-300 mt-2 -rotate-12" />
                              </div>

                              {/* Speech bubble */}
                              <div className="absolute top-8 right-8 bg-white border-2 border-zinc-350 p-2.5 rounded-full text-[10px] font-bold text-zinc-400 shadow-sm max-w-[100px] text-center leading-tight">
                                "... Cám ơn..."
                              </div>
                            </div>

                            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-350 select-none">PANEL 1 - DETAIL DRAWING</div>
                          </div>

                          {/* Bottom split panels */}
                          <div className="h-1/3 flex gap-4">
                            {/* Bottom Left Panel (Close up of eye) */}
                            <div className="w-1/2 border-4 border-black bg-[#FAF9F6] p-4 flex flex-col justify-between relative overflow-hidden">
                              {/* Eye sketch drawing */}
                              <div className="w-full h-full flex items-center justify-center relative">
                                <div className="w-24 h-12 border-4 border-zinc-350 rounded-full relative flex items-center justify-center overflow-hidden">
                                  <div className="w-8 h-8 border-4 border-zinc-700 bg-zinc-900 rounded-full" />
                                  {/* Eye reflection */}
                                  <div className="w-2 h-2 bg-white rounded-full absolute top-3 left-10" />
                                </div>
                              </div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-350 select-none">PANEL 2 - CLOSEUP EYE</div>
                            </div>

                            {/* Bottom Right Panel (Side character) */}
                            <div className="w-1/2 border-4 border-black bg-[#FAF9F6] p-4 flex flex-col justify-between relative overflow-hidden">
                              {/* Sketch ovals */}
                              <div className="w-full h-full flex items-center justify-center relative">
                                <div className="flex flex-col items-center">
                                  <div className="w-14 h-20 border-4 border-zinc-300 rounded-full bg-white shadow-sm" />
                                  <div className="h-10 w-0.5 border border-zinc-300 mt-[-2px]" />
                                </div>
                              </div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-350 select-none">PANEL 3 - SIDE SKETCH</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Area: Sidebar details panel */}
                <div className="w-full md:w-96 bg-white border-l-4 border-manga-ink text-black flex flex-col justify-between overflow-y-auto shrink-0 z-10">
                  
                  {/* Task details metadata section */}
                  <div className="p-5 flex flex-col border-b-2 border-zinc-200 gap-4">
                    {/* Header */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-manga text-[13px] font-black text-[#E63946] tracking-wider uppercase">
                          #{task.id}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 border tracking-wide rounded-none ${
                          task.status === 'Not Started' ? 'bg-[#FFFDF0] text-[#D69E2E] border-[#D69E2E]' :
                          task.status === 'In Progress' ? 'bg-[#EBF8FF] text-[#4299E1] border-[#4299E1]' :
                          task.status === 'Need Fix' ? 'bg-[#FFF5F5] text-[#E63946] border-[#E63946]' :
                          task.status === 'Submitted' ? 'bg-[#FAF5FF] text-[#9F7AEA] border-[#9F7AEA]' :
                          'bg-[#E6FFFA] text-[#38B2AC] border-[#38B2AC]'
                        }`}>
                          {statusText}
                        </span>
                      </div>
                      
                      <h2 className="font-manga text-xl font-black text-manga-ink uppercase leading-tight mt-1">
                        {task.seriesTitle}
                      </h2>
                      
                      <p className="text-[11px] font-semibold text-gray-500 leading-none">
                        Chương: Ch.{task.chapterNumber} · Trang {task.pageNumber}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-[#E63946] text-white text-[9px] font-black tracking-wider uppercase py-0.5 px-2.5">
                          ART TASK
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${getPriorityDotColor(task.priority)}`} />
                          {getPriorityText(task.priority)}
                        </span>
                      </div>
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-4 text-xs font-bold bg-zinc-50 p-3 border border-zinc-200">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{formatDate(task.deadline)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tabs row & content */}
                  <div className="flex-1 flex flex-col">
                    {/* Tabs Header */}
                    <div className="flex border-b-2 border-zinc-200 bg-zinc-50 text-xs font-bold">
                      <button
                        onClick={() => setActiveTab('info')}
                        className={`flex-1 py-3 text-center border-b-2 hover:bg-white transition-colors cursor-pointer ${
                          activeTab === 'info' ? 'border-[#E63946] text-[#E63946] font-black bg-white' : 'border-transparent text-gray-500'
                        }`}
                      >
                        Thông tin
                      </button>
                      <button
                        onClick={() => setActiveTab('feedback')}
                        className={`flex-1 py-3 text-center border-b-2 hover:bg-white transition-colors cursor-pointer ${
                          activeTab === 'feedback' ? 'border-[#E63946] text-[#E63946] font-black bg-white' : 'border-transparent text-gray-500'
                        }`}
                      >
                        Phản hồi
                      </button>
                      <button
                        onClick={() => setActiveTab('resources')}
                        className={`flex-1 py-3 text-center border-b-2 hover:bg-white transition-colors cursor-pointer ${
                          activeTab === 'resources' ? 'border-[#E63946] text-[#E63946] font-black bg-white' : 'border-transparent text-gray-500'
                        }`}
                      >
                        Tài nguyên
                      </button>
                    </div>

                    {/* Tab Contents */}
                    <div className="p-5 flex-1 overflow-y-auto">
                      
                      {/* Tab: Thông tin */}
                      {activeTab === 'info' && (
                        <div className="flex flex-col gap-4">
                          {/* Task description */}
                          <div className="flex flex-col gap-1.5">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Mô tả nhiệm vụ</h4>
                            <p className="text-xs font-medium text-gray-700 leading-relaxed bg-zinc-50 p-3 border border-zinc-100">
                              {viewingTaskDetail?.content || viewingTaskDetail?.description || task.note || 'Không có mô tả chi tiết cho nhiệm vụ này.'}
                            </p>
                          </div>

                          {/* Assigned By */}
                          <div className="flex flex-col gap-1.5">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Người giao việc</h4>
                            <div className="flex items-center gap-3 p-2 border border-zinc-200">
                              {assignedUsers[task.assignedById || '']?.avatarUrl ? (
                                <img
                                  src={getImageUrl(assignedUsers[task.assignedById || '']?.avatarUrl)}
                                  alt={assignedUsers[task.assignedById || '']?.fullName || task.assignedBy}
                                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-200"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#E63946] text-white font-black text-xs flex items-center justify-center shrink-0 uppercase">
                                  {(assignedUsers[task.assignedById || '']?.fullName || task.assignedBy || 'M').charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-black text-manga-ink leading-none">
                                  {assignedUsers[task.assignedById || '']?.fullName || task.assignedBy}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Mangaka / Editor</p>
                              </div>
                            </div>
                          </div>

                          {/* Assigned region */}
                          <div className="flex flex-col gap-1.5">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Vùng được giao (1)</h4>
                            <div className="p-3 border border-zinc-200 bg-white flex flex-col gap-0.5">
                              <p className="text-xs font-black text-manga-ink leading-tight">{regionLabel}</p>
                              <p className="text-[10px] font-bold text-[#E63946] uppercase">{task.layerType}</p>
                            </div>
                          </div>

                          {/* Timeline accordion */}
                          <div className="flex flex-col border border-zinc-200 mt-1">
                            <button
                              onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
                              className="p-3 bg-zinc-50 flex items-center justify-between text-xs font-black uppercase tracking-wider border-b border-zinc-200 cursor-pointer"
                            >
                              <span>Tiến trình</span>
                              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isTimelineExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isTimelineExpanded && (
                              <div className="p-4 flex flex-col pl-6 border-l-2 border-zinc-200 gap-4 my-2 ml-4">
                                <div className="relative flex flex-col gap-0.5">
                                  <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-[#E63946] bg-[#E63946]" />
                                  <span className="text-[9px] font-black text-gray-400">
                                    {formatTimelineDate(task.createdAt) || '14/05/2026'}
                                  </span>
                                  <p className="text-xs font-bold text-manga-ink">Nhận nhiệm vụ</p>
                                </div>
                                <div className="relative flex flex-col gap-0.5">
                                  <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-300 bg-white" />
                                  <span className="text-[9px] font-black text-gray-400">
                                    {formatTimelineDate(task.deadline)}
                                  </span>
                                  <p className="text-xs font-bold text-gray-400">Hạn chót nộp bài</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tab: Phản hồi */}
                      {activeTab === 'feedback' && (
                        <div className="flex flex-col gap-4">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Nhận xét từ Mangaka</h4>
                          <div className="flex flex-col gap-3.5 divide-y divide-zinc-150 max-h-[350px] overflow-y-auto pr-1">
                            {viewingTaskDetail?.feedbacks && viewingTaskDetail.feedbacks.length > 0 ? (
                              viewingTaskDetail.feedbacks.map((fb: any) => {
                                const isFromMangaka = fb.mangaka_id !== null;
                                const authorName = isFromMangaka 
                                  ? (task.assignedBy || 'Mangaka') 
                                  : 'Trợ lý';
                                const roleText = isFromMangaka ? 'Mangaka' : 'Trợ lý';
                                const initials = authorName.substring(0, 2).toUpperCase();
                                const feedbackText = fb.content || fb.feedback_content || '';
                                
                                return (
                                  <div key={fb.feedback_id || fb.id} className="flex gap-3 items-start pt-2 first:pt-0">
                                    <div className={`w-8 h-8 rounded-full ${isFromMangaka ? 'bg-zinc-950' : 'bg-zinc-600'} text-white font-black text-[10px] flex items-center justify-center shrink-0 border border-black shadow-sm`}>
                                      {initials}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-black text-manga-ink leading-none">{authorName}</span>
                                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tight">{roleText}</span>
                                        {fb.created_at && (
                                          <span className="text-[8px] text-gray-400 ml-auto font-mono">
                                            {new Date(fb.created_at).toLocaleDateString('vi-VN')}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs font-medium text-gray-600 bg-zinc-50 p-2.5 border border-zinc-100 mt-1.5 leading-relaxed whitespace-pre-wrap">
                                        {feedbackText}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-xs text-gray-400 font-bold italic py-4">Chưa có nhận xét hay phản hồi nào cho nhiệm vụ này.</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tab: Tài nguyên */}
                      {activeTab === 'resources' && (
                        <div className="flex flex-col gap-3">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Tài nguyên nhiệm vụ</h4>
                          {task.referenceUrl ? (
                            <div className="p-3 border-2 border-manga-ink bg-white flex items-center justify-between gap-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Paperclip className="w-4.5 h-4.5 text-zinc-400 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-manga-ink truncate leading-tight">
                                    {task.referenceUrl.split('/').pop() || `draft_page_${task.pageNumber}.png`}
                                  </p>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Ảnh bản thảo nhiệm vụ</p>
                                </div>
                              </div>
                              <button
                                onClick={async () => {
                                  showToast('success', 'Đang kết nối tải tệp tin...');
                                  const fileUrl = getImageUrl(task.referenceUrl || '');
                                  const fileName = (task.referenceUrl || '').split('/').pop() || `draft_page_${task.pageNumber}.png`;
                                  await downloadFile(fileUrl, fileName);
                                }}
                                className="bg-zinc-100 hover:bg-[#E63946] hover:text-white text-zinc-700 px-2 py-1.5 text-[9px] font-black uppercase border border-zinc-300 hover:border-black transition-all cursor-pointer rounded-none"
                              >
                                Tải về
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 font-bold italic py-4">Nhiệm vụ này không đính kèm tài nguyên tham khảo.</p>
                          )}
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Sidebar Footer Action Buttons */}
                  <div className="p-5 border-t-2 border-zinc-200 flex flex-col gap-3 bg-zinc-50 shrink-0">
                    {/* Primary Button */}
                    {isNotStarted ? (
                      <button
                        onClick={() => handleAcceptTask(task)}
                        className="w-full bg-[#E63946] hover:bg-white text-white hover:text-[#E63946] border-2 border-[#E63946] py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_rgba(15,15,15,1)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(15,15,15,1)] transition-all active:scale-[0.98]"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" /> NHẬN NHIỆM VỤ
                      </button>
                    ) : isApproved ? (
                      <button
                        disabled
                        className="w-full bg-emerald-50 text-emerald-600 border-2 border-emerald-500 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed opacity-80"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" /> ĐÃ ĐƯỢC DUYỆT
                      </button>
                    ) : isSubmitted ? (
                      <button
                        disabled
                        className="w-full bg-purple-50 text-purple-600 border-2 border-purple-500 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed opacity-80"
                      >
                        <Clock className="w-4 h-4 shrink-0" /> ĐANG CHỜ DUYỆT
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenSubmitModal(task)}
                        className="w-full bg-[#E63946] hover:bg-white text-white hover:text-[#E63946] border-2 border-[#E63946] py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_rgba(15,15,15,1)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(15,15,15,1)] transition-all active:scale-[0.98]"
                      >
                        <Send className="w-4 h-4 shrink-0" /> NỘP BẢN VẼ
                      </button>
                    )}

                    {/* Secondary Button */}
                    <button
                      onClick={() => setDownloadingTask(task)}
                      className="w-full bg-white hover:bg-zinc-100 text-manga-ink border-2 border-black py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      <Download className="w-4 h-4 shrink-0" /> TẢI TÀI NGUYÊN (1)
                    </button>
                  </div>

                </div>

              </div>

            </div>
          );
        })()
      )}

      {/* Workspace Detail Modal popup for EDIT (SỬA) Action */}
      {selectedTaskForModal && (
        <TaskDetailModal
          taskId={selectedTaskForModal.id}
          onClose={() => setSelectedTaskForModal(null)}
          onStatusChanged={loadTasksData}
        />
      )}

      {submittingTask && (() => {
        const task = submittingTask;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in text-black">
            <div className="bg-white border-4 border-manga-ink w-full max-w-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
              
              {/* Modal Header */}
              <div className="bg-[#2D2D30] text-white border-b-4 border-manga-ink p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-black text-[#E63946] uppercase tracking-wider">
                    NỘP KẾT QUẢ NHIỆM VỤ
                  </h2>
                  <p className="text-xs font-bold text-white mt-0.5">
                    Task #{task.id} - {task.layerType}
                  </p>
                </div>
                <button 
                  onClick={() => setSubmittingTask(null)}
                  className="text-zinc-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 flex flex-col gap-4">
                
                {/* Task Info Card */}
                <div className="border border-zinc-200 p-4 bg-white flex justify-between items-center">
                  <div>
                    <h3 className="font-manga text-[14px] font-black text-zinc-800 leading-tight">
                      {task.seriesTitle}
                    </h3>
                    <p className="text-[11px] font-bold text-zinc-400 mt-1 uppercase">
                      {task.layerType}
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Deadline: {formatDate(task.deadline)}
                  </div>
                </div>

                {/* Edit Notes Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-800 uppercase tracking-wider flex items-center gap-0.5">
                    GHI CHÚ CHỈNH SỬA <span className="text-[#E63946]">*</span>
                  </label>
                  <textarea
                    value={submitNotes}
                    onChange={(e) => setSubmitNotes(e.target.value)}
                    placeholder="Mô tả những gì bạn đã thực hiện trong bản nộp này..."
                    className="w-full min-h-[90px] p-3 text-xs font-semibold text-gray-700 bg-white border border-zinc-300 focus:border-black focus:outline-none resize-none transition-all placeholder:text-gray-400 font-sans"
                    required
                  />
                </div>

                {/* Version Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-800 uppercase tracking-wider flex items-center gap-0.5">
                    PHIÊN BẢN <span className="text-[#E63946]">*</span>
                  </label>
                  <input
                    type="text"
                    value={submitVersion}
                    onChange={(e) => setSubmitVersion(e.target.value)}
                    className="w-full p-2.5 text-xs font-bold text-gray-700 bg-white border border-zinc-300 focus:border-black focus:outline-none transition-all font-sans"
                    required
                  />
                </div>

                {/* File Attachment Upload Box */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-800 uppercase tracking-wider flex items-center gap-0.5">
                    FILE ĐÍNH KÈM <span className="text-[#E63946]">*</span>
                  </label>
                  
                  {isUploadingFile ? (
                    <div className="border-2 border-dashed border-[#E63946] bg-red-50/10 p-6 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#E63946]" />
                      <p className="text-xs font-bold text-[#E63946]">Đang tải tệp lên Cloudinary...</p>
                    </div>
                  ) : attachedFile ? (
                    <div className="border-2 border-dashed border-[#E63946] bg-red-50/10 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="w-5 h-5 text-[#E63946] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-850 truncate">{attachedFile.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{attachedFile.size}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setAttachedFile(null); setUploadedFileUrl(''); }}
                        className="text-gray-400 hover:text-[#E63946] bg-transparent border-none cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-300 hover:border-black p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-zinc-50/50 hover:bg-zinc-50 transition-all"
                    >
                      <Paperclip className="w-6 h-6 text-zinc-400" />
                      <p className="text-xs font-bold text-zinc-800">
                        Kéo thả hoặc click để chọn file
                      </p>
                      <p className="text-[10px] font-bold text-zinc-400">
                        .psd, .ai, .png, .jpg, .zip
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept=".psd,.ai,.png,.jpg,.jpeg,.zip"
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-zinc-50 border-t-2 border-zinc-200 p-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSubmittingTask(null)}
                  className="bg-white hover:bg-zinc-100 text-manga-ink border-2 border-black py-2.5 px-6 text-xs font-black uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all"
                >
                  HỦY
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || isUploadingFile}
                  onClick={() => {
                    if (!submitNotes.trim()) {
                      showToast('error', 'Vui lòng nhập ghi chú chỉnh sửa!')
                      return
                    }
                    if (!attachedFile) {
                      showToast('error', 'Vui lòng đính kèm file kết quả!')
                      return
                    }
                    handleSubmitResult(task.id)
                  }}
                  className="bg-[#E63946] hover:bg-white text-white hover:text-[#E63946] border-2 border-[#E63946] py-2.5 px-6 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>ĐANG NỘP...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>NỘP KẾT QUẢ</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {downloadingTask && (() => {
        const task = downloadingTask;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in text-black">
            <div className="bg-white border-4 border-manga-ink w-full max-w-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
              
              {/* Modal Header */}
              <div className="bg-[#2D2D30] text-white border-b-4 border-manga-ink p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-black text-[#E63946] uppercase tracking-wider">
                    TÀI NGUYÊN & FILE NGUỒN
                  </h2>
                  <p className="text-xs font-bold text-white mt-0.5">
                    Task #{task.id} — {task.layerType}
                  </p>
                  <p className="text-[10px] font-medium text-zinc-400 mt-0.5">
                    {task.seriesTitle} - Deadline: {formatDate(task.deadline)}
                  </p>
                </div>
                <button 
                  onClick={() => setDownloadingTask(null)}
                  className="text-zinc-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-header statistics row */}
              <div className="bg-zinc-50 border-b-2 border-zinc-200 px-6 py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-zinc-600">
                  <span>📁 {task.referenceUrl ? 1 : 0} file đính kèm</span>
                  <span className="text-zinc-300">|</span>
                  <span className="text-zinc-400 font-medium">Tài nguyên thật</span>
                </div>
                {task.referenceUrl && (
                  <button
                    onClick={async () => {
                      showToast('success', 'Đang tải toàn bộ tệp tin...');
                      const fileUrl = getImageUrl(task.referenceUrl || '');
                      const fileName = (task.referenceUrl || '').split('/').pop() || `draft_page_${task.pageNumber}.png`;
                      await downloadFile(fileUrl, fileName);
                      setDownloadingTask(null);
                    }}
                    className="bg-[#E63946] hover:bg-white text-white hover:text-[#E63946] border border-[#E63946] px-3.5 py-1.5 text-[10px] font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> TẢI TẤT CẢ
                  </button>
                )}
              </div>

              {/* Modal Content / Files list */}
              <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[50vh]">
                {task.referenceUrl ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[10px] font-black text-zinc-550 tracking-wider">
                      <span>— TÀI LIỆU THAM KHẢO</span>
                      <span className="text-zinc-400 font-medium">1 file</span>
                    </div>

                    {/* File 1 */}
                    <div className="border border-zinc-200 p-3 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 overflow-hidden">
                          <img 
                            src={getImageUrl(task.referenceUrl)} 
                            alt="Reference page preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-zinc-800 truncate leading-tight">
                            {task.referenceUrl.split('/').pop() || `draft_page_${task.pageNumber}.png`}
                          </p>
                          <p className="text-[10px] text-zinc-450 mt-1 font-medium leading-tight truncate">
                            Bản thảo trang {task.pageNumber} của Chapter {task.chapterNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="bg-blue-100 text-blue-700 text-[9px] font-black py-0.5 px-1.5">IMG</span>
                        <button 
                          onClick={async () => {
                            showToast('success', 'Đang kết nối tải tệp tin...');
                            const fileUrl = getImageUrl(task.referenceUrl || '');
                            const fileName = (task.referenceUrl || '').split('/').pop() || `draft_page_${task.pageNumber}.png`;
                            await downloadFile(fileUrl, fileName);
                          }}
                          className="bg-white hover:bg-zinc-50 border border-zinc-300 py-1.5 px-2.5 text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> TẢI XUỐNG
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 font-bold italic py-4 text-center">Nhiệm vụ này không đính kèm tài nguyên tham khảo.</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-zinc-50 border-t-2 border-zinc-200 p-4 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold text-gray-400">
                  File được đính kèm gốc từ Mangaka / Editor
                </span>
                <button
                  type="button"
                  onClick={() => setDownloadingTask(null)}
                  className="bg-white hover:bg-zinc-100 text-manga-ink border-2 border-black py-2.5 px-6 text-xs font-black uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all"
                >
                  ĐÓNG
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  )
}
