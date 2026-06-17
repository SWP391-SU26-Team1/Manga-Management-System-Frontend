import React from 'react'
import { Bell, HelpCircle, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router'

type StoredAdminUser = {
  username?: string
  fullName?: string
  email?: string
  avatarUrl?: string
  role?: string
}

const labelByPath: Record<string, string> = {
  '/dashboard/admin': 'Tổng quan',
  '/dashboard/admin/users': 'Người dùng',
  '/dashboard/admin/profile': 'Hồ sơ cá nhân',
  '/dashboard/admin/series': 'Series',
  '/dashboard/admin/chapters': 'Chương',
  '/dashboard/admin/tasks': 'Công việc',
  '/dashboard/admin/review-sessions': 'Phiên đánh giá',
  '/dashboard/admin/votes': 'Bình chọn',
  '/dashboard/admin/rankings': 'Xếp hạng',
  '/dashboard/admin/notifications': 'Thông báo',
}

export default function AdminHeader() {
  const location = useLocation()
  const currentLabel = labelByPath[location.pathname] || 'Quản trị'
  const [user, setUser] = React.useState<StoredAdminUser | null>(() => {
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

  const displayName = user?.username || user?.fullName || user?.email || 'admin'
  const displayRole = user?.role === 'ADMIN' ? 'Quyền quản trị' : user?.role || 'Quyền quản trị'
  const avatarUrl = user?.avatarUrl || `https://i.pravatar.cc/80?u=${encodeURIComponent(displayName)}`

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b-2 border-manga-ink bg-white px-8">
      <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
        <span className="text-gray-500">MangaFlow</span>
        <span className="text-gray-400">&gt;</span>
        <span className="text-manga-red">{currentLabel}</span>
      </div>

      <div className="flex items-center gap-5">
        <label className="relative hidden w-[360px] items-center lg:flex">
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-manga-ink" />
          <input
            type="search"
            placeholder="Tìm kiếm trong khu quản trị..."
            className="h-12 w-full border-2 border-manga-ink bg-white pl-12 pr-4 text-sm font-bold outline-none focus:shadow-[4px_4px_0_rgba(0,0,0,1)]"
          />
        </label>

        <button className="relative flex h-12 w-12 items-center justify-center border-2 border-manga-ink bg-white">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center border-2 border-manga-ink bg-manga-red text-[10px] font-black text-white">
            5
          </span>
        </button>

        <button className="hidden h-12 w-12 items-center justify-center border-2 border-manga-ink bg-white lg:flex">
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="h-10 w-px bg-manga-ink" />

        <Link to="/dashboard/admin/profile" className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-black uppercase leading-none">{displayName}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500">{displayRole}</p>
          </div>
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-11 w-11 border-2 border-manga-ink object-cover"
          />
        </Link>
      </div>
    </header>
  )
}
