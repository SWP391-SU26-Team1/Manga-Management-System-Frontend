import React, { useEffect, useState, useRef } from 'react'
import { User, Mail, Award, BookOpen, Star, Users, Briefcase, Edit3, Save, X, Camera } from 'lucide-react'
import { MOCK_USERS, UserProfile } from '@/data/mockUsers'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Attempt to load user from localStorage
    const storedUser = localStorage.getItem('mangaflow_user')
    let loadedProfile = null;
    if (storedUser) {
      loadedProfile = JSON.parse(storedUser)
    } else {
      // Fallback to Mangaka mock data if not found
      loadedProfile = MOCK_USERS.find(u => u.role === 'MANGAKA')
    }
    
    if (loadedProfile) {
      setProfile(loadedProfile)
      setEditName(loadedProfile.fullName)
      setEditEmail(loadedProfile.email)
      setEditAvatarUrl(loadedProfile.avatarUrl || '')
    }
  }, [])

  const handleSave = () => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        fullName: editName,
        email: editEmail,
        avatarUrl: editAvatarUrl
      }
      setProfile(updatedProfile)
      localStorage.setItem('mangaflow_user', JSON.stringify(updatedProfile))
      
      // Update sidebar avatar by dispatching a custom event
      window.dispatchEvent(new Event('mangaflow_profile_updated'))
      
      setIsEditing(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setEditAvatarUrl(base64);
        
        // Instant preview in header and sidebar by temporary write to localStorage
        if (profile) {
          const tempProfile = {
            ...profile,
            avatarUrl: base64
          };
          localStorage.setItem('mangaflow_user', JSON.stringify(tempProfile));
          window.dispatchEvent(new Event('mangaflow_profile_updated'));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditName(profile.fullName)
      setEditEmail(profile.email)
      setEditAvatarUrl(profile.avatarUrl || '')
      
      // Revert the localStorage and header/sidebar avatars to original profile
      localStorage.setItem('mangaflow_user', JSON.stringify(profile));
      window.dispatchEvent(new Event('mangaflow_profile_updated'));
    }
    setIsEditing(false)
  }

  if (!profile) {
    return <div className="p-8 text-center font-bold text-red-500">Đang tải hồ sơ...</div>
  }

  // Calculate initials for avatar fallback
  const userInitials = profile.fullName === 'Tokuda Oda' 
    ? 'TO' 
    : (profile.fullName.split(' ').pop()?.slice(0, 2).toUpperCase() || 'TO')

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Header Title */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none">
            HỒ SƠ CÁ NHÂN
          </h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3 mb-2" />
          <p className="text-sm font-bold text-gray-500">
            Quản lý thông tin công khai và các chỉ số hoạt động của bạn
          </p>
        </div>
        <div className="flex gap-4">
          {isEditing && (
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-manga-red text-white font-bold uppercase px-6 py-3 border-2 border-manga-ink hover:bg-red-700 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none text-sm cursor-pointer">
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          )}
          <button 
            onClick={() => {
               if (isEditing) handleCancel(); 
               else setIsEditing(true);
            }}
            className="flex items-center gap-2 bg-manga-ink text-white font-bold uppercase px-6 py-3 border-2 border-manga-ink hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none text-sm cursor-pointer">
            {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            <span>{isEditing ? 'Hủy' : 'Chỉnh sửa hồ sơ'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-8">
          {/* Main Card */}
          <div className="bg-white border-4 border-manga-ink shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div 
                className={`w-32 h-32 rounded-full border-4 border-manga-ink bg-manga-red overflow-hidden flex items-center justify-center text-white font-extrabold text-4xl shadow-[4px_4px_0px_rgba(0,0,0,1)] relative ${isEditing ? 'cursor-pointer group' : ''}`}
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                {(isEditing ? editAvatarUrl : profile.avatarUrl) ? (
                  <img src={isEditing ? editAvatarUrl : profile.avatarUrl} alt={isEditing ? editName : profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-xs font-bold uppercase text-white">Đổi ảnh</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-400 border-2 border-manga-ink rounded-full" title="Đang hoạt động"></div>
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
              {profile.role}
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
            <p className="text-gray-700 font-medium text-sm leading-relaxed">
              {profile.bio || 'Chưa cập nhật tiểu sử.'}
            </p>
          </div>
        </div>

        {/* Right Column: Stats & Publications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border-4 border-manga-ink p-4 flex flex-col items-center text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <Star className="w-8 h-8 text-yellow-400 mb-2" fill="currentColor" />
              <span className="text-3xl font-black font-manga">{profile.stats?.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-xs font-bold uppercase text-gray-500 mt-1">Đánh giá</span>
            </div>
            <div className="bg-white border-4 border-manga-ink p-4 flex flex-col items-center text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-3xl font-black font-manga">
                {profile.stats?.followers ? (profile.stats.followers / 1000).toFixed(1) + 'k' : '0'}
              </span>
              <span className="text-xs font-bold uppercase text-gray-500 mt-1">Người theo dõi</span>
            </div>
            <div className="bg-white border-4 border-manga-ink p-4 flex flex-col items-center text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <Briefcase className="w-8 h-8 text-manga-red mb-2" />
              <span className="text-3xl font-black font-manga">{profile.stats?.activeProjects || 0}</span>
              <span className="text-xs font-bold uppercase text-gray-500 mt-1">Dự án đang làm</span>
            </div>
            <div className="bg-white border-4 border-manga-ink p-4 flex flex-col items-center text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <BookOpen className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-3xl font-black font-manga">{profile.stats?.projectsCompleted || 0}</span>
              <span className="text-xs font-bold uppercase text-gray-500 mt-1">Đã hoàn thành</span>
            </div>
          </div>

          {/* Publications / Skills */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <h3 className="font-manga text-2xl font-bold uppercase border-b-4 border-manga-ink pb-3 mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-manga-red" />
              {profile.role === 'ASSISTANT' ? 'Kỹ năng chuyên môn' : 'Tác phẩm tiêu biểu'}
            </h3>
            
            {(profile.publications || profile.skills) ? (
              <div className="flex flex-wrap gap-3">
                {(profile.publications || profile.skills)?.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="px-4 py-2 bg-gray-50 border-2 border-manga-ink font-bold text-sm uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:text-white transition-colors cursor-default"
                  >
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-gray-300 text-gray-500 font-bold">
                Chưa có thông tin tác phẩm/kỹ năng.
              </div>
            )}
          </div>
          
          {/* Recent Activity (Placeholder) */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <h3 className="font-manga text-2xl font-bold uppercase border-b-4 border-manga-ink pb-3 mb-6">
              Hoạt động gần đây
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 border-l-4 border-manga-red pl-4 py-1">
                <div className="w-2 h-2 rounded-full bg-manga-red mt-1.5 -ml-[23px]"></div>
                <div>
                  <p className="font-bold text-sm">Nộp bản thảo "Ch. 45 - Ký ức"</p>
                  <span className="text-xs text-gray-500 font-bold uppercase">2 giờ trước</span>
                </div>
              </div>
              <div className="flex items-start gap-4 border-l-4 border-gray-300 pl-4 py-1">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 -ml-[23px]"></div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Hoàn thành dự án "One-shot: Summer Rain"</p>
                  <span className="text-xs text-gray-500 font-bold uppercase">3 ngày trước</span>
                </div>
              </div>
              <div className="flex items-start gap-4 border-l-4 border-gray-300 pl-4 py-1">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 -ml-[23px]"></div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Cập nhật ảnh đại diện</p>
                  <span className="text-xs text-gray-500 font-bold uppercase">1 tuần trước</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
