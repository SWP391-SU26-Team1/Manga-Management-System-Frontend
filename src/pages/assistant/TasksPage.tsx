import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useToast } from '@/contexts/ToastContext'
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload,
  X,
  Search,
  FileDown,
  Edit2,
  Eye,
  ChevronDown,
  Paperclip,
  Check,
  FolderOpen,
  MessageSquare
} from 'lucide-react'
import { assistantStore, AssistantTask } from '@/data/assistantMockData'

export default function TasksPage() {
  const [tasks, setTasks] = useState<AssistantTask[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'PENDING' | 'REVIEW' | 'REVISION' | 'APPROVED'>('ALL')
  const [sortBy, setSortBy] = useState<'deadline' | 'id'>('deadline')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Submit drawing modal state
  const [selectedTask, setSelectedTask] = useState<AssistantTask | null>(null)
  const [fileName, setFileName] = useState('')
  const [submitNote, setSubmitNote] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const { showToast } = useToast()

  // New Modals state
  const [downloadTask, setDownloadTask] = useState<AssistantTask | null>(null)
  const [workspaceTask, setWorkspaceTask] = useState<AssistantTask | null>(null)
  const [checklistStates, setChecklistStates] = useState<Record<string, boolean[]>>({})
  const [progressNotes, setProgressNotes] = useState<Record<string, string>>({})

  const loadTasks = () => {
    setTasks(assistantStore.getTasks())
  }

  useEffect(() => {
    loadTasks()
  }, [])

  // Dynamic statistics based on current database state
  const totalCount = tasks.length
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length
  const pendingCount = tasks.filter(t => t.status === 'Not Started').length
  const reviewCount = tasks.filter(t => t.status === 'Submitted').length
  const revisionCount = tasks.filter(t => t.status === 'Need Fix').length
  const approvedCount = tasks.filter(t => t.status === 'Approved').length

  // Filter tasks based on search and status
  const filteredTasks = tasks.filter((task) => {
    // Search match
    const matchesSearch =
      task.id.includes(searchTerm) ||
      task.seriesTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.layerType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.note.toLowerCase().includes(searchTerm.toLowerCase())

    // Status match
    if (statusFilter === 'ALL') return matchesSearch
    if (statusFilter === 'IN_PROGRESS') return matchesSearch && task.status === 'In Progress'
    if (statusFilter === 'PENDING') return matchesSearch && task.status === 'Not Started'
    if (statusFilter === 'REVIEW') return matchesSearch && task.status === 'Submitted'
    if (statusFilter === 'REVISION') return matchesSearch && task.status === 'Need Fix'
    if (statusFilter === 'APPROVED') return matchesSearch && task.status === 'Approved'
    return false
  })

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    }
    return a.id.localeCompare(b.id)
  })

  // Paginated tasks
  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTasks = sortedTasks.slice(startIndex, startIndex + itemsPerPage)

  const handleOpenSubmit = (task: AssistantTask) => {
    setSelectedTask(task)
    setFileName(`${task.layerType.toLowerCase().replace(' ', '_')}_ch${task.chapterNumber}_p${task.pageNumber}_draft.png`)
    setSubmitNote('')
    setPreviewUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop')
  }

  const handleSubmitDraw = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask) return

    setIsSubmitting(true)

    // Simulate server response
    setTimeout(() => {
      assistantStore.addSubmission({
        taskId: selectedTask.id,
        seriesTitle: selectedTask.seriesTitle,
        chapterNumber: selectedTask.chapterNumber,
        pageNumber: selectedTask.pageNumber,
        layerType: selectedTask.layerType,
        fileName: fileName,
        previewUrl: previewUrl,
        note: submitNote,
      })

      setIsSubmitting(false)
      setSelectedTask(null)
      showToast(`Đã nộp thành công bản vẽ cho ${selectedTask.seriesTitle} (Chương ${selectedTask.chapterNumber})!`)
      loadTasks()
    }, 800)
  }

  // Format date display dd/mm/yyyy
  const formatDateString = (dateStr: string) => {
    return dateStr.split('-').reverse().join('/')
  }

  // Status Badge Mapper
  const renderStatusBadge = (status: AssistantTask['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-300 text-emerald-600 bg-emerald-50/50 uppercase tracking-wide">
            APPROVED
          </span>
        )
      case 'In Progress':
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded border border-blue-300 text-blue-600 bg-blue-50/50 uppercase tracking-wide">
            IN PROGRESS
          </span>
        )
      case 'Submitted':
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded border border-purple-300 text-purple-600 bg-purple-50/50 uppercase tracking-wide">
            REVIEW
          </span>
        )
      case 'Need Fix':
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded border border-red-300 text-[#E63946] bg-red-50/50 uppercase tracking-wide">
            REVISION
          </span>
        )
      case 'Not Started':
      default:
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-300 text-amber-600 bg-amber-50/50 uppercase tracking-wide">
            PENDING
          </span>
        )
    }
  }

  // Priority Dot Mapper
  const renderPriority = (priority: AssistantTask['priority']) => {
    switch (priority) {
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            THẤP
          </span>
        )
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            TRUNG BÌNH
          </span>
        )
      case 'High':
      case 'Urgent':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E63946]" />
            CAO
          </span>
        )
    }
  }

  const handleDownloadFile = (task: AssistantTask) => {
    setDownloadTask(task)
  }

  const handleDownloadAll = (task: AssistantTask) => {
    showToast(`Đang chuẩn bị nén toàn bộ tài nguyên cho Task #${task.id}...`)
  }

  const toggleChecklistItem = (taskId: string, index: number) => {
    const current = checklistStates[taskId] || [false, false, false, false, false, false]
    const updated = [...current]
    updated[index] = !updated[index]
    setChecklistStates(prev => ({ ...prev, [taskId]: updated }))
  }

  const checklistItems = [
    'Đọc kỹ brief & yêu cầu nhiệm vụ',
    'Tải đầy đủ file nguồn & tài nguyên',
    'Hoàn thành phần việc chính',
    'Tự kiểm tra chất lượng',
    'Chuẩn bị file nộp đúng định dạng',
    'Viết ghi chú mô tả thay đổi'
  ]

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-gray-900">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-xs font-extrabold text-[#E63946] hover:text-black transition-colors uppercase mb-3 bg-transparent border-0 p-0 cursor-pointer"
      >
        &larr; Quay lại
      </button>

      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">
            DANH SÁCH NHIỆM VỤ
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Quản lý và theo dõi tất cả nhiệm vụ được giao
          </p>
        </div>

        {/* Outline "+ NHIỆM VỤ MỚI" Button */}
        <button
          onClick={() => showToast('Chức năng tạo nhiệm vụ dành cho Mangaka/Sensei.')}
          className="border border-dashed border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 transition-all font-bold px-4 py-2 text-xs flex items-center gap-1.5 uppercase tracking-wide"
        >
          <Clock className="w-4 h-4" />
          <span>Nhiệm vụ mới</span>
        </button>
      </div>

      {/* Statistics boxes row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        {[
          { count: totalCount, label: 'Tổng nhiệm vụ', color: 'text-gray-900' },
          { count: inProgressCount, label: 'Đang thực hiện', color: 'text-blue-600' },
          { count: pendingCount, label: 'Chờ xử lý', color: 'text-amber-600' },
          { count: revisionCount, label: 'Cần sửa đổi', color: 'text-[#E63946]' },
          { count: approvedCount, label: 'Đã duyệt', color: 'text-emerald-600' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white border-2 border-black rounded-none p-4 shadow-xs flex items-center gap-4">
            <span className={`text-3xl font-black ${item.color}`}>
              {item.count}
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider leading-tight">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Filter and Search Action bar */}
      <div className="bg-white border-2 border-black rounded-none p-4 shadow-sm mb-6 flex flex-col lg:flex-row justify-between items-center gap-4">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Tìm Task ID, manga, loại..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#E63946] focus:bg-white font-sans text-gray-700 bg-gray-50/50"
          />
        </div>

        {/* Middle: Status filters */}
        <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto w-full lg:w-auto justify-start lg:justify-center whitespace-nowrap scrollbar-none">
          <span className="text-xs font-bold text-gray-400 uppercase mr-1">Trạng thái:</span>
          {[
            { filter: 'ALL', label: 'TẤT CẢ', count: totalCount },
            { filter: 'IN_PROGRESS', label: 'IN PROGRESS', count: inProgressCount },
            { filter: 'PENDING', label: 'PENDING', count: pendingCount },
            { filter: 'REVIEW', label: 'REVIEW', count: reviewCount },
            { filter: 'REVISION', label: 'REVISION', count: revisionCount },
            { filter: 'APPROVED', label: 'APPROVED', count: approvedCount },
          ].map((tab) => (
            <button
              key={tab.filter}
              onClick={() => {
                setStatusFilter(tab.filter as any)
                setCurrentPage(1)
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all whitespace-nowrap ${
                statusFilter === tab.filter
                  ? 'bg-[#E63946] text-white shadow-xs'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Right: Sorting selection */}
        <div className="relative w-full lg:w-auto flex justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="appearance-none pl-3 pr-8 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#E63946] font-bold text-gray-600 bg-white cursor-pointer"
          >
            <option value="deadline">Deadline (gần nhất)</option>
            <option value="id">Mã nhiệm vụ (ID)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Main Tasks Table */}
      <div className="bg-white border-2 border-black rounded-none shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white text-[10px] font-black uppercase tracking-wider border-b-2 border-black">
                <th className="py-4 px-6 text-center text-white">TASK ID</th>
                <th className="py-4 px-6 text-white">MANGA TITLE</th>
                <th className="py-4 px-6 text-white">LOẠI NHIỆM VỤ</th>
                <th className="py-4 px-6 text-white">DEADLINE</th>
                <th className="py-4 px-6 text-white">TRẠNG THÁI</th>
                <th className="py-4 px-6 text-white">ƯU TIÊN</th>
                <th className="py-4 px-6 text-white text-center">TÀI NGUYÊN</th>
                <th className="py-4 px-6 text-white text-center">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm font-semibold text-gray-700">
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400 font-bold">
                    <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                    Không tìm thấy nhiệm vụ nào phù hợp!
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* Task ID */}
                    <td className="py-4 px-6 text-center font-bold text-[#E63946]">
                      #{task.id}
                    </td>

                    {/* Manga Title */}
                    <td className="py-4 px-6 font-extrabold text-gray-900">
                      {task.seriesTitle}
                    </td>

                    {/* Task Type / Layer Type */}
                    <td className="py-4 px-6 text-gray-500 font-medium">
                      {task.layerType} Ch.{task.chapterNumber}
                    </td>

                    {/* Deadline */}
                    <td className="py-4 px-6 text-gray-500 text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {formatDateString(task.deadline)}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-6">
                      {renderStatusBadge(task.status)}
                    </td>

                    {/* Priority dot */}
                    <td className="py-4 px-6">
                      {renderPriority(task.priority)}
                    </td>

                    {/* Resources */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDownloadFile(task)}
                        className="bg-zinc-800 text-white font-extrabold text-[9px] px-2.5 py-1.5 rounded uppercase tracking-wider flex items-center gap-1 mx-auto hover:bg-zinc-950 transition-colors"
                      >
                        <FileDown className="w-3 h-3" />
                        Tải File
                      </button>
                    </td>

                    {/* Action button layout */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col gap-1 w-24 mx-auto">
                        <div className="flex gap-1 justify-center">
                          {/* Edit button */}
                          <button
                            onClick={() => setWorkspaceTask(task)}
                            className="p-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-500 transition-all flex-1 flex justify-center cursor-pointer"
                            title="Sửa"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          
                          {/* View button */}
                          <button
                            onClick={() => showToast(`Ghi chú Sensei: "${task.note}"`)}
                            className="p-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-500 transition-all flex-1 flex justify-center"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Status change actions */}
                        {task.status === 'Approved' ? (
                          <span className="w-full flex items-center justify-center gap-1 border border-emerald-500 bg-emerald-500 text-white rounded py-1 text-[9px] font-extrabold tracking-wider uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            DONE
                          </span>
                        ) : task.status === 'Submitted' ? (
                          <span className="w-full flex items-center justify-center gap-1 border border-purple-500 bg-purple-500 text-white rounded py-1 text-[9px] font-extrabold tracking-wider uppercase">
                            <Clock className="w-3 h-3 animate-pulse" />
                            Chờ kết
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenSubmit(task)}
                            className="w-full flex items-center justify-center gap-1 border border-red-500 bg-[#E63946] text-white rounded py-1 text-[9px] font-extrabold tracking-wider uppercase hover:bg-red-600 transition-colors shadow-xs"
                          >
                            <Upload className="w-3 h-3" />
                            Nộp
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-gray-50 border-t border-gray-100 py-3.5 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400">
            <div>
              Hiển thị <span className="text-gray-900">{startIndex + 1} - {Math.min(startIndex + itemsPerPage, sortedTasks.length)}</span> / <span className="text-gray-900">{sortedTasks.length}</span> nhiệm vụ
            </div>
            
            <div className="flex items-center gap-1">
              {/* Prev page button */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="w-7 h-7 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                &lt;
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded border text-[11px] font-bold flex items-center justify-center transition-all ${
                    currentPage === i + 1
                      ? 'bg-[#E63946] border-[#E63946] text-white'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              {/* Next page button */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="w-7 h-7 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Drawing Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 w-full max-w-lg rounded-xl shadow-xl overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="bg-zinc-900 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-sm uppercase tracking-wider">
                Nộp bản vẽ: {selectedTask.seriesTitle}
              </h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitDraw} className="p-6 space-y-4">
              <div className="bg-red-50/50 border-l-4 border-[#E63946] p-3 text-[10px] text-[#E63946] font-extrabold uppercase rounded-r">
                Chương {selectedTask.chapterNumber} • Trang {selectedTask.pageNumber} • Lớp {selectedTask.layerType}
              </div>

              {/* File Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Tên File</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E63946] font-sans text-xs bg-white text-gray-800"
                />
              </div>

              {/* Preview image selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Bản vẽ xem trước (Url ảnh)</label>
                <select
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E63946] font-bold text-xs bg-white text-gray-600 cursor-pointer"
                >
                  <option value="https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=600&auto=format&fit=crop">
                    Phác thảo thư viện (Nền)
                  </option>
                  <option value="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop">
                    Nét vẽ nhân vật (Line Art)
                  </option>
                  <option value="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop">
                    Hiệu ứng SFX/Bóng mờ
                  </option>
                  <option value="https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop">
                    Nền rừng rậm âm u (Background)
                  </option>
                </select>
              </div>

              {/* Preview image render */}
              <div className="border border-dashed border-gray-200 p-2 text-center bg-gray-50/50 flex items-center justify-center h-32 overflow-hidden rounded-lg">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview drawing" className="h-full object-contain rounded" />
                ) : (
                  <span className="text-gray-400 text-xs">Vui lòng chọn ảnh bản vẽ</span>
                )}
              </div>

              {/* Note for Mangaka */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Ghi chú gửi Sensei</label>
                <textarea
                  value={submitNote}
                  onChange={(e) => setSubmitNote(e.target.value)}
                  placeholder="Ví dụ: Em đã chỉnh sửa độ sắc nét ở bối cảnh xa theo ý Sensei..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E63946] font-sans text-xs bg-white text-gray-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-xs font-bold uppercase"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#E63946] text-white text-xs font-bold px-6 py-2 rounded-lg hover:bg-red-600 transition-all shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang nộp...' : 'Xác nhận nộp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TẢI NGUYÊN & FILE NGUỒN Modal */}
      {downloadTask && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-zinc-800 w-full max-w-xl shadow-xl overflow-hidden animate-zoom-in rounded-none">
            {/* Modal Header */}
            <div className="bg-[#1c1c1f] p-5 text-white flex justify-between items-start border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-black text-[#E63946] uppercase tracking-wider block">
                  TẢI NGUYÊN & FILE NGUỒN
                </span>
                <h3 className="font-extrabold text-lg leading-tight mt-1 text-white">
                  Task #{downloadTask.id} — {downloadTask.layerType}
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1">
                  {downloadTask.seriesTitle} • Hạn nộp: {formatDateString(downloadTask.deadline)}
                </p>
              </div>
              <button
                onClick={() => setDownloadTask(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 bg-white">
              {/* Attachment summary bar */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-[#E63946]" />
                  2 file đính kèm
                </span>
                <span className="text-xs font-bold text-gray-400 mr-auto ml-2">Tổng ~12 MB</span>
                <button
                  onClick={() => showToast('Đang tải xuống tất cả các tài nguyên liên quan...')}
                  className="bg-[#E63946] text-white font-extrabold text-[10px] px-4 py-2 hover:bg-red-600 transition-colors uppercase tracking-wider flex items-center gap-1.5 border border-[#E63946] rounded-none cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Tải tất cả
                </button>
              </div>

              {/* Download cards list */}
              <div className="space-y-6">
                {/* Category 1: Reference Docs */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[#f97316]">
                    <span>— TÀI LIỆU THAM KHẢO</span>
                    <span className="text-gray-400 font-bold lowercase">1 file</span>
                  </div>
                  <div className="border border-gray-200 p-4 bg-gray-50 flex justify-between items-center rounded-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 text-[#E63946] border border-red-200 flex items-center justify-center font-extrabold text-[10px] uppercase rounded">
                        PDF
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-900">
                          {downloadTask.seriesTitle.slice(0, 2).toUpperCase()}_world_setting.pdf
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                          Tài liệu thế giới quan {downloadTask.seriesTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 font-bold">3.4 MB</span>
                      <button
                        onClick={() => showToast(`Đang tải tài liệu tham khảo cho ${downloadTask.seriesTitle}...`)}
                        className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-extrabold text-[9px] px-3 py-1.5 uppercase tracking-wide flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Tải xuống
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category 2: Script / Briefs */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[#E63946]">
                    <span>— SCRIPT / KỊCH BẢN</span>
                    <span className="text-gray-400 font-bold lowercase">1 file</span>
                  </div>
                  <div className="border border-gray-200 p-4 bg-gray-50 flex justify-between items-center rounded-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 text-[#E63946] border border-red-200 flex items-center justify-center font-extrabold text-[10px] uppercase rounded">
                        PDF
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-900">
                          {downloadTask.seriesTitle.slice(0, 2).toUpperCase()}_Vol{downloadTask.chapterNumber}_char_brief.pdf
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                          Brief thiết kế character sheet {downloadTask.layerType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 font-bold">8.3 MB</span>
                      <button
                        onClick={() => showToast(`Đang tải kịch bản chi tiết cho ${downloadTask.seriesTitle}...`)}
                        className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-extrabold text-[9px] px-3 py-1.5 uppercase tracking-wide flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Tải xuống
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-bold">
                File được gắn kèm bởi Mangaka / Editor - Giao ngày 15/04/2026
              </span>
              <button
                onClick={() => setDownloadTask(null)}
                className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-extrabold text-xs px-5 py-2 uppercase transition-all rounded-none cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE — TASK Workspace Modal */}
      {workspaceTask && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border-2 border-zinc-800 w-full max-w-4xl shadow-2xl overflow-hidden animate-zoom-in my-8 rounded-none">
            {/* Modal Header */}
            <div className="bg-[#1c1c1f] p-5 text-white flex justify-between items-start border-b border-zinc-800">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#E63946] flex items-center justify-center rounded-none shadow-sm flex-shrink-0 text-white">
                  <Edit2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black text-[#E63946] uppercase tracking-wider block">
                      WORKSPACE — TASK #{workspaceTask.id}
                    </span>
                    <span className="bg-emerald-600/10 text-emerald-600 border border-emerald-400/30 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                      {workspaceTask.status === 'Approved' ? 'ĐÃ DUYỆT' : workspaceTask.status.toUpperCase()}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block ml-1" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{workspaceTask.priority}</span>
                  </div>
                  <h3 className="font-extrabold text-2xl leading-none mt-2 text-white">
                    {workspaceTask.layerType}
                  </h3>
                  <p className="text-xs font-bold text-zinc-400 mt-1.5 flex items-center gap-1.5">
                    <span>{workspaceTask.seriesTitle}</span>
                    <span className="text-zinc-600">&gt;</span>
                    <Clock className="w-3.5 h-3.5 text-[#E63946]" />
                    <span className="text-[#E63946]">Hạn nộp: {formatDateString(workspaceTask.deadline)}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWorkspaceTask(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Task progress percentage section */}
            <div className="bg-zinc-50 border-b border-gray-200 px-6 py-3.5 flex items-center justify-between gap-4">
              <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                TIẾN ĐỘ CÔNG VIỆC
              </span>
              <div className="flex-1 max-w-md bg-gray-200 h-2.5 rounded-full overflow-hidden border border-gray-300">
                <div
                  className="bg-[#E63946] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((checklistStates[workspaceTask.id] || [false, false, false, false, false, false]).filter(Boolean).length / 6) * 100}%`
                  }}
                />
              </div>
              <span className="text-xs font-black text-amber-600">
                {(checklistStates[workspaceTask.id] || [false, false, false, false, false, false]).filter(Boolean).length}/6 • {Math.round(((checklistStates[workspaceTask.id] || [false, false, false, false, false, false]).filter(Boolean).length / 6) * 100)}%
              </span>
            </div>

            {/* Body 2-Column layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x border-b border-gray-200 bg-white">
              {/* Left Column Checklist (5 cols) */}
              <div className="md:col-span-5 p-6 space-y-4 bg-white">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                    CHECKLIST CÔNG VIỆC
                  </h4>
                  <span className="text-[10px] font-bold text-gray-400">
                    {workspaceTask.layerType}
                  </span>
                </div>

                <div className="space-y-2">
                  {checklistItems.map((item, idx) => {
                    const isChecked = (checklistStates[workspaceTask.id] || [false, false, false, false, false, false])[idx]
                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                          isChecked ? 'bg-red-50/10 border-red-100' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleChecklistItem(workspaceTask.id, idx)}
                          className="w-4 h-4 text-[#E63946] border-gray-300 focus:ring-[#E63946] cursor-pointer"
                        />
                        <span className={`text-xs font-bold ${isChecked ? 'text-gray-900 line-through decoration-gray-400' : 'text-gray-700'}`}>
                          {item}
                        </span>
                      </label>
                    )
                  })}
                </div>

                {/* Left column buttons */}
                <div className="pt-4 space-y-2 border-t border-gray-100">
                  <button
                    onClick={() => setDownloadTask(workspaceTask)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1c1c1f] text-white hover:bg-zinc-800 font-extrabold text-[10px] tracking-wider uppercase transition-colors border border-black rounded-none cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4 text-white" />
                    MỞ TÀI NGUYÊN & FILE NGUỒN
                  </button>
                  <button
                    onClick={() => {
                      setWorkspaceTask(null)
                      navigate('/dashboard/assistant/feedback')
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-gray-800 hover:bg-red-50/50 font-extrabold text-[10px] tracking-wider uppercase transition-colors border-2 border-black rounded-none cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-gray-800" />
                    XEM PHẢN HỒI TỪ MANGAKA
                  </button>
                </div>
              </div>

              {/* Right Column Notes & Details (7 cols) */}
              <div className="md:col-span-7 p-6 space-y-4 bg-white">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                    GHI CHÚ TIẾN ĐỘ
                  </h4>
                  <button
                    onClick={() => alert('Đã lưu ghi chú tiến độ thành công!')}
                    className="border border-gray-200 hover:bg-gray-50 text-gray-600 rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Lưu ghi chú
                  </button>
                </div>

                {/* Notes guide section - read-only */}
                <div className="p-3 bg-zinc-50 border border-gray-200 text-gray-500 rounded text-xs select-none">
                  <span className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wide block mb-1">Ví dụ ghi chú:</span>
                  <p className="leading-relaxed text-[11px] font-semibold">
                    — Đã hoàn thành lineart trang 1-4, đang xử lý trang 5
                    <br />— Biểu cảm panel 3 cần chỉnh lại theo ref Akira gửi
                    <br />— Dự kiến hoàn thành trước 01/06/2026
                  </p>
                </div>

                {/* Notes Editor text area - for writing only */}
                <textarea
                  value={progressNotes[workspaceTask.id] || ''}
                  onChange={(e) => setProgressNotes(prev => ({ ...prev, [workspaceTask.id]: e.target.value }))}
                  placeholder="Nhập ghi chú tiến độ công việc thực tế của bạn tại đây..."
                  rows={5}
                  className="w-full p-4 border border-gray-200 focus:outline-none focus:border-[#E63946] text-xs font-sans text-gray-700 leading-relaxed bg-white rounded-none"
                />

                {/* Project details card */}
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Manga</span>
                    <span className="text-xs font-extrabold text-gray-900 mt-1 block truncate">
                      {workspaceTask.seriesTitle}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Loại nhiệm vụ</span>
                    <span className="text-xs font-extrabold text-gray-900 mt-1 block truncate">
                      {workspaceTask.layerType}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Ngày giao</span>
                    <span className="text-xs font-extrabold text-gray-900 mt-1 block">
                      15/04/2026
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                Còn {6 - ((checklistStates[workspaceTask.id] || [false, false, false, false, false, false]).filter(Boolean).length)} hạng mục chưa xong
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setWorkspaceTask(null)}
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-extrabold text-xs px-5 py-2 uppercase transition-all rounded-none cursor-pointer"
                >
                  Đóng
                </button>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-300 rounded font-black text-xs px-4 py-2 uppercase flex items-center gap-1.5 tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {workspaceTask.status === 'Approved' ? 'Đã được duyệt' : 'Đang thực hiện'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
