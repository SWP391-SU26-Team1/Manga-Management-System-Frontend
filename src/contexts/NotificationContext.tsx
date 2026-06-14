import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Bell, AlertTriangle, RefreshCw, FileText, Star, Vote, AlertCircle, X } from 'lucide-react'

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

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'BẢN THẢO MỚI CẦN REVIEW',
    message: 'Yamamoto Ren đã nộp bản thảo Ch.49 – Shadow Realm Chronicles. Deadline review: 01/06/2026.',
    time: '15 phút trước',
    type: 'REVIEW',
    category: 'standard',
    unread: true
  },
  {
    id: 'n2',
    title: 'SERIES AT RISK',
    message: 'Neon City Runners tụt xuống hạng #18. Cần chuẩn bị hồ sơ bảo vệ series ngay.',
    time: '1 giờ trước',
    type: 'RISK',
    category: 'standard',
    unread: true
  },
  {
    id: 'n3',
    title: 'BẢN NỘP LẠI ĐÃ ĐẾN',
    message: 'Inoue Hana đã nộp lại bản sửa Ch.23 – Neon City Runners sau 3 góp ý của bạn.',
    time: '2 giờ trước',
    type: 'RESUBMIT',
    category: 'standard',
    unread: true
  },
  {
    id: 'n4',
    title: 'EDITORIAL BOARD PHẢN HỒI',
    message: 'Hayashi Noboru đã phê duyệt báo cáo tháng 5. Xem chi tiết phản hồi tại đây.',
    time: '5 giờ trước',
    type: 'FEEDBACK',
    category: 'standard',
    unread: false
  },
  {
    id: 'n5',
    title: 'CHƯƠNG QUÁ HẠN',
    message: "Dragon's Blood Legacy Ch.13 đã trễ 2 ngày. Tanaka Ryusei chưa nộp bản thảo.",
    time: '1 ngày trước',
    type: 'OVERDUE',
    category: 'standard',
    unread: false
  }
]

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem('mf_notifications')
    return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS
  })
  
  const [toasts, setToasts] = useState<ToastAlert[]>([])

  useEffect(() => {
    localStorage.setItem('mf_notifications', JSON.stringify(notifications))
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

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
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
