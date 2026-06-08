import React from 'react'
import { BrowserRouter } from 'react-router'
import AppRoutes from './routes/AppRoutes'
import { ToastProvider } from './contexts/ToastContext'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  )
}
