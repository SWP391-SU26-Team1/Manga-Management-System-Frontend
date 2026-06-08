import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { useToast } from '@/contexts/ToastContext'
import {
  Clock,
  CheckCircle2,
  Send,
  Paperclip,
  Check,
  AlertCircle,
  MessageSquare
} from 'lucide-react'

interface FeedbackComment {
  id: string
  sender: string
  role: 'MANGAKA' | 'EDITOR' | 'ASSISTANT EDITOR'
  time: string
  avatar: string
  avatarColor: string
  isUrgent?: boolean
  content: string
}

interface FeedbackTask {
  id: string
  seriesTitle: string
  status: 'REVISION' | 'REVIEW' | 'PENDING'
  chapterInfo: string
  deadline: string
  remaining: string
  type: string
  commentsCount: number
  timeline: {
    date: string
    title: string
    completed: boolean
  }[]
  comments: FeedbackComment[]
}

const mockFeedbackTasks: FeedbackTask[] = [
  {
    id: '#1042',
    seriesTitle: 'Sakura High',
    status: 'REVISION',
    chapterInfo: 'Character Lineart - Ch.3',
    deadline: '24/05/2026',
    remaining: '5 ngày',
    type: 'Character Lineart',
    commentsCount: 3,
    timeline: [
      { date: '14/05', title: 'Nhận nhiệm vụ', completed: true },
      { date: '16/05', title: 'Nộp bản vẽ v1', completed: true },
      { date: '17/05', title: 'Nhận phản hồi (3 góp ý)', completed: true },
      { date: '22/05', title: 'Nộp bản vẽ v2', completed: false },
      { date: '---', title: 'Duyệt hoàn thành', completed: false }
    ],
    comments: [
      {
        id: 'c1',
        sender: 'Akira Tanaka',
        role: 'MANGAKA',
        time: '2 giờ trước',
        avatar: 'AT',
        avatarColor: 'bg-[#E63946]',
        isUrgent: true,
        content: 'Biểu cảm nhân vật cần mạnh mẽ hơn ở panel 3-5. Đặc biệt ánh mắt của Hiroshi khi đối đầu với kẻ địch cần thể hiện sự giận dữ và kiên quyết hơn. Hãy tham khảo trang 14 tập 3 để lấy cảm hứng và cách thể hiện cảm xúc phức tạp qua đường nét.'
      },
      {
        id: 'c2',
        sender: 'Sarah Chen',
        role: 'EDITOR',
        time: '5 giờ trước',
        avatar: 'SC',
        avatarColor: 'bg-zinc-800',
        content: 'Phối cảnh nền ở panel 2 bị lệch nhẹ. Đường chân trời cần thăng bằng với đường mắt của nhân vật chính. Ngoài ra, chi tiết kiến trúc thành phố phía sau cần chi tiết hơn.'
      },
      {
        id: 'c3',
        sender: 'Yuki Mori',
        role: 'ASSISTANT EDITOR',
        time: '1 ngày trước',
        avatar: 'YM',
        avatarColor: 'bg-zinc-400',
        content: 'Tổng thể bố cục tốt! Chỉ cần chỉnh sửa theo góp ý của anh Tanaka và chị Chen là được duyệt.'
      }
    ]
  },
  {
    id: '#1040',
    seriesTitle: 'Cyber Ronin',
    status: 'REVISION',
    chapterInfo: 'Character Design Sheet - Vol.2',
    deadline: '19/05/2026',
    remaining: 'Hết hạn',
    type: 'Character Design',
    commentsCount: 2,
    timeline: [
      { date: '10/05', title: 'Nhận nhiệm vụ', completed: true },
      { date: '12/05', title: 'Nộp bản vẽ v1', completed: true },
      { date: '13/05', title: 'Nhận phản hồi (2 góp ý)', completed: true },
      { date: '19/05', title: 'Nộp bản vẽ v2', completed: false }
    ],
    comments: [
      {
        id: 'c4',
        sender: 'Akira Tanaka',
        role: 'MANGAKA',
        time: '3 ngày trước',
        avatar: 'AT',
        avatarColor: 'bg-[#E63946]',
        isUrgent: true,
        content: 'Độ rộng của vai robot ở mặt sau chưa đồng bộ với mặt chính diện. Cần phóng to tỷ lệ vai thêm khoảng 10%.'
      },
      {
        id: 'c5',
        sender: 'Sarah Chen',
        role: 'EDITOR',
        time: '4 ngày trước',
        avatar: 'SC',
        avatarColor: 'bg-zinc-800',
        content: 'Nổi bật vũ khí đeo sau lưng hơn bằng cách tăng độ đậm cho nét viền bao ngoài.'
      }
    ]
  },
  {
    id: '#1051',
    seriesTitle: 'Dark Rising Chronicles',
    status: 'REVISION',
    chapterInfo: 'SFX Design - Ch.15',
    deadline: '21/05/2026',
    remaining: '3 ngày',
    type: 'SFX Design',
    commentsCount: 1,
    timeline: [
      { date: '12/05', title: 'Nhận nhiệm vụ', completed: true },
      { date: '15/05', title: 'Nộp bản vẽ v1', completed: true },
      { date: '16/05', title: 'Nhận phản hồi (1 góp ý)', completed: true },
      { date: '21/05', title: 'Nộp bản vẽ v2', completed: false }
    ],
    comments: [
      {
        id: 'c6',
        sender: 'Akira Tanaka',
        role: 'MANGAKA',
        time: '1 ngày trước',
        avatar: 'AT',
        avatarColor: 'bg-[#E63946]',
        content: 'Tia sét hiệu ứng SFX ở góc trái khung tranh lớn nên kéo dài từ đỉnh ngọn tháp xuống sát mặt đất để tăng cảm giác uy lực dữ dội.'
      }
    ]
  },
  {
    id: '#1041',
    seriesTitle: 'Dark Rising Chronicles',
    status: 'REVIEW',
    chapterInfo: 'Tone & Effect - Ch.14',
    deadline: '23/05/2026',
    remaining: '4 ngày',
    type: 'Tone & Effect',
    commentsCount: 2,
    timeline: [
      { date: '14/05', title: 'Nhận nhiệm vụ', completed: true },
      { date: '17/05', title: 'Nộp bản vẽ v1', completed: true },
      { date: '18/05', title: 'Nhận phản hồi', completed: true },
      { date: '19/05', title: 'Nộp bản sửa đổi v2', completed: true },
      { date: '---', title: 'Chờ xét duyệt lại', completed: false }
    ],
    comments: [
      {
        id: 'c7',
        sender: 'Sarah Chen',
        role: 'EDITOR',
        time: '2 ngày trước',
        avatar: 'SC',
        avatarColor: 'bg-zinc-800',
        content: 'Màu nền bóng mờ ở bầu trời đêm cần chuyển mượt hơn. Hãy dùng cọ tán mịn để tránh lộ vân sắc độ.'
      }
    ]
  },
  {
    id: '#1045',
    seriesTitle: 'Phantom Guild',
    status: 'REVIEW',
    chapterInfo: 'Action Sequence Lineart - Ch.8',
    deadline: '19/05/2026',
    remaining: 'Hết hạn',
    type: 'Action Lineart',
    commentsCount: 3,
    timeline: [
      { date: '08/05', title: 'Nhận nhiệm vụ', completed: true },
      { date: '11/05', title: 'Nộp bản vẽ v1', completed: true },
      { date: '12/05', title: 'Nhận phản hồi', completed: true }
    ],
    comments: [
      {
        id: 'c8',
        sender: 'Akira Tanaka',
        role: 'MANGAKA',
        time: '5 ngày trước',
        avatar: 'AT',
        avatarColor: 'bg-[#E63946]',
        content: 'Đi nét phân cảnh kiếm va chạm nhau cần vẽ các vệt tốc độ đậm nét hơn để thấy rõ lực va đập.'
      }
    ]
  },
  {
    id: '#1039',
    seriesTitle: 'Moonlight Academy',
    status: 'PENDING',
    chapterInfo: 'Thiên Nhiên - Ch.7',
    deadline: '20/05/2026',
    remaining: '1 ngày',
    type: 'Background',
    commentsCount: 1,
    timeline: [
      { date: '09/05', title: 'Nhận nhiệm vụ', completed: true }
    ],
    comments: [
      {
        id: 'c9',
        sender: 'Sarah Chen',
        role: 'EDITOR',
        time: '6 ngày trước',
        avatar: 'SC',
        avatarColor: 'bg-zinc-800',
        content: 'Vẽ thêm rặng thông phía xa bên mép vực để tạo chiều sâu không gian tốt hơn.'
      }
    ]
  }
]

export default function FeedbackPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [tasks, setTasks] = useState<FeedbackTask[]>(mockFeedbackTasks)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('#1042')
  
  // Submit Form States
  const [note, setNote] = useState('')
  const [version, setVersion] = useState('v2.0')
  const [dateStr, setDateStr] = useState('18/05/2026')
  const [fileName, setFileName] = useState('')

  const activeTask = tasks.find(t => t.id === selectedTaskId) || tasks[0]

  const getStatusBadge = (status: FeedbackTask['status']) => {
    switch (status) {
      case 'REVISION':
        return <span className="bg-red-50 text-[#E63946] border border-red-200 text-[10px] font-black px-2 py-0.5 rounded">REVISION</span>
      case 'REVIEW':
        return <span className="bg-purple-50 text-purple-600 border border-purple-200 text-[10px] font-black px-2 py-0.5 rounded">REVIEW</span>
      case 'PENDING':
      default:
        return <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded">PENDING</span>
    }
  }

  const handleTaskClick = (id: string) => {
    setSelectedTaskId(id)
    setNote('')
    setFileName('')
    // Dynamic defaults for form versions
    if (id === '#1042') {
      setVersion('v2.0')
      setDateStr('18/05/2026')
    } else {
      setVersion('v1.1')
      setDateStr(new Date().toLocaleDateString('vi-VN'))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) {
      showToast('Vui lòng điền ghi chú chỉnh sửa!')
      return
    }

    // Simulate sending revision
    showToast(`Đã gửi bản sửa đổi (${version}) cho Task ${selectedTaskId} thành công!`)
    
    // Update local task status to REVIEW (submitted for review)
    setTasks(prev => prev.map(t => {
      if (t.id === selectedTaskId) {
        return {
          ...t,
          status: 'REVIEW' as const,
          timeline: t.timeline.map(step => {
            if (step.title.includes('Nộp bản vẽ v2') || step.title.includes('Nộp bản sửa đổi')) {
              return { ...step, completed: true }
            }
            return step
          })
        }
      }
      return t
    }))

    // Reset uploader
    setNote('')
    setFileName('')
  }

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-gray-900">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-xs font-extrabold text-[#E63946] hover:text-black transition-colors uppercase mb-3 bg-transparent border-0 p-0 cursor-pointer"
      >
        &larr; Quay lại
      </button>

      {/* Page Title & Breadcrumbs */}
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">
          PHẢN HỒI & NỘP LẠI
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-1">
          Xem xét góp ý từ tổ sản xuất và nộp bản sửa đổi bản vẽ
        </p>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Column 1: NHIỆM VỤ CÓ PHẢN HỒI (Spans 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-4">
            NHIỆM VỤ CÓ PHẢN HỒI
          </h3>
          <div className="space-y-3 max-h-[72vh] overflow-y-auto pr-1">
            {tasks.map((task) => {
              const isActive = task.id === selectedTaskId
              return (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task.id)}
                  className={`bg-white border-2 border-black p-4 rounded-none shadow-xs transition-all duration-200 cursor-pointer relative ${
                    isActive
                      ? 'bg-red-50/30'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-[#E63946]">{task.id}</span>
                    {getStatusBadge(task.status)}
                  </div>
                  
                  <h4 className="text-sm font-extrabold text-gray-900 truncate">
                    {task.seriesTitle}
                  </h4>
                  <p className="text-xs text-gray-500 font-bold mt-1 truncate">
                    {task.chapterInfo}
                  </p>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-150">
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {task.deadline}
                    </span>
                    <span className="bg-black text-white text-[9px] font-extrabold px-2 py-0.5 rounded-none uppercase tracking-wide">
                      {task.commentsCount} góp ý
                    </span>
                  </div>

                  {isActive && (
                    <div className="absolute top-0 bottom-0 left-0 w-2 bg-[#E63946]" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Column 2: CHI TIẾT NHIỆM VỤ & TIẾN TRÌNH (Spans 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-4">
            CHI TIẾT NHIỆM VỤ
          </h3>

          {/* Top Block: Title details */}
          <div className="bg-[#1c1c1f] text-white p-5 rounded-none border-2 border-black shadow-sm space-y-1">
            <span className="text-[10px] font-black text-[#E63946] uppercase tracking-wider">
              TASK {activeTask.id}
            </span>
            <h2 className="text-lg font-black tracking-tight leading-tight">
              {activeTask.type}
            </h2>
            <p className="text-xs font-bold text-zinc-400">
              {activeTask.seriesTitle}
            </p>
          </div>

          {/* Middle Block: Info details */}
          <div className="bg-white border-2 border-black rounded-none p-5 shadow-xs space-y-4">
            <h4 className="text-[10px] font-black tracking-widest text-gray-400 uppercase pb-2 border-b-2 border-black">
              THÔNG TIN NHIỆM VỤ
            </h4>
            <div className="space-y-3 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-gray-400">Loại</span>
                <span className="text-gray-900">{activeTask.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deadline</span>
                <span className="text-gray-900">{activeTask.deadline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Còn lại</span>
                <span className={activeTask.remaining.includes('Hết hạn') ? 'text-[#E63946]' : 'text-gray-900'}>
                  {activeTask.remaining}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Block: Timeline steps */}
          <div className="bg-white border-2 border-black rounded-none p-5 shadow-xs space-y-4">
            <h4 className="text-[10px] font-black tracking-widest text-gray-400 uppercase pb-2 border-b-2 border-black">
              TIẾN TRÌNH NỘP BÀI
            </h4>
            <div className="relative pl-5 space-y-6 before:content-[''] before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {activeTask.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start text-xs font-bold">
                  {/* Circle indicator */}
                  <span className={`absolute -left-[20px] top-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    step.completed
                      ? 'bg-[#E63946] border-[#E63946]'
                      : 'bg-white border-gray-300'
                  }`}>
                    {step.completed && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                  
                  <div className="flex flex-col gap-0.5 pl-1.5">
                    <span className="text-gray-400 text-[10px]">{step.date}</span>
                    <span className={step.completed ? 'text-gray-900 font-extrabold' : 'text-gray-400 font-medium'}>
                      {step.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: LATEST FEEDBACK & FORM NỘP LẠI (Spans 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-4">
            Ý KIẾN PHẢN HỒI
          </h3>
          
          {/* Top block: LATEST FEEDBACK */}
          <div className="bg-white border-2 border-black rounded-none shadow-sm overflow-hidden">
            {/* Header tab card block */}
            <div className="bg-[#1c1c1f] text-white py-3.5 px-4 flex justify-between items-center border-b-2 border-black">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">LATEST FEEDBACK</span>
                <span className="text-[9px] font-bold text-zinc-500 mt-0.5">{activeTask.comments.length} góp ý từ nhóm sáng tạo</span>
              </div>
              <span className="bg-[#E63946] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-none uppercase tracking-wide">
                TASK {activeTask.id}
              </span>
            </div>

            {/* List of comment cards */}
            <div className="p-4 space-y-4 max-h-[36vh] overflow-y-auto">
              {activeTask.comments.length === 0 ? (
                <p className="text-xs font-bold text-gray-400 text-center py-6">
                  Chưa có nhận xét nào được gửi cho nhiệm vụ này.
                </p>
              ) : (
                activeTask.comments.map((comment) => (
                  <div key={comment.id} className="border border-black rounded-none p-4 bg-gray-50/50 flex flex-col gap-2.5">
                    
                    {/* User info details */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center shadow-xs flex-shrink-0 ${comment.avatarColor}`}>
                          {comment.avatar}
                        </div>
                        <div className="leading-tight">
                          <h5 className="text-xs font-black text-gray-900">{comment.sender}</h5>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">{comment.role}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-bold text-gray-400 lowercase">{comment.time}</span>
                        {comment.isUrgent && (
                          <span className="bg-[#E63946] text-white text-[8px] font-black px-1 py-0.2 rounded uppercase flex items-center gap-0.5">
                            <AlertCircle className="w-2 h-2" /> URGENT
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content text comment */}
                    <p className="text-xs font-semibold text-gray-700 leading-relaxed bg-white p-3 rounded-none border border-black/20">
                      {comment.content}
                    </p>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom block: FORM NỘP BẢN SỬA ĐỔI */}
          <div className="bg-white border-2 border-black rounded-none p-5 shadow-xs">
            <div className="pb-3 border-b-2 border-black mb-4 flex items-center gap-2 text-[#E63946]">
              <MessageSquare className="w-4 h-4" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                Nộp bản sửa đổi - {activeTask.id}
              </h4>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Revision note textarea */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Ghi chú chỉnh sửa theo phản hồi... *
                </label>
                <textarea
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Em đã chỉnh lại ánh mắt nhân vật Hiroshi giận dữ hơn..."
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-black rounded-none text-xs font-sans focus:outline-none focus:bg-red-50/10 text-gray-800 bg-white"
                />
              </div>

              {/* Version & Date Inputs row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Phiên bản *</label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black rounded-none text-xs font-sans focus:outline-none focus:bg-red-50/10 text-gray-800 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Ngày nộp *</label>
                  <input
                    type="text"
                    required
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black rounded-none text-xs font-sans focus:outline-none focus:bg-red-50/10 text-gray-800 bg-white"
                  />
                </div>
              </div>

              {/* Drag and drop uploader container */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Đính kèm bản vẽ sửa đổi *</label>
                <div className="relative border-2 border-dashed border-black hover:bg-red-50/10 bg-gray-50/50 rounded-none p-4 text-center cursor-pointer transition-colors group">
                  <input
                    type="file"
                    id="revisionFile"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Paperclip className="w-5 h-5 text-gray-400 group-hover:text-[#E63946] transition-colors" />
                    <p className="text-xs font-bold text-gray-500 group-hover:text-gray-800 truncate max-w-full px-2">
                      {fileName || 'Kéo thả hoặc click để đính kèm *'}
                    </p>
                    <span className="text-[9px] text-gray-400 font-medium">
                      .psd - .png - .jpg - .zip
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit paper plane button */}
              <button
                type="submit"
                className="w-full bg-[#E63946] text-white font-extrabold text-xs py-3 rounded-none border-2 border-black shadow-sm hover:bg-red-600 transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Gửi bản sửa đổi
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  )
}
