import React, { useState, useEffect } from 'react'
import { Plus, Eye, ClipboardList, BarChart2, CheckCircle, Flame, Hourglass, Moon, X, UserPlus, FileCheck } from 'lucide-react'
import { mangakaStore, Assistant, LayerTask } from '@/data/mangakaMockData'
import { Link } from 'react-router'

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [tasks, setTasks] = useState<LayerTask[]>([])
  const [submissionsCount, setSubmissionsCount] = useState(0)

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState<Assistant | null>(null)

  // Form state
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('Line Art')

  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = () => {
    setAssistants(mangakaStore.getAssistants())
    setTasks(mangakaStore.getTasks())
    setSubmissionsCount(mangakaStore.getSubmissions().filter(s => s.status === 'Pending').length)
  }

  const handleAddAssistant = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    mangakaStore.addAssistant({
      name: newName.trim(),
      role: newRole,
      avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`
    })
    setNewName('')
    setShowAddModal(false)
    refreshData()
  }

  const totalTasks = tasks.length
  const activeTasksCount = tasks.filter(t => t.status === 'Doing').length
  const overdueTasksCount = tasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'Approved').length

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

      {/* Assistant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {assistants.map((a) => {
          const workload = Math.min(100, (a.currentTasksCount * 20) + (a.pendingSubmissionsCount * 10))
          return (
          <div key={a.id} className={`bg-white border-2 border-manga-ink manga-shadow flex flex-col ${a.status === 'Nghỉ ngơi' ? 'opacity-70' : ''}`}>
            <div className="bg-manga-ink text-white p-4 flex items-center gap-4">
              <div className="w-14 h-14 border-2 border-white overflow-hidden flex-shrink-0 bg-gray-300 flex items-center justify-center">
                {a.avatarUrl
                  ? <img src={a.avatarUrl} alt={a.name} className="w-full h-full object-cover grayscale" />
                  : <span className="font-manga text-2xl font-bold text-gray-500">{a.name[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-manga text-xl font-bold">{a.name}</h3>
                  {statusIcon[a.status]}
                </div>
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
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tên Trợ Lý</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  className="w-full border-2 border-manga-ink p-2 font-bold focus:ring-2 focus:ring-manga-red"
                  required
                />
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
    </div>
  )
}
