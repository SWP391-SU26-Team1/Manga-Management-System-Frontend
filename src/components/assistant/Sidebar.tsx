import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  MessageSquare,
  PenTool,
  Settings,
  LogOut
} from 'lucide-react'

const assistantMenuItems = [
  {
    label: "Trang Chủ",
    path: "/dashboard/assistant",
    icon: LayoutDashboard,
    exact: true
  },
  {
    label: "Nhiệm Vụ",
    path: "/dashboard/assistant/tasks",
    icon: ClipboardList
  },
  {
    label: "Báo Cáo",
    path: "/dashboard/assistant/reports",
    icon: FileText
  },
  {
    label: "Phản Hồi",
    path: "/dashboard/assistant/feedback",
    icon: MessageSquare
  },
  {
    label: "Vẽ & Chỉnh Sửa",
    path: "/dashboard/assistant/drawing",
    icon: PenTool
  }
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('mangaflow_user')
    navigate('/login')
  }

  const checkIsActive = (item: typeof assistantMenuItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path
    }
    return location.pathname.startsWith(item.path)
  }

  // Fallback profile if localStorage has none
  const storedUser = localStorage.getItem('mangaflow_user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const displayName = user?.fullName || 'Kenji Tanaka'
  const userRoleText = user?.role === 'ASSISTANT' ? 'Manga Assistant' : 'Manga Assistant'
  const userInitials = displayName === 'Kenji Tanaka' ? 'TA' : (displayName.split(' ').pop()?.slice(0, 2).toUpperCase() || 'NK')

  return (
    <aside className="w-64 h-screen bg-white border-r-4 border-manga-ink flex flex-col justify-between fixed top-0 left-0 z-40">
      <div>
        {/* Logo Section */}
        <div className="p-5 border-b-2 border-manga-ink bg-white">
          <Link to="/dashboard/assistant" className="block">
            <h1 className="font-manga text-3xl font-bold uppercase text-manga-red tracking-wide">
              MANGAFLOW
            </h1>
          </Link>
          <p className="font-bold text-manga-ink mt-1 text-sm leading-tight">
            Phòng làm việc Trợ lý
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-4 space-y-1 overflow-y-auto">
          {assistantMenuItems.map((item) => {
            const Icon = item.icon
            const active = checkIsActive(item)
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 font-bold text-sm transition-all border-2 ${
                  active
                    ? 'bg-red-500 text-white border-black'
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
          to="/dashboard/assistant/settings"
          className={`flex items-center gap-3 px-3 py-2.5 font-bold text-sm transition-all border-2 w-full ${
            location.pathname === '/dashboard/assistant/settings'
              ? 'bg-red-500 text-white border-black'
              : 'bg-white text-black hover:bg-red-50 border-transparent'
          }`}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span>Cài đặt</span>
        </Link>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 font-bold text-sm text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-black transition-all w-full text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Đăng xuất</span>
        </button>

        {/* Profile info with neo-brutalist styling */}
        <div className="flex items-center gap-2 p-2 border-2 border-manga-ink bg-white rounded-none">
          <div className="w-8 h-8 rounded-full bg-red-500 text-white border-2 border-manga-ink flex items-center justify-center font-extrabold text-xs shadow-sm flex-shrink-0">
            {userInitials}
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
