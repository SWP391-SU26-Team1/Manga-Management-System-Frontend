import React, { useEffect, useState, useRef } from 'react'
import { User, Mail, Award, BookOpen, Clock, Heart, Camera } from 'lucide-react'

export default function UserProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  
  // Note: we can keep it read-only or use edit mode similar to Board. The user asked for it to look like the image.
  // The image shows the profile with "CHỈNH SỬA HỒ SƠ" button, "THỐNG KÊ", "HOẠT ĐỘNG GẦN ĐÂY", etc.
  
  useEffect(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    if (storedUser) {
      setProfile(JSON.parse(storedUser))
    }
  }, [])

  if (!profile) {
    return <div className="p-8 text-center font-bold text-red-500">Đang tải hồ sơ...</div>
  }

  const userInitials = profile.fullName 
    ? profile.fullName.split(' ').pop()?.slice(0, 2).toUpperCase() 
    : 'U'

  // User stats
  const stats = [
    { label: 'Truyện đã đọc', value: 24, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Chương đã đọc', value: 156, icon: Clock, color: 'text-green-500' },
    { label: 'Đang theo dõi', value: 12, icon: Heart, color: 'text-manga-red' },
  ]

  return (
    <div className="max-w-5xl mx-auto pb-16 font-sans">
      {/* Header Title */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none dark:text-white">
            HỒ SƠ CÁ NHÂN
          </h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3 mb-2" />
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            Quản lý thông tin công khai và lịch sử đọc truyện của bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-8">
          {/* Main Card */}
          <div className="bg-white border-4 border-manga-ink shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 flex flex-col items-center text-center dark:bg-zinc-800 dark:border-black dark:shadow-[8px_8px_0px_#000]">
            <div className="relative mb-6">
              <div 
                className={`w-32 h-32 rounded-full border-4 border-manga-ink bg-zinc-900 overflow-hidden flex items-center justify-center text-white font-extrabold text-4xl shadow-[4px_4px_0px_rgba(0,0,0,1)] relative dark:border-black dark:shadow-[4px_4px_0px_#000]`}
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-400 border-2 border-manga-ink rounded-full dark:border-black" title="Đang hoạt động"></div>
            </div>
            
            <h2 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none mb-2 dark:text-white">
              {profile.fullName || profile.username}
            </h2>

            <div className="inline-block px-3 py-1 bg-manga-red text-white font-bold uppercase text-xs border-2 border-manga-ink mb-4 dark:border-black">
              {profile.role || 'MEMBER USER'}
            </div>
            
            <div className="w-full space-y-3 mt-2 text-left">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-700 p-2 bg-gray-50 border-2 border-dashed border-gray-300 dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-300">
                <User className="w-4 h-4 text-manga-red shrink-0" />
                <span className="truncate">@{profile.username}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-gray-700 p-2 bg-gray-50 border-2 border-dashed border-gray-300 dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-300">
                <Mail className="w-4 h-4 text-manga-red shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
            </div>
          </div>

          {/* Bio Card */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[4px_4px_0px_rgba(15,15,15,1)] dark:bg-zinc-800 dark:border-black dark:shadow-[4px_4px_0px_#000]">
            <h3 className="font-bold text-lg uppercase border-b-2 border-manga-ink pb-2 mb-4 flex items-center gap-2 dark:border-zinc-700 dark:text-white">
              <Award className="w-5 h-5 text-manga-red" /> Tiểu sử
            </h3>
            <p className="text-gray-700 font-medium text-sm leading-relaxed dark:text-gray-300">
              {profile.bio || 'Độc giả yêu thích MangaFlow.'}
            </p>
          </div>
        </div>

        {/* Right Column: Stats & Activities */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white border-4 border-manga-ink p-4 flex flex-col items-center text-center shadow-[4px_4px_0px_rgba(15,15,15,1)] dark:bg-zinc-800 dark:border-black dark:shadow-[4px_4px_0px_#000]">
                <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
                <span className="text-3xl font-black font-manga dark:text-white">{stat.value}</span>
                <span className="text-xs font-bold uppercase text-gray-500 mt-1 dark:text-gray-400">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Reading Preferences / Genres */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] dark:bg-zinc-800 dark:border-black dark:shadow-[6px_6px_0px_#000]">
            <h3 className="font-manga text-2xl font-bold uppercase border-b-4 border-manga-ink pb-3 mb-6 flex items-center gap-3 dark:border-zinc-700 dark:text-white">
              <BookOpen className="w-6 h-6 text-manga-red" />
              Thể loại yêu thích
            </h3>
            
            <div className="flex flex-wrap gap-3">
              {['Action', 'Adventure', 'Fantasy', 'Romance', 'Comedy'].map((item, idx) => (
                <div 
                  key={idx} 
                  className="px-4 py-2 bg-gray-50 border-2 border-manga-ink font-bold text-sm uppercase shadow-[2px_2px_0px_rgba(15,15,15,1)] hover:bg-manga-red hover:text-white transition-colors cursor-default dark:bg-zinc-900 dark:border-black dark:shadow-[2px_2px_0px_#000] dark:text-gray-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] dark:bg-zinc-800 dark:border-black dark:shadow-[6px_6px_0px_#000]">
            <h3 className="font-manga text-2xl font-bold uppercase border-b-4 border-manga-ink pb-3 mb-6 dark:border-zinc-700 dark:text-white">
              Hoạt động gần đây
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 border-l-4 border-manga-red pl-4 py-1">
                <div className="w-2 h-2 rounded-full bg-manga-red mt-1.5 -ml-[23px]"></div>
                <div>
                  <p className="font-bold text-sm dark:text-gray-200">Đã đọc xong - Cyber Ronin Chương 65</p>
                  <span className="text-xs text-gray-500 font-bold uppercase dark:text-gray-400">2 giờ trước</span>
                </div>
              </div>
              <div className="flex items-start gap-4 border-l-4 border-gray-300 pl-4 py-1 dark:border-zinc-700">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 -ml-[23px] dark:bg-zinc-600"></div>
                <div>
                  <p className="font-bold text-sm text-gray-600 dark:text-gray-300">Thêm vào yêu thích - Void Walker</p>
                  <span className="text-xs text-gray-500 font-bold uppercase dark:text-gray-400">1 ngày trước</span>
                </div>
              </div>
              <div className="flex items-start gap-4 border-l-4 border-gray-300 pl-4 py-1 dark:border-zinc-700">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 -ml-[23px] dark:bg-zinc-600"></div>
                <div>
                  <p className="font-bold text-sm text-gray-600 dark:text-gray-300">Bình luận - Chuyển sinh thành Slime Ch. 12</p>
                  <span className="text-xs text-gray-500 font-bold uppercase dark:text-gray-400">3 ngày trước</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
