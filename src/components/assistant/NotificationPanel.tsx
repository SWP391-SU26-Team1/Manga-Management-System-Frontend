import React, { useState, useEffect } from 'react'
import { Bell, AlertTriangle, CheckCircle2, MessageSquare, Trash2, Check, Loader2, AlertCircle } from 'lucide-react'
import assistantService, { AssistantNotification } from '@/services/assistant.service'

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<AssistantNotification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const limit = 10

  useEffect(() => {
    loadNotifications()
  }, [filter, currentPage])

  const loadNotifications = async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (filter === 'unread') {
        const result = await assistantService.getUnreadNotifications()
        setNotifications(result.items || [])
        setTotalPages(1) // Unread list returns all items together in getUnreadNotifications
      } else {
        const result = await assistantService.listNotifications({
          page: currentPage,
          limit
        })
        setNotifications(result.data || [])
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1)
        }
      }
    } catch (err: any) {
      console.error('Lỗi tải thông báo:', err)
      setError('Không thể tải danh sách thông báo. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await assistantService.markRead(id)
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification_id === id ? { ...notif, is_read: true } : notif
        )
      )
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await assistantService.markAllRead()
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      )
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc tất cả:', err)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      await assistantService.deleteNotification(id)
      setNotifications((prev) =>
        prev.filter((notif) => notif.notification_id !== id)
      )
    } catch (err) {
      console.error('Lỗi xóa thông báo:', err)
    }
  }

  const getNotificationStyles = (type: string) => {
    switch (type.toLowerCase()) {
      case 'task_submitted':
      case 'urgent':
      case 'deadline_urgent':
        return {
          icon: AlertTriangle,
          iconColor: 'text-[#E63946]',
          bgColor: 'bg-[#FFF5F5]',
          borderColor: 'border-l-[#E63946]'
        }
      case 'task_approved':
      case 'approved':
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-[#2A9D8F]',
          bgColor: 'bg-[#F2FDF5]',
          borderColor: 'border-l-[#2A9D8F]'
        }
      case 'feedback':
      case 'new_feedback':
      case 'comment':
        return {
          icon: MessageSquare,
          iconColor: 'text-[#457B9D]',
          bgColor: 'bg-[#F0F7FF]',
          borderColor: 'border-l-[#457B9D]'
        }
      default:
        return {
          icon: Bell,
          iconColor: 'text-gray-500',
          bgColor: 'bg-white',
          borderColor: 'border-l-gray-400'
        }
    }
  }

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      })
    } catch {
      return timeStr
    }
  }

  return (
    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] w-full max-w-3xl mx-auto font-sans">
      {/* Header and top controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b-4 border-black pb-4">
        <div>
          <h2 className="font-manga text-2xl font-bold uppercase tracking-wider text-black">
            BẢNG THÔNG BÁO
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Quản lý các cập nhật trạng thái nhiệm vụ và phản hồi từ Mangaka
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          disabled={isLoading || notifications.length === 0}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer ${
            isLoading || notifications.length === 0
              ? 'bg-gray-100 text-gray-400 border-gray-300 shadow-none cursor-not-allowed'
              : 'bg-white text-black hover:bg-zinc-50'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          Đọc tất cả
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b-2 border-black mb-6">
        <button
          onClick={() => {
            setFilter('all')
            setCurrentPage(1)
          }}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-t-2 border-x-2 border-black transition-colors -mb-[2px] ${
            filter === 'all'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-50'
          }`}
        >
          TẤT CẢ
        </button>
        <button
          onClick={() => {
            setFilter('unread')
            setCurrentPage(1)
          }}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-t-2 border-x-2 border-black transition-colors -mb-[2px] ml-1 ${
            filter === 'unread'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-50'
          }`}
        >
          CHƯA ĐỌC
        </button>
      </div>

      {/* Notifications list */}
      <div className="space-y-4 min-h-[300px]">
        {isLoading ? (
          <div className="h-48 flex items-center justify-center flex-col gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
            <span className="text-xs font-bold text-gray-400 uppercase">Đang tải thông báo...</span>
          </div>
        ) : error ? (
          <div className="h-48 flex items-center justify-center flex-col gap-2 text-[#E63946] text-center p-4">
            <AlertCircle className="w-8 h-8 stroke-[2.5]" />
            <p className="text-xs font-bold uppercase">{error}</p>
            <button
              onClick={loadNotifications}
              className="mt-2 text-xs font-black underline hover:text-black uppercase"
            >
              Thử lại
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="h-48 flex items-center justify-center flex-col gap-2 text-gray-400 text-center py-12">
            <Bell className="w-12 h-12 stroke-[1.5]" />
            <p className="text-xs font-bold uppercase tracking-wider">Hộp thư thông báo trống</p>
            <p className="text-[10px] font-semibold text-gray-400">Bạn đã cập nhật hết mọi tin tức!</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const config = getNotificationStyles(notif.type)
            const Icon = config.icon

            return (
              <div
                key={notif.notification_id}
                className={`flex gap-4 border-y-2 border-r-2 border-l-8 border-black p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)] items-start relative group transition-colors ${
                  config.borderColor
                } ${notif.is_read ? 'bg-white' : config.bgColor}`}
              >
                {/* Type Icon */}
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />

                {/* Content */}
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-baseline gap-2 flex-wrap mb-1">
                    <h4 className={`text-xs font-black uppercase text-black ${notif.is_read ? 'opacity-70' : ''}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[9px] text-gray-400 font-bold">
                      {formatTime(notif.created_at)}
                    </span>
                  </div>
                  <p className={`text-xs text-gray-600 font-medium leading-relaxed ${notif.is_read ? 'opacity-70' : ''}`}>
                    {notif.content}
                  </p>
                </div>

                {/* Hover Action Buttons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.notification_id)}
                      title="Đánh dấu đã đọc"
                      className="bg-white hover:bg-zinc-100 text-black border border-black p-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notif.notification_id)}
                    title="Xóa thông báo"
                    className="bg-white hover:bg-red-50 text-[#E63946] border border-black p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Unread Indicator dot (Red dot if unread) */}
                {!notif.is_read && (
                  <span className="absolute right-3 top-3 w-2.5 h-2.5 bg-[#E63946] border border-black rounded-full block group-hover:hidden" />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Pagination Footer */}
      {filter === 'all' && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-6 border-t-2 border-gray-100 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className={`px-3 py-1 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 border-gray-300 shadow-none cursor-not-allowed'
                : 'bg-white hover:bg-zinc-50'
            }`}
          >
            Trước
          </button>
          <span className="text-xs font-black uppercase text-black">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || isLoading}
            className={`px-3 py-1 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 border-gray-300 shadow-none cursor-not-allowed'
                : 'bg-white hover:bg-zinc-50'
            }`}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  )
}
