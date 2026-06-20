import React from 'react'
import { CheckCircle2, Edit3, Trash2 } from 'lucide-react'
import type { Vote } from '@/services/admin/admin.types'
import { formatDateTime, formatScore, getVoteId, getVoterLabel } from './helpers'
import { StatusBadge } from './StatusBadge'
import type { VoteHandler } from './types'

type VoteTableProps = {
  votes: Vote[]
  busyVoteId?: string | null
  onEdit: VoteHandler
  onVerify: VoteHandler
  onDelete: VoteHandler
}

const actionClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

export function VoteTable({ votes, busyVoteId, onEdit, onVerify, onDelete }: VoteTableProps) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Voter</th>
            <th className="px-4 py-3">Decision</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Note</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created at</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {votes.map((vote) => {
            const voteId = getVoteId(vote)
            const isBusy = busyVoteId === voteId

            return (
              <tr key={voteId} className="align-top hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{getVoterLabel(vote)}</p>
                  {vote.users?.email && <p className="mt-1 text-xs text-slate-500">{vote.users.email}</p>}
                </td>
                <td className="px-4 py-3 capitalize text-slate-700">{vote.decision || 'N/A'}</td>
                <td className="px-4 py-3 text-slate-700">{formatScore(vote.score)}</td>
                <td className="px-4 py-3">
                  <p className="max-w-[220px] whitespace-pre-wrap text-slate-600">{vote.note || 'N/A'}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={vote.status} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{formatDateTime(vote.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button type="button" title="Edit vote" onClick={() => onEdit(vote)} className={actionClass}>
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {vote.status !== 'verified' && (
                      <button
                        type="button"
                        title="Verify vote"
                        disabled={isBusy}
                        onClick={() => onVerify(vote)}
                        className={`${actionClass} border-green-200 text-green-700 hover:bg-green-50`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Delete vote"
                      disabled={isBusy}
                      onClick={() => onDelete(vote)}
                      className={`${actionClass} border-red-200 text-red-600 hover:bg-red-50`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
