import React from 'react'
import { Routes, Route } from 'react-router'

// Layouts
import AuthLayout from '@/layouts/AuthLayout'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

// Public page
import UserHomePage from '@/pages/user/UserHomePage'

// Role Routes
import MangakaRoutes from './mangaka/MangakaRoutes'
import AssistantRoutes from './assistant/AssistantRoutes'
import TantouRoutes from './tantou/TantouRoutes'
import BoardRoutes from './editorial-board/BoardRoutes'
import UserRoutes from './user/UserRoutes'

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

      {/* Role Dashboards - Delegated to specific route files */}
      <Route path="/dashboard/mangaka/*" element={<MangakaRoutes />} />
      <Route path="/dashboard/assistant/*" element={<AssistantRoutes />} />
      <Route path="/dashboard/tantou-editor/*" element={<TantouRoutes />} />
      <Route path="/dashboard/editorial-board/*" element={<BoardRoutes />} />
      <Route path="/dashboard/user/*" element={<UserRoutes />} />
    </Routes>
  )
}

