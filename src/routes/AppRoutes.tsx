import React from 'react'
import { Routes, Route } from 'react-router'

// Layouts
import AuthLayout from '@/layouts/AuthLayout'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import OtpPage from '@/pages/auth/OtpPage'

// Public page
import UserHomePage from '@/pages/user/UserHomePage'
import SeriesDetailPage from '@/pages/user/SeriesDetailPage'
import ChapterReaderPage from '@/pages/user/ChapterReaderPage'
import SearchResultsPage from '@/pages/user/SearchResultsPage'
import RankingsPage from '@/pages/user/RankingsPage'
import ReadingHistoryPage from '@/pages/user/ReadingHistoryPage'
import WebPreferencesPage from '@/pages/user/WebPreferencesPage'
import UserLayout from '@/layouts/user/UserLayout'

// Public Doc pages
import TermsPage from '@/pages/public-docs/TermsPage'
import CopyrightPage from '@/pages/public-docs/CopyrightPage'
import PrivacyPage from '@/pages/public-docs/PrivacyPage'
import ContactPage from '@/pages/public-docs/ContactPage'
import PublishingWorkflowPage from '@/pages/public-docs/PublishingWorkflowPage'
import SubmissionGuidelinesPage from '@/pages/public-docs/SubmissionGuidelinesPage'

import { PublicUserGuard } from '@/components/common/PublicUserGuard'

// Role Routes
import MangakaRoutes from './mangaka/MangakaRoutes'
import AssistantRoutes from './assistant/AssistantRoutes'
import TantouRoutes from './tantou/TantouRoutes'
import BoardRoutes from './editorial-board/BoardRoutes'
import UserRoutes from './user/UserRoutes'
import AdminRoutes from './admin/AdminRoutes'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public - Reader Routes (có Header + Footer) */}
      <Route element={<PublicUserGuard><UserLayout /></PublicUserGuard>}>
        <Route path="/" element={<UserHomePage />} />
        <Route path="/series/:seriesId" element={<SeriesDetailPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/history" element={<ReadingHistoryPage />} />
        <Route path="/preferences" element={<WebPreferencesPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/copyright" element={<CopyrightPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/publishing-workflow" element={<PublishingWorkflowPage />} />
        <Route path="/submission-guidelines" element={<SubmissionGuidelinesPage />} />
      </Route>

      {/* Reader - Full-screen (không có Header/Footer) */}
      <Route path="/series/:seriesId/chapter/:chapterId" element={
        <PublicUserGuard>
          <ChapterReaderPage />
        </PublicUserGuard>
      } />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
      </Route>

      {/* Role Dashboards - Delegated to specific route files */}
      <Route path="/dashboard/mangaka/*" element={<MangakaRoutes />} />
      <Route path="/dashboard/assistant/*" element={<AssistantRoutes />} />
      <Route path="/dashboard/tantou-editor/*" element={<TantouRoutes />} />
      <Route path="/dashboard/editorial-board/*" element={<BoardRoutes />} />
      <Route path="/dashboard/admin/*" element={<AdminRoutes />} />
      <Route path="/dashboard/user/*" element={<UserRoutes />} />
    </Routes>
  )
}

