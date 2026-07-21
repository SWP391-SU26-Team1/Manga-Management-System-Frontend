import React from 'react'
import { Outlet } from 'react-router'
import UserNavHeader from './UserNavHeader'

export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-manga-ink font-sans">
      <UserNavHeader />
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="border-t-4 border-manga-ink bg-[#f9f9f9] py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-manga text-3xl font-black uppercase tracking-tight text-manga-ink">MangaFlow</span>
          </div>
          <div className="text-sm font-bold text-gray-500 text-center md:text-right">
            © 2026 MangaFlow. Nền tảng sáng tác và đọc manga không giới hạn.
          </div>
        </div>
      </footer>
    </div>
  )
}
