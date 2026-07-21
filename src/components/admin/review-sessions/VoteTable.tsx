import React from 'react'
import { CheckCircle2, Edit3, Trash2 } from 'lucide-react'
import type { Vote } from '@/services/admin/admin.types'
import { formatDateTime, formatScore, getVoteId, getVoterLabel } from './helpers'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import type { VoteHandler } from './types'

type VoteTableProps = {
  votes: Vote[]
  busyVoteId?: string | null
  onEdit: VoteHandler
  onVerify: VoteHandler
  onDelete: VoteHandler
}

const actionClass =
  'inline-flex h-9 w-9 items-center justify-center border-2 border-manga-ink bg-white text-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]'

export function VoteTable({ votes, busyVoteId, onEdit, onVerify, onDelete }: VoteTableProps) {
  return (
    <div className="hidden overflow-x-auto border-2 border-manga-ink bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] md:block">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead className="bg-[#282828] text-white">
          <tr className="text-xs font-black uppercase tracking-wider">
            <th className="border-r-2 border-black px-4 py-3">Người biểu quyết</th>
            <th className="border-r-2 border-black px-4 py-3">Quyết định</th>
            <th className="border-r-2 border-black px-4 py-3">Điểm số</th>
            <th className="border-r-2 border-black px-4 py-3">Ghi chú</th>
            <th className="border-r-2 border-black px-4 py-3">Trạng thái</th>
            <th className="border-r-2 border-black px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="text-sm font-bold text-manga-ink">
          {votes.map((vote) => {
            const voteId = getVoteId(vote)
            const isBusy = busyVoteId === voteId

            return (
              <tr key={voteId} className="align-top border-b-2 border-manga-ink last:border-b-0 hover:bg-[#fafafa]">
                <td className="border-r-2 border-manga-ink px-4 py-3">
                  <p className="font-black text-manga-ink">{getVoterLabel(vote)}</p>
                  {vote.users?.email && <p className="mt-1 text-xs font-bold text-gray-500">{vote.users.email}</p>}
                </td>
                <td className="border-r-2 border-manga-ink px-4 py-3 capitalize text-manga-ink font-black">{vote.decision || 'N/A'}</td>
                <td className="border-r-2 border-manga-ink px-4 py-3 text-manga-ink font-black">{formatScore(vote.score)}</td>
                <td className="border-r-2 border-manga-ink px-4 py-3">
                  <p className="max-w-[220px] whitespace-pre-wrap leading-relaxed text-xs text-gray-600 font-bold">{vote.note || 'N/A'}</p>
                </td>
                <td className="border-r-2 border-manga-ink px-4 py-3">
                  <AdminStatusBadge status={vote.status} />
                </td>
                <td className="border-r-2 border-manga-ink px-4 py-3 text-xs font-bold text-gray-600">{formatDateTime(vote.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
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
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

