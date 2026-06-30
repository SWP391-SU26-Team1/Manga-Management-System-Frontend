import React from 'react'

export default function VotingPage() {
  return (
    <div className="max-w-6xl mx-auto pb-16">
      <div className="mb-6">
        <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">BỎ PHIẾU</h1>
        <div className="h-1.5 w-24 bg-manga-red mt-3" />
      </div>
      <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
        <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Chưa có phiên bỏ phiếu nào</h3>
      </div>
    </div>
  )
}
