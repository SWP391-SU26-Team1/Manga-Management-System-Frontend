import React from 'react'
import { BarChart2 } from 'lucide-react'

export default function StudioProgressPage() {
  return (
    <div className="max-w-6xl mx-auto pb-16">
      <div className="mb-6">
        <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">TIẾN ĐỘ STUDIO</h1>
        <div className="h-1.5 w-24 bg-manga-red mt-3" />
      </div>
      <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
        <BarChart2 className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Chưa có dữ liệu tiến độ</h3>
      </div>
    </div>
  )
}
