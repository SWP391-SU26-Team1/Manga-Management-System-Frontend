import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import {
  LayoutDashboard,
  History,
  AlertTriangle,
  BookOpen,
  Award,
  Vote,
  Settings,
  LogOut,
  FileText
} from 'lucide-react'

// Main panel menu items
const mainMenuItems = [
  {
    label: "Review Session",
    path: "/dashboard/editorial-board/proposals",
    icon: FileText
  },

  {
    label: "Bảng Xếp Hạng",
    path: "/dashboard/editorial-board/rankings",
    icon: Award
  },
  {
    label: "Lịch sử",
    path: "/dashboard/editorial-board/history",
    icon: History
  }
]

export default function BoardSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  // Dynamic user profile state and listener
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
  const userRoleText = 'Member Editor'
  const userInitials = displayName === 'Minamoto Shizuka' ? 'MS' : (displayName.split(' ').pop()?.slice(0, 2).toUpperCase() || 'ME')

  const handleLogout = () => {
    localStorage.removeItem('mangaflow_user')
    navigate('/login')
  }

  // Check if we are inside a chapter review flow
  const reviewMatch = location.pathname.match(/\/dashboard\/editorial-board\/review\/([^/]+)/)
  const isReviewMode = !!reviewMatch
  const chapterId = reviewMatch ? reviewMatch[1] : ''

  // Review panel menu items (depends on active chapter ID and role)
  const searchStr = location.search || ''
  const reviewMenuItems = [
    {
      label: "Xem Bản Thảo",
      path: `/dashboard/editorial-board/review/${chapterId}/draft${searchStr}`,
      icon: BookOpen
    },
    {
      label: "Chấm Điểm",
      path: `/dashboard/editorial-board/review/${chapterId}/score${searchStr}`,
      icon: Award
    },
    {
      label: "Vote",
      path: `/dashboard/editorial-board/review/${chapterId}/vote${searchStr}`,
      icon: Vote
    }
  ]

  const activeMenuItems = isReviewMode ? reviewMenuItems : mainMenuItems

  const checkIsActive = (itemPath: string, exact?: boolean) => {
    const basePath = itemPath.split('?')[0]
    if (exact) {
      return location.pathname === basePath
    }
    return location.pathname.startsWith(basePath)
  }



  return (
    <>
      <aside className="w-64 h-screen bg-white border-r-4 border-manga-ink flex flex-col justify-between fixed top-0 left-0 z-40 font-sans">
        <div>
          {/* Logo Section */}
          <div className="p-5 border-b-2 border-manga-ink bg-white">
            <Link to="/dashboard/editorial-board" className="block">
              <h1 className="font-manga text-3xl font-bold uppercase text-manga-red tracking-wide">
                MANGAFLOW
              </h1>
            </Link>
            <p className="font-bold text-manga-ink mt-1 text-sm leading-tight">
              Hội đồng biên tập
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 py-4 space-y-1 overflow-y-auto">
            {activeMenuItems.map((item) => {
              const Icon = item.icon
              const active = checkIsActive(item.path, (item as any).exact)
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 font-bold text-sm transition-all border-2 ${
                    active
                      ? 'bg-manga-red text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-red-50 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="leading-tight">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Section */}
        <div className="p-3 border-t-2 border-manga-ink bg-white space-y-2">
          {/* Settings link */}
          <Link
            to="/dashboard/editorial-board/settings"
            className={`flex items-center gap-3 px-3 py-2.5 font-bold text-sm transition-all border-2 w-full ${
              location.pathname === '/dashboard/editorial-board/settings'
                ? 'bg-manga-red text-white border-black'
                : 'bg-white text-black hover:bg-red-50 border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span>Cài đặt</span>
          </Link>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 font-bold text-sm text-manga-red hover:bg-red-50 border-2 border-transparent hover:border-black transition-all w-full text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Đăng xuất</span>
          </button>

          {/* Profile Info with neo-brutalist styling */}
          <Link 
            to="/dashboard/editorial-board/profile"
            className="flex items-center gap-2 p-2 border-2 border-manga-ink bg-white rounded-none hover:bg-zinc-50 transition-colors block"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-manga-ink flex items-center justify-center font-extrabold text-xs shadow-sm flex-shrink-0 bg-manga-red text-white">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                userInitials
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-manga-ink truncate max-w-[150px] leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter truncate leading-none mt-0.5">
                {userRoleText}
              </p>
            </div>
          </Link>
        </div>
      </aside>

    </>
  )
}
