import React from 'react'
import { Outlet, Navigate } from 'react-router'
import TantouSidebar from './TantouSidebar'
import TantouHeader from './TantouHeader'

export default function TantouLayout() {
  const storedUser = localStorage.getItem('mangaflow_user')
  if (!storedUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-manga-ink overflow-hidden">
      <TantouSidebar />
      <div className="flex-1 flex flex-col ml-64 h-full overflow-hidden">
        <TantouHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
