import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import {
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  FileText,
  ChevronRight,
  TrendingUp,
  Clock,
  Briefcase
} from 'lucide-react'
import { assistantStore, AssistantTask } from '@/data/assistantMockData'
import { UserProfile } from '@/data/mockUsers'

export default function AssistantDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<AssistantTask[]>([])
  const location = useLocation()

  useEffect(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setTasks(assistantStore.getTasks())
  }, [])

  useEffect(() => {
    if (location.state?.scrollToNotifications || location.hash === '#notifications') {
      const element = document.getElementById('recent-notifications')
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 150)
      }
    }
  }, [location])

  const displayName = user?.fullName || 'NGUYỄN MINH KHÔI'

  // Dynamic date matching the screenshot mockup style
  const getFormattedDate = () => {
    // Return "Thứ Bảy, 16 tháng 5 2026" or similar
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
    const date = new Date()
    // For mockup accuracy we can also hardcode or use actual current date
    const dayName = days[date.getDay()]
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${dayName}, ${day} tháng ${month} ${year}`
  };

  // Stats from mockup
  const stats = {
    totalApproved: 260,
    activeProjects: 3,
    approvedThisWeek: 8,
    doingTasks: 6,
    thisMonthTasks: 68,
  }

  // Projects progress
  const projects = [
    { name: 'Dark Rising Chronicles', tasks: '15/20 nhiệm vụ', progress: 75, status: 'ACTIVE' },
    { name: 'Moonlight Academy', tasks: '12/20 nhiệm vụ', progress: 60, status: 'ACTIVE' },
    { name: 'Steel Warriors', tasks: '17/20 nhiệm vụ', progress: 85 },
  ]

  // Notifications exactly matching the mockup image
  const notifications = [
    {
      id: 1,
      type: 'URGENT',
      title: 'HẠN CHÓT SẮP ĐẾN',
      time: '30 phút trước',
      message: 'Task #1032 - Dark Rising Chronicles sẽ hết hạn trong 2 ngày (18/05/2026). Vui lòng hoàn thành và nộp bài ngay.',
      color: 'border-red-500 bg-red-50/30'
    },
    {
      id: 2,
      type: 'URGENT',
      title: 'HẠN CHÓT SẮP ĐẾN',
      time: '1 giờ trước',
      message: 'Task #1038 - Moonlight Academy deadline 20/05/2026. Bạn chưa nộp bài.',
      color: 'border-red-500 bg-red-50/30'
    },
    {
      id: 3,
      type: 'APPROVED',
      title: 'NHIỆM VỤ ĐƯỢC DUYỆT',
      time: '3 giờ trước',
      message: 'Task #1025 - Steel Warriors Lineart đã được Mangaka Akira Tanaka duyệt thành công!',
      color: 'border-green-500 bg-green-50/30'
    },
    {
      id: 4,
      type: 'FEEDBACK',
      title: 'PHẢN HỒI MỚI',
      time: '5 giờ trước',
      message: 'Akira Tanaka đã góp ý phản hồi cho Task #1042 - Character Lineart. Có 1 yêu cầu chỉnh sửa khẩn cấp.',
      color: 'border-blue-500 bg-blue-50/30'
    },
    {
      id: 5,
      type: 'REPORT',
      title: 'BÁO CÁO THÁNG 4 SẴN SÀNG',
      time: '1 ngày trước',
      message: 'Báo cáo hiệu suất tháng 4/2026 đã được tổng hợp xong. Bạn có thể tải xuống ngay.',
      color: 'border-green-500 bg-green-50/30'
    },
    {
      id: 6,
      type: 'FEEDBACK',
      title: 'PHẢN HỒI MỚI',
      time: '2 ngày trước',
      message: 'Sarah Chen (Editor) đã góp ý cho Task #1041 - Tone & Effect. Vui lòng kiểm tra và cập nhật.',
      color: 'border-blue-500 bg-blue-50/30'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto pb-12 font-sans text-gray-900">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
            CHÀO BUỔI SÁNG, <span className="text-[#E63946] uppercase">{displayName}</span>
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1.5">
            {getFormattedDate()} — Đây là tổng quan hệ thống của bạn hôm nay
          </p>
        </div>

        {/* Emergency Deadline Warning Badge */}
        <Link
          to="/dashboard/assistant/tasks"
          className="flex items-center gap-2 bg-[#E63946] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-red-600 transition-colors self-start md:self-center"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>2 HẠN CHÓT KHẨN CẤP</span>
        </Link>
      </div>

      {/* Grid of Metrics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left tall card (TỔNG SỐ NHIỆM VỤ ĐÃ DUYỆT) - spans 4 cols & 2 rows equivalent */}
        <div className="lg:col-span-5 bg-white border-2 border-black rounded-none p-6 shadow-sm flex flex-col justify-between min-h-[260px]">
          <div>
            <span className="text-xs font-black text-black uppercase tracking-widest block mb-4">
              — TỔNG SỐ NHIỆM VỤ ĐÃ DUYỆT
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-extrabold text-[#E63946] leading-none tracking-tighter">
                {stats.totalApproved}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-500 mt-4">
              Tất cả thời gian <span className="text-emerald-600 ml-2 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-extrabold">+12 nhiệm vụ tháng này</span>
            </p>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-6 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Tháng này: <strong className="text-gray-900 font-extrabold">68</strong></span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              +14%
            </span>
          </div>
        </div>

        {/* Right smaller cards (2 rows of 2 cards) - spans 7 cols */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 2: DỰ ÁN ĐANG THỰC HIỆN */}
          <div className="bg-white border-2 border-black rounded-none p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-black uppercase tracking-widest block mb-3">
                — DỰ ÁN ĐANG THỰC HIỆN
              </span>
              <span className="text-4xl font-extrabold text-[#3b82f6] leading-none">
                {stats.activeProjects}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-500 mt-4 truncate">
              {projects.map(p => p.name.split(' ')[0]).join(', ')}
            </p>
          </div>

          {/* Card 3: ĐÃ DUYỆT TUẦN NÀY */}
          <div className="bg-white border-2 border-black rounded-none p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-black uppercase tracking-widest block mb-3">
                — ĐÃ DUYỆT TUẦN NÀY
              </span>
              <span className="text-4xl font-extrabold text-[#10b981] leading-none">
                {stats.approvedThisWeek}
              </span>
            </div>
            <p className="text-xs font-bold text-emerald-600 mt-4">
              +3 so với tuần trước
            </p>
          </div>

          {/* Card 4: NHIỆM VỤ ĐANG LÀM */}
          <div className="bg-white border-2 border-black rounded-none p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-black uppercase tracking-widest block mb-3">
                — NHIỆM VỤ ĐANG LÀM
              </span>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-extrabold text-gray-900 leading-none">
                  {stats.doingTasks}
                </span>
                <span className="w-5 h-5 bg-gray-950 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center">
                  6
                </span>
              </div>
            </div>
            <p className="text-xs font-bold text-gray-500 mt-4">
              2 sắc đến hạn
            </p>
          </div>

          {/* Card 5: NHIỆM VỤ THÁNG NÀY */}
          <div className="bg-white border-2 border-black rounded-none p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-black uppercase tracking-widest block mb-3">
                — NHIỆM VỤ THÁNG NÀY
              </span>
              <span className="text-4xl font-extrabold text-gray-900 leading-none">
                {stats.thisMonthTasks}
              </span>
            </div>
            <p className="text-xs font-bold text-[#E63946] mt-4">
              +11% so với tháng trước
            </p>
          </div>

        </div>
      </div>

      {/* Main Panels Grid (Recent Notifications & Project Progress) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: THÔNG BÁO GẦN ĐÂY - spans 7 cols */}
        <div id="recent-notifications" className="lg:col-span-7 bg-white border-2 border-black rounded-none p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-extrabold tracking-wider text-gray-900 uppercase">
                THÔNG BÁO GẦN ĐÂY
              </h2>
              <span className="bg-[#E63946] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                3 khẩn cấp
              </span>
            </div>
            <Link to="/dashboard/assistant/tasks" className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-0.5 transition-colors">
              Xem tất cả &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 border border-gray-100 border-l-4 rounded-r-lg transition-all duration-200 hover:border-gray-200 hover:shadow-xs flex flex-col gap-1.5 ${notif.color}`}
              >
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider">
                  <span className={
                    notif.type === 'URGENT' ? 'text-[#E63946]' :
                    notif.type === 'APPROVED' ? 'text-emerald-600' : 'text-blue-600'
                  }>
                    {notif.title}
                  </span>
                  <span className="text-gray-400 font-medium lowercase">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs font-semibold leading-relaxed text-gray-700">
                  {notif.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: TIẾN ĐỘ DỰ ÁN & TRUY CẬP NHANH - spans 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* TIẾN ĐỘ DỰ ÁN */}
          <div className="bg-white border-2 border-black rounded-none p-6 shadow-sm">
            <h2 className="text-base font-extrabold tracking-wider text-gray-900 uppercase pb-4 border-b border-gray-100 mb-6">
              TIẾN ĐỘ DỰ ÁN
            </h2>
            <div className="space-y-6">
              {projects.map((project, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-gray-900">{project.name}</span>
                      {project.status && (
                        <span className="bg-[#3b82f6] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                          {project.status}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-gray-400">{project.tasks}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#E63946] h-full rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase pt-0.5">
                    <span>Hoàn thành</span>
                    <span className="text-[#E63946]">{project.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TRUY CẬP NHANH */}
          <div className="bg-white border-2 border-black rounded-none p-6 shadow-sm">
            <h2 className="text-base font-extrabold tracking-wider text-gray-900 uppercase pb-4 border-b border-gray-100 mb-4">
              TRUY CẬP NHANH
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Xem tất cả nhiệm vụ', href: '/dashboard/assistant/tasks' },
                { label: 'Báo cáo hiệu suất tháng 5', href: '/dashboard/assistant/reports' },
                { label: 'Phản hồi đang chờ xử lý', href: '/dashboard/assistant/feedback' },
              ].map((link, idx) => (
                <Link
                  key={idx}
                  to={link.href}
                  className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-red-50/20 hover:border-red-100 transition-all duration-200 group"
                >
                  <span className="text-xs font-extrabold text-gray-700 group-hover:text-[#E63946] transition-colors">
                    {link.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#E63946] group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
