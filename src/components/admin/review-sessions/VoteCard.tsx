import React from 'react'
import { CheckCircle2, Edit3, Trash2 } from 'lucide-react'
import type { Vote } from '@/services/admin/admin.types'
import { formatDateTime, formatScore, getVoteId, getVoterLabel } from './helpers'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import type { VoteHandler } from './types'

type VoteCardProps = {
  vote: Vote
  busyVoteId?: string | null
  onEdit: VoteHandler
  onVerify: VoteHandler
  onDelete: VoteHandler
}

const actionClass =
  'inline-flex h-9 w-9 items-center justify-center border-2 border-manga-ink bg-white text-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]'

export function VoteCard({ vote, busyVoteId, onEdit, onVerify, onDelete }: VoteCardProps) {
  const isBusy = busyVoteId === getVoteId(vote)

  return (
    <article className="border-2 border-manga-ink bg-white p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-manga-ink">{getVoterLabel(vote)}</p>
          {vote.users?.email && <p className="mt-1 text-xs font-bold text-gray-500">{vote.users.email}</p>}
        </div>
        <AdminStatusBadge status={vote.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold">
        <div>
          <p className="text-gray-400 uppercase tracking-wider text-[10px]">Quyết định</p>
          <p className="mt-1 capitalize text-manga-ink font-black">{vote.decision || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wider text-[10px]">Điểm số</p>
          <p className="mt-1 text-manga-ink font-black">{formatScore(vote.score)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-400 uppercase tracking-wider text-[10px]">Ghi chú</p>
          <p className="mt-1 whitespace-pre-wrap text-manga-ink">{vote.note || 'N/A'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-400 uppercase tracking-wider text-[10px]">Ngày tạo</p>
          <p className="mt-1 text-manga-ink">{formatDateTime(vote.created_at)}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2 border-t-2 border-manga-ink pt-4">
        <button
          type="button"
          title="Chỉnh sửa biểu quyết"
          onClick={() => onEdit(vote)}
          className={actionClass}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        {vote.status !== 'verified' && (
          <button
            type="button"
            title="Xác minh biểu quyết"
            disabled={isBusy}
            onClick={() => onVerify(vote)}
            className={`${actionClass} bg-emerald-400 text-black`}
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          title="Xóa biểu quyết"
          disabled={isBusy}
          onClick={() => onDelete(vote)}
          className={`${actionClass} bg-manga-red text-white`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}

