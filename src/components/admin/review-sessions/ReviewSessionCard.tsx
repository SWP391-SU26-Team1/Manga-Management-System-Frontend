import React from 'react'
import { Edit3, Eye, Trash2 } from 'lucide-react'
import type { ReviewSession } from '@/services/admin/admin.types'
import {
  formatDateTime,
  getChapterLabel,
  getCreatedByLabel,
  getSeriesLabel,
  getSessionId,
  getSessionName,
  resultSummary,
} from './helpers'
import { ReviewSessionWorkflowActions } from './ReviewSessionWorkflowActions'
import { StatusBadge } from './StatusBadge'
import type {
  SessionActionHandler,
  SessionHandler,
  SessionProcessHandler,
  SessionResultMap,
  VoteCountMap,
} from './types'

type ReviewSessionCardProps = {
  session: ReviewSession
  voteCounts: VoteCountMap
  results: SessionResultMap
  busyKey?: string | null
  processingSessionId?: string | null
  onViewDetail: SessionHandler
  onEdit: SessionHandler
  onDelete: SessionHandler
  onWorkflowAction: SessionActionHandler
  onManageVotes: SessionHandler
  onProcessResult: SessionProcessHandler
}

const actionClass = 'inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600'

export function ReviewSessionCard({
  session,
  voteCounts,
  results,
  busyKey,
  processingSessionId,
  onViewDetail,
  onEdit,
  onDelete,
  onWorkflowAction,
  onManageVotes,
  onProcessResult,
}: ReviewSessionCardProps) {
  const sessionId = getSessionId(session)
  const summary = resultSummary(results[sessionId])
  const isTerminal = ['finished', 'cancelled'].includes(session.status)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{getSessionName(session)}</h3>
          <p className="mt-1 text-xs text-slate-500">{session.description || 'No description provided'}</p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="font-semibold text-slate-500">Series</p>
          <p className="mt-1 text-slate-900">{getSeriesLabel(session)}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-500">Chapter</p>
          <p className="mt-1 text-slate-900">{getChapterLabel(session)}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-500">Created by</p>
          <p className="mt-1 text-slate-900">{getCreatedByLabel(session)}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-500">Created at</p>
          <p className="mt-1 text-slate-900">{formatDateTime(session.created_at || session.createdAt)}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-500">Votes</p>
          <p className="mt-1 text-slate-900">{voteCounts[sessionId] ?? 'Not loaded'}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-500">Avg score</p>
          <p className="mt-1 text-slate-900">{summary?.avgScore ?? 'N/A'}</p>
        </div>
      </div>

      <div className="mt-4">
        <ReviewSessionWorkflowActions
          session={session}
          busyKey={busyKey}
          processingSessionId={processingSessionId}
          compact
          onWorkflowAction={onWorkflowAction}
          onManageVotes={onManageVotes}
          onProcessResult={onProcessResult}
        />
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" title="View detail" onClick={() => onViewDetail(session)} className={actionClass}>
          <Eye className="h-4 w-4" />
        </button>
        {!isTerminal && (
          <button type="button" title="Edit session" onClick={() => onEdit(session)} className={actionClass}>
            <Edit3 className="h-4 w-4" />
          </button>
        )}
        {!isTerminal && (
          <button
            type="button"
            title="Delete session"
            onClick={() => onDelete(session)}
            className={`${actionClass} border-red-200 text-red-600`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  )
}
