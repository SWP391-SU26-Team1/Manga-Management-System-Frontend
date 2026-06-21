import React, { useState, useEffect } from 'react'
import { Plus, Eye, ClipboardList, BarChart2, CheckCircle, Flame, Hourglass, Moon, X, UserPlus, FileCheck, Trash2 } from 'lucide-react'
import { Assistant, LayerTask } from '@/data/mangakaMockData'
import { Link } from 'react-router'
import { seriesService, SeriesAPI } from '@/services/series.service'
import { taskService } from '@/services/task.service'
import userService from '@/services/user.service'

const TASK_TYPE_MAP: Record<string, string> = {
  inking: 'Line Art',
  background: 'Background',
  coloring: 'Screentone',
  lettering: 'Speech Balloon',
  cleaning: 'Cleaning',
  sfx: 'Effects / SFX'
}

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [tasks, setTasks] = useState<LayerTask[]>([])
  const [submissionsCount, setSubmissionsCount] = useState(0)
  const [seriesList, setSeriesList] = useState<SeriesAPI[]>([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState<Assistant | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [assistantToDelete, setAssistantToDelete] = useState<{
    seriesId: string;
    seriesMemberId: string;
    name: string;
  } | null>(null)

  // Custom Alert Modal States
  const [alertModal, setAlertModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'success'
  })

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setAlertModal({ show: true, title, message, type })
  }

  // Form state
  const [newAssistantUserId, setNewAssistantUserId] = useState('')
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [newRole, setNewRole] = useState('Line Art')
  const [availableAssistants, setAvailableAssistants] = useState<any[]>([])

  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = async () => {
    try {
      setLoading(true)
      // 1. Load series list
      const slist = await seriesService.getAll()
      setSeriesList(slist)
      if (slist.length > 0) {
        setSelectedSeriesId(slist[0]._id)
      }

      // 2. Load consolidated members
      const allMembers = await seriesService.getAllMembersOfMySeries()
      // Filter members to only assistant role
      const assistantMembers = allMembers.filter((m: any) => m.users?.role === 'assistant')

      // 3. Load all tasks
      const allTasks = await taskService.getAllTasks()

      // Map backend tasks to LayerTask format for table
      const mappedTasks: LayerTask[] = allTasks.map((t: any) => ({
        id: t.task_id,
        chapterId: t.chapter_id || '',
        pageId: t.page_id || '',
        layerType: (TASK_TYPE_MAP[t.task_type] || t.task_type) as any,
        assignedTo: t.assistant?.name || t.assistant?.username || 'Chưa giao',
        deadline: t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : 'N/A',
        status: t.status === 'in_progress' ? 'Doing' : t.status === 'submitted' ? 'Submitted' : t.status === 'needs_revision' ? 'Need Fix' : t.status === 'approved' ? 'Approved' : 'Not Started',
        note: t.content || '',
        priority: t.priority || 'Medium',
      }))
      setTasks(mappedTasks)

      // Calculate workload statistics for each assistant member
      const assistantsList: Assistant[] = assistantMembers.map((m: any) => {
        const userId = m.user_id
        const assistantTasks = allTasks.filter((t: any) => t.assistant_id === userId)
        const activeTasks = assistantTasks.filter((t: any) => t.status !== 'approved' && t.status !== 'completed' && t.status !== 'cancelled')
        const pendingTasks = assistantTasks.filter((t: any) => t.status === 'submitted')

        let status: 'Đang làm' | 'Chờ duyệt' | 'Nghỉ ngơi' = 'Nghỉ ngơi'
        if (pendingTasks.length > 0) status = 'Chờ duyệt'
        else if (activeTasks.length > 0) status = 'Đang làm'

        return {
          id: m.series_member_id, // we save series_member_id here for deletion
          name: m.users?.name || m.users?.username || 'Trợ lý',
          role: m.role_in_series || 'Assistant',
          avatarUrl: m.users?.avatar_url || `https://i.pravatar.cc/150?u=${userId}`,
          currentTasksCount: activeTasks.length,
          pendingSubmissionsCount: pendingTasks.length,
          status,
          seriesId: m.seriesId,
          seriesTitle: m.seriesTitle,
          userId: userId // save actual user UUID
        } as any
      })

      setAssistants(assistantsList)
      setSubmissionsCount(allTasks.filter((t: any) => t.status === 'submitted').length)

      // 4. Load available assistants for select list
      const asts = await userService.listAssistants().catch(() => [])
      setAvailableAssistants(asts)
      if (asts.length > 0 && !newAssistantUserId) {
        setNewAssistantUserId(asts[0].id)
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu trợ lý:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAssistant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAssistantUserId.trim() || !selectedSeriesId) return
    try {
      setLoading(true)
      await seriesService.addMember(selectedSeriesId, {
        user_id: newAssistantUserId.trim(),
        role_in_series: newRole
      })
      setNewAssistantUserId('')
      setShowAddModal(false)
      await refreshData()
      showAlert('Thành công', 'Đã thêm trợ lý vào dự án thành công!', 'success')
    } catch (err: any) {
      console.error(err)
      showAlert('Lỗi', 'Không thể thêm trợ lý. Lỗi: ' + (err.response?.data?.message || err.message), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAssistant = (seriesId: string, seriesMemberId: string, name: string) => {
    setAssistantToDelete({ seriesId, seriesMemberId, name })
    setShowDeleteConfirm(true)
  }

  const confirmRemoveAssistant = async () => {
    if (!assistantToDelete) return
    const { seriesId, seriesMemberId } = assistantToDelete
    try {
      setLoading(true)
      await seriesService.removeMember(seriesId, seriesMemberId)
      await refreshData()
      showAlert('Thành công', 'Đã xóa trợ lý khỏi dự án!', 'success')
    } catch (err: any) {
      console.error(err)
      showAlert('Lỗi', 'Không thể xóa trợ lý. Lỗi: ' + (err.response?.data?.message || err.message), 'error')
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
      setAssistantToDelete(null)
    }
  }

  const totalTasks = tasks.length
  const activeTasksCount = tasks.filter(t => t.status === 'Doing').length
  const overdueTasksCount = tasks.filter(t => {
    // parse deadline format DD/MM/YYYY
    const parts = t.deadline.split('/')
    if (parts.length === 3) {
      const deadlineDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
      return deadlineDate < new Date() && t.status !== 'Approved'
    }
    return false
  }).length

  const summaryStats = [
    { label: 'Tổng trợ lý', value: assistants.length.toString() },
    { label: 'Task đang làm', value: activeTasksCount.toString() },
    { label: 'Submission chờ duyệt', value: submissionsCount.toString(), red: submissionsCount > 0 },
    { label: 'Task quá hạn', value: overdueTasksCount.toString(), red: overdueTasksCount > 0 },
  ]

  const statusIcon: Record<string, React.ReactNode> = {
    'Đang làm': <Flame className="w-4 h-4 text-manga-red" />,
    'Chờ duyệt': <Hourglass className="w-4 h-4 text-manga-ink" />,
    'Nghỉ ngơi': <Moon className="w-4 h-4 text-gray-400" />,
  }

  return (
    <div className="max-w-7xl mx-auto pb-16">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-manga text-5xl font-bold uppercase text-manga-ink leading-none">ĐỘI NGŨ TRỢ LÝ</h1>
          <div className="h-1 w-20 bg-manga-red mt-3 mb-2" />
          <p className="text-sm font-bold text-gray-500">Quản lý Assistant, theo dõi task đang làm, hiệu suất và submission.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-manga-red text-white font-manga font-bold text-sm uppercase px-5 py-3 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 transition-all mt-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm trợ lý
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {summaryStats.map((s) => (
          <div key={s.label} className={`bg-white border-2 border-manga-ink p-4 flex flex-col items-center manga-shadow-sm ${s.red ? 'border-manga-red bg-red-50/10' : ''}`}>
            <span className={`font-manga text-4xl font-bold ${s.red ? 'text-manga-red' : 'text-manga-ink'}`}>{s.value}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase text-center mt-1">{s.label}</span>
          </div>
        ))}
      </div>

      {loading && (
        <div className="bg-white border-4 border-manga-ink p-12 text-center font-bold text-gray-400 mb-8">
          Đang tải dữ liệu đội ngũ trợ lý...
        </div>
      )}

      {/* Assistant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {!loading && assistants.map((a: any) => {
          const workload = Math.min(100, (a.currentTasksCount * 20) + (a.pendingSubmissionsCount * 10))
          return (
          <div key={a.id} className={`bg-white border-2 border-manga-ink manga-shadow flex flex-col ${a.status === 'Nghỉ ngơi' ? 'opacity-70' : ''}`}>
            <div className="bg-manga-ink text-white p-4 flex items-center gap-4 relative">
              <div className="w-14 h-14 border-2 border-white overflow-hidden flex-shrink-0 bg-gray-300 flex items-center justify-center">
                {a.avatarUrl
                  ? <img src={a.avatarUrl} alt={a.name} className="w-full h-full object-cover grayscale" />
                  : <span className="font-manga text-2xl font-bold text-gray-500">{a.name[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-manga text-xl font-bold truncate pr-6">{a.name}</h3>
                  {statusIcon[a.status]}
                </div>
                <p className="text-[10px] font-bold text-manga-red truncate mt-0.5 uppercase">Series: {a.seriesTitle}</p>
                <button 
                  onClick={() => handleRemoveAssistant(a.seriesId, a.id, a.name)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-manga-red transition-colors"
                  title="Xóa trợ lý khỏi dự án"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">{a.role}</p>
                <span className={`inline-block mt-1 text-[9px] font-bold uppercase px-2 py-0.5 border ${a.status === 'Đang làm' ? 'bg-manga-red border-red-400 text-white' : a.status === 'Chờ duyệt' ? 'bg-white text-manga-ink border-white' : 'bg-gray-600 text-gray-300 border-gray-500'}`}>
                  {a.status}
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="border-r-2 border-dashed border-gray-200 pr-2">
                  <p className="font-manga text-2xl font-bold text-manga-red">{a.currentTasksCount}</p>
                  <p className="text-[9px] font-bold uppercase text-gray-500">Đang làm</p>
                </div>
                <div className="border-r-2 border-dashed border-gray-200 pr-2">
                  <p className="font-manga text-2xl font-bold text-manga-ink">{a.pendingSubmissionsCount}</p>
                  <p className="text-[9px] font-bold uppercase text-gray-500">Chờ duyệt</p>
                </div>
                <div>
                  <p className="font-manga text-2xl font-bold text-manga-ink">95%</p>
                  <p className="text-[9px] font-bold uppercase text-gray-500">Tỷ lệ duyệt</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                  <span className="uppercase">Khối lượng công việc</span>
                  <span>{workload}%</span>
                </div>
                <div className="h-3 bg-gray-100 border-2 border-manga-ink">
                  <div className={`h-full ${workload > 70 ? 'bg-manga-red' : 'bg-manga-ink'}`} style={{ width: `${workload}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to={`/dashboard/mangaka/assign-task`} className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase py-2 bg-manga-red text-white border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 transition-all text-center">
                  <ClipboardList className="w-3 h-3" /> Giao task mới
                </Link>
                <Link to={`/dashboard/mangaka/submission`} className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase py-2 border-2 border-manga-ink hover:bg-gray-100 transition-colors text-center text-manga-ink bg-white">
                  <CheckCircle className="w-3 h-3" /> Xem submission
                </Link>
                <button 
                  onClick={() => setShowStatsModal(a)}
                  className="col-span-2 flex items-center justify-center gap-1 text-[10px] font-bold uppercase py-2 border-2 border-manga-ink hover:bg-gray-100 transition-colors bg-white text-manga-ink"
                >
                  <BarChart2 className="w-3 h-3" /> Hiệu suất chi tiết
                </button>
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Current Tasks Table */}
      <div className="bg-white border-2 border-manga-ink manga-shadow-sm">
        <div className="bg-manga-ink text-white px-5 py-3 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-manga-red" />
          <h2 className="font-manga text-lg font-bold uppercase">Task hiện tại của trợ lý</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-manga-ink">
              {['Assistant', 'Layer', 'Trang', 'Deadline', 'Trạng thái'].map((h) => (
                <th key={h} className="font-bold text-xs uppercase px-4 py-3 text-left border-r-2 border-gray-200 last:border-0 text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.slice(0, 10).map((t, i) => {
              const isOverdue = new Date(t.deadline) < new Date() && t.status !== 'Approved'
              return (
              <tr key={t.id} className={`border-t-2 border-gray-200 ${i % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-red-50 transition-colors`}>
                <td className="px-4 py-3 font-bold text-sm border-r-2 border-gray-200">{t.assignedTo}</td>
                <td className="px-4 py-3 font-bold text-sm border-r-2 border-gray-200">{t.layerType}</td>
                <td className="px-4 py-3 font-bold text-sm border-r-2 border-gray-200">{t.pageId.split('_').slice(-2).join(' ')}</td>
                <td className="px-4 py-3 text-xs font-bold border-r-2 border-gray-200">
                  <span className={isOverdue ? 'text-manga-red' : 'text-gray-600'}>{t.deadline}</span>
                </td>
                <td className="px-4 py-3 border-r-2 border-gray-200">
                  <span className={`inline-block border font-bold text-[10px] px-2 py-0.5 uppercase ${
                    t.status === 'Doing' ? 'bg-manga-red text-white border-manga-ink' : 
                    t.status === 'Submitted' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                    t.status === 'Need Fix' ? 'bg-red-100 text-red-800 border-red-300' :
                    'bg-gray-100 text-gray-600 border-gray-300'
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            )})}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center font-bold text-gray-500">Chưa có task nào được giao.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Assistant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink manga-shadow max-w-md w-full">
            <div className="p-4 border-b-4 border-manga-ink bg-gray-50 flex justify-between items-center">
              <h2 className="font-manga font-bold text-xl uppercase flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-manga-red" /> Thêm Trợ Lý
              </h2>
              <button onClick={() => setShowAddModal(false)} className="hover:text-red-500"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddAssistant} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Chọn Series</label>
                <select 
                  value={selectedSeriesId} 
                  onChange={e => setSelectedSeriesId(e.target.value)}
                  className="w-full border-2 border-manga-ink p-2 font-bold focus:ring-2 focus:ring-manga-red bg-white"
                  required
                >
                  {seriesList.map(s => (
                    <option key={s._id} value={s._id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Chọn Trợ Lý</label>
                <select 
                  value={newAssistantUserId} 
                  onChange={e => setNewAssistantUserId(e.target.value)}
                  className="w-full border-2 border-manga-ink p-2 font-bold focus:ring-2 focus:ring-manga-red bg-white"
                  required
                >
                  <option value="">-- Chọn Trợ lý --</option>
                  {availableAssistants.map(ast => (
                    <option key={ast.id} value={ast.id}>{ast.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Chuyên môn (Layer Role)</label>
                <select 
                  value={newRole} 
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full border-2 border-manga-ink p-2 font-bold uppercase text-sm focus:ring-2 focus:ring-manga-red bg-white"
                >
                  <option value="Line Art">Line Art (Nét thô)</option>
                  <option value="Background">Background (Nền)</option>
                  <option value="Screentone">Screentone (Tông màu)</option>
                  <option value="Effects / SFX">Effects / SFX (Hiệu ứng)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-manga-red text-white font-manga font-bold py-3 border-2 border-manga-ink uppercase hover:bg-red-700 mt-4">
                Thêm Trợ Lý Mới
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink manga-shadow max-w-xl w-full">
            <div className="p-4 border-b-4 border-manga-ink bg-gray-50 flex justify-between items-center">
              <h2 className="font-manga font-bold text-xl uppercase flex items-center gap-2">
                <BarChart2 className="w-6 h-6 text-manga-red" /> Hiệu suất: {showStatsModal.name}
              </h2>
              <button onClick={() => setShowStatsModal(null)} className="hover:text-red-500"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 items-center mb-6 border-2 border-gray-200 p-4">
                <img src={showStatsModal.avatarUrl} alt={showStatsModal.name} className="w-16 h-16 border-2 border-manga-ink grayscale" />
                <div>
                  <h3 className="font-manga text-2xl font-bold">{showStatsModal.name}</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase">{showStatsModal.role}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase mb-1">
                    <span>Tỷ lệ hoàn thành đúng hạn (On-time Rate)</span>
                    <span className="text-green-600">92%</span>
                  </div>
                  <div className="h-4 bg-gray-100 border border-gray-300 w-full"><div className="h-full bg-green-500 w-[92%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase mb-1">
                    <span>Tỷ lệ duyệt lần đầu (First-pass Approval)</span>
                    <span className="text-blue-600">85%</span>
                  </div>
                  <div className="h-4 bg-gray-100 border border-gray-300 w-full"><div className="h-full bg-blue-500 w-[85%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase mb-1">
                    <span>Tỷ lệ bị trả về (Need Fix Rate)</span>
                    <span className="text-red-600">15%</span>
                  </div>
                  <div className="h-4 bg-gray-100 border border-gray-300 w-full"><div className="h-full bg-manga-red w-[15%]" /></div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300 text-center">
                <p className="text-sm font-bold text-gray-600">"Trợ lý này có tốc độ làm việc khá ổn định, ít khi bị trễ hạn. Nét vẽ Line Art rất sạch sẽ và chắc tay."</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Assistant Confirmation Modal */}
      {showDeleteConfirm && assistantToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink manga-shadow max-w-md w-full animate-in fade-in zoom-in-95 duration-150 text-black">
            <div className="p-4 border-b-4 border-manga-ink bg-gray-50 flex justify-between items-center">
              <h2 className="font-manga font-bold text-xl uppercase flex items-center gap-2 text-manga-red">
                Xác nhận xóa trợ lý
              </h2>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setAssistantToDelete(null)
                }} 
                className="hover:text-red-500 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-bold text-gray-700">
                Bạn có chắc chắn muốn xóa trợ lý {assistantToDelete.name} khỏi Series này?
              </p>
              <div className="bg-amber-50 border-2 border-amber-300 p-3 text-xs text-amber-800 font-bold leading-relaxed text-left">
                ⚠️ Lưu ý: Hành động này chỉ xóa trợ lý khỏi Series này. Tài khoản và vai trò của họ trong hệ thống vẫn được giữ nguyên, không bị ảnh hưởng.
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setAssistantToDelete(null)
                  }}
                  className="px-4 py-2 border-2 border-manga-ink font-bold uppercase text-xs hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmRemoveAssistant}
                  className="px-4 py-2 bg-manga-red border-2 border-manga-ink text-white font-bold uppercase text-xs hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {alertModal.show && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink manga-shadow max-w-sm w-full animate-in fade-in zoom-in-95 duration-150 text-black text-left">
            <div className="p-4 border-b-4 border-manga-ink bg-gray-50 flex justify-between items-center">
              <h2 className={`font-manga font-bold text-xl uppercase flex items-center gap-2 ${
                alertModal.type === 'success' ? 'text-green-600' : 'text-manga-red'
              }`}>
                {alertModal.title}
              </h2>
              <button 
                onClick={() => setAlertModal(prev => ({ ...prev, show: false }))} 
                className="hover:text-red-500 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-bold text-gray-700 leading-relaxed">
                {alertModal.message}
              </p>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAlertModal(prev => ({ ...prev, show: false }))}
                  className={`px-6 py-2 border-2 border-manga-ink text-white font-bold uppercase text-xs hover:bg-opacity-90 transition-colors cursor-pointer ${
                    alertModal.type === 'success' ? 'bg-green-600' : 'bg-manga-red'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
