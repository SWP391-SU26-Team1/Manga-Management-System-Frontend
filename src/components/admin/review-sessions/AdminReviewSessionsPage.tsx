import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import type {
  PaginationMeta,
  ReviewSession,
  ReviewSessionProcessResult,
  ReviewSessionStatus,
  Vote,
  VoteStatus,
} from '@/services/admin/admin.types'
import { reviewSessionApi } from '@/services/admin/reviewSessionApi'
import { voteApi } from '@/services/admin/voteApi'
import { ConfirmDialog } from './ConfirmDialog'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import {
  getChapterLabel,
  getErrorMessage,
  getSeriesLabel,
  getSessionId,
  getSessionName,
  getVoteId,
  isUuidLike,
  normalizeListResponse,
} from './helpers'
import { LoadingSkeleton } from './LoadingSkeleton'
import { Pagination } from './Pagination'
import { ReviewSessionCard } from './ReviewSessionCard'
import { ReviewSessionDetailDrawer } from './ReviewSessionDetailDrawer'
import { ReviewSessionFormModal } from './ReviewSessionFormModal'
import { ReviewSessionTable } from './ReviewSessionTable'
import {
  ConfirmState,
  DetailTab,
  REVIEW_STATUSES,
  StatusFilter,
  ToastState,
  VoteFormValues,
  VoteStatusFilter,
  emptyPagination,
  emptySessionForm,
  emptyVoteForm,
  type ReviewSessionFormValues,
  type SessionResultMap,
  type VoteCountMap,
  type WorkflowAction,
} from './types'
import { VoteFormModal } from './VoteFormModal'

const DEFAULT_LIMIT = 10

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All statuses', value: 'all' },
  ...REVIEW_STATUSES.map((status) => ({ label: status.replace(/_/g, ' '), value: status })),
]

const optionalString = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const sessionToForm = (session?: ReviewSession | null): ReviewSessionFormValues => ({
  series_id: session?.series_id || session?.seriesId || '',
  chapter_id: session?.chapter_id || session?.chapterId || '',
  series_query: session ? getSeriesLabel(session) : '',
  chapter_query: session ? getChapterLabel(session) : '',
  name: session ? getSessionName(session) : '',
  description: session?.description || '',
})

const voteToForm = (vote?: Vote | null): VoteFormValues => ({
  decision: vote?.decision || 'approved',
  score: String(vote?.score ?? 8),
  note: vote?.note || '',
  status: vote?.status || 'submitted',
})

export function AdminReviewSessionsPage() {
  const [sessions, setSessions] = useState<ReviewSession[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [processingSessionId, setProcessingSessionId] = useState<string | null>(null)

  const [sessionModalOpen, setSessionModalOpen] = useState(false)
  const [sessionModalMode, setSessionModalMode] = useState<'create' | 'edit'>('create')
  const [sessionForm, setSessionForm] = useState<ReviewSessionFormValues>(emptySessionForm)
  const [editingSession, setEditingSession] = useState<ReviewSession | null>(null)
  const [sessionSaving, setSessionSaving] = useState(false)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailSession, setDetailSession] = useState<ReviewSession | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')

  const [votes, setVotes] = useState<Vote[]>([])
  const [voteFilter, setVoteFilter] = useState<VoteStatusFilter>('all')
  const [voteLoading, setVoteLoading] = useState(false)
  const [busyVoteId, setBusyVoteId] = useState<string | null>(null)
  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const [voteModalMode, setVoteModalMode] = useState<'create' | 'edit'>('edit')
  const [voteForm, setVoteForm] = useState<VoteFormValues>(emptyVoteForm)
  const [editingVote, setEditingVote] = useState<Vote | null>(null)
  const [voteSaving, setVoteSaving] = useState(false)

  const [confirmState, setConfirmState] = useState<ConfirmState>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [results, setResults] = useState<SessionResultMap>({})
  const [voteCounts, setVoteCounts] = useState<VoteCountMap>({})

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    window.setTimeout(() => setToast(null), 3200)
  }, [])

  const requireSessionId = useCallback(
    (session: ReviewSession) => {
      const sessionId = getSessionId(session)
      if (!sessionId) {
        notify('error', 'Cannot perform this action because the session identifier was not returned by the API.')
        return null
      }

      return sessionId
    },
    [notify],
  )

  const loadSessions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await reviewSessionApi.list({
        page,
        limit: DEFAULT_LIMIT,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      const normalized = normalizeListResponse<ReviewSession>(response, page, DEFAULT_LIMIT)
      setSessions(normalized.data)
      setPagination(normalized.pagination)
    } catch (loadError) {
      setSessions([])
      setPagination({ ...emptyPagination, page })
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const visibleSessions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return sessions

    return sessions.filter((session) => {
      const fields = [
        getSessionName(session),
        session.description || '',
        session.series?.title || '',
        session.chapter?.title || '',
      ]

      return fields.some((field) => field.toLowerCase().includes(normalizedSearch))
    })
  }, [searchTerm, sessions])

  const showingStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const showingEnd = Math.min(pagination.page * pagination.limit, pagination.total)

  const loadVotes = useCallback(
    async (sessionId = detailSession ? getSessionId(detailSession) : '') => {
      if (!sessionId) return

      setVoteLoading(true)
      try {
        const response = await reviewSessionApi.getVotes(sessionId)
        const nextVotes = Array.isArray(response) ? response : []
        setVotes(nextVotes)
        setVoteCounts((current) => ({ ...current, [sessionId]: nextVotes.length }))
      } catch (loadError) {
        notify('error', getErrorMessage(loadError))
      } finally {
        setVoteLoading(false)
      }
    },
    [detailSession, notify],
  )

  const openDetail = useCallback(
    async (session: ReviewSession, tab: DetailTab = 'overview') => {
      const sessionId = requireSessionId(session)
      if (!sessionId) return

      setDetailOpen(true)
      setActiveTab(tab)
      setDetailSession(session)
      setDetailLoading(true)
      setVoteFilter('all')
      setVotes([])

      try {
        const detail = await reviewSessionApi.detail(sessionId)
        setDetailSession(detail || session)
      } catch (detailError) {
        notify('error', getErrorMessage(detailError))
      } finally {
        setDetailLoading(false)
      }

      await loadVotes(sessionId)
    },
    [loadVotes, notify],
  )

  const openCreateSession = () => {
    setSessionModalMode('create')
    setEditingSession(null)
    setSessionForm(emptySessionForm)
    setSessionModalOpen(true)
  }

  const openEditSession = (session: ReviewSession) => {
    setSessionModalMode('edit')
    setEditingSession(session)
    setSessionForm(sessionToForm(session))
    setSessionModalOpen(true)
  }

  const closeSessionModal = () => {
    if (sessionSaving) return
    setSessionModalOpen(false)
    setEditingSession(null)
    setSessionForm(emptySessionForm)
  }

  const handleSessionFormChange = (field: keyof ReviewSessionFormValues, value: string) => {
    setSessionForm((current) => ({ ...current, [field]: value }))
  }

  const submitSessionForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSessionSaving(true)

    try {
      if (sessionModalMode === 'create') {
        const seriesId = optionalString(sessionForm.series_id)
        if (!seriesId) {
          notify('error', 'Please select a series from the suggestion list.')
          return
        }

        if (!isUuidLike(seriesId)) {
          notify('error', 'The selected series does not contain a valid UUID. Please choose another suggestion.')
          return
        }

        const chapterId = optionalString(sessionForm.chapter_id)
        if (chapterId && !isUuidLike(chapterId)) {
          notify('error', 'The selected chapter does not contain a valid UUID. Please choose another suggestion or leave chapter empty.')
          return
        }

        await reviewSessionApi.create({
          series_id: seriesId,
          chapter_id: chapterId,
          name: sessionForm.name.trim(),
          description: optionalString(sessionForm.description),
          status: 'pending',
        })
        notify('success', 'Review session created successfully.')
      } else if (editingSession) {
        await reviewSessionApi.update(getSessionId(editingSession), {
          name: sessionForm.name.trim(),
          description: optionalString(sessionForm.description),
        })
        notify('success', 'Review session updated successfully.')
      }

      closeSessionModal()
      await loadSessions()
    } catch (saveError) {
      notify('error', getErrorMessage(saveError))
    } finally {
      setSessionSaving(false)
    }
  }

  const runConfirmed = async () => {
    if (!confirmState) return

    setConfirmLoading(true)
    try {
      await confirmState.onConfirm()
      setConfirmState(null)
    } finally {
      setConfirmLoading(false)
    }
  }

  const runWorkflow = async (session: ReviewSession, action: WorkflowAction) => {
    const sessionId = requireSessionId(session)
    if (!sessionId) return

    setBusyKey(`${action}:${sessionId}`)

    try {
      await reviewSessionApi[action](sessionId)
      notify('success', `${action.replace(/^\w/, (letter) => letter.toUpperCase())} session successful.`)
      await loadSessions()
      if (detailOpen && detailSession && getSessionId(detailSession) === sessionId) {
        await openDetail(session, activeTab)
      }
    } catch (workflowError) {
      notify('error', getErrorMessage(workflowError))
    } finally {
      setBusyKey(null)
    }
  }

  const handleWorkflowAction = (session: ReviewSession, action: WorkflowAction) => {
    if (action === 'cancel' || action === 'finish') {
      setConfirmState({
        title: action === 'cancel' ? 'Cancel review session?' : 'Finish review session?',
        message:
          action === 'cancel'
            ? `This will cancel "${getSessionName(session)}" and stop the active workflow.`
            : `This will close "${getSessionName(session)}" after completion.`,
        confirmLabel: action === 'cancel' ? 'Cancel Session' : 'Finish Session',
        tone: action === 'cancel' ? 'danger' : 'warning',
        onConfirm: () => runWorkflow(session, action),
      })
      return
    }

    runWorkflow(session, action)
  }

  const handleDeleteSession = (session: ReviewSession) => {
    setConfirmState({
      title: 'Delete review session?',
      message: `This will permanently delete "${getSessionName(session)}".`,
      confirmLabel: 'Delete Session',
      tone: 'danger',
      onConfirm: async () => {
        const sessionId = requireSessionId(session)
        if (!sessionId) return

        setBusyKey(`delete:${sessionId}`)

        try {
          await reviewSessionApi.delete(sessionId)
          notify('success', 'Review session deleted successfully.')
          if (sessions.length === 1 && page > 1) {
            setPage((current) => current - 1)
          } else {
            await loadSessions()
          }
        } catch (deleteError) {
          notify('error', getErrorMessage(deleteError))
        } finally {
          setBusyKey(null)
        }
      },
    })
  }

  const handleProcessResult = async (session: ReviewSession) => {
    const sessionId = requireSessionId(session)
    if (!sessionId) return

    setProcessingSessionId(sessionId)

    try {
      const result = (await reviewSessionApi.processResult(sessionId)) as ReviewSessionProcessResult
      setResults((current) => ({ ...current, [sessionId]: result }))
      setVoteCounts((current) => ({ ...current, [sessionId]: result.total_votes }))
      notify('success', 'Vote result processed successfully.')
      await loadSessions()
    } catch (processError) {
      notify('error', getErrorMessage(processError))
    } finally {
      setProcessingSessionId(null)
    }
  }

  const openCreateVote = () => {
    setVoteModalMode('create')
    setEditingVote(null)
    setVoteForm(emptyVoteForm)
    setVoteModalOpen(true)
  }

  const openEditVote = (vote: Vote) => {
    setVoteModalMode('edit')
    setEditingVote(vote)
    setVoteForm(voteToForm(vote))
    setVoteModalOpen(true)
  }

  const closeVoteModal = () => {
    if (voteSaving) return
    setVoteModalOpen(false)
    setEditingVote(null)
    setVoteForm(emptyVoteForm)
  }

  const handleVoteFormChange = (field: keyof VoteFormValues, value: string) => {
    setVoteForm((current) => ({ ...current, [field]: value }))
  }

  const submitVoteForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!detailSession) return

    const score = Number(voteForm.score)
    if (!Number.isFinite(score) || score < 1 || score > 10) {
      notify('error', 'Score must be between 1 and 10.')
      return
    }

    setVoteSaving(true)
    try {
      if (voteModalMode === 'create') {
        const sessionId = requireSessionId(detailSession)
        if (!sessionId) return

        await reviewSessionApi.createVote(sessionId, {
          decision: voteForm.decision,
          score,
          note: optionalString(voteForm.note),
          status: voteForm.status,
        })
        notify('success', 'Vote created successfully.')
      } else if (editingVote) {
        const voteId = getVoteId(editingVote)
        if (!voteId) {
          notify('error', 'Cannot update this vote because the vote identifier was not returned by the API.')
          return
        }

        await voteApi.update(voteId, {
          decision: voteForm.decision,
          score,
          note: optionalString(voteForm.note),
        })
        if (editingVote.status !== voteForm.status) {
          await voteApi.updateStatus(voteId, voteForm.status)
        }
        notify('success', 'Vote updated successfully.')
      }

      closeVoteModal()
      await loadVotes(requireSessionId(detailSession) || '')
    } catch (saveError) {
      notify('error', getErrorMessage(saveError))
    } finally {
      setVoteSaving(false)
    }
  }

  const verifyVote = async (vote: Vote) => {
    const voteId = getVoteId(vote)
    if (!voteId) {
      notify('error', 'Cannot verify this vote because the vote identifier was not returned by the API.')
      return
    }

    setBusyVoteId(voteId)
    try {
      await voteApi.updateStatus(voteId, 'verified' as VoteStatus)
      notify('success', 'Vote verified successfully.')
      await loadVotes(vote.session_id || (detailSession ? getSessionId(detailSession) : ''))
    } catch (verifyError) {
      notify('error', getErrorMessage(verifyError))
    } finally {
      setBusyVoteId(null)
    }
  }

  const handleVerifyVote = (vote: Vote) => {
    verifyVote(vote)
  }

  const handleDeleteVote = (vote: Vote) => {
    setConfirmState({
      title: 'Delete vote?',
      message: `This will permanently delete the vote from ${vote.users?.username || vote.users?.email || 'this voter'}.`,
      confirmLabel: 'Delete Vote',
      tone: 'danger',
      onConfirm: async () => {
        const voteId = getVoteId(vote)
        if (!voteId) {
          notify('error', 'Cannot delete this vote because the vote identifier was not returned by the API.')
          return
        }

        setBusyVoteId(voteId)
        try {
          await voteApi.delete(voteId)
          notify('success', 'Vote deleted successfully.')
          await loadVotes(vote.session_id || (detailSession ? getSessionId(detailSession) : ''))
        } catch (deleteError) {
          notify('error', getErrorMessage(deleteError))
        } finally {
          setBusyVoteId(null)
        }
      },
    })
  }

  const closeToast = () => setToast(null)

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Admin Review Session Management</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">Review Sessions</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Manage review session lifecycle, inspect votes, verify submitted votes, process results, and close workflow.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateSession}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Review Session
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by review session name, series, chapter, or description"
              className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as StatusFilter)
              setPage(1)
            }}
            className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium capitalize text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadSessions} />}

      {loading ? (
        <LoadingSkeleton />
      ) : !error && visibleSessions.length === 0 ? (
        <EmptyState
          title="No review sessions found"
          description="Try changing the search keyword or status filter, or create a new review session."
        />
      ) : (
        !error && (
          <>
            <ReviewSessionTable
              sessions={visibleSessions}
              voteCounts={voteCounts}
              results={results}
              busyKey={busyKey}
              processingSessionId={processingSessionId}
              onViewDetail={(session) => openDetail(session, 'overview')}
              onEdit={openEditSession}
              onDelete={handleDeleteSession}
              onWorkflowAction={handleWorkflowAction}
              onManageVotes={(session) => openDetail(session, 'votes')}
              onProcessResult={handleProcessResult}
            />
            <div className="space-y-3 md:hidden">
              {visibleSessions.map((session) => (
                <ReviewSessionCard
                  key={getSessionId(session)}
                  session={session}
                  voteCounts={voteCounts}
                  results={results}
                  busyKey={busyKey}
                  processingSessionId={processingSessionId}
                  onViewDetail={(item) => openDetail(item, 'overview')}
                  onEdit={openEditSession}
                  onDelete={handleDeleteSession}
                  onWorkflowAction={handleWorkflowAction}
                  onManageVotes={(item) => openDetail(item, 'votes')}
                  onProcessResult={handleProcessResult}
                />
              ))}
            </div>
          </>
        )
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm md:flex-row md:items-center md:justify-between">
          <p>
            Showing {showingStart}-{showingEnd} of {pagination.total.toLocaleString()} review sessions
          </p>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            disabled={loading}
            onPageChange={setPage}
          />
        </div>
      )}

      <ReviewSessionFormModal
        open={sessionModalOpen}
        mode={sessionModalMode}
        values={sessionForm}
        session={editingSession}
        loading={sessionSaving}
        onChange={handleSessionFormChange}
        onClose={closeSessionModal}
        onSubmit={submitSessionForm}
      />

      <ReviewSessionDetailDrawer
        open={detailOpen}
        session={detailSession}
        votes={votes}
        result={detailSession ? results[getSessionId(detailSession)] : undefined}
        activeTab={activeTab}
        voteFilter={voteFilter}
        detailLoading={detailLoading}
        voteLoading={voteLoading}
        busyVoteId={busyVoteId}
        onClose={() => setDetailOpen(false)}
        onTabChange={setActiveTab}
        onVoteFilterChange={setVoteFilter}
        onCreateVote={openCreateVote}
        onEditVote={openEditVote}
        onVerifyVote={handleVerifyVote}
        onDeleteVote={handleDeleteVote}
        onReloadVotes={() => loadVotes()}
      />

      <VoteFormModal
        open={voteModalOpen}
        mode={voteModalMode}
        values={voteForm}
        vote={editingVote}
        loading={voteSaving}
        onChange={handleVoteFormChange}
        onClose={closeVoteModal}
        onSubmit={submitVoteForm}
      />

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title || ''}
        message={confirmState?.message || ''}
        confirmLabel={confirmState?.confirmLabel || 'Confirm'}
        tone={confirmState?.tone}
        loading={confirmLoading}
        onCancel={() => !confirmLoading && setConfirmState(null)}
        onConfirm={runConfirmed}
      />

      {toast && (
        <div className="fixed bottom-5 right-5 z-[80] max-w-md rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className={`mt-1 h-2.5 w-2.5 rounded-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="text-sm font-medium text-slate-800">{toast.message}</p>
            <button type="button" onClick={closeToast} className="ml-auto rounded p-1 text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
