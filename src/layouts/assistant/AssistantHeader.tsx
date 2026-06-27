import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Bell, Search, AlertTriangle, CheckCircle2, MessageSquare, ExternalLink, User, Settings, LogOut, X } from 'lucide-react'
import assistantService from '@/services/assistant.service'

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<any[]>([])

  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const getTaskTypeName = (type?: string) => {
    if (!type) return 'Vẽ'
    const t = type.toLowerCase()
    if (t === 'inking') return 'Vẽ Nét'
    if (t === 'coloring') return 'Tô Màu'
    if (t === 'lettering') return 'Đi Chữ'
    if (t === 'cleaning') return 'Làm Sạch'
    if (t === 'sfx') return 'Hiệu Ứng'
    if (t === 'background') return 'Phông Nền'
    return type
  }

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays === 1) return 'Hôm qua'
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const loadNotifications = async () => {
    try {
      const [notifsRes, tasksRes] = await Promise.all([
        assistantService.listNotifications({ limit: 6 }),
        assistantService.listMyTasks({ limit: 100 })
      ])
      
      const allTasks = tasksRes?.data || []
      
      // Calculate local overdue warnings
      const overdueTasks = allTasks.filter(task => {
        if (!task.deadline || task.status === 'completed' || task.status === 'approved') return false
        if (localStorage.getItem(`mangaflow_read_local_notification_${task.task_id}`) === 'true') return false
        return new Date().getTime() > new Date(task.deadline).getTime()
      })

      const localOverdueNotifs = overdueTasks.map((task: any) => ({
        notification_id: `local_overdue_${task.task_id}`,
        user_id: '',
        title: 'CẢNH BÁO QUÁ HẠN!',
        content: `Nhiệm vụ [${getTaskTypeName(task.task_type)}] của Ch.${task.page?.chapter?.title ? parseInt(task.page.chapter.title.replace(/\D/g, '')) || 1 : 1} - Trang ${task.page?.page_number || 1} (${task.page?.chapter?.series?.title || ''}) đã quá hạn chót nộp bài. Hãy khẩn trương hoàn thành!`,
        type: 'URGENT',
        is_read: false,
        created_at: new Date().toISOString()
      }))

      const combined = [...localOverdueNotifs, ...(notifsRes?.data || [])].slice(0, 6)
      setNotifications(combined)

      // Calculate unread count (unread database notifs + local overdue notifs)
      const dbUnreadCount = notifsRes?.data?.filter((n: any) => !n.is_read).length || 0
      setUnreadCount(dbUnreadCount + localOverdueNotifs.length)
    } catch (e) {
      console.error('Error loading header notifications:', e)
    }
  }

  const handleMarkSingleRead = async (id: string) => {
    try {
      if (id.startsWith('local_overdue_')) {
        const taskId = id.replace('local_overdue_', '')
        localStorage.setItem(`mangaflow_read_local_notification_${taskId}`, 'true')
      } else {
        await assistantService.markRead(id)
      }
      loadNotifications()
      window.dispatchEvent(new Event('mangaflow_notifications_updated'))
    } catch (e) {
      console.error('Failed to mark read:', e)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await assistantService.markAllRead()
      notifications.forEach(n => {
        if (n.notification_id.startsWith('local_overdue_')) {
          const taskId = n.notification_id.replace('local_overdue_', '')
          localStorage.setItem(`mangaflow_read_local_notification_${taskId}`, 'true')
        }
      })
      loadNotifications()
      window.dispatchEvent(new Event('mangaflow_notifications_updated'))
    } catch (e) {
      console.error('Failed to mark all read:', e)
    }
  }

  useEffect(() => {
    loadNotifications()
    window.addEventListener('mangaflow_notifications_updated', loadNotifications)
    return () => {
      window.removeEventListener('mangaflow_notifications_updated', loadNotifications)
    }
  }, [location.pathname])

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

  const displayName = user?.fullName || 'Kenji Tanaka'
  const userInitials = displayName === 'Kenji Tanaka' ? 'KT' : (displayName.split(' ').pop()?.slice(0, 2).toUpperCase() || 'KT')

  const handleLogout = () => {
    localStorage.removeItem('mangaflow_user')
    navigate('/login')
  }

  const translateNotification = (title: string, content: string) => {
    let t = title || ''
    let c = content || ''

    const titleLower = t.toLowerCase()
    if (titleLower.includes('submission approved')) {
      t = 'Bản nộp đã được duyệt'
    } else if (titleLower.includes('new task assigned')) {
      t = 'Nhiệm vụ mới được giao'
    } else if (titleLower.includes('series approved')) {
      t = 'Bộ truyện đã được duyệt'
    } else if (titleLower.includes('revision requested')) {
      t = 'Yêu cầu chỉnh sửa'
    } else if (titleLower.includes('task completed')) {
      t = 'Nhiệm vụ đã hoàn thành'
    } else if (titleLower.includes('task rejected')) {
      t = 'Nhiệm vụ bị từ chối'
    } else if (titleLower.includes('manuscript submitted')) {
      t = 'Bản thảo đã được nộp'
    } else if (titleLower.includes('task submitted')) {
      t = 'Nhiệm vụ đã nộp'
    }

    const contentLower = c.toLowerCase()
    if (contentLower.includes('your page version') && contentLower.includes('has been approved')) {
      const match = c.match(/version\s+(\d+)/i)
      const versionNum = match ? match[1] : '1'
      c = `Phiên bản trang ${versionNum} của bạn đã được phê duyệt.`
    } else if (contentLower.includes('you have been assigned a new')) {
      let taskType = ''
      if (contentLower.includes('inking')) taskType = 'vẽ nét (Inking)'
      else if (contentLower.includes('coloring')) taskType = 'tô màu (Coloring)'
      else if (contentLower.includes('lettering')) taskType = 'đi chữ (Lettering)'
      else if (contentLower.includes('cleaning')) taskType = 'làm sạch (Cleaning)'
      else if (contentLower.includes('sfx')) taskType = 'hiệu ứng (SFX)'
      else if (contentLower.includes('background')) taskType = 'vẽ nền (Background)'
      
      c = `Bạn vừa được phân công một nhiệm vụ ${taskType || 'vẽ'} mới.`
    } else if (contentLower.includes('series decision: approved')) {
      c = 'Quyết định cho bộ truyện: Đã duyệt thành công.'
    } else if (contentLower.includes('please revise your submission')) {
      c = 'Vui lòng kiểm tra và chỉnh sửa lại bản vẽ của bạn.'
    } else if (contentLower.includes('your task has been completed')) {
      c = 'Nhiệm vụ của bạn đã được ghi nhận hoàn thành.'
    } else if (contentLower.includes('your task has been rejected')) {
      c = 'Bản nộp nhiệm vụ của bạn không được phê duyệt và bị từ chối.'
    } else if (contentLower.includes('a task has been submitted for review')) {
      c = 'Nhiệm vụ đã được nộp và đang chờ tác giả phê duyệt.'
    }

    return { title: t, content: c }
  }

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (showNotifications && !target.closest('#notification-bell-btn') && !target.closest('#notification-dropdown')) {
        setShowNotifications(false)
      }
      if (showProfile && profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [showNotifications, showProfile])

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

  // Notifications automatically loaded in path change useEffect

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
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-zinc-400 font-bold hover:text-white hover:underline cursor-pointer bg-transparent border-0"
                >
                  Đánh dấu đã đọc
                </button>
              </div>

              {/* Body */}
              <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-semibold text-xs uppercase tracking-wider">
                    Không có thông báo mới
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isUrgent = notif.type === 'URGENT' || notif.type?.toLowerCase().includes('risk') || notif.type?.toLowerCase().includes('overdue')
                    const isApproved = notif.type === 'APPROVED' || notif.type?.toLowerCase().includes('approve') || notif.type?.toLowerCase().includes('success')
                    
                    const Icon = isUrgent ? AlertTriangle : isApproved ? CheckCircle2 : MessageSquare
                    const iconColor = isUrgent ? 'text-[#E63946]' : isApproved ? 'text-emerald-500' : 'text-blue-500'
                    const translated = translateNotification(notif.title, notif.content)

                    return (
                      <div
                        key={notif.notification_id}
                        onClick={() => handleMarkSingleRead(notif.notification_id)}
                        className="p-3.5 hover:bg-zinc-50 transition-colors flex gap-3 items-start cursor-pointer group"
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2">
                            <h4 className="text-xs font-extrabold text-gray-900 truncate leading-tight group-hover:text-[#E63946] transition-colors">
                              {translated.title}
                            </h4>
                            <span className="text-[9px] text-gray-400 font-bold flex-shrink-0">
                              {formatTimeAgo(notif.created_at)}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-semibold leading-normal mt-1 break-words">
                            {translated.content}
                          </p>
                        </div>

                        {/* Unread indicator red dot */}
                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] mt-2 flex-shrink-0" />
                        )}
                      </div>
                    )
                  })
                )}
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

        {/* User avatar circular box with dropdown wrapper */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-manga-ink hover:border-[#E63946] transition-all bg-zinc-900 flex items-center justify-center text-white font-bold cursor-pointer relative shadow-sm hover:scale-105 active:scale-95"
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
                to="/dashboard/assistant/profile"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-zinc-50 transition-colors"
              >
                <User className="w-4 h-4 text-black" />
                <span className="text-sm font-bold text-black">Hồ sơ cá nhân</span>
              </Link>
              <Link
                to="/dashboard/assistant/settings"
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
                className="flex items-center gap-3 px-4 py-3 text-[#E63946] bg-red-50/50 hover:bg-red-100/50 transition-colors w-full text-left font-bold border-0 cursor-pointer"
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
