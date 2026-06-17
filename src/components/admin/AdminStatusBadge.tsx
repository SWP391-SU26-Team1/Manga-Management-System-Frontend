import React from 'react'

interface AdminStatusBadgeProps {
  status: string
}

const statusText: Record<string, string> = {
  active: 'Đang hoạt động',
  approved: 'Đã duyệt',
  published: 'Đã xuất bản',
  completed: 'Hoàn tất',
  finished: 'Đã đóng',
  pending_review: 'Chờ duyệt',
  pending: 'Chờ xử lý',
  review: 'Đang đánh giá',
  in_progress: 'Đang xử lý',
  paused: 'Tạm dừng',
  cancelled: 'Đã hủy',
  draft: 'Bản nháp',
  suspended: 'Tạm khóa',
  banned: 'Bị cấm',
  inactive: 'Ngừng hoạt động',
  hidden: 'Đã ẩn',
  rejected: 'Từ chối',
  needs_revision: 'Cần sửa gấp',
  submitted: 'Đã gửi',
  verified: 'Đã xác minh',
}

const getStatusClass = (status: string) => {
  if (['active', 'approved', 'published', 'completed', 'finished', 'verified'].includes(status)) {
    return 'bg-emerald-400 text-black'
  }
  if (['pending_review', 'pending', 'review', 'submitted'].includes(status)) {
    return 'bg-yellow-300 text-black'
  }
  if (['needs_revision', 'suspended', 'banned', 'hidden', 'rejected', 'cancelled'].includes(status)) {
    return 'bg-manga-red text-white'
  }
  if (['in_progress', 'paused'].includes(status)) {
    return 'bg-purple-400 text-black'
  }
  return 'bg-gray-300 text-black'
}

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase()

  return (
    <span className={`inline-flex items-center justify-center border-2 border-manga-ink px-3 py-1 text-xs font-black uppercase leading-none shadow-[3px_3px_0px_rgba(0,0,0,1)] ${getStatusClass(normalizedStatus)}`}>
      {statusText[normalizedStatus] || normalizedStatus.replace(/_/g, ' ')}
    </span>
  )
}
