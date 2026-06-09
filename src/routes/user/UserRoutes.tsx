import React from 'react'
import { Routes, Route } from 'react-router'
import DashboardLayout from '@/layouts/DashboardLayout'

// User pages
import UserHomePage from '@/pages/user/UserHomePage'
import MangaListPage from '@/pages/user/MangaListPage'
import NotificationsPage from '@/pages/user/NotificationsPage'

export default function UserRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout role="user" />}>
        <Route index element={<UserHomePage />} />
        <Route path="manga-list" element={<MangaListPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  )
}
