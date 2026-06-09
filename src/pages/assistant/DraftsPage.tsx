import React, { useState, useEffect } from 'react'
import { FileEdit, Upload, Clock, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react'
import { assistantStore, AssistantTask, AssistantSubmission } from '@/data/assistantMockData'

export default function DraftsPage() {
  const [tasks, setTasks] = useState<AssistantTask[]>([])
  const [submissions, setSubmissions] = useState<AssistantSubmission[]>([])
  const [selectedTask, setSelectedTask] = useState<AssistantTask | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const allTasks = assistantStore.getTasks()
    const inProgressTasks = allTasks.filter(t => t.status === 'In Progress' || t.status === 'Not Started' || t.status === 'Need Fix')
    setTasks(inProgressTasks)
    setSubmissions(assistantStore.getSubmissions())
  }, [])

  const handleOpenSubmit = (task: AssistantTask) => {
    setSelectedTask(task)
    setNoteText(task.note || '')
    setShowUploadModal(true)
  }

  const handleCloseModal = () => {
    setShowUploadModal(false)
    setSelectedTask(null)
    setNoteText('')
  }

  const handleSubmit = () => {
    if (!selectedTask) return
    assistantStore.addSubmission({
      taskId: selectedTask.id,
      seriesTitle: selectedTask.seriesTitle,
      chapterNumber: selectedTask.chapterNumber,
      pageNumber: selectedTask.pageNumber,
      layerType: selectedTask.layerType,
      previewUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
      fileName: `draft_${selectedTask.seriesTitle.replace(/\s+/g, '_').toLowerCase()}_ch${selectedTask.chapterNumber}_p${selectedTask.pageNumber}.png`,
      note: noteText,
    })
    // Refresh
    const allTasks = assistantStore.getTasks()
    const inProgressTasks = allTasks.filter(t => t.status === 'In Progress' || t.status === 'Not Started' || t.status === 'Need Fix')
    setTasks(inProgressTasks)
    setSubmissions(assistantStore.getSubmissions())
    setSuccessMsg(`Đã nộp bản nháp cho "${selectedTask.seriesTitle} Ch.${selectedTask.chapterNumber}"!`)
    handleCloseModal()
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'text-blue-700 bg-blue-50 border-blue-300'
      case 'Need Fix': return 'text-red-700 bg-red-50 border-red-300'
      case 'Not Started': return 'text-gray-600 bg-gray-50 border-gray-300'
      default: return 'text-gray-600 bg-gray-50 border-gray-300'
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">BẢN NHÁP</h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3" />
          <p className="text-sm font-medium text-gray-500 mt-2">Các nhiệm vụ đang thực hiện — sẵn sàng để nộp bản vẽ.</p>
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border-2 border-green-500 p-4 mb-6 manga-shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="font-bold text-green-800 text-sm">{successMsg}</p>
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
          <FileEdit className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Không có bản nháp đang thực hiện</h3>
          <p className="text-sm text-gray-400 mt-2 font-medium">Tất cả nhiệm vụ đã được nộp hoặc hoàn thành.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white border-2 border-manga-ink manga-shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group hover:manga-shadow transition-shadow">
              {task.status === 'Need Fix' && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />}
              {task.status === 'In Progress' && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />}
              {task.status === 'Not Started' && <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-300" />}

              <div className="flex-1 ml-3">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className="text-xs font-bold text-gray-400">#{task.id}</span>
                </div>
                <h3 className="font-bold text-manga-ink mb-1">
                  {task.seriesTitle} — Chương {task.chapterNumber}, Trang {task.pageNumber}
                </h3>
                <p className="text-xs font-medium text-gray-600 mb-1">
                  <span className="font-bold">Loại layer:</span> {task.layerType}
                </p>
                <p className="text-xs text-gray-500 italic line-clamp-2">{task.note}</p>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  Hạn chót: <span className={new Date(task.deadline) < new Date() ? 'text-red-500' : ''}>{task.deadline}</span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={() => handleOpenSubmit(task)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-manga-ink text-white font-bold text-sm border-2 border-manga-ink hover:bg-manga-red transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Nộp bản vẽ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-manga-ink w-full max-w-md manga-shadow overflow-hidden">
            {/* Modal header */}
            <div className="bg-manga-ink text-white px-6 py-4 flex items-center justify-between">
              <h2 className="font-manga text-lg font-bold uppercase">Nộp bản vẽ</h2>
              <button onClick={handleCloseModal} className="hover:text-manga-red transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 flex flex-col gap-4">
              <div className="bg-gray-50 border-2 border-manga-ink p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Nhiệm vụ</p>
                <p className="font-bold text-manga-ink">{selectedTask.seriesTitle}</p>
                <p className="text-sm text-gray-600">Chương {selectedTask.chapterNumber} · Trang {selectedTask.pageNumber} · {selectedTask.layerType}</p>
              </div>

              {/* File upload area */}
              <div className="border-2 border-dashed border-manga-ink p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-500">Nhấn để chọn file hoặc kéo thả vào đây</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, PSD (tối đa 50MB)</p>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Ghi chú (tùy chọn)</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-manga-ink p-3 text-sm font-medium resize-none focus:outline-none focus:border-manga-red transition-colors"
                  placeholder="Nhập ghi chú cho họa sĩ chính..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border-2 border-manga-ink font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 bg-manga-red text-white border-2 border-manga-ink font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Nộp ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
