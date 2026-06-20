import React from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { adminNav } from '@/configs/navigation/adminNav'
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-manga-ink">
      <AdminSidebar />
      <div className="min-h-screen xl:pl-[300px]">
        <AdminHeader />
        <nav className="flex gap-2 overflow-x-auto border-b-2 border-manga-ink bg-[#282828] px-4 py-3 xl:hidden">
          {adminNav.map((item) => {
            const active = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
            return <Link key={item.path} to={item.path} className={`shrink-0 border px-3 py-2 text-xs font-black uppercase ${active ? 'border-manga-red bg-manga-red text-white' : 'border-gray-600 text-gray-200'}`}>{item.label}</Link>
          })}
        </nav>
        <main className="px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
