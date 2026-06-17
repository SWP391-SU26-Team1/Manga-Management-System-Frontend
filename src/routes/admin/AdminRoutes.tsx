import React from 'react'
import { Routes, Route } from 'react-router'
import { RoleGuard } from '@/components/common/RoleGuard'
import AdminLayout from '@/layouts/admin/AdminLayout'
import AdminChaptersPage from '@/pages/admin/AdminChaptersPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminPlaceholderPage from '@/pages/admin/AdminPlaceholderPage'
import AdminProfilePage from '@/pages/admin/AdminProfilePage'
import AdminReviewSessionsPage from '@/pages/admin/AdminReviewSessionsPage'
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
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="series" element={<AdminSeriesPage />} />
        <Route path="chapters" element={<AdminChaptersPage />} />
        <Route
          path="tasks"
          element={
            <AdminPlaceholderPage
              title="Quản lý công việc"
              description="Danh sách, lọc và can thiệp trạng thái công việc của assistant thông qua service page-tasks."
            />
          }
        />
        <Route path="review-sessions" element={<AdminReviewSessionsPage />} />
        <Route
          path="votes"
          element={
            <AdminPlaceholderPage
              title="Bình chọn"
              description="Kiểm tra phiếu bình chọn, xác minh quyết định và rà soát điểm của hội đồng."
            />
          }
        />
        <Route
          path="rankings"
          element={
            <AdminPlaceholderPage
              title="Xếp hạng"
              description="Quản lý đợt xếp hạng, thứ hạng series và thứ hạng chương."
            />
          }
        />
        <Route
          path="notifications"
          element={
            <AdminPlaceholderPage
              title="Thông báo"
              description="Tạo, kiểm tra và dọn dẹp thông báo hệ thống gửi đến người dùng."
            />
          }
        />
      </Route>
    </Routes>
  )
}
