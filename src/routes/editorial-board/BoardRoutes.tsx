import React from 'react'
import { Routes, Route } from 'react-router'
import BoardLayout from '@/layouts/editorial-board/BoardLayout'

// Pages
import BoardDashboardPage from '@/pages/editorial-board/member-editor/BoardDashboardPage'
import { ReadDraftPage, ScorePage, VotePage } from '@/pages/editorial-board/member-editor/ReviewPages'
import { DisputesListPage, DisputeDetailsPage } from '@/pages/editorial-board/member-editor/DisputesPage'
import SeriesApprovalPage from '@/pages/editorial-board/member-editor/SeriesApprovalPage'
import SeriesReviewDetailPage from '@/pages/editorial-board/member-editor/SeriesReviewDetailPage'
import RecoveryPage from '@/pages/editorial-board/chief-editor/RecoveryPage'
import ProfilePage from '@/pages/editorial-board/member-editor/ProfilePage'
import SettingsPage from '@/pages/editorial-board/member-editor/SettingsPage'

export default function BoardRoutes() {
  return (
    <Routes>
      <Route element={<BoardLayout />}>
        {/* Main board dashboards */}
        <Route index element={<BoardDashboardPage />} />
        <Route path="recovery" element={<RecoveryPage />} />
        <Route path="disputes" element={<DisputesListPage />} />
        <Route path="disputes/:caseId" element={<DisputeDetailsPage />} />
        
        {/* Series review and voting flow */}
        <Route path="series-approval" element={<SeriesApprovalPage />} />
        <Route path="series-approval/:seriesId" element={<SeriesReviewDetailPage />} />

        {/* Chapter review multi-step flow */}
        <Route path="review/:chapterId/draft" element={<ReadDraftPage />} />
        <Route path="review/:chapterId/score" element={<ScorePage />} />
        <Route path="review/:chapterId/vote" element={<VotePage />} />

        {/* Global info pages */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
