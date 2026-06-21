import React, { useState, useEffect } from 'react'
import { Users, Search, Filter, Mail, Calendar, BarChart, Plus, Edit2, Trash2, X, CheckCircle, Bell, Loader2 } from 'lucide-react'
import { editorService, ApiTeamMember } from '../../services/editor.service'

export default function TeamManagementPage() {
  const [team, setTeam] = useState<ApiTeamMember[]>([])
  const [seriesList, setSeriesList] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<ApiTeamMember | null>(null)
  
  // Form state
  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState<'Mangaka' | 'Assistant'>('Assistant')
  const [formSeriesId, setFormSeriesId] = useState('')
  const [formStatus, setFormStatus] = useState<ApiTeamMember['status']>('ACTIVE')
  const [formWorkload, setFormWorkload] = useState(50)
  const [formDeadline, setFormDeadline] = useState('')
  
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadTeam = async () => {
    try {
      setLoading(true)
      const res = await editorService.getTeamMembers()
      if (res.success && Array.isArray(res.data)) {
        setTeam(res.data)
      } else {
        setTeam(res.data || [])
      }
      setError(null)
    } catch (err: any) {
      console.error(err)
      setError('Không thể tải danh sách thành viên nhóm.')
    } finally {
      setLoading(false)
    }
  }

  const loadSeries = async () => {
    try {
      const res = await editorService.getSeries()
      if (res.success && Array.isArray(res.data)) {
        setSeriesList(res.data)
      }
    } catch (err) {
      console.error('Không thể tải danh sách series', err)
    }
  }

  useEffect(() => {
    loadTeam()
    loadSeries()
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const getStatusColor = (status: ApiTeamMember['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500'
      case 'WARNING': return 'bg-orange-500'
      case 'AT_RISK': return 'bg-red-500'
      case 'LATE': return 'bg-red-700'
      case 'IDLE': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'bg-red-500'
    if (workload >= 70) return 'bg-orange-500'
    return 'bg-manga-ink'
  }

  const handleOpenAddModal = () => {
    setFormName('')
    setFormRole('Assistant')
    setFormSeriesId(seriesList[0]?.series_id || '')
    setFormStatus('ACTIVE')
    setFormWorkload(50)
    setFormDeadline(new Date().toISOString().split('T')[0])
    setIsAddModalOpen(true)
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName || !formSeriesId) {
      alert('Vui lòng điền đầy đủ Tên và chọn Series!')
      return
    }
    try {
      await editorService.createTeamMember({
        name: formName,
        role: formRole,
        series_id: formSeriesId,
        workload: Number(formWorkload),
        next_deadline: formDeadline || new Date().toISOString()
      })
      setIsAddModalOpen(false)
      showToast(`Đã thêm thành công thành viên ${formName}!`)
      loadTeam()
    } catch (err: any) {
      console.error(err)
      alert(`Thêm thành viên thất bại: ${err.response?.data?.message || err.message || 'Lỗi hệ thống'}`)
    }
  }

  const handleOpenEditModal = (member: ApiTeamMember) => {
    setSelectedMember(member)
    setFormName(member.name)
    setFormRole(member.role)
    setFormSeriesId(member.series_id)
    setFormStatus(member.status)
    setFormWorkload(member.workload)
    
    let deadlineStr = member.next_deadline
    if (deadlineStr && deadlineStr !== '—') {
      try {
        const d = new Date(deadlineStr)
        if (!isNaN(d.getTime())) {
          deadlineStr = d.toISOString().split('T')[0]
        }
      } catch {}
    }
    setFormDeadline(deadlineStr)
    setIsEditModalOpen(true)
  }

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return
    try {
      await editorService.updateTeamMember(selectedMember.user_id, {
        role: formRole,
        series_id: formSeriesId,
        status: formStatus,
        workload: Number(formWorkload),
        next_deadline: formDeadline
      })
      setIsEditModalOpen(false)
      showToast(`Đã cập nhật thông tin của ${formName}!`)
      loadTeam()
    } catch (err: any) {
      console.error(err)
      alert(`Cập nhật thất bại: ${err.response?.data?.message || err.message || 'Lỗi hệ thống'}`)
    }
  }

  const handleDeleteMember = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên ${name} khỏi nhóm?`)) {
      try {
        await editorService.deleteTeamMember(id)
        showToast(`Đã xóa thành viên ${name} khỏi nhóm.`)
        loadTeam()
      } catch (err: any) {
        console.error(err)
        showToast(`Xóa thành viên thất bại: ${err.message}`)
      }
    }
  }

  const handleNudge = async (userId: string, name: string) => {
    try {
      await editorService.nudgeTeamMember(userId)
      showToast(`Đã gửi thông báo nhắc deadline thành công đến Mangaka ${name}!`)
    } catch (err: any) {
      console.error(err)
      showToast(`Gửi nhắc nhở thất bại: ${err.message}`)
    }
  }

  const handleOpenMeetingModal = (member: ApiTeamMember) => {
    setSelectedMember(member)
    setMeetingDate('')
    setMeetingTime('')
    setIsMeetingModalOpen(true)
  }

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember || !meetingDate || !meetingTime) {
      alert('Vui lòng nhập đầy đủ ngày và giờ họp!')
      return
    }
    try {
      await editorService.createMeeting({
        user_id: selectedMember.user_id,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        notes: `Họp về tiến độ với ${selectedMember.name}`
      })
      setIsMeetingModalOpen(false)
      showToast(`Đã lên lịch họp thành công với Mangaka ${selectedMember.name} vào ${meetingTime} ngày ${meetingDate}!`)
    } catch (err: any) {
      console.error(err)
      alert(`Lên lịch họp thất bại: ${err.response?.data?.message || err.message || 'Lỗi hệ thống'}`)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'MM'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === '—') return '—'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return date.toLocaleDateString('vi-VN')
    } catch {
      return dateStr
    }
  }

  const filteredTeam = team.filter(member => 
    (member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (member.series_title && member.series_title.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (filterRole === 'ALL' || member.role === filterRole)
  )

  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-manga-ink text-white px-6 py-3 border-4 border-manga-red shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle className="w-5 h-5 text-green-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none">
            NHÓM LÀM VIỆC
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-2">
            Quản lý Mangaka và Trợ lý thuộc các series bạn phụ trách
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={handleOpenAddModal}
            className="bg-manga-red hover:bg-red-600 text-white font-bold text-xs uppercase px-4 py-2 border-2 border-manga-ink shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Thêm Thành Viên
          </button>
          <div className="text-center px-4 py-2 border-2 border-manga-ink bg-white">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Mangaka</div>
            <div className="text-xl font-black">{team.filter(t => t.role === 'Mangaka').length}</div>
          </div>
          <div className="text-center px-4 py-2 border-2 border-manga-ink bg-white">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Trợ Lý</div>
            <div className="text-xl font-black">{team.filter(t => t.role === 'Assistant').length}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, series..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border-2 border-manga-ink focus:outline-none focus:border-red-600 text-sm font-bold transition-colors bg-white"
          />
        </div>
        
        <div className="flex bg-gray-100 p-1 border-2 border-manga-ink w-fit">
          <button 
            onClick={() => setFilterRole('ALL')}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase transition-colors ${filterRole === 'ALL' ? 'bg-white border-2 border-manga-ink text-manga-ink' : 'text-gray-500 hover:text-manga-ink'}`}
          >
            Tất Cả
          </button>
          <button 
            onClick={() => setFilterRole('Mangaka')}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase transition-colors ${filterRole === 'Mangaka' ? 'bg-white border-2 border-manga-ink text-manga-ink' : 'text-gray-500 hover:text-manga-ink'}`}
          >
            Mangaka
          </button>
          <button 
            onClick={() => setFilterRole('Assistant')}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase transition-colors ${filterRole === 'Assistant' ? 'bg-white border-2 border-manga-ink text-manga-ink' : 'text-gray-500 hover:text-manga-ink'}`}
          >
            Trợ Lý
          </button>
        </div>
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="bg-white border-4 border-manga-ink p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-manga-ink animate-spin" />
          <p className="font-bold text-manga-ink">Đang tải danh sách thành viên nhóm...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-4 border-red-600 p-6 text-center">
          <p className="font-bold text-lg text-red-600">{error}</p>
          <button
            onClick={loadTeam}
            className="mt-4 px-4 py-2 bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map(member => (
            <div key={member.user_id} className="bg-white border-4 border-manga-ink flex flex-col hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all relative group">
              
              {/* CRUD Actions Panel overlay in card */}
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button 
                  onClick={() => handleOpenEditModal(member)}
                  className="p-1.5 bg-white border border-manga-ink text-manga-ink hover:bg-gray-100 rounded-sm"
                  title="Chỉnh sửa thông tin"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDeleteMember(member.user_id, member.name)}
                  className="p-1.5 bg-white border border-manga-ink text-red-600 hover:bg-red-50 rounded-sm"
                  title="Xóa thành viên"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Header */}
              <div className="p-4 border-b-2 border-gray-100 flex items-start justify-between relative overflow-hidden">
                <div className="flex gap-3 relative z-10">
                  <div className="w-12 h-12 bg-gray-200 border-2 border-manga-ink flex flex-shrink-0 items-center justify-center font-black text-xl text-gray-500">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-manga-ink leading-tight">{member.name}</h3>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{member.role}</div>
                  </div>
                </div>
                <div className="relative z-10 mr-14 group-hover:mr-20 transition-all">
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                    <span className="text-[10px] font-bold text-gray-600">{member.status}</span>
                  </div>
                </div>

                {/* Decorative huge text */}
                <div className="absolute -right-4 -bottom-6 text-7xl font-black text-gray-50 opacity-50 select-none z-0">
                  {member.role === 'Mangaka' ? 'M' : 'A'}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col gap-4">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Dự án hiện tại</div>
                  <div className="text-sm font-bold text-manga-ink">{member.series_title || 'Chưa phân công'}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 border border-gray-200 p-2 flex flex-col items-center justify-center text-center">
                    <Calendar className="w-4 h-4 text-gray-400 mb-1" />
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Next Deadline</div>
                    <div className={`text-xs font-bold mt-0.5 ${member.status === 'LATE' ? 'text-red-600' : 'text-manga-ink'}`}>
                      {formatDate(member.next_deadline)}
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-2 flex flex-col items-center justify-center text-center">
                    <BarChart className="w-4 h-4 text-gray-400 mb-1" />
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Hiệu Suất</div>
                    <div className="text-xs font-bold text-green-600 mt-0.5">
                      {member.performance_score ? `${member.performance_score}%` : 'Tốt (92%)'}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Khối lượng CV (Workload)</span>
                    <span className="text-[10px] font-bold text-manga-ink">{member.workload}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200">
                    <div 
                      className={`h-full ${getWorkloadColor(member.workload)}`} 
                      style={{ width: `${member.workload}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions depending on Role */}
              {member.role === 'Mangaka' ? (
                <div className="flex border-t-2 border-manga-ink divide-x-2 divide-manga-ink">
                  <button 
                    type="button"
                    onClick={() => showToast(`Đã mở liên hệ với ${member.name}!`)} 
                    className="flex-1 py-3 text-[11px] font-bold text-manga-ink uppercase hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" /> Liên hệ
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleNudge(member.user_id, member.name)}
                    className="flex-1 py-3 text-[11px] font-bold text-manga-red uppercase hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                    title="Nhắc Deadline"
                  >
                    <Bell className="w-3.5 h-3.5" /> Nhắc nhở
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleOpenMeetingModal(member)}
                    className="flex-1 py-3 text-[11px] font-bold text-blue-600 uppercase hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
                    title="Lên lịch họp"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Lên lịch
                  </button>
                </div>
              ) : (
                <div className="flex border-t-2 border-manga-ink">
                  <button 
                    type="button"
                    onClick={() => showToast(`Đã mở liên hệ với ${member.name}!`)} 
                    className="flex-1 py-3 text-xs font-bold text-manga-ink uppercase hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" /> Liên hệ
                  </button>
                </div>
              )}
            </div>
          ))}
          {filteredTeam.length === 0 && (
            <div className="col-span-full bg-white border-4 border-manga-ink p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="font-bold text-lg text-manga-ink">Không tìm thấy thành viên nào!</p>
            </div>
          )}
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddMember} className="bg-white border-4 border-manga-ink p-6 max-w-md w-full animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b-2 border-gray-100 pb-3 mb-4">
              <h2 className="font-manga text-xl font-bold uppercase text-manga-ink">Thêm Thành Viên Mới</h2>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-manga-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Họ và Tên</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none focus:border-red-500" 
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vai Trò</label>
                <select 
                  value={formRole} 
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none bg-white"
                >
                  <option value="Mangaka">Mangaka (Tác giả chính)</option>
                  <option value="Assistant">Assistant (Trợ lý)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Series truyện phụ trách</label>
                <select 
                  value={formSeriesId}
                  onChange={(e) => setFormSeriesId(e.target.value)}
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none bg-white"
                  required
                >
                  <option value="">-- Chọn Series --</option>
                  {seriesList.map(s => (
                    <option key={s.series_id} value={s.series_id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Khối Lượng CV (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={formWorkload}
                    onChange={(e) => setFormWorkload(Number(e.target.value))}
                    className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deadline Tiếp Theo</label>
                  <input 
                    type="date" 
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trạng thái làm việc</label>
                <select 
                  value={formStatus} 
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none bg-white"
                >
                  <option value="ACTIVE">ACTIVE (Tốt)</option>
                  <option value="WARNING">WARNING (Cảnh báo)</option>
                  <option value="AT_RISK">AT_RISK (Nguy cơ)</option>
                  <option value="LATE">LATE (Trễ hạn)</option>
                  <option value="IDLE">IDLE (Nhàn rỗi)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t-2 border-gray-100 pt-4">
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border-2 border-gray-300 font-bold text-sm uppercase hover:bg-gray-50"
              >
                Hủy
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-manga-ink text-white font-bold text-sm uppercase hover:bg-black"
              >
                Xác nhận thêm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Member Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditMember} className="bg-white border-4 border-manga-ink p-6 max-w-md w-full animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b-2 border-gray-100 pb-3 mb-4">
              <h2 className="font-manga text-xl font-bold uppercase text-manga-ink">Chỉnh Sửa Thành Viên</h2>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-manga-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Họ và Tên</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none focus:border-red-500 bg-gray-50" 
                  disabled
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vai Trò</label>
                <select 
                  value={formRole} 
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none bg-white"
                >
                  <option value="Mangaka">Mangaka (Tác giả chính)</option>
                  <option value="Assistant">Assistant (Trợ lý)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Series truyện phụ trách</label>
                <select 
                  value={formSeriesId}
                  onChange={(e) => setFormSeriesId(e.target.value)}
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none bg-white"
                  required
                >
                  <option value="">-- Chọn Series --</option>
                  {seriesList.map(s => (
                    <option key={s.series_id} value={s.series_id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Khối Lượng CV (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={formWorkload}
                    onChange={(e) => setFormWorkload(Number(e.target.value))}
                    className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deadline Tiếp Theo</label>
                  <input 
                    type="date" 
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trạng thái làm việc</label>
                <select 
                  value={formStatus} 
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none bg-white"
                >
                  <option value="ACTIVE">ACTIVE (Tốt)</option>
                  <option value="WARNING">WARNING (Cảnh báo)</option>
                  <option value="AT_RISK">AT_RISK (Nguy cơ)</option>
                  <option value="LATE">LATE (Trễ hạn)</option>
                  <option value="IDLE">IDLE (Nhàn rỗi)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t-2 border-gray-100 pt-4">
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border-2 border-gray-300 font-bold text-sm uppercase hover:bg-gray-50"
              >
                Hủy
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-manga-ink text-white font-bold text-sm uppercase hover:bg-black"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meeting Modal */}
      {isMeetingModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleScheduleMeeting} className="bg-white border-4 border-manga-ink p-6 max-w-md w-full animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b-2 border-gray-100 pb-3 mb-4">
              <h2 className="font-manga text-xl font-bold uppercase text-manga-ink">Lên Lịch Họp Với Tác Giả</h2>
              <button type="button" onClick={() => setIsMeetingModalOpen(false)} className="text-gray-400 hover:text-manga-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 font-medium">
                Khởi tạo phòng họp hoặc cuộc trao đổi về tiến độ & kịch bản với Mangaka <span className="font-bold text-manga-ink">{selectedMember.name}</span>.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày Họp</label>
                <input 
                  type="date" 
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Thời Gian</label>
                <input 
                  type="time" 
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none" 
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t-2 border-gray-100 pt-4">
              <button 
                type="button" 
                onClick={() => setIsMeetingModalOpen(false)}
                className="px-4 py-2 border-2 border-gray-300 font-bold text-sm uppercase hover:bg-gray-50"
              >
                Hủy
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-manga-ink text-white font-bold text-sm uppercase hover:bg-black"
              >
                Lên Lịch
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
