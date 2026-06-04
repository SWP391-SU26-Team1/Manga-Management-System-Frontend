import React, { useState, useEffect } from 'react'
import { Bell, Check, Trash2, Filter } from 'lucide-react'
import { mangakaStore, Notification } from '@/data/mangakaMockData'
import { useNavigate } from 'react-router'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"All" | "Unread" | "Assistant" | "Editor" | "Board" | "Ranking">("All")

  useEffect(() => {
    setNotifications(mangakaStore.getNotifications())
  }, [])

  const handleMarkAllRead = () => {
    mangakaStore.markAllNotificationsRead()
    setNotifications(mangakaStore.getNotifications())
  }

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    mangakaStore.markNotificationRead(id)
    setNotifications(mangakaStore.getNotifications())
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = notifications.filter(n => n.id !== id)
    // mangakaStore does not have a delete method, but for mock purposes we just update local state
    setNotifications(updated)
  }

  const handleNotifClick = (notif: Notification) => {
    mangakaStore.markNotificationRead(notif.id)
    if (notif.link) {
      navigate(notif.link)
    } else {
      setNotifications(mangakaStore.getNotifications())
    }
  }

  const filteredNotifs = notifications.filter(n => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.isRead;
    return n.type === filter;
  })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-red tracking-wide mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8" />
            THÔNG BÁO
          </h1>
          <p className="text-gray-600 font-bold">Cập nhật tình hình từ trợ lý, biên tập viên và hội đồng</p>
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
            {["All", "Unread", "Assistant", "Editor", "Board", "Ranking"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`w-full text-left px-4 py-3 font-bold uppercase text-sm border-2 transition-colors ${
                  filter === f ? 'bg-manga-red text-white border-manga-ink' : 'bg-transparent border-transparent hover:bg-gray-200 text-gray-700'
                }`}
              >
                {f === 'All' ? 'Tất cả' : 
                 f === 'Unread' ? 'Chưa đọc' : 
                 f === 'Assistant' ? 'Từ Trợ lý' :
                 f === 'Editor' ? 'Từ Editor' :
                 f === 'Board' ? 'Từ Hội đồng' : 'Xếp hạng'}
                
                {f === 'Unread' && notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 flex flex-col">
          <div className="divide-y-2 divide-gray-100">
            {filteredNotifs.length > 0 ? filteredNotifs.map(n => (
              <div 
                key={n.id}
                onClick={() => handleNotifClick(n)}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4 ${!n.isRead ? 'bg-red-50/30' : ''}`}
              >
                <div className={`w-12 h-12 shrink-0 border-2 border-manga-ink flex items-center justify-center ${
                  n.type === 'Editor' ? 'bg-blue-100 text-blue-600' :
                  n.type === 'Assistant' ? 'bg-green-100 text-green-600' :
                  n.type === 'Ranking' ? 'bg-orange-100 text-orange-600' :
                  n.type === 'Board' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <Bell className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border border-current ${
                      n.type === 'Editor' ? 'text-blue-600' :
                      n.type === 'Assistant' ? 'text-green-600' :
                      n.type === 'Ranking' ? 'text-orange-600' :
                      n.type === 'Board' ? 'text-purple-600' :
                      'text-gray-600'
                    }`}>{n.type}</span>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                    <span className="text-xs text-gray-400 font-bold ml-auto">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 truncate">{n.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                </div>

                <div className="flex flex-col gap-2 shrink-0 border-l-2 border-gray-100 pl-4">
                  {!n.isRead && (
                    <button 
                      onClick={(e) => handleMarkRead(n.id, e)}
                      className="text-xs font-bold text-gray-500 hover:text-manga-ink flex items-center gap-1"
                      title="Đánh dấu đã đọc"
                    >
                      <Check className="w-4 h-4" /> Đọc
                    </button>
                  )}
                  <button 
                    onClick={(e) => handleDelete(n.id, e)}
                    className="text-xs font-bold text-gray-500 hover:text-red-600 flex items-center gap-1"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold uppercase text-lg">Không có thông báo nào</p>
                <p className="text-gray-400 text-sm mt-1">Tất cả đều gọn gàng!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
