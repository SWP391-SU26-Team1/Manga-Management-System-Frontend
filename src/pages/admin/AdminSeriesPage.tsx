import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  ImageOff,
  Layers3,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldOff,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminFilters } from '@/components/admin/AdminFilters'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import { AdminTableFrame } from '@/components/admin/AdminTableFrame'
import { adminSeriesService, type ListSeriesParams } from '@/services/admin/adminSeries.service'
import type {
  PaginationMeta,
  Series,
  SeriesDetail,
  SeriesStats,
  SeriesStatus,
} from '@/services/admin/admin.types'

const DEFAULT_LIMIT = 10
const SERIES_STATUSES: SeriesStatus[] = [
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'published',
  'archived',
  'hidden',
  'banned',
  'deleted',
]
const STATUS_TABS = ['Tất cả', 'Chờ duyệt', 'Đã xuất bản', 'Bản nháp', 'Đã ẩn']

const statusLabel: Record<SeriesStatus, string> = {
  draft: 'Bản nháp',
  pending_review: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  published: 'Đã xuất bản',
  archived: 'Lưu trữ',
  hidden: 'Đã ẩn',
  banned: 'Bị cấm',
  deleted: 'Đã xóa',
}

const statusTabMap: Record<string, StatusFilter> = {
  'Tất cả': 'all',
  'Chờ duyệt': 'pending_review',
  'Đã xuất bản': 'published',
  'Bản nháp': 'draft',
  'Đã ẩn': 'hidden',
}

type StatusFilter = 'all' | SeriesStatus
type Feedback = { type: 'success' | 'error'; message: string } | null
type SeriesFormState = {
  title: string
  description: string
  cover_image_url: string
  genre: string
  status: SeriesStatus
}

const emptyPagination: PaginationMeta = {
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 1,
}

const emptyForm: SeriesFormState = {
  title: '',
  description: '',
  cover_image_url: '',
  genre: '',
  status: 'draft',
}

const inputClass =
  'w-full border-2 border-manga-ink bg-white px-4 py-3 text-sm font-bold outline-none focus:shadow-[3px_3px_0_rgba(232,23,63,1)]'
const labelClass = 'mb-2 block text-xs font-black uppercase text-gray-600'
const iconButtonClass =
  'flex h-10 w-10 items-center justify-center border-2 border-manga-ink bg-white transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-45'

const getErrorMessage = (error: unknown) => {
  const apiError = error as { response?: { data?: { message?: string } }; message?: string }
  return apiError.response?.data?.message || apiError.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
}

const optionalValue = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const shortId = (value: string) => `${value.slice(0, 8)}...${value.slice(-4)}`

const splitGenres = (genre?: string | null) =>
  genre
    ? genre
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : []

const toForm = (series?: Series | null): SeriesFormState => ({
  title: series?.title || '',
  description: series?.description || '',
  cover_image_url: series?.cover_image_url || '',
  genre: series?.genre || '',
  status: series?.status || 'draft',
})

function SeriesCover({ series, large = false }: { series: Series; large?: boolean }) {
  const sizeClass = large ? 'h-64 w-44' : 'h-20 w-14'

  if (!series.cover_image_url) {
    return (
      <div className={`flex shrink-0 items-center justify-center border-2 border-manga-ink bg-gray-100 ${sizeClass}`}>
        <ImageOff className={large ? 'h-10 w-10 text-gray-400' : 'h-5 w-5 text-gray-400'} />
      </div>
    )
  }

  return (
    <img
      src={series.cover_image_url}
      alt={series.title}
      className={`shrink-0 border-2 border-manga-ink object-cover ${sizeClass}`}
    />
  )
}

interface SeriesFormModalProps {
  mode: 'create' | 'edit'
  series?: Series | null
  form: SeriesFormState
  saving: boolean
  onChange: (field: keyof SeriesFormState, value: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function SeriesFormModal({
  mode,
  series,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: SeriesFormModalProps) {
  const isCreate = mode === 'create'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border-2 border-manga-ink bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="flex items-start justify-between border-b-2 border-manga-ink bg-[#282828] px-6 py-5 text-white">
          <div>
            <p className="text-xs font-black uppercase text-manga-red">{isCreate ? 'Tạo series' : 'Chỉnh sửa series'}</p>
            <h2 className="mt-1 font-manga text-3xl font-black uppercase">
              {isCreate ? 'Series mới' : series?.title}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center border-2 border-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <label>
            <span className={labelClass}>Tên series</span>
            <input
              value={form.title}
              onChange={(event) => onChange('title', event.target.value)}
              className={inputClass}
              maxLength={255}
              required
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className={labelClass}>Thể loại</span>
              <input
                value={form.genre}
                onChange={(event) => onChange('genre', event.target.value)}
                className={inputClass}
                maxLength={100}
                placeholder="Action, Fantasy"
              />
            </label>
            <label>
              <span className={labelClass}>Trạng thái</span>
              <select
                value={form.status}
                onChange={(event) => onChange('status', event.target.value)}
                className={inputClass}
              >
                {SERIES_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel[status]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span className={labelClass}>URL ảnh bìa</span>
            <input
              type="url"
              value={form.cover_image_url}
              onChange={(event) => onChange('cover_image_url', event.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </label>

          <label>
            <span className={labelClass}>Mô tả</span>
            <textarea
              value={form.description}
              onChange={(event) => onChange('description', event.target.value)}
              className={`${inputClass} min-h-32 resize-y`}
            />
          </label>

          <div className="flex flex-col gap-3 border-t-2 border-manga-ink pt-5 sm:flex-row sm:justify-end">
            <AdminButton type="button" variant="white" onClick={onClose} disabled={saving}>
              Hủy
            </AdminButton>
            <AdminButton type="submit" icon={isCreate ? Plus : Save} disabled={saving}>
              {saving ? 'Đang lưu...' : isCreate ? 'Tạo series' : 'Lưu thay đổi'}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  )
}

function SeriesDetailModal({
  series,
  loading,
  onClose,
}: {
  series: SeriesDetail
  loading: boolean
  onClose: () => void
}) {
  const chapters = series.chapter || []
  const members = series.series_member || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto border-2 border-manga-ink bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="flex items-start justify-between border-b-2 border-manga-ink bg-[#282828] px-6 py-5 text-white">
          <div>
            <p className="text-xs font-black uppercase text-manga-red">Chi tiết series</p>
            <h2 className="mt-1 font-manga text-3xl font-black uppercase">{series.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center border-2 border-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[200px_minmax(0,1fr)]">
          <div>
            <SeriesCover series={series} large />
            <div className="mt-4"><AdminStatusBadge status={series.status} /></div>
            <p className="mt-4 break-all text-xs font-bold text-gray-500">{series.series_id}</p>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border-2 border-manga-ink p-4">
                <BookOpen className="h-5 w-5 text-manga-red" />
                <p className="mt-3 text-3xl font-black">{chapters.length}</p>
                <p className="text-xs font-black uppercase text-gray-500">Chương</p>
              </div>
              <div className="border-2 border-manga-ink p-4">
                <Users className="h-5 w-5 text-manga-red" />
                <p className="mt-3 text-3xl font-black">{members.length}</p>
                <p className="text-xs font-black uppercase text-gray-500">Thành viên</p>
              </div>
              <div className="border-2 border-manga-ink p-4">
                <Eye className="h-5 w-5 text-manga-red" />
                <p className="mt-3 text-3xl font-black">{(series.view_count || 0).toLocaleString('vi-VN')}</p>
                <p className="text-xs font-black uppercase text-gray-500">Lượt xem</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase text-gray-500">Mô tả</h3>
              <p className="mt-2 whitespace-pre-wrap font-semibold leading-7 text-gray-700">
                {series.description || 'Chưa có mô tả.'}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase text-gray-500">Thể loại</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {splitGenres(series.genre).length > 0 ? (
                  splitGenres(series.genre).map((genre) => (
                    <span key={genre} className="border-2 border-manga-ink bg-gray-100 px-3 py-1 text-xs font-black uppercase">
                      {genre}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Chưa phân loại</span>
                )}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-xs font-black uppercase text-gray-500">Danh sách chương</h3>
                <div className="max-h-64 overflow-y-auto border-2 border-manga-ink">
                  {chapters.length === 0 ? (
                    <p className="p-4 text-sm font-semibold text-gray-500">Series chưa có chương.</p>
                  ) : (
                    chapters
                      .slice()
                      .sort((a, b) => a.chapter_number - b.chapter_number)
                      .map((chapter) => (
                        <div key={chapter.chapter_id} className="flex items-center justify-between gap-3 border-b border-gray-200 p-3 last:border-b-0">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black">Chương {chapter.chapter_number}: {chapter.title || 'Chưa đặt tên'}</p>
                            <p className="mt-1 text-xs text-gray-500">{formatDate(chapter.created_at)}</p>
                          </div>
                          <AdminStatusBadge status={chapter.status} />
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-black uppercase text-gray-500">Nhóm thực hiện</h3>
                <div className="max-h-64 overflow-y-auto border-2 border-manga-ink">
                  {members.length === 0 ? (
                    <p className="p-4 text-sm font-semibold text-gray-500">Series chưa có thành viên.</p>
                  ) : (
                    members.map((member) => (
                      <div key={member.series_member_id} className="border-b border-gray-200 p-3 last:border-b-0">
                        <p className="text-sm font-black">{member.users?.name || member.users?.username || member.user_id}</p>
                        <p className="mt-1 text-xs font-bold uppercase text-gray-500">{member.role_in_series}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading && <div className="border-t-2 border-manga-ink px-6 py-4 text-sm font-black uppercase text-manga-red">Đang tải chi tiết...</div>}
      </div>
    </div>
  )
}

export default function AdminSeriesPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [stats, setStats] = useState<SeriesStats | null>(null)
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [genre, setGenre] = useState('')
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busySeriesId, setBusySeriesId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)
  const [form, setForm] = useState<SeriesFormState>(emptyForm)
  const [detailSeries, setDetailSeries] = useState<SeriesDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadSeries = useCallback(async () => {
    setLoading(true)
    const params: ListSeriesParams = {
      page,
      limit: DEFAULT_LIMIT,
      status: statusFilter === 'all' ? undefined : statusFilter,
      genre: optionalValue(genre),
      keyword: optionalValue(keyword),
      sort,
      order,
    }

    try {
      const response = await adminSeriesService.list(params)
      setSeries(response.data)
      setPagination(response.pagination)
    } catch (error) {
      setSeries([])
      setPagination(emptyPagination)
      setFeedback({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setLoading(false)
    }
  }, [genre, keyword, order, page, sort, statusFilter])

  const loadStats = useCallback(async () => {
    try {
      setStats(await adminSeriesService.getStats())
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) })
    }
  }, [])

  useEffect(() => {
    loadSeries()
  }, [loadSeries])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const restrictedCount = useMemo(
    () => (stats?.by_status.hidden || 0) + (stats?.by_status.banned || 0) + (stats?.by_status.deleted || 0),
    [stats],
  )

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setKeyword(keywordInput.trim())
    setPage(1)
  }

  const resetFilters = () => {
    setStatusFilter('all')
    setGenre('')
    setKeywordInput('')
    setKeyword('')
    setSort('created_at')
    setOrder('desc')
    setPage(1)
  }

  const openCreate = () => {
    setEditingSeries(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (item: Series) => {
    setEditingSeries(item)
    setForm(toForm(item))
    setFormOpen(true)
  }

  const closeForm = () => {
    if (saving) return
    setFormOpen(false)
    setEditingSeries(null)
    setForm(emptyForm)
  }

  const handleFormChange = (field: keyof SeriesFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      const body = {
        title: form.title.trim(),
        description: optionalValue(form.description),
        cover_image_url: optionalValue(form.cover_image_url),
        genre: optionalValue(form.genre),
      }

      if (editingSeries) {
        await adminSeriesService.update(editingSeries.series_id, body)
        if (form.status !== editingSeries.status) {
          await adminSeriesService.updateStatus(editingSeries.series_id, form.status)
        }
        setFeedback({ type: 'success', message: `Đã cập nhật "${form.title.trim()}".` })
      } else {
        await adminSeriesService.create({ ...body, status: form.status })
        setFeedback({ type: 'success', message: `Đã tạo series "${form.title.trim()}".` })
      }

      setFormOpen(false)
      setEditingSeries(null)
      setForm(emptyForm)
      await Promise.all([loadSeries(), loadStats()])
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (item: Series, status: SeriesStatus) => {
    if (status === item.status) return
    setBusySeriesId(item.series_id)
    setFeedback(null)

    try {
      await adminSeriesService.updateStatus(item.series_id, status)
      setSeries((current) => current.map((entry) => (entry.series_id === item.series_id ? { ...entry, status } : entry)))
      setFeedback({ type: 'success', message: `Đã chuyển "${item.title}" sang ${statusLabel[status].toLowerCase()}.` })
      await loadStats()
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setBusySeriesId(null)
    }
  }

  const deleteSeries = async (item: Series) => {
    const confirmed = window.confirm(`Xóa vĩnh viễn series "${item.title}"? Các dữ liệu liên quan có thể bị xóa theo.`)
    if (!confirmed) return

    setBusySeriesId(item.series_id)
    setFeedback(null)
    try {
      await adminSeriesService.delete(item.series_id)
      setFeedback({ type: 'success', message: `Đã xóa "${item.title}".` })
      if (series.length === 1 && page > 1) setPage((current) => current - 1)
      else await loadSeries()
      await loadStats()
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setBusySeriesId(null)
    }
  }

  const openDetail = async (item: Series) => {
    setDetailSeries(item as SeriesDetail)
    setDetailLoading(true)
    try {
      setDetailSeries(await adminSeriesService.getDetail(item.series_id))
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setDetailLoading(false)
    }
  }

  const activeTab = Object.entries(statusTabMap).find(([, value]) => value === statusFilter)?.[0] || 'Tất cả'
  const showingStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const showingEnd = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Kho nội dung trực tiếp"
        title="Quản lý series"
        description="Tìm kiếm, kiểm duyệt và quản lý vòng đời series bằng dữ liệu backend."
        action={<AdminButton icon={Plus} onClick={openCreate}>Thêm series</AdminButton>}
      />

      {feedback && (
        <div className={`flex items-start gap-3 border-2 border-manga-ink px-5 py-4 text-sm font-black shadow-[4px_4px_0_rgba(0,0,0,1)] ${
          feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-manga-red'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5" /> : <AlertCircle className="mt-0.5 h-5 w-5" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Tổng series" value={(stats?.total || 0).toLocaleString('vi-VN')} helper="Toàn bộ series trong hệ thống" icon={Layers3} />
        <AdminStatCard label="Chờ duyệt" value={stats?.by_status.pending_review || 0} helper="Cần admin hoặc editor xử lý" icon={Eye} />
        <AdminStatCard label="Đã xuất bản" value={stats?.by_status.published || 0} helper="Đang hiển thị cho độc giả" icon={CheckCircle2} accent="green" />
        <AdminStatCard label="Bị hạn chế" value={restrictedCount} helper="Đã ẩn, bị cấm hoặc đã xóa" icon={ShieldOff} dark />
      </div>

      <AdminTableFrame>
        <div className="space-y-5 border-b-2 border-manga-ink p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <AdminFilters
              tabs={STATUS_TABS}
              activeTab={activeTab}
              onTabChange={(tab) => {
                setStatusFilter(statusTabMap[tab] || 'all')
                setPage(1)
              }}
            />
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-80">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  value={keywordInput}
                  onChange={(event) => setKeywordInput(event.target.value)}
                  placeholder="Tìm theo tên series..."
                  className={`${inputClass} pl-12`}
                />
              </div>
              <AdminButton type="submit" icon={Search} disabled={loading}>Tìm kiếm</AdminButton>
            </form>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_220px_180px_auto] xl:items-end">
            <label>
              <span className={labelClass}>Thể loại chứa</span>
              <input
                value={genre}
                onChange={(event) => {
                  setGenre(event.target.value)
                  setPage(1)
                }}
                placeholder="Ví dụ: Fantasy"
                className={inputClass}
              />
            </label>
            <label>
              <span className={labelClass}>Sắp xếp theo</span>
              <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }} className={inputClass}>
                <option value="created_at">Ngày tạo</option>
                <option value="updated_at">Ngày cập nhật</option>
                <option value="title">Tên series</option>
                <option value="view_count">Lượt xem</option>
                <option value="status">Trạng thái</option>
              </select>
            </label>
            <label>
              <span className={labelClass}>Thứ tự</span>
              <select value={order} onChange={(event) => { setOrder(event.target.value as 'asc' | 'desc'); setPage(1) }} className={inputClass}>
                <option value="desc">Giảm dần</option>
                <option value="asc">Tăng dần</option>
              </select>
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => loadSeries()} disabled={loading} className={iconButtonClass} title="Tải lại">
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button type="button" onClick={resetFilters} className={iconButtonClass} title="Xóa bộ lọc">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left">
            <thead className="bg-[#282828] text-white">
              <tr className="text-xs font-black uppercase">
                <th className="px-6 py-4">Series</th>
                <th className="px-5 py-4">Thể loại</th>
                <th className="px-5 py-4">Lượt xem</th>
                <th className="px-5 py-4">Ngày tạo</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-6 py-14 text-center font-black uppercase text-gray-500">Đang tải series...</td></tr>
              )}
              {!loading && series.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-14 text-center font-black uppercase text-gray-500">Không có series phù hợp.</td></tr>
              )}
              {!loading && series.map((item) => {
                const busy = busySeriesId === item.series_id
                const genres = splitGenres(item.genre)
                return (
                  <tr key={item.series_id} className="border-b-2 border-manga-ink last:border-b-0 hover:bg-gray-50">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <SeriesCover series={item} />
                        <div className="min-w-0">
                          <p className="max-w-xs truncate font-black">{item.title}</p>
                          <p className="mt-1 text-xs font-bold text-gray-400" title={item.series_id}>ID: {shortId(item.series_id)}</p>
                          <p className="mt-2 max-w-xs truncate text-xs text-gray-500">{item.description || 'Chưa có mô tả'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex max-w-56 flex-wrap gap-2">
                        {genres.length > 0 ? genres.slice(0, 3).map((entry) => (
                          <span key={entry} className="border border-manga-ink bg-gray-100 px-2 py-1 text-[11px] font-black uppercase">{entry}</span>
                        )) : <span className="text-sm text-gray-400">Chưa phân loại</span>}
                      </div>
                    </td>
                    <td className="px-5 py-5 font-black">{(item.view_count || 0).toLocaleString('vi-VN')}</td>
                    <td className="px-5 py-5 text-sm font-semibold text-gray-600">{formatDate(item.created_at)}</td>
                    <td className="px-5 py-5">
                      <div className="space-y-3">
                        <AdminStatusBadge status={item.status} />
                        <select
                          value={item.status}
                          disabled={busy}
                          onChange={(event) => updateStatus(item, event.target.value as SeriesStatus)}
                          className="w-full min-w-36 border-2 border-manga-ink bg-white px-2 py-2 text-xs font-black uppercase"
                        >
                          {SERIES_STATUSES.map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openDetail(item)} className={`${iconButtonClass} bg-[#282828] text-white`} title="Xem chi tiết">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button type="button" onClick={() => openEdit(item)} className={iconButtonClass} title="Chỉnh sửa">
                          <Edit3 className="h-5 w-5" />
                        </button>
                        {item.status === 'pending_review' && (
                          <button type="button" disabled={busy} onClick={() => updateStatus(item, 'approved')} className={`${iconButtonClass} bg-emerald-500 text-white`} title="Duyệt">
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                        )}
                        <button type="button" disabled={busy} onClick={() => deleteSeries(item)} className={`${iconButtonClass} bg-manga-red text-white`} title="Xóa">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t-2 border-manga-ink px-6 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-black uppercase">
            Hiển thị {showingStart}-{showingEnd} trong tổng số {pagination.total.toLocaleString('vi-VN')} series
          </p>
          <AdminPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} disabled={loading} />
        </div>
      </AdminTableFrame>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border-2 border-manga-ink bg-white p-5">
          <BookOpen className="h-6 w-6 text-manga-red" />
          <p className="mt-4 text-sm font-black uppercase">Nội dung có cấu trúc</p>
          <p className="mt-2 text-sm font-semibold text-gray-600">Chi tiết series lấy trực tiếp chapter và thành viên từ quan hệ Supabase.</p>
        </div>
        <div className="border-2 border-manga-ink bg-white p-5">
          <EyeOff className="h-6 w-6 text-manga-red" />
          <p className="mt-4 text-sm font-black uppercase">Kiểm soát hiển thị</p>
          <p className="mt-2 text-sm font-semibold text-gray-600">Admin có thể chuyển đổi toàn bộ trạng thái hợp lệ của series.</p>
        </div>
        <div className="border-2 border-manga-ink bg-[#282828] p-5 text-white">
          <Users className="h-6 w-6 text-manga-red" />
          <p className="mt-4 text-sm font-black uppercase">Quản trị tập trung</p>
          <p className="mt-2 text-sm font-semibold text-gray-300">Tạo, sửa, duyệt và xóa đều gọi API backend thật.</p>
        </div>
      </div>

      {formOpen && (
        <SeriesFormModal
          mode={editingSeries ? 'edit' : 'create'}
          series={editingSeries}
          form={form}
          saving={saving}
          onChange={handleFormChange}
          onClose={closeForm}
          onSubmit={submitForm}
        />
      )}

      {detailSeries && (
        <SeriesDetailModal series={detailSeries} loading={detailLoading} onClose={() => setDetailSeries(null)} />
      )}
    </div>
  )
}
