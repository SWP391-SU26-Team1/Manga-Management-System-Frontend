import React, { FormEvent } from 'react'
import { Save, X } from 'lucide-react'
import type { Vote } from '@/services/admin/admin.types'
import { AdminButton } from '@/components/admin/AdminButton'
import type { VoteFormValues } from './types'

type VoteFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  values: VoteFormValues
  vote?: Vote | null
  loading?: boolean
  onChange: (field: keyof VoteFormValues, value: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const inputClass =
  'h-11 w-full border-2 border-manga-ink bg-white px-3 text-sm text-manga-ink font-bold outline-none focus:bg-amber-50 disabled:bg-gray-100 disabled:opacity-70'
const labelClass = 'mb-2 block text-sm font-black uppercase text-manga-ink'

export function VoteFormModal({
  open,
  mode,
  values,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: VoteFormModalProps) {
  if (!open) return null

  const isCreate = mode === 'create'

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl border-2 border-manga-ink bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="flex items-start justify-between border-b-2 border-manga-ink p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-manga-red">Biểu quyết</p>
            <h2 className="font-manga text-3xl font-black uppercase text-manga-ink mt-1">
              {isCreate ? 'Tạo biểu quyết' : 'Chỉnh sửa biểu quyết'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-manga-ink bg-white shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-gray-100"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Quyết định</span>
              <select
                value={values.decision}
                onChange={(event) => onChange('decision', event.target.value)}
                className={inputClass}
              >
                <option value="APPROVE">Đồng ý</option>
                <option value="REJECT">Từ chối</option>
                <option value="REVISE">Cần sửa</option>
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Điểm số</span>
              <input
                type="number"
                min={1}
                max={10}
                value={values.score}
                onChange={(event) => onChange('score', event.target.value)}
                className={inputClass}
                required
              />
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>Trạng thái</span>
            <select
              value={values.status}
              onChange={(event) => onChange('status', event.target.value)}
              className={inputClass}
            >
              <option value="submitted">Đã gửi (Chờ duyệt)</option>
              <option value="verified">Đã xác minh</option>
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>Ghi chú</span>
            <textarea
              value={values.note}
              onChange={(event) => onChange('note', event.target.value)}
              className={`${inputClass} min-h-28 py-3`}
              placeholder="Nhập ghi chú biểu quyết..."
            />
          </label>

          <div className="flex justify-end gap-3 border-t-2 border-manga-ink pt-5 bg-gray-50 -mx-6 -mb-6 p-6">
            <AdminButton
              type="button"
              variant="white"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </AdminButton>
            <AdminButton
              type="submit"
              variant="red"
              icon={Save}
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : isCreate ? 'Tạo biểu quyết' : 'Lưu thay đổi'}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  )
}

