import React from 'react'
import { Inbox } from 'lucide-react'

type EmptyStateProps = {
  title?: string
  description?: string
}

export function EmptyState({ title = 'No review sessions found', description }: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <Inbox className="h-10 w-10 text-slate-400" />
      <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
    </div>
  )
}
