import React from 'react'
import { Link, useLocation } from 'react-router'

type StoredAdminUser = {
  username?: string
  fullName?: string
  name?: string
  email?: string
  avatarUrl?: string
  avatar_url?: string
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

  const displayName = user?.username || user?.fullName || user?.name || user?.email || 'admin'
  const displayRole = user?.role?.toLowerCase() === 'admin' ? 'Quyền quản trị' : user?.role || 'Quyền quản trị'
  const avatarUrl = user?.avatarUrl || user?.avatar_url || `https://i.pravatar.cc/80?u=${encodeURIComponent(displayName)}`

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b-2 border-manga-ink bg-white px-5 md:px-8">
      <div className="flex min-w-0 items-center gap-3 text-sm font-black uppercase">
        <span className="hidden text-gray-500 sm:inline">MangaFlow</span>
        <span className="hidden text-gray-400 sm:inline">&gt;</span>
        <span className="truncate text-manga-red">{currentLabel}</span>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/dashboard/admin/profile" className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-black uppercase leading-none">{displayName}</p>
            <p className="mt-1 text-[10px] font-black uppercase text-gray-500">{displayRole}</p>
          </div>
          <img src={avatarUrl} alt={displayName} className="h-11 w-11 border-2 border-manga-ink object-cover" />
        </Link>
      </div>
    </header>
  )
}
