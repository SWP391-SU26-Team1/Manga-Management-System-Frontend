import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { AdminButton } from '@/components/admin/AdminButton'

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  tone?: 'danger' | 'warning'
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  tone = 'danger',
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md border-2 border-manga-ink bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="flex items-start justify-between border-b-2 border-manga-ink p-5">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-manga-ink bg-manga-red text-white shadow-[2px_2px_0_rgba(0,0,0,1)]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-manga text-2xl font-black uppercase text-manga-ink">{title}</h2>
              <p className="mt-2 text-sm font-bold text-gray-600 leading-relaxed">{message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-manga-ink bg-white shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-gray-100"
            aria-label="Đóng hộp thoại"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex justify-end gap-3 bg-gray-50 p-5 border-t border-gray-100">
          <AdminButton
            type="button"
            variant="white"
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </AdminButton>
          <AdminButton
            type="button"
            variant={tone === 'danger' ? 'red' : 'dark'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  )
}

