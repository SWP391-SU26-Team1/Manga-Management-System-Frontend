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
import { StatusBadge } from './StatusBadge'
import { VotePanel } from './VotePanel'
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

const infoClass = 'rounded-lg border border-slate-200 bg-white p-4'

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
    <div className="fixed inset-0 z-40 bg-slate-950/40">
      <div className="ml-auto flex h-full w-full max-w-5xl flex-col bg-slate-50 shadow-2xl">
        <div className="border-b border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={session.status} />
                {detailLoading && <span className="text-sm font-medium text-blue-600">Loading detail...</span>}
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{getSessionName(session)}</h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">{session.description || 'No description provided.'}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close detail drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 flex border-b border-slate-200">
            {[
              { label: 'Overview', value: 'overview' as DetailTab },
              { label: `Votes (${votes.length})`, value: 'votes' as DetailTab },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={`border-b-2 px-4 py-3 text-sm font-semibold ${
                  activeTab === tab.value
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
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
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <FileText className="h-4 w-4" />
                    Series
                  </div>
                  <p className="mt-2 font-semibold text-slate-950">{getSeriesLabel(session)}</p>
                  <p className="mt-1 text-xs text-slate-500">Linked manga series</p>
                </div>
                <div className={infoClass}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <FileText className="h-4 w-4" />
                    Chapter
                  </div>
                  <p className="mt-2 font-semibold text-slate-950">{getChapterLabel(session)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {session.chapter_id || session.chapterId ? 'Linked chapter' : 'Optional chapter not attached'}
                  </p>
                </div>
                <div className={infoClass}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <UserRound className="h-4 w-4" />
                    Created by
                  </div>
                  <p className="mt-2 font-semibold text-slate-950">{getCreatedByLabel(session)}</p>
                  <p className="mt-1 text-xs text-slate-500">Session owner</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className={infoClass}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <CalendarClock className="h-4 w-4" />
                    Created at
                  </div>
                  <p className="mt-2 font-semibold text-slate-950">{formatDateTime(session.created_at || session.createdAt)}</p>
                </div>
                <div className={infoClass}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <CalendarClock className="h-4 w-4" />
                    Started at
                  </div>
                  <p className="mt-2 font-semibold text-slate-950">{formatDateTime(session.started_at || session.startedAt)}</p>
                </div>
                <div className={infoClass}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <CalendarClock className="h-4 w-4" />
                    Ended at
                  </div>
                  <p className="mt-2 font-semibold text-slate-950">{formatDateTime(session.ended_at || session.endedAt)}</p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="text-base font-semibold text-slate-950">Processed Result & Recommendation</h3>
                {result ? (
                  <div className="mt-4 space-y-4">
                    {result.recommendation && (
                      <div className={`rounded-lg border p-4 ${
                        result.recommendation === 'publish'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      }`}>
                        <h4 className="font-semibold text-sm capitalize">
                          System Recommendation: {result.recommendation}
                        </h4>
                        <p className="mt-1 text-xs">
                          {result.recommendation_reason}
                        </p>
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Total votes</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-950">{result.total_votes}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Average score</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-950">{formatScore(result.avg_score)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Dominant decision</p>
                        <p className="mt-1 text-2xl font-semibold capitalize text-slate-950">{result.dominant_decision}</p>
                      </div>
                    </div>

                    {session.status === 'completed' && onApplyDecision && (
                      <div className="mt-6 border-t border-slate-200 pt-6">
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Chairman Decision</h4>
                        <p className="mt-1 text-xs text-slate-500">Review the details and input the final publishing decision. This will notify all group members.</p>
                        
                        <form onSubmit={handleDecisionSubmit} className="mt-4 space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700">Publish / Approval Status</label>
                            <select
                              value={decisionStatus}
                              onChange={(e) => setDecisionStatus(e.target.value)}
                              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              required
                            >
                              <option value="">-- Select Decision --</option>
                              <option value="published">Publish (Make publicly visible)</option>
                              <option value="approved">Approve (Approved but not published)</option>
                              <option value="rejected">Reject (Reject content)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700">Decision Note / Feedback</label>
                            <textarea
                              rows={3}
                              value={decisionNote}
                              onChange={(e) => setDecisionNote(e.target.value)}
                              placeholder="Provide notes or feedback explaining the decision..."
                              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={formSubmitting || !decisionStatus}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {formSubmitting ? 'Applying Decision...' : 'Apply Final Decision'}
                          </button>
                        </form>
                      </div>
                    )}

                    {session.status === 'finished' && (
                      <div className="mt-6 border-t border-slate-200 pt-4 text-emerald-800 font-semibold text-sm flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        Chairman decision has been applied. The session is closed.
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No results calculated. You must finalize the session first.</p>
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
