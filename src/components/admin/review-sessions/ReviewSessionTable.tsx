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

type ReviewSessionTableProps = {
  sessions: ReviewSession[]
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

const iconButtonClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

export function ReviewSessionTable({
  sessions,
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
}: ReviewSessionTableProps) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
      <table className="w-full min-w-[1180px] border-collapse text-left">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-5 py-4">Review session</th>
            <th className="px-5 py-4">Series / Chapter</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Timeline</th>
            <th className="px-5 py-4">Votes / Result</th>
            <th className="px-5 py-4">Workflow</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {sessions.map((session) => {
            const sessionId = getSessionId(session)
            const summary = resultSummary(results[sessionId])
            const isTerminal = ['finished', 'cancelled'].includes(session.status)

            return (
              <tr key={sessionId} className="align-top hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">{getSessionName(session)}</p>
                  <p className="mt-1 max-w-[240px] truncate text-xs text-slate-500">
                    {session.description || 'No description provided'}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Created by {getCreatedByLabel(session)}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-800">{getSeriesLabel(session)}</p>
                  <p className="mt-1 text-xs text-slate-500">{getChapterLabel(session)}</p>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={session.status} />
                </td>
                <td className="px-5 py-4 text-xs text-slate-600">
                  <p>Created: {formatDateTime(session.created_at || session.createdAt)}</p>
                  <p className="mt-1">Started: {formatDateTime(session.started_at || session.startedAt)}</p>
                  <p className="mt-1">Ended: {formatDateTime(session.ended_at || session.endedAt)}</p>
                </td>
                <td className="px-5 py-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">Votes: {voteCounts[sessionId] ?? 'Not loaded'}</p>
                  <p className="mt-1">Avg score: {summary?.avgScore ?? 'N/A'}</p>
                  <p className="mt-1">Decision: {summary?.dominantDecision ?? 'N/A'}</p>
                </td>
                <td className="px-5 py-4">
                  <ReviewSessionWorkflowActions
                    session={session}
                    busyKey={busyKey}
                    processingSessionId={processingSessionId}
                    compact
                    onWorkflowAction={onWorkflowAction}
                    onManageVotes={onManageVotes}
                    onProcessResult={onProcessResult}
                  />
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      title="View detail"
                      onClick={() => onViewDetail(session)}
                      className={iconButtonClass}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {!isTerminal && (
                      <button
                        type="button"
                        title="Edit session"
                        onClick={() => onEdit(session)}
                        className={iconButtonClass}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                    {!isTerminal && (
                      <button
                        type="button"
                        title="Delete session"
                        onClick={() => onDelete(session)}
                        className={`${iconButtonClass} border-red-200 text-red-600 hover:bg-red-50`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
