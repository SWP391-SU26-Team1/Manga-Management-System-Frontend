import React from 'react'
import { Routes, Route } from 'react-router'
import MangakaLayout from '@/layouts/mangaka/MangakaLayout'

// Mangaka pages
import MangakaDashboardPage from '@/pages/mangaka/MangakaDashboardPage'
import SeriesPage from '@/pages/mangaka/SeriesPage'
import SubmissionPage from '@/pages/mangaka/SubmissionPage'
import AssignTaskPage from '@/pages/mangaka/AssignTaskPage'
import AssistantsPage from '@/pages/mangaka/AssistantsPage'
import RankingPage from '@/pages/mangaka/RankingPage'
import CreateSeriesPage from '@/pages/mangaka/CreateSeriesPage'
import CreateManuscriptPage from '@/pages/mangaka/CreateManuscriptPage'
import DraftsPage from '@/pages/mangaka/DraftsPage'
import FeedbackPage from '@/pages/mangaka/FeedbackPage'
import BoardReviewPage from '@/pages/mangaka/BoardReviewPage'
import RiskAlertsPage from '@/pages/mangaka/RiskAlertsPage'
import MangakaRecoveryProposalPage from '@/pages/mangaka/RecoveryProposalPage'
import MangakaNotificationsPage from '@/pages/mangaka/NotificationsPage'
import PageViewerPage from '@/pages/mangaka/PageViewerPage'
import SeriesDetailPage from '@/pages/mangaka/SeriesDetailPage'
import CreateChapterPage from '@/pages/mangaka/CreateChapterPage'
import ManuscriptsPage from '@/pages/mangaka/ManuscriptsPage'
import MangakaProfilePage from '@/pages/mangaka/ProfilePage'
import MangakaSettingsPage from '@/pages/mangaka/SettingsPage'

export default function MangakaRoutes() {
  return (
    <Routes>
      <Route element={<MangakaLayout />}>
        <Route index element={<MangakaDashboardPage />} />
        <Route path="series" element={<SeriesPage />} />
        <Route path="create-series" element={<CreateSeriesPage />} />
        <Route path="create-manuscript" element={<CreateManuscriptPage />} />
        <Route path="drafts" element={<DraftsPage />} />
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
        <Route path="profile" element={<MangakaProfilePage />} />
        <Route path="settings" element={<MangakaSettingsPage />} />
      </Route>
    </Routes>
  )
}
