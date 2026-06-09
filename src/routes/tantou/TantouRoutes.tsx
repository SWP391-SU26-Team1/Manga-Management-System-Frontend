import React from 'react'
import { Routes, Route } from 'react-router'
import TantouLayout from '@/layouts/tantou/TantouLayout'

// Tantou Editor pages
import TantouDashboardPage from '@/pages/tantou-editor/TantouDashboardPage'
import ManuscriptReviewPage from '@/pages/tantou-editor/ManuscriptReviewPage'
import StudioProgressPage from '@/pages/tantou-editor/StudioProgressPage'
import RecoveryProposalPage from '@/pages/tantou-editor/RecoveryProposalPage'

export default function TantouRoutes() {
  return (
    <Routes>
      <Route element={<TantouLayout />}>
        <Route index element={<TantouDashboardPage />} />
        <Route path="manuscript-review" element={<ManuscriptReviewPage />} />
        <Route path="studio-progress" element={<StudioProgressPage />} />
        <Route path="recovery-proposal" element={<RecoveryProposalPage />} />
      </Route>
    </Routes>
  )
}
