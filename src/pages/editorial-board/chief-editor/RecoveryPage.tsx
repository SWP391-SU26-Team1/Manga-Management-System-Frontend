import React from 'react'
import { Link } from 'react-router'
import { Lock, ArrowLeft } from 'lucide-react'

export default function RecoveryPage() {
  return (
    <div className="max-w-md mx-auto py-16 text-center font-sans">
      <div className="bg-white border-4 border-manga-ink p-8 shadow-[8px_8px_0px_rgba(15,15,15,1)] flex flex-col items-center">
        {/* Large Lock icon badge */}
        <div className="w-16 h-16 bg-manga-red text-white flex items-center justify-center rounded-full border-4 border-manga-ink shadow-md mb-6 animate-bounce">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="font-manga text-3xl font-black uppercase text-manga-ink leading-none mb-3">
          CHIEF EDITOR ONLY
        </h2>
        <div className="h-1.5 w-16 bg-manga-red mb-4" />
        
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-6 leading-relaxed">
          Tính năng **Hồ sơ phục hồi** chỉ dành riêng cho vai trò Trưởng ban Biên tập (Chief Editor). Bạn không có quyền truy cập trang này.
        </p>

        <Link 
          to="/dashboard/editorial-board"
          className="flex items-center justify-center gap-1.5 bg-manga-ink text-white font-manga font-bold text-xs uppercase px-6 py-3 border-2 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VỀ TRANG CHỦ</span>
        </Link>
      </div>
    </div>
  )
}
