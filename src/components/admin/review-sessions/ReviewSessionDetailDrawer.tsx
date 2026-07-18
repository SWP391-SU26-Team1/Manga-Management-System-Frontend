import React, { useState, useEffect } from 'react'
import { CalendarClock, FileText, UserRound, X } from 'lucide-react'
import type { ReviewSession, ReviewSessionProcessResult, Vote } from '@/services/admin/admin.types'
import {
  formatDateTime,
  formatScore,
  getChapterLabel,
  getCreatedByLabel,
  getSeriesLabel,
  getSessionName,
} from './helpers'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import { VotePanel } from './VotePanel'
import { AdminButton } from '@/components/admin/AdminButton'
import type { DetailTab, VoteHandler, VoteStatusFilter } from './types'

type ReviewSessionDetailDrawerProps = {
  open: boolean
  session: ReviewSession | null
  votes: Vote[]
  result?: ReviewSessionProcessResult
  activeTab: DetailTab
  voteFilter: VoteStatusFilter
  detailLoading?: boolean
  voteLoading?: boolean
  busyVoteId?: string | null
  onClose: () => void
  onTabChange: (tab: DetailTab) => void
  onVoteFilterChange: (status: VoteStatusFilter) => void
  onCreateVote: () => void
  onEditVote: VoteHandler
  onVerifyVote: VoteHandler
  onDeleteVote: VoteHandler
  onReloadVotes: () => void
  onApplyDecision?: (session: ReviewSession, status: string, note: string) => Promise<void>
}

const infoClass = 'border-2 border-manga-ink bg-white p-4 shadow-[3px_3px_0_rgba(0,0,0,1)]'

export function ReviewSessionDetailDrawer({
  open,
  session,
  votes,
  result,
  activeTab,
  voteFilter,
  detailLoading = false,
  voteLoading = false,
  busyVoteId,
  onClose,
  onTabChange,
  onVoteFilterChange,
  onCreateVote,
  onEditVote,
  onVerifyVote,
  onDeleteVote,
  onReloadVotes,
  onApplyDecision,
}: ReviewSessionDetailDrawerProps) {
  const [decisionStatus, setDecisionStatus] = useState('')
  const [decisionNote, setDecisionNote] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)

  useEffect(() => {
    setDecisionStatus('')
    setDecisionNote('')
    setFormSubmitting(false)
  }, [session?.session_id, session?.id, open])

  if (!open || !session) return null

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !decisionStatus || !onApplyDecision) return
    setFormSubmitting(true)
    try {
      await onApplyDecision(session, decisionStatus, decisionNote)
    } finally {
      setFormSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex justify-end">
      <div className="flex h-full w-full max-w-5xl flex-col border-l-2 border-manga-ink bg-[#fafafa] shadow-2xl">
        <div className="border-b-2 border-manga-ink bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <AdminStatusBadge status={session.status} />
                {detailLoading && <span className="text-xs font-black uppercase text-manga-red animate-pulse">Đang tải chi tiết...</span>}
              </div>
              <h2 className="font-manga text-3xl font-black uppercase text-manga-ink mt-3">{getSessionName(session)}</h2>
              <p className="mt-1 max-w-3xl text-sm font-bold text-gray-500">{session.description || 'Không có mô tả.'}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-manga-ink bg-white shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-gray-100"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 flex border-b-2 border-manga-ink">
            {[
              { label: 'Tổng quan', value: 'overview' as DetailTab },
              { label: `Biểu quyết (${votes.length})`, value: 'votes' as DetailTab },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={`border-b-4 px-4 py-3 text-sm font-black uppercase tracking-wider transition-all -mb-[2px] ${
                  activeTab === tab.value
                    ? 'border-manga-red text-manga-red'
                    : 'border-transparent text-slate-500 hover:text-manga-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'overview' ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className={infoClass}>
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
                    <FileText className="h-4 w-4 text-manga-ink" />
                    Bộ truyện
                  </div>
                  <p className="mt-2 font-black text-manga-ink text-base">{getSeriesLabel(session)}</p>
                  <p className="mt-1 text-xs font-bold text-gray-500">Bộ truyện được liên kết</p>
                </div>
                <div className={infoClass}>
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
                    <FileText className="h-4 w-4 text-manga-ink" />
                    Chương truyện
                  </div>
                  <p className="mt-2 font-black text-manga-ink text-base">{getChapterLabel(session)}</p>
                  <p className="mt-1 text-xs font-bold text-gray-500">
                    {session.chapter_id || session.chapterId ? 'Chương liên kết' : 'Không có chương đính kèm'}
                  </p>
                </div>
                <div className={infoClass}>
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
                    <UserRound className="h-4 w-4 text-manga-ink" />
                    Tạo bởi
                  </div>
                  <p className="mt-2 font-black text-manga-ink text-base">{getCreatedByLabel(session)}</p>
                  <p className="mt-1 text-xs font-bold text-gray-500">Chủ sở hữu phiên</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className={infoClass}>
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
                    <CalendarClock className="h-4 w-4 text-manga-ink" />
                    Ngày khởi tạo
                  </div>
                  <p className="mt-2 font-black text-manga-ink">{formatDateTime(session.created_at || session.createdAt)}</p>
                </div>
                <div className={infoClass}>
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
                    <CalendarClock className="h-4 w-4 text-manga-ink" />
                    Ngày bắt đầu
                  </div>
                  <p className="mt-2 font-black text-manga-ink">{formatDateTime(session.started_at || session.startedAt)}</p>
                </div>
                <div className={infoClass}>
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
                    <CalendarClock className="h-4 w-4 text-manga-ink" />
                    Ngày kết thúc
                  </div>
                  <p className="mt-2 font-black text-manga-ink">{formatDateTime(session.ended_at || session.endedAt)}</p>
                </div>
              </div>

              <div className="border-2 border-manga-ink bg-white p-5 shadow-[4px_4px_0_rgba(0,0,0,1)]">
                <h3 className="font-manga text-xl font-black uppercase text-manga-ink">Kết quả xử lý & Khuyến nghị</h3>
                {result ? (
                  <div className="mt-4 space-y-4">
                    {result.recommendation && (
                      <div className={`border-2 border-manga-ink p-4 shadow-[3px_3px_0_rgba(0,0,0,1)] font-bold ${
                        result.recommendation === 'publish'
                          ? 'bg-emerald-100 text-emerald-950'
                          : 'bg-amber-100 text-amber-950'
                      }`}>
                        <h4 className="font-black text-sm uppercase tracking-wider">
                          Khuyến nghị hệ thống: {result.recommendation === 'publish' ? 'Xuất bản (Publish)' : 'Xem xét lại (Review)'}
                        </h4>
                        <p className="mt-2 text-xs leading-relaxed">
                          {result.recommendation_reason}
                        </p>
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="border border-manga-ink bg-[#fafafa] p-3 shadow-[2px_2px_0_rgba(0,0,0,1)]">
                        <p className="text-xs font-black uppercase text-gray-400">Tổng số biểu quyết</p>
                        <p className="mt-1 text-2xl font-black text-manga-ink">{result.total_votes}</p>
                      </div>
                      <div className="border border-manga-ink bg-[#fafafa] p-3 shadow-[2px_2px_0_rgba(0,0,0,1)]">
                        <p className="text-xs font-black uppercase text-gray-400">Điểm trung bình</p>
                        <p className="mt-1 text-2xl font-black text-manga-ink">{formatScore(result.avg_score)}</p>
                      </div>
                      <div className="border border-manga-ink bg-[#fafafa] p-3 shadow-[2px_2px_0_rgba(0,0,0,1)]">
                        <p className="text-xs font-black uppercase text-gray-400">Quyết định chủ đạo</p>
                        <p className="mt-1 text-2xl font-black capitalize text-manga-ink">{result.dominant_decision}</p>
                      </div>
                    </div>

                    {session.status === 'completed' && onApplyDecision && (
                      <div className="mt-6 border-t-2 border-manga-ink pt-6">
                        <h4 className="font-manga text-lg font-black uppercase text-manga-ink tracking-wider">Quyết định của Trưởng ban biên tập</h4>
                        <p className="mt-1 text-xs font-bold text-gray-500">Xem xét chi tiết các đánh giá và đưa ra quyết định xuất bản cuối cùng. Việc này sẽ thông báo cho các thành viên liên quan.</p>
                        
                        <form onSubmit={handleDecisionSubmit} className="mt-4 space-y-4">
                          <div>
                            <label className="block text-xs font-black uppercase text-manga-ink">Trạng thái phê duyệt / Xuất bản</label>
                            <select
                              value={decisionStatus}
                              onChange={(e) => setDecisionStatus(e.target.value)}
                              className="mt-1 block w-full border-2 border-manga-ink bg-white px-3 py-2 text-sm font-bold outline-none focus:bg-amber-50"
                              required
                            >
                              <option value="">-- Chọn quyết định --</option>
                              <option value="published">Xuất bản (Hiển thị công khai)</option>
                              <option value="approved">Phê duyệt (Duyệt nhưng chưa xuất bản)</option>
                              <option value="rejected">Từ chối (Từ chối nội dung)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-black uppercase text-manga-ink">Ghi chú quyết định / Phản hồi</label>
                            <textarea
                              rows={3}
                              value={decisionNote}
                              onChange={(e) => setDecisionNote(e.target.value)}
                              placeholder="Nhập phản hồi hoặc ghi chú lý giải quyết định..."
                              className="mt-1 block w-full border-2 border-manga-ink bg-white px-3 py-2 text-sm font-bold outline-none focus:bg-amber-50"
                            />
                          </div>

                          <AdminButton
                            type="submit"
                            variant="red"
                            disabled={formSubmitting || !decisionStatus}
                          >
                            {formSubmitting ? 'Đang áp dụng...' : 'Áp dụng quyết định cuối cùng'}
                          </AdminButton>
                        </form>
                      </div>
                    )}

                    {session.status === 'finished' && (
                      <div className="mt-6 border-t-2 border-manga-ink pt-4 text-emerald-800 font-bold text-sm flex items-center gap-2">
                        <span className="inline-block h-3.5 w-3.5 border-2 border-manga-ink bg-emerald-400" />
                        Quyết định của Trưởng ban biên tập đã được áp dụng. Phiên đánh giá đã kết thúc.
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm font-bold text-slate-500">Chưa có kết quả xử lý. Bạn cần hoàn tất (Finalize) phiên đánh giá trước.</p>
                )}
              </div>
            </div>
          ) : (
            <VotePanel
              session={session}
              votes={votes}
              filter={voteFilter}
              loading={voteLoading}
              busyVoteId={busyVoteId}
              onFilterChange={onVoteFilterChange}
              onCreateVote={onCreateVote}
              onEditVote={onEditVote}
              onVerifyVote={onVerifyVote}
              onDeleteVote={onDeleteVote}
              onReload={onReloadVotes}
            />
          )}
        </div>
      </div>
    </div>
  )
}

