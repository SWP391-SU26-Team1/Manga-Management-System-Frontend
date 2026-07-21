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
    { action: 'start', label: 'Bắt đầu', icon: Play, className: 'border-2 border-manga-ink bg-emerald-400 text-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]' },
    { action: 'cancel', label: 'Hủy bỏ', icon: XCircle, className: 'border-2 border-manga-ink bg-manga-red text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]' },
  ],
  in_progress: [
    { action: 'pause', label: 'Tạm dừng', icon: Pause, className: 'border-2 border-manga-ink bg-amber-400 text-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]' },
    { action: 'finalize', label: 'Hoàn tất', icon: CheckCircle2, className: 'border-2 border-manga-ink bg-sky-400 text-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]' },
    { action: 'cancel', label: 'Hủy bỏ', icon: XCircle, className: 'border-2 border-manga-ink bg-manga-red text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]' },
  ],
  paused: [
    { action: 'start', label: 'Tiếp tục', icon: Play, className: 'border-2 border-manga-ink bg-emerald-400 text-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]' },
    { action: 'cancel', label: 'Hủy bỏ', icon: XCircle, className: 'border-2 border-manga-ink bg-manga-red text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]' },
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
  const buttonSize = compact ? 'h-9 px-3 text-xs' : 'h-10 px-4 text-sm'

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ action, label, icon: Icon, className }) => (
        <button
          key={action}
          type="button"
          title={label}
          disabled={isBusy}
          onClick={() => onWorkflowAction(session, action)}
          className={`inline-flex items-center justify-center gap-2 font-black uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60 transition-all ${buttonSize} ${className}`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}

      {canManageVotes(session.status) && (
        <button
          type="button"
          title="Quản lý phiếu"
          disabled={isBusy}
          onClick={() => onManageVotes(session)}
          className={`inline-flex items-center justify-center gap-2 border-2 border-manga-ink bg-white font-black uppercase tracking-wider text-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-60 ${buttonSize}`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Quản lý phiếu
        </button>
      )}

      {canProcessResult(session.status) && (
        <button
          type="button"
          title="Xử lý kết quả"
          disabled={isBusy || isProcessing}
          onClick={() => onProcessResult(session)}
          className={`inline-flex items-center justify-center gap-2 border-2 border-manga-ink bg-purple-400 font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-60 ${buttonSize}`}
        >
          <BarChart3 className="h-4 w-4" />
          {isProcessing ? 'Đang xử lý...' : 'Xử lý kết quả'}
        </button>
      )}
    </div>
  )
}

