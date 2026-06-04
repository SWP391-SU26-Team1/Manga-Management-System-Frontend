import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import {
  LayoutDashboard,
  FileText,
  Layers,
  ClipboardList,
  Clock,
  Users,
  BarChart2,
  Settings,
  LogOut,
  BookOpen,
  PlusSquare,
  Archive,
  CalendarDays,
  MessageCircle,
  AlertTriangle,
  CheckSquare,
  FileWarning,
  Bell,
  UserCircle
} from 'lucide-react'

const mangakaMenuItems = [
  {
    label: "Bảng điều khiển",
    path: "/dashboard/mangaka",
    icon: LayoutDashboard,
  },
  {
    label: "Series của tôi",
    path: "/dashboard/mangaka/series",
    icon: BookOpen,
  },
  {
    label: "Tạo series mới",
    path: "/dashboard/mangaka/create-series",
    icon: PlusSquare,
  },
  {
    label: "Bản thảo",
    path: "/dashboard/mangaka/manuscripts",
    icon: FileText,
  },
  {
    label: "Chapter / Page",
    path: "/dashboard/mangaka/chapters",
    icon: Layers,
  },
  {
    label: "Giao task",
    path: "/dashboard/mangaka/assign-task",
    icon: ClipboardList,
  },
  {
    label: "Submission chờ duyệt",
    path: "/dashboard/mangaka/submission",
    icon: Clock,
  },
  {
    label: "Trợ lý",
    path: "/dashboard/mangaka/assistants",
    icon: Users,
  },
  {
    label: "Lịch trình",
    path: "/dashboard/mangaka/schedule",
    icon: CalendarDays,
  },
  {
    label: "Ranking",
    path: "/dashboard/mangaka/ranking",
    icon: BarChart2,
  },
  {
    label: "Feedback / Góp ý Editor",
    path: "/dashboard/mangaka/feedback",
    icon: MessageCircle,
  },
  {
    label: "Board Review",
    path: "/dashboard/mangaka/board-review",
    icon: CheckSquare,
  },
  {
    label: "Cảnh báo rủi ro",
    path: "/dashboard/mangaka/risk-alerts",
    icon: AlertTriangle,
  },
  {
    label: "Đề xuất cứu vãn",
    path: "/dashboard/mangaka/recovery-proposal",
    icon: FileWarning,
  },
  {
    label: "Thông báo",
    path: "/dashboard/mangaka/notifications",
    icon: Bell,
  }
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

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
      <div className="p-5 border-b-2 border-manga-ink">
        <Link to="/dashboard/mangaka" className="block">
          <h1 className="font-manga text-3xl font-bold uppercase text-manga-red tracking-wide">
            MANGAFLOW
          </h1>
        </Link>
        <p className="font-bold text-manga-ink mt-1 text-sm leading-tight">
          Phòng làm việc Mangaka
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mangakaMenuItems.map((item) => {
          const Icon = item.icon
          const active = checkIsActive(item.path)
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

      {/* Bottom Navigation */}
      <div className="p-3 border-t-2 border-manga-ink">
        <Link
          to="/dashboard/mangaka/profile"
          className={`flex items-center gap-3 px-3 py-2.5 font-bold text-sm transition-all border-2 w-full ${
            checkIsActive('/dashboard/mangaka/profile')
              ? 'bg-red-500 text-white border-black'
              : 'bg-white text-black hover:bg-red-50 border-transparent'
          }`}
        >
          <UserCircle className="w-4 h-4 flex-shrink-0" />
          <span>Hồ sơ</span>
        </Link>

        <Link
          to="/dashboard/mangaka/settings"
          className={`flex items-center gap-3 px-3 py-2.5 font-bold text-sm transition-all border-2 w-full ${
            checkIsActive('/dashboard/mangaka/settings')
              ? 'bg-red-500 text-white border-black'
              : 'bg-white text-black hover:bg-red-50 border-transparent'
          }`}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span>Cài đặt</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-manga-ink font-bold text-sm hover:bg-gray-100 transition-colors border-2 border-transparent mt-1"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
