import React from 'react'
import { BarChart3, CheckCircle2, Pause, Play, Square, XCircle } from 'lucide-react'
import type { ReviewSession } from '@/services/admin/admin.types'
import { getSessionId } from './helpers'
import type { SessionActionHandler, SessionHandler, SessionProcessHandler, WorkflowAction } from './types'

type ReviewSessionWorkflowActionsProps = {
  session: ReviewSession
  busyKey?: string | null
  processingSessionId?: string | null
  compact?: boolean
  onWorkflowAction: SessionActionHandler
  onManageVotes: SessionHandler
  onProcessResult: SessionProcessHandler
}

const workflowByStatus: Record<string, Array<{ action: WorkflowAction; label: string; icon: typeof Play; className: string }>> = {
  pending: [
    { action: 'start', label: 'Start', icon: Play, className: 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700' },
    { action: 'cancel', label: 'Cancel', icon: XCircle, className: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' },
  ],
  in_progress: [
    { action: 'pause', label: 'Pause', icon: Pause, className: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { action: 'finalize', label: 'Finalize', icon: CheckCircle2, className: 'border-green-600 bg-green-600 text-white hover:bg-green-700' },
    { action: 'cancel', label: 'Cancel', icon: XCircle, className: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' },
  ],
  paused: [
    { action: 'start', label: 'Start', icon: Play, className: 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700' },
    { action: 'cancel', label: 'Cancel', icon: XCircle, className: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' },
  ],
  completed: [],
  finished: [],
  cancelled: [],
}

const canManageVotes = (status: string) => ['in_progress', 'completed', 'finished'].includes(status)
const canProcessResult = (status: string) => ['in_progress', 'completed'].includes(status)

export function ReviewSessionWorkflowActions({
  session,
  busyKey,
  processingSessionId,
  compact = false,
  onWorkflowAction,
  onManageVotes,
  onProcessResult,
}: ReviewSessionWorkflowActionsProps) {
  const sessionId = getSessionId(session)
  const actions = workflowByStatus[session.status] || []
  const isBusy = Boolean(busyKey?.endsWith(sessionId))
  const isProcessing = processingSessionId === sessionId
  const buttonSize = compact ? 'h-9 px-3 text-xs' : 'h-10 px-3 text-sm'

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ action, label, icon: Icon, className }) => (
        <button
          key={action}
          type="button"
          title={label}
          disabled={isBusy}
          onClick={() => onWorkflowAction(session, action)}
          className={`inline-flex items-center justify-center gap-2 rounded-md border font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${buttonSize} ${className}`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}

      {canManageVotes(session.status) && (
        <button
          type="button"
          title="Manage votes"
          disabled={isBusy}
          onClick={() => onManageVotes(session)}
          className={`inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${buttonSize}`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Manage Votes
        </button>
      )}

      {canProcessResult(session.status) && (
        <button
          type="button"
          title="Process result"
          disabled={isBusy || isProcessing}
          onClick={() => onProcessResult(session)}
          className={`inline-flex items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 ${buttonSize}`}
        >
          <BarChart3 className="h-4 w-4" />
          {isProcessing ? 'Processing...' : 'Process Result'}
        </button>
      )}
    </div>
  )
}
