import React from 'react'
import { BookOpen } from 'lucide-react'

export default function MangaListPage() {
  return (
    <div className="max-w-6xl mx-auto pb-16">
      <div className="mb-6">
        <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none">
          DANH SÁCH MANGA
        </h1>
        <div className="h-1.5 w-24 bg-manga-red mt-3" />
        <p className="text-sm font-bold text-gray-500 mt-2">
          Khám phá các tác phẩm manga trên nền tảng MangaFlow.
        </p>
      </div>

      <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <h3 className="font-manga text-2xl font-bold uppercase text-gray-500 mb-1">Đang tải danh sách manga...</h3>
        <p className="text-sm font-bold text-gray-400">
          Tính năng này sẽ được cập nhật sớm.
        </p>
      </div>
    </div>
  )
}
