import React from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import type { ReviewSession, Vote } from '@/services/admin/admin.types'
import { getVoteId } from './helpers'
import { EmptyState } from './EmptyState'
import { LoadingSkeleton } from './LoadingSkeleton'
import { VoteCard } from './VoteCard'
import { VoteTable } from './VoteTable'
import type { VoteHandler, VoteStatusFilter } from './types'

type VotePanelProps = {
  session: ReviewSession
  votes: Vote[]
  filter: VoteStatusFilter
  loading?: boolean
  busyVoteId?: string | null
  onFilterChange: (status: VoteStatusFilter) => void
  onCreateVote: () => void
  onEditVote: VoteHandler
  onVerifyVote: VoteHandler
  onDeleteVote: VoteHandler
  onReload: () => void
}

const filterOptions: Array<{ label: string; value: VoteStatusFilter }> = [
  { label: 'All votes', value: 'all' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Verified', value: 'verified' },
]

export function VotePanel({
  session,
  votes,
  filter,
  loading = false,
  busyVoteId,
  onFilterChange,
  onCreateVote,
  onEditVote,
  onVerifyVote,
  onDeleteVote,
  onReload,
}: VotePanelProps) {
  const filteredVotes = filter === 'all' ? votes : votes.filter((vote) => vote.status === filter)
  const canCreateVote = session.status === 'in_progress'

  if (loading) return <LoadingSkeleton rows={3} />

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`h-9 rounded-md px-3 text-sm font-semibold ${
                filter === option.value ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReload}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reload
          </button>
          {canCreateVote && (
            <button
              type="button"
              onClick={onCreateVote}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Vote
            </button>
          )}
        </div>
      </div>

      {filteredVotes.length === 0 ? (
        <EmptyState title="No votes found" description="Votes for this session will appear here after reviewers submit them." />
      ) : (
        <>
          <VoteTable
            votes={filteredVotes}
            busyVoteId={busyVoteId}
            onEdit={onEditVote}
            onVerify={onVerifyVote}
            onDelete={onDeleteVote}
          />
          <div className="space-y-3 md:hidden">
            {filteredVotes.map((vote) => (
              <VoteCard
                key={getVoteId(vote)}
                vote={vote}
                busyVoteId={busyVoteId}
                onEdit={onEditVote}
                onVerify={onVerifyVote}
                onDelete={onDeleteVote}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
