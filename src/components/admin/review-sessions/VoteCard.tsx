import React from 'react'
import { CheckCircle2, Edit3, Trash2 } from 'lucide-react'
import type { Vote } from '@/services/admin/admin.types'
import { formatDateTime, formatScore, getVoteId, getVoterLabel } from './helpers'
import { StatusBadge } from './StatusBadge'
import type { VoteHandler } from './types'

type VoteCardProps = {
  vote: Vote
  busyVoteId?: string | null
  onEdit: VoteHandler
  onVerify: VoteHandler
  onDelete: VoteHandler
}

const actionClass = 'inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600'

export function VoteCard({ vote, busyVoteId, onEdit, onVerify, onDelete }: VoteCardProps) {
  const isBusy = busyVoteId === getVoteId(vote)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{getVoterLabel(vote)}</p>
          {vote.users?.email && <p className="mt-1 text-xs text-slate-500">{vote.users.email}</p>}
        </div>
        <StatusBadge status={vote.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="font-semibold text-slate-500">Decision</p>
          <p className="mt-1 capitalize text-slate-900">{vote.decision || 'N/A'}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-500">Score</p>
          <p className="mt-1 text-slate-900">{formatScore(vote.score)}</p>
        </div>
        <div className="col-span-2">
          <p className="font-semibold text-slate-500">Note</p>
          <p className="mt-1 whitespace-pre-wrap text-slate-900">{vote.note || 'N/A'}</p>
        </div>
        <div className="col-span-2">
          <p className="font-semibold text-slate-500">Created at</p>
          <p className="mt-1 text-slate-900">{formatDateTime(vote.created_at)}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" title="Edit vote" onClick={() => onEdit(vote)} className={actionClass}>
          <Edit3 className="h-4 w-4" />
        </button>
        {vote.status !== 'verified' && (
          <button
            type="button"
            title="Verify vote"
            disabled={isBusy}
            onClick={() => onVerify(vote)}
            className={`${actionClass} border-green-200 text-green-700`}
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          title="Delete vote"
          disabled={isBusy}
          onClick={() => onDelete(vote)}
          className={`${actionClass} border-red-200 text-red-600`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}
