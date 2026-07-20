import React, { useState, useEffect } from 'react'
import { Save, Check, ShieldAlert, Loader2 } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import api from '@/services/api'

export default function UserSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [saved, setSaved] = useState(false)

  const [selectedRole, setSelectedRole] = useState('mangaka')
  const [isSubmittingRole, setIsSubmittingRole] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setUser(parsed)
      setFullName(parsed.fullName || '')
      setEmail(parsed.email || '')
      setBio(parsed.bio || '')
    }
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const updatedUser = {
      ...user,
      fullName,
      email,
      bio
    }

    localStorage.setItem('mangaflow_user', JSON.stringify(updatedUser))
    setUser(updatedUser)
    
    // Dispatch custom event to notify Sidebar/Header to update profile
    window.dispatchEvent(new Event('mangaflow_profile_updated'))
    
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleRequestRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingRole(true)
    try {
      await api.post('/api/users/request-role', { role: selectedRole })
      showToast('Đã gửi yêu cầu thành công, vui lòng chờ Admin duyệt', 'success')
    } catch (error: any) {
      if (error.response?.status === 429) {
        showToast('Bạn đã gửi một yêu cầu gần đây rồi, xin vui lòng đợi thêm', 'warning')
      } else if (error.response?.status === 400) {
        showToast('Bạn đã sở hữu quyền này rồi', 'error')
      } else {
        showToast('Đã có lỗi xảy ra, vui lòng thử lại sau', 'error')
      }
    } finally {
      setIsSubmittingRole(false)
    }
  }


  if (!user) {
    return <div className="p-8 text-center text-red-500 font-bold">Đang tải cấu hình...</div>
  }

  return (
    <div className="max-w-3xl mx-auto py-8 font-sans">
      <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase text-manga-ink mb-2">
        CÀI ĐẶT HỆ THỐNG
      </h1>
      <div className="h-1.5 w-24 bg-manga-red mb-3" />
      <p className="text-xs font-bold text-gray-500 uppercase mb-8">
        Thay đổi thông tin tài khoản, tỉnh chỉnh cấu hình và tuỳ chọn thông báo của bạn
      </p>

      <div className="bg-white border-4 border-manga-ink p-6 shadow-[8px_8px_0px_rgba(15,15,15,1)]">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-black uppercase text-manga-ink mb-2">HỌ VÀ TÊN</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full border-2 border-manga-ink p-2.5 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black uppercase text-manga-ink mb-2">EMAIL LIÊN HỆ</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-manga-ink p-2.5 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50"
                required
              />
            </div>
          </div>

          {/* Biography */}
          <div>
            <label className="block text-xs font-black uppercase text-manga-ink mb-2">GIỚI THIỆU TIỂU SỬ</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full border-2 border-manga-ink p-3 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50 h-24"
              placeholder="Nhập thông tin giới thiệu ngắn về bạn..."
            />
          </div>

          {/* Toggle preferences */}
          <div className="border-t-2 border-dashed border-gray-200 pt-6">
            <h3 className="text-sm font-black uppercase text-manga-ink mb-3">TÙY CHỌN THÔNG BÁO</h3>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={e => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 border-2 border-manga-ink accent-manga-red cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-700">Nhận thông báo đẩy trên hệ thống khi có tương tác mới.</span>
            </label>
          </div>

          {/* Save button actions */}
          <div className="border-t-4 border-manga-ink pt-6 flex justify-between items-center">
            <div>
              {saved && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fade-in">
                  <Check className="w-4 h-4" />
                  <span>Đã cập nhật cài đặt thành công.</span>
                </span>
              )}
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 bg-manga-ink text-white font-manga font-bold text-xs uppercase px-6 py-3 border-2 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>LƯU CÀI ĐẶT</span>
            </button>
          </div>
        </form>
      </div>

      {/* Request Role Section */}
      <div className="bg-white border-4 border-manga-ink p-6 shadow-[8px_8px_0px_rgba(15,15,15,1)] mt-8">
        <h2 className="text-lg font-black uppercase text-manga-ink mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-manga-red" />
          Xin cấp quyền đặc biệt
        </h2>
        <p className="text-xs font-bold text-gray-500 mb-6">
          Bạn có thể gửi yêu cầu cấp quyền đặc biệt trên hệ thống. Admin sẽ xem xét hồ sơ của bạn.
        </p>
        
        <form onSubmit={handleRequestRole} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-black uppercase text-manga-ink mb-2">Vai trò muốn nâng cấp</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border-2 border-manga-ink p-3 text-sm font-bold outline-none focus:border-manga-red bg-zinc-50"
              disabled={isSubmittingRole}
            >
              <option value="mangaka">Mangaka (Tác giả)</option>
              <option value="assistant">Assistant (Trợ lý)</option>
              <option value="editor">Editor (Biên tập viên)</option>
              <option value="board">Board (Ban biên tập)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmittingRole}
            className="flex items-center justify-center gap-2 bg-manga-ink text-white font-manga font-bold text-sm uppercase px-8 py-3 h-[52px] border-2 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingRole ? <Loader2 className="w-5 h-5 animate-spin" /> : 'GỬI YÊU CẦU'}
          </button>
        </form>
      </div>

    </div>
  )
}
