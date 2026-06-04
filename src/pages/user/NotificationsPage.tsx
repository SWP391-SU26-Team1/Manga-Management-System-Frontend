import React from 'react'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="max-w-6xl mx-auto pb-16">
      <div className="mb-6">
        <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none">
          THÔNG BÁO
        </h1>
        <div className="h-1.5 w-24 bg-manga-red mt-3" />
      </div>

      <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <h3 className="font-manga text-2xl font-bold uppercase text-gray-500 mb-1">Không có thông báo mới</h3>
        <p className="text-sm font-bold text-gray-400">Tất cả thông báo của bạn sẽ xuất hiện ở đây.</p>
      </div>
    </div>
  )
}
