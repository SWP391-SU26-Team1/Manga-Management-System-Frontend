import React, { useState, useRef, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router'
import { Search, Bell, ChevronRight, User, Settings, LogOut } from 'lucide-react'

const BASE = '/dashboard/tantou-editor'

const routeLabels: Record<string, string> = {
  [BASE]: 'Trang Chủ',
  [`${BASE}/series`]: 'Series Phụ Trách',
  [`${BASE}/chapters`]: 'Chapter / Page',
  [`${BASE}/studio-progress`]: 'Tiến Độ Studio',
  [`${BASE}/manuscript-review`]: 'Review Bản Thảo',
  [`${BASE}/feedback`]: 'Phản Hồi & Nộp Lại',
  [`${BASE}/workflow`]: 'Quy Trình Duyệt',
  [`${BASE}/alerts`]: 'Cảnh Báo',
  [`${BASE}/ranking`]: 'Ranking / Hiệu Suất',
  [`${BASE}/reports`]: 'Báo Cáo',
  [`${BASE}/series-defense`]: 'Bảo Vệ Series',
  [`${BASE}/team`]: 'Nhóm Làm Việc',
  [`${BASE}/settings`]: 'Cài Đặt',
  [`${BASE}/profile`]: 'Hồ Sơ Cá Nhân',
}

const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'Có 3 trang bản thảo mới từ Yamamoto Ren cần duyệt.', time: '10 phút trước', isNew: true },
  { id: 2, text: 'Neon City Runners tụt xuống hạng #18.', time: '1 giờ trước', isNew: true },
  { id: 3, text: 'Hội đồng biên tập đã phản hồi báo cáo của bạn.', time: '3 giờ trước', isNew: false },
]

export default function TantouHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const notificationRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    return storedUser ? JSON.parse(storedUser) : null
  })

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
  const currentAvatar = user?.avatarUrl || user?.user?.avatarUrl || user?.avatar_url || user?.user?.avatar_url

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
        {/* Search Bar */}
        <div className="relative w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm (ask.../Enter)"
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E63946] focus:bg-white font-sans transition-all duration-200 text-gray-700"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button 
            id="notification-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative cursor-pointer hover:text-[#E63946] transition-colors focus:outline-none bg-transparent border-0 p-1 flex items-center"
          >
            <Bell className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-colors" />
            {MOCK_NOTIFICATIONS.some(n => n.isNew) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E63946] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                3
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div id="notification-dropdown" className="absolute right-0 mt-2 w-80 bg-white border-2 border-black rounded-none shadow-md z-50 overflow-hidden font-sans text-gray-900 animate-fade-in">
              <div className="bg-[#1c1c1f] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-black">
                <span className="text-xs font-black uppercase tracking-wider">THÔNG BÁO</span>
                <span className="text-[10px] text-zinc-400 font-bold hover:text-white hover:underline cursor-pointer bg-transparent border-0">Đánh dấu đã đọc</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                {MOCK_NOTIFICATIONS.map(notif => (
                  <div key={notif.id} className="p-3.5 hover:bg-zinc-50 transition-colors flex gap-3 items-start cursor-pointer group">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <h4 className={`text-xs font-extrabold text-gray-900 truncate leading-tight group-hover:text-[#E63946] transition-colors ${notif.isNew ? 'text-red-600' : ''}`}>
                          {notif.isNew ? 'Cập nhật mới' : 'Tin nhắn'}
                        </h4>
                        <span className="text-[9px] text-gray-400 font-bold flex-shrink-0">{notif.time}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-semibold leading-normal mt-1 break-words">{notif.text}</p>
                    </div>
                    {notif.isNew && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] mt-2 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              <Link to={`${BASE}/alerts`} className="w-full py-3 bg-white border-t-2 border-black text-center flex items-center justify-center gap-1.5 font-extrabold text-[10px] text-[#E63946] hover:bg-red-50/30 transition-colors uppercase tracking-wider cursor-pointer border-0 block">
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
