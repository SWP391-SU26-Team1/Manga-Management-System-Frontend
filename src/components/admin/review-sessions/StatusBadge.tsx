import React from 'react'

type StatusBadgeProps = {
  status: string
}

const labelByStatus: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  finished: 'Finished',
  paused: 'Paused',
  cancelled: 'Cancelled',
  submitted: 'Submitted',
  verified: 'Verified',
}

const classByStatus: Record<string, string> = {
  pending: 'border-slate-300 bg-slate-100 text-slate-700',
  in_progress: 'border-blue-200 bg-blue-100 text-blue-700',
  completed: 'border-green-200 bg-green-100 text-green-700',
  finished: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  paused: 'border-amber-200 bg-amber-100 text-amber-700',
  cancelled: 'border-red-200 bg-red-100 text-red-700',
  submitted: 'border-blue-200 bg-blue-100 text-blue-700',
  verified: 'border-green-200 bg-green-100 text-green-700',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status?.toLowerCase() || 'unknown'

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-3 text-xs font-semibold ${classByStatus[normalized] || 'border-slate-300 bg-slate-100 text-slate-700'}`}
    >
      {labelByStatus[normalized] || normalized.replace(/_/g, ' ')}
    </span>
  )
}
