import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

export function PublicUserGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('mangaflow_user')
      if (storedUser) {
        try {
          const user: any = JSON.parse(storedUser)
          // If the user is logged in but is NOT a regular user, redirect to their dashboard
          if (user.role && (user.role as any) !== 'USER' && (user.role as any) !== 'user') {
            if (user.role === 'MANGAKA') {
              navigate('/dashboard/mangaka')
            } else if (user.role === 'ASSISTANT') {
              navigate('/dashboard/assistant')
            } else if (user.role === 'EDITOR') {
              navigate('/dashboard/tantou-editor')
            } else if (user.role === 'BOARD') {
              navigate('/dashboard/editorial-board')
            } else if (user.role === 'ADMIN') {
              navigate('/dashboard/admin')
            }
            return
          }
        } catch {
          // Ignore parse error, just let them pass as guest
        }
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [navigate])

  if (loading) return null

  return <>{children}</>
}
