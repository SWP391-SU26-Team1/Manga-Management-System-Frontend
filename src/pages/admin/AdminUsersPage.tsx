import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Ban,
  Calendar,
  Edit3,
  Eye,
  KeyRound,
  Mail,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
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
import {
  adminUsersService,
  type CreateUserPayload,
  type ListUsersParams,
  type UpdateUserPayload,
} from '@/services/admin/adminUsers.service'
import type { PaginationMeta, User, UserRole, UserStatus } from '@/services/admin/admin.types'

const USER_ROLES: UserRole[] = ['admin', 'mangaka', 'assistant', 'editor', 'board', 'reviewer', 'reader']
const USER_STATUSES: UserStatus[] = ['active', 'suspended', 'banned', 'inactive']
const STATUS_TABS = ['Tất cả trạng thái', 'Đang hoạt động', 'Tạm khóa', 'Bị cấm', 'Ngừng hoạt động']
const DEFAULT_LIMIT = 10

const roleLabel: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  mangaka: 'Tác giả',
  assistant: 'Trợ lý',
  editor: 'Biên tập viên',
  board: 'Hội đồng',
  reviewer: 'Người đánh giá',
  reader: 'Độc giả',
}

const statusLabel: Record<UserStatus, string> = {
  active: 'Đang hoạt động',
  suspended: 'Tạm khóa',
  banned: 'Bị cấm',
  inactive: 'Ngừng hoạt động',
}

const statusTabToFilter: Record<string, StatusFilter> = {
  'Tất cả trạng thái': 'all',
  'Đang hoạt động': 'active',
  'Tạm khóa': 'suspended',
  'Bị cấm': 'banned',
  'Ngừng hoạt động': 'inactive',
}

type RoleFilter = 'all' | UserRole
type StatusFilter = 'all' | UserStatus
type Feedback = { type: 'success' | 'error'; message: string } | null
type UserFormState = {
  username: string
  email: string
  password: string
  role: UserRole
  status: UserStatus
  name: string
  avatar_url: string
  bio: string
  gender: string
  date_of_birth: string
}

const emptyPagination: PaginationMeta = {
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 1,
}

const emptyForm: UserFormState = {
  username: '',
  email: '',
  password: '',
  role: 'editor',
  status: 'active',
  name: '',
  avatar_url: '',
  bio: '',
  gender: '',
  date_of_birth: '',
}

const inputClass =
  'w-full border-2 border-manga-ink bg-white px-4 py-3 text-sm font-bold outline-none focus:shadow-[3px_3px_0_rgba(232,23,63,1)]'
const labelClass = 'mb-2 block text-xs font-black uppercase tracking-widest text-gray-600'
const iconButtonClass =
  'flex h-11 w-11 items-center justify-center border-2 border-manga-ink bg-white shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_rgba(0,0,0,1)]'

const formatDate = (date?: string | null) => {
  if (!date) return 'N/A'

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return 'N/A'

  return parsedDate.toLocaleDateString('vi-VN', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

const getInitials = (user: User) => {
  const source = user.name || user.username || user.email
  return source
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const normalizeStatusTab = (tab: string): StatusFilter => {
  return statusTabToFilter[tab] || 'all'
}

const statusTabLabel = (status: StatusFilter) => {
  if (status === 'all') return 'Tất cả trạng thái'
  return statusLabel[status]
}

const getErrorMessage = (error: unknown) => {
  const apiError = error as { response?: { data?: { message?: string } }; message?: string }
  return apiError.response?.data?.message || apiError.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
}

const optionalValue = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const toFormState = (user?: User): UserFormState => {
  if (!user) return emptyForm

  return {
    username: user.username || '',
    email: user.email || '',
    password: '',
    role: user.role,
    status: user.status,
    name: user.name || '',
    avatar_url: user.avatar_url || '',
    bio: user.bio || '',
    gender: user.gender || '',
    date_of_birth: user.date_of_birth ? user.date_of_birth.slice(0, 10) : '',
  }
}

const roleBadgeClass = (role: UserRole) => {
  if (role === 'admin') return 'bg-blue-100 text-blue-700'
  if (role === 'editor' || role === 'board') return 'bg-purple-100 text-purple-700'
  if (role === 'mangaka' || role === 'assistant') return 'bg-emerald-100 text-emerald-700'
  return 'bg-gray-100 text-gray-700'
}

interface UserModalProps {
  mode: 'create' | 'edit'
  form: UserFormState
  user?: User | null
  saving: boolean
  onChange: (field: keyof UserFormState, value: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function UserModal({ mode, form, user, saving, onChange, onClose, onSubmit }: UserModalProps) {
  const isCreate = mode === 'create'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto border-2 border-manga-ink bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between border-b-2 border-manga-ink bg-[#282828] px-6 py-5 text-white">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-manga-red">
              {isCreate ? 'Tạo tài khoản' : `Chỉnh sửa ${user?.username || 'người dùng'}`}
            </p>
            <h2 className="font-manga text-3xl font-black uppercase">
              {isCreate ? 'Thêm người dùng mới' : 'Cập nhật quyền truy cập'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center border-2 border-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label>
              <span className={labelClass}>Tên đăng nhập</span>
              <input
                value={form.username}
                onChange={(event) => onChange('username', event.target.value)}
                className={inputClass}
                required
              />
            </label>
            <label>
              <span className={labelClass}>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => onChange('email', event.target.value)}
                className={inputClass}
                required
              />
            </label>
            <label>
              <span className={labelClass}>Tên hiển thị</span>
              <input
                value={form.name}
                onChange={(event) => onChange('name', event.target.value)}
                className={inputClass}
              />
            </label>
            <label>
              <span className={labelClass}>{isCreate ? 'Mật khẩu' : 'Mật khẩu mới'}</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => onChange('password', event.target.value)}
                className={inputClass}
                required={isCreate}
                placeholder={isCreate ? '' : 'Để trống nếu giữ mật khẩu hiện tại'}
              />
            </label>
            <label>
              <span className={labelClass}>Vai trò</span>
              <select
                value={form.role}
                onChange={(event) => onChange('role', event.target.value)}
                className={inputClass}
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel[role]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={labelClass}>Trạng thái</span>
              <select
                value={form.status}
                onChange={(event) => onChange('status', event.target.value)}
                className={inputClass}
              >
                {USER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel[status]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={labelClass}>Đường dẫn ảnh đại diện</span>
              <input
                value={form.avatar_url}
                onChange={(event) => onChange('avatar_url', event.target.value)}
                className={inputClass}
              />
            </label>
            <label>
              <span className={labelClass}>Ngày sinh</span>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(event) => onChange('date_of_birth', event.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label>
            <span className={labelClass}>Tiểu sử</span>
            <textarea
              value={form.bio}
              onChange={(event) => onChange('bio', event.target.value)}
              className={`${inputClass} min-h-28 resize-y`}
            />
          </label>

          <div className="flex flex-col gap-3 border-t-2 border-manga-ink pt-6 sm:flex-row sm:justify-end">
            <AdminButton type="button" variant="white" onClick={onClose}>
              Hủy
            </AdminButton>
            <AdminButton type="submit" icon={isCreate ? UserPlus : Save} disabled={saving}>
              {saving ? 'Đang lưu...' : isCreate ? 'Tạo người dùng' : 'Lưu thay đổi'}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  )
}

interface UserDetailsModalProps {
  user: User
  loading: boolean
  onClose: () => void
}

function UserDetailsModal({ user, loading, onClose }: UserDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl border-2 border-manga-ink bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between border-b-2 border-manga-ink bg-[#282828] px-6 py-5 text-white">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-manga-red">Chi tiết người dùng</p>
            <h2 className="font-manga text-3xl font-black uppercase">{user.username}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center border-2 border-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[180px_1fr]">
          <div className="flex flex-col items-center gap-4">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="h-32 w-32 border-2 border-manga-ink object-cover" />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center border-2 border-manga-ink bg-manga-red font-manga text-5xl font-black text-white">
                {getInitials(user)}
              </div>
            )}
            <AdminStatusBadge status={user.status} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="border-2 border-manga-ink p-4">
              <p className="text-xs font-black uppercase text-gray-500">Email</p>
              <p className="mt-2 font-bold">{user.email}</p>
            </div>
            <div className="border-2 border-manga-ink p-4">
              <p className="text-xs font-black uppercase text-gray-500">Vai trò</p>
              <p className="mt-2 font-black uppercase">{roleLabel[user.role]}</p>
            </div>
            <div className="border-2 border-manga-ink p-4">
              <p className="text-xs font-black uppercase text-gray-500">Họ tên</p>
              <p className="mt-2 font-bold">{user.name || 'N/A'}</p>
            </div>
            <div className="border-2 border-manga-ink p-4">
              <p className="text-xs font-black uppercase text-gray-500">Ngày tham gia</p>
              <p className="mt-2 font-bold">{formatDate(user.created_at)}</p>
            </div>
            <div className="border-2 border-manga-ink p-4">
              <p className="text-xs font-black uppercase text-gray-500">Giới tính</p>
              <p className="mt-2 font-bold">{user.gender || 'N/A'}</p>
            </div>
            <div className="border-2 border-manga-ink p-4">
              <p className="text-xs font-black uppercase text-gray-500">Ngày sinh</p>
              <p className="mt-2 font-bold">{formatDate(user.date_of_birth)}</p>
            </div>
            <div className="border-2 border-manga-ink p-4 md:col-span-2">
              <p className="text-xs font-black uppercase text-gray-500">Tiểu sử</p>
              <p className="mt-2 font-semibold text-gray-700">{user.bio || 'Chưa có tiểu sử.'}</p>
            </div>
          </div>
        </div>
        {loading && (
          <div className="border-t-2 border-manga-ink px-6 py-4 text-sm font-black uppercase text-manga-red">
            Đang tải lại chi tiết...
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination)
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionUserId, setActionUserId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<UserFormState>(emptyForm)
  const [detailUser, setDetailUser] = useState<User | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setFeedback(null)

    const params: ListUsersParams = {
      page,
      limit: DEFAULT_LIMIT,
      sort: 'created_at',
      order: sortOrder,
      keyword: keyword || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }

    try {
      const response = await adminUsersService.list(params)
      setUsers(response.data)
      setPagination(response.pagination)
    } catch (error) {
      setUsers([])
      setPagination(emptyPagination)
      setFeedback({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setLoading(false)
    }
  }, [keyword, page, roleFilter, sortOrder, statusFilter])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const pageStats = useMemo(() => {
    return {
      active: users.filter((user) => user.status === 'active').length,
      admins: users.filter((user) => user.role === 'admin').length,
      disabled: users.filter((user) => user.status !== 'active').length,
    }
  }, [users])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
    setKeyword(keywordInput.trim())
  }

  const resetFilters = () => {
    setKeywordInput('')
    setKeyword('')
    setRoleFilter('all')
    setStatusFilter('all')
    setSortOrder('desc')
    setPage(1)
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setIsFormOpen(true)
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setForm(toFormState(user))
    setIsFormOpen(true)
  }

  const closeFormModal = () => {
    if (saving) return
    setIsFormOpen(false)
    setEditingUser(null)
    setForm(emptyForm)
  }

  const updateForm = (field: keyof UserFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmitUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      if (editingUser) {
        const body: UpdateUserPayload = {
          username: form.username.trim(),
          email: form.email.trim(),
          name: optionalValue(form.name),
          avatar_url: optionalValue(form.avatar_url),
          bio: optionalValue(form.bio),
          gender: optionalValue(form.gender),
          date_of_birth: optionalValue(form.date_of_birth),
        }

        if (form.password.trim()) {
          body.password = form.password
        }

        await adminUsersService.update(editingUser.user_id, body)

        if (form.role !== editingUser.role) {
          await adminUsersService.updateRole(editingUser.user_id, form.role)
        }

        if (form.status !== editingUser.status) {
          await adminUsersService.updateStatus(editingUser.user_id, form.status)
        }

        setFeedback({ type: 'success', message: 'Cập nhật người dùng thành công.' })
      } else {
        const body: CreateUserPayload = {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          status: form.status,
          name: optionalValue(form.name),
          avatar_url: optionalValue(form.avatar_url),
          bio: optionalValue(form.bio),
          gender: optionalValue(form.gender),
          date_of_birth: optionalValue(form.date_of_birth),
        }

        await adminUsersService.create(body)
        setFeedback({ type: 'success', message: 'Tạo người dùng thành công.' })
      }

      setIsFormOpen(false)
      setEditingUser(null)
      setForm(emptyForm)
      await loadUsers()
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  const handleRoleChange = async (user: User, role: UserRole) => {
    if (role === user.role) return

    setActionUserId(user.user_id)
    setFeedback(null)
    try {
      await adminUsersService.updateRole(user.user_id, role)
      setUsers((current) => current.map((item) => (item.user_id === user.user_id ? { ...item, role } : item)))
      setFeedback({ type: 'success', message: `Đã đổi vai trò của ${user.username} thành ${roleLabel[role]}.` })
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setActionUserId(null)
    }
  }

  const handleStatusChange = async (user: User, status: UserStatus) => {
    if (status === user.status) return

    setActionUserId(user.user_id)
    setFeedback(null)
    try {
      await adminUsersService.updateStatus(user.user_id, status)
      setUsers((current) => current.map((item) => (item.user_id === user.user_id ? { ...item, status } : item)))
      setFeedback({ type: 'success', message: `Đã đổi trạng thái của ${user.username} thành ${statusLabel[status]}.` })
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setActionUserId(null)
    }
  }

  const handleSoftDelete = async (user: User) => {
    const confirmed = window.confirm(`Vô hiệu hóa tài khoản ${user.username}? Tài khoản sẽ chuyển sang ngừng hoạt động.`)
    if (!confirmed) return

    setActionUserId(user.user_id)
    setFeedback(null)
    try {
      await adminUsersService.delete(user.user_id)
      setUsers((current) =>
        current.map((item) => (item.user_id === user.user_id ? { ...item, status: 'inactive' } : item)),
      )
      setFeedback({ type: 'success', message: `Đã vô hiệu hóa ${user.username}.` })
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setActionUserId(null)
    }
  }

  const openUserDetails = async (user: User) => {
    setDetailUser(user)
    setDetailLoading(true)

    try {
      const detail = await adminUsersService.getById(user.user_id)
      setDetailUser(detail)
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setDetailLoading(false)
    }
  }

  const showingStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const showingEnd = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Quản lý quyền truy cập và tài khoản sáng tạo trong không gian sản xuất."
        action={<AdminButton icon={UserPlus} onClick={openCreateModal}>Thêm người dùng</AdminButton>}
      />

      {feedback && (
        <div
          className={`flex items-start gap-3 border-2 border-manga-ink px-5 py-4 text-sm font-black shadow-[4px_4px_0_rgba(0,0,0,1)] ${
            feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-manga-red'
          }`}
        >
          {feedback.type === 'success' ? <UserCheck className="mt-0.5 h-5 w-5" /> : <AlertCircle className="mt-0.5 h-5 w-5" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Tổng người dùng" value={pagination.total.toLocaleString()} helper="Theo bộ lọc hiện tại" icon={Users} accent="green" />
        <AdminStatCard label="Đang hoạt động" value={pageStats.active} helper="Người dùng hoạt động trên trang này" icon={UserCheck} accent="green" />
        <AdminStatCard label="Quản trị viên" value={pageStats.admins} helper="Tài khoản có quyền cao trên trang này" icon={ShieldCheck} />
        <AdminStatCard label="Bị vô hiệu hóa" value={pageStats.disabled} helper="Tạm khóa, bị cấm hoặc ngừng hoạt động" icon={Ban} dark />
      </div>

      <AdminTableFrame>
        <div className="space-y-5 border-b-2 border-manga-ink p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <AdminFilters
              tabs={STATUS_TABS}
              activeTab={statusTabLabel(statusFilter)}
              onTabChange={(tab) => {
                setStatusFilter(normalizeStatusTab(tab))
                setPage(1)
              }}
            />
            <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row">
              <div className="relative min-w-0 md:w-80">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  value={keywordInput}
                  onChange={(event) => setKeywordInput(event.target.value)}
                  placeholder="Tìm email hoặc tên đăng nhập..."
                  className={`${inputClass} pl-12`}
                />
              </div>
              <AdminButton type="submit" icon={Search} disabled={loading}>
                Tìm kiếm
              </AdminButton>
            </form>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="min-w-48">
                <span className={labelClass}>Vai trò</span>
                <select
                  value={roleFilter}
                  onChange={(event) => {
                    setRoleFilter(event.target.value as RoleFilter)
                    setPage(1)
                  }}
                  className={inputClass}
                >
                  <option value="all">TẤT CẢ VAI TRÒ</option>
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {roleLabel[role]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="min-w-48">
                <span className={labelClass}>Sắp xếp</span>
                <select
                  value={sortOrder}
                  onChange={(event) => {
                    setSortOrder(event.target.value as 'asc' | 'desc')
                    setPage(1)
                  }}
                  className={inputClass}
                >
                  <option value="desc">MỚI NHẤT TRƯỚC</option>
                  <option value="asc">CŨ NHẤT TRƯỚC</option>
                </select>
              </label>
            </div>
            <div className="flex gap-3">
              <AdminButton type="button" variant="white" icon={RefreshCw} onClick={loadUsers} disabled={loading}>
                Tải lại
              </AdminButton>
              <AdminButton type="button" variant="dark" icon={X} onClick={resetFilters}>
                Xóa lọc
              </AdminButton>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left">
            <thead className="bg-[#282828] text-white">
              <tr className="text-sm font-black uppercase">
                <th className="border-r-2 border-black px-8 py-5">Hồ sơ người dùng</th>
                <th className="border-r-2 border-black px-7 py-5">Email liên hệ</th>
                <th className="border-r-2 border-black px-7 py-5">Vai trò</th>
                <th className="border-r-2 border-black px-7 py-5">Trạng thái</th>
                <th className="px-7 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center font-black uppercase text-gray-500">
                    Đang tải người dùng...
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center font-black uppercase text-gray-500">
                    Không có người dùng phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((user) => {
                  const isBusy = actionUserId === user.user_id

                  return (
                    <tr key={user.user_id} className="border-b-2 border-manga-ink last:border-b-0">
                      <td className="border-r-2 border-manga-ink px-8 py-6">
                        <div className="flex items-center gap-4">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username}
                              className="h-12 w-12 border-2 border-manga-ink object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center border-2 border-manga-ink bg-manga-red text-sm font-black text-white">
                              {getInitials(user)}
                            </div>
                          )}
                          <div>
                            <p className="font-black">{user.name || user.username}</p>
                            <p className="text-xs font-black uppercase text-gray-400">Tham gia {formatDate(user.created_at)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-r-2 border-manga-ink px-7 py-6">
                        <div className="flex items-center gap-3 font-semibold">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {user.email}
                        </div>
                        <p className="mt-2 text-xs font-black uppercase text-gray-400">ID: {user.user_id}</p>
                      </td>
                      <td className="border-r-2 border-manga-ink px-7 py-6">
                        <div className="space-y-3">
                          <span className={`inline-flex border-2 border-manga-ink px-3 py-1 text-xs font-black uppercase ${roleBadgeClass(user.role)}`}>
                            {roleLabel[user.role]}
                          </span>
                          <select
                            value={user.role}
                            disabled={isBusy}
                            onChange={(event) => handleRoleChange(user, event.target.value as UserRole)}
                            className="w-full border-2 border-manga-ink bg-white px-3 py-2 text-xs font-black uppercase"
                          >
                            {USER_ROLES.map((role) => (
                              <option key={role} value={role}>
                                {roleLabel[role]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="border-r-2 border-manga-ink px-7 py-6">
                        <div className="space-y-3">
                          <AdminStatusBadge status={user.status} />
                          <select
                            value={user.status}
                            disabled={isBusy}
                            onChange={(event) => handleStatusChange(user, event.target.value as UserStatus)}
                            className="w-full border-2 border-manga-ink bg-white px-3 py-2 text-xs font-black uppercase"
                          >
                            {USER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {statusLabel[status]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-7 py-6">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            aria-label={`Xem ${user.username}`}
                            onClick={() => openUserDetails(user)}
                            className={`${iconButtonClass} bg-[#282828] text-white`}
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Sửa ${user.username}`}
                            onClick={() => openEditModal(user)}
                            className={iconButtonClass}
                          >
                            <Edit3 className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Vô hiệu hóa ${user.username}`}
                            disabled={isBusy || user.status === 'inactive'}
                            onClick={() => handleSoftDelete(user)}
                            className={`${iconButtonClass} ${user.status === 'inactive' ? 'border-gray-300 text-gray-300 shadow-none' : 'bg-manga-red text-white'}`}
                          >
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

        <div className="flex flex-col gap-4 border-t-2 border-manga-ink px-8 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-black uppercase">
            Hiển thị {showingStart}-{showingEnd} trong tổng số {pagination.total.toLocaleString()} người dùng
          </p>
          <AdminPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            disabled={loading}
          />
        </div>
      </AdminTableFrame>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="border-2 border-manga-ink bg-[#282828] p-8 text-white shadow-[8px_8px_0_rgba(232,23,63,1)]">
          <h2 className="font-manga text-3xl font-black uppercase">Quyền hệ thống toàn cục</h2>
          <p className="mt-4 max-w-2xl font-semibold text-gray-300">
            Admin có thể tạo tài khoản, cập nhật mật khẩu, đổi vai trò, kiểm soát trạng thái và vô hiệu hóa người dùng bằng soft delete.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="border-2 border-white p-4">
              <KeyRound className="mb-4 h-6 w-6 text-manga-red" />
              <p className="text-xs font-black uppercase text-gray-300">Cập nhật mật khẩu</p>
            </div>
            <div className="border-2 border-white p-4">
              <ShieldCheck className="mb-4 h-6 w-6 text-manga-red" />
              <p className="text-xs font-black uppercase text-gray-300">Gán vai trò</p>
            </div>
            <div className="border-2 border-white p-4">
              <Calendar className="mb-4 h-6 w-6 text-manga-red" />
              <p className="text-xs font-black uppercase text-gray-300">Vòng đời trạng thái</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center border-2 border-manga-ink bg-white p-8 text-center shadow-[6px_6px_0_rgba(0,0,0,1)]">
          <div className="mb-5 flex h-20 w-20 items-center justify-center border-2 border-manga-ink bg-manga-red text-white shadow-[5px_5px_0_rgba(0,0,0,1)]">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <p className="font-black uppercase">Kiểm soát truy cập</p>
          <p className="font-manga text-5xl font-black text-manga-red">7</p>
          <p className="mt-3 text-xs font-black uppercase text-gray-400">7 endpoint người dùng đã sẵn sàng cho thao tác admin</p>
        </div>
      </div>

      {isFormOpen && (
        <UserModal
          mode={editingUser ? 'edit' : 'create'}
          form={form}
          user={editingUser}
          saving={saving}
          onChange={updateForm}
          onClose={closeFormModal}
          onSubmit={handleSubmitUser}
        />
      )}

      {detailUser && (
        <UserDetailsModal
          user={detailUser}
          loading={detailLoading}
          onClose={() => setDetailUser(null)}
        />
      )}
    </div>
  )
}
