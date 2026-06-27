import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Clock,
  ClipboardCheck,
  MessageSquareText,
  GitBranch,
  AlertTriangle,
  TrendingUp,
  FileBarChart,
  ShieldAlert,
  Users,
  Settings,
  LogOut
} from 'lucide-react'

const MENU_ITEMS = [
  { path: '/dashboard/tantou-editor', icon: LayoutDashboard, label: 'Trang Chủ', exact: true },
  { path: '/dashboard/tantou-editor/series', icon: BookOpen, label: 'Series Phụ Trách' },
  { path: '/dashboard/tantou-editor/chapters', icon: FileText, label: 'Chapter / Page' },
  { path: '/dashboard/tantou-editor/studio-progress', icon: Clock, label: 'Giám Sát Chương' },
  { path: '/dashboard/tantou-editor/manuscript-review', icon: ClipboardCheck, label: 'Review Bản Thảo' },
  { path: '/dashboard/tantou-editor/feedback', icon: MessageSquareText, label: 'Phản Hồi & Nộp Lại' },
  { path: '/dashboard/tantou-editor/workflow', icon: GitBranch, label: 'Quy Trình Duyệt' },
  { path: '/dashboard/tantou-editor/alerts', icon: AlertTriangle, label: 'Cảnh Báo' },
  { path: '/dashboard/tantou-editor/ranking', icon: TrendingUp, label: 'Ranking / Hiệu Suất' },
  { path: '/dashboard/tantou-editor/reports', icon: FileBarChart, label: 'Báo Cáo' },
  { path: '/dashboard/tantou-editor/series-defense', icon: ShieldAlert, label: 'Bảo Vệ Series' },
  { path: '/dashboard/tantou-editor/team', icon: Users, label: 'Nhóm Làm Việc' },
]

export default function TantouSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('mangaflow_user')
    navigate('/login')
  }

  // Get user from local storage
  const storedUser = localStorage.getItem('mangaflow_user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const userName = user?.fullName || user?.name || user?.user?.fullName || user?.user?.name || 'Tanaka Keiko'
  const userRole = (user?.role === 'EDITOR' || user?.user?.role === 'EDITOR') ? 'Tantou Editor' : 'Unknown Role'
  const currentAvatar = user?.avatarUrl || user?.user?.avatarUrl || user?.avatar_url || user?.user?.avatar_url

  return (
    <aside className="w-64 h-screen bg-white border-r-4 border-manga-ink flex flex-col fixed top-0 left-0 z-40">
      {/* Header */}
      <div className="p-5 border-b-2 border-manga-ink bg-white flex-shrink-0">
        <Link to="/dashboard/tantou-editor" className="block">
          <h1 className="font-manga text-3xl font-bold uppercase text-manga-red tracking-wide">
            MANGAFLOW
          </h1>
        </Link>
        <p className="font-bold text-manga-ink mt-1 text-sm leading-tight">
          Phòng làm việc Tantou
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)

            const Icon = item.icon
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 font-bold text-sm transition-all border-2 ${
                  isActive
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

      {/* Bottom Section */}
      <div className="p-3 border-t-2 border-manga-ink bg-white space-y-2 flex-shrink-0">
        <Link
          to="/dashboard/tantou-editor/settings"
          className={`flex items-center gap-3 px-3 py-2.5 font-bold text-sm transition-all border-2 w-full ${
            location.pathname === '/dashboard/tantou-editor/settings'
              ? 'bg-red-500 text-white border-black'
              : 'bg-white text-black hover:bg-red-50 border-transparent'
          }`}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span>Cài đặt</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 font-bold text-sm text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-black transition-all w-full text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Đăng xuất</span>
        </button>

        {/* Profile info with neo-brutalist styling */}
        <div className="flex items-center gap-2 p-2 border-2 border-manga-ink bg-white rounded-none">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-manga-ink flex items-center justify-center font-extrabold text-xs shadow-sm flex-shrink-0 bg-red-500 text-white">
            {currentAvatar ? (
              <img src={currentAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              userName.charAt(0)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-manga-ink truncate max-w-[150px] leading-tight">
              {userName}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter truncate leading-none mt-0.5">
              {userRole}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
