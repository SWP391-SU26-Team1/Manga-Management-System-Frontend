import React, { useState, useEffect } from 'react'
import { GitBranch, Check, Clock, AlertTriangle, ArrowRight, X, Plus, Users, Vote, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { editorService, ApiReviewSession, ApiPageTask } from '@/services/editor.service'

interface DisplayWorkflow {
  id: string
  series: string
  chapter: string
  submitDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING'
  taskStatus: string
}

interface DisplaySession {
  id: string
  title: string
  time: string
  description: string
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED'
  seriesName?: string
  chapterName?: string
}

const getFriendlyWorkflowStatus = (status: string) => {
  switch (status) {
    case 'PENDING': return 'ĐANG CHỜ'
    case 'APPROVED': return 'ĐÃ DUYỆT'
    case 'REJECTED': return 'ĐÃ TỪ CHỐI'
    case 'WAITING': return 'ĐANG CHỜ'
    default: return status
  }
}

const getFriendlySessionStatus = (status: string) => {
  switch (status) {
    case 'UPCOMING': return 'SẮP DIỄN RA'
    case 'ACTIVE': return 'ĐANG DIỄN RA'
    case 'COMPLETED': return 'ĐÃ KẾT THÚC'
    default: return status
  }
}

export default function ApprovalWorkflowPage() {
  const [workflows, setWorkflows] = useState<DisplayWorkflow[]>([])
  const [selectedItem, setSelectedItem] = useState<DisplayWorkflow | null>(null)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [sessions, setSessions] = useState<DisplaySession[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modals and notifications
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  
  // Form states for creating session
  const [sessionName, setSessionName] = useState('')
  const [sessionDescription, setSessionDescription] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch review tasks and review sessions in parallel
      const [tasksRes, sessionsRes] = await Promise.all([
        editorService.getEditorReviewTasks(),
        editorService.getReviewSessions(),
      ])

      // Map tasks to workflows
      const tasksData = tasksRes.data || tasksRes
      const tasksList: ApiPageTask[] = Array.isArray(tasksData) 
        ? tasksData 
        : (tasksData.data || tasksData.tasks || tasksData.items || [])
      
      const displayWorkflows: DisplayWorkflow[] = tasksList.map(t => ({
        id: t.task_id,
        series: t.series?.title || (t.page as any)?.chapter?.series?.title || '—',
        chapter: t.chapter?.title || (t.page as any)?.chapter?.title || `Nhiệm vụ ${t.task_type || ''}`,
        submitDate: t.created_at ? new Date(t.created_at).toLocaleDateString('vi-VN') : '—',
        status: mapTaskStatus(t.status),
        taskStatus: t.status,
      }))

      setWorkflows(displayWorkflows)
      if (displayWorkflows.length > 0) {
        setSelectedItem(displayWorkflows[0])
      }

      // Map sessions
      const sessData = sessionsRes.data || sessionsRes
      const sessList: ApiReviewSession[] = Array.isArray(sessData) 
        ? sessData 
        : (sessData.data || sessData.sessions || sessData.items || [])
      
      const displaySessions: DisplaySession[] = sessList.map(s => ({
        id: s.session_id,
        title: s.name || s.title || '—',
        time: s.created_at ? new Date(s.created_at).toLocaleString('vi-VN') : '—',
        description: s.description || '',
        status: mapSessionStatus(s.status),
        seriesName: s.series?.title || (s.chapter as any)?.series?.title || '—',
        chapterName: s.chapter?.title || '—',
      }))

      setSessions(displaySessions)
      if (displaySessions.length > 0) {
        setSelectedSessionId(displaySessions[0].id)
      }
    } catch (err: any) {
      console.error('Failed to load workflow data:', err)
      setError('Không thể tải dữ liệu quy trình duyệt.')
    } finally {
      setLoading(false)
    }
  }

  const mapTaskStatus = (s: string): DisplayWorkflow['status'] => {
    switch (s?.toLowerCase()) {
      case 'submitted': case 'in_review': return 'PENDING'
      case 'approved': case 'completed': return 'APPROVED'
      case 'rejected': case 'needs_revision': case 'needs revision': return 'REJECTED'
      default: return 'PENDING'
    }
  }

  const mapSessionStatus = (s: string): DisplaySession['status'] => {
    switch (s?.toLowerCase()) {
      case 'completed': case 'finished': return 'COMPLETED'
      case 'active': case 'in_progress': case 'started': return 'ACTIVE'
      default: return 'UPCOMING'
    }
  }

  const activeSession = sessions.find(s => s.id === selectedSessionId)

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionName) {
      alert('Vui lòng nhập tên phiên duyệt!')
      return
    }

    try {
      const res = await editorService.createEditorReviewSession({
        name: sessionName,
        description: sessionDescription,
      })

      const newSession: DisplaySession = {
        id: res.data?.session_id || 'sess-' + Date.now(),
        title: sessionName,
        time: new Date().toLocaleString('vi-VN'),
        description: sessionDescription,
        status: 'UPCOMING',
      }

      setSessions([...sessions, newSession])
      setSelectedSessionId(newSession.id)
      setIsCreateSessionOpen(false)
      setSessionName('')
      setSessionDescription('')
      showToast('Đã khởi tạo thành công cuộc họp duyệt ban biên tập!')
    } catch (err: any) {
      console.error('Failed to create session:', err)
      showToast('Lỗi khi tạo phiên duyệt!')
    }
  }

  const handleStartSession = async (sessId: string) => {
    try {
      await editorService.startReviewSession(sessId)
      setSessions(prev => prev.map(s => s.id === sessId ? { ...s, status: 'ACTIVE' } : s))
      showToast('Phiên họp Ban Biên Tập đã được bắt đầu!')
    } catch (err: any) {
      console.error('Failed to start session:', err)
      showToast('Lỗi khi bắt đầu phiên họp!')
    }
  }

  const handleCompleteSession = async (sessId: string) => {
    try {
      await editorService.completeReviewSession(sessId)
      setSessions(prev => prev.map(s => s.id === sessId ? { ...s, status: 'COMPLETED' } : s))
      showToast('Đã kết thúc phiên họp và ban hành nghị quyết duyệt xuất bản!')
    } catch (err: any) {
      console.error('Failed to complete session:', err)
      showToast('Lỗi khi kết thúc phiên họp!')
    }
  }

  const handleApproveTask = async (taskId: string) => {
    try {
      await editorService.approveTask(taskId)
      setWorkflows(prev => prev.map(w => w.id === taskId ? { ...w, status: 'APPROVED' } : w))
      setSelectedItem(prev => prev && prev.id === taskId ? { ...prev, status: 'APPROVED' } : prev)
      showToast('Đã phê duyệt task thành công!')
    } catch (err: any) {
      console.error('Failed to approve task:', err)
      showToast('Lỗi khi phê duyệt task!')
    }
  }

  const handleRejectTask = async (taskId: string) => {
    try {
      await editorService.requestTaskRevision(taskId, 'Cần chỉnh sửa lại theo yêu cầu của Biên tập viên.')
      setWorkflows(prev => prev.map(w => w.id === taskId ? { ...w, status: 'REJECTED' } : w))
      setSelectedItem(prev => prev && prev.id === taskId ? { ...prev, status: 'REJECTED' } : prev)
      showToast('Đã trả lại bản thảo và yêu cầu sửa đổi!')
    } catch (err: any) {
      console.error('Failed to reject task:', err)
      showToast('Lỗi khi yêu cầu sửa đổi!')
    }
  }

  const toggleTaskSelection = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    )
  }

  const handleBulkApprove = async () => {
    if (selectedTaskIds.length === 0) return
    try {
      await editorService.bulkApproveTasks(selectedTaskIds)
      setWorkflows(prev => prev.map(w => selectedTaskIds.includes(w.id) ? { ...w, status: 'APPROVED' } : w))
      if (selectedItem && selectedTaskIds.includes(selectedItem.id)) {
        setSelectedItem(prev => prev ? { ...prev, status: 'APPROVED' } : null)
      }
      setSelectedTaskIds([])
      showToast(`Đã phê duyệt hàng loạt ${selectedTaskIds.length} tasks!`)
    } catch (err: any) {
      console.error('Failed to bulk approve:', err)
      showToast('Lỗi khi phê duyệt hàng loạt!')
    }
  }

  const handleBulkReject = async () => {
    if (selectedTaskIds.length === 0) return
    try {
      await editorService.bulkRejectTasks(selectedTaskIds)
      setWorkflows(prev => prev.map(w => selectedTaskIds.includes(w.id) ? { ...w, status: 'REJECTED' } : w))
      if (selectedItem && selectedTaskIds.includes(selectedItem.id)) {
        setSelectedItem(prev => prev ? { ...prev, status: 'REJECTED' } : null)
      }
      setSelectedTaskIds([])
      showToast(`Đã từ chối hàng loạt ${selectedTaskIds.length} tasks!`)
    } catch (err: any) {
      console.error('Failed to bulk reject:', err)
      showToast('Lỗi khi từ chối hàng loạt!')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-manga-red mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">Đang tải dữ liệu quy trình duyệt...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center border-4 border-red-500 p-8 bg-white">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
          <button onClick={fetchData} className="bg-manga-ink text-white font-bold text-xs uppercase px-4 py-2 hover:bg-black transition-colors">Thử lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-manga-ink text-white px-6 py-3 border-4 border-manga-red shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none">
            QUY TRÌNH DUYỆT (WORKFLOW) & PHIÊN BIỂU QUYẾT
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-2">
            Theo dõi tiến trình duyệt và khởi tạo các cuộc họp biểu quyết của Ban Biên Tập
          </p>
        </div>
        <button 
          onClick={() => setIsCreateSessionOpen(true)}
          className="bg-manga-red hover:bg-red-600 text-white font-bold text-xs uppercase px-4 py-2 border-2 border-manga-ink shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Khởi Tạo Phiên Họp Duyệt
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: List of tasks/workflows */}
        <div className="lg:col-span-1 bg-white border-4 border-manga-ink flex flex-col h-[580px] overflow-hidden">
          <div className="p-4 border-b-4 border-manga-ink bg-manga-ink text-white">
            <h2 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> Tasks Cần Duyệt
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50 p-2 space-y-2">
            {workflows.length > 0 ? workflows.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-4 border-2 cursor-pointer transition-all flex gap-3 ${
                  selectedItem?.id === item.id 
                    ? 'border-manga-ink bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1 -translate-x-1' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div onClick={(e) => toggleTaskSelection(item.id, e)} className="mt-1 shrink-0">
                  <div className={`w-4 h-4 border-2 flex items-center justify-center ${selectedTaskIds.includes(item.id) ? 'bg-manga-ink border-manga-ink' : 'border-gray-400 bg-white'}`}>
                    {selectedTaskIds.includes(item.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-manga-ink truncate">{item.series}</h3>
                  <div className="text-xs font-bold text-manga-red mb-2 truncate">{item.chapter}</div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                    <span className="text-gray-500">Nộp: {item.submitDate}</span>
                    <span className={`px-2 py-0.5 border ${
                      item.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-700' :
                      item.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-700' :
                      item.status === 'PENDING' ? 'bg-orange-100 text-orange-700 border-orange-700' :
                      'bg-blue-100 text-blue-700 border-blue-700'
                    }`}>
                      {getFriendlyWorkflowStatus(item.status)}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 text-sm font-bold">Không có task nào cần duyệt</div>
            )}
          </div>
          {/* Bulk Actions */}
          {selectedTaskIds.length > 0 && (
            <div className="p-3 border-t-4 border-manga-ink bg-gray-100 flex flex-col gap-2">
              <div className="text-xs font-bold text-gray-600">Đã chọn: {selectedTaskIds.length} tasks</div>
              <div className="flex gap-2">
                <button onClick={handleBulkApprove} className="flex-1 py-1.5 bg-green-600 text-white font-bold text-[10px] uppercase border border-black hover:bg-green-700">Duyệt</button>
                <button onClick={handleBulkReject} className="flex-1 py-1.5 bg-red-600 text-white font-bold text-[10px] uppercase border border-black hover:bg-red-700">Từ chối</button>
              </div>
            </div>
          )}
        </div>

        {/* Middle/Right: Detail containing the step diagram */}
        <div className="lg:col-span-2 bg-white border-4 border-manga-ink p-6 min-h-[580px] flex flex-col justify-between">
          {selectedItem ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="border-b-2 border-gray-150 pb-4 mb-6">
                  <h2 className="font-manga text-2xl font-bold uppercase text-manga-ink">{selectedItem.series}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm font-bold text-manga-red">{selectedItem.chapter}</span>
                    <span className="text-xs font-bold text-gray-400">Nộp: {selectedItem.submitDate}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                      selectedItem.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-700' :
                      selectedItem.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-700' :
                      selectedItem.status === 'PENDING' ? 'bg-orange-100 text-orange-700 border-orange-700' :
                      'bg-blue-100 text-blue-700 border-blue-700'
                    }`}>{getFriendlyWorkflowStatus(selectedItem.status)}</span>
                  </div>
                </div>

                {/* Sơ đồ quy trình phê duyệt */}
                <div className="bg-gray-50 border-2 border-manga-ink p-6 mb-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase text-manga-ink mb-4 flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4 text-manga-red" /> Sơ đồ quy trình phê duyệt
                  </h3>
                  
                  <div className="flex flex-col relative mt-2 pl-4">
                    {/* Step 1: Nộp bài */}
                    <div className="flex items-start gap-4 relative min-w-0">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full border-2 border-green-500 bg-green-50 flex items-center justify-center text-green-600 font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10">
                          <Check className="w-4 h-4 text-green-650" />
                        </div>
                        <div className="w-0.5 h-12 bg-gray-200"></div>
                      </div>
                      <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                        <span className="text-sm font-bold text-green-600">Nộp bài</span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {selectedItem.series.toLowerCase().includes("ben 10") ? "Inoue Hana" : "Yamamoto Ren"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold mt-0.5">{selectedItem.submitDate}</span>
                      </div>
                    </div>

                    {/* Step 2: Tantou Duyệt */}
                    <div className="flex items-start gap-4 relative min-w-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                          selectedItem.status === 'APPROVED' ? 'border-green-500 bg-green-50 text-green-600' :
                          selectedItem.status === 'REJECTED' ? 'border-red-500 bg-red-50 text-red-650' :
                          selectedItem.status === 'PENDING' ? 'border-red-500 bg-red-50 text-red-500 animate-pulse' :
                          'border-gray-300 bg-gray-50 text-gray-400'
                        }`}>
                          {selectedItem.status === 'APPROVED' ? <Check className="w-4 h-4 text-green-600" /> :
                           selectedItem.status === 'REJECTED' ? <X className="w-4 h-4 text-red-600" /> :
                           <Clock className="w-4 h-4 text-red-500 animate-pulse" />}
                        </div>
                        <div className="w-0.5 h-12 bg-gray-200"></div>
                      </div>
                      <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                        <span className={`text-sm font-bold ${
                          selectedItem.status === 'APPROVED' ? 'text-green-600' :
                          selectedItem.status === 'REJECTED' ? 'text-red-600' :
                          'text-manga-ink'
                        }`}>Tantou Duyệt</span>
                        <span className="text-[11px] text-gray-500 font-medium">Tanaka Keiko</span>
                        {selectedItem.status === 'APPROVED' && <span className="text-[10px] text-orange-500 font-bold italic mt-0.5">Duyệt kèm ghi chú nhỏ</span>}
                        {selectedItem.status === 'REJECTED' && <span className="text-[10px] text-orange-500 font-bold italic mt-0.5">Trả lại để sửa đổi</span>}
                      </div>
                    </div>

                    {/* Step 3: Tổng Biên Tập */}
                    <div className="flex items-start gap-4 relative min-w-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                          selectedItem.status === 'APPROVED' ? 'border-green-500 bg-green-50 text-green-600' :
                          'border-gray-300 bg-gray-50 text-gray-400'
                        }`}>
                          {selectedItem.status === 'APPROVED' ? <Check className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="w-0.5 h-12 bg-gray-200"></div>
                      </div>
                      <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                        <span className={`text-sm font-bold ${selectedItem.status === 'APPROVED' ? 'text-green-600' : 'text-gray-400'}`}>Tổng Biên Tập</span>
                        <span className="text-[11px] text-gray-500 font-medium font-sans">Hayashi Noboru</span>
                      </div>
                    </div>

                    {/* Step 4: Nhà Xuất Bản */}
                    <div className="flex items-start gap-4 relative min-w-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                          selectedItem.status === 'APPROVED' ? 'border-green-500 bg-green-50 text-green-600' :
                          'border-gray-300 bg-gray-50 text-gray-400'
                        }`}>
                          {selectedItem.status === 'APPROVED' ? <Check className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="w-0.5 h-12 bg-gray-200"></div>
                      </div>
                      <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                        <span className={`text-sm font-bold ${selectedItem.status === 'APPROVED' ? 'text-green-600' : 'text-gray-400'}`}>Nhà Xuất Bản</span>
                        <span className="text-[11px] text-gray-500 font-medium font-sans">Matsuda Pub.</span>
                      </div>
                    </div>

                    {/* Step 5: Sẵn Sàng In */}
                    <div className="flex items-start gap-4 relative min-w-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                          selectedItem.status === 'APPROVED' ? 'border-green-500 bg-green-50 text-green-600' :
                          'border-gray-300 bg-gray-50 text-gray-400'
                        }`}>
                          {selectedItem.status === 'APPROVED' ? <Check className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                        <span className={`text-sm font-bold ${selectedItem.status === 'APPROVED' ? 'text-green-600' : 'text-gray-400'}`}>Sẵn Sàng In</span>
                        <span className="text-[11px] text-gray-500 font-medium font-sans">Nhóm Sản Xuất</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedItem.status === 'PENDING' && (
                <div className="flex gap-3 pt-4 border-t-2 border-gray-100 flex-shrink-0">
                  <button onClick={() => handleApproveTask(selectedItem.id)}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all">
                    <Check className="w-4 h-4" /> Phê Duyệt
                  </button>
                  <button onClick={() => handleRejectTask(selectedItem.id)}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all">
                    <X className="w-4 h-4" /> Yêu Cầu Sửa
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm font-bold uppercase">
              Chọn một task bên danh sách để xem chi tiết
            </div>
          )}
        </div>
      </div>

      {/* Review Sessions Area */}
      <div className="bg-white border-4 border-manga-ink p-6 mt-8">
        <h2 className="font-manga text-2xl font-bold uppercase text-manga-ink mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-manga-red" /> PHÒNG BIỂU QUYẾT BAN BIÊN TẬP
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="border-2 border-manga-ink p-4 bg-gray-50 h-[320px] overflow-y-auto space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Lịch họp hội đồng</h3>
            {sessions.length > 0 ? sessions.map(s => (
              <div key={s.id} onClick={() => setSelectedSessionId(s.id)}
                className={`p-3 border-2 cursor-pointer transition-all ${
                  selectedSessionId === s.id 
                    ? 'border-manga-ink bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-manga-ink truncate pr-2">{s.title}</span>
                  <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase border ${
                    s.status === 'ACTIVE' ? 'bg-red-500 text-white animate-pulse' :
                    s.status === 'COMPLETED' ? 'bg-green-150 text-green-750 border-green-700' :
                    'bg-gray-150 text-gray-500 border-gray-300'
                  }`}>{getFriendlySessionStatus(s.status)}</span>
                </div>
                <div className="text-[10px] text-gray-400 font-bold">{s.time}</div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 text-xs font-bold uppercase">Chưa có phiên họp nào</div>
            )}
          </div>

          <div className="lg:col-span-2 border-2 border-manga-ink p-5 bg-white flex flex-col justify-between h-[320px]">
            {activeSession ? (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-manga-ink leading-tight">{activeSession.title}</h3>
                    <span className="text-xs font-bold text-gray-400">{activeSession.time}</span>
                  </div>
                  {activeSession.description && (
                    <p className="text-xs text-gray-505 mb-4 font-medium">{activeSession.description}</p>
                  )}
                </div>

                {activeSession.status === 'UPCOMING' && (
                  <div className="text-center py-6">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-500 mb-4">Cuộc họp chưa diễn ra.</p>
                    <button onClick={() => handleStartSession(activeSession.id)}
                      className="px-6 py-2 bg-manga-ink hover:bg-black text-white text-xs font-bold uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5 active:shadow-none">
                      Bắt đầu phiên họp ngay
                    </button>
                  </div>
                )}

                {activeSession.status === 'ACTIVE' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-manga-red uppercase mb-3 flex items-center gap-1.5">
                        <Vote className="w-4 h-4 animate-bounce" /> Phiên Họp Đang Diễn Ra
                      </h4>
                      <p className="text-sm text-gray-600">Phiên duyệt đang hoạt động. Các thành viên Ban Biên Tập có thể biểu quyết.</p>
                    </div>
                    <div className="flex justify-end pt-3 border-t border-gray-150">
                      <button onClick={() => handleCompleteSession(activeSession.id)}
                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5 active:shadow-none">
                        Thông qua & Kết thúc phiên họp
                      </button>
                    </div>
                  </div>
                )}

                {activeSession.status === 'COMPLETED' && (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-sm font-bold text-green-700 mb-1">Phiên họp đã kết thúc.</p>
                    <p className="text-xs text-gray-500 font-medium">Các bản thảo thông qua đã được phê duyệt tự động trên hệ thống.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm font-bold uppercase">
                Chọn một phiên họp bên danh sách để xem chi tiết
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Review Session Modal */}
      {isCreateSessionOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSession} className="bg-white border-4 border-manga-ink p-6 max-w-md w-full animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b-2 border-gray-100 pb-3 mb-4">
              <h2 className="font-manga text-xl font-bold uppercase text-manga-ink">Khởi Tạo Phiên Họp Duyệt</h2>
              <button type="button" onClick={() => setIsCreateSessionOpen(false)} className="text-gray-400 hover:text-manga-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên phiên duyệt *</label>
                <input type="text" value={sessionName} onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Ví dụ: Review Dragon Blade Ch.3..."
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none focus:border-red-500" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mô tả</label>
                <textarea rows={3} value={sessionDescription} onChange={(e) => setSessionDescription(e.target.value)}
                  placeholder="Mô tả nội dung phiên duyệt..."
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none resize-none" />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t-2 border-gray-100 pt-4">
              <button type="button" onClick={() => setIsCreateSessionOpen(false)}
                className="px-4 py-2 border-2 border-gray-300 font-bold text-sm uppercase hover:bg-gray-50">Hủy</button>
              <button type="submit"
                className="px-4 py-2 bg-manga-ink text-white font-bold text-sm uppercase hover:bg-black">Khởi tạo</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
