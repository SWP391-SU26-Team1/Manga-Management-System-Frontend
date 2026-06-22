import React from 'react'
import { BrowserRouter } from 'react-router'
import AppRoutes from './routes/AppRoutes'
import { NotificationProvider } from './contexts/NotificationContext'
import { ToastProvider } from './contexts/ToastContext'

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </NotificationProvider>
    </BrowserRouter>
  )
}
