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

const actionClass =
  'inline-flex h-9 w-9 items-center justify-center border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]'

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
    <article className="border-2 border-manga-ink bg-white p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-manga text-xl font-black uppercase text-manga-ink">{getSessionName(session)}</h3>
          <p className="mt-1 text-xs font-bold text-gray-500">{session.description || 'Không có mô tả.'}</p>
        </div>
        <AdminStatusBadge status={session.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold">
        <div>
          <p className="text-gray-400 uppercase tracking-wider text-[10px]">Bộ truyện</p>
          <p className="mt-1 text-manga-ink font-black">{getSeriesLabel(session)}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wider text-[10px]">Chương</p>
          <p className="mt-1 text-manga-ink font-black">{getChapterLabel(session)}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wider text-[10px]">Tạo bởi</p>
          <p className="mt-1 text-manga-ink">{getCreatedByLabel(session)}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wider text-[10px]">Ngày tạo</p>
          <p className="mt-1 text-manga-ink">{formatDateTime(session.created_at || session.createdAt)}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wider text-[10px]">Số phiếu</p>
          <p className="mt-1 text-manga-ink">{voteCounts[sessionId] ?? 'Chưa tải'}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wider text-[10px]">Điểm TB</p>
          <p className="mt-1 text-manga-ink font-black">{summary?.avgScore ?? 'N/A'}</p>
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

      <div className="mt-4 flex justify-end gap-2 border-t-2 border-manga-ink pt-4">
        <button
          type="button"
          title="Xem chi tiết"
          onClick={() => onViewDetail(session)}
          className={`${actionClass} bg-white text-manga-ink`}
        >
          <Eye className="h-4 w-4" />
        </button>
        {!isTerminal && (
          <button
            type="button"
            title="Chỉnh sửa phiên"
            onClick={() => onEdit(session)}
            className={`${actionClass} bg-white text-manga-ink`}
          >
            <Edit3 className="h-4 w-4" />
          </button>
        )}
        {!isTerminal && (
          <button
            type="button"
            title="Xóa phiên"
            onClick={() => onDelete(session)}
            className={`${actionClass} bg-manga-red text-white`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  )
}

