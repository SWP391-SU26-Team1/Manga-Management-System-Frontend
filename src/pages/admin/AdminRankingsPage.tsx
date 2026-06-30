import React, { FormEvent, useCallback, useEffect, useState } from 'react'
import { AlertCircle, BarChart3, CalendarDays, CheckCircle2, Edit3, Plus, Save, Trash2, Trophy, X } from 'lucide-react'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import { AdminTableFrame } from '@/components/admin/AdminTableFrame'
import { adminRankingsService, type ChapterRanking, type RankingPeriod, type SeriesRanking } from '@/services/admin/adminRankings.service'
import type { PaginationMeta, RankingPeriodStatus, RankingStats } from '@/services/admin/admin.types'

const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 }
const inputClass = 'w-full border-2 border-manga-ink bg-white px-4 py-3 text-sm font-bold outline-none'
const labelClass = 'mb-2 block text-xs font-black uppercase text-gray-600'
const iconClass = 'flex h-10 w-10 items-center justify-center border-2 border-manga-ink bg-white hover:bg-gray-100 disabled:opacity-50'
const getError = (error: unknown) => {
  const value = error as { response?: { data?: { message?: string } }; message?: string }
  return value.response?.data?.message || value.message || 'Có lỗi xảy ra.'
}
type Tab = 'periods' | 'series' | 'chapters'
type PeriodForm = { name: string; period_type: string; start_date: string; end_date: string; status: RankingPeriodStatus }

function PeriodModal({ form, saving, editing, onChange, onClose, onSubmit }: {
  form: PeriodForm
  saving: boolean
  editing: boolean
  onChange: (key: keyof PeriodForm, value: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl border-2 border-manga-ink bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="flex justify-between bg-[#282828] px-6 py-5 text-white"><h2 className="font-manga text-3xl font-black uppercase">{editing ? 'Sửa kỳ xếp hạng' : 'Tạo kỳ xếp hạng'}</h2><button onClick={onClose} className="border-2 border-white p-2"><X /></button></div>
        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <label><span className={labelClass}>Tên kỳ</span><input value={form.name} onChange={(e) => onChange('name', e.target.value)} className={inputClass} required /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label><span className={labelClass}>Loại kỳ</span><input value={form.period_type} onChange={(e) => onChange('period_type', e.target.value)} className={inputClass} /></label>
            <label><span className={labelClass}>Trạng thái</span><select value={form.status} onChange={(e) => onChange('status', e.target.value)} className={inputClass}><option value="pending">Chờ xử lý</option><option value="calculating">Đang tính</option><option value="completed">Hoàn tất</option><option value="archived">Lưu trữ</option></select></label>
            <label><span className={labelClass}>Ngày bắt đầu</span><input type="date" value={form.start_date} onChange={(e) => onChange('start_date', e.target.value)} className={inputClass} required /></label>
            <label><span className={labelClass}>Ngày kết thúc</span><input type="date" value={form.end_date} onChange={(e) => onChange('end_date', e.target.value)} className={inputClass} required /></label>
          </div>
          <div className="flex justify-end gap-3 border-t-2 border-manga-ink pt-5"><AdminButton type="button" variant="white" onClick={onClose}>Hủy</AdminButton><AdminButton type="submit" icon={editing ? Save : Plus} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu kỳ'}</AdminButton></div>
        </form>
      </div>
    </div>
  )
}

export default function AdminRankingsPage() {
  const [tab, setTab] = useState<Tab>('periods')
  const [periods, setPeriods] = useState<RankingPeriod[]>([])
  const [seriesRankings, setSeriesRankings] = useState<SeriesRanking[]>([])
  const [chapterRankings, setChapterRankings] = useState<ChapterRanking[]>([])
  const [pagination, setPagination] = useState(emptyPagination)
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState<RankingStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RankingPeriod | null>(null)
  const [form, setForm] = useState<PeriodForm>({ name: '', period_type: '', start_date: '', end_date: '', status: 'pending' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setStats(await adminRankingsService.getStats() as RankingStats)
      if (tab === 'periods') {
        const result = await adminRankingsService.listPeriods({ page, limit: 10 })
        setPeriods(result.data); setPagination(result.pagination)
      } else if (tab === 'series') {
        const result = await adminRankingsService.listSeriesRankings({ page, limit: 10 })
        setSeriesRankings(result.data); setPagination(result.pagination)
      } else {
        const result = await adminRankingsService.listChapterRankings({ page, limit: 10 })
        setChapterRankings(result.data); setPagination(result.pagination)
      }
    } catch (error) {
      setFeedback({ type: 'error', message: getError(error) })
    } finally {
      setLoading(false)
    }
  }, [page, tab])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', period_type: '', start_date: '', end_date: '', status: 'pending' })
    setModalOpen(true)
  }
  const openEdit = (period: RankingPeriod) => {
    setEditing(period)
    setForm({ name: period.name, period_type: period.period_type || '', start_date: period.start_date.slice(0, 10), end_date: period.end_date.slice(0, 10), status: period.status || 'pending' })
    setModalOpen(true)
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await adminRankingsService.updatePeriod(editing.period_id, { name: form.name, period_type: form.period_type || undefined, start_date: form.start_date, end_date: form.end_date })
        if (form.status !== editing.status) await adminRankingsService.updatePeriodStatus(editing.period_id, form.status)
      } else {
        await adminRankingsService.createPeriod(form)
      }
      setModalOpen(false)
      setFeedback({ type: 'success', message: 'Đã lưu kỳ xếp hạng.' })
      await load()
    } catch (error) {
      setFeedback({ type: 'error', message: getError(error) })
    } finally {
      setSaving(false)
    }
  }
  const remove = async (type: Tab, id: string) => {
    if (!window.confirm('Xóa dữ liệu xếp hạng này?')) return
    try {
      if (type === 'periods') await adminRankingsService.deletePeriod(id)
      if (type === 'series') await adminRankingsService.deleteSeriesRanking(id)
      if (type === 'chapters') await adminRankingsService.deleteChapterRanking(id)
      await load()
    } catch (error) {
      setFeedback({ type: 'error', message: getError(error) })
    }
  }

  const start = pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0
  const end = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="Ranking trực tiếp" title="Quản lý xếp hạng" description="Quản lý kỳ, thứ hạng series và thứ hạng chương." action={tab === 'periods' ? <AdminButton icon={Plus} onClick={openCreate}>Tạo kỳ</AdminButton> : undefined} />
      {feedback && <div className={`flex gap-3 border-2 border-manga-ink p-4 font-black ${feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-manga-red'}`}>{feedback.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}{feedback.message}</div>}
      <div className="grid gap-6 md:grid-cols-3">
        <AdminStatCard label="Kỳ xếp hạng" value={stats?.total_periods || 0} helper="Toàn bộ ranking period" icon={CalendarDays} />
        <AdminStatCard label="Xếp hạng series" value={stats?.total_series_rankings || 0} helper="Các bản ghi series ranking" icon={Trophy} accent="green" />
        <AdminStatCard label="Xếp hạng chương" value={stats?.total_chapter_rankings || 0} helper="Các bản ghi chapter ranking" icon={BarChart3} dark />
      </div>
      <AdminTableFrame>
        <div className="flex gap-3 border-b-2 border-manga-ink p-5">
          {(['periods', 'series', 'chapters'] as Tab[]).map((value) => <button key={value} onClick={() => { setTab(value); setPage(1) }} className={`border-2 border-manga-ink px-5 py-3 text-xs font-black uppercase ${tab === value ? 'bg-manga-red text-white' : 'bg-white'}`}>{value === 'periods' ? 'Kỳ xếp hạng' : value === 'series' ? 'Series' : 'Chương'}</button>)}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[#282828] text-xs font-black uppercase text-white">
              {tab === 'periods' ? <tr><th className="px-6 py-4">Kỳ</th><th className="px-5 py-4">Thời gian</th><th className="px-5 py-4">Loại</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4 text-right">Thao tác</th></tr> : <tr><th className="px-6 py-4">Hạng</th><th className="px-5 py-4">Đối tượng</th><th className="px-5 py-4">Kỳ</th><th className="px-5 py-4">Điểm</th><th className="px-5 py-4">Phiếu</th><th className="px-5 py-4 text-right">Thao tác</th></tr>}
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="p-12 text-center font-black">Đang tải...</td></tr> : tab === 'periods' ? periods.map((item) => (
                <tr key={item.period_id} className="border-b-2 border-manga-ink"><td className="px-6 py-5 font-black">{item.name}</td><td className="px-5 py-5 font-semibold">{item.start_date} - {item.end_date}</td><td className="px-5 py-5">{item.period_type || 'N/A'}</td><td className="px-5 py-5"><AdminStatusBadge status={item.status || 'pending'} /></td><td className="px-5 py-5"><div className="flex justify-end gap-2"><button onClick={() => openEdit(item)} className={iconClass}><Edit3 /></button><button onClick={() => remove('periods', item.period_id)} className={`${iconClass} bg-manga-red text-white`}><Trash2 /></button></div></td></tr>
              )) : tab === 'series' ? seriesRankings.map((item) => (
                <tr key={item.series_ranking_id} className="border-b-2 border-manga-ink"><td className="px-6 py-5 text-2xl font-black">#{item.rank_position || '-'}</td><td className="px-5 py-5 font-black">{item.series?.title || item.series_id}</td><td className="px-5 py-5">{item.period?.name || item.period_id}</td><td className="px-5 py-5 font-black">{item.score ?? 0}</td><td className="px-5 py-5">{item.total_vote ?? 0}</td><td className="px-5 py-5 text-right"><button onClick={() => remove('series', item.series_ranking_id)} className={`${iconClass} ml-auto bg-manga-red text-white`}><Trash2 /></button></td></tr>
              )) : chapterRankings.map((item) => (
                <tr key={item.chapter_ranking_id} className="border-b-2 border-manga-ink"><td className="px-6 py-5 text-2xl font-black">#{item.rank_position || '-'}</td><td className="px-5 py-5 font-black">{item.series?.title} / {item.chapter?.title || `Chương ${item.chapter?.chapter_number}`}</td><td className="px-5 py-5">{item.period?.name || item.period_id}</td><td className="px-5 py-5 font-black">{item.score ?? 0}</td><td className="px-5 py-5">{item.total_vote ?? 0}</td><td className="px-5 py-5 text-right"><button onClick={() => remove('chapters', item.chapter_ranking_id)} className={`${iconClass} ml-auto bg-manga-red text-white`}><Trash2 /></button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-4 border-t-2 border-manga-ink px-6 py-5 md:flex-row md:items-center md:justify-between"><p className="text-sm font-black uppercase">Hiển thị {start}-{end} / {pagination.total}</p><AdminPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} disabled={loading} /></div>
      </AdminTableFrame>
      {modalOpen && <PeriodModal editing={Boolean(editing)} form={form} saving={saving} onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))} onClose={() => !saving && setModalOpen(false)} onSubmit={submit} />}
    </div>
  )
}
