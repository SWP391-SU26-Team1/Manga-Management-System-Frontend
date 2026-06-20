import React, { FormEvent, useCallback, useEffect, useState } from 'react'
import { AlertCircle, BookOpen, CheckCircle2, Edit3, Eye, ImageOff, Plus, RefreshCw, Save, Search, Trash2, X } from 'lucide-react'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import { AdminTableFrame } from '@/components/admin/AdminTableFrame'
import { adminChaptersService } from '@/services/admin/adminChapters.service'
import { adminSeriesService } from '@/services/admin/adminSeries.service'
import type { Chapter, ChapterDetail, ChapterStatus, EntityStats, PaginationMeta, Series } from '@/services/admin/admin.types'

const STATUSES: ChapterStatus[] = ['draft', 'pending_review', 'approved', 'rejected', 'published', 'archived', 'hidden', 'banned', 'deleted']
const statusLabel: Record<ChapterStatus, string> = {
  draft: 'Bản nháp', pending_review: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối',
  published: 'Đã xuất bản', archived: 'Lưu trữ', hidden: 'Đã ẩn', banned: 'Bị cấm', deleted: 'Đã xóa',
}
const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 }
const inputClass = 'w-full border-2 border-manga-ink bg-white px-4 py-3 text-sm font-bold outline-none focus:shadow-[3px_3px_0_rgba(232,23,63,1)]'
const labelClass = 'mb-2 block text-xs font-black uppercase text-gray-600'
const iconClass = 'flex h-10 w-10 items-center justify-center border-2 border-manga-ink bg-white hover:bg-gray-100 disabled:opacity-50'
type FormState = { series_id: string; chapter_number: string; title: string; thumbnail_image_url: string; status: ChapterStatus }
const emptyForm: FormState = { series_id: '', chapter_number: '1', title: '', thumbnail_image_url: '', status: 'draft' }

const errorMessage = (error: unknown) => {
  const value = error as { response?: { data?: { message?: string } }; message?: string }
  return value.response?.data?.message || value.message || 'Có lỗi xảy ra.'
}
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString('vi-VN') : 'Chưa có'

function ChapterModal({ chapter, form, saving, series, onChange, onClose, onSubmit }: {
  chapter: Chapter | null; form: FormState; saving: boolean; series: Series[]
  onChange: (key: keyof FormState, value: string) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl border-2 border-manga-ink bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between border-b-2 border-manga-ink bg-[#282828] px-6 py-5 text-white">
          <h2 className="font-manga text-3xl font-black uppercase">{chapter ? 'Chỉnh sửa chương' : 'Tạo chương mới'}</h2>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center border-2 border-white"><X /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label><span className={labelClass}>Series</span><select value={form.series_id} disabled={Boolean(chapter)} onChange={(e) => onChange('series_id', e.target.value)} className={inputClass} required><option value="">Chọn series</option>{series.map((item) => <option key={item.series_id} value={item.series_id}>{item.title}</option>)}</select></label>
            <label><span className={labelClass}>Số chương</span><input type="number" min="1" value={form.chapter_number} onChange={(e) => onChange('chapter_number', e.target.value)} className={inputClass} required /></label>
            <label><span className={labelClass}>Tên chương</span><input value={form.title} onChange={(e) => onChange('title', e.target.value)} className={inputClass} maxLength={255} /></label>
            <label><span className={labelClass}>Trạng thái</span><select value={form.status} onChange={(e) => onChange('status', e.target.value)} className={inputClass}>{STATUSES.map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}</select></label>
          </div>
          <label><span className={labelClass}>URL thumbnail</span><input type="url" value={form.thumbnail_image_url} onChange={(e) => onChange('thumbnail_image_url', e.target.value)} className={inputClass} /></label>
          <div className="flex justify-end gap-3 border-t-2 border-manga-ink pt-5">
            <AdminButton type="button" variant="white" onClick={onClose}>Hủy</AdminButton>
            <AdminButton type="submit" icon={chapter ? Save : Plus} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu chương'}</AdminButton>
          </div>
        </form>
      </div>
    </div>
  )
}

function DetailModal({ chapter, onClose }: { chapter: ChapterDetail; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border-2 border-manga-ink bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between bg-[#282828] px-6 py-5 text-white"><h2 className="font-manga text-3xl font-black uppercase">{chapter.title || `Chương ${chapter.chapter_number}`}</h2><button onClick={onClose} className="border-2 border-white p-2"><X /></button></div>
        <div className="grid gap-6 p-6 md:grid-cols-[180px_1fr]">
          {chapter.thumbnail_image_url ? <img src={chapter.thumbnail_image_url} alt="" className="h-56 w-40 border-2 border-manga-ink object-cover" /> : <div className="flex h-56 w-40 items-center justify-center border-2 border-manga-ink bg-gray-100"><ImageOff className="h-10 w-10 text-gray-400" /></div>}
          <div className="space-y-5">
            <AdminStatusBadge status={chapter.status} />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border-2 border-manga-ink p-4"><p className="text-xs font-black uppercase text-gray-500">Series</p><p className="mt-2 font-black">{chapter.series?.title || chapter.series_id}</p></div>
              <div className="border-2 border-manga-ink p-4"><p className="text-xs font-black uppercase text-gray-500">Số trang</p><p className="mt-2 text-3xl font-black">{chapter.page?.length || 0}</p></div>
              <div className="border-2 border-manga-ink p-4"><p className="text-xs font-black uppercase text-gray-500">Lượt xem</p><p className="mt-2 text-3xl font-black">{(chapter.view_count || 0).toLocaleString('vi-VN')}</p></div>
            </div>
            <div className="border-2 border-manga-ink"><div className="border-b-2 border-manga-ink bg-gray-100 px-4 py-3 text-xs font-black uppercase">Danh sách trang</div>{chapter.page?.length ? chapter.page.map((page) => <div key={page.page_id} className="flex justify-between border-b border-gray-200 px-4 py-3 last:border-0"><span className="font-bold">Trang {page.page_number}</span><AdminStatusBadge status={page.status} /></div>) : <p className="p-4 text-gray-500">Chưa có trang.</p>}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [stats, setStats] = useState<EntityStats<ChapterStatus> | null>(null)
  const [pagination, setPagination] = useState(emptyPagination)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'all' | ChapterStatus>('all')
  const [seriesId, setSeriesId] = useState('')
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Chapter | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [detail, setDetail] = useState<ChapterDetail | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminChaptersService.list({ page, limit: 10, status: status === 'all' ? undefined : status, series_id: seriesId || undefined, keyword: keyword || undefined, sort: 'created_at', order: 'desc' })
      setChapters(response.data); setPagination(response.pagination)
    } catch (error) { setFeedback({ type: 'error', message: errorMessage(error) }) } finally { setLoading(false) }
  }, [keyword, page, seriesId, status])

  const loadSupport = useCallback(async () => {
    const [seriesResult, statsResult] = await Promise.allSettled([adminSeriesService.list({ page: 1, limit: 100, sort: 'title', order: 'asc' }), adminChaptersService.getStats()])
    if (seriesResult.status === 'fulfilled') setSeries(seriesResult.value.data)
    if (statsResult.status === 'fulfilled') setStats(statsResult.value)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadSupport() }, [loadSupport])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormOpen(true) }
  const openEdit = (item: Chapter) => { setEditing(item); setForm({ series_id: item.series_id, chapter_number: String(item.chapter_number), title: item.title || '', thumbnail_image_url: item.thumbnail_image_url || '', status: item.status }); setFormOpen(true) }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true)
    try {
      const body = { chapter_number: Number(form.chapter_number), title: form.title.trim() || undefined, thumbnail_image_url: form.thumbnail_image_url.trim() || undefined }
      if (editing) {
        await adminChaptersService.update(editing.chapter_id, body)
        if (form.status !== editing.status) await adminChaptersService.updateStatus(editing.chapter_id, form.status)
      } else await adminChaptersService.create({ ...body, series_id: form.series_id, status: form.status })
      setFormOpen(false); setFeedback({ type: 'success', message: editing ? 'Đã cập nhật chương.' : 'Đã tạo chương.' }); await Promise.all([load(), loadSupport()])
    } catch (error) { setFeedback({ type: 'error', message: errorMessage(error) }) } finally { setSaving(false) }
  }
  const changeStatus = async (item: Chapter, next: ChapterStatus) => {
    setBusyId(item.chapter_id)
    try { await adminChaptersService.updateStatus(item.chapter_id, next); setFeedback({ type: 'success', message: 'Đã cập nhật trạng thái chương.' }); await Promise.all([load(), loadSupport()]) } catch (error) { setFeedback({ type: 'error', message: errorMessage(error) }) } finally { setBusyId(null) }
  }
  const remove = async (item: Chapter) => {
    if (!window.confirm(`Xóa chương ${item.chapter_number}: ${item.title || ''}?`)) return
    setBusyId(item.chapter_id)
    try { await adminChaptersService.delete(item.chapter_id); setFeedback({ type: 'success', message: 'Đã xóa chương.' }); await Promise.all([load(), loadSupport()]) } catch (error) { setFeedback({ type: 'error', message: errorMessage(error) }) } finally { setBusyId(null) }
  }
  const showDetail = async (item: Chapter) => {
    setDetail(item as ChapterDetail)
    try { setDetail(await adminChaptersService.getDetail(item.chapter_id)) } catch (error) { setFeedback({ type: 'error', message: errorMessage(error) }) }
  }
  const start = pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0
  const end = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="Dữ liệu chapter trực tiếp" title="Quản lý chương" description="Tạo, kiểm duyệt và theo dõi chương theo từng series." action={<AdminButton icon={Plus} onClick={openCreate}>Thêm chương</AdminButton>} />
      {feedback && <div className={`flex gap-3 border-2 border-manga-ink p-4 font-black ${feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-manga-red'}`}>{feedback.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}{feedback.message}</div>}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Tổng chương" value={stats?.total || 0} helper="Toàn bộ chapter trong hệ thống" icon={BookOpen} />
        <AdminStatCard label="Đã xuất bản" value={stats?.by_status?.published || 0} helper="Đang hiển thị công khai" icon={CheckCircle2} accent="green" />
        <AdminStatCard label="Chờ duyệt" value={stats?.by_status?.pending_review || 0} helper="Đang chờ kiểm duyệt" icon={Eye} />
        <AdminStatCard label="Bản nháp" value={stats?.by_status?.draft || 0} helper="Chưa gửi duyệt" icon={Edit3} dark />
      </div>
      <AdminTableFrame>
        <div className="grid gap-4 border-b-2 border-manga-ink p-6 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
          <form onSubmit={(e) => { e.preventDefault(); setKeyword(keywordInput.trim()); setPage(1) }}><span className={labelClass}>Tìm kiếm</span><div className="flex gap-2"><input value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} className={inputClass} placeholder="Tên chương..." /><button className={iconClass}><Search /></button></div></form>
          <label><span className={labelClass}>Series</span><select value={seriesId} onChange={(e) => { setSeriesId(e.target.value); setPage(1) }} className={inputClass}><option value="">Tất cả series</option>{series.map((item) => <option key={item.series_id} value={item.series_id}>{item.title}</option>)}</select></label>
          <label><span className={labelClass}>Trạng thái</span><select value={status} onChange={(e) => { setStatus(e.target.value as 'all' | ChapterStatus); setPage(1) }} className={inputClass}><option value="all">Tất cả</option>{STATUSES.map((item) => <option key={item} value={item}>{statusLabel[item]}</option>)}</select></label>
          <button onClick={load} className={iconClass} title="Tải lại"><RefreshCw className={loading ? 'animate-spin' : ''} /></button>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left"><thead className="bg-[#282828] text-xs font-black uppercase text-white"><tr><th className="px-6 py-4">Chương</th><th className="px-5 py-4">Series</th><th className="px-5 py-4">Lượt xem</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4">Ngày tạo</th><th className="px-5 py-4 text-right">Thao tác</th></tr></thead><tbody>
          {loading ? <tr><td colSpan={6} className="p-12 text-center font-black">Đang tải...</td></tr> : chapters.length === 0 ? <tr><td colSpan={6} className="p-12 text-center font-black text-gray-500">Không có chương phù hợp.</td></tr> : chapters.map((item) => <tr key={item.chapter_id} className="border-b-2 border-manga-ink">
            <td className="px-6 py-5"><div className="flex items-center gap-4">{item.thumbnail_image_url ? <img src={item.thumbnail_image_url} alt="" className="h-16 w-12 border-2 border-manga-ink object-cover" /> : <div className="flex h-16 w-12 items-center justify-center border-2 border-manga-ink bg-gray-100"><ImageOff className="h-4 w-4" /></div>}<div><p className="font-black">Chương {item.chapter_number}</p><p className="text-sm text-gray-500">{item.title || 'Chưa đặt tên'}</p></div></div></td>
            <td className="px-5 py-5 font-bold">{item.series?.title || item.series_id}</td><td className="px-5 py-5 font-black">{(item.view_count || 0).toLocaleString('vi-VN')}</td>
            <td className="px-5 py-5"><div className="space-y-2"><AdminStatusBadge status={item.status} /><select value={item.status} disabled={busyId === item.chapter_id} onChange={(e) => changeStatus(item, e.target.value as ChapterStatus)} className="block border-2 border-manga-ink px-2 py-2 text-xs font-black">{STATUSES.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></div></td>
            <td className="px-5 py-5 font-semibold text-gray-600">{formatDate(item.created_at)}</td><td className="px-5 py-5"><div className="flex justify-end gap-2"><button onClick={() => showDetail(item)} className={`${iconClass} bg-[#282828] text-white`}><Eye /></button><button onClick={() => openEdit(item)} className={iconClass}><Edit3 /></button><button disabled={busyId === item.chapter_id} onClick={() => remove(item)} className={`${iconClass} bg-manga-red text-white`}><Trash2 /></button></div></td>
          </tr>)}
        </tbody></table></div>
        <div className="flex flex-col gap-4 border-t-2 border-manga-ink px-6 py-5 md:flex-row md:items-center md:justify-between"><p className="text-sm font-black uppercase">Hiển thị {start}-{end} / {pagination.total}</p><AdminPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} disabled={loading} /></div>
      </AdminTableFrame>
      {formOpen && <ChapterModal chapter={editing} form={form} saving={saving} series={series} onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))} onClose={() => !saving && setFormOpen(false)} onSubmit={submit} />}
      {detail && <DetailModal chapter={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
