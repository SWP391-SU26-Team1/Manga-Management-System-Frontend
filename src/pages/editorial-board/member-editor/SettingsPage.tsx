import React, { useState, useEffect } from 'react'
import { Save, Check } from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [saved, setSaved] = useState(false)

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

  if (!user) {
    return <div className="p-8 text-center text-red-500 font-bold">Đang tải cấu hình...</div>
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 font-sans">
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
              <span className="text-xs font-bold text-gray-700">Nhận thông báo đẩy trên hệ thống khi có yêu cầu biểu quyết hoặc tranh chấp mới.</span>
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
              className="flex items-center gap-2 bg-manga-ink text-white font-manga font-bold text-xs uppercase px-6 py-3 border-2 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer font-bold"
            >
              <Save className="w-4 h-4" />
              <span>LƯU CÀI ĐẶT</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
