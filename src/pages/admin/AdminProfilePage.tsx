import React, { FormEvent, useEffect, useState } from 'react'
import { AlertCircle, Edit3, Mail, Save, ShieldCheck, User, X } from 'lucide-react'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTableFrame } from '@/components/admin/AdminTableFrame'
import { userService, type UserProfileAPI } from '@/services/user.service'

const inputClass = 'w-full border-2 border-manga-ink bg-white px-4 py-3 text-sm font-bold outline-none focus:shadow-[3px_3px_0_rgba(232,23,63,1)]'
const labelClass = 'mb-2 block text-xs font-black uppercase text-gray-600'
const getError = (error: unknown) => {
  const value = error as { response?: { data?: { message?: string } }; message?: string }
  return value.response?.data?.message || value.message || 'Không thể cập nhật hồ sơ.'
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<UserProfileAPI | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [form, setForm] = useState({ fullName: '', email: '', bio: '', avatarUrl: '' })

  useEffect(() => {
    userService.getMe()
      .then((data) => {
        setProfile(data)
        setForm({ fullName: data.fullName || '', email: data.email || '', bio: data.bio || '', avatarUrl: data.avatarUrl || '' })
      })
      .catch((error) => setFeedback({ type: 'error', message: getError(error) }))
      .finally(() => setLoading(false))
  }, [])

  const cancel = () => {
    if (profile) setForm({ fullName: profile.fullName || '', email: profile.email || '', bio: profile.bio || '', avatarUrl: profile.avatarUrl || '' })
    setEditing(false)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!profile) return
    setSaving(true)
    try {
      const updated = await userService.updateProfile(profile.id, {
        name: form.fullName.trim() || undefined,
        email: form.email.trim() || undefined,
        bio: form.bio.trim() || undefined,
        avatar_url: form.avatarUrl.trim() || undefined,
      })
      setProfile(updated)
      const stored = localStorage.getItem('mangaflow_user')
      const current = stored ? JSON.parse(stored) : {}
      localStorage.setItem('mangaflow_user', JSON.stringify({ ...current, ...updated, token: current.token }))
      window.dispatchEvent(new Event('mangaflow_profile_updated'))
      setEditing(false)
      setFeedback({ type: 'success', message: 'Đã cập nhật hồ sơ trên hệ thống.' })
    } catch (error) {
      setFeedback({ type: 'error', message: getError(error) })
    } finally {
      setSaving(false)
    }
  }

  const initials = (profile?.fullName || profile?.username || 'AD').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Tài khoản đang đăng nhập"
        title="Hồ sơ cá nhân"
        description="Thông tin được tải và cập nhật trực tiếp từ backend."
        action={
          <AdminButton variant={editing ? 'white' : 'dark'} icon={editing ? X : Edit3} onClick={editing ? cancel : () => setEditing(true)} disabled={loading}>
            {editing ? 'Hủy' : 'Chỉnh sửa'}
          </AdminButton>
        }
      />
      {feedback && <div className={`flex gap-3 border-2 border-manga-ink p-4 font-black ${feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-manga-red'}`}>{feedback.type === 'success' ? <ShieldCheck /> : <AlertCircle />}{feedback.message}</div>}
      {loading || !profile ? (
        <AdminTableFrame className="p-12 text-center font-black uppercase text-gray-500">Đang tải hồ sơ...</AdminTableFrame>
      ) : (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <AdminTableFrame className="p-7">
            <div className="flex flex-col items-center text-center">
              {form.avatarUrl ? <img src={form.avatarUrl} alt={profile.username} className="h-36 w-36 border-4 border-manga-ink object-cover shadow-[6px_6px_0_rgba(0,0,0,1)]" /> : <div className="flex h-36 w-36 items-center justify-center border-4 border-manga-ink bg-manga-red font-manga text-5xl font-black text-white shadow-[6px_6px_0_rgba(0,0,0,1)]">{initials}</div>}
              <h2 className="mt-6 font-manga text-3xl font-black uppercase">{profile.username}</h2>
              <span className="mt-3 inline-flex items-center gap-2 border-2 border-manga-ink bg-manga-red px-4 py-2 text-xs font-black uppercase text-white"><ShieldCheck className="h-4 w-4" />Quản trị viên</span>
            </div>
          </AdminTableFrame>
          <AdminTableFrame className="p-7">
            <div className="grid gap-5 md:grid-cols-2">
              <label><span className={labelClass}>Tên đăng nhập</span><div className="flex items-center gap-3 border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-black"><User className="h-5 w-5 text-manga-red" />@{profile.username}</div></label>
              <label><span className={labelClass}>Email</span>{editing ? <input type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} className={inputClass} /> : <div className="flex items-center gap-3 border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-black"><Mail className="h-5 w-5 text-manga-red" />{profile.email}</div>}</label>
              <label className="md:col-span-2"><span className={labelClass}>Tên hiển thị</span>{editing ? <input value={form.fullName} onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))} className={inputClass} /> : <div className="border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-black">{profile.fullName}</div>}</label>
              <label className="md:col-span-2"><span className={labelClass}>URL ảnh đại diện</span>{editing ? <input type="url" value={form.avatarUrl} onChange={(e) => setForm((current) => ({ ...current, avatarUrl: e.target.value }))} className={inputClass} /> : <div className="truncate border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold">{profile.avatarUrl || 'Chưa có ảnh đại diện'}</div>}</label>
              <label className="md:col-span-2"><span className={labelClass}>Tiểu sử</span>{editing ? <textarea value={form.bio} onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))} className={`${inputClass} min-h-32`} /> : <div className="min-h-32 border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold">{profile.bio || 'Chưa cập nhật tiểu sử.'}</div>}</label>
            </div>
            {editing && <div className="mt-6 flex justify-end border-t-2 border-manga-ink pt-5"><AdminButton type="submit" icon={Save} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</AdminButton></div>}
          </AdminTableFrame>
        </form>
      )}
    </div>
  )
}
