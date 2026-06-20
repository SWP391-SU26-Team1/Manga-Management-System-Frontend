import React, { FormEvent, useCallback, useEffect, useState } from 'react'
import { AlertCircle, CalendarClock, CheckCircle2, ClipboardList, Edit3, Eye, Plus, RefreshCw, Save, Trash2, UserRound, X } from 'lucide-react'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import { AdminTableFrame } from '@/components/admin/AdminTableFrame'
import { adminDashboardService } from '@/services/admin/adminDashboard.service'
import { adminPageTasksService } from '@/services/admin/adminPageTasks.service'
import type { PageTask, PageTaskStatus, PaginationMeta, TaskStats } from '@/services/admin/admin.types'

const STATUSES: PageTaskStatus[] = ['pending', 'assigned', 'in_progress', 'submitted', 'review', 'approved', 'needs_revision', 'completed', 'on_hold', 'cancelled', 'rejected']
const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 }
const inputClass = 'w-full border-2 border-manga-ink bg-white px-4 py-3 text-sm font-bold outline-none'
const labelClass = 'mb-2 block text-xs font-black uppercase text-gray-600'
const iconClass = 'flex h-10 w-10 items-center justify-center border-2 border-manga-ink bg-white hover:bg-gray-100 disabled:opacity-50'
const errorMessage = (error: unknown) => { const value = error as { response?: { data?: { message?: string } }; message?: string }; return value.response?.data?.message || value.message || 'Có lỗi xảy ra.' }
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString('vi-VN') : 'Không có hạn'
type TaskForm = { task_type: string; assistant_id: string; deadline: string; content: string; status: PageTaskStatus }

function TaskModal({ task, form, saving, onChange, onClose, onSubmit }: { task: PageTask; form: TaskForm; saving: boolean; onChange: (key: keyof TaskForm, value: string) => void; onClose: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-2xl border-2 border-manga-ink bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]"><div className="flex justify-between bg-[#282828] px-6 py-5 text-white"><h2 className="font-manga text-3xl font-black uppercase">Chỉnh sửa công việc</h2><button onClick={onClose} className="border-2 border-white p-2"><X /></button></div><form onSubmit={onSubmit} className="space-y-5 p-6">
    <label><span className={labelClass}>Loại công việc</span><input value={form.task_type} onChange={(e) => onChange('task_type', e.target.value)} className={inputClass} required /></label>
    <label><span className={labelClass}>Assistant UUID</span><input value={form.assistant_id} onChange={(e) => onChange('assistant_id', e.target.value)} className={inputClass} placeholder="Để trống nếu chưa gán" /></label>
    <div className="grid gap-5 md:grid-cols-2"><label><span className={labelClass}>Deadline</span><input type="datetime-local" value={form.deadline} onChange={(e) => onChange('deadline', e.target.value)} className={inputClass} /></label><label><span className={labelClass}>Trạng thái</span><select value={form.status} onChange={(e) => onChange('status', e.target.value)} className={inputClass}>{STATUSES.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}</select></label></div>
    <label><span className={labelClass}>Nội dung</span><textarea value={form.content} onChange={(e) => onChange('content', e.target.value)} className={`${inputClass} min-h-28`} /></label>
    <div className="flex justify-end gap-3 border-t-2 border-manga-ink pt-5"><AdminButton type="button" variant="white" onClick={onClose}>Hủy</AdminButton><AdminButton type="submit" icon={Save} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</AdminButton></div>
  </form></div></div>
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<PageTask[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [pagination, setPagination] = useState(emptyPagination)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'all' | PageTaskStatus>('all')
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [editing, setEditing] = useState<PageTask | null>(null)
  const [form, setForm] = useState<TaskForm>({ task_type: '', assistant_id: '', deadline: '', content: '', status: 'pending' })
  const [saving, setSaving] = useState(false)
  const [detail, setDetail] = useState<PageTask | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { const [list, summary] = await Promise.all([adminPageTasksService.list({ page, limit: 10, status: status === 'all' ? undefined : status, sort: 'created_at', order: 'desc' }), adminDashboardService.getTaskStats()]); setTasks(list.data); setPagination(list.pagination); setStats(summary) }
    catch (error) { setFeedback({ type: 'error', message: errorMessage(error) }) } finally { setLoading(false) }
  }, [page, status])
  useEffect(() => { load() }, [load])
  const openEdit = (task: PageTask) => { setEditing(task); setForm({ task_type: task.task_type, assistant_id: task.assistant_id || '', deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '', content: task.content || '', status: task.status }) }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!editing) return; setSaving(true)
    try { await adminPageTasksService.update(editing.task_id, { task_type: form.task_type.trim(), assistant_id: form.assistant_id.trim() || undefined, deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined, content: form.content.trim() || undefined }); if (form.status !== editing.status) await adminPageTasksService.updateStatus(editing.task_id, form.status); setEditing(null); setFeedback({ type: 'success', message: 'Đã cập nhật công việc.' }); await load() }
    catch (error) { setFeedback({ type: 'error', message: errorMessage(error) }) } finally { setSaving(false) }
  }
  const changeStatus = async (task: PageTask, next: PageTaskStatus) => { setBusyId(task.task_id); try { await adminPageTasksService.updateStatus(task.task_id, next); await load() } catch (error) { setFeedback({ type: 'error', message: errorMessage(error) }) } finally { setBusyId(null) } }
  const remove = async (task: PageTask) => { if (!window.confirm(`Xóa công việc ${task.task_type}?`)) return; setBusyId(task.task_id); try { await adminPageTasksService.delete(task.task_id); setFeedback({ type: 'success', message: 'Đã xóa công việc.' }); await load() } catch (error) { setFeedback({ type: 'error', message: errorMessage(error) }) } finally { setBusyId(null) } }
  const start = pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0
  const end = Math.min(pagination.page * pagination.limit, pagination.total)
  return <div className="space-y-8">
    <AdminPageHeader eyebrow="Page task trực tiếp" title="Quản lý công việc" description="Theo dõi phân công, deadline và trạng thái sản xuất." />
    {feedback && <div className={`flex gap-3 border-2 border-manga-ink p-4 font-black ${feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-manga-red'}`}>{feedback.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}{feedback.message}</div>}
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"><AdminStatCard label="Tổng công việc" value={stats?.total || 0} helper="Tất cả page task" icon={ClipboardList} /><AdminStatCard label="Đang thực hiện" value={(stats?.by_status.in_progress || 0) + (stats?.by_status.assigned || 0)} helper="Đã gán hoặc đang làm" icon={UserRound} /><AdminStatCard label="Hoàn tất" value={(stats?.by_status.completed || 0) + (stats?.by_status.approved || 0)} helper="Đã hoàn thành hoặc duyệt" icon={CheckCircle2} accent="green" /><AdminStatCard label="Quá hạn" value={stats?.overdue || 0} helper="Cần xử lý ngay" icon={CalendarClock} dark /></div>
    <AdminTableFrame><div className="flex flex-col gap-4 border-b-2 border-manga-ink p-6 sm:flex-row sm:items-end sm:justify-between"><label className="w-full max-w-xs"><span className={labelClass}>Trạng thái</span><select value={status} onChange={(e) => { setStatus(e.target.value as 'all' | PageTaskStatus); setPage(1) }} className={inputClass}><option value="all">Tất cả</option>{STATUSES.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}</select></label><button onClick={load} className={iconClass}><RefreshCw className={loading ? 'animate-spin' : ''} /></button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="bg-[#282828] text-xs font-black uppercase text-white"><tr><th className="px-6 py-4">Công việc</th><th className="px-5 py-4">Trang</th><th className="px-5 py-4">Assistant</th><th className="px-5 py-4">Deadline</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4 text-right">Thao tác</th></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="p-12 text-center font-black">Đang tải...</td></tr> : tasks.length === 0 ? <tr><td colSpan={6} className="p-12 text-center font-black text-gray-500">Không có công việc.</td></tr> : tasks.map((task) => <tr key={task.task_id} className="border-b-2 border-manga-ink"><td className="px-6 py-5"><p className="font-black">{task.task_type}</p><p className="mt-1 max-w-xs truncate text-xs text-gray-500">{task.content || 'Không có mô tả'}</p></td><td className="px-5 py-5 font-bold">Trang {task.page?.page_number || '?'}<p className="text-xs text-gray-400">{task.page_id.slice(0, 8)}</p></td><td className="px-5 py-5 font-bold">{task.assistant?.name || task.assistant?.username || 'Chưa gán'}</td><td className={`px-5 py-5 font-semibold ${task.deadline && new Date(task.deadline) < new Date() && !['completed','approved','cancelled','rejected'].includes(task.status) ? 'text-manga-red' : 'text-gray-600'}`}>{formatDate(task.deadline)}</td><td className="px-5 py-5"><div className="space-y-2"><AdminStatusBadge status={task.status} /><select value={task.status} disabled={busyId === task.task_id} onChange={(e) => changeStatus(task, e.target.value as PageTaskStatus)} className="block border-2 border-manga-ink px-2 py-2 text-xs font-black">{STATUSES.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}</select></div></td><td className="px-5 py-5"><div className="flex justify-end gap-2"><button onClick={() => setDetail(task)} className={`${iconClass} bg-[#282828] text-white`}><Eye /></button><button onClick={() => openEdit(task)} className={iconClass}><Edit3 /></button><button disabled={busyId === task.task_id} onClick={() => remove(task)} className={`${iconClass} bg-manga-red text-white`}><Trash2 /></button></div></td></tr>)}</tbody></table></div>
      <div className="flex flex-col gap-4 border-t-2 border-manga-ink px-6 py-5 md:flex-row md:items-center md:justify-between"><p className="text-sm font-black uppercase">Hiển thị {start}-{end} / {pagination.total}</p><AdminPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} disabled={loading} /></div>
    </AdminTableFrame>
    {editing && <TaskModal task={editing} form={form} saving={saving} onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))} onClose={() => !saving && setEditing(null)} onSubmit={submit} />}
    {detail && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-2xl border-2 border-manga-ink bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]"><div className="flex justify-between bg-[#282828] px-6 py-5 text-white"><h2 className="font-manga text-3xl font-black uppercase">{detail.task_type}</h2><button onClick={() => setDetail(null)} className="border-2 border-white p-2"><X /></button></div><div className="grid gap-4 p-6 sm:grid-cols-2"><div className="border-2 border-manga-ink p-4"><p className={labelClass}>Assistant</p><p className="font-black">{detail.assistant?.name || detail.assistant?.username || 'Chưa gán'}</p></div><div className="border-2 border-manga-ink p-4"><p className={labelClass}>Người giao</p><p className="font-black">{detail.assigned_by?.name || detail.assigned_by?.username || 'Không rõ'}</p></div><div className="border-2 border-manga-ink p-4"><p className={labelClass}>Deadline</p><p className="font-black">{formatDate(detail.deadline)}</p></div><div className="border-2 border-manga-ink p-4"><p className={labelClass}>Trạng thái</p><AdminStatusBadge status={detail.status} /></div><div className="border-2 border-manga-ink p-4 sm:col-span-2"><p className={labelClass}>Nội dung</p><p className="whitespace-pre-wrap font-semibold">{detail.content || 'Không có nội dung.'}</p></div></div></div></div>}
  </div>
}
