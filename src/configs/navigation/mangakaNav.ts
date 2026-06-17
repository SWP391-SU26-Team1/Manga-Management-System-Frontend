import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Clock,
  BarChart2,
  MessageCircle,
  Bell,
  BookOpen,
  PlusSquare
} from 'lucide-react'

export const mangakaNav = [
  { label: 'Trang Chủ', path: '/dashboard/mangaka', icon: LayoutDashboard },
  { label: 'Series của tôi', path: '/dashboard/mangaka/series', icon: BookOpen },
  { label: 'Tạo chapter mới', path: '/dashboard/mangaka/create-series', icon: PlusSquare },
  { label: 'Quản lý Chapter', path: '/dashboard/mangaka/manuscripts', icon: FileText },
  { label: 'Giao việc trợ lý', path: '/dashboard/mangaka/assign-task', icon: ClipboardList },
  { label: 'Duyệt kết quả', path: '/dashboard/mangaka/submission', icon: Clock },
  { label: 'Xếp hạng & Cảnh báo', path: '/dashboard/mangaka/ranking', icon: BarChart2 },
  { label: 'Nhận xét từ Editor', path: '/dashboard/mangaka/feedback', icon: MessageCircle },
  { label: 'Thông báo', path: '/dashboard/mangaka/notifications', icon: Bell },
]
