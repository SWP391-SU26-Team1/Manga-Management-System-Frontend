import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Bell, Search, AlertTriangle, RefreshCw, FileText, Star, Vote, AlertCircle, X, ExternalLink, User, Settings, LogOut } from 'lucide-react'
import { useNotifications, Notification } from '@/contexts/NotificationContext'

export default function BoardHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { notifications, unreadCount, markAllAsRead } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  useEffect(() => {
    const handleProfileUpdate = () => {
      const storedUser = localStorage.getItem('mangaflow_user')
      setUser(storedUser ? JSON.parse(storedUser) : null)
    }
    window.addEventListener('mangaflow_profile_updated', handleProfileUpdate)
    return () => {
      window.removeEventListener('mangaflow_profile_updated', handleProfileUpdate)
    }
  }, [])

  const displayName = user?.fullName || 'Minamoto Shizuka'
  const userInitials = displayName === 'Minamoto Shizuka' ? 'MS' : (displayName.split(' ').pop()?.slice(0, 2).toUpperCase() || 'ME')

  const handleLogout = () => {
    localStorage.removeItem('mangaflow_user')
    navigate('/login')
  }

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (showNotifications && !target.closest('#board-notification-bell') && !target.closest('#board-notification-dropdown')) {
        setShowNotifications(false)
      }
      if (showProfile && profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [showNotifications, showProfile])

  // Get breadcrumb path labels
  const getBreadcrumb = () => {
    const path = location.pathname
    
    if (path.startsWith('/dashboard/editorial-board/review/')) {
      const parts = path.split('/')
      const step = parts[parts.length - 1]
      let stepLabel = 'Đọc bản thảo'
      if (step === 'score') stepLabel = 'Chấm điểm'
      if (step === 'vote') stepLabel = 'Biểu quyết'
      
      return (
        <div className="flex items-center gap-2 text-sm font-sans font-semibold text-gray-500">
          <span className="uppercase text-xs font-bold tracking-wider text-gray-400">MANGAFLOW</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400 font-bold">Bỏ phiếu</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">{stepLabel}</span>
        </div>
      )
    }
    


    if (path.startsWith('/dashboard/editorial-board/recovery')) {
      return (
        <div className="flex items-center gap-2 text-sm font-sans font-semibold text-gray-500">
          <span className="uppercase text-xs font-bold tracking-wider text-gray-400">MANGAFLOW</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">Hồ sơ phục hồi</span>
        </div>
      )
    }

    if (path.startsWith('/dashboard/editorial-board/profile')) {
      return (
        <div className="flex items-center gap-2 text-sm font-sans font-semibold text-gray-500">
          <span className="uppercase text-xs font-bold tracking-wider text-gray-400">MANGAFLOW</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">Hồ sơ cá nhân</span>
        </div>
      )
    }

    if (path.startsWith('/dashboard/editorial-board/settings')) {
      return (
        <div className="flex items-center gap-2 text-sm font-sans font-semibold text-gray-500">
          <span className="uppercase text-xs font-bold tracking-wider text-gray-400">MANGAFLOW</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">Cài đặt</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 text-sm font-sans font-semibold text-gray-500">
        <span className="uppercase text-xs font-bold tracking-wider text-gray-400">MANGAFLOW</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-bold">Trang Chủ</span>
      </div>
    )
  }

  // Get round icon wrapper style based on notification type (Image 2 style)
  const getNotificationIconDetails = (type: Notification['type']) => {
    switch (type) {
      case 'REVIEW':
      case 'RISK':
        return {
          Icon: AlertTriangle,
          bgClass: 'bg-red-50 text-manga-red border-red-200',
          titleColor: 'text-[#E63946]'
        }
      case 'RESUBMIT':
        return {
          Icon: RefreshCw,
          bgClass: 'bg-emerald-50 text-emerald-500 border-emerald-200',
          titleColor: 'text-emerald-500'
        }
      case 'FEEDBACK':
        return {
          Icon: Bell,
          bgClass: 'bg-blue-50 text-blue-500 border-blue-200',
          titleColor: 'text-blue-500'
        }
      case 'OVERDUE':
        return {
          Icon: FileText,
          bgClass: 'bg-purple-50 text-purple-500 border-purple-200',
          titleColor: 'text-purple-500'
        }
      case 'RATING':
        return {
          Icon: Star,
          bgClass: 'bg-yellow-50 text-yellow-500 border-yellow-200',
          titleColor: 'text-manga-ink'
        }
      case 'VOTE':
        return {
          Icon: Vote,
          bgClass: 'bg-red-50 text-manga-red border-red-200',
          titleColor: 'text-manga-ink'
        }
      default:
        return {
          Icon: Bell,
          bgClass: 'bg-gray-50 text-gray-500 border-gray-200',
          titleColor: 'text-manga-ink'
        }
    }
  }

  return (
    <header className="h-16 bg-white border-b-4 border-manga-ink flex items-center justify-between px-8 sticky top-0 z-30 font-sans select-none">
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
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-manga-red focus:bg-white font-sans transition-all duration-200 text-gray-700 font-bold"
          />
        </div>

        {/* Notifications Icon with Dropdown overlay */}
        <div className="relative">
          <button
            id="board-notification-bell"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative cursor-pointer hover:text-manga-red transition-colors focus:outline-none bg-transparent border-0 p-1 flex items-center"
          >
            <Bell className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-manga-red text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white leading-none whitespace-nowrap">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Overlay (Designed exactly like Image 2) */}
          {showNotifications && (
            <div
              id="board-notification-dropdown"
              className="absolute right-0 mt-2 w-96 bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] z-50 overflow-hidden font-sans text-gray-950 animate-fade-in"
            >
              {/* Header block: Black bg, White text, Red mark-all-read link, close button */}
              <div className="bg-manga-ink text-white p-4 flex items-center justify-between border-b-2 border-black">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider leading-none">THÔNG BÁO</h3>
                  <span className="text-[10px] text-zinc-400 font-bold mt-1 block">{unreadCount} chưa đọc</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-manga-red font-bold hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-white hover:text-manga-red bg-transparent border-0 cursor-pointer p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body block containing round badge notifications */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
                {notifications.map((notif) => {
                  const { Icon, bgClass, titleColor } = getNotificationIconDetails(notif.type)
                  
                  return (
                    <div
                      key={notif.id}
                      className="p-4 hover:bg-zinc-50/50 transition-colors flex gap-3.5 items-start cursor-pointer group relative"
                      onClick={() => {
                        setShowNotifications(false);
                        if (notif.type === 'REVIEW' || notif.type === 'RATING' || notif.type === 'VOTE') {
                          navigate('/dashboard/editorial-board/review/cyber-ronin/draft');
                        } else {
                          navigate('/dashboard/editorial-board');
                        }
                      }}
                    >
                      {/* Left Circular Badge */}
                      <div className={`w-10 h-10 rounded-full border border-dashed flex items-center justify-center shrink-0 ${bgClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Details block */}
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className={`text-xs font-black uppercase tracking-wider leading-tight mb-1 truncate ${titleColor}`}>
                          {notif.title}
                        </h4>
                        <p className="text-[10px] text-gray-700 font-bold leading-normal mb-1">
                          {notif.message}
                        </p>
                        
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[8px] text-gray-400 font-bold uppercase">{notif.time}</span>
                          <span className="text-[9px] text-manga-red font-bold hover:underline">Xem chi tiết &gt;</span>
                        </div>
                      </div>

                      {/* Unread indicator circle on top right */}
                      {notif.unread && (
                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#E63946]" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* User avatar circular box with dropdown wrapper */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-manga-ink hover:border-manga-red transition-all bg-zinc-900 flex items-center justify-center text-white font-bold cursor-pointer relative shadow-sm hover:scale-105 active:scale-95"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm">{userInitials}</span>
            )}
          </button>

          {showProfile && (
            <div className="absolute top-12 right-0 w-52 bg-white border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col z-50">
              <Link 
                to="/dashboard/editorial-board/profile" 
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-zinc-50 transition-colors"
              >
                <User className="w-4 h-4 text-black" />
                <span className="text-sm font-bold text-black">Hồ sơ cá nhân</span>
              </Link>
              <Link 
                to="/dashboard/editorial-board/settings" 
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-zinc-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-black" />
                <span className="text-sm font-bold text-black">Cài đặt</span>
              </Link>
              <button 
                onClick={() => {
                  setShowProfile(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-4 py-3 text-manga-red bg-red-50/50 hover:bg-red-100/50 transition-colors w-full text-left font-bold border-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
