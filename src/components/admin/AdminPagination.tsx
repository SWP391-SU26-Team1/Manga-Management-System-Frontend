import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function AdminPagination() {
  return (
    <div className="flex items-center gap-2">
      <button className="w-10 h-10 border-2 border-gray-300 text-gray-400 flex items-center justify-center bg-white">
        <ChevronLeft className="w-5 h-5" />
      </button>
      {[1, 2, 3].map((page) => (
        <button
          key={page}
          className={`w-10 h-10 border-2 border-manga-ink font-black ${page === 1 ? 'bg-manga-red text-white shadow-[3px_3px_0px_rgba(0,0,0,1)]' : 'bg-white text-black'}`}
        >
          {page}
        </button>
      ))}
      <button className="w-10 h-10 border-2 border-manga-ink text-black flex items-center justify-center bg-white">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
