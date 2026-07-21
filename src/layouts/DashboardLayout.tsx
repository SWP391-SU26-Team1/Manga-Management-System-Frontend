import React from 'react'
import { Outlet, Navigate } from 'react-router'

interface DashboardLayoutProps {
  role: 'user'
}

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  // Simple auth check — redirect to login if no user in localStorage
  const storedUser = localStorage.getItem('mangaflow_user')
  if (!storedUser) {
    return <Navigate to="/login" replace />
  }

  // Base fallback layout for user role
  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-manga-ink overflow-hidden">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
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
