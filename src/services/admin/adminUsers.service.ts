import api from '@/services/api'
import { adminDelete, adminGet, adminPatch, adminPost } from './adminApi'
import type { ApiListResponse, PaginationMeta, User, UserRole, UserStatus } from './admin.types'

export type ListUsersParams = {
  role?: UserRole
  status?: UserStatus
  keyword?: string
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export type CreateUserPayload = {
  username: string
  email: string
  password: string
  role: UserRole
  name?: string
  avatar_url?: string
  bio?: string
  gender?: string
  date_of_birth?: string
  status?: UserStatus
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'role'>> & {
  role?: UserRole
}

type UserListData =
  | User[]
  | {
      users?: User[]
      items?: User[]
      results?: User[]
      pagination?: PaginationMeta
      total?: number
      page?: number
      limit?: number
      totalPages?: number
    }

type RawUserListResponse =
  | ApiListResponse<User>
  | {
      success?: boolean
      message?: string
      data?: UserListData
      users?: User[]
      pagination?: PaginationMeta
      total?: number
      page?: number
      limit?: number
      totalPages?: number
    }
  | User[]

const USERS_ENDPOINT = '/api/users'

const buildPagination = (
  total: number,
  params?: ListUsersParams,
  partial?: Partial<PaginationMeta>,
): PaginationMeta => {
  const page = partial?.page ?? params?.page ?? 1
  const limit = partial?.limit ?? params?.limit ?? 10
  const safeTotal = partial?.total ?? total

  return {
    page,
    limit,
    total: safeTotal,
    totalPages: partial?.totalPages ?? Math.max(1, Math.ceil(safeTotal / limit)),
  }
}

const normalizeUsersList = (
  payload: RawUserListResponse,
  params?: ListUsersParams,
): ApiListResponse<User> => {
  if (Array.isArray(payload)) {
    return {
      success: true,
      message: '',
      data: payload,
      pagination: buildPagination(payload.length, params),
    }
  }

  const envelope = payload as {
    success?: boolean
    message?: string
    data?: UserListData
    users?: User[]
    pagination?: PaginationMeta
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }

  const nestedData = envelope.data

  if (Array.isArray(nestedData)) {
    return {
      success: envelope.success ?? true,
      message: envelope.message ?? '',
      data: nestedData,
      pagination:
        envelope.pagination ??
        buildPagination(nestedData.length, params, {
          total: envelope.total,
          page: envelope.page,
          limit: envelope.limit,
          totalPages: envelope.totalPages,
        }),
    }
  }

  const users = nestedData?.users ?? nestedData?.items ?? nestedData?.results ?? envelope.users ?? []
  const pagination =
    envelope.pagination ??
    nestedData?.pagination ??
    buildPagination(users.length, params, {
      total: envelope.total ?? nestedData?.total,
      page: envelope.page ?? nestedData?.page,
      limit: envelope.limit ?? nestedData?.limit,
      totalPages: envelope.totalPages ?? nestedData?.totalPages,
    })

  return {
    success: envelope.success ?? true,
    message: envelope.message ?? '',
    data: users,
    pagination,
  }
}

export const adminUsersService = {
  list: async (params?: ListUsersParams) => {
    const response = await api.get<RawUserListResponse>(USERS_ENDPOINT, { params })
    return normalizeUsersList(response.data, params)
  },
  getById: (userId: string) => adminGet<User>(`${USERS_ENDPOINT}/${userId}`),
  create: (body: CreateUserPayload) => adminPost<User, CreateUserPayload>(USERS_ENDPOINT, body),
  update: (userId: string, body: UpdateUserPayload) =>
    adminPatch<User, UpdateUserPayload>(`${USERS_ENDPOINT}/${userId}`, body),
  updateStatus: (userId: string, status: UserStatus) =>
    adminPatch<User>(`${USERS_ENDPOINT}/${userId}/status`, { status }),
  updateRole: (userId: string, role: UserRole) =>
    adminPatch<User>(`${USERS_ENDPOINT}/${userId}/role`, { role }),
  delete: (userId: string) => adminDelete(`${USERS_ENDPOINT}/${userId}`),
}
