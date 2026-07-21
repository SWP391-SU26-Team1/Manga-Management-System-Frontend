import React, { useState, useEffect } from 'react'
import { Bell, Check, Trash2, Filter, Loader2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { editorService } from '@/services/editor.service'

interface LocalNotification {
  id: string
  type: string
  title: string
  message: string
  createdAt: string
  isRead: boolean
  link?: string
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<LocalNotification[]>([])
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Mangaka' | 'Board' | 'System'>('All')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg)
    setToastType(type)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const translateNotification = (title: string, content: string, type: string) => {
    const t = (type || '').toLowerCase();
    const lowerTitle = (title || '').toLowerCase();

    let viTitle = title;
    let viContent = content;

    if (t === 'manuscript_submitted' || t === 'series_submitted' || lowerTitle.includes('manuscript submitted') || lowerTitle.includes('nộp bản thảo')) {
      viTitle = 'Cập nhật mới';
      viContent = content || 'Tác giả đã nộp bản thảo mới cần duyệt.';
    } else if (t === 'editor_feedback' || lowerTitle.includes('feedback') || lowerTitle.includes('nhận xét')) {
      viTitle = 'Ý kiến thảo luận';
      viContent = content || 'Có thảo luận hoặc ý kiến phản hồi mới.';
    } else if (t === 'task_submitted' || lowerTitle.includes('submission')) {
      viTitle = 'Trợ lý nộp bài';
      viContent = content || 'Trợ lý đã nộp bản thảo/bản vẽ mới.';
    } else if (t === 'vote_cast' || t.includes('vote') || lowerTitle.includes('vote')) {
      viTitle = 'Đóng góp ý kiến của Hội đồng';
      viContent = content || 'Thành viên Hội đồng đã bỏ phiếu duyệt.';
    } else if (t === 'decision_result' || lowerTitle.includes('decision')) {
      viTitle = 'Kết quả kiểm duyệt Hội đồng';
      viContent = content || 'Hội đồng biên tập đã phản hồi báo cáo của bạn.';
    }

    return { title: viTitle, message: viContent };
  }

  const mapType = (backendType: string): 'Mangaka' | 'Board' | 'System' => {
    const t = (backendType || '').toLowerCase()
    if (t.includes('manuscript') || t.includes('editor_feedback')) return 'Mangaka'
    if (t.includes('vote') || t.includes('board') || t.includes('decision')) return 'Board'
    if (t.includes('overdue') || t.includes('abandoned') || t.includes('low_views') || t.includes('rank_drop')) return 'System'
    return 'System'
  }

  const mapLink = (backendType: string): string => {
    const t = (backendType || '').toLowerCase()
    if (t.includes('manuscript')) return '/dashboard/tantou-editor/manuscript-review?tab=manuscript'
    if (t.includes('series') && !t.includes('rank_drop') && !t.includes('abandoned') && !t.includes('low_views')) return '/dashboard/tantou-editor/manuscript-review?tab=series'
    if (t.includes('feedback')) return '/dashboard/tantou-editor/notifications'
    if (t.includes('vote') || t.includes('decision')) return '/dashboard/tantou-editor/workflow'
    if (t.includes('overdue') || t.includes('abandoned') || t.includes('low_views') || t.includes('rank_drop')) return '/dashboard/tantou-editor/alerts'
    return ''
  }

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await editorService.getNotifications()
      const dataList = Array.isArray(res.data) ? res.data : (res || [])
      
      const mapped: LocalNotification[] = dataList.map((n: any) => {
        const type = mapType(n.type)
        const link = mapLink(n.type)
        const { title, message } = translateNotification(n.title, n.content || '', n.type)
        return {
          id: n.notification_id,
          type,
          title,
          message,
          createdAt: n.created_at,
          isRead: n.is_read,
          link: link || undefined,
        }
      })
      setNotifications(mapped)
    } catch (err: any) {
      console.error('Failed to load notifications for editor:', err)
      setError('Không thể tải danh sách thông báo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()

    // Listen to local WebSocket updates trigger
    const handleLocalUpdate = () => {
      loadNotifications()
    }
    window.addEventListener('mangaflow_notifications_updated', handleLocalUpdate)

    return () => {
      window.removeEventListener('mangaflow_notifications_updated', handleLocalUpdate)
    }
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await editorService.markAllNotificationsRead()
      window.dispatchEvent(new Event('mangaflow_notifications_updated'))
      await loadNotifications()
      showToast('Đã đánh dấu đọc tất cả thông báo!', 'success')
    } catch (err) {
      console.error(err)
      showToast('Không thể đánh dấu đọc tất cả thông báo.', 'error')
    }
  }

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await editorService.markNotificationRead(id)
      window.dispatchEvent(new Event('mangaflow_notifications_updated'))
      await loadNotifications()
      showToast('Đã đánh dấu đã đọc thông báo!', 'success')
    } catch (err) {
      console.error(err)
      showToast('Không thể đánh dấu thông báo đã đọc.', 'error')
    }
  }

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmDeleteId(id)
  }

  const handleNotifClick = async (notif: LocalNotification) => {
    if (!notif.isRead) {
      try {
        await editorService.markNotificationRead(notif.id)
        window.dispatchEvent(new Event('mangaflow_notifications_updated'))
      } catch (err) {
        console.error(err)
      }
    }
    if (notif.link) {
      navigate(notif.link)
    }
  }

  const formatRealTime = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'All') return true
    if (filter === 'Unread') return !n.isRead
    return n.type === filter
  })

  return (
    <div className="max-w-6xl mx-auto pb-16 text-black font-sans">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none">
            THÔNG BÁO HỆ THỐNG
          </h1>
          <div className="h-1.5 w-24 bg-[#E63946] mt-3" />
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 border-2 border-black text-xs font-black uppercase bg-white hover:bg-zinc-50 transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
          >
            <Check className="w-4 h-4" /> Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-6 border-b-2 border-black pb-4">
        <button
          onClick={() => setFilter('All')}
          className={`px-4 py-1.5 border-2 text-xs font-extrabold uppercase transition-all rounded-none cursor-pointer ${
            filter === 'All'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-transparent hover:bg-zinc-50'
          }`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('Unread')}
          className={`px-4 py-1.5 border-2 text-xs font-extrabold uppercase transition-all rounded-none cursor-pointer ${
            filter === 'Unread'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-transparent hover:bg-zinc-50'
          }`}
        >
          Chưa đọc ({notifications.filter(n => !n.isRead).length})
        </button>
        <button
          onClick={() => setFilter('Mangaka')}
          className={`px-4 py-1.5 border-2 text-xs font-extrabold uppercase transition-all rounded-none cursor-pointer ${
            filter === 'Mangaka'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-transparent hover:bg-zinc-50'
          }`}
        >
          Từ Tác giả ({notifications.filter(n => n.type === 'Mangaka').length})
        </button>
        <button
          onClick={() => setFilter('Board')}
          className={`px-4 py-1.5 border-2 text-xs font-extrabold uppercase transition-all rounded-none cursor-pointer ${
            filter === 'Board'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-transparent hover:bg-zinc-50'
          }`}
        >
          Từ Hội Đồng ({notifications.filter(n => n.type === 'Board').length})
        </button>
        <button
          onClick={() => setFilter('System')}
          className={`px-4 py-1.5 border-2 text-xs font-extrabold uppercase transition-all rounded-none cursor-pointer ${
            filter === 'System'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-transparent hover:bg-zinc-50'
          }`}
        >
          Hệ thống ({notifications.filter(n => n.type === 'System').length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white border-4 border-black p-16 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-black animate-spin" />
          <p className="font-extrabold text-sm uppercase">Đang tải danh sách thông báo...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-4 border-black p-8 text-center">
          <p className="font-black text-lg text-[#E63946]">{error}</p>
          <button
            onClick={loadNotifications}
            className="mt-4 px-5 py-2.5 bg-black text-white font-black text-xs uppercase hover:bg-zinc-800"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.length === 0 && (
            <div className="bg-white border-4 border-black p-16 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="font-black text-lg text-gray-500 uppercase">Không có thông báo nào!</p>
              <p className="text-xs text-gray-400 font-bold mt-1">Danh sách thông báo của bạn trống.</p>
            </div>
          )}

          {filteredNotifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleNotifClick(n)}
              className={`bg-white border-4 border-black p-4 flex gap-4 transition-all relative cursor-pointer group shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none ${
                !n.isRead ? 'bg-gray-50/80' : 'bg-white'
              }`}
            >
              <div className="flex flex-col items-start gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase text-white ${
                    n.type === 'Mangaka' ? 'bg-[#E63946]' :
                    n.type === 'Board' ? 'bg-blue-600' :
                    'bg-zinc-700'
                  }`}>
                    {n.type === 'Mangaka' ? 'Tác giả' : n.type === 'Board' ? 'Hội đồng' : 'Hệ thống'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {formatRealTime(n.createdAt)}
                  </span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#E63946]" />
                  )}
                </div>

                <h3 className={`text-sm uppercase mt-1 leading-tight group-hover:text-[#E63946] transition-colors ${
                  !n.isRead ? 'font-black text-black' : 'font-normal text-zinc-500'
                }`}>
                  {n.title}
                </h3>
                
                <p className={`text-xs mt-1 leading-relaxed ${
                  !n.isRead ? 'font-bold text-gray-800' : 'font-normal text-gray-400'
                }`}>
                  {n.message}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0 self-center">
                {n.link && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNotifClick(n)
                    }}
                    className="p-2 border-2 border-black bg-zinc-50 hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {!n.isRead && (
                  <button
                    onClick={(e) => handleMarkRead(n.id, e)}
                    title="Đánh dấu đã đọc"
                    className="p-2 border-2 border-black bg-white hover:bg-green-50 hover:text-green-600 transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDeleteClick(n.id, e)}
                  title="Xóa thông báo"
                  className="p-2 border-2 border-black bg-white hover:bg-red-50 hover:text-[#E63946] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black p-6 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center animate-fade-in">
            <h4 className="text-sm font-black uppercase tracking-wider mb-2">Xác nhận xóa</h4>
            <p className="text-xs text-gray-500 font-bold mb-6">Bạn có chắc chắn muốn xóa thông báo này?</p>
            <div className="flex gap-4">
              <button
                onClick={async () => {
                  const id = confirmDeleteId
                  setConfirmDeleteId(null)
                  try {
                    await editorService.deleteNotification(id)
                    window.dispatchEvent(new Event('mangaflow_notifications_updated'))
                    await loadNotifications()
                    showToast('Đã xóa thông báo thành công!', 'success')
                  } catch (err) {
                    console.error(err)
                    showToast('Không thể xóa thông báo.', 'error')
                  }
                }}
                className="flex-1 py-2 bg-[#FF9898] border-2 border-black font-extrabold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                Đồng ý
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2 bg-white border-2 border-black font-extrabold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Neo-brutalist Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-bounce-in">
          <div className={`border-4 border-black p-4 font-bold text-xs uppercase tracking-wider flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
            toastType === 'success' ? 'bg-[#98FF98] text-black' : 
            toastType === 'error' ? 'bg-[#FF9898] text-black' : 'bg-yellow-200 text-black'
          }`}>
            <span>{toastType === 'success' ? '✅' : toastType === 'error' ? '❌' : 'ℹ️'}</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
