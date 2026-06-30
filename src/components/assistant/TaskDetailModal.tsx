import React, { useState, useEffect } from 'react'
import {
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  MessageSquare,
  Paperclip,
  Loader2,
  AlertCircle,
  Play,
  Check,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import assistantService, { PageTaskDetail, AssistantSubmission } from '@/services/assistant.service'
import SubmissionForm from './SubmissionForm'
import FeedbackList from './FeedbackList'

interface TaskDetailModalProps {
  taskId: string
  onClose: () => void
  onStatusChanged?: () => void
}

export default function TaskDetailModal({ taskId, onClose, onStatusChanged }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'submissions' | 'feedbacks' | 'resources'>('info')
  const [taskDetail, setTaskDetail] = useState<PageTaskDetail | null>(null)
  const [submissions, setSubmissions] = useState<AssistantSubmission[]>([])
  
  // Status states
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmittingWorkflow, setIsSubmittingWorkflow] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showSubmitForm, setShowSubmitForm] = useState<boolean>(false)

  useEffect(() => {
    loadAllTaskDetails()
  }, [taskId])

  const loadAllTaskDetails = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const detail = await assistantService.getTaskDetail(taskId)
      setTaskDetail(detail)
      
      const subs = await assistantService.listTaskSubmissions(taskId)
      setSubmissions(subs || [])
    } catch (err: any) {
      console.error('Lỗi tải thông tin chi tiết nhiệm vụ:', err)
      setError('Không thể tải thông tin chi tiết nhiệm vụ.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartTask = async () => {
    if (!taskDetail) return
    setIsSubmittingWorkflow(true)
    try {
      const updated = await assistantService.startTask(taskId)
      setTaskDetail((prev) => prev ? { ...prev, status: updated.status } : null)
      if (onStatusChanged) onStatusChanged()
    } catch (err: any) {
      console.error('Lỗi nhận nhiệm vụ:', err)
      alert(err.response?.data?.message || 'Không thể nhận nhiệm vụ lúc này.')
    } finally {
      setIsSubmittingWorkflow(false)
    }
  }

  const handleHoldTask = async () => {
    if (!taskDetail) return
    setIsSubmittingWorkflow(true)
    try {
      const updated = await assistantService.holdTaskWorkflow(taskId)
      setTaskDetail((prev) => prev ? { ...prev, status: updated.status } : null)
      if (onStatusChanged) onStatusChanged()
    } catch (err: any) {
      console.error('Lỗi chuyển trạng thái:', err)
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái lúc này.')
    } finally {
      setIsSubmittingWorkflow(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <span className="bg-[#FFF5F5] text-[#E63946] border border-[#E63946] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">Khẩn cấp</span>
      case 'High':
        return <span className="bg-[#FFF5F5] text-[#E63946] border border-[#E63946]/55 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">Cao</span>
      case 'Medium':
        return <span className="bg-[#FFFDF0] text-[#D69E2E] border border-[#D69E2E]/55 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">Trung bình</span>
      case 'Low':
        return <span className="bg-gray-50 text-gray-500 border border-gray-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">Thấp</span>
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-[#E6FFFA] text-[#2A9D8F] border border-[#2A9D8F]/50 px-2 py-1 text-[10px] font-black uppercase tracking-wider">ĐÃ DUYỆT</span>
      case 'in_progress':
        return <span className="bg-[#EBF8FF] text-[#457B9D] border border-[#457B9D]/50 px-2 py-1 text-[10px] font-black uppercase tracking-wider">ĐANG LÀM</span>
      case 'submitted':
        return <span className="bg-[#FAF5FF] text-[#9F7AEA] border border-[#9F7AEA]/50 px-2 py-1 text-[10px] font-black uppercase tracking-wider">CHỜ DUYỆT</span>
      case 'needs_revision':
        return <span className="bg-[#FFF5F5] text-[#E63946] border border-[#E63946]/50 px-2 py-1 text-[10px] font-black uppercase tracking-wider">CẦN SỬA</span>
      case 'assigned':
        return <span className="bg-[#FFFDF0] text-[#D69E2E] border border-[#D69E2E]/50 px-2 py-1 text-[10px] font-black uppercase tracking-wider">CHỜ NHẬN</span>
      default:
        return <span className="bg-gray-100 text-gray-500 px-2 py-1 text-[10px] font-black uppercase tracking-wider">{status.toUpperCase()}</span>
    }
  }

  const formatDeadline = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const getTaskTypeName = (type: string) => {
    const maps: Record<string, string> = {
      inking: 'Line Art (Đi nét)',
      coloring: 'Coloring (Tô màu)',
      lettering: 'Lettering (Thoại & Chữ)',
      cleaning: 'Cleaning (Dọn trang)',
      sfx: 'SFX (Hiệu ứng âm thanh)',
      background: 'Background (Vẽ nền)'
    }
    return maps[type] || type.toUpperCase()
  }

  // Active submission for discussion
  const activeSubmission = submissions[0] // Sort default by descending usually, let's take the first one or latest

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-4 border-black w-full max-w-4xl shadow-[8px_8px_0px_rgba(0,0,0,1)] relative flex flex-col max-h-[90vh] font-sans">
        
        {/* Modal Header */}
        <div className="bg-[#1A1A1A] text-white p-4 border-b-4 border-black flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-manga text-xl font-bold uppercase tracking-wider">
                CHI TIẾT NHIỆM VỤ
              </h2>
              {taskDetail && getStatusBadge(taskDetail.status)}
            </div>
            {taskDetail?.page?.chapter?.series && (
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">
                {taskDetail.page.chapter.series.title} · {taskDetail.page.chapter.title} · Trang {taskDetail.page.page_number}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#E63946] hover:scale-110 transition-transform p-1 cursor-pointer"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-24 flex items-center justify-center flex-col gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#E63946]" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang kết nối dữ liệu nhiệm vụ...</span>
          </div>
        ) : error || !taskDetail ? (
          <div className="py-24 text-center text-[#E63946] flex flex-col items-center gap-3">
            <AlertCircle className="w-12 h-12 stroke-[2.5]" />
            <p className="font-bold uppercase text-sm">{error || 'Không tìm thấy thông tin nhiệm vụ'}</p>
            <button
              onClick={loadAllTaskDetails}
              className="mt-2 text-xs font-black underline hover:text-black uppercase"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navigation Tabs */}
            <div className="flex border-b-4 border-black overflow-x-auto">
              {(['info', 'submissions', 'feedbacks', 'resources'] as const).map((tab) => {
                const labelMap = {
                  info: 'THÔNG TIN CHUNG',
                  submissions: 'LỊCH SỬ NỘP BÀI',
                  feedbacks: 'PHẢN HỒI',
                  resources: 'TÀI LIỆU THAM KHẢO'
                }
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab)
                      setShowSubmitForm(false)
                    }}
                    className={`px-4 sm:px-6 py-3 text-[11px] sm:text-xs font-black uppercase tracking-wider border-r-2 border-black flex-shrink-0 transition-colors ${
                      activeTab === tab
                        ? 'bg-[#E63946] text-white'
                        : 'bg-white text-black hover:bg-gray-50'
                    }`}
                  >
                    {labelMap[tab]}
                  </button>
                )
              })}
            </div>

            {/* Tab Body Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-50">
              {showSubmitForm ? (
                <div className="flex justify-center py-4">
                  <SubmissionForm
                    taskId={taskId}
                    onCancel={() => setShowSubmitForm(false)}
                    onSuccess={() => {
                      setShowSubmitForm(false)
                      loadAllTaskDetails()
                      if (onStatusChanged) onStatusChanged()
                    }}
                  />
                </div>
              ) : activeTab === 'info' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left core details */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                      <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3 border-b border-gray-100 pb-1.5">
                        MÔ TẢ CÔNG VIỆC
                      </h3>
                      <p className="text-xs font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {taskDetail.content || taskDetail.description || 'Không có mô tả chi tiết cho nhiệm vụ này.'}
                      </p>
                    </div>

                    {/* Regions & Annotations if available */}
                    {taskDetail.annotations && taskDetail.annotations.length > 0 && (
                      <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#457B9D] mb-3 border-b border-gray-100 pb-1.5">
                          GHI CHÚ CHI TIẾT (ANNOTATIONS)
                        </h3>
                        <div className="space-y-3">
                          {taskDetail.annotations
                            .filter((annot: any) => !annot.task_id || annot.task_id === taskId)
                            .map((annot, i) => {
                              const isResolved = annot.status === 'resolved';
                              const hasCoordinates = annot.x !== undefined && annot.y !== undefined && annot.x !== null && annot.y !== null;
                              return (
                                <div key={annot.annotation_id || i} className="flex gap-2 items-start text-xs border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                  <ChevronRight className="w-4 h-4 text-[#457B9D] flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                      {isResolved ? (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                                          Đã sửa
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm text-[9px] font-extrabold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                                          Cần sửa
                                        </span>
                                      )}
                                      {hasCoordinates && (
                                        <span className="text-[10px] text-gray-500 font-bold">
                                          Điểm số {i + 1} (vị trí: {annot.x}%, {annot.y}%)
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-semibold text-gray-800 pr-2">
                                      {annot.note_text || annot.content}
                                    </p>
                                    {annot.created_at && (
                                      <span className="text-[9px] text-gray-400 font-bold uppercase block mt-0.5">
                                        {formatDeadline(annot.created_at)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Meta Column */}
                  <div className="space-y-6">
                    <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-wider text-black border-b border-gray-100 pb-1.5">
                        THÀNH PHẦN
                      </h3>
                      
                      <div className="space-y-3 text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Loại công việc</p>
                          <p className="font-black text-black">{getTaskTypeName(taskDetail.task_type)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Độ ưu tiên</p>
                          <div className="mt-1">{getPriorityBadge(taskDetail.priority)}</div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Hạn chót (Deadline)</p>
                          <p className="font-black text-black flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-4 h-4 text-gray-500" />
                            {formatDeadline(taskDetail.deadline)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Người giao việc</p>
                          <p className="font-black text-black">
                            {taskDetail.users?.name || taskDetail.users?.username || 'Mangaka chính'}
                          </p>
                          <p className="text-[10px] text-gray-500 font-semibold">{taskDetail.users?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Workflow Operations Panel */}
                    <div className="space-y-3">
                      {taskDetail.status === 'assigned' && (
                        <button
                          onClick={handleStartTask}
                          disabled={isSubmittingWorkflow}
                          className="w-full bg-[#2A9D8F] text-white border-2 border-black py-3 font-bold uppercase text-xs shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-white hover:text-[#2A9D8F] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white hover:fill-[#2A9D8F] stroke-[2]" />
                          NHẬN & BẮT ĐẦU LÀM
                        </button>
                      )}

                      {(taskDetail.status === 'in_progress' || taskDetail.status === 'needs_revision') && (
                        <>
                          <button
                            onClick={() => setShowSubmitForm(true)}
                            className="w-full bg-[#E63946] text-white border-2 border-black py-3 font-bold uppercase text-xs shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-white hover:text-[#E63946] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            NỘP LẠI BẢN VẼ MỚI
                          </button>

                          {taskDetail.status === 'in_progress' && (
                            <button
                              onClick={handleHoldTask}
                              disabled={isSubmittingWorkflow}
                              className="w-full bg-white text-black border-2 border-black py-2.5 font-bold uppercase text-xs shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-yellow-50 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              Yêu cầu tạm ngưng (Hold)
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeTab === 'submissions' ? (
                <div className="space-y-6">
                  {submissions.length === 0 ? (
                    <div className="bg-white border-2 border-black border-dashed p-12 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2 stroke-[1.5]" />
                      <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Chưa có bài nộp nào</p>
                      {(taskDetail.status === 'in_progress' || taskDetail.status === 'needs_revision') && (
                        <button
                          onClick={() => setShowSubmitForm(true)}
                          className="mt-3 bg-black text-white px-4 py-2 border-2 border-black text-xs font-bold uppercase hover:bg-white hover:text-black transition-colors"
                        >
                          Nộp ngay bản vẽ
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {submissions.map((sub, index) => (
                        <div key={sub.submission_id} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <span className="bg-black text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                                Lần nộp {submissions.length - index}
                              </span>
                              <span className={`text-[10px] font-black uppercase ${
                                sub.status === 'approved' ? 'text-green-600' : sub.status === 'needs_revision' ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {sub.status}
                              </span>
                            </div>

                            {/* Preview image */}
                            <div className="border border-black aspect-video bg-zinc-100 overflow-hidden mb-3">
                              <img
                                src={sub.file_url}
                                alt="Submission preview"
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            <p className="text-[11px] text-gray-700 italic leading-relaxed mb-3">
                              "{sub.submission_notes || 'Không có ghi chú kèm theo'}"
                            </p>
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDeadline(sub.created_at)}
                            </span>
                            <a
                              href={sub.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#457B9D] hover:underline text-[10px] font-black uppercase flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Tải tệp nguồn
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeTab === 'feedbacks' ? (
                <div className="max-w-2xl mx-auto">
                  {activeSubmission ? (
                    <FeedbackList submissionId={activeSubmission.submission_id} />
                  ) : (
                    <div className="bg-white border-2 border-black border-dashed p-12 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2 stroke-[1.5]" />
                      <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Chưa có bài nộp nào để thảo luận</p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">Phản hồi và thảo luận được tạo trên từng bản vẽ nộp.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-xs font-black uppercase tracking-wider text-black mb-4 border-b border-gray-100 pb-1.5">
                    HỒ SƠ TÀI NGUYÊN & PHIÊN BẢN TRANG TRUYỆN
                  </h3>

                  <div className="space-y-4">
                    {taskDetail.page?.image_url ? (
                      <div className="border-2 border-black p-3 bg-zinc-50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Paperclip className="w-5 h-5 text-gray-500 stroke-[2]" />
                          <div>
                            <p className="text-xs font-bold text-black">Ảnh trang truyện phác thảo</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Chapter Page Image File</p>
                          </div>
                        </div>
                        <a
                          href={taskDetail.page.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white hover:bg-zinc-50 text-black border-2 border-black px-3 py-1 font-black text-[10px] uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 cursor-pointer"
                        >
                          Xem ảnh
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-gray-400 uppercase text-center py-6">Không có tệp nguồn đính kèm từ Mangaka</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
