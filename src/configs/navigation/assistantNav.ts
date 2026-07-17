import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  MessageSquare,
  PenTool,
  FileEdit
} from 'lucide-react'

export const assistantNav = [
  {
    label: "Trang Chủ",
    path: "/dashboard/assistant",
    icon: LayoutDashboard,
    exact: true
  },
  {
    label: "Nhiệm Vụ",
    path: "/dashboard/assistant/tasks",
    icon: ClipboardList
  },
  {
    label: "Báo Cáo",
    path: "/dashboard/assistant/reports",
    icon: FileText
  },
  {
    label: "Phản Hồi",
    path: "/dashboard/assistant/feedback",
    icon: MessageSquare
  },
  {
    label: "Bản nháp vẽ",
    path: "/dashboard/assistant/drawing?filter=local_drafts",
    icon: FileEdit
  },
  {
    label: "Vẽ & Chỉnh Sửa",
    path: "/dashboard/assistant/drawing-studio",
    icon: PenTool
  }
]
