import React, { useEffect, useState, useRef } from 'react'
import { User, Mail, Award, BookOpen, Star, Briefcase, Edit3, Save, X, Camera, Loader2 } from 'lucide-react'
import { userService, UserProfileAPI } from '@/services/user.service'
import { uploadService } from '@/services/upload.service'
import assistantService from '@/services/assistant.service'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileAPI | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Real stats states
  const [activeTasksCount, setActiveTasksCount] = useState(0)
  const [completedTasksCount, setCompletedTasksCount] = useState(0)
  const [completionRate, setCompletionRate] = useState(100)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchProfileAndStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // 1. Fetch user profile
      const user = await userService.getMe()
      setProfile(user)
      setEditName(user.fullName)
      setEditEmail(user.email)
      setEditBio(user.bio || '')
      setEditAvatarUrl(user.avatarUrl || '')

      // Sync to localStorage
      const stored = localStorage.getItem('mangaflow_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        const merged = {
          ...parsed,
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl || parsed.avatarUrl,
          bio: user.bio,
          role: user.role,
        }
        localStorage.setItem('mangaflow_user', JSON.stringify(merged))
        window.dispatchEvent(new Event('mangaflow_profile_updated'))
      }

      // 2. Fetch real assistant stats
      const [overview, performance] = await Promise.all([
        assistantService.getOverview(),
        assistantService.getPerformance(),
      ])
      
      setActiveTasksCount((overview?.in_progress || 0) + (overview?.assigned || 0) + (overview?.needs_revision || 0))
      setCompletedTasksCount(performance?.completed_tasks || 0)
      setCompletionRate(performance?.completion_rate_pct || 100)
    } catch (err: any) {
      console.error('ProfilePage fetch error:', err)
      // Fallback to localStorage if offline or token issues
      const stored = localStorage.getItem('mangaflow_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        const fbProfile: UserProfileAPI = {
          id: parsed.id || '',
          username: parsed.username || '',
          email: parsed.email || '',
          role: parsed.role || 'ASSISTANT',
          fullName: parsed.fullName || parsed.username || '',
          avatarUrl: parsed.avatarUrl,
          bio: parsed.bio,
        }
        setProfile(fbProfile)
        setEditName(fbProfile.fullName)
        setEditEmail(fbProfile.email)
        setEditBio(fbProfile.bio || '')
        setEditAvatarUrl(fbProfile.avatarUrl || '')
      } else {
        setError('Không thể tải hồ sơ. Vui lòng đăng nhập lại.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileAndStats()
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setIsSaving(true)
    setSaveError(null)
    try {
      // Only update avatar_url if it's a real URL (not a base64 string)
      const avatarToSend = editAvatarUrl && editAvatarUrl.startsWith('http')
        ? editAvatarUrl
        : undefined

      const updated = await userService.updateProfile(profile.id, {
        name: editName,
        email: editEmail,
        bio: editBio,
        avatar_url: avatarToSend,
      })

      const merged: UserProfileAPI = {
        ...profile,
        fullName: updated.fullName,
        email: updated.email,
        bio: updated.bio,
        avatarUrl: updated.avatarUrl || (avatarToSend ?? profile.avatarUrl),
      }
      setProfile(merged)

      // Sync updated data back to localStorage for real-time header/sidebar sync
      const stored = localStorage.getItem('mangaflow_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        localStorage.setItem('mangaflow_user', JSON.stringify({
          ...parsed,
          fullName: merged.fullName,
          email: merged.email,
          avatarUrl: merged.avatarUrl,
          bio: merged.bio,
        }))
        window.dispatchEvent(new Event('mangaflow_profile_updated'))
      }
      setIsEditing(false)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi không xác định'
      setSaveError(`Không thể lưu hồ sơ: ${msg}`)
      console.error('updateProfile API failed:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show temporary preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setEditAvatarUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploadingAvatar(true)
    try {
      const result = await uploadService.uploadSingle(file, 'avatars')
      const realUrl = result.secure_url
      setEditAvatarUrl(realUrl)

      // Sync avatar preview with localStorage instantly
      const stored = localStorage.getItem('mangaflow_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        localStorage.setItem('mangaflow_user', JSON.stringify({ ...parsed, avatarUrl: realUrl }))
        window.dispatchEvent(new Event('mangaflow_profile_updated'))
      }
    } catch (err) {
      console.error('Avatar upload failed:', err)
      alert('Không thể upload ảnh lên server. Ảnh sẽ chỉ hiển thị tạm thời.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditName(profile.fullName)
      setEditEmail(profile.email)
      setEditBio(profile.bio || '')
      setEditAvatarUrl(profile.avatarUrl || '')

      // Revert sidebar preview
      const stored = localStorage.getItem('mangaflow_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        localStorage.setItem('mangaflow_user', JSON.stringify({ ...parsed, avatarUrl: profile.avatarUrl }))
        window.dispatchEvent(new Event('mangaflow_profile_updated'))
      }
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-manga-red" />
        <p className="font-bold uppercase text-gray-500">Đang tải hồ sơ...</p>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="p-8 text-center bg-[#FFF5F5] border-4 border-manga-ink shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-md mx-auto my-12">
        <p className="font-bold text-[#E63946] text-lg mb-4">{error}</p>
        <button
          onClick={fetchProfileAndStats}
          className="bg-[#E63946] text-white px-4 py-2 border-2 border-manga-ink font-bold uppercase text-xs hover:bg-white hover:text-[#E63946] transition-colors"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (!profile) return null

  // Calculate initials for avatar fallback
  const nameParts = profile.fullName.trim().split(' ')
  const userInitials = nameParts.length >= 2
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : profile.fullName.slice(0, 2).toUpperCase()

  const currentAvatar = isEditing ? editAvatarUrl : profile.avatarUrl
  const defaultSkills = profile.skills || ['Inking', 'Coloring', 'Backgrounds', 'SFX Effects']

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Header Title */}
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none">
            HỒ SƠ CÁ NHÂN
          </h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3 mb-2" />
          <p className="text-sm font-bold text-gray-500">
            Quản lý thông tin công khai và các chỉ số hoạt động của trợ lý
          </p>
        </div>
        <div className="flex gap-4">
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-manga-red text-white font-bold uppercase px-6 py-3 border-2 border-manga-ink hover:bg-red-700 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none text-sm cursor-pointer disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          )}
          <button
            onClick={() => {
              if (isEditing) handleCancel()
              else setIsEditing(true)
            }}
            disabled={isSaving}
            className="flex items-center gap-2 bg-manga-ink text-white font-bold uppercase px-6 py-3 border-2 border-manga-ink hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none text-sm cursor-pointer disabled:opacity-60"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            <span>{isEditing ? 'Hủy' : 'Chỉnh sửa'}</span>
          </button>
        </div>
      </div>

      {/* Save error banner */}
      {saveError && (
        <div className="mb-6 flex items-center justify-between gap-3 bg-red-50 border-2 border-red-500 px-4 py-3 text-red-700 font-bold text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
          <button onClick={() => setSaveError(null)} className="underline text-xs">Đóng</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-8">
          {/* Main Card */}
          <div className="bg-white border-4 border-manga-ink shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div
                className={`w-32 h-32 rounded-full border-4 border-manga-ink bg-manga-red overflow-hidden flex items-center justify-center text-white font-extrabold text-4xl shadow-[4px_4px_0px_rgba(0,0,0,1)] relative ${isEditing && !isUploadingAvatar ? 'cursor-pointer group' : ''}`}
                onClick={() => isEditing && !isUploadingAvatar && fileInputRef.current?.click()}
              >
                {isUploadingAvatar ? (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    <span className="text-[10px] font-bold text-white mt-1 uppercase">Tải lên...</span>
                  </div>
                ) : null}
                {currentAvatar ? (
                  <img src={currentAvatar} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
                {isEditing && !isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-xs font-bold uppercase text-white">Đổi ảnh</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-400 border-2 border-manga-ink rounded-full" title="Đang hoạt động" />
              {isEditing && (
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              )}
            </div>

            {isEditing ? (
              <div className="w-full space-y-4 text-left mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Họ Tên</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm font-bold focus:ring-2 focus:ring-manga-red outline-none"
                  />
                </div>
              </div>
            ) : (
              <h2 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none mb-2">
                {profile.fullName}
              </h2>
            )}

            <div className="inline-block px-3 py-1 bg-manga-red text-white font-bold uppercase text-xs border-2 border-manga-ink mb-4">
              {profile.role === 'ASSISTANT' ? 'TRỢ LÝ HỌA SĨ' : profile.role}
            </div>

            <div className="w-full space-y-3 mt-2 text-left">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-700 p-2 bg-gray-50 border-2 border-dashed border-gray-300">
                <User className="w-4 h-4 text-manga-red shrink-0" />
                <span className="truncate">@{profile.username}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-gray-700 p-2 bg-gray-50 border-2 border-dashed border-gray-300">
                <Mail className="w-4 h-4 text-manga-red shrink-0" />
                {isEditing ? (
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="flex-1 border-b-2 border-manga-ink bg-transparent outline-none focus:border-manga-red min-w-0"
                  />
                ) : (
                  <span className="truncate">{profile.email}</span>
                )}
              </div>
            </div>
          </div>

          {/* Bio Card */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <h3 className="font-bold text-lg uppercase border-b-2 border-manga-ink pb-2 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-manga-red" /> Tiểu sử
            </h3>
            {isEditing ? (
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                rows={4}
                placeholder="Mô tả về bản thân bạn..."
                className="w-full border-2 border-manga-ink p-2 text-sm font-medium focus:ring-2 focus:ring-manga-red outline-none resize-none"
              />
            ) : (
              <p className="text-gray-700 font-medium text-sm leading-relaxed whitespace-pre-line">
                {profile.bio || 'Chưa cập nhật tiểu sử.'}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Stats & Publications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border-4 border-manga-ink p-4 flex flex-col items-center text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <Star className="w-8 h-8 text-yellow-400 mb-2" fill="currentColor" />
              <span className="text-3xl font-black font-manga">{completionRate}%</span>
              <span className="text-xs font-bold uppercase text-gray-500 mt-1">Hoàn thành</span>
            </div>
            <div className="bg-white border-4 border-manga-ink p-4 flex flex-col items-center text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <Briefcase className="w-8 h-8 text-manga-red mb-2" />
              <span className="text-3xl font-black font-manga">{activeTasksCount}</span>
              <span className="text-xs font-bold uppercase text-gray-500 mt-1">Đang thực hiện</span>
            </div>
            <div className="bg-white border-4 border-manga-ink p-4 flex flex-col items-center text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <BookOpen className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-3xl font-black font-manga">{completedTasksCount}</span>
              <span className="text-xs font-bold uppercase text-gray-500 mt-1">Đã hoàn thành</span>
            </div>
          </div>

          {/* Publications / Skills */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <h3 className="font-manga text-2xl font-bold uppercase border-b-4 border-manga-ink pb-3 mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-manga-red" />
              Kỹ năng chuyên môn
            </h3>
            <div className="flex flex-wrap gap-3">
              {defaultSkills.map((item, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 bg-gray-50 border-2 border-manga-ink font-bold text-sm uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:text-white transition-colors cursor-default"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity (dynamic info) */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <h3 className="font-manga text-2xl font-bold uppercase border-b-4 border-manga-ink pb-3 mb-6">
              Hoạt động gần đây
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 border-l-4 border-manga-red pl-4 py-1">
                <div className="w-2 h-2 rounded-full bg-manga-red mt-1.5 -ml-[23px]"></div>
                <div>
                  <p className="font-bold text-sm">Đồng bộ hóa dữ liệu tài khoản với backend</p>
                  <span className="text-xs text-gray-500 font-bold uppercase">Hệ thống</span>
                </div>
              </div>
              <div className="flex items-start gap-4 border-l-4 border-gray-300 pl-4 py-1">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 -ml-[23px]"></div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Đã cập nhật đầy đủ các API hiệu suất</p>
                  <span className="text-xs text-gray-500 font-bold uppercase">Hệ thống</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

