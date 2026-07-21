import React from 'react'
import { Routes, Route } from 'react-router'
import BoardLayout from '@/layouts/editorial-board/BoardLayout'

// Member Editor Pages
import BoardDashboardPage from '@/pages/editorial-board/member-editor/BoardDashboardPage'
import { ReadDraftPage, ScorePage, VotePage } from '@/pages/editorial-board/member-editor/ReviewPages'

import SeriesApprovalPage from '@/pages/editorial-board/member-editor/SeriesApprovalPage'
import SeriesReviewDetailPage from '@/pages/editorial-board/member-editor/SeriesReviewDetailPage'
import ProfilePage from '@/pages/editorial-board/member-editor/ProfilePage'
import SettingsPage from '@/pages/editorial-board/member-editor/SettingsPage'
import RankingsPage from '@/pages/editorial-board/member-editor/RankingsPage'
import HistoryPage from '@/pages/editorial-board/member-editor/HistoryPage'
import ProposalsListPage from '@/pages/editorial-board/member-editor/ProposalsListPage'
import { DisputesListPage, DisputeDetailsPage } from '@/pages/editorial-board/member-editor/DisputesPage'


export default function BoardRoutes() {
  const storedUser = localStorage.getItem('mangaflow_user')
  const user = storedUser ? JSON.parse(storedUser) : null

  return (
    <Routes>
      <Route element={<BoardLayout />}>
        {/* Main board dashboard */}
        <Route index element={<BoardDashboardPage />} />

        {/* Proposals / Tasks inbox */}
        <Route path="proposals" element={<ProposalsListPage />} />

  {/* Disputes listing and details */ }
        <Route path="disputes" element={<DisputesListPage />} />
        <Route path="disputes/:caseId" element={<DisputeDetailsPage />} />

  {/* Series review and voting flow */ }
        <Route path="series-approval" element={<SeriesApprovalPage />} />
        <Route path="series-approval/:seriesId" element={<SeriesReviewDetailPage />} />

  {/* Chapter review multi-step flow */ }
        <Route path="review/:chapterId/draft" element={<ReadDraftPage />} />
        <Route path="review/:chapterId/score" element={<ScorePage />} />
        <Route path="review/:chapterId/vote" element={<VotePage />} />
  {/* Global info pages */ }
        <Route path="rankings" element={<RankingsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route >
    </Routes >
  )
}
