import React from 'react'
import { Outlet } from 'react-router'
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-manga-ink">
      <AdminSidebar />
      <div className="min-h-screen pl-[300px]">
        <AdminHeader />
        <main className="px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
