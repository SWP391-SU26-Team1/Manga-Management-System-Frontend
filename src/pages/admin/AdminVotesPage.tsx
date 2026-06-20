import React, { FormEvent, useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Edit3, RefreshCw, Save, Trash2, Vote as VoteIcon, X } from 'lucide-react'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import { AdminTableFrame } from '@/components/admin/AdminTableFrame'
import { adminVotesService } from '@/services/admin/adminVotes.service'
import type { PaginationMeta, Vote, VoteStatus } from '@/services/admin/admin.types'

const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 }
const inputClass = 'w-full border-2 border-manga-ink bg-white px-4 py-3 text-sm font-bold outline-none'
const labelClass = 'mb-2 block text-xs font-black uppercase text-gray-600'
const iconClass = 'flex h-10 w-10 items-center justify-center border-2 border-manga-ink bg-white hover:bg-gray-100 disabled:opacity-50'
const getError = (error: unknown) => {
  const value = error as { response?: { data?: { message?: string } }; message?: string }
  return value.response?.data?.message || value.message || 'Có lỗi xảy ra.'
}
type VoteForm = { decision: string; score: string; note: string; status: VoteStatus }

function VoteModal({ form, saving, onChange, onClose, onSubmit }: {
  form: VoteForm
  saving: boolean
  onChange: (key: keyof VoteForm, value: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl border-2 border-manga-ink bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="flex justify-between bg-[#282828] px-6 py-5 text-white">
          <h2 className="font-manga text-3xl font-black uppercase">Chỉnh sửa phiếu</h2>
          <button type="button" onClick={onClose} className="border-2 border-white p-2"><X /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label><span className={labelClass}>Quyết định</span><input value={form.decision} onChange={(e) => onChange('decision', e.target.value)} className={inputClass} /></label>
            <label><span className={labelClass}>Điểm 1-10</span><input type="number" min="1" max="10" value={form.score} onChange={(e) => onChange('score', e.target.value)} className={inputClass} /></label>
          </div>
          <label><span className={labelClass}>Trạng thái</span><select value={form.status} onChange={(e) => onChange('status', e.target.value)} className={inputClass}><option value="submitted">Đã gửi</option><option value="verified">Đã xác minh</option></select></label>
          <label><span className={labelClass}>Ghi chú</span><textarea value={form.note} onChange={(e) => onChange('note', e.target.value)} className={`${inputClass} min-h-28`} /></label>
          <div className="flex justify-end gap-3 border-t-2 border-manga-ink pt-5">
            <AdminButton type="button" variant="white" onClick={onClose}>Hủy</AdminButton>
            <AdminButton type="submit" icon={Save} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</AdminButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminVotesPage() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [pagination, setPagination] = useState(emptyPagination)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'all' | VoteStatus>('all')
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Vote | null>(null)
  const [form, setForm] = useState<VoteForm>({ decision: '', score: '', note: '', status: 'submitted' })
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminVotesService.list({ page, limit: 10, status: status === 'all' ? undefined : status })
      setVotes(response.data)
      setPagination(response.pagination)
    } catch (error) {
      setFeedback({ type: 'error', message: getError(error) })
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => { load() }, [load])

  const openEdit = (vote: Vote) => {
    setEditing(vote)
    setForm({ decision: vote.decision || '', score: vote.score == null ? '' : String(vote.score), note: vote.note || '', status: vote.status })
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      await adminVotesService.update(editing.vote_id, {
        decision: form.decision.trim() || undefined,
        score: form.score ? Number(form.score) : null,
        note: form.note.trim() || undefined,
      })
      if (form.status !== editing.status) await adminVotesService.updateStatus(editing.vote_id, form.status)
      setEditing(null)
      setFeedback({ type: 'success', message: 'Đã cập nhật phiếu.' })
      await load()
    } catch (error) {
      setFeedback({ type: 'error', message: getError(error) })
    } finally {
      setSaving(false)
    }
  }

  const verify = async (vote: Vote) => {
    setBusyId(vote.vote_id)
    try { await adminVotesService.updateStatus(vote.vote_id, 'verified'); await load() }
    catch (error) { setFeedback({ type: 'error', message: getError(error) }) }
    finally { setBusyId(null) }
  }

  const remove = async (vote: Vote) => {
    if (!window.confirm('Xóa phiếu này?')) return
    setBusyId(vote.vote_id)
    try { await adminVotesService.delete(vote.vote_id); await load() }
    catch (error) { setFeedback({ type: 'error', message: getError(error) }) }
    finally { setBusyId(null) }
  }

  const submitted = votes.filter((vote) => vote.status === 'submitted').length
  const verified = votes.filter((vote) => vote.status === 'verified').length
  const scored = votes.filter((vote) => vote.score != null)
  const average = scored.reduce((sum, vote) => sum + Number(vote.score), 0) / Math.max(scored.length, 1)
  const start = pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0
  const end = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="Vote trực tiếp" title="Quản lý bình chọn" description="Kiểm tra, xác minh và điều chỉnh phiếu của các phiên đánh giá." />
      {feedback && <div className={`flex gap-3 border-2 border-manga-ink p-4 font-black ${feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-manga-red'}`}>{feedback.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}{feedback.message}</div>}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Tổng phiếu" value={pagination.total} helper="Theo bộ lọc hiện tại" icon={VoteIcon} />
        <AdminStatCard label="Chờ xác minh" value={submitted} helper="Trên trang hiện tại" icon={AlertCircle} />
        <AdminStatCard label="Đã xác minh" value={verified} helper="Trên trang hiện tại" icon={CheckCircle2} accent="green" />
        <AdminStatCard label="Điểm trung bình" value={average.toFixed(1)} helper="Các phiếu đang hiển thị" dark />
      </div>
      <AdminTableFrame>
        <div className="flex items-end justify-between border-b-2 border-manga-ink p-6">
          <label className="w-56"><span className={labelClass}>Trạng thái</span><select value={status} onChange={(e) => { setStatus(e.target.value as 'all' | VoteStatus); setPage(1) }} className={inputClass}><option value="all">Tất cả</option><option value="submitted">Đã gửi</option><option value="verified">Đã xác minh</option></select></label>
          <button type="button" onClick={load} className={iconClass}><RefreshCw className={loading ? 'animate-spin' : ''} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-[#282828] text-xs font-black uppercase text-white"><tr><th className="px-6 py-4">Người bỏ phiếu</th><th className="px-5 py-4">Phiên</th><th className="px-5 py-4">Quyết định</th><th className="px-5 py-4">Điểm</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4 text-right">Thao tác</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="p-12 text-center font-black">Đang tải...</td></tr> : votes.length === 0 ? <tr><td colSpan={6} className="p-12 text-center font-black text-gray-500">Không có phiếu.</td></tr> : votes.map((vote) => (
                <tr key={vote.vote_id} className="border-b-2 border-manga-ink">
                  <td className="px-6 py-5"><p className="font-black">{vote.voter?.name || vote.voter?.username || vote.voter_id}</p><p className="text-xs text-gray-500">{vote.voter?.email}</p></td>
                  <td className="px-5 py-5 font-bold">{vote.session?.name || 'Không gắn phiên'}<p className="text-xs text-gray-400">{vote.session?.status}</p></td>
                  <td className="px-5 py-5 font-black uppercase">{vote.decision || 'N/A'}</td>
                  <td className="px-5 py-5 text-2xl font-black">{vote.score ?? '-'}</td>
                  <td className="px-5 py-5"><AdminStatusBadge status={vote.status} /></td>
                  <td className="px-5 py-5"><div className="flex justify-end gap-2">{vote.status === 'submitted' && <button disabled={busyId === vote.vote_id} onClick={() => verify(vote)} className={`${iconClass} bg-emerald-500 text-white`}><CheckCircle2 /></button>}<button onClick={() => openEdit(vote)} className={iconClass}><Edit3 /></button><button disabled={busyId === vote.vote_id} onClick={() => remove(vote)} className={`${iconClass} bg-manga-red text-white`}><Trash2 /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-4 border-t-2 border-manga-ink px-6 py-5 md:flex-row md:items-center md:justify-between"><p className="text-sm font-black uppercase">Hiển thị {start}-{end} / {pagination.total}</p><AdminPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} disabled={loading} /></div>
      </AdminTableFrame>
      {editing && <VoteModal form={form} saving={saving} onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))} onClose={() => !saving && setEditing(null)} onSubmit={submit} />}
    </div>
  )
}
