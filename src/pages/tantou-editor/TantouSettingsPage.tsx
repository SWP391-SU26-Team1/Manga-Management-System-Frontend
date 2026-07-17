import React, { useState, useEffect } from 'react'
import { Settings, Bell, Lock, User, Palette, CheckCircle2, Loader2 } from 'lucide-react'
import { editorService } from '@/services/editor.service'

type SettingsTab = 'PROFILE' | 'NOTIFICATIONS' | 'APPEARANCE' | 'SECURITY'

export default function TantouSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('PROFILE')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Profile form
  const [profileName, setProfileName] = useState('')
  const [profileUsername, setProfileUsername] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profileTitle, setProfileTitle] = useState('Tantou Editor')

  // Security form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Notification settings (saved to localStorage since no API)
  const [notifNewManuscript, setNotifNewManuscript] = useState(true)
  const [notifDeadline, setNotifDeadline] = useState(true)
  const [notifRanking, setNotifRanking] = useState(false)
  const [notifBoard, setNotifBoard] = useState(true)

  useEffect(() => {
    fetchUserProfile()
    loadNotificationSettings()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true)
      const res = await editorService.getCurrentUser()
      const user = res.data || res
      setProfileName(user.fullName || user.full_name || user.username || '')
      setProfileUsername(user.username || '')
      setProfileEmail(user.email || '')
      setProfileTitle(user.role === 'editor' ? 'Tantou Editor' : user.role || 'Tantou Editor')
    } catch (err: any) {
      console.error('Failed to load profile:', err)
      // Fallback to localStorage
      const stored = localStorage.getItem('mangaflow_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const user = parsed.user || parsed
          setProfileName(user.fullName || user.username || '')
          setProfileUsername(user.username || '')
          setProfileEmail(user.email || '')
        } catch {}
      }
    } finally {
      setLoadingProfile(false)
    }
  }

  const loadNotificationSettings = () => {
    const saved = localStorage.getItem('mangaflow_notif_settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setNotifNewManuscript(parsed.newManuscript ?? true)
        setNotifDeadline(parsed.deadline ?? true)
        setNotifRanking(parsed.ranking ?? false)
        setNotifBoard(parsed.board ?? true)
      } catch {}
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSaveProfile = () => {
    // Update localStorage
    const stored = localStorage.getItem('mangaflow_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.user) {
          parsed.user.fullName = profileName
          parsed.user.username = profileUsername
        }
        localStorage.setItem('mangaflow_user', JSON.stringify(parsed))
      } catch {}
    }
    showToast('Đã lưu thay đổi hồ sơ cá nhân thành công!')
  }

  const handleSaveNotifications = () => {
    localStorage.setItem('mangaflow_notif_settings', JSON.stringify({
      newManuscript: notifNewManuscript,
      deadline: notifDeadline,
      ranking: notifRanking,
      board: notifBoard,
    }))
    showToast('Đã cập nhật cài đặt thông báo!')
  }

  const handleChangeAvatar = () => {
    showToast('Chức năng thay đổi avatar sẽ được kích hoạt khi kết nối API!')
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Vui lòng điền đầy đủ các trường mật khẩu!')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu mới và xác nhận không khớp!')
      return
    }
    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự!')
      return
    }

    try {
      setChangingPassword(true)
      await editorService.changePassword({
        currentPassword,
        newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Đã cập nhật mật khẩu thành công!')
    } catch (err: any) {
      console.error('Failed to change password:', err)
      const errorMsg = err.response?.data?.message || 'Lỗi khi đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.'
      showToast(errorMsg)
    } finally {
      setChangingPassword(false)
    }
  }

  const TABS: { key: SettingsTab; label: string; icon: typeof User }[] = [
    { key: 'PROFILE', label: 'Hồ Sơ Cá Nhân', icon: User },
    { key: 'NOTIFICATIONS', label: 'Thông Báo', icon: Bell },
    { key: 'APPEARANCE', label: 'Giao Diện', icon: Palette },
    { key: 'SECURITY', label: 'Bảo Mật', icon: Lock },
  ]

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-manga-ink text-white px-6 py-3 border-4 border-manga-red shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          {toastMessage}
        </div>
      )}

      <div className="mb-6">
        <h1 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none">
          CÀI ĐẶT HỆ THỐNG
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-2">
          Cấu hình thông báo và tùy chỉnh giao diện
        </p>
      </div>

      <div className="flex gap-8">
        <div className="w-64 flex-shrink-0 flex flex-col gap-2">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 font-bold text-sm uppercase transition-colors border-2 ${
                  activeTab === tab.key
                    ? 'bg-manga-ink text-white border-manga-ink'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-manga-ink'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1 bg-white border-4 border-manga-ink p-8">
          {/* PROFILE TAB */}
          {activeTab === 'PROFILE' && (
            <>
              <h2 className="font-manga text-2xl font-bold uppercase text-manga-ink mb-6 border-b-2 border-gray-100 pb-2">
                Hồ Sơ Cá Nhân
              </h2>
              
              {loadingProfile ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-manga-red mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-500">Đang tải thông tin...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-6 mb-8">
                    <div className="w-24 h-24 bg-gray-200 border-2 border-manga-ink flex items-center justify-center font-black text-4xl text-gray-400">
                      {profileName ? profileName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <button onClick={handleChangeAvatar} className="px-4 py-2 bg-white border-2 border-manga-ink text-xs font-bold uppercase mb-2 hover:bg-gray-50">
                        Thay Đổi Avatar
                      </button>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">JPG, PNG tối đa 2MB.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Họ & Tên</label>
                        <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full border-2 border-manga-ink p-2 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tên hiển thị (Username)</label>
                        <input type="text" value={profileUsername} onChange={(e) => setProfileUsername(e.target.value)} className="w-full border-2 border-manga-ink p-2 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Công Việc</label>
                      <input type="email" value={profileEmail} disabled className="w-full border-2 border-gray-200 p-2 text-sm font-bold bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Chức Vụ</label>
                      <input type="text" value={profileTitle} onChange={(e) => setProfileTitle(e.target.value)} className="w-full border-2 border-manga-ink p-2 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none" />
                    </div>

                    <button onClick={handleSaveProfile} className="bg-manga-ink text-white px-6 py-3 font-bold uppercase text-sm mt-4 hover:bg-black transition-colors">
                      Lưu Thay Đổi
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'NOTIFICATIONS' && (
            <>
              <h2 className="font-manga text-2xl font-bold uppercase text-manga-ink mb-6 border-b-2 border-gray-100 pb-2">
                Cài Đặt Thông Báo
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border-2 border-gray-200 hover:border-manga-ink transition-colors cursor-pointer">
                  <div>
                    <div className="font-bold text-sm text-manga-ink">Bản thảo mới nộp</div>
                    <div className="text-xs text-gray-500 mt-0.5">Nhận thông báo khi Mangaka nộp bản thảo mới</div>
                  </div>
                  <input type="checkbox" checked={notifNewManuscript} onChange={(e) => setNotifNewManuscript(e.target.checked)} className="w-5 h-5 accent-manga-ink" />
                </label>
                <label className="flex items-center justify-between p-4 border-2 border-gray-200 hover:border-manga-ink transition-colors cursor-pointer">
                  <div>
                    <div className="font-bold text-sm text-manga-ink">Cảnh báo Deadline</div>
                    <div className="text-xs text-gray-500 mt-0.5">Thông báo khi có chapter sắp trễ hoặc đã trễ deadline</div>
                  </div>
                  <input type="checkbox" checked={notifDeadline} onChange={(e) => setNotifDeadline(e.target.checked)} className="w-5 h-5 accent-manga-ink" />
                </label>
                <label className="flex items-center justify-between p-4 border-2 border-gray-200 hover:border-manga-ink transition-colors cursor-pointer">
                  <div>
                    <div className="font-bold text-sm text-manga-ink">Thay đổi Ranking</div>
                    <div className="text-xs text-gray-500 mt-0.5">Thông báo khi ranking series thay đổi đáng kể</div>
                  </div>
                  <input type="checkbox" checked={notifRanking} onChange={(e) => setNotifRanking(e.target.checked)} className="w-5 h-5 accent-manga-ink" />
                </label>
                <label className="flex items-center justify-between p-4 border-2 border-gray-200 hover:border-manga-ink transition-colors cursor-pointer">
                  <div>
                    <div className="font-bold text-sm text-manga-ink">Phiên họp Editorial Board</div>
                    <div className="text-xs text-gray-500 mt-0.5">Nhắc nhở khi có cuộc họp ban biên tập sắp diễn ra</div>
                  </div>
                  <input type="checkbox" checked={notifBoard} onChange={(e) => setNotifBoard(e.target.checked)} className="w-5 h-5 accent-manga-ink" />
                </label>
              </div>
              <button onClick={handleSaveNotifications} className="bg-manga-ink text-white px-6 py-3 font-bold uppercase text-sm mt-6 hover:bg-black transition-colors">
                Lưu Cài Đặt
              </button>
            </>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'APPEARANCE' && (
            <>
              <h2 className="font-manga text-2xl font-bold uppercase text-manga-ink mb-6 border-b-2 border-gray-100 pb-2">
                Giao Diện
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Chế độ hiển thị</label>
                  <div className="flex gap-4">
                    <button onClick={() => showToast('Đã chuyển sang giao diện Sáng!')} className="flex-1 p-4 border-4 border-manga-ink bg-white text-center font-bold text-sm hover:bg-gray-50 transition-colors">
                      ☀️ Sáng (Light)
                    </button>
                    <button onClick={() => showToast('Chế độ tối sẽ được cập nhật trong phiên bản tới!')} className="flex-1 p-4 border-2 border-gray-300 bg-gray-100 text-center font-bold text-sm text-gray-400">
                      🌙 Tối (Dark) - Sắp ra mắt
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ngôn ngữ</label>
                  <select className="w-full border-2 border-manga-ink p-2 text-sm font-bold bg-gray-50 focus:outline-none">
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="ja">🇯🇵 日本語</option>
                    <option value="en">🇺🇸 English</option>
                  </select>
                </div>
              </div>
              <button onClick={() => showToast('Đã lưu cài đặt giao diện!')} className="bg-manga-ink text-white px-6 py-3 font-bold uppercase text-sm mt-6 hover:bg-black transition-colors">
                Lưu Cài Đặt
              </button>
            </>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'SECURITY' && (
            <>
              <h2 className="font-manga text-2xl font-bold uppercase text-manga-ink mb-6 border-b-2 border-gray-100 pb-2">
                Bảo Mật
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mật khẩu hiện tại</label>
                  <input type="password" placeholder="Nhập mật khẩu hiện tại..." value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mật khẩu mới</label>
                  <input type="password" placeholder="Nhập mật khẩu mới..." value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Xác nhận mật khẩu mới</label>
                  <input type="password" placeholder="Nhập lại mật khẩu mới..." value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none" />
                </div>
              </div>
              <button onClick={handleChangePassword} disabled={changingPassword}
                className="bg-manga-ink text-white px-6 py-3 font-bold uppercase text-sm mt-6 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {changingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                Đổi Mật Khẩu
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
