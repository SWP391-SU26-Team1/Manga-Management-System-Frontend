import React, { useState, useEffect } from 'react'
import { Bell, Check, Trash2, Filter, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router'
import assistantService, { AssistantNotification } from '@/services/assistant.service'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<AssistantNotification[]>([])
  const [filter, setFilter] = useState<"All" | "Unread">("All")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const translateNotification = (title: string, content: string) => {
    let t = title || ''
    let c = content || ''

    const titleLower = t.toLowerCase()
    if (titleLower.includes('submission approved')) {
      t = 'Bản nộp đã được duyệt'
    } else if (titleLower.includes('new task assigned')) {
      t = 'Nhiệm vụ mới được giao'
    } else if (titleLower.includes('task reassigned')) {
      t = 'Nhiệm vụ phân công lại'
    } else if (titleLower.includes('series approved')) {
      t = 'Bộ truyện đã được duyệt'
    } else if (titleLower.includes('revision requested') || titleLower.includes('needs_revision')) {
      t = 'Yêu cầu chỉnh sửa'
    } else if (titleLower.includes('task completed')) {
      t = 'Nhiệm vụ đã hoàn thành'
    } else if (titleLower.includes('task rejected') || titleLower.includes('submission rejected')) {
      t = 'Bài nộp bị từ chối'
    } else if (titleLower.includes('manuscript submitted')) {
      t = 'Bản thảo đã được nộp'
    } else if (titleLower.includes('task submitted')) {
      t = 'Nhiệm vụ đã nộp'
    }

    const contentLower = c.toLowerCase()
    if (contentLower.includes('your page version') && contentLower.includes('has been approved')) {
      const match = c.match(/version\s+(\d+)/i)
      const versionNum = match ? match[1] : '1'
      c = `Phiên bản bản vẽ trang ${versionNum} của bạn đã được tác giả phê duyệt.`
    } else if (contentLower.includes('your page version') && contentLower.includes('has been rejected')) {
      const match = c.match(/version\s+(\d+)/i)
      const versionNum = match ? match[1] : '1'
      c = `Phiên bản bản vẽ trang ${versionNum} của bạn bị từ chối.`
    } else if (contentLower.includes('reviewer requested changes on page version')) {
      const match = c.match(/version\s+(\d+):\s*(.*)/i)
      const versionNum = match ? match[1] : '1'
      const note = match ? match[2] : ''
      c = `Tác giả yêu cầu chỉnh sửa ở phiên bản bản vẽ trang ${versionNum}: ${note}`
    } else if (contentLower.includes('you have been assigned a new') || contentLower.includes('you have a new')) {
      let taskType = ''
      if (contentLower.includes('inking')) taskType = 'vẽ nét (Inking)'
      else if (contentLower.includes('coloring')) taskType = 'tô màu (Coloring)'
      else if (contentLower.includes('lettering')) taskType = 'đi chữ (Lettering)'
      else if (contentLower.includes('cleaning')) taskType = 'làm sạch (Cleaning)'
      else if (contentLower.includes('sfx')) taskType = 'hiệu ứng (SFX)'
      else if (contentLower.includes('background')) taskType = 'vẽ nền (Background)'
      
      c = `Bạn vừa được phân công một nhiệm vụ ${taskType || 'vẽ'} mới.`
    } else if (contentLower.includes('series decision: approved')) {
      c = 'Quyết định cho bộ truyện: Đã duyệt thành công.'
    } else if (contentLower.includes('please revise your submission')) {
      c = 'Vui lòng kiểm tra và chỉnh sửa lại bản vẽ của bạn.'
    } else if (contentLower.includes('your task has been completed')) {
      c = 'Nhiệm vụ của bạn đã được ghi nhận hoàn thành.'
    } else if (contentLower.includes('your task has been rejected')) {
      c = 'Bản nộp nhiệm vụ của bạn không được phê duyệt và bị từ chối.'
    } else if (contentLower.includes('a task has been submitted for review')) {
      c = 'Nhiệm vụ đã được nộp và đang chờ tác giả phê duyệt.'
    } else if (contentLower.includes('reassigned to you') || contentLower.includes('has been reassigned to you')) {
      c = 'Một nhiệm vụ vẽ đã được bàn giao lại cho bạn.'
    }

    return { title: t, content: c }
  }

  const formatRealTime = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  }

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await assistantService.listNotifications({ limit: 100 })
      setNotifications(res.data || [])
    } catch (err: any) {
      console.error(err)
      setError('Không thể tải danh sách thông báo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(() => {
      loadNotifications()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await assistantService.markAllRead()
      await loadNotifications()
      window.dispatchEvent(new Event('mangaflow_notifications_updated'))
    } catch (err) {
      console.error(err)
      alert('Không thể đánh dấu đã đọc tất cả thông báo.')
    }
  }

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await assistantService.markRead(id)
      await loadNotifications()
      window.dispatchEvent(new Event('mangaflow_notifications_updated'))
    } catch (err) {
      console.error(err)
      alert('Không thể đánh dấu thông báo đã đọc.')
    }
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirmId(id)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return
    try {
      await assistantService.deleteNotification(deleteConfirmId)
      await loadNotifications()
      window.dispatchEvent(new Event('mangaflow_notifications_updated'))
    } catch (err) {
      console.error(err)
      alert('Không thể xóa thông báo.')
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const handleNotifClick = async (notif: AssistantNotification) => {
    if (!notif.is_read) {
      try {
        await assistantService.markRead(notif.notification_id)
        window.dispatchEvent(new Event('mangaflow_notifications_updated'))
      } catch (err) {
        console.error(err)
      }
    }
    // Navigate to tasks or feedbacks based on type
    const t = notif.type.toLowerCase()
    if (t.includes('task') || t.includes('submission') || t.includes('revision')) {
      navigate('/dashboard/assistant/tasks')
    } else {
      await loadNotifications()
    }
  }

  const filteredNotifs = notifications.filter(n => {
    if (filter === "All") return true
    if (filter === "Unread") return !n.is_read
    return true
  })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-red tracking-wide mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8" />
            THÔNG BÁO TRỢ LÝ
          </h1>
          <p className="text-gray-600 font-bold">Cập nhật công việc, nhiệm vụ được giao và phản hồi từ tác giả</p>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="bg-white border-2 border-manga-ink text-manga-ink font-bold px-4 py-2 hover:bg-gray-100 uppercase text-sm flex items-center gap-2 manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          <Check className="w-4 h-4" />
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="bg-white border-4 border-manga-ink manga-shadow flex flex-col md:flex-row">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 border-b-4 md:border-b-0 md:border-r-4 border-manga-ink bg-gray-50 shrink-0">
          <div className="p-4 border-b-2 border-manga-ink flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <h2 className="font-manga font-bold text-lg uppercase">Bộ lọc</h2>
          </div>
          <div className="p-2 space-y-1">
            {[
              { id: "All", label: "Tất cả" },
              { id: "Unread", label: "Chưa đọc" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`w-full text-left px-4 py-3 font-bold uppercase text-sm border-2 transition-colors ${
                  filter === f.id ? 'bg-manga-red text-white border-manga-ink' : 'bg-transparent border-transparent hover:bg-gray-200 text-gray-700'
                }`}
              >
                {f.label}
                {f.id === 'Unread' && notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs">
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="divide-y-2 divide-gray-100">
            {loading ? (
              <div className="p-12 text-center text-gray-400 font-bold uppercase text-sm">
                Đang tải dữ liệu thông báo...
              </div>
            ) : error ? (
              <div className="p-12 text-center text-manga-red font-bold text-sm">
                Có lỗi xảy ra: {error}
              </div>
            ) : filteredNotifs.length > 0 ? filteredNotifs.map(n => {
              const { title, content } = translateNotification(n.title, n.content || '')
              return (
                <div 
                  key={n.notification_id}
                  onClick={() => handleNotifClick(n)}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4 ${!n.is_read ? 'bg-red-50/30' : ''}`}
                >
                  <div className="w-12 h-12 shrink-0 border-2 border-manga-ink flex items-center justify-center bg-gray-100 text-gray-600">
                    <Bell className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 border border-gray-600 text-gray-600">
                        {n.type || 'HỆ THỐNG'}
                      </span>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                      <span className="text-xs text-gray-400 font-bold ml-auto">{formatRealTime(n.created_at)}</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 truncate">{title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{content}</p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 border-l-2 border-gray-100 pl-4">
                    {!n.is_read && (
                      <button 
                        onClick={(e) => handleMarkRead(n.notification_id, e)}
                        className="text-xs font-bold text-gray-500 hover:text-manga-ink flex items-center gap-1"
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="w-4 h-4" /> Đọc
                      </button>
                    )}
                    <button 
                      onClick={(e) => handleDelete(n.notification_id, e)}
                      className="text-xs font-bold text-gray-500 hover:text-red-600 flex items-center gap-1"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa
                    </button>
                  </div>
                </div>
              )
            }) : (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold uppercase text-lg">Không có thông báo nào</p>
                <p className="text-gray-400 text-sm mt-1">Tất cả đều gọn gàng!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="mt-16 pt-8 border-t-2 border-manga-ink flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-gray-500">
        <div className="font-manga text-2xl text-manga-red">MangaFlow</div>
        <div>© 2026 MangaFlow System. Gangan Press Co. Ltd. All rights reserved.</div>
      </footer>

      {/* Custom Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-manga-ink w-full max-w-md shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center gap-3 text-manga-red mb-4">
              <AlertTriangle className="w-8 h-8 shrink-0 text-[#E63946]" />
              <h3 className="font-manga text-2xl font-bold uppercase text-manga-ink">
                XÁC NHẬN XÓA
              </h3>
            </div>
            
            <p className="text-sm font-bold text-gray-700 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa thông báo này? Hành động này sẽ xóa vĩnh viễn và không thể khôi phục.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border-2 border-manga-ink font-bold text-xs uppercase hover:bg-gray-100 transition-colors bg-white cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-[#E63946] text-white border-2 border-black font-black uppercase transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none text-xs cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
