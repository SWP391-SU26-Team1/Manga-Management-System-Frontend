import React, { useEffect, useState } from 'react'
import { Bell, BookOpen, Clock } from 'lucide-react'
import { Link } from 'react-router'
import { readerService } from '@/services/reader.service'
import { PublishedSeries } from '@/types/reader.types'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<PublishedSeries[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // When visiting notifications, mark current time as last read to clear the red dot on header
    localStorage.setItem('mangaflow_last_read_notifications', new Date().toISOString())
    
    // Fetch latest published series as notifications
    const fetchNotifications = async () => {
      try {
        const latest = await readerService.getLatestUpdates(20)
        setNotifications(latest)
      } catch (error) {
        console.error('Failed to load notifications', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return 'Vừa xong'
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    return `${Math.floor(diff / 86400)} ngày trước`
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 font-sans mt-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-10 h-10 text-manga-red" />
        <div>
          <h1 className="font-manga text-4xl md:text-5xl font-black uppercase text-manga-ink leading-none">
            THÔNG BÁO
          </h1>
          <div className="text-sm font-bold text-gray-500 uppercase mt-1">
            Cập nhật những bộ truyện mới xuất bản
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 border-4 border-black bg-white shadow-[8px_8px_0px_#000]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-manga-red"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_#000]">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-manga text-2xl font-bold uppercase text-gray-400">Không có thông báo mới</h3>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map((series) => (
            <Link 
              key={series.id} 
              to={`/series/${series.id}`}
              className="bg-white border-4 border-black p-4 flex gap-4 transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_#000] group"
            >
              <div className="w-16 h-16 bg-gray-200 border-2 border-black flex-shrink-0 overflow-hidden">
                <img 
                  src={series.coverImageUrl || `https://ui-avatars.com/api/?name=${series.title}&background=random`} 
                  alt={series.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white bg-manga-red px-2 py-0.5 uppercase border border-black">
                    Mới Xuất Bản
                  </span>
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(series.updatedAt || series.createdAt || '')}
                  </span>
                </div>
                <h4 className="font-manga text-lg font-bold uppercase text-manga-ink group-hover:text-manga-red transition-colors line-clamp-1">
                  {series.title}
                </h4>
                <p className="text-sm font-bold text-gray-600 line-clamp-1">
                  Bộ truyện "{series.title}" vừa được xuất bản và ra mắt cộng đồng. Hãy là một trong những người đầu tiên đón đọc!
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
