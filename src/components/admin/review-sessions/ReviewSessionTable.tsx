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
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
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
  'inline-flex h-9 w-9 items-center justify-center border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]'

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
    <div className="hidden overflow-x-auto border-2 border-manga-ink bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)] md:block">
      <table className="w-full min-w-[1180px] border-collapse text-left">
        <thead className="bg-[#282828] text-white">
          <tr className="text-xs font-black uppercase tracking-wider">
            <th className="border-r-2 border-black px-5 py-4">Phiên đánh giá</th>
            <th className="border-r-2 border-black px-5 py-4">Bộ truyện / Chương</th>
            <th className="border-r-2 border-black px-5 py-4">Trạng thái</th>
            <th className="border-r-2 border-black px-5 py-4">Thời gian</th>
            <th className="border-r-2 border-black px-5 py-4">Biểu quyết / Kết quả</th>
            <th className="border-r-2 border-black px-5 py-4">Quy trình</th>
            <th className="px-5 py-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="text-sm font-bold text-manga-ink">
          {sessions.map((session) => {
            const sessionId = getSessionId(session)
            const summary = resultSummary(results[sessionId])
            const isTerminal = ['finished', 'cancelled'].includes(session.status)

            return (
              <tr key={sessionId} className="align-top border-b-2 border-manga-ink last:border-b-0 hover:bg-[#fafafa]">
                <td className="border-r-2 border-manga-ink px-5 py-4">
                  <p className="font-black text-manga-ink text-base">{getSessionName(session)}</p>
                  <p className="mt-1 max-w-[240px] truncate text-xs font-bold text-gray-500">
                    {session.description || 'Không có mô tả.'}
                  </p>
                  <p className="mt-2 text-xs font-black uppercase text-gray-400">Tạo bởi {getCreatedByLabel(session)}</p>
                </td>
                <td className="border-r-2 border-manga-ink px-5 py-4">
                  <p className="font-black text-manga-ink">{getSeriesLabel(session)}</p>
                  <p className="mt-1 text-xs text-gray-500 font-bold">{getChapterLabel(session)}</p>
                </td>
                <td className="border-r-2 border-manga-ink px-5 py-4">
                  <AdminStatusBadge status={session.status} />
                </td>
                <td className="border-r-2 border-manga-ink px-5 py-4 text-xs font-bold text-gray-600 space-y-1">
                  <p><span className="text-gray-400 uppercase tracking-wider text-[10px]">Tạo:</span> {formatDateTime(session.created_at || session.createdAt)}</p>
                  <p><span className="text-gray-400 uppercase tracking-wider text-[10px]">Bắt đầu:</span> {formatDateTime(session.started_at || session.startedAt)}</p>
                  <p><span className="text-gray-400 uppercase tracking-wider text-[10px]">Kết thúc:</span> {formatDateTime(session.ended_at || session.endedAt)}</p>
                </td>
                <td className="border-r-2 border-manga-ink px-5 py-4 text-xs text-gray-700 space-y-1">
                  <p className="font-black text-manga-ink">Biểu quyết: {voteCounts[sessionId] ?? 'Chưa tải'}</p>
                  <p><span className="text-gray-400 uppercase tracking-wider text-[10px]">Điểm TB:</span> {summary?.avgScore ?? 'N/A'}</p>
                  <p><span className="text-gray-400 uppercase tracking-wider text-[10px]">Quyết định:</span> {summary?.dominantDecision ?? 'N/A'}</p>
                </td>
                <td className="border-r-2 border-manga-ink px-5 py-4">
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
                      title="Xem chi tiết"
                      onClick={() => onViewDetail(session)}
                      className={`${iconButtonClass} bg-white text-manga-ink`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {!isTerminal && (
                      <button
                        type="button"
                        title="Chỉnh sửa"
                        onClick={() => onEdit(session)}
                        className={`${iconButtonClass} bg-white text-manga-ink`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                    {!isTerminal && (
                      <button
                        type="button"
                        title="Xóa phiên"
                        onClick={() => onDelete(session)}
                        className={`${iconButtonClass} bg-manga-red text-white`}
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

