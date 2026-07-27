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
          // If the user is logged in but has a specific dashboard role, redirect them.
          const r = user.role?.toUpperCase()
          if (r === 'MANGAKA') {
            navigate('/dashboard/mangaka')
            return
          } else if (r === 'ASSISTANT') {
            navigate('/dashboard/assistant')
            return
          } else if (r === 'EDITOR') {
            navigate('/dashboard/tantou-editor')
            return
          } else if (r === 'BOARD' || r === 'CHIEF_EDITOR') {
            navigate('/dashboard/editorial-board')
            return
          } else if (r === 'ADMIN') {
            navigate('/dashboard/admin')
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
