import React from 'react'
import { Link, useLocation } from 'react-router'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'

type StoredAdminUser = {
  username?: string
  fullName?: string
  name?: string
  email?: string
  avatarUrl?: string
  avatar_url?: string
  role?: string
}

const labelByPath: Record<string, string> = {
  '/dashboard/admin': 'Tổng quan',
  '/dashboard/admin/users': 'Người dùng',
  '/dashboard/admin/profile': 'Hồ sơ cá nhân',
  '/dashboard/admin/series': 'Series',
  '/dashboard/admin/chapters': 'Chương',
  '/dashboard/admin/tasks': 'Công việc',
  '/dashboard/admin/review-sessions': 'Phiên đánh giá',
  '/dashboard/admin/votes': 'Bình chọn',
  '/dashboard/admin/rankings': 'Xếp hạng',
}

export default function AdminHeader() {
  const location = useLocation()
  const currentLabel = labelByPath[location.pathname] || 'Quản trị'
  const [user, setUser] = React.useState<StoredAdminUser | null>(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  
  const [isOpen, setIsOpen] = React.useState(false)
  const { notifications, unreadCount, markAllAsRead } = useNotifications()

  React.useEffect(() => {
    const handleProfileUpdate = () => {
      const storedUser = localStorage.getItem('mangaflow_user')
      setUser(storedUser ? JSON.parse(storedUser) : null)
    }
    window.addEventListener('mangaflow_profile_updated', handleProfileUpdate)
    return () => window.removeEventListener('mangaflow_profile_updated', handleProfileUpdate)
  }, [])

  const displayName = user?.username || user?.fullName || user?.name || user?.email || 'admin'
  const displayRole = user?.role?.toLowerCase() === 'admin' ? 'Quyền quản trị' : user?.role || 'Quyền quản trị'
  const avatarUrl = user?.avatarUrl || user?.avatar_url || `https://i.pravatar.cc/80?u=${encodeURIComponent(displayName)}`

  return (
    <header className="h-16 bg-white border-b-4 border-manga-ink flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex min-w-0 items-center gap-3 text-sm font-black uppercase">
        <span className="hidden text-gray-500 sm:inline">MangaFlow</span>
        <span className="hidden text-gray-400 sm:inline">&gt;</span>
        <span className="truncate text-manga-red">{currentLabel}</span>
      </div>
      <div className="flex items-center gap-6">
        {/* Notification Bell & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 border-2 border-manga-ink bg-white hover:bg-zinc-100 transition-colors focus:outline-none flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px]"
          >
            <Bell className="w-5 h-5 text-manga-ink" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-manga-red text-white text-[10px] font-black uppercase border-2 border-manga-ink flex items-center justify-center rounded-none shadow-[1px_1px_0px_rgba(0,0,0,1)] animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification List Dropdown */}
          {isOpen && (
            <>
              {/* Overlay background to click out */}
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
              
              <div className="absolute right-0 mt-3 w-80 bg-white border-4 border-manga-ink shadow-[6px_6px_0px_rgba(0,0,0,1)] z-50 overflow-hidden font-sans">
                <div className="p-3 border-b-2 border-manga-ink bg-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-manga-ink">Thông báo ({unreadCount})</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        markAllAsRead()
                      }}
                      className="text-[10px] font-bold uppercase text-manga-red hover:underline bg-transparent border-0 cursor-pointer p-0"
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto divide-y-2 divide-manga-ink">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs font-bold text-gray-500 uppercase">
                      Không có thông báo mới
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 transition-colors ${notif.unread ? 'bg-red-50/50' : 'bg-white'}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-black uppercase text-manga-ink block truncate flex-1">
                            {notif.title}
                          </span>
                          {notif.unread && (
                            <span className="w-2 h-2 bg-manga-red border border-manga-ink inline-block shrink-0 rounded-none mt-1 animate-pulse" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-600 font-bold mt-1 leading-normal break-words">
                          {notif.message}
                        </p>
                        <span className="text-[8px] text-gray-400 font-black uppercase block mt-1">
                          {notif.time}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <Link to="/dashboard/admin/profile" className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-black uppercase leading-none">{displayName}</p>
            <p className="mt-1 text-[10px] font-black uppercase text-gray-500">{displayRole}</p>
          </div>
          <img src={avatarUrl} alt={displayName} className="h-11 w-11 border-2 border-manga-ink object-cover" />
        </Link>
      </div>
    </header>
  )
}
