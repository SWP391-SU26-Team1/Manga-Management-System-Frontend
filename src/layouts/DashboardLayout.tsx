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
      <aside className="w-64 h-screen bg-white border-r-4 border-manga-ink flex flex-col fixed top-0 left-0 z-40">
        <div className="p-5 border-b-2 border-manga-ink">
          <h1 className="font-manga text-3xl font-bold uppercase text-manga-red tracking-wide">
            MANGAFLOW
          </h1>
          <p className="font-bold text-manga-ink mt-1 text-sm leading-tight capitalize">
            {role} Panel
          </p>
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
