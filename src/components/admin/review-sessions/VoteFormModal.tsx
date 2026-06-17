import React, { FormEvent } from 'react'
import { Save, X } from 'lucide-react'
import type { Vote } from '@/services/admin/admin.types'
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
  'h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
const labelClass = 'mb-2 block text-sm font-semibold text-slate-700'

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
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-sm font-semibold text-blue-600">Vote</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{isCreate ? 'Create vote' : 'Edit vote'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close vote modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className={labelClass}>Decision</span>
              <select
                value={values.decision}
                onChange={(event) => onChange('decision', event.target.value)}
                className={inputClass}
              >
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <label>
              <span className={labelClass}>Score</span>
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

          <label>
            <span className={labelClass}>Status</span>
            <select value={values.status} onChange={(event) => onChange('status', event.target.value)} className={inputClass}>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
            </select>
          </label>

          <label>
            <span className={labelClass}>Note</span>
            <textarea
              value={values.note}
              onChange={(event) => onChange('note', event.target.value)}
              className={`${inputClass} min-h-28 py-3`}
              placeholder="Vote note"
            />
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : isCreate ? 'Create vote' : 'Save vote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
