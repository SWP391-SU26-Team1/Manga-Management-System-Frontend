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

// Chief Editor Pages
import ChiefDashboardPage from '@/pages/editorial-board/chief-editor/ChiefDashboardPage'
import { ChiefReadDraftPage, ChiefScorePage } from '@/pages/editorial-board/chief-editor/ChiefReviewPages'
import VoteSummaryPage from '@/pages/editorial-board/chief-editor/VoteSummaryPage'
import SendNotificationPage from '@/pages/editorial-board/chief-editor/SendNotificationPage'
import SeriesDecisionPage from '@/pages/editorial-board/chief-editor/SeriesDecisionPage'
import { ChiefDisputesListPage, ChiefDisputeDetailsPage } from '@/pages/editorial-board/chief-editor/ChiefDisputesPage'
import RecoveryPage from '@/pages/editorial-board/chief-editor/RecoveryPage'

export default function BoardRoutes() {
  const storedUser = localStorage.getItem('mangaflow_user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const isChief = user?.isChief || user?.email === 'chiefeditor@mangaflow.com'

  return (
    <Routes>
      <Route element={<BoardLayout />}>
        {/* Main board dashboards */}
        <Route index element={isChief ? <ChiefDashboardPage /> : <BoardDashboardPage />} />
        
        {/* Recovery: handles locking internally in RecoveryPage.tsx */}
        <Route path="recovery" element={<RecoveryPage />} />
        {/* Proposals / Tasks inbox */}
        <Route path="proposals" element={<ProposalsListPage />} />

        {/* Disputes listing and details: dynamic checks or separate components */}
        <Route path="disputes" element={isChief ? <ChiefDisputesListPage /> : <DisputesListPage />} />
        <Route path="disputes/:caseId" element={isChief ? <ChiefDisputeDetailsPage /> : <DisputeDetailsPage />} />

        {/* Series review and voting flow */}
        <Route path="series-approval" element={<SeriesApprovalPage />} />
        <Route path="series-approval/:seriesId" element={<SeriesReviewDetailPage />} />

        {/* Series strategic evaluation pending (Chief Only) */}
        <Route path="series-decision/:seriesId" element={<SeriesDecisionPage />} />

        {/* Chapter review multi-step flow (Chief vs Member Editor routing) */}
        <Route path="review/:chapterId/draft" element={isChief ? <ChiefReadDraftPage /> : <ReadDraftPage />} />
        <Route path="review/:chapterId/score" element={isChief ? <ChiefScorePage /> : <ScorePage />} />
        
        {/* Screen 3 for Chief (analysis) and Screen 4 (decision) */}
        <Route path="review/:chapterId/analysis" element={isChief ? <VoteSummaryPage /> : <VotePage />} />
        <Route path="review/:chapterId/decision" element={isChief ? <SendNotificationPage /> : <VotePage />} />
        
        {/* Direct route for general decision dispatch */}
        <Route path="send-notification" element={<SendNotificationPage />} />

        {/* Member vote submission */}
        <Route path="review/:chapterId/vote" element={<VotePage />} />

        {/* Global info pages */}
        <Route path="rankings" element={<RankingsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
