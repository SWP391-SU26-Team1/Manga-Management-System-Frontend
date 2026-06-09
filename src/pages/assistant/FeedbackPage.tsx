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
  ArrowLeft
} from 'lucide-react'
import { assistantStore, AssistantTask, AssistantSubmission } from '@/data/assistantMockData'

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
  key: string;
}

// Map comments to Task ID
const MOCK_TASK_FEEDBACKS: Record<string, FeedbackComment[]> = {
  '1042': [
    {
      author: 'Akira Tanaka',
      role: 'Mangaka',
      avatar: 'AT',
      timeAgo: '2 giờ trước',
      content: 'Biểu cảm nhân vật cần mạnh hơn ở panel 3-5. Đặc biệt ánh mắt của Hiroshi khi đối đầu với kẻ địch cần thể hiện sự giận dữ và kiên quyết hơn. Hãy tham khảo trang 14 tập 3 để lấy cảm hứng về cách thể hiện cảm xúc phức tạp qua đường nét.',
      isUrgent: true
    },
    {
      author: 'Sarah Chen',
      role: 'Editor',
      avatar: 'SC',
      timeAgo: '5 giờ trước',
      content: 'Phối cảnh nền ở panel 2 bị lệch nhẹ. Đường chân trời cần thẳng hàng với đường mắt của nhân vật chính. Ngoài ra, chi tiết kiến trúc thành phố phía sau cần chi tiết hơn.'
    },
    {
      author: 'Yuki Mori',
      role: 'Assistant Editor',
      avatar: 'YM',
      timeAgo: '1 ngày trước',
      content: 'Tổng thể bố cục tốt! Chỉ cần chỉnh sửa theo góp ý của anh Tanaka và chị Chen là được duyệt.',
      isApproved: true
    }
  ],
  '1040': [
    {
      author: 'Akira Tanaka',
      role: 'Mangaka',
      avatar: 'AT',
      timeAgo: '1 ngày trước',
      content: 'Nếp gấp quần áo của nhân vật chính trong tư thế chiến đấu trông hơi cứng. Cần làm cho nó mềm mại và tự nhiên hơn.',
      isUrgent: true
    },
    {
      author: 'Sarah Chen',
      role: 'Editor',
      avatar: 'SC',
      timeAgo: '2 ngày trước',
      content: 'Màu sắc tóc của Cyber Ronin hơi sẫm. Hãy tăng độ tương phản để nổi bật trên nền tối.'
    }
  ],
  '1051': [
    {
      author: 'Akira Tanaka',
      role: 'Mangaka',
      avatar: 'AT',
      timeAgo: '3 ngày trước',
      content: "Hiệu ứng chữ 'BOOM' cần nét vẽ gai góc và sắc nhọn hơn để thể hiện uy lực của cú đấm.",
      isUrgent: true
    }
  ],
  '1041': [
    {
      author: 'Sarah Chen',
      role: 'Editor',
      avatar: 'SC',
      timeAgo: '4 ngày trước',
      content: 'Độ phân giải hiệu ứng lưới sàng (screentone) ở trang 14 bị moiré. Hãy xuất file ảnh chất lượng cao hơn hoặc đổi kiểu screentone khác.'
    },
    {
      author: 'Akira Tanaka',
      role: 'Mangaka',
      avatar: 'AT',
      timeAgo: '5 ngày trước',
      content: 'Hiệu ứng ánh sáng nền ở panel cuối rất đẹp, giữ nguyên nhé.',
      isApproved: true
    }
  ],
  '1045': [
    {
      author: 'Akira Tanaka',
      role: 'Mangaka',
      avatar: 'AT',
      timeAgo: '1 tuần trước',
      content: 'Tốc độ di chuyển của nhân vật chưa được lột tả rõ. Hãy thêm một vài đường speed line xung quanh chân.',
      isUrgent: true
    },
    {
      author: 'Yuki Mori',
      role: 'Assistant Editor',
      avatar: 'YM',
      timeAgo: '1 tuần trước',
      content: 'Phần biên nét vẽ còn một vài điểm bị hở, chú ý tô kín để tránh bị lem màu sau này.',
      isApproved: true
    }
  ],
  '1039': [
    {
      author: 'Akira Tanaka',
      role: 'Mangaka',
      avatar: 'AT',
      timeAgo: '2 tuần trước',
      content: 'Cảnh nền phòng học đang hơi trống trải. Hãy thêm một vài quyển sách trên bàn và một bức tranh vẽ trên bảng đen.'
    }
  ]
};

export default function FeedbackPage() {
  const location = useLocation()
  const [tasks, setTasks] = useState<AssistantTask[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string>('1042')
  const [noteContent, setNoteContent] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Map timelines to Task ID
  const [timelines, setTimelines] = useState<Record<string, TimelineStep[]>>({
    '1042': [
      { date: '14/05/2026', label: 'Nhận nhiệm vụ', done: true, key: 'assign' },
      { date: '16/05/2026', label: 'Nộp bản v1', done: true, key: 'v1' },
      { date: '17/05/2026', label: 'Nhận phản hồi (3 góp ý)', done: true, key: 'fb1' },
      { date: '22/05/2026', label: 'Nộp bản v2', done: false, key: 'v2' },
      { date: '24/05/2026', label: 'Deadline', done: false, key: 'deadline' }
    ],
    '1040': [
      { date: '05/05/2026', label: 'Nhận nhiệm vụ', done: true, key: 'assign' },
      { date: '10/05/2026', label: 'Nộp bản v1', done: true, key: 'v1' },
      { date: '12/05/2026', label: 'Nhận phản hồi (2 góp ý)', done: true, key: 'fb1' },
      { date: '19/05/2026', label: 'Deadline', done: false, key: 'deadline' }
    ],
    '1051': [
      { date: '10/05/2026', label: 'Nhận nhiệm vụ', done: true, key: 'assign' },
      { date: '15/05/2026', label: 'Nộp bản v1', done: true, key: 'v1' },
      { date: '18/05/2026', label: 'Nhận phản hồi (1 góp ý)', done: true, key: 'fb1' },
      { date: '21/05/2026', label: 'Deadline', done: false, key: 'deadline' }
    ],
    '1041': [
      { date: '12/05/2026', label: 'Nhận nhiệm vụ', done: true, key: 'assign' },
      { date: '18/05/2026', label: 'Nộp bản v1', done: true, key: 'v1' },
      { date: '20/05/2026', label: 'Nhận phản hồi (2 góp ý)', done: true, key: 'fb1' },
      { date: '22/05/2026', label: 'Nộp bản v2', done: true, key: 'v2' },
      { date: '23/05/2026', label: 'Deadline', done: false, key: 'deadline' }
    ],
    '1045': [
      { date: '09/05/2026', label: 'Nhận nhiệm vụ', done: true, key: 'assign' },
      { date: '12/05/2026', label: 'Nộp bản v1', done: true, key: 'v1' },
      { date: '14/05/2026', label: 'Nhận phản hồi (3 góp ý)', done: true, key: 'fb1' },
      { date: '17/05/2026', label: 'Nộp bản v2', done: true, key: 'v2' },
      { date: '19/05/2026', label: 'Deadline', done: false, key: 'deadline' }
    ],
    '1039': [
      { date: '10/05/2026', label: 'Nhận nhiệm vụ', done: true, key: 'assign' },
      { date: '14/05/2026', label: 'Nộp bản v1', done: true, key: 'v1' },
      { date: '16/05/2026', label: 'Nhận phản hồi (1 góp ý)', done: true, key: 'fb1' },
      { date: '20/05/2026', label: 'Deadline', done: false, key: 'deadline' }
    ]
  })

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

  const loadTasks = () => {
    const allTasks = assistantStore.getTasks()
    // Filter tasks that are in progress, need revision or review
    const relevantTasks = allTasks.filter(t => 
      ['Need Fix', 'Submitted', 'In Progress', 'Approved'].includes(t.status)
    )
    
    // Sort tasks to match mockup order if possible: 1042 -> 1040 -> 1051 -> 1041 -> 1045 -> 1039
    const orderMap: Record<string, number> = {
      '1042': 1, '1040': 2, '1051': 3, '1041': 4, '1045': 5, '1039': 6
    }
    
    relevantTasks.sort((a, b) => {
      const orderA = orderMap[a.id] || 99
      const orderB = orderMap[b.id] || 99
      return orderA - orderB
    })

    setTasks(relevantTasks)

    // Select first task if selectedTaskId is not present
    if (relevantTasks.length > 0 && !relevantTasks.find(t => t.id === selectedTaskId)) {
      setSelectedTaskId(relevantTasks[0].id)
    }
  }

  // Get active task object
  const activeTask = tasks.find(t => t.id === selectedTaskId)

  // Get feedbacks for active task
  const activeFeedbacks = activeTask ? (MOCK_TASK_FEEDBACKS[activeTask.id] || [
    {
      author: 'Akira Tanaka',
      role: 'Mangaka',
      avatar: 'AT',
      timeAgo: '2 ngày trước',
      content: 'Đã giao nhiệm vụ. Cần bám sát mô tả ghi chú.',
    }
  ]) : []

  // Get timeline steps for active task
  const activeTimeline = activeTask ? (timelines[activeTask.id] || [
    { date: '01/05/2026', label: 'Nhận nhiệm vụ', done: true, key: 'assign' },
    { date: activeTask.deadline, label: 'Deadline', done: false, key: 'deadline' }
  ]) : []

  // Remaining days label helper
  const getRemainingDaysText = (task: AssistantTask) => {
    if (task.id === '1042') return '5 ngày'
    if (task.id === '1040') return 'Quá hạn'
    if (task.id === '1051') return 'Quá hạn'
    if (task.id === '1039') return '1 ngày'

    const deadlineDate = new Date(task.deadline)
    const today = new Date('2026-06-09')
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

  // Handle file select simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  // Handle Drag & Drop simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0])
    }
  }

  // Determine current/next version to suggest
  const getNextVersionText = () => {
    if (!activeTask) return 'v2'
    const timeline = timelines[activeTask.id] || []
    const submissionsCount = timeline.filter(step => step.label.includes('Nộp bản v')).length
    return `v${submissionsCount + 1}`
  }

  // Submit resubmission form
  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTask) return

    if (!noteContent.trim()) {
      showToast('error', 'Vui lòng nhập ghi chú chỉnh sửa theo phản hồi!')
      return
    }

    if (!uploadedFile) {
      showToast('error', 'Vui lòng đính kèm tệp tin sửa đổi của bạn!')
      return
    }

    // Call store
    const filename = uploadedFile.name
    const version = getNextVersionText()
    
    // Simulate adding submission in local storage
    try {
      assistantStore.addSubmission({
        taskId: activeTask.id,
        seriesTitle: activeTask.seriesTitle,
        chapterNumber: activeTask.chapterNumber,
        pageNumber: activeTask.pageNumber,
        layerType: activeTask.layerType,
        fileName: filename,
        previewUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop', // Default beautiful placeholder
        note: noteContent
      })
      
      // Update local task state to Submitted
      assistantStore.updateTaskStatus(activeTask.id, 'Submitted')
      
      // Update timeline state to add a step and mark current steps as completed
      const currentTimeline = timelines[activeTask.id] || []
      const updatedTimeline = currentTimeline.map(step => {
        // Mark deadline or previous steps as done if applicable
        if (step.key === 'v2' || step.key === 'v3' || step.key === 'v4') {
          return { ...step, label: `${step.label} (Đã gửi)`, done: true }
        }
        return step
      })

      // Add a specific log line into the timeline
      const newVersion = getNextVersionText()
      const todayDate = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
      const newStep: TimelineStep = {
        date: todayDate,
        label: `Đã nộp bản ${newVersion}`,
        done: true,
        key: `submit_${newVersion}`
      }
      
      // Inset the new step before deadline
      const deadlineIdx = updatedTimeline.findIndex(s => s.key === 'deadline')
      if (deadlineIdx !== -1) {
        updatedTimeline.splice(deadlineIdx, 0, newStep)
      } else {
        updatedTimeline.push(newStep)
      }

      setTimelines(prev => ({
        ...prev,
        [activeTask.id]: updatedTimeline
      }))

      // Reload tasks from store to refresh statuses
      loadTasks()
      
      // Success Feedback
      showToast('success', `Đã nộp thành công bản sửa đổi ${version} cho Task #${activeTask.id}!`)
      
      // Clear Form
      setNoteContent('')
      setUploadedFile(null)

    } catch (err) {
      console.error(err)
      showToast('error', 'Gửi bản sửa đổi thất bại. Vui lòng thử lại!')
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
    const count = MOCK_TASK_FEEDBACKS[taskId]?.length || 0
    return `${count} góp ý`
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
            <button onClick={() => setToastMessage(null)} className="ml-2 hover:bg-gray-100 p-1">
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

      {/* Main 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: NHIỆM VỤ CÓ PHẢN HỒI (Sidebar List) - 3/12 width */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white border-2 border-manga-ink p-3 shadow-none">
            <h2 className="font-manga text-sm font-black uppercase tracking-wider text-manga-ink">
              NHIỆM VỤ CÓ PHẢN HỒI
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
          {activeTask ? (
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
                        <div className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center bg-white ${
                          step.done ? 'border-[#E63946] bg-[#E63946]' : 'border-zinc-300 bg-white'
                        }`}>
                          {step.done && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
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
          {activeTask ? (
            <>
              {/* LATEST FEEDBACK messages */}
              <div className="bg-white border-2 border-manga-ink shadow-[3px_3px_0px_rgba(15,15,15,1)]">
                {/* Section title header */}
                <div className="bg-[#1C1C1F] text-white border-b-2 border-manga-ink p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-manga text-xs font-black uppercase tracking-wider">LATEST FEEDBACK</h3>
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
                      <div className="w-9 h-9 rounded-full bg-zinc-950 text-white font-black text-xs flex items-center justify-center shrink-0 border border-black shadow-sm">
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
                      accept=".psd,.ai,.png,.jpg,.zip"
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
                      {uploadedFile ? (
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
                            }}
                            className="bg-red-100 text-[#E63946] hover:bg-[#E63946] hover:text-white px-2 py-1 text-[9px] font-black mt-1 uppercase transition-colors shrink-0"
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
                    className="w-full bg-[#E63946] hover:bg-white text-white hover:text-[#E63946] border-2 border-[#E63946] py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_rgba(15,15,15,1)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(15,15,15,1)] transition-all mt-2 active:scale-[0.98]"
                  >
                    <Send className="w-4 h-4 shrink-0" /> GỬI BẢN SỬA ĐỔI
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>

      </div>
    </div>
  )
}
