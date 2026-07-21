import React from 'react'
import { BrowserRouter } from 'react-router'
import AppRoutes from './routes/AppRoutes'
import { NotificationProvider } from './contexts/NotificationContext'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <NotificationProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
