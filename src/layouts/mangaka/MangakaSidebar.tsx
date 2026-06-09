import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import {
  LayoutDashboard,
  FileText,
  Layers,
  ClipboardList,
  Clock,
  BarChart2,
  LogOut,
  BookOpen,
  PlusSquare,
  MessageCircle,
  Bell,
  Settings
} from 'lucide-react'

const mangakaMenuItems = [
  { label: 'Trang Chủ', path: '/dashboard/mangaka', icon: LayoutDashboard },
  { label: 'Series của tôi', path: '/dashboard/mangaka/series', icon: BookOpen },
  { label: 'Tạo series mới', path: '/dashboard/mangaka/create-series', icon: PlusSquare },
  { label: 'Quản lý Chapter', path: '/dashboard/mangaka/manuscripts', icon: FileText },
  { label: 'Giao việc trợ lý', path: '/dashboard/mangaka/assign-task', icon: ClipboardList },
  { label: 'Duyệt kết quả', path: '/dashboard/mangaka/submission', icon: Clock },
  { label: 'Xếp hạng & Cảnh báo', path: '/dashboard/mangaka/ranking', icon: BarChart2 },
  { label: 'Nhận xét từ Editor', path: '/dashboard/mangaka/feedback', icon: MessageCircle },
  { label: 'Thông báo', path: '/dashboard/mangaka/notifications', icon: Bell },
]

export function Sidebar() {
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

  const displayName = user?.fullName || 'Tokuda Oda'
  const userRoleText = user?.role || 'MANGAKA'
  const userInitials = displayName === 'Tokuda Oda' ? 'TO' : (displayName.split(' ').pop()?.slice(0, 2).toUpperCase() || 'TO')

  const handleLogout = () => {
    localStorage.removeItem('mangaflow_user')
    navigate('/login')
  }

  const checkIsActive = (itemPath: string) => {
    if (itemPath === '/dashboard/mangaka') {
      return location.pathname === '/dashboard/mangaka'
    }
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/')
  }

  return (
    <aside className="w-64 h-screen bg-white border-r-4 border-manga-ink flex flex-col fixed top-0 left-0 z-40">
      {/* Logo & Title */}
      <div className="p-5 border-b-2 border-manga-ink bg-white">
        <Link to="/dashboard/mangaka" className="block">
          <h1 className="font-manga text-4xl font-bold uppercase text-[#E63946] tracking-wide mb-1">
            MANGAFLOW
          </h1>
        </Link>
        <p className="font-bold text-black text-xs leading-tight uppercase tracking-wider">
          PHÒNG LÀM VIỆC MANGAKA
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-2">
        {mangakaMenuItems.map((item) => {
          const Icon = item.icon
          const active = checkIsActive(item.path)
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 font-bold text-base transition-all rounded-none ${active
                  ? 'bg-[#E63946] text-white border-2 border-black'
                  : 'bg-white text-black hover:bg-gray-50 border-2 border-transparent'
                }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t-2 border-manga-ink space-y-2">
        {/* Settings link */}
        <Link
          to="/dashboard/mangaka/settings"
          className={`flex items-center gap-3 px-4 py-3 font-bold text-sm transition-all border-2 w-full ${location.pathname === '/dashboard/mangaka/settings'
              ? 'bg-[#E63946] text-white border-black'
              : 'bg-white text-black hover:bg-red-50 border-transparent'
            }`}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span>Cài đặt</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 font-bold text-sm text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-black transition-colors"
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
    </aside>
  )
}
