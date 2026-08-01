import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { Search, Bell, User, LogOut, Settings, Clock } from 'lucide-react'
import SearchOverlay from '@/components/user/SearchOverlay'
import { readerService } from '@/services/reader.service'

export default function UserNavHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  
  const [hasNewNotifications, setHasNewNotifications] = useState(false)

  useEffect(() => {
    if (user) {
      const checkNewNotifications = async () => {
        try {
          const latest = await readerService.getLatestUpdates(1)
          if (latest && latest.length > 0) {
            const lastUpdate = latest[0].updatedAt || latest[0].createdAt
            const lastRead = localStorage.getItem('mangaflow_last_read_notifications')
            
            if (!lastRead) {
              setHasNewNotifications(true)
            } else if (lastUpdate) {
              const updateDate = new Date(lastUpdate).getTime()
              const readDate = new Date(lastRead).getTime()
              if (updateDate > readDate) {
                setHasNewNotifications(true)
              }
            }
          }
        } catch (error) {
          console.error(error)
        }
      }
      checkNewNotifications()
      
      const interval = setInterval(checkNewNotifications, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (showProfile && profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false)
      }
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [showProfile, showNotifications])

  useEffect(() => {
    if (showNotifications && notifications.length === 0) {
      setLoadingNotifications(true)
      readerService.getLatestUpdates(10).then(latest => {
        setNotifications(latest)
        setLoadingNotifications(false)
      }).catch(() => setLoadingNotifications(false))
    }
  }, [showNotifications, notifications.length])

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return ''
    const safeDateString = dateString.endsWith('Z') || dateString.includes('+') ? dateString : `${dateString}Z`
    const date = new Date(safeDateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'Vừa xong'
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    return `${Math.floor(diff / 86400)} ngày trước`
  }

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

  const handleLogout = () => {
    localStorage.removeItem('mangaflow_user')
    setUser(null)
    navigate('/login')
  }

  const displayName = user?.fullName || user?.username || 'User'
  const userInitials = displayName.split(' ').pop()?.slice(0, 2).toUpperCase() || 'U'

  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const linkClass = (path: string) => `uppercase transition-colors relative group ${isActive(path) ? 'text-manga-red' : 'text-manga-ink hover:text-manga-red dark:text-zinc-300 dark:hover:text-manga-red'}`

  return (
    <header className="sticky top-0 z-50 bg-white border-b-4 border-manga-ink w-full dark:bg-zinc-900 dark:border-black transition-colors duration-200">
      <div className="w-full px-4 md:px-8 h-24 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-start py-0">
          <img src="/images/acc76da3-e3ea-4f2c-ada1-7798cd6b7fbd.png" alt="MangaFlow" className="h-24 md:h-28 w-auto object-contain object-left hover:-translate-y-0.5 transition-transform" />
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-10 font-bold text-base md:text-lg">
          <Link to="/" className={linkClass('/')}>
            Khám Phá
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-manga-red transition-all ${isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          <Link to="/history" className={linkClass('/history')}>
            Lịch Sử
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-manga-red transition-all ${isActive('/history') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          <Link to="/rankings" className={linkClass('/rankings')}>
            Bảng Xếp Hạng
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-manga-red transition-all ${isActive('/rankings') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <button onClick={() => setIsSearchOpen(true)} className="text-manga-ink hover:text-manga-red transition-colors dark:text-zinc-300 dark:hover:text-manga-red">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </button>
          
          <Link to="/preferences" className="text-manga-ink hover:text-manga-red transition-colors dark:text-zinc-300 dark:hover:text-manga-red" title="Cài đặt trang web">
            <Settings className="w-5 h-5 stroke-[2.5]" />
          </Link>
          
          {user ? (
            <>
              <div className="relative flex items-center" ref={notificationsRef}>
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications)
                    if (!showNotifications) {
                      setHasNewNotifications(false)
                      localStorage.setItem('mangaflow_last_read_notifications', new Date().toISOString())
                    }
                  }} 
                  className="text-manga-ink hover:text-manga-red transition-colors relative flex items-center dark:text-zinc-300 dark:hover:text-manga-red"
                >
                  <Bell className="w-5 h-5 stroke-[2.5]" />
                  {hasNewNotifications && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-manga-red rounded-full border border-white"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute top-10 -right-20 md:right-0 w-[320px] md:w-[360px] bg-white border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col z-50 animate-fade-in dark:bg-zinc-800 dark:border-black dark:shadow-[4px_4px_0px_#000]">
                    <div className="flex items-center justify-between p-3 border-b-2 border-black dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900">
                      <h3 className="font-manga text-lg font-bold uppercase text-manga-ink dark:text-white">Thông Báo</h3>
                      <Link to="/dashboard/user/notifications" onClick={() => setShowNotifications(false)} className="text-[10px] font-bold text-manga-red hover:underline uppercase">Xem tất cả</Link>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
                      {loadingNotifications ? (
                        <div className="py-8 flex justify-center"><div className="animate-spin w-6 h-6 border-2 border-b-transparent border-manga-red rounded-full"></div></div>
                      ) : notifications.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-xs font-bold uppercase">Không có thông báo mới</div>
                      ) : (
                        notifications.map((n: any) => (
                          <Link key={n.id} to={`/series/${n.id}`} onClick={() => setShowNotifications(false)} className="flex gap-3 p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-zinc-600 rounded-sm">
                            <div className="w-10 h-14 bg-gray-200 flex-shrink-0 border border-black dark:border-zinc-900 overflow-hidden">
                              <img src={n.coverImageUrl || `https://ui-avatars.com/api/?name=${n.title}`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-0.5">
                                <span className="text-[9px] bg-manga-red text-white font-bold px-1 py-0.5 uppercase border border-black dark:border-red-900 leading-none">Mới Xuất Bản</span>
                                <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" /> {formatTimeAgo(n.updatedAt || n.createdAt)}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-manga-ink dark:text-gray-100 truncate mt-1">{n.title}</div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 leading-tight">Bộ truyện vừa được xuất bản và ra mắt cộng đồng.</div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setShowProfile(!showProfile)}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-manga-ink hover:border-manga-red transition-all bg-zinc-900 flex items-center justify-center text-white font-bold cursor-pointer relative shadow-sm hover:scale-105 active:scale-95"
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm">{userInitials}</span>
                    )}
                  </button>

                  {showProfile && (
                    <div className="absolute top-12 right-0 w-52 bg-white border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col z-50 animate-fade-in dark:bg-zinc-800 dark:border-black dark:shadow-[4px_4px_0px_#000]">
                      <Link 
                        to="/dashboard/user/profile" 
                        onClick={() => setShowProfile(false)}
                        className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:hover:bg-zinc-700"
                      >
                        <User className="w-4 h-4 text-black dark:text-white" />
                        <span className="text-sm font-bold text-black dark:text-white">Hồ sơ cá nhân</span>
                      </Link>
                      <Link 
                        to="/dashboard/user/settings" 
                        onClick={() => setShowProfile(false)}
                        className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:hover:bg-zinc-700"
                      >
                        <Settings className="w-4 h-4 text-black dark:text-white" />
                        <span className="text-sm font-bold text-black dark:text-white">Cài đặt</span>
                      </Link>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-manga-red hover:bg-red-50 transition-colors cursor-pointer dark:text-gray-400 dark:hover:text-manga-red dark:hover:bg-red-900/20"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="text-manga-ink hover:text-manga-red transition-colors flex items-center group font-bold uppercase text-sm gap-1 dark:text-zinc-300 dark:hover:text-manga-red">
              <User className="w-5 h-5 stroke-[2.5] group-hover:text-manga-red" />
              <span className="hidden md:inline">Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </header>
  )
}
