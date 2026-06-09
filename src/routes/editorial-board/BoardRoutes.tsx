import React from 'react'
import { Routes, Route } from 'react-router'
import BoardLayout from '@/layouts/editorial-board/BoardLayout'

// Editorial Board pages
import BoardDashboardPage from '@/pages/editorial-board/BoardDashboardPage'
import SeriesApprovalPage from '@/pages/editorial-board/SeriesApprovalPage'
import VotingPage from '@/pages/editorial-board/VotingPage'
import RankingDataPage from '@/pages/editorial-board/RankingDataPage'

export default function BoardRoutes() {
  return (
    <Routes>
      <Route element={<BoardLayout />}>
        <Route index element={<BoardDashboardPage />} />
        <Route path="series-approval" element={<SeriesApprovalPage />} />
        <Route path="voting" element={<VotingPage />} />
        <Route path="ranking-data" element={<RankingDataPage />} />
      </Route>
    </Routes>
  )
}
