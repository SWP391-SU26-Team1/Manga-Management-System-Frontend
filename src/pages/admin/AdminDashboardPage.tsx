import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  BellRing,
  BookOpen,
  CheckCircle2,
  Clock3,
  Database,
  FileStack,
  Gauge,
  Layers3,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { Link } from 'react-router'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge'
import { AdminTableFrame } from '@/components/admin/AdminTableFrame'
import { adminDashboardService } from '@/services/admin/adminDashboard.service'
import type {
  DashboardOverview,
  NotificationStats,
  RankingStats,
  ReviewSession,
  ReviewStats,
  SeriesStats,
  StorageUsage,
  SystemHealth,
  TaskStats,
  UserStats,
} from '@/services/admin/admin.types'

type DashboardData = {
  overview: DashboardOverview | null
  users: UserStats | null
  series: SeriesStats | null
  tasks: TaskStats | null
  reviews: ReviewStats | null
  rankings: RankingStats | null
  notifications: NotificationStats | null
  sessions: ReviewSession[]
  health: SystemHealth | null
  storage: StorageUsage | null
}

const emptyDashboard: DashboardData = {
  overview: null,
  users: null,
  series: null,
  tasks: null,
  reviews: null,
  rankings: null,
  notifications: null,
  sessions: [],
  health: null,
  storage: null,
}

const roleLabels: Record<string, string> = {
  admin: 'Quản trị viên',
  mangaka: 'Mangaka',
  assistant: 'Trợ lý',
  editor: 'Biên tập viên',
  reviewer: 'Người đánh giá',
  reader: 'Độc giả',
  board: 'Hội đồng',
}

const seriesStatusLabels: Record<string, string> = {
  published: 'Đã xuất bản',
  approved: 'Đã duyệt',
  pending_review: 'Chờ duyệt',
  draft: 'Bản nháp',
  hidden: 'Đã ẩn',
  rejected: 'Từ chối',
  archived: 'Lưu trữ',
  banned: 'Bị cấm',
  deleted: 'Đã xóa',
}

const taskGroups = [
  { key: 'pending', label: 'Chờ xử lý', color: 'bg-slate-800' },
  { key: 'production', label: 'Đang thực hiện', color: 'bg-blue-500' },
  { key: 'review', label: 'Đang duyệt', color: 'bg-amber-400' },
  { key: 'completed', label: 'Hoàn tất', color: 'bg-emerald-500' },
  { key: 'attention', label: 'Cần chú ý', color: 'bg-manga-red' },
] as const

const seriesColors: Record<string, string> = {
  published: 'bg-emerald-500',
  approved: 'bg-cyan-500',
  pending_review: 'bg-amber-400',
  draft: 'bg-slate-500',
  hidden: 'bg-violet-500',
  rejected: 'bg-manga-red',
  archived: 'bg-gray-400',
}

const formatNumber = (value?: number | null) => (value ?? 0).toLocaleString('vi-VN')

const formatTime = (value?: string | null) => {
  if (!value) return 'Chưa có thời gian'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không xác định'
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const getErrorMessage = (error: unknown) => {
  const apiError = error as { response?: { data?: { message?: string } }; message?: string }
  return apiError.response?.data?.message || apiError.message || 'Không thể tải dữ liệu'
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: string
  helper: string
  icon: React.ComponentType<{ className?: string }>
  tone?: 'default' | 'warning' | 'success' | 'dark'
}) {
  const toneClass = {
    default: 'border-slate-200 bg-white text-slate-950',
    warning: 'border-amber-200 bg-amber-50 text-slate-950',
    success: 'border-emerald-200 bg-emerald-50 text-slate-950',
    dark: 'border-slate-900 bg-slate-900 text-white',
  }[tone]

  const iconClass = {
    default: 'bg-blue-50 text-blue-600',
    warning: 'bg-amber-200 text-amber-900',
    success: 'bg-emerald-200 text-emerald-900',
    dark: 'bg-white/10 text-white',
  }[tone]

  return (
    <div className={`min-h-[148px] border p-5 shadow-sm ${toneClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`text-xs font-bold uppercase ${tone === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
          <p className="mt-3 text-4xl font-black leading-none">{value}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className={`mt-5 text-sm font-medium ${tone === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{helper}</p>
    </div>
  )
}

function SectionTitle({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}

function LoadingDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[148px] border border-slate-200 bg-white p-5">
            <div className="h-3 w-28 bg-slate-200" />
            <div className="mt-5 h-9 w-20 bg-slate-200" />
            <div className="mt-5 h-3 w-full bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
        <div className="h-[440px] border border-slate-200 bg-white" />
        <div className="h-[440px] border border-slate-200 bg-white" />
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>(emptyDashboard)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    const requests = [
      adminDashboardService.getOverview(),
      adminDashboardService.getUserStats(),
      adminDashboardService.getSeriesStats(),
      adminDashboardService.getTaskStats(),
      adminDashboardService.getReviewStats(),
      adminDashboardService.getRankingStats(),
      adminDashboardService.getNotificationStats(),
      adminDashboardService.getLatestReviewSessions(),
      adminDashboardService.getSystemHealth(),
      adminDashboardService.getStorageUsage(),
    ] as const

    const results = await Promise.allSettled(requests)
    const failures = results
      .map((result, index) => (result.status === 'rejected' ? `Nguồn ${index + 1}: ${getErrorMessage(result.reason)}` : null))
      .filter((message): message is string => Boolean(message))

    setData((current) => ({
      overview: results[0].status === 'fulfilled' ? results[0].value : current.overview,
      users: results[1].status === 'fulfilled' ? results[1].value : current.users,
      series: results[2].status === 'fulfilled' ? results[2].value : current.series,
      tasks: results[3].status === 'fulfilled' ? results[3].value : current.tasks,
      reviews: results[4].status === 'fulfilled' ? results[4].value : current.reviews,
      rankings: results[5].status === 'fulfilled' ? results[5].value : current.rankings,
      notifications: results[6].status === 'fulfilled' ? results[6].value : current.notifications,
      sessions: results[7].status === 'fulfilled' ? results[7].value.data : current.sessions,
      health: results[8].status === 'fulfilled' ? results[8].value : current.health,
      storage: results[9].status === 'fulfilled' ? results[9].value : current.storage,
    }))
    setErrors(failures)
    setLastUpdated(new Date())
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const taskDistribution = useMemo(() => {
    const status = data.tasks?.by_status || {}
    return {
      pending: status.pending || 0,
      production: (status.assigned || 0) + (status.in_progress || 0),
      review: (status.submitted || 0) + (status.review || 0),
      completed: (status.approved || 0) + (status.completed || 0),
      attention: (status.needs_revision || 0) + (status.on_hold || 0) + (status.rejected || 0) + (status.cancelled || 0),
    }
  }, [data.tasks])

  const taskTotal = Math.max(data.tasks?.total || 0, 1)
  const roleEntries = Object.entries(data.users?.by_role || {}).sort(([, a], [, b]) => (b || 0) - (a || 0))
  const seriesEntries = Object.entries(data.series?.by_status || {}).sort(([, a], [, b]) => (b || 0) - (a || 0))
  const activeUsers = data.users?.by_status.active || 0
  const publishedSeries = data.series?.by_status.published || 0
  const completedTasks = (data.tasks?.by_status.completed || 0) + (data.tasks?.by_status.approved || 0)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Dữ liệu vận hành trực tiếp"
        title="Tổng quan hệ thống"
        description={
          lastUpdated
            ? `Cập nhật gần nhất lúc ${lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}.`
            : 'Đang tổng hợp dữ liệu từ hệ thống.'
        }
        action={
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        }
      />

      {errors.length > 0 && (
        <div className="flex items-start gap-3 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Một số nguồn dữ liệu chưa phản hồi.</p>
            <p className="mt-1 text-amber-800">{errors.join(' · ')}</p>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingDashboard />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Người dùng"
              value={formatNumber(data.overview?.total_users)}
              helper={`${formatNumber(activeUsers)} tài khoản đang hoạt động`}
              icon={Users}
            />
            <MetricCard
              label="Kho nội dung"
              value={formatNumber(data.overview?.total_series)}
              helper={`${formatNumber(publishedSeries)} series đã xuất bản · ${formatNumber(data.overview?.total_chapters)} chương`}
              icon={Layers3}
              tone="success"
            />
            <MetricCard
              label="Công việc"
              value={formatNumber(data.overview?.total_tasks)}
              helper={`${formatNumber(completedTasks)} hoàn tất · ${formatNumber(data.tasks?.overdue)} quá hạn`}
              icon={CheckCircle2}
              tone={data.tasks?.overdue ? 'warning' : 'default'}
            />
            <MetricCard
              label="Phiên đánh giá"
              value={formatNumber(data.overview?.active_review_sessions)}
              helper={`${formatNumber(data.reviews?.total)} phiên tổng cộng`}
              icon={Activity}
              tone="dark"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,0.75fr)]">
            <div className="space-y-6">
              <AdminTableFrame>
                <SectionTitle
                  title="Khối lượng công việc"
                  description="Phân bổ theo trạng thái page task hiện tại."
                  action={
                    <Link to="/dashboard/admin/tasks" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800">
                      Quản lý công việc <ArrowRight className="h-4 w-4" />
                    </Link>
                  }
                />
                <div className="p-5">
                  <div className="flex h-5 w-full overflow-hidden bg-slate-100" aria-label="Phân bổ trạng thái công việc">
                    {taskGroups.map((group) => {
                      const value = taskDistribution[group.key]
                      return value > 0 ? (
                        <div
                          key={group.key}
                          className={group.color}
                          style={{ width: `${(value / taskTotal) * 100}%` }}
                          title={`${group.label}: ${value}`}
                        />
                      ) : null
                    })}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 md:grid-cols-5">
                    {taskGroups.map((group) => (
                      <div key={group.key} className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 shrink-0 ${group.color}`} />
                          <p className="truncate text-xs font-bold text-slate-500">{group.label}</p>
                        </div>
                        <p className="mt-2 text-2xl font-black text-slate-950">{formatNumber(taskDistribution[group.key])}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3">
                    <div className="flex items-center gap-3 bg-slate-50 p-4">
                      <Clock3 className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500">Đang thực hiện</p>
                        <p className="mt-1 text-lg font-black">{formatNumber(taskDistribution.production)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-emerald-50 p-4">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold uppercase text-emerald-700">Đã hoàn tất</p>
                        <p className="mt-1 text-lg font-black">{formatNumber(completedTasks)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-red-50 p-4">
                      <TriangleAlert className="h-5 w-5 text-manga-red" />
                      <div>
                        <p className="text-xs font-bold uppercase text-red-700">Quá hạn</p>
                        <p className="mt-1 text-lg font-black">{formatNumber(data.tasks?.overdue)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AdminTableFrame>

              <AdminTableFrame>
                <SectionTitle
                  title="Luồng xuất bản series"
                  description="Số lượng series ở từng bước của quy trình nội dung."
                  action={
                    <Link to="/dashboard/admin/series" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800">
                      Xem series <ArrowRight className="h-4 w-4" />
                    </Link>
                  }
                />
                <div className="space-y-4 p-5">
                  {seriesEntries.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">Chưa có dữ liệu series.</p>
                  ) : (
                    seriesEntries.map(([status, count]) => {
                      const total = Math.max(data.series?.total || 0, 1)
                      return (
                        <div key={status} className="grid grid-cols-[110px_minmax(0,1fr)_38px] items-center gap-3 sm:grid-cols-[140px_minmax(0,1fr)_48px]">
                          <span className="truncate text-sm font-bold text-slate-700">{seriesStatusLabels[status] || status.replace(/_/g, ' ')}</span>
                          <div className="h-2.5 bg-slate-100">
                            <div
                              className={`h-full ${seriesColors[status] || 'bg-slate-700'}`}
                              style={{ width: `${((count || 0) / total) * 100}%` }}
                            />
                          </div>
                          <span className="text-right text-sm font-black text-slate-950">{formatNumber(count)}</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </AdminTableFrame>
            </div>

            <div className="space-y-6">
              <AdminTableFrame>
                <SectionTitle title="Tình trạng hệ thống" description="Kiểm tra trực tiếp kết nối database." />
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-4 border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-emerald-600" />
                      <div>
                        <p className="text-sm font-black text-emerald-950">
                          {data.health?.status === 'ok' ? 'Hệ thống hoạt động' : 'Chưa xác định'}
                        </p>
                        <p className="mt-1 text-xs text-emerald-700">Supabase/PostgreSQL</p>
                      </div>
                    </div>
                    <span className="h-3 w-3 bg-emerald-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-4">
                      <Gauge className="h-5 w-5 text-blue-600" />
                      <p className="mt-3 text-xs font-bold uppercase text-slate-500">Độ trễ DB</p>
                      <p className="mt-1 text-xl font-black">{formatNumber(data.health?.db_latency_ms)} ms</p>
                    </div>
                    <div className="bg-slate-50 p-4">
                      <Database className="h-5 w-5 text-violet-600" />
                      <p className="mt-3 text-xs font-bold uppercase text-slate-500">Tài nguyên file</p>
                      <p className="mt-1 text-xl font-black">
                        {formatNumber((data.storage?.manuscript_files.count || 0) + (data.storage?.page_versions.count || 0))}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Kiểm tra lúc {formatTime(data.health?.timestamp)}</p>
                </div>
              </AdminTableFrame>

              <AdminTableFrame>
                <SectionTitle title="Phân bổ người dùng" description="Theo vai trò đang lưu trong hệ thống." />
                <div className="divide-y divide-slate-100 px-5">
                  {roleEntries.map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between gap-4 py-3">
                      <span className="text-sm font-semibold text-slate-600">{roleLabels[role] || role}</span>
                      <div className="flex items-center gap-3">
                        <div className="hidden h-1.5 w-20 bg-slate-100 sm:block">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${((count || 0) / Math.max(data.users?.total || 0, 1)) * 100}%` }}
                          />
                        </div>
                        <span className="w-7 text-right text-sm font-black text-slate-950">{formatNumber(count)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminTableFrame>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-amber-200 bg-amber-50 p-4">
                  <BellRing className="h-5 w-5 text-amber-700" />
                  <p className="mt-3 text-2xl font-black">{formatNumber(data.notifications?.unread)}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-amber-800">Thông báo chưa đọc</p>
                </div>
                <div className="border border-blue-200 bg-blue-50 p-4">
                  <BookOpen className="h-5 w-5 text-blue-700" />
                  <p className="mt-3 text-2xl font-black">{formatNumber(data.rankings?.total_periods)}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-blue-800">Kỳ xếp hạng</p>
                </div>
              </div>
            </div>
          </div>

          <AdminTableFrame>
            <SectionTitle
              title="Phiên đánh giá gần đây"
              description="Các phiên mới nhất được trả về từ review_session."
              action={
                <Link to="/dashboard/admin/review-sessions" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800">
                  Xem tất cả <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            {data.sessions.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <FileStack className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-500">Chưa có phiên đánh giá.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
                      <th className="px-5 py-3">Phiên đánh giá</th>
                      <th className="px-5 py-3">Series / Chương</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3">Ngày tạo</th>
                      <th className="px-5 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sessions.map((session) => (
                      <tr key={session.session_id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-950">{session.name || 'Phiên chưa đặt tên'}</p>
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">{session.description || 'Không có mô tả'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">{session.series?.title || 'Series chưa tải'}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {session.chapter?.title || (session.chapter?.chapter_number ? `Chương ${session.chapter.chapter_number}` : 'Toàn bộ series')}
                          </p>
                        </td>
                        <td className="px-5 py-4"><AdminStatusBadge status={session.status} /></td>
                        <td className="px-5 py-4 text-sm text-slate-600">{formatTime(session.created_at)}</td>
                        <td className="px-5 py-4 text-right">
                          <Link to="/dashboard/admin/review-sessions" className="inline-flex h-9 items-center gap-1 px-3 text-sm font-bold text-blue-600 hover:bg-blue-50">
                            Mở <ArrowRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminTableFrame>
        </>
      )}
    </div>
  )
}
