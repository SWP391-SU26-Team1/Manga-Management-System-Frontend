import React from 'react'
import { Routes, Route } from 'react-router'
import { RoleGuard } from '@/components/common/RoleGuard'
import AdminLayout from '@/layouts/admin/AdminLayout'
import AdminChaptersPage from '@/pages/admin/AdminChaptersPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminPagesPage from '@/pages/admin/AdminPagesPage'
import AdminPlaceholderPage from '@/pages/admin/AdminPlaceholderPage'
import AdminSeriesPage from '@/pages/admin/AdminSeriesPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        element={
          <RoleGuard allowedRoles={['ADMIN']}>
            <AdminLayout />
          </RoleGuard>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="series" element={<AdminSeriesPage />} />
        <Route path="chapters" element={<AdminChaptersPage />} />
        <Route path="pages" element={<AdminPagesPage />} />
        <Route
          path="tasks"
          element={
            <AdminPlaceholderPage
              title="Tasks Management"
              description="List, filter, edit, and change page task status through the admin page-tasks service."
            />
          }
        />
        <Route
          path="review-sessions"
          element={
            <AdminPlaceholderPage
              title="Review Sessions"
              description="Moderate review sessions, status changes, and editorial workflow checkpoints."
            />
          }
        />
        <Route
          path="votes"
          element={
            <AdminPlaceholderPage
              title="Votes"
              description="Review submitted votes, verify decisions, and audit board scoring records."
            />
          }
        />
        <Route
          path="rankings"
          element={
            <AdminPlaceholderPage
              title="Rankings"
              description="Manage ranking periods, series rankings, and chapter ranking calculations."
            />
          }
        />
        <Route
          path="notifications"
          element={
            <AdminPlaceholderPage
              title="Notifications"
              description="Create, inspect, and clean up system notifications sent to production users."
            />
          }
        />
        <Route
          path="settings"
          element={
            <AdminPlaceholderPage
              title="System Settings"
              description="Prepare system health, import/export, permissions, and operational settings controls."
            />
          }
        />
      </Route>
    </Routes>
  )
}
