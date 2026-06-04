import React from 'react'
import { Routes, Route } from 'react-router'

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

// User pages
import UserHomePage from '@/pages/user/UserHomePage'
import MangaListPage from '@/pages/user/MangaListPage'
import NotificationsPage from '@/pages/user/NotificationsPage'

// Mangaka pages
import MangakaDashboardPage from '@/pages/mangaka/MangakaDashboardPage'
import SeriesPage from '@/pages/mangaka/SeriesPage'
import SubmissionPage from '@/pages/mangaka/SubmissionPage'
import AssignTaskPage from '@/pages/mangaka/AssignTaskPage'
import AssistantsPage from '@/pages/mangaka/AssistantsPage'
import RankingPage from '@/pages/mangaka/RankingPage'
import CreateSeriesPage from '@/pages/mangaka/CreateSeriesPage'
import FeedbackPage from '@/pages/mangaka/FeedbackPage'
import BoardReviewPage from '@/pages/mangaka/BoardReviewPage'
import RiskAlertsPage from '@/pages/mangaka/RiskAlertsPage'
import MangakaRecoveryProposalPage from '@/pages/mangaka/RecoveryProposalPage'
import MangakaNotificationsPage from '@/pages/mangaka/NotificationsPage'
import PageViewerPage from '@/pages/mangaka/PageViewerPage'
import SeriesDetailPage from '@/pages/mangaka/SeriesDetailPage'
import CreateChapterPage from '@/pages/mangaka/CreateChapterPage'
import ManuscriptsPage from '@/pages/mangaka/ManuscriptsPage'
// Assistant pages
import AssistantDashboardPage from '@/pages/assistant/AssistantDashboardPage'
import TasksPage from '@/pages/assistant/TasksPage'
import SubmissionsPage from '@/pages/assistant/SubmissionsPage'
import IncomePage from '@/pages/assistant/IncomePage'

// Tantou Editor pages
import TantouDashboardPage from '@/pages/tantou-editor/TantouDashboardPage'
import ManuscriptReviewPage from '@/pages/tantou-editor/ManuscriptReviewPage'
import StudioProgressPage from '@/pages/tantou-editor/StudioProgressPage'
import RecoveryProposalPage from '@/pages/tantou-editor/RecoveryProposalPage'

// Editorial Board pages
import BoardDashboardPage from '@/pages/editorial-board/BoardDashboardPage'
import SeriesApprovalPage from '@/pages/editorial-board/SeriesApprovalPage'
import VotingPage from '@/pages/editorial-board/VotingPage'
import RankingDataPage from '@/pages/editorial-board/RankingDataPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public - Home */}
      <Route path="/" element={<UserHomePage />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Mangaka Dashboard */}
      <Route path="/dashboard/mangaka" element={<DashboardLayout role="mangaka" />}>
        <Route index element={<MangakaDashboardPage />} />
        <Route path="series" element={<SeriesPage />} />
        <Route path="create-series" element={<CreateSeriesPage />} />
        <Route path="submission" element={<SubmissionPage />} />
        <Route path="assign-task" element={<AssignTaskPage />} />
        <Route path="assistants" element={<AssistantsPage />} />
        <Route path="ranking" element={<RankingPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="board-review" element={<BoardReviewPage />} />
        <Route path="risk-alerts" element={<RiskAlertsPage />} />
        <Route path="recovery-proposal" element={<MangakaRecoveryProposalPage />} />
        <Route path="notifications" element={<MangakaNotificationsPage />} />
        <Route path="manuscripts" element={<ManuscriptsPage />} />
        <Route path="page-viewer/:pageId" element={<PageViewerPage />} />
        <Route path="series/:seriesId" element={<SeriesDetailPage />} />
        <Route path="series/:seriesId/create-chapter" element={<CreateChapterPage />} />
      </Route>

      {/* Assistant Dashboard */}
      <Route path="/dashboard/assistant" element={<DashboardLayout role="assistant" />}>
        <Route index element={<AssistantDashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="submissions" element={<SubmissionsPage />} />
        <Route path="income" element={<IncomePage />} />
      </Route>

      {/* Tantou Editor Dashboard */}
      <Route path="/dashboard/tantou-editor" element={<DashboardLayout role="tantou-editor" />}>
        <Route index element={<TantouDashboardPage />} />
        <Route path="manuscript-review" element={<ManuscriptReviewPage />} />
        <Route path="studio-progress" element={<StudioProgressPage />} />
        <Route path="recovery-proposal" element={<RecoveryProposalPage />} />
      </Route>

      {/* Editorial Board Dashboard */}
      <Route path="/dashboard/editorial-board" element={<DashboardLayout role="editorial-board" />}>
        <Route index element={<BoardDashboardPage />} />
        <Route path="series-approval" element={<SeriesApprovalPage />} />
        <Route path="voting" element={<VotingPage />} />
        <Route path="ranking-data" element={<RankingDataPage />} />
      </Route>

      {/* User Dashboard */}
      <Route path="/dashboard/user" element={<DashboardLayout role="user" />}>
        <Route index element={<UserHomePage />} />
        <Route path="manga-list" element={<MangaListPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  )
}
