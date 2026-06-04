import React from 'react'
import { RefreshCw } from 'lucide-react'

export default function RecoveryProposalPage() {
  return (
    <div className="max-w-6xl mx-auto pb-16">
      <div className="mb-6">
        <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">ĐỀ XUẤT PHỤC HỒI</h1>
        <div className="h-1.5 w-24 bg-manga-red mt-3" />
      </div>
      <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
        <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Không có đề xuất phục hồi nào</h3>
      </div>
    </div>
  )
}
