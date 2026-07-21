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
import { boardService } from '@/services/board.service'
import { ConfirmDialog } from './ConfirmDialog'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
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
import { AdminPagination } from '@/components/admin/AdminPagination'
import { ReviewSessionCard } from './ReviewSessionCard'
import { ReviewSessionDetailDrawer } from './ReviewSessionDetailDrawer'
import { ReviewSessionFormModal } from './ReviewSessionFormModal'
import { ReviewSessionTable } from './ReviewSessionTable'
import { AdminButton } from '@/components/admin/AdminButton'
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
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đang tiến hành', value: 'in_progress' },
  { label: 'Tạm dừng', value: 'paused' },
  { label: 'Đã hoàn thành', value: 'completed' },
  { label: 'Đã kết thúc', value: 'finished' },
  { label: 'Đã hủy', value: 'cancelled' },
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
        notify('error', 'Không thể thực hiện hành động này vì API không trả về định danh phiên.')
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

        // Load result summary if session is completed or finished
        if (session.status === 'completed' || session.status === 'finished' || detail?.status === 'completed' || detail?.status === 'finished') {
          const resData = await reviewSessionApi.getResult(sessionId)
          if (resData?.summary) {
            setResults((current) => ({ ...current, [sessionId]: resData.summary }))
          }
        }
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
          notify('error', 'Vui lòng chọn bộ truyện từ danh sách gợi ý.')
          return
        }

        if (!isUuidLike(seriesId)) {
          notify('error', 'Bộ truyện được chọn không hợp lệ. Vui lòng chọn gợi ý khác.')
          return
        }

        const chapterId = optionalString(sessionForm.chapter_id)
        if (chapterId && !isUuidLike(chapterId)) {
          notify('error', 'Chương truyện được chọn không hợp lệ. Vui lòng chọn gợi ý khác hoặc bỏ trống.')
          return
        }

        await reviewSessionApi.create({
          series_id: seriesId,
          chapter_id: chapterId,
          name: sessionForm.name.trim(),
          description: optionalString(sessionForm.description),
          status: 'pending',
        })
        notify('success', 'Tạo phiên đánh giá thành công.')
      } else if (editingSession) {
        await reviewSessionApi.update(getSessionId(editingSession), {
          name: sessionForm.name.trim(),
          description: optionalString(sessionForm.description),
        })
        notify('success', 'Cập nhật phiên đánh giá thành công.')
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
      const resData = await reviewSessionApi[action](sessionId)
      
      const actionNames: Record<string, string> = {
        start: 'Bắt đầu',
        pause: 'Tạm dừng',
        finalize: 'Hoàn tất',
        cancel: 'Hủy bỏ',
        finish: 'Kết thúc',
      }
      const actionName = actionNames[action] || action
      notify('success', `Đã ${actionName.toLowerCase()} phiên đánh giá thành công.`)
      
      if (action === 'finalize' && resData?.summary) {
        setResults((current) => ({ ...current, [sessionId]: resData.summary }))
      }

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
    if (action === 'cancel' || action === 'finish' || action === 'finalize') {
      setConfirmState({
        title: action === 'cancel' 
          ? 'Hủy phiên đánh giá?' 
          : action === 'finalize' 
            ? 'Hoàn tất phiên đánh giá?' 
            : 'Kết thúc phiên đánh giá?',
        message:
          action === 'cancel'
            ? `Bạn có chắc chắn muốn hủy phiên "${getSessionName(session)}" và dừng quy trình hiện tại?`
            : action === 'finalize'
              ? `Thao tác này sẽ đóng biểu quyết cho "${getSessionName(session)}", tính điểm trung bình và tạo khuyến nghị.`
              : `Thao tác này sẽ kết thúc phiên đánh giá "${getSessionName(session)}".`,
        confirmLabel: action === 'cancel' 
          ? 'Hủy phiên' 
          : action === 'finalize' 
            ? 'Hoàn tất phiên' 
            : 'Kết thúc phiên',
        tone: action === 'cancel' ? 'danger' : 'warning',
        onConfirm: () => runWorkflow(session, action),
      })
      return
    }

    runWorkflow(session, action)
  }

  const handleDeleteSession = (session: ReviewSession) => {
    setConfirmState({
      title: 'Xóa phiên đánh giá?',
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn phiên "${getSessionName(session)}"?`,
      confirmLabel: 'Xóa phiên',
      tone: 'danger',
      onConfirm: async () => {
        const sessionId = requireSessionId(session)
        if (!sessionId) return

        setBusyKey(`delete:${sessionId}`)

        try {
          await reviewSessionApi.delete(sessionId)
          notify('success', 'Xóa phiên đánh giá thành công.')
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

      // Apply the dominant decision to the chapter or series
      let decisionStr = ''
      const upperDec = result.dominant_decision?.toUpperCase() || ''
      if (upperDec === 'APPROVE' || upperDec === 'APPROVED') decisionStr = 'approve'
      else if (upperDec === 'REJECT' || upperDec === 'REJECTED') decisionStr = 'reject'

      if (decisionStr) {
        const chapterId = session.chapter_id || (session as any).chapterId
        const seriesId = session.series_id || (session as any).seriesId
        
        try {
          if (chapterId) {
            await boardService.applyChapterDecision(chapterId, decisionStr, `Tự động phê duyệt dựa trên biểu quyết của ban đánh giá.`)
          }
          if (seriesId) {
            await boardService.applySeriesDecision(seriesId, decisionStr, `Tự động phê duyệt dựa trên biểu quyết của ban đánh giá.`)
          }
        } catch (e) {
          console.error("Error applying decisions:", e)
        }
      }
      notify('success', 'Xử lý kết quả biểu quyết thành công.')
      await loadSessions()
    } catch (processError) {
      notify('error', getErrorMessage(processError))
    } finally {
      setProcessingSessionId(null)
    }
  }

  const handleApplyDecision = async (session: ReviewSession, status: string, note: string) => {
    const sessionId = requireSessionId(session)
    if (!sessionId) return

    setDetailLoading(true)
    try {
      await reviewSessionApi.applyDecision(sessionId, { status, note })
      const statusNames: Record<string, string> = {
        published: 'Xuất bản',
        approved: 'Phê duyệt',
        rejected: 'Từ chối',
      }
      const statusName = statusNames[status] || status
      notify('success', `Đã áp dụng quyết định thành công: ${statusName}`)
      await loadSessions()
      await openDetail(session, 'overview')
    } catch (applyError) {
      notify('error', getErrorMessage(applyError))
    } finally {
      setDetailLoading(false)
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
      notify('error', 'Điểm số phải nằm trong khoảng từ 1 đến 10.')
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
        notify('success', 'Tạo biểu quyết thành công.')
      } else if (editingVote) {
        const voteId = getVoteId(editingVote)
        if (!voteId) {
          notify('error', 'Không thể cập nhật vì không tìm thấy định danh biểu quyết.')
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
        notify('success', 'Cập nhật biểu quyết thành công.')
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
      notify('error', 'Không thể xác minh biểu quyết vì không tìm thấy định danh.')
      return
    }

    setBusyVoteId(voteId)
    try {
      await voteApi.updateStatus(voteId, 'verified' as VoteStatus)
      notify('success', 'Xác minh biểu quyết thành công.')
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
      title: 'Xóa biểu quyết?',
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn biểu quyết của ${vote.users?.username || vote.users?.email || 'thành viên này'}?`,
      confirmLabel: 'Xóa biểu quyết',
      tone: 'danger',
      onConfirm: async () => {
        const voteId = getVoteId(vote)
        if (!voteId) {
          notify('error', 'Không thể xóa biểu quyết vì không tìm thấy định danh.')
          return
        }

        setBusyVoteId(voteId)
        try {
          await voteApi.delete(voteId)
          notify('success', 'Xóa biểu quyết thành công.')
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
      <div className="border-2 border-manga-ink bg-white p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-manga-red">Quản lý ban biên tập</p>
            <h1 className="font-manga text-4xl font-black uppercase text-manga-ink mt-1">Phiên đánh giá</h1>
            <p className="mt-2 max-w-3xl text-sm font-bold text-gray-500">
              Quản lý vòng đời phiên đánh giá, kiểm tra phiếu biểu quyết, xác minh tính hợp lệ, tổng hợp kết quả và phê duyệt xuất bản.
            </p>
          </div>
          <AdminButton
            type="button"
            variant="red"
            icon={Plus}
            onClick={openCreateSession}
          >
            Tạo phiên đánh giá
          </AdminButton>
        </div>
      </div>

      <div className="border-2 border-manga-ink bg-[#fafafa] p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm kiếm theo tên phiên, bộ truyện, chương hoặc mô tả..."
              className="h-11 w-full border-2 border-manga-ink bg-white pl-10 pr-3 text-sm font-bold outline-none focus:bg-amber-50"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as StatusFilter)
              setPage(1)
            }}
            className="h-11 border-2 border-manga-ink bg-white px-3 text-sm font-black text-manga-ink outline-none focus:bg-amber-50 capitalize"
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
        <AdminEmptyState
          title="Không tìm thấy phiên đánh giá nào"
          description="Thử thay đổi từ khóa tìm kiếm hoặc trạng thái bộ lọc, hoặc tạo mới một phiên đánh giá."
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
        <div className="flex flex-col gap-3 border-2 border-manga-ink bg-white px-4 py-3 text-sm font-bold text-manga-ink shadow-[4px_4px_0_rgba(0,0,0,1)] md:flex-row md:items-center md:justify-between">
          <p>
            Hiển thị từ {showingStart} đến {showingEnd} trong tổng số {pagination.total.toLocaleString()} phiên đánh giá
          </p>
          <AdminPagination
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
        onApplyDecision={handleApplyDecision}
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
        confirmLabel={confirmState?.confirmLabel || 'Xác nhận'}
        tone={confirmState?.tone}
        loading={confirmLoading}
        onCancel={() => !confirmLoading && setConfirmState(null)}
        onConfirm={runConfirmed}
      />

      {toast && (
        <div className="fixed bottom-5 right-5 z-[80] max-w-md border-2 border-manga-ink bg-white p-4 shadow-[6px_6px_0_rgba(0,0,0,1)]">
          <div className="flex items-start gap-3">
            <div className={`mt-1.5 h-3 w-3 border border-manga-ink ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-manga-red'}`} />
            <p className="text-sm font-bold text-manga-ink">{toast.message}</p>
            <button type="button" onClick={closeToast} className="ml-auto flex h-6 w-6 items-center justify-center border border-manga-ink hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

