import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { Search, Bell, User, LogOut, Settings } from 'lucide-react'
import SearchOverlay from '@/components/user/SearchOverlay'

export default function UserNavHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (showProfile && profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [showProfile])

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
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-manga text-2xl font-black uppercase text-manga-ink tracking-tight hover:-translate-y-0.5 transition-transform dark:text-white">
            MangaFlow
          </span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-8 font-bold text-sm">
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
              <Link to="/dashboard/user/notifications" className="text-manga-ink hover:text-manga-red transition-colors relative flex items-center dark:text-zinc-300 dark:hover:text-manga-red">
                <Bell className="w-5 h-5 stroke-[2.5]" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-manga-red rounded-full border border-white"></span>
              </Link>
              
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
