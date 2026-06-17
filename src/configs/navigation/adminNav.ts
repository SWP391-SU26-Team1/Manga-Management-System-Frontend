import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  FileText,
  Layers3,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Users,
  Vote,
} from 'lucide-react'

export const adminNav = [
  {
    label: 'Dashboard',
    path: '/dashboard/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Users',
    path: '/dashboard/admin/users',
    icon: Users,
  },
  {
    label: 'Series',
    path: '/dashboard/admin/series',
    icon: Layers3,
  },
  {
    label: 'Chapters',
    path: '/dashboard/admin/chapters',
    icon: BookOpen,
  },
  {
    label: 'Pages',
    path: '/dashboard/admin/pages',
    icon: FileText,
  },
  {
    label: 'Tasks',
    path: '/dashboard/admin/tasks',
    icon: ClipboardList,
  },
  {
    label: 'Review Sessions',
    path: '/dashboard/admin/review-sessions',
    icon: MessageSquareText,
  },
  {
    label: 'Votes',
    path: '/dashboard/admin/votes',
    icon: Vote,
  },
  {
    label: 'Rankings',
    path: '/dashboard/admin/rankings',
    icon: BarChart3,
  },
  {
    label: 'Notifications',
    path: '/dashboard/admin/notifications',
    icon: Bell,
  },
  {
    label: 'Settings',
    path: '/dashboard/admin/settings',
    icon: Settings,
  },
]
