import React, { useState, useRef, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router'
import { Bell, ChevronRight, User, Settings, LogOut } from 'lucide-react'
import { editorService } from '@/services/editor.service'

const BASE = '/dashboard/tantou-editor'

const routeLabels: Record<string, string> = {
  [BASE]: 'Trang Chủ',
  [`${BASE}/series`]: 'Series Phụ Trách',
  [`${BASE}/chapters`]: 'Chapter / Page',
  [`${BASE}/manuscript-review`]: 'Review Bản Thảo',
  [`${BASE}/workflow`]: 'Quy Trình Duyệt',
  [`${BASE}/alerts`]: 'Cảnh Báo',
  [`${BASE}/ranking`]: 'Ranking / Hiệu Suất',
  [`${BASE}/reports`]: 'Báo Cáo',
  [`${BASE}/series-defense`]: 'Bảo Vệ Series',
  [`${BASE}/team`]: 'Nhóm Làm Việc',
  [`${BASE}/settings`]: 'Cài Đặt',
  [`${BASE}/profile`]: 'Hồ Sơ Cá Nhân',
  [`${BASE}/notifications`]: 'Thông Báo',
}

export default function TantouHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  const [lastSeenTime, setLastSeenTime] = useState<string | null>(() => {
    return localStorage.getItem('mangaflow_last_seen_time')
  })

  const updateLastSeenTime = () => {
    const now = new Date().toISOString()
    setLastSeenTime(now)
    localStorage.setItem('mangaflow_last_seen_time', now)
  }

  const parseDateSafe = (dateStr: string) => {
    if (!dateStr) return new Date()
    let formattedStr = dateStr
    if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.match(/-\d{2}:\d{2}$/)) {
      formattedStr = dateStr.replace(' ', 'T') + 'Z'
    }
    const d = new Date(formattedStr)
    return isNaN(d.getTime()) ? new Date(dateStr) : d
  }

  const getBadgeCount = () => {
    const unread = notifications.filter(n => !n.is_read)
    if (!lastSeenTime) return unread.length
    const lastSeenDate = new Date(lastSeenTime)
    return unread.filter(n => parseDateSafe(n.created_at) > lastSeenDate).length
  }

  const badgeCount = getBadgeCount()

  const handleBellClick = () => {
    const nextShow = !showNotifications
    setShowNotifications(nextShow)
    if (nextShow) {
      updateLastSeenTime()
    }
  }
  
  const notificationRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const loadNotifications = async () => {
    try {
      const res = await editorService.getNotifications()
      const list = Array.isArray(res.data) ? res.data : (res || [])
      setNotifications(list)
    } catch (err) {
      console.error('Failed to load notifications in TantouHeader:', err)
    }
  }

  useEffect(() => {
    loadNotifications()

    const handleUpdate = () => {
      loadNotifications()
    }
    window.addEventListener('mangaflow_notifications_updated', handleUpdate)

    const interval = setInterval(loadNotifications, 30000)

    return () => {
      window.removeEventListener('mangaflow_notifications_updated', handleUpdate)
      clearInterval(interval)
    }
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await editorService.markAllNotificationsRead()
      window.dispatchEvent(new Event('mangaflow_notifications_updated'))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleNotifClick = async (notif: any) => {
    if (!notif.is_read) {
      try {
        await editorService.markNotificationRead(notif.notification_id)
        window.dispatchEvent(new Event('mangaflow_notifications_updated'))
      } catch (err) {
        console.error(err)
      }
    }
    
    // Redirect logic
    const mapLink = (backendType: string): string => {
      const t = (backendType || '').toLowerCase()
      if (t.includes('manuscript')) return '/dashboard/tantou-editor/manuscript-review?tab=manuscript'
      if (t.includes('series') && !t.includes('rank_drop') && !t.includes('abandoned') && !t.includes('low_views')) return '/dashboard/tantou-editor/manuscript-review?tab=series'
      if (t.includes('feedback')) return '/dashboard/tantou-editor/notifications'
      if (t.includes('vote') || t.includes('decision')) return '/dashboard/tantou-editor/workflow'
      if (t.includes('overdue') || t.includes('abandoned') || t.includes('low_views') || t.includes('rank_drop')) return '/dashboard/tantou-editor/alerts'
      return ''
    }

    if (notif.link) {
      navigate(notif.link)
    } else {
      const targetPath = mapLink(notif.type || '')
      navigate(targetPath || '/dashboard/tantou-editor/notifications')
    }
    setShowNotifications(false)
  }

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return ''
    const safeDateStr = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`
    const date = parseDateSafe(safeDateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays === 1) return 'Hôm qua'
    return date.toLocaleDateString('vi-VN')
  }

  const translateNotification = (title: string, content: string, type: string) => {
    const t = (type || '').toLowerCase()
    const lowerTitle = (title || '').toLowerCase()

    let viTitle = title
    let viContent = content

    if (t === 'manuscript_submitted' || t === 'series_submitted' || lowerTitle.includes('manuscript submitted') || lowerTitle.includes('nộp bản thảo')) {
      viTitle = 'Cập nhật mới'
      viContent = content || 'Tác giả đã nộp bản thảo mới cần duyệt.'
    } else if (t === 'editor_feedback' || lowerTitle.includes('feedback') || lowerTitle.includes('nhận xét')) {
      viTitle = 'Ý kiến thảo luận'
      viContent = content || 'Có thảo luận hoặc ý kiến phản hồi mới.'
    } else if (t === 'task_submitted' || lowerTitle.includes('submission')) {
      viTitle = 'Trợ lý nộp bài'
      viContent = content || 'Trợ lý đã nộp bản thảo/bản vẽ mới.'
    } else if (t === 'vote_cast' || t.includes('vote') || lowerTitle.includes('vote')) {
      viTitle = 'Đóng góp ý kiến của Hội đồng'
      viContent = content || 'Thành viên Hội đồng đã bỏ phiếu duyệt.'
    } else if (t === 'decision_result' || lowerTitle.includes('decision')) {
      viTitle = 'Kết quả kiểm duyệt Hội đồng'
      viContent = content || 'Hội đồng biên tập đã phản hồi báo cáo của bạn.'
    }

    return { title: viTitle, message: viContent }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length
  const currentLabel = routeLabels[location.pathname] || 'Trang Chủ'

  useEffect(() => {
    const handleProfileUpdate = () => {
      const storedUser = localStorage.getItem('mangaflow_user')
      setUser(storedUser ? JSON.parse(storedUser) : null)
    }
    window.addEventListener('mangaflow_profile_updated', handleProfileUpdate)
    return () => window.removeEventListener('mangaflow_profile_updated', handleProfileUpdate)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('mangaflow_user')
    navigate('/login')
  }

  const displayName = user?.fullName || user?.name || user?.user?.fullName || user?.user?.name || 'Editor'
  const userInitials = displayName.split(' ').pop()?.slice(0, 2).toUpperCase() || 'ED'
  const currentAvatar = user?.avatarUrl || user?.user?.avatarUrl

  return (
    <header className="h-16 bg-white border-b-4 border-manga-ink flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm font-sans font-semibold text-gray-500">
        <Link to={BASE} className="uppercase text-xs font-bold tracking-wider text-gray-400 hover:text-gray-600 transition-colors">
          MANGAFLOW
        </Link>
        {location.pathname !== BASE && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-bold">{currentLabel}</span>
          </>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">


        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button 
            id="notification-bell-btn"
            onClick={handleBellClick}
            className="relative cursor-pointer hover:text-[#E63946] transition-colors focus:outline-none bg-transparent border-0 p-1 flex items-center"
          >
            <Bell className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-colors" />
            {badgeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E63946] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {badgeCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div id="notification-dropdown" className="absolute right-0 mt-2 w-80 bg-white border-2 border-black rounded-none shadow-md z-50 overflow-hidden font-sans text-gray-900 animate-fade-in">
              <div className="bg-[#1c1c1f] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-black">
                <span className="text-xs font-black uppercase tracking-wider">THÔNG BÁO</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-zinc-400 font-bold hover:text-white hover:underline cursor-pointer bg-transparent border-0"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 font-bold uppercase">
                    Không có thông báo nào
                  </div>
                ) : (
                  notifications.map(notif => {
                    const { title, message } = translateNotification(notif.title, notif.content || '', notif.type)
                    return (
                      <div 
                        key={notif.notification_id} 
                        onClick={() => handleNotifClick(notif)}
                        className={`p-3.5 hover:bg-zinc-50 transition-colors flex gap-3 items-start cursor-pointer group ${
                          !notif.is_read ? 'bg-gray-50/80' : 'bg-white'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2">
                            <h4 className={`text-xs truncate leading-tight transition-colors ${
                              !notif.is_read 
                                ? 'font-extrabold text-gray-900 group-hover:text-[#E63946]' 
                                : 'font-normal text-gray-500 group-hover:text-gray-700'
                            }`}>
                              {title}
                            </h4>
                            <span className="text-[9px] text-gray-400 font-bold flex-shrink-0">
                              {formatTimeAgo(notif.created_at)}
                            </span>
                          </div>
                          <p className={`text-[10px] leading-normal mt-1 break-words ${
                            !notif.is_read ? 'font-bold text-gray-800' : 'font-normal text-gray-400'
                          }`}>
                            {message}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] mt-2 flex-shrink-0" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
              <Link to="/dashboard/tantou-editor/notifications" className="w-full py-3 bg-white border-t-2 border-black text-center flex items-center justify-center gap-1.5 font-extrabold text-[10px] text-[#E63946] hover:bg-red-50/30 transition-colors uppercase tracking-wider cursor-pointer border-0 block">
                Xem tất cả thông báo
              </Link>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* User avatar with Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-manga-ink hover:border-[#E63946] transition-all bg-zinc-900 flex items-center justify-center text-white font-bold cursor-pointer relative shadow-sm hover:scale-105 active:scale-95 text-sm font-sans"
          >
            {currentAvatar ? (
              <img src={currentAvatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              userInitials
            )}
          </button>

          {/* User Profile Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute top-14 right-0 w-48 bg-white border-2 border-manga-ink manga-shadow-sm flex flex-col z-50">
              <Link 
                to={`${BASE}/profile`} 
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 p-3 border-b border-gray-100 hover:bg-gray-50"
              >
                <User className="w-4 h-4" /> 
                <span className="text-sm font-bold">Hồ sơ cá nhân</span>
              </Link>
              <Link 
                to={`${BASE}/settings`} 
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 p-3 border-b border-gray-100 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" /> 
                <span className="text-sm font-bold">Cài đặt</span>
              </Link>
              <button 
                onClick={() => {
                  setShowUserMenu(false)
                  handleLogout()
                }}
                className="flex items-center gap-2 p-3 text-red-600 hover:bg-red-50 w-full text-left"
              >
                <LogOut className="w-4 h-4" /> 
                <span className="text-sm font-bold">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
