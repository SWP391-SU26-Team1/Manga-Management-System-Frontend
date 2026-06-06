import React from 'react'
import { Outlet, Navigate, Link, useNavigate, useLocation } from 'react-router'
import { Sidebar } from '@/components/mangaka/Sidebar'
import { Header } from '@/components/mangaka/Header'
import { Sidebar as AssistantSidebar } from '@/components/assistant/Sidebar'
import { Header as AssistantHeader } from '@/components/assistant/Header'
import { LayoutDashboard, ClipboardList, CheckSquare, LogOut } from 'lucide-react'

interface DashboardLayoutProps {
  role: 'mangaka' | 'assistant' | 'tantou-editor' | 'editorial-board' | 'user'
}

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // Simple auth check — redirect to login if no user in localStorage
  const storedUser = localStorage.getItem('mangaflow_user')
  if (!storedUser) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    localStorage.removeItem('mangaflow_user')
    navigate('/login')
  }

  // For mangaka role, use the existing Sidebar + Header components
  if (role === 'mangaka') {
    return (
      <div className="flex h-screen bg-[#fafafa] font-sans text-manga-ink overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64 h-full overflow-hidden">
          <Header />
          <main className="flex-1 p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }

  // For assistant role, render a specific custom sidebar
  if (role === 'assistant') {
    return (
      <div className="flex h-screen bg-[#f3f4f6] font-sans text-[#0f0f0f] overflow-hidden">
        <AssistantSidebar />
        <div className="flex-1 flex flex-col ml-64 h-full overflow-hidden">
          <AssistantHeader />
          <main className="flex-1 p-8 overflow-y-auto bg-[#fafafa]">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }

  // For other roles, use a simple layout
  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-manga-ink overflow-hidden">
      <aside className="w-64 h-screen bg-white border-r-4 border-manga-ink flex flex-col justify-between fixed top-0 left-0 z-40">
        <div>
          <div className="p-5 border-b-2 border-manga-ink bg-[#fafafa]">
            <h1 className="font-manga text-3xl font-bold uppercase text-manga-red tracking-wide">
              MANGAFLOW
            </h1>
            <p className="font-bold text-manga-ink mt-1 text-sm leading-tight capitalize">
              {role.replace('-', ' ')} Panel
            </p>
          </div>
        </div>
        <div className="p-4 border-t-2 border-manga-ink">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-manga-ink text-red-600 hover:bg-red-50 font-manga font-bold text-xs uppercase"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col ml-64 h-full overflow-hidden">
        <header className="h-16 bg-white border-b-4 border-manga-ink flex items-center px-8 sticky top-0 z-30">
          <span className="font-manga text-2xl font-bold uppercase text-manga-red tracking-wide">
            MANGAFLOW
          </span>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

