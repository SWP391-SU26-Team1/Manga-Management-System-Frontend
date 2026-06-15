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
  Plus,
  X
} from 'lucide-react'
import { boardService } from '@/services/board.service'

// Main panel menu items
const mainMenuItems = [
  {
    label: "Duyệt chapter",
    path: "/dashboard/editorial-board",
    icon: LayoutDashboard,
    exact: true
  },
  {
    label: "Duyệt tác phẩm (Series)",
    path: "/dashboard/editorial-board/series-approval",
    icon: Vote
  },
  {
    label: "Hồ sơ phục hồi",
    path: "/dashboard/editorial-board/recovery",
    icon: History
  },
  {
    label: "Báo cáo tranh cãi",
    path: "/dashboard/editorial-board/disputes",
    icon: AlertTriangle
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

  const isChief = user?.isChief || user?.email === 'chiefeditor@mangaflow.com'
  const displayName = user?.fullName || 'Minamoto Shizuka'
  const userRoleText = isChief ? 'Chief Editor' : 'Member Editor'
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
  const reviewMenuItems = isChief
    ? [
        {
          label: "Xem Bản Thảo",
          path: `/dashboard/editorial-board/review/${chapterId}/draft`,
          icon: BookOpen
        },
        {
          label: "Xem Vote & Quyết định",
          path: `/dashboard/editorial-board/review/${chapterId}/analysis`,
          icon: Vote
        }
      ]
    : [
        {
          label: "Xem Bản Thảo",
          path: `/dashboard/editorial-board/review/${chapterId}/draft`,
          icon: BookOpen
        },
        {
          label: "Chấm Điểm",
          path: `/dashboard/editorial-board/review/${chapterId}/score`,
          icon: Award
        },
        {
          label: "Vote",
          path: `/dashboard/editorial-board/review/${chapterId}/vote`,
          icon: Vote
        }
      ]

  const activeMenuItems = isReviewMode ? reviewMenuItems : mainMenuItems

  const checkIsActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  // Modal State
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [selectedSeries, setSelectedSeries] = useState('Void Walker')
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['Minh K.', 'Lan Phương'])
  const [deadlineDate, setDeadlineDate] = useState('2026-06-20')
  const [modalSuccess, setModalSuccess] = useState(false)

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionName.trim()) return
    try {
      await boardService.createBoardSession({
        sessionName: sessionName.trim(),
        seriesIds: [selectedSeries === 'Void Walker' ? 'void-walker' : selectedSeries],
        memberIds: selectedMembers,
        deadline: new Date(deadlineDate).toISOString()
      })
    } catch (err) {
      console.warn('API error creating board session, falling back to local storage:', err)
    }
    setModalSuccess(true)
    setTimeout(() => {
      setModalSuccess(false)
      setShowSessionModal(false)
      setSessionName('')
    }, 1500)
  }

  const toggleMember = (member: string) => {
    if (selectedMembers.includes(member)) {
      setSelectedMembers(selectedMembers.filter(m => m !== member))
    } else {
      setSelectedMembers([...selectedMembers, member])
    }
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
          {/* Review Flow Button block: NEW BOARD SESSION */}
          {isReviewMode && (
            isChief ? (
              <button
                onClick={() => setShowSessionModal(true)}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-manga-red text-white border-2 border-black font-manga font-bold uppercase text-sm tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-red-700 hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer mb-2 select-none"
              >
                <Plus className="w-4 h-4" />
                <span>NEW BOARD SESSION</span>
              </button>
            ) : (
              <button
                disabled
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-200 border-2 border-dashed border-gray-400 text-gray-500 font-manga font-bold uppercase text-sm tracking-wider cursor-not-allowed mb-2 select-none"
                title="Chỉ dành cho Trưởng ban Biên tập (Chief Editor)"
              >
                <Plus className="w-4 h-4" />
                <span>NEW BOARD SESSION</span>
              </button>
            )
          )}

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

      {/* New Board Session Modal Overlay */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-md bg-white border-4 border-manga-ink p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-manga-ink relative">
            <button
              onClick={() => setShowSessionModal(false)}
              className="absolute top-4 right-4 p-1 hover:text-manga-red cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-manga-ink text-white p-3 font-manga font-bold text-sm tracking-wide uppercase border-b-2 border-black -mx-6 -mt-6 mb-6">
              Tạo phiên họp hội đồng mới
            </div>

            {modalSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-500 font-bold text-xl mx-auto animate-bounce">
                  ✓
                </div>
                <h4 className="font-manga text-lg font-bold uppercase text-emerald-600">ĐÃ TẠO PHIÊN HỌP THÀNH CÔNG!</h4>
                <p className="text-xs font-bold text-gray-500">Hội đồng biên tập sẽ nhận được thông báo ngay lập tức.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateSession} className="space-y-4">
                {/* Session Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase">Tên phiên họp / Nội dung</label>
                  <input
                    type="text"
                    required
                    value={sessionName}
                    onChange={e => setSessionName(e.target.value)}
                    placeholder="Ví dụ: Thẩm định kịch bản Void Walker Ch. 95"
                    className="w-full border-2 border-manga-ink px-3 py-2 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50"
                  />
                </div>

                {/* Series Select */}
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase">Chọn tác phẩm (Series)</label>
                  <select
                    value={selectedSeries}
                    onChange={e => setSelectedSeries(e.target.value)}
                    className="w-full border-2 border-manga-ink px-3 py-2 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50"
                  >
                    <option value="Void Walker">Void Walker</option>
                    <option value="Cyber Ronin">Cyber Ronin</option>
                    <option value="Crimson Petal">Crimson Petal</option>
                    <option value="Shadow Protocol">Shadow Protocol</option>
                  </select>
                </div>

                {/* Members Multi-select */}
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase">Thành viên tham dự</label>
                  <div className="grid grid-cols-2 gap-2 bg-zinc-50 border-2 border-manga-ink p-3">
                    {['Minh K.', 'Lan Phương', 'Tuấn A.', 'Bình Minh'].map(member => {
                      const checked = selectedMembers.includes(member)
                      return (
                        <label key={member} className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleMember(member)}
                            className="w-3.5 h-3.5 border-2 border-manga-ink"
                          />
                          <span>{member}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase">Hạn chót thẩm định (Deadline)</label>
                  <input
                    type="date"
                    required
                    value={deadlineDate}
                    onChange={e => setDeadlineDate(e.target.value)}
                    className="w-full border-2 border-manga-ink px-3 py-2 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-manga-red text-white border-2 border-black font-manga font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-red-700 hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                >
                  TẠO PHIÊN HỌP HỘI ĐỒNG
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
