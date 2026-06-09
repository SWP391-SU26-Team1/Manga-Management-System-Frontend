import React from 'react'
import { Routes, Route } from 'react-router'
import AssistantLayout from '@/layouts/assistant/AssistantLayout'

// Assistant pages
import AssistantDashboardPage from '@/pages/assistant/AssistantDashboardPage'
import TasksPage from '@/pages/assistant/TasksPage'
import SubmissionsPage from '@/pages/assistant/SubmissionsPage'
import IncomePage from '@/pages/assistant/IncomePage'
import ReportsPage from '@/pages/assistant/ReportsPage'
import AssistantFeedbackPage from '@/pages/assistant/FeedbackPage'
import DraftsPage from '@/pages/assistant/DraftsPage'
import DrawingPage from '@/pages/assistant/DrawingPage'
import ProfilePage from '@/pages/assistant/ProfilePage'
import SettingsPage from '@/pages/assistant/SettingsPage'

export default function AssistantRoutes() {
  return (
    <Routes>
      <Route element={<AssistantLayout />}>
        <Route index element={<AssistantDashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="submissions" element={<SubmissionsPage />} />
        <Route path="income" element={<IncomePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="feedback" element={<AssistantFeedbackPage />} />
        <Route path="drafts" element={<DraftsPage />} />
        <Route path="drawing" element={<DrawingPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
