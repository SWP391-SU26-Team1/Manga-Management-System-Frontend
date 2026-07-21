import React from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import BoardSidebar from './BoardSidebar'
import BoardHeader from './BoardHeader'

export default function BoardLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const storedUser = localStorage.getItem('mangaflow_user')
  if (!storedUser) {
    return <Navigate to="/login" replace />
  }

  const user = JSON.parse(storedUser)
  const isBoardRole = ['BOARD', 'CHIEF_EDITOR', 'ADMIN'].includes(user.role?.toUpperCase())
  
  if (!isBoardRole) {
    return <Navigate to="/login" replace />
  }

  const isHome = location.pathname === '/dashboard/editorial-board' || location.pathname === '/dashboard/editorial-board/'

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-manga-ink overflow-hidden">
      <BoardSidebar />
      <div className="flex-1 flex flex-col ml-64 h-full overflow-hidden">
        <BoardHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-manga-ink hover:text-manga-red transition-colors mb-6 focus:outline-none cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Quay lại</span>
            </button>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
