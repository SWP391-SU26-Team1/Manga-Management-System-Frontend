import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Layers3,
  LayoutDashboard,
  MessageSquareText,
  Users,
  Vote,
} from 'lucide-react'

export const adminNav = [
  { label: 'Tổng quan', path: '/dashboard/admin', icon: LayoutDashboard, exact: true },
  { label: 'Người dùng', path: '/dashboard/admin/users', icon: Users },
  { label: 'Series', path: '/dashboard/admin/series', icon: Layers3 },
  { label: 'Chương', path: '/dashboard/admin/chapters', icon: BookOpen },
  { label: 'Công việc', path: '/dashboard/admin/tasks', icon: ClipboardList },
  { label: 'Phiên đánh giá', path: '/dashboard/admin/review-sessions', icon: MessageSquareText },
  { label: 'Bình chọn', path: '/dashboard/admin/votes', icon: Vote },
  { label: 'Xếp hạng', path: '/dashboard/admin/rankings', icon: BarChart3 },
]
