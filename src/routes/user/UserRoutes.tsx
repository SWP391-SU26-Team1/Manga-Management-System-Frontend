import React from 'react'
import { Routes, Route } from 'react-router'
import DashboardLayout from '@/layouts/DashboardLayout'

import UserProfilePage from '@/pages/user/UserProfilePage'
import UserSettingsPage from '@/pages/user/UserSettingsPage'
import NotificationsPage from '@/pages/user/NotificationsPage'

export default function UserRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout role="user" />}>
        <Route index element={<UserProfilePage />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="settings" element={<UserSettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  )
}
