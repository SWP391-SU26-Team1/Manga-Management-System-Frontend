import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { AdminButton } from '@/components/admin/AdminButton'

type ErrorStateProps = {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="border-2 border-manga-ink bg-[#fee2e2] p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertCircle className="mt-1 h-6 w-6 text-manga-red shrink-0" />
          <div>
            <p className="font-manga text-xl font-black uppercase text-manga-ink">Không thể tải danh sách phiên đánh giá</p>
            <p className="mt-1 text-sm font-bold text-gray-700">{message}</p>
          </div>
        </div>
        <AdminButton
          type="button"
          variant="red"
          icon={RefreshCw}
          onClick={onRetry}
        >
          Thử lại
        </AdminButton>
      </div>
    </div>
  )
}

