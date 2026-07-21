import React from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import type { ReviewSession, Vote } from '@/services/admin/admin.types'
import { getVoteId } from './helpers'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { LoadingSkeleton } from './LoadingSkeleton'
import { VoteCard } from './VoteCard'
import { VoteTable } from './VoteTable'
import { AdminButton } from '@/components/admin/AdminButton'
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
  { label: 'Tất cả biểu quyết', value: 'all' },
  { label: 'Chờ duyệt', value: 'submitted' },
  { label: 'Đã xác minh', value: 'verified' },
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
      <div className="flex flex-col gap-3 border-2 border-manga-ink bg-[#fafafa] p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`h-9 border-2 border-manga-ink px-3 text-sm font-black transition-all ${
                filter === option.value
                  ? 'bg-manga-red text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-manga-ink hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <AdminButton
            type="button"
            variant="white"
            icon={RefreshCw}
            onClick={onReload}
          >
            Tải lại
          </AdminButton>
          {canCreateVote && (
            <AdminButton
              type="button"
              variant="red"
              icon={Plus}
              onClick={onCreateVote}
            >
              Tạo biểu quyết
            </AdminButton>
          )}
        </div>
      </div>

      {filteredVotes.length === 0 ? (
        <AdminEmptyState
          title="Chưa có biểu quyết nào"
          description="Các lượt biểu quyết cho phiên này sẽ xuất hiện ở đây sau khi các thành viên ban đánh giá thực hiện gửi."
        />
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

