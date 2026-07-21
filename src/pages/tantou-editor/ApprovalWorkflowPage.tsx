import React, { useState, useEffect } from 'react'
import { GitBranch, Check, Clock, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { editorService, ApiPageTask } from '@/services/editor.service'

interface DisplayWorkflow {
  id: string
  series: string
  chapter: string
  submitDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING'
  taskStatus: string
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

export default function ApprovalWorkflowPage() {
  const [workflows, setWorkflows] = useState<DisplayWorkflow[]>([])
  const [selectedItem, setSelectedItem] = useState<DisplayWorkflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Series workflows state
  const [seriesWorkflows, setSeriesWorkflows] = useState<any[]>([])
  const [selectedSeries, setSelectedSeries] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'SERIES' | 'CHAPTER'>('SERIES')

  // Selected tasks for bulk action
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  // Modals and notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null)

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

      // Fetch review tasks, editor's series, chapters, and review sessions in parallel
      const [tasksRes, seriesRes, chaptersRes, sessionsRes] = await Promise.all([
        editorService.getEditorReviewTasks(),
        editorService.getSeries({ limit: 100 }),
        editorService.getChapters({ limit: 1000 }),
        editorService.getReviewSessions({ limit: 1000 })
      ])

      // Managed series list
      const seriesData = seriesRes.data || seriesRes
      const seriesList = Array.isArray(seriesData) ? seriesData : (seriesData.series || seriesData.items || [])
      const managedSeriesIds = new Set(seriesList.map((s: any) => s.series_id || s.id))

      // Map tasks to workflows
      const tasksData = tasksRes.data || tasksRes
      const tasksList: ApiPageTask[] = Array.isArray(tasksData) 
        ? tasksData 
        : (tasksData.data || tasksData.tasks || tasksData.items || [])

      // Filter tasks to only include those belonging to the logged-in Tantou editor's series
      const filteredTasks = tasksList.filter((t: any) => {
        const sId = t.series_id || t.series?.series_id || t.series?.id || 
                    t.chapter?.series_id || t.chapter?.series?.series_id || t.chapter?.series?.id ||
                    t.page?.chapter?.series_id || t.page?.chapter?.series?.series_id;
        return sId && managedSeriesIds.has(sId);
      })
      
      const displayWorkflows: DisplayWorkflow[] = filteredTasks.map(t => ({
        id: t.task_id,
        series: t.series?.title || (t.page as any)?.chapter?.series?.title || '—',
        chapter: t.chapter?.title || (t.page as any)?.chapter?.title || `Nhiệm vụ ${t.task_type || ''}`,
        submitDate: t.created_at ? new Date(t.created_at).toLocaleDateString('vi-VN') : '—',
        status: mapTaskStatus(t.status),
        taskStatus: t.status,
      }))

      // Process chapters to see which series has chapters/approved chapters
      const chaptersData = chaptersRes.data || chaptersRes
      const chaptersList = Array.isArray(chaptersData) ? chaptersData : (chaptersData.chapters || chaptersData.items || [])

      const seriesWithApprovedChapters = new Set(
        chaptersList
          .filter((ch: any) => ['approved', 'completed', 'published'].includes(ch.status?.toLowerCase()))
          .map((ch: any) => ch.series_id)
      );

      const seriesWithChapters = new Set(
        chaptersList.map((ch: any) => ch.series_id)
      );

      const seriesWithRejectedChapters = new Set(
        chaptersList
          .filter((ch: any) => ['rejected', 'needs_revision', 'needs_change'].includes(ch.status?.toLowerCase()))
          .map((ch: any) => ch.series_id)
      );

      // Map chapter_id to series_id for sessions resolution
      const chapterToSeriesMap = new Map();
      chaptersList.forEach((ch: any) => {
        if (ch.chapter_id && ch.series_id) {
          chapterToSeriesMap.set(ch.chapter_id, ch.series_id);
        }
      });

      // Process review sessions
      const sessionsData = sessionsRes.data || sessionsRes;
      const sessionsList = Array.isArray(sessionsData) ? sessionsData : (sessionsData.sessions || sessionsData.items || []);

      const getSessionSeriesId = (s: any) => {
        if (s.series_id) return s.series_id;
        if (s.series?.series_id || s.series?.id) return s.series.series_id || s.series.id;
        if (s.chapter?.series_id) return s.chapter.series_id;
        if (s.chapter_id && chapterToSeriesMap.has(s.chapter_id)) {
          return chapterToSeriesMap.get(s.chapter_id);
        }
        return null;
      };

      const seriesWithActiveSessions = new Set(
        sessionsList
          .filter((s: any) => ['active', 'completed', 'finished', 'in_progress', 'started'].includes(s.status?.toLowerCase()))
          .map((s: any) => getSessionSeriesId(s))
          .filter(Boolean)
      );

      const mappedSeriesWorkflows = seriesList.map((s: any) => {
        const sId = s.series_id || s.id;
        return {
          id: sId,
          series: s.title,
          submitDate: s.created_at ? new Date(s.created_at).toLocaleDateString('vi-VN') : '—',
          seriesStatus: s.status,
          hasApprovedChapters: seriesWithApprovedChapters.has(sId) || s.status === 'published',
          hasRejectedChapters: seriesWithRejectedChapters.has(sId),
          hasChapters: (seriesWithApprovedChapters.has(sId) && seriesWithChapters.has(sId)) || s.status === 'published',
          hasActiveSessions: (seriesWithApprovedChapters.has(sId) && seriesWithActiveSessions.has(sId)) || s.status === 'published'
        };
      })

      setWorkflows(displayWorkflows)
      setSeriesWorkflows(mappedSeriesWorkflows)

      if (displayWorkflows.length > 0) {
        setSelectedItem(displayWorkflows[0])
      }
      if (mappedSeriesWorkflows.length > 0) {
        setSelectedSeries(mappedSeriesWorkflows[0])
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
            QUY TRÌNH DUYỆT (WORKFLOW)
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-2">
            Theo dõi tiến trình duyệt Series và các Nhiệm vụ Chapter của Ban Biên Tập
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: List of tasks/workflows */}
        <div className="lg:col-span-1 bg-white border-4 border-manga-ink flex flex-col h-[580px] overflow-hidden">
          <div className="flex border-b-4 border-manga-ink bg-manga-ink text-white p-1 gap-1">
            <button 
              onClick={() => setActiveTab('SERIES')}
              className={`flex-1 py-2 text-xs font-bold uppercase transition-all ${
                activeTab === 'SERIES' ? 'bg-white text-manga-ink' : 'bg-transparent text-white hover:bg-white/10'
              }`}
            >
              Tiến độ Series
            </button>
            <button 
              onClick={() => setActiveTab('CHAPTER')}
              className={`flex-1 py-2 text-xs font-bold uppercase transition-all ${
                activeTab === 'CHAPTER' ? 'bg-white text-manga-ink' : 'bg-transparent text-white hover:bg-white/10'
              }`}
            >
              Nhiệm vụ Chapter
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 p-2 space-y-2">
            {activeTab === 'SERIES' ? (
              seriesWorkflows.length > 0 ? seriesWorkflows.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedSeries(item)}
                  className={`p-4 border-2 cursor-pointer transition-all flex gap-3 ${
                    selectedSeries?.id === item.id 
                      ? 'border-manga-ink bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1 -translate-x-1' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-manga-ink truncate">{item.series}</h3>
                    <div className="text-xs font-bold text-gray-500 mb-2 truncate">Quy trình bộ truyện</div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                      <span className="text-gray-500">Nộp: {item.submitDate}</span>
                      <span className={`px-2 py-0.5 border ${
                        ['approved', 'published', 'in_production'].includes(item.seriesStatus) ? 'bg-green-100 text-green-700 border-green-700' :
                        item.seriesStatus === 'rejected' ? 'bg-red-100 text-red-700 border-red-700' :
                        'bg-orange-100 text-orange-700 border-orange-700'
                      }`}>
                        {['approved', 'published', 'in_production'].includes(item.seriesStatus) ? 'ĐANG VẼ' :
                         item.seriesStatus === 'rejected' ? 'BỊ TỪ CHỐI' : 'CHỜ DUYỆT'}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400 text-sm font-bold">Không có series nào</div>
              )
            ) : (
              workflows.length > 0 ? workflows.map((item) => (
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
                <div className="text-center py-8 text-gray-400 text-sm font-bold">Không có nhiệm vụ nào</div>
              )
            )}
          </div>
          {/* Bulk Actions */}
          {activeTab === 'CHAPTER' && selectedTaskIds.length > 0 && (
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
          {activeTab === 'SERIES' ? (
            selectedSeries ? (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="border-b-2 border-gray-150 pb-4 mb-6">
                    <h2 className="font-manga text-2xl font-bold uppercase text-manga-ink">{selectedSeries.series}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs font-bold text-gray-400">Ngày đề xuất: {selectedSeries.submitDate}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                        ['approved', 'published', 'in_production'].includes(selectedSeries.seriesStatus) ? 'bg-green-100 text-green-700 border-green-700' :
                        selectedSeries.seriesStatus === 'rejected' ? 'bg-red-100 text-red-700 border-red-700' :
                        'bg-orange-100 text-orange-700 border-orange-700'
                      }`}>
                        {['approved', 'published', 'in_production'].includes(selectedSeries.seriesStatus) ? 'ĐANG VẼ' :
                         selectedSeries.seriesStatus === 'rejected' ? 'BỊ TỪ CHỐI' : 'CHỜ DUYỆT'}
                      </span>
                    </div>
                  </div>

                  {/* Sơ đồ quy trình phê duyệt Series */}
                  <div className="bg-gray-50 border-2 border-manga-ink p-6 mb-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-manga-ink mb-4 flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4 text-manga-red" /> Sơ đồ quy trình phê duyệt Series
                    </h3>
                    
                    <div className="flex flex-col relative mt-2 pl-4">
                      {/* Step 1: Phê duyệt Dự án (Tantou Editor) */}
                      <div className="flex items-start gap-4 relative min-w-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                            ['approved', 'published', 'in_production'].includes(selectedSeries.seriesStatus)
                              ? 'border-green-500 bg-green-50 text-green-600'
                              : 'border-gray-300 bg-gray-50 text-gray-400'
                          }`}>
                            {['approved', 'published', 'in_production'].includes(selectedSeries.seriesStatus) ? <Check className="w-4 h-4 text-green-655" /> : <Clock className="w-4 h-4 text-gray-400" />}
                          </div>
                          <div className="w-0.5 h-12 bg-gray-200"></div>
                        </div>
                        <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                          <span className={`text-sm font-bold ${['approved', 'published', 'in_production'].includes(selectedSeries.seriesStatus) ? 'text-green-600' : 'text-gray-400'}`}>
                            1. Phê duyệt Dự án (Tantou Editor)
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium">
                            Biên tập viên (Tantou) duyệt đề xuất và đưa Series vào sản xuất
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold mt-0.5">{selectedSeries.submitDate}</span>
                        </div>
                      </div>

                      {/* Step 2: Duyệt phân cảnh & Kịch bản (Tantou Editor) */}
                      <div className="flex items-start gap-4 relative min-w-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                            selectedSeries.hasApprovedChapters
                              ? 'border-green-500 bg-green-50 text-green-600'
                              : selectedSeries.hasRejectedChapters
                              ? 'border-red-500 bg-red-50 text-red-600'
                              : 'border-gray-300 bg-gray-50 text-gray-400'
                          }`}>
                            {selectedSeries.hasApprovedChapters ? (
                              <Check className="w-4 h-4 text-green-655" />
                            ) : selectedSeries.hasRejectedChapters ? (
                              <X className="w-4 h-4 text-red-655" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="w-0.5 h-12 bg-gray-200"></div>
                        </div>
                        <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                          <span className={`text-sm font-bold ${
                            selectedSeries.hasApprovedChapters ? 'text-green-600' :
                            selectedSeries.hasRejectedChapters ? 'text-red-600' :
                            'text-gray-400'
                          }`}>
                            2. Duyệt phân cảnh & Kịch bản (Tantou Editor)
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium">Biên tập viên duyệt kịch bản phân cảnh và khởi tạo chương mới</span>
                        </div>
                      </div>

                      {/* Step 3: Khởi họa & Chế tác (Mangaka) */}
                      <div className="flex items-start gap-4 relative min-w-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                            selectedSeries.hasChapters
                              ? 'border-green-500 bg-green-50 text-green-600'
                              : 'border-gray-300 bg-gray-50 text-gray-400'
                          }`}>
                            {selectedSeries.hasChapters ? <Check className="w-4 h-4 text-green-655" /> : <Clock className="w-4 h-4 text-gray-400" />}
                          </div>
                          <div className="w-0.5 h-12 bg-gray-200"></div>
                        </div>
                        <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                          <span className={`text-sm font-bold ${selectedSeries.hasChapters ? 'text-green-600' : 'text-gray-400'}`}>
                            3. Khởi họa & Chế tác (Mangaka)
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium">Tác giả tiến hành vẽ các trang bản thảo chính thức đầu tiên của chương mới</span>
                        </div>
                      </div>

                      {/* Step 4: Thành lập Hội đồng bỏ phiếu (Admin) */}
                      <div className="flex items-start gap-4 relative min-w-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                            selectedSeries.hasActiveSessions
                              ? 'border-green-500 bg-green-50 text-green-600'
                              : 'border-gray-300 bg-gray-50 text-gray-400'
                          }`}>
                            {selectedSeries.hasActiveSessions ? <Check className="w-4 h-4 text-green-655" /> : <Clock className="w-4 h-4 text-gray-400" />}
                          </div>
                          <div className="w-0.5 h-12 bg-gray-200"></div>
                        </div>
                        <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                          <span className={`text-sm font-bold ${selectedSeries.hasActiveSessions ? 'text-green-600' : 'text-gray-400'}`}>
                            4. Thành lập Hội đồng bỏ phiếu (Admin)
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium font-sans">Admin lập cuộc họp bỏ phiếu thẩm định chất lượng để chuẩn bị phát hành</span>
                        </div>
                      </div>

                      {/* Step 5: Công bố tác phẩm (Public) */}
                      <div className="flex items-start gap-4 relative min-w-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                            selectedSeries.seriesStatus === 'published' ? 'border-green-500 bg-green-50 text-green-600' :
                            'border-gray-300 bg-gray-50 text-gray-400'
                          }`}>
                            {selectedSeries.seriesStatus === 'published' ? <Check className="w-4 h-4 text-green-655" /> : <Clock className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                          <span className={`text-sm font-bold ${selectedSeries.seriesStatus === 'published' ? 'text-green-600' : 'text-gray-400'}`}>
                            5. Công bố tác phẩm (Public)
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium font-sans">Admin cập nhật trạng thái Public, chính thức đưa tác phẩm tiếp cận độc giả</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm font-bold uppercase">
                Chọn một series bên danh sách để xem tiến độ
              </div>
            )
          ) : (
            selectedItem ? (
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
                      {/* Step 1: Đề xuất tác phẩm mới (Mangaka) */}
                      <div className="flex items-start gap-4 relative min-w-0">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full border-2 border-green-500 bg-green-50 flex items-center justify-center text-green-600 font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10">
                            <Check className="w-4 h-4 text-green-650" />
                          </div>
                          <div className="w-0.5 h-12 bg-gray-200"></div>
                        </div>
                        <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                          <span className="text-sm font-bold text-green-600">1. Đăng ký Series mới (Mangaka)</span>
                          <span className="text-[11px] text-gray-500 font-medium">
                            Tác giả gửi thông tin và bản phác thảo thô của bộ truyện mới
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold mt-0.5">{selectedItem.submitDate}</span>
                        </div>
                      </div>

                      {/* Step 2: Phê duyệt Đang vẽ (Tantou Editor) */}
                      <div className="flex items-start gap-4 relative min-w-0">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full border-2 border-green-500 bg-green-55 flex items-center justify-center text-green-655 font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10">
                            <Check className="w-4 h-4 text-green-655" />
                          </div>
                          <div className="w-0.5 h-12 bg-gray-200"></div>
                        </div>
                        <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                          <span className="text-sm font-bold text-green-600">2. Phê duyệt đưa vào sản xuất (Tantou Editor)</span>
                          <span className="text-[11px] text-gray-500 font-medium">Biên tập viên duyệt chuyển trạng thái sang "Đang vẽ" (Drawing)</span>
                        </div>
                      </div>

                      {/* Step 3: Hoàn thiện chương & bản thảo (Họa sĩ & Trợ lý) */}
                      <div className="flex items-start gap-4 relative min-w-0">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full border-2 border-green-500 bg-green-55 flex items-center justify-center text-green-655 font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10">
                            <Check className="w-4 h-4 text-green-655" />
                          </div>
                          <div className="w-0.5 h-12 bg-gray-200"></div>
                        </div>
                        <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                          <span className="text-sm font-bold text-green-600">3. Phác thảo & Phân chia trang vẽ</span>
                          <span className="text-[11px] text-gray-500 font-medium">Tác giả và trợ lý phân chia các trang vẽ cụ thể cho từng chapter</span>
                        </div>
                      </div>

                      {/* Step 4: Phê duyệt Xuất bản (Tổng Biên Tập / Admin) */}
                      <div className="flex items-start gap-4 relative min-w-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                            selectedItem.status === 'APPROVED' ? 'border-green-500 bg-green-55 text-green-600' :
                            'border-gray-300 bg-gray-55 text-gray-400'
                          }`}>
                            {selectedItem.status === 'APPROVED' ? <Check className="w-4 h-4 text-green-655" /> : <Clock className="w-4 h-4 text-gray-400" />}
                          </div>
                          <div className="w-0.5 h-12 bg-gray-200"></div>
                        </div>
                        <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                          <span className={`text-sm font-bold ${selectedItem.status === 'APPROVED' ? 'text-green-600' : 'text-gray-400'}`}>4. Phê duyệt xuất bản (Admin / Ban quản trị)</span>
                          <span className="text-[11px] text-gray-500 font-medium font-sans">Ban quản trị phê duyệt chất lượng bản vẽ chương</span>
                        </div>
                      </div>

                      {/* Step 5: Xuất bản */}
                      <div className="flex items-start gap-4 relative min-w-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-10 ${
                            selectedItem.status === 'APPROVED' ? 'border-green-500 bg-green-55 text-green-600' :
                            'border-gray-300 bg-gray-55 text-gray-400'
                          }`}>
                            {selectedItem.status === 'APPROVED' ? <Check className="w-4 h-4 text-green-655" /> : <Clock className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0 pt-1.5 pb-2">
                          <span className={`text-sm font-bold ${selectedItem.status === 'APPROVED' ? 'text-green-600' : 'text-gray-400'}`}>5. Xuất bản</span>
                          <span className="text-[11px] text-gray-500 font-medium font-sans">Chapter chính thức được phát hành đến độc giả</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedItem.status === 'PENDING' && (
                  <div className="flex gap-3 pt-4 border-t-2 border-gray-150 flex-shrink-0">
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
            )
          )}
        </div>
      </div>
    </div>
  )
}
