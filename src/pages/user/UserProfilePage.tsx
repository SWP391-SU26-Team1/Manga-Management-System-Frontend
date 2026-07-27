import React, { useEffect, useState } from 'react'
import { User, Mail, Award, BookOpen, Clock, Heart, Edit2, Home, Save, X, ShieldAlert, Loader2 } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import api from '@/services/api'

const AVAILABLE_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Horror', 'Mecha', 'Mystery', 'Psychological', 'Romance', 
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
  'Isekai', 'Shounen', 'Shoujo', 'Seinen', 'Josei'
]
import { useNavigate } from 'react-router'
import { readerService } from '@/services/reader.service'
import { ReadingHistoryItem } from '@/types/reader.types'

export default function UserProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [history, setHistory] = useState<ReadingHistoryItem[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
    favoriteGenres: ''
  })
  
  const [isSubmittingRole, setIsSubmittingRole] = useState(false)
  const [selectedRole, setSelectedRole] = useState('mangaka')
  
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setProfile(parsed)
      setEditForm({
        fullName: parsed.fullName || '',
        bio: parsed.bio || '',
        favoriteGenres: parsed.favoriteGenres || ''
      })
    }

    // Fetch real reading history
    readerService.getReadingHistory().then(data => {
      setHistory(data)
    })
  }, [])

  if (!profile) {
    return <div className="p-8 text-center font-bold text-red-500">Đang tải hồ sơ...</div>
  }

  const handleSave = () => {
    if (!profile) return
    const updatedUser = {
      ...profile,
      fullName: editForm.fullName,
      bio: editForm.bio,
      favoriteGenres: editForm.favoriteGenres
    }
    localStorage.setItem('mangaflow_user', JSON.stringify(updatedUser))
    setProfile(updatedUser)
    setIsEditing(false)
    window.dispatchEvent(new Event('mangaflow_profile_updated'))
  }

  const toggleGenre = (genre: string) => {
    let current = editForm.favoriteGenres.split(',').map(g => g.trim()).filter(Boolean)
    if (current.includes(genre)) {
      current = current.filter(g => g !== genre)
    } else {
      current.push(genre)
    }
    setEditForm({ ...editForm, favoriteGenres: current.join(', ') })
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

  const userInitials = profile.fullName
    ? profile.fullName.split(' ').pop()?.slice(0, 2).toUpperCase()
    : 'U'

  // Favorite genres from reading history or profile
  let favoriteGenres: string[] = []
  if (profile.favoriteGenres) {
    favoriteGenres = profile.favoriteGenres.split(',').map((g: string) => g.trim()).filter(Boolean)
  } else {
    const allGenres = history.flatMap(h => (h.seriesGenre || '').split(',').map((g: string) => g.trim())).filter(Boolean)
    favoriteGenres = Array.from(new Set(allGenres)).slice(0, 5)
  }

  if (favoriteGenres.length === 0) {
    favoriteGenres.push('Chưa có dữ liệu')
  }

  return (
    <div className="max-w-5xl mx-auto pb-16 font-sans">
      {/* Header Title */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold uppercase mb-4 hover:text-manga-red transition-colors text-manga-ink">
             &larr; QUAY LẠI
          </button>
          <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none">
            HỒ SƠ CÁ NHÂN
          </h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3 mb-2" />
          <p className="text-sm font-bold text-gray-500">
            Quản lý thông tin công khai và các chỉ số hoạt động của bạn
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
           {!isEditing ? (
             <>
               <button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-manga-ink font-bold uppercase text-sm px-6 py-3 border-4 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-ink hover:text-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all dark:bg-zinc-800 dark:text-gray-100 dark:border-black dark:shadow-[4px_4px_0px_#000]">
                  <Edit2 className="w-4 h-4" /> SỬA HỒ SƠ
               </button>
               <button onClick={() => navigate('/')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-manga-red text-white font-bold uppercase text-sm px-6 py-3 border-4 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-ink hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all dark:border-black dark:shadow-[4px_4px_0px_#000]">
                  <Home className="w-4 h-4" /> TRANG CHỦ
               </button>
             </>
           ) : (
             <>
                <button onClick={handleSave} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-manga-red text-white font-bold uppercase text-sm px-6 py-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-red-600 transition-all dark:shadow-[4px_4px_0px_#000]">
                  <Save className="w-4 h-4" /> LƯU THAY ĐỔI
                </button>
                <button onClick={() => {
                  setIsEditing(false)
                  setEditForm({
                    fullName: profile.fullName || '',
                    bio: profile.bio || '',
                    favoriteGenres: profile.favoriteGenres || ''
                  })
                }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-black text-white font-bold uppercase text-sm px-6 py-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-800 transition-all dark:shadow-[4px_4px_0px_#000]">
                  <X className="w-4 h-4" /> HỦY
                </button>
             </>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-8">
          {/* Main Card */}
          <div className="bg-white border-4 border-manga-ink shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 flex flex-col items-center text-center dark:bg-zinc-800 dark:border-black dark:shadow-[8px_8px_0px_#000]">
            <div className="relative mb-6">
              <div
                className={`w-32 h-32 rounded-full border-4 border-manga-ink bg-zinc-900 overflow-hidden flex items-center justify-center text-white font-extrabold text-4xl shadow-[4px_4px_0px_rgba(0,0,0,1)] relative dark:border-black dark:shadow-[4px_4px_0px_#000]`}
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-400 border-2 border-manga-ink rounded-full dark:border-black" title="Đang hoạt động"></div>
            </div>

            {isEditing ? (
              <div className="w-full text-left mb-4">
                <label className="text-xs font-black uppercase text-gray-500 mb-1 block">HỌ TÊN</label>
                <input 
                  type="text" 
                  value={editForm.fullName} 
                  onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                  className="w-full border-2 border-manga-ink p-2 text-sm font-bold outline-none focus:border-manga-red bg-white text-gray-900 dark:bg-zinc-700 dark:text-gray-100 dark:border-black"
                />
              </div>
            ) : (
              <h2 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none mb-2 dark:text-white">
                {profile.fullName || profile.username}
              </h2>
            )}

            <div className="inline-block px-3 py-1 bg-manga-red text-white font-bold uppercase text-xs border-2 border-manga-ink mb-4 dark:border-black">
              {profile.role || 'MEMBER USER'}
            </div>

            <div className="w-full space-y-3 mt-2 text-left">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-700 p-2 bg-gray-50 border-2 border-dashed border-gray-300 dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-300">
                <User className="w-4 h-4 text-manga-red shrink-0" />
                <span className="truncate">@{profile.username}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-gray-700 p-2 bg-gray-50 border-2 border-dashed border-gray-300 dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-300">
                <Mail className="w-4 h-4 text-manga-red shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
            </div>
          </div>

          {/* Bio Card */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[4px_4px_0px_rgba(15,15,15,1)] dark:bg-zinc-800 dark:border-black dark:shadow-[4px_4px_0px_#000]">
            <h3 className="font-bold text-lg uppercase border-b-2 border-manga-ink pb-2 mb-4 flex items-center gap-2 dark:border-zinc-700 dark:text-white">
              <Award className="w-5 h-5 text-manga-red" /> Tiểu sử
            </h3>
            {isEditing ? (
              <textarea 
                value={editForm.bio} 
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                className="w-full border-2 border-manga-ink p-2 text-sm font-medium outline-none focus:border-manga-red bg-white h-24 text-gray-900 dark:bg-zinc-700 dark:text-gray-100 dark:border-black"
                placeholder="Nhập tiểu sử..."
              />
            ) : (
              <p className="text-gray-700 font-medium text-sm leading-relaxed dark:text-gray-300">
                {profile.bio || 'Độc giả yêu thích MangaFlow.'}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Activities & Preferences */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Reading Preferences / Genres */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] dark:bg-zinc-800 dark:border-black dark:shadow-[6px_6px_0px_#000]">
            <h3 className="font-manga text-2xl font-bold uppercase border-b-4 border-manga-ink pb-3 mb-6 flex items-center gap-3 dark:border-zinc-700 dark:text-white">
              <BookOpen className="w-6 h-6 text-manga-red" />
              Thể loại yêu thích
            </h3>

            {isEditing ? (
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {AVAILABLE_GENRES.map(genre => {
                    const isSelected = editForm.favoriteGenres.split(',').map(g => g.trim()).includes(genre)
                    return (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-3 py-1.5 font-bold text-xs uppercase shadow-[2px_2px_0px_rgba(15,15,15,1)] border-2 border-manga-ink transition-colors dark:border-black ${
                          isSelected 
                            ? 'bg-manga-red text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-700 dark:text-gray-300'
                        }`}
                      >
                        {genre}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500 font-medium mt-3 dark:text-gray-400">Click để chọn hoặc bỏ chọn thể loại yêu thích. Nếu không chọn gì, hệ thống sẽ tự động lấy từ lịch sử đọc.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {favoriteGenres.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-gray-50 border-2 border-manga-ink font-bold text-sm uppercase shadow-[2px_2px_0px_rgba(15,15,15,1)] hover:bg-manga-red hover:text-white transition-colors cursor-default dark:bg-zinc-900 dark:border-black dark:shadow-[2px_2px_0px_#000] dark:text-gray-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] dark:bg-zinc-800 dark:border-black dark:shadow-[6px_6px_0px_#000]">
            <h3 className="font-manga text-2xl font-bold uppercase border-b-4 border-manga-ink pb-3 mb-6 dark:border-zinc-700 dark:text-white">
              Hoạt động gần đây
            </h3>
            <div className="space-y-4">
              {history.length > 0 ? history.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 border-l-4 border-manga-red pl-4 py-1">
                  <div className="w-2 h-2 rounded-full bg-manga-red mt-1.5 -ml-[23px]"></div>
                  <div>
                    <p className="font-bold text-sm dark:text-gray-200">Đã đọc xong - {item.seriesTitle} {item.lastChapterTitle}</p>
                    <span className="text-xs text-gray-500 font-bold uppercase dark:text-gray-400">
                      {new Date(item.lastReadAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-sm font-bold text-gray-500 italic py-4">
                  Bạn chưa đọc truyện nào.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Role Section (Like UserSettingsPage) */}
      <div className="bg-white border-4 border-manga-ink p-6 mt-12 shadow-[8px_8px_0px_rgba(15,15,15,1)] dark:bg-zinc-800 dark:border-black dark:shadow-[8px_8px_0px_#000]">
        <h2 className="text-lg font-black uppercase text-manga-ink mb-4 flex items-center gap-2 dark:text-gray-100">
          <ShieldAlert className="w-5 h-5 text-manga-red" />
          Xin cấp quyền đặc biệt
        </h2>
        <p className="text-xs font-bold text-gray-500 mb-6 dark:text-gray-400">
          Bạn có thể gửi yêu cầu cấp quyền đặc biệt trên hệ thống. Admin sẽ xem xét hồ sơ của bạn.
        </p>
        
        <form onSubmit={handleRequestRole} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-black uppercase text-manga-ink mb-2 dark:text-gray-300">Vai trò muốn nâng cấp</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border-2 border-manga-ink p-3 text-sm font-bold outline-none focus:border-manga-red bg-zinc-50 dark:bg-zinc-700 dark:text-white dark:border-black"
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
            className="flex items-center justify-center gap-2 bg-manga-ink text-white font-manga font-bold text-sm uppercase px-8 py-3 h-[52px] border-2 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:border-black dark:shadow-[4px_4px_0px_#000]"
          >
            {isSubmittingRole ? <Loader2 className="w-5 h-5 animate-spin" /> : 'GỬI YÊU CẦU'}
          </button>
        </form>
      </div>

    </div>
  )
}
