import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { UserRole, UserProfile } from '@/data/mockUsers'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('mangaflow_user')

      if (!storedUser) {
        navigate('/login')
        return
      }

      try {
        const user: UserProfile = JSON.parse(storedUser)

        if (allowedRoles.includes(user.role)) {
          setAuthorized(true)
        } else {
          if (user.role === 'MANGAKA') {
            navigate('/dashboard/mangaka')
          } else if (user.role === 'ASSISTANT') {
            navigate('/dashboard/assistant')
          } else if (user.role === 'EDITOR') {
            navigate('/dashboard/tantou-editor')
          } else if (user.role === 'BOARD') {
            navigate('/dashboard/editorial-board')
          } else {
            navigate('/')
          }
        }
      } catch {
        localStorage.removeItem('mangaflow_user')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [allowedRoles, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="w-16 h-16 border-4 border-manga-ink border-t-manga-red rounded-full animate-spin" />
        <p className="font-manga text-xl font-bold uppercase tracking-widest mt-6 text-manga-ink">
          Đang xác thực...
        </p>
      </div>
    )
  }

  return authorized ? <>{children}</> : null
}
