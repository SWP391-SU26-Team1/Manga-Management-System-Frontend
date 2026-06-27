import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { Bell, AlertTriangle, RefreshCw, FileText, Star, Vote, AlertCircle, X } from 'lucide-react'
import { boardService } from '@/services/board.service'
import api from '@/services/api'

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: 'REVIEW' | 'RISK' | 'RESUBMIT' | 'FEEDBACK' | 'OVERDUE' | 'VOTE' | 'RATING'
  category: 'rating_success' | 'rating_failed' | 'voting_success' | 'voting_failed' | 'standard'
  unread: boolean
}

export interface ToastAlert {
  id: string
  title: string
  message: string
  category: 'rating_success' | 'rating_failed' | 'voting_success' | 'voting_failed'
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  toasts: ToastAlert[]
  addNotification: (
    title: string,
    message: string,
    type: Notification['type'],
    category: ToastAlert['category']
  ) => void
  markAllAsRead: () => void
  dismissToast: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [toasts, setToasts] = useState<ToastAlert[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    let activeSocket: Socket | null = null

    const checkAndConnect = () => {
      const userStr = localStorage.getItem('mangaflow_user')
      if (!userStr) {
        if (activeSocket) {
          activeSocket.disconnect()
          activeSocket = null
          setSocket(null)
        }
        return
      }

      try {
        const parsed = JSON.parse(userStr)
        const token = parsed.token
        if (!token) return

        if (activeSocket && activeSocket.connected) return

        const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        activeSocket = io(apiURL, {
          auth: { token: token }
        })

        activeSocket.on('connect', () => {
          console.log('Socket.io connected successfully to notifications server')
        })

        activeSocket.on('notification:new', (newNotification: any) => {
          console.log('Received real-time notification:', newNotification)

          const mappedNotif: Notification = {
            id: newNotification.id || newNotification.notification_id || Math.random().toString(),
            title: newNotification.title || 'THÔNG BÁO MỚI',
            message: newNotification.message || newNotification.content || '',
            time: new Date(newNotification.created_at || Date.now()).toLocaleDateString('vi-VN'),
            type: newNotification.type || 'REVIEW',
            category: 'standard' as const,
            unread: true
          }

          setNotifications(prev => {
            if (prev.some(n => n.id === mappedNotif.id)) return prev
            return [mappedNotif, ...prev]
          })

          let category: ToastAlert['category'] = 'rating_success'
          if (newNotification.type === 'RISK' || newNotification.type === 'OVERDUE') {
            category = 'rating_failed'
          }

          setToasts(prev => {
            const newToast: ToastAlert = {
              id: mappedNotif.id,
              title: mappedNotif.title,
              message: mappedNotif.message,
              category
            }
            setTimeout(() => {
              setToasts(p => p.filter(t => t.id !== mappedNotif.id))
            }, 3500)
            return [...prev, newToast]
          })
        })

        setSocket(activeSocket)
      } catch (err) {
        console.error('Failed to parse mangaflow_user token for socket connection:', err)
      }
    }

    checkAndConnect()
    const interval = setInterval(checkAndConnect, 3000)

    return () => {
      clearInterval(interval)
      if (activeSocket) {
        activeSocket.disconnect()
      }
    }
  }, [])

  const fetchNotifications = async () => {
    // Only fetch if user is logged in
    const userStr = localStorage.getItem('mangaflow_user')
    if (!userStr) return

    try {
      let data = []
      let role = ''
      try {
        const parsed = JSON.parse(userStr)
        role = parsed.role || ''
      } catch (e) {
        // ignore
      }

      if (role === 'BOARD' || role === 'EDITORIAL_BOARD') {
        data = await boardService.getBoardNotifications()
      } else {
        // Fetch general notifications for other roles to avoid 403 Forbidden
        const res = await api.get('/api/notifications')
        data = res.data.data
      }

      // Map API data to Notification interface
      if (data && Array.isArray(data)) {
        const mapped = data.map((item: any) => ({
          id: item.id || item.notification_id || Math.random().toString(),
          title: item.title || 'THÔNG BÁO',
          message: item.message || item.content,
          time: new Date(item.created_at || Date.now()).toLocaleDateString(),
          type: item.type || 'REVIEW',
          category: 'standard' as const,
          unread: !item.is_read
        }))
        setNotifications(mapped)
      }
    } catch (err) {
      console.error('Failed to load notifications from API', err)
      // Completely removed mock data fallback as requested
      setNotifications([])
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('mf_notifications', JSON.stringify(notifications))
    }
  }, [notifications])

  const unreadCount = notifications.filter(n => n.unread).length

  const addNotification = (
    title: string,
    message: string,
    type: Notification['type'],
    category: ToastAlert['category']
  ) => {
    const newId = `notif_${Date.now()}`
    
    // Add to notifications list
    const newNotif: Notification = {
      id: newId,
      title,
      message,
      time: 'Vừa xong',
      type,
      category,
      unread: true
    }
    setNotifications(prev => [newNotif, ...prev])

    // Trigger Toast alert (top-right overlay)
    const newToast: ToastAlert = {
      id: newId,
      title,
      message,
      category
    }
    setToasts(prev => [...prev, newToast])

    // Auto dismiss toast after 3.5 seconds
    setTimeout(() => {
      dismissToast(newId)
    }, 3500)
  }

  const markAllAsRead = async () => {
    try {
      await boardService.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    } catch (err) {
      console.error('API failed to mark all notifications as read', err)
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    }
  }

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, toasts, addNotification, markAllAsRead, dismissToast }}>
      {children}

      {/* Toast Alert Popups Overlay (Top-Right of screen) */}
      <div className="fixed top-20 right-6 z-[9999] space-y-4 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          // Determine icon, colors, labels based on category matching Image 1
          let Icon = Star
          let headerColor = 'text-manga-ink'
          let iconBg = 'bg-yellow-50 text-yellow-600'
          let isSuccess = true

          if (toast.category === 'rating_success') {
            Icon = Star
            headerColor = 'text-manga-ink'
            iconBg = 'bg-yellow-100 text-yellow-500'
          } else if (toast.category === 'rating_failed') {
            Icon = AlertCircle
            headerColor = 'text-manga-red'
            iconBg = 'bg-red-100 text-manga-red'
            isSuccess = false
          } else if (toast.category === 'voting_success') {
            Icon = Vote
            headerColor = 'text-manga-ink'
            iconBg = 'bg-red-100 text-manga-red'
          } else if (toast.category === 'voting_failed') {
            Icon = AlertTriangle
            headerColor = 'text-manga-red'
            iconBg = 'bg-zinc-100 text-manga-ink'
            isSuccess = false
          }

          return (
            <div 
              key={toast.id}
              className="pointer-events-auto w-full bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-stretch animate-slide-in relative select-none"
            >
              {/* Left Icon box */}
              <div className={`w-12 flex items-center justify-center shrink-0 border-r-2 border-black ${iconBg}`}>
                <Icon className="w-5 h-5 shrink-0" fill={toast.category.includes('success') && toast.category.includes('rating') ? 'currentColor' : 'none'} />
              </div>

              {/* Right details */}
              <div className="p-3 pr-8 flex-1 min-w-0 font-sans">
                <h4 className={`text-xs font-black uppercase tracking-wider leading-none mb-1 ${headerColor}`}>
                  {toast.title}
                </h4>
                <p className="text-[10px] font-bold text-gray-500 leading-tight">
                  {toast.message}
                </p>
                <span className="text-[8px] text-gray-400 font-bold uppercase mt-1 block">Vừa xong</span>
              </div>

              {/* Small red circle in the top right to match Image 1 */}
              <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-manga-red" />
              
              {/* Close button */}
              <button 
                onClick={() => dismissToast(toast.id)}
                className="absolute bottom-2 right-2 text-gray-400 hover:text-manga-ink focus:outline-none bg-transparent border-0 cursor-pointer p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
