import React, { useState } from 'react'
import { Link } from 'react-router'
import { Settings, Bell, Palette, Shield, Globe, Save, CalendarDays } from 'lucide-react'

export default function SettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(true)
  const [theme, setTheme] = useState('light')
  const [profilePublic, setProfilePublic] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none">
            CÀI ĐẶT HỆ THỐNG
          </h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3 mb-2" />
          <p className="text-sm font-bold text-gray-500">
            Tùy chỉnh trải nghiệm và cấu hình tài khoản mangaka của bạn
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-manga-red text-white font-bold uppercase px-6 py-3 border-2 border-manga-ink hover:bg-red-700 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none text-sm cursor-pointer">
          <Save className="w-4 h-4" />
          <span>Lưu cài đặt</span>
        </button>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-100 border-4 border-green-500 font-bold text-green-800 uppercase text-center shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-bounce">
          Đã lưu cài đặt thành công!
        </div>
      )}

      <div className="space-y-8">
        {/* Section: Notifications */}
        <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <h3 className="font-manga text-2xl font-bold uppercase border-b-4 border-manga-ink pb-3 mb-6 flex items-center gap-3">
            <Bell className="w-6 h-6 text-manga-red" />
            Thông báo
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-gray-50 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-red-50/20 transition-colors">
              <div>
                <span className="font-bold block text-sm">Thông báo qua Email</span>
                <span className="text-xs text-gray-500 font-semibold">Nhận email cập nhật khi trợ lý gửi báo cáo hoặc hoàn thành nhiệm vụ</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotif}
                onChange={() => setEmailNotif(!emailNotif)}
                className="w-5 h-5 accent-manga-red cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-50 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-red-50/20 transition-colors">
              <div>
                <span className="font-bold block text-sm">Thông báo trên trình duyệt</span>
                <span className="text-xs text-gray-500 font-semibold">Đẩy thông báo thời gian thực về bình luận từ Editor và yêu cầu chỉnh sửa</span>
              </div>
              <input
                type="checkbox"
                checked={pushNotif}
                onChange={() => setPushNotif(!pushNotif)}
                className="w-5 h-5 accent-manga-red cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Section: Appearance */}
        <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <h3 className="font-manga text-2xl font-bold uppercase border-b-4 border-manga-ink pb-3 mb-6 flex items-center gap-3">
            <Palette className="w-6 h-6 text-manga-red" />
            Giao diện vẽ & chỉnh sửa
          </h3>
          <div>
            <span className="font-bold text-sm block mb-3">Chế độ hiển thị</span>
            <div className="grid grid-cols-3 gap-4">
              {['light', 'dark', 'manga'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className={`p-3 border-2 border-manga-ink font-bold text-xs uppercase transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer ${theme === mode
                      ? 'bg-manga-red text-white'
                      : 'bg-white hover:bg-gray-50 text-black'
                    }`}
                >
                  {mode === 'light' ? 'Sáng' : mode === 'dark' ? 'Tối' : 'Manga Noir'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Privacy */}
        <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <h3 className="font-manga text-2xl font-bold uppercase border-b-4 border-manga-ink pb-3 mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-manga-red" />
            Quyền riêng tư
          </h3>
          <label className="flex items-center justify-between p-3 bg-gray-50 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-red-50/20 transition-colors">
            <div>
              <span className="font-bold block text-sm">Chế độ hồ sơ công khai</span>
              <span className="text-xs text-gray-500 font-semibold">Cho phép các trợ lý tìm thấy tin tuyển dụng hoặc dự án của bạn</span>
            </div>
            <input
              type="checkbox"
              checked={profilePublic}
              onChange={() => setProfilePublic(!profilePublic)}
              className="w-5 h-5 accent-manga-red cursor-pointer"
            />
          </label>
        </div>

        {/* Section: Language */}
        <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <h3 className="font-manga text-2xl font-bold uppercase border-b-4 border-manga-ink pb-3 mb-6 flex items-center gap-3">
            <Globe className="w-6 h-6 text-manga-red" />
            Ngôn ngữ hệ thống
          </h3>
          <select className="w-full bg-white border-2 border-manga-ink p-3 font-bold text-sm outline-none focus:ring-2 focus:ring-manga-red">
            <option value="vi">Tiếng Việt (Mặc định)</option>
            <option value="en">English (US)</option>
          </select>
        </div>
      </div>
      {/* Footer */}
      <footer className="mt-16 pt-8 border-t-2 border-manga-ink flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-gray-500">
        <div className="font-manga text-2xl text-manga-red">MangaFlow</div>
        <div>© 2026 MangaFlow System. Gangan Press Co. Ltd. All rights reserved.</div>
        <div className="flex items-center gap-6">
          <Link to="/dashboard/mangaka" className="hover:text-manga-red transition-colors flex items-center gap-1">
            <CalendarDays className="w-4 h-4" /> Lịch trình
          </Link>
          <a href="#" className="hover:text-manga-red transition-colors">Quy tắc xuất bản</a>
          <a href="#" className="hover:text-manga-red transition-colors">Hỗ trợ Mangaka</a>
        </div>
      </footer>
    </div>
  )
}
