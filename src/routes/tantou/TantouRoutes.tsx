import React from 'react'
import { Routes, Route } from 'react-router'
import TantouLayout from '@/layouts/tantou/TantouLayout'

import TantouDashboardPage from '@/pages/tantou-editor/TantouDashboardPage'
import SeriesManagementPage from '@/pages/tantou-editor/SeriesManagementPage'
import PageProgressPage from '@/pages/tantou-editor/PageProgressPage'
import ManuscriptReviewPage from '@/pages/tantou-editor/ManuscriptReviewPage'
import StudioProgressPage from '@/pages/tantou-editor/StudioProgressPage'
import RecoveryProposalPage from '@/pages/tantou-editor/RecoveryProposalPage'
import FeedbackResubmitPage from '@/pages/tantou-editor/FeedbackResubmitPage'
import ApprovalWorkflowPage from '@/pages/tantou-editor/ApprovalWorkflowPage'
import AlertsPage from '@/pages/tantou-editor/AlertsPage'
import RankingPerformancePage from '@/pages/tantou-editor/RankingPerformancePage'
import EditorialReportsPage from '@/pages/tantou-editor/EditorialReportsPage'
import TeamManagementPage from '@/pages/tantou-editor/TeamManagementPage'
import TantouSettingsPage from '@/pages/tantou-editor/TantouSettingsPage'
import ProfilePage from '@/pages/tantou-editor/ProfilePage'

export default function TantouRoutes() {
  return (
    <Routes>
      <Route element={<TantouLayout />}>
        <Route index element={<TantouDashboardPage />} />
        <Route path="series" element={<SeriesManagementPage />} />
        <Route path="chapters" element={<PageProgressPage />} />
        <Route path="studio-progress" element={<StudioProgressPage />} />
        <Route path="manuscript-review" element={<ManuscriptReviewPage />} />
        <Route path="feedback" element={<FeedbackResubmitPage />} />
        <Route path="workflow" element={<ApprovalWorkflowPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="ranking" element={<RankingPerformancePage />} />
        <Route path="reports" element={<EditorialReportsPage />} />
        <Route path="series-defense" element={<RecoveryProposalPage />} />
        <Route path="team" element={<TeamManagementPage />} />
        <Route path="settings" element={<TantouSettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}
