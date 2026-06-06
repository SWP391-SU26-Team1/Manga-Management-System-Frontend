import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Bell, Search, AlertTriangle, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react'
import { assistantStore } from '@/data/assistantMockData'

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(4) // Matches the 4 mockup items
  const [showNotifications, setShowNotifications] = useState(false)

  const dropdownNotifications = [
    {
      id: 1,
      type: 'URGENT',
      title: 'Hạn chót sắp đến',
      message: 'Task #1038 - Dark Rising Chronicles hết hạn trong 2 ngày...',
      time: '30 phút trước',
      unread: true,
    },
    {
      id: 2,
      type: 'URGENT',
      title: 'Hạn chót sắp đến',
      message: 'Task #1046 - Cyber Ronin đã quá deadline 23/05/2026...',
      time: '1 giờ trước',
      unread: true,
    },
    {
      id: 3,
      type: 'APPROVED',
      title: 'Nhiệm vụ được duyệt',
      message: 'Task #1035 - Steel Warriors Lineart đã được Mangaka Akira Tanaka duyệt...',
      time: '3 giờ trước',
      unread: true,
    },
    {
      id: 4,
      type: 'FEEDBACK',
      title: 'Phản hồi mới',
      message: 'Akira Tanaka gửi phản hồi cho Task #1042',
      time: '5 giờ trước',
      unread: true,
    }
  ]

  useEffect(() => {
    if (showNotifications) {
      const handleOutsideClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (!target.closest('#notification-bell-btn') && !target.closest('#notification-dropdown')) {
          setShowNotifications(false)
        }
      }
      document.addEventListener('click', handleOutsideClick)
      return () => document.removeEventListener('click', handleOutsideClick)
    }
  }, [showNotifications])

  // Determine breadcrumb based on current path
  const getBreadcrumb = () => {
    const path = location.pathname
    if (path === '/dashboard/assistant') {
      return (
        <div className="flex items-center gap-2 text-sm font-sans font-semibold text-gray-500">
          <span className="uppercase text-xs font-bold tracking-wider text-gray-400">MANGAFLOW</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">Trang Chủ</span>
        </div>
      )
    }
    if (path.startsWith('/dashboard/assistant/tasks')) {
      return (
        <div className="flex items-center gap-2 text-sm font-sans font-semibold text-gray-500">
          <span className="uppercase text-xs font-bold tracking-wider text-gray-400">MANGAFLOW</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">Nhiệm Vụ</span>
        </div>
      )
    }
    if (path.startsWith('/dashboard/assistant/reports')) {
      return (
        <div className="flex items-center gap-2 text-sm font-sans font-semibold text-gray-500">
          <span className="uppercase text-xs font-bold tracking-wider text-gray-400">MANGAFLOW</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">Báo Cáo</span>
        </div>
      )
    }
    if (path.startsWith('/dashboard/assistant/feedback')) {
      return (
        <div className="flex items-center gap-2 text-sm font-sans font-semibold text-gray-500">
          <span className="uppercase text-xs font-bold tracking-wider text-gray-400">MANGAFLOW</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">Phản Hồi</span>
        </div>
      )
    }
    if (path.startsWith('/dashboard/assistant/drawing')) {
      return (
        <div className="flex items-center gap-2 text-sm font-sans font-semibold text-gray-500">
          <span className="uppercase text-xs font-bold tracking-wider text-gray-400">MANGAFLOW</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">Vẽ & Chỉnh Sửa</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 text-sm font-sans font-semibold text-gray-500">
        <span className="uppercase text-xs font-bold tracking-wider text-gray-400">MANGAFLOW</span>
      </div>
    )
  }

  // Load state or simulate count
  useEffect(() => {
    const tasks = assistantStore.getTasks()
    const needFixCount = tasks.filter(t => t.status === 'Need Fix' || t.priority === 'Urgent').length
    setUnreadCount(needFixCount || 4)
  }, [location.pathname])

  return (
    <header className="h-16 bg-white border-b-4 border-manga-ink flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Breadcrumb section */}
      <div className="flex items-center">
        {getBreadcrumb()}
      </div>

      {/* Actions section */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm (ask.../Enter)"
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E63946] focus:bg-white font-sans transition-all duration-200 text-gray-700"
          />
        </div>

        {/* Notifications Icon with Dropdown overlay */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative cursor-pointer hover:text-[#E63946] transition-colors focus:outline-none bg-transparent border-0 p-1 flex items-center"
          >
            <Bell className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E63946] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Overlay */}
          {showNotifications && (
            <div
              id="notification-dropdown"
              className="absolute right-0 mt-2 w-80 bg-white border-2 border-black rounded-none shadow-md z-50 overflow-hidden font-sans text-gray-900 animate-fade-in"
            >
              {/* Header */}
              <div className="bg-[#1c1c1f] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-black">
                <span className="text-xs font-black uppercase tracking-wider">THÔNG BÁO</span>
                <button
                  onClick={() => setUnreadCount(0)}
                  className="text-[10px] text-zinc-400 font-bold hover:text-white hover:underline cursor-pointer bg-transparent border-0"
                >
                  Đánh dấu đã đọc
                </button>
              </div>

              {/* Body */}
              <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                {dropdownNotifications.map((notif) => {
                  const Icon = notif.type === 'URGENT' ? AlertTriangle : notif.type === 'APPROVED' ? CheckCircle2 : MessageSquare
                  const iconColor = notif.type === 'URGENT' ? 'text-[#E63946]' : notif.type === 'APPROVED' ? 'text-emerald-500' : 'text-blue-500'
                  
                  return (
                    <div
                      key={notif.id}
                      className="p-3.5 hover:bg-zinc-50 transition-colors flex gap-3 items-start cursor-pointer group"
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="text-xs font-extrabold text-gray-900 truncate leading-tight group-hover:text-[#E63946] transition-colors">
                            {notif.title}
                          </h4>
                          <span className="text-[9px] text-gray-400 font-bold flex-shrink-0">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-semibold leading-normal mt-1 break-words">
                          {notif.message}
                        </p>
                      </div>
                      
                      {/* Unread indicator red dot */}
                      {notif.unread && unreadCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] mt-2 flex-shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Footer Button link */}
              <button
                onClick={() => {
                  setShowNotifications(false)
                  if (location.pathname === '/dashboard/assistant') {
                    const element = document.getElementById('recent-notifications')
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' })
                    }
                  } else {
                    navigate('/dashboard/assistant', { state: { scrollToNotifications: true } })
                  }
                }}
                className="w-full py-3 bg-white border-t-2 border-black text-center flex items-center justify-center gap-1.5 font-extrabold text-[10px] text-[#E63946] hover:bg-red-50/30 transition-colors uppercase tracking-wider cursor-pointer border-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* User avatar circular box */}
        <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center border border-gray-200 shadow-sm">
          A
        </div>
      </div>
    </header>
  )
}
