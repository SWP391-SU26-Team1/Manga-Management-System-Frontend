import React from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Sidebar as MangakaSidebar } from './MangakaSidebar'
import { Header as MangakaHeader } from './MangakaHeader'

export default function MangakaLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const storedUser = localStorage.getItem('mangaflow_user')
  if (!storedUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-manga-ink overflow-hidden">
      <MangakaSidebar />
      <div className="flex-1 flex flex-col ml-64 h-full overflow-hidden">
        <MangakaHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          {location.pathname !== '/dashboard/mangaka' && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-manga-ink hover:text-manga-red transition-colors mb-6 focus:outline-none"
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
