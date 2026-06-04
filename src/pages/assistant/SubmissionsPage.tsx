import React from 'react'
import { CheckSquare } from 'lucide-react'

export default function SubmissionsPage() {
  return (
    <div className="max-w-6xl mx-auto pb-16">
      <div className="mb-6">
        <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">BẢN VẼ ĐÃ NỘP</h1>
        <div className="h-1.5 w-24 bg-manga-red mt-3" />
      </div>
      <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
        <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Chưa có bản vẽ nào được nộp</h3>
      </div>
    </div>
  )
}
