import React from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { SharedSidebar } from './SharedSidebar'

interface SharedLayoutProps {
  header: React.ReactNode;
}

export function SharedLayout({ header }: SharedLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const storedUser = localStorage.getItem('mangaflow_user')
  if (!storedUser) {
    return <Navigate to="/login" replace />
  }

  let user: any = null
  try {
    user = JSON.parse(storedUser)
  } catch {
    return <Navigate to="/login" replace />
  }

  const role = user?.role // "MANGAKA", "ASSISTANT", "EDITOR", "BOARD"
  const path = location.pathname

  if (path.startsWith('/dashboard/mangaka') && role !== 'MANGAKA' && role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }
  if (path.startsWith('/dashboard/assistant') && role !== 'ASSISTANT' && role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }
  if (path.startsWith('/dashboard/tantou-editor') && role !== 'EDITOR' && role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }
  if (path.startsWith('/dashboard/editorial-board') && role !== 'BOARD' && role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }

  const isDrawingStudio = location.pathname.includes('/drawing-studio');

  const isDashboardRoot = location.pathname === '/dashboard/mangaka' || 
                          location.pathname === '/dashboard/assistant' ||
                          location.pathname === '/dashboard/editorial-board' ||
                          location.pathname === '/dashboard/tantou-editor';

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-manga-ink overflow-hidden">
      <SharedSidebar />
      <div className="flex-1 flex flex-col ml-64 h-full overflow-hidden">
        {header}
        <main className={`flex-1 relative ${isDrawingStudio ? 'p-0 overflow-hidden' : 'p-8 overflow-y-auto'}`}>
          {!isDashboardRoot && !isDrawingStudio && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-manga-ink hover:text-[#E63946] transition-colors mb-6 focus:outline-none cursor-pointer"
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
