import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Camera, Edit3, Mail, Save, ShieldCheck, User, X } from 'lucide-react'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTableFrame } from '@/components/admin/AdminTableFrame'

type AdminProfile = {
  id?: string
  username?: string
  email?: string
  role?: string
  fullName?: string
  avatarUrl?: string
  bio?: string
  token?: string
}

const fallbackProfile: AdminProfile = {
  username: 'admin',
  email: 'admin@mangaflow.com',
  role: 'ADMIN',
  fullName: 'Admin',
  avatarUrl: 'https://i.pravatar.cc/150?u=admin',
  bio: '',
}

const inputClass =
  'w-full border-2 border-manga-ink bg-white px-4 py-3 text-sm font-bold outline-none focus:shadow-[3px_3px_0_rgba(232,23,63,1)]'
const labelClass = 'mb-2 block text-xs font-black uppercase tracking-widest text-gray-600'

const getInitials = (profile: AdminProfile) => {
  const source = profile.fullName || profile.username || profile.email || 'AD'
  return source
    .split(' ')
    .map((item) => item[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const loadProfile = (): AdminProfile => {
  const storedUser = localStorage.getItem('mangaflow_user')
  if (!storedUser) return fallbackProfile

  try {
    return { ...fallbackProfile, ...JSON.parse(storedUser) }
  } catch {
    return fallbackProfile
  }
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile>(() => loadProfile())
  const [isEditing, setIsEditing] = useState(false)
  const [editFullName, setEditFullName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadedProfile = loadProfile()
    setProfile(loadedProfile)
    setEditFullName(loadedProfile.fullName || loadedProfile.username || '')
    setEditEmail(loadedProfile.email || '')
    setEditBio(loadedProfile.bio || '')
    setEditAvatarUrl(loadedProfile.avatarUrl || '')
  }, [])

  const syncProfile = (nextProfile: AdminProfile) => {
    setProfile(nextProfile)
    localStorage.setItem('mangaflow_user', JSON.stringify(nextProfile))
    window.dispatchEvent(new Event('mangaflow_profile_updated'))
  }

  const handleSave = () => {
    const nextProfile = {
      ...profile,
      fullName: editFullName.trim() || profile.fullName || profile.username,
      email: editEmail.trim(),
      bio: editBio.trim(),
      avatarUrl: editAvatarUrl,
    }

    syncProfile(nextProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditFullName(profile.fullName || profile.username || '')
    setEditEmail(profile.email || '')
    setEditBio(profile.bio || '')
    setEditAvatarUrl(profile.avatarUrl || '')
    window.dispatchEvent(new Event('mangaflow_profile_updated'))
    setIsEditing(false)
  }

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setEditAvatarUrl(base64)
      syncProfile({ ...profile, avatarUrl: base64 })
    }
    reader.readAsDataURL(file)
  }

  const avatarSource = isEditing ? editAvatarUrl : profile.avatarUrl

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Hồ sơ cá nhân"
        description="Cập nhật thông tin hiển thị của tài khoản quản trị đang đăng nhập."
        action={
          <div className="flex flex-wrap gap-3">
            {isEditing && (
              <AdminButton icon={Save} onClick={handleSave}>
                Lưu thay đổi
              </AdminButton>
            )}
            <AdminButton
              variant={isEditing ? 'white' : 'dark'}
              icon={isEditing ? X : Edit3}
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
            >
              {isEditing ? 'Hủy' : 'Chỉnh sửa hồ sơ'}
            </AdminButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <AdminTableFrame className="p-7">
          <div className="flex flex-col items-center text-center">
            <button
              type="button"
              disabled={!isEditing}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative flex h-36 w-36 items-center justify-center overflow-hidden border-4 border-manga-ink bg-manga-red font-manga text-5xl font-black text-white shadow-[6px_6px_0_rgba(0,0,0,1)] ${isEditing ? 'cursor-pointer' : ''}`}
            >
              {avatarSource ? (
                <img src={avatarSource} alt={profile.username || 'admin'} className="h-full w-full object-cover" />
              ) : (
                getInitials(profile)
              )}
              {isEditing && (
                <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-xs font-black uppercase opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="mb-2 h-7 w-7" />
                  Đổi ảnh
                </span>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

            <h2 className="mt-6 font-manga text-3xl font-black uppercase">{profile.username || 'admin'}</h2>
            <div className="mt-3 inline-flex items-center gap-2 border-2 border-manga-ink bg-manga-red px-4 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0_rgba(0,0,0,1)]">
              <ShieldCheck className="h-4 w-4" />
              {profile.role === 'ADMIN' ? 'Quản trị viên' : profile.role || 'Quản trị viên'}
            </div>
          </div>
        </AdminTableFrame>

        <AdminTableFrame className="p-7">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label>
              <span className={labelClass}>Tên đăng nhập</span>
              <div className="flex items-center gap-3 border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-black">
                <User className="h-5 w-5 text-manga-red" />
                @{profile.username || 'admin'}
              </div>
            </label>

            <label>
              <span className={labelClass}>Email</span>
              {isEditing ? (
                <input value={editEmail} onChange={(event) => setEditEmail(event.target.value)} className={inputClass} />
              ) : (
                <div className="flex items-center gap-3 border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-black">
                  <Mail className="h-5 w-5 text-manga-red" />
                  {profile.email || 'Chưa có email'}
                </div>
              )}
            </label>

            <label className="md:col-span-2">
              <span className={labelClass}>Tên hiển thị</span>
              {isEditing ? (
                <input value={editFullName} onChange={(event) => setEditFullName(event.target.value)} className={inputClass} />
              ) : (
                <div className="border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-black">
                  {profile.fullName || profile.username || 'Admin'}
                </div>
              )}
            </label>

            <label className="md:col-span-2">
              <span className={labelClass}>Tiểu sử</span>
              {isEditing ? (
                <textarea
                  value={editBio}
                  onChange={(event) => setEditBio(event.target.value)}
                  className={`${inputClass} min-h-32 resize-y`}
                  placeholder="Thêm mô tả ngắn về tài khoản quản trị..."
                />
              ) : (
                <div className="min-h-32 border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                  {profile.bio || 'Chưa cập nhật tiểu sử.'}
                </div>
              )}
            </label>
          </div>
        </AdminTableFrame>
      </div>
    </div>
  )
}
