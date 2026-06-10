import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { Settings, LogOut } from 'lucide-react'

// Import Configs
import { mangakaNav } from '@/configs/navigation/mangakaNav'
import { assistantNav } from '@/configs/navigation/assistantNav'
import { boardNav } from '@/configs/navigation/boardNav'
import { tantouNav } from '@/configs/navigation/tantouNav'

const getNavConfig = (role: string) => {
  switch (role) {
    case 'MANGAKA': return mangakaNav;
    case 'ASSISTANT': return assistantNav;
    case 'EDITORIAL_BOARD': return boardNav;
    case 'TANTOU': return tantouNav;
    default: return [];
  }
}

const getRoleText = (role: string) => {
  switch (role) {
    case 'MANGAKA': return 'PHÒNG LÀM VIỆC MANGAKA';
    case 'ASSISTANT': return 'Phòng làm việc Trợ lý';
    case 'EDITORIAL_BOARD': return 'Editorial Board Panel';
    case 'TANTOU': return 'Tantou Editor Panel';
    default: return 'MANGAFLOW PANEL';
  }
}

const getDashboardPath = (role: string) => {
  switch (role) {
    case 'MANGAKA': return '/dashboard/mangaka';
    case 'ASSISTANT': return '/dashboard/assistant';
    case 'EDITORIAL_BOARD': return '/dashboard/board';
    case 'TANTOU': return '/dashboard/tantou';
    default: return '/';
  }
}

export function SharedSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const [user, setUser] = React.useState<any>(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  React.useEffect(() => {
    const handleProfileUpdate = () => {
      const storedUser = localStorage.getItem('mangaflow_user')
      setUser(storedUser ? JSON.parse(storedUser) : null)
    }
    window.addEventListener('mangaflow_profile_updated', handleProfileUpdate)
    return () => window.removeEventListener('mangaflow_profile_updated', handleProfileUpdate)
  }, [])

  const role = user?.role || 'MANGAKA' // fallback if not found
  const navItems = getNavConfig(role)
  const roleText = getRoleText(role)
  const dashboardPath = getDashboardPath(role)
  
  const displayName = user?.fullName || (role === 'MANGAKA' ? 'Tokuda Oda' : 'Kenji Tanaka')
  const userRoleText = user?.role || role
  const userInitials = displayName.split(' ').pop()?.slice(0, 2).toUpperCase() || 'TO'

  const handleLogout = () => {
    localStorage.removeItem('mangaflow_user')
    navigate('/login')
  }

  const checkIsActive = (item: any) => {
    if (item.exact) {
      return location.pathname === item.path
    }
    if (item.path === dashboardPath) {
      return location.pathname === dashboardPath
    }
    return location.pathname.startsWith(item.path)
  }

  return (
    <aside className="w-64 h-screen bg-white border-r-4 border-manga-ink flex flex-col justify-between fixed top-0 left-0 z-40">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo & Title */}
        <div className="p-5 border-b-2 border-manga-ink bg-white flex-shrink-0">
          <Link to={dashboardPath} className="block">
            <h1 className="font-manga text-3xl font-bold uppercase text-[#E63946] tracking-wide mb-1">
              MANGAFLOW
            </h1>
          </Link>
          <p className="font-bold text-manga-ink text-xs leading-tight uppercase tracking-wider">
            {roleText}
          </p>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = checkIsActive(item)
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all rounded-none ${active
                    ? 'bg-[#E63946] text-white border-2 border-black'
                    : 'bg-white text-black hover:bg-red-50 border-2 border-transparent'
                  }`}
              >
                {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                <span className="leading-tight">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-3 border-t-2 border-manga-ink space-y-2 bg-white flex-shrink-0">
          {/* Settings link */}
          <Link
            to={`${dashboardPath}/settings`}
            className={`flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all border-2 w-full ${location.pathname === `${dashboardPath}/settings`
                ? 'bg-[#E63946] text-white border-black'
                : 'bg-white text-black hover:bg-red-50 border-transparent'
              }`}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span>Cài đặt</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 font-bold text-sm text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-black transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Đăng xuất</span>
          </button>

          {/* Profile info with neo-brutalist styling */}
          <div className="flex items-center gap-2 p-2 border-2 border-manga-ink bg-white rounded-none">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-manga-ink flex items-center justify-center font-extrabold text-xs shadow-sm flex-shrink-0 bg-[#E63946] text-white">
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
          </div>
        </div>
      </div>
    </aside>
  )
}
