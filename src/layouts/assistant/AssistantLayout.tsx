import React from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Sidebar as AssistantSidebar } from './AssistantSidebar'
import { Header as AssistantHeader } from './AssistantHeader'

export default function AssistantLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const storedUser = localStorage.getItem('mangaflow_user')
  if (!storedUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-manga-ink overflow-hidden">
      <AssistantSidebar />
      <div className="flex-1 flex flex-col ml-64 h-full overflow-hidden">
        <AssistantHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          {location.pathname !== '/dashboard/assistant' && (
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
