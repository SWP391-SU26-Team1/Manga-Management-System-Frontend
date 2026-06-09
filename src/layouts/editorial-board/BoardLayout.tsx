import React from 'react'
import { Outlet, Navigate } from 'react-router'
import BoardSidebar from './BoardSidebar'
import BoardHeader from './BoardHeader'

export default function BoardLayout() {
  const storedUser = localStorage.getItem('mangaflow_user')
  if (!storedUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-manga-ink overflow-hidden">
      <BoardSidebar />
      <div className="flex-1 flex flex-col ml-64 h-full overflow-hidden">
        <BoardHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
