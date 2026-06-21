import React from 'react'
import { BrowserRouter } from 'react-router'
import AppRoutes from './routes/AppRoutes'
import { NotificationProvider } from './contexts/NotificationContext'

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </BrowserRouter>
  )
}
