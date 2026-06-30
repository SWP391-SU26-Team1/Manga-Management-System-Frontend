import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { RoleGuard } from '@/components/common/RoleGuard'
import AdminLayout from '@/layouts/admin/AdminLayout'
import AdminChaptersPage from '@/pages/admin/AdminChaptersPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminProfilePage from '@/pages/admin/AdminProfilePage'
import AdminRankingsPage from '@/pages/admin/AdminRankingsPage'
import AdminReviewSessionsPage from '@/pages/admin/AdminReviewSessionsPage'
import AdminSeriesPage from '@/pages/admin/AdminSeriesPage'
import AdminTasksPage from '@/pages/admin/AdminTasksPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminVotesPage from '@/pages/admin/AdminVotesPage'

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
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="series" element={<AdminSeriesPage />} />
        <Route path="chapters" element={<AdminChaptersPage />} />
        <Route path="tasks" element={<AdminTasksPage />} />
        <Route path="review-sessions" element={<AdminReviewSessionsPage />} />
        <Route path="votes" element={<AdminVotesPage />} />
        <Route path="rankings" element={<AdminRankingsPage />} />
        <Route path="notifications" element={<Navigate to="/dashboard/admin" replace />} />
        <Route path="*" element={<Navigate to="/dashboard/admin" replace />} />
      </Route>
    </Routes>
  )
}
