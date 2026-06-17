import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import {
  BookOpen, Clock, Layers, PlusSquare,
  FileCheck, ClipboardList, CheckCircle, AlertCircle, BarChart2, AlertTriangle, Users, UserPlus
} from 'lucide-react'
import { seriesService, SeriesAPI, getErrorMessage } from '@/services/series.service'
import { chapterService, ChapterAPI } from '@/services/chapter.service'

const TABS = ['Danh sách Chapter', 'Trạng thái Board Review', 'Thành viên Series']

export default function SeriesDetailPage() {
  const { seriesId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [series, setSeries] = useState<SeriesAPI | null>(null)
  const [chapters, setChapters] = useState<ChapterAPI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Member Management States
  const [members, setMembers] = useState<any[]>([])
  const [newMemberUserId, setNewMemberUserId] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('assistant')
  const [memberError, setMemberError] = useState('')
  const [memberSuccess, setMemberSuccess] = useState('')
  const [isAddingMember, setIsAddingMember] = useState(false)

  useEffect(() => {
    if (!seriesId) return
    const fetchData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [s, chs, mems] = await Promise.all([
          seriesService.getById(seriesId),
          chapterService.getBySeriesId(seriesId),
          seriesService.getMembers(seriesId),
        ])
        setSeries(s)
        setChapters([...chs].sort((a, b) => b.chapter_number - a.chapter_number))
        setMembers(mems)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [seriesId])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setMemberError('')
    setMemberSuccess('')
    if (!newMemberUserId.trim()) return

    setIsAddingMember(true)
    try {
      await seriesService.addMember(seriesId!, {
        user_id: newMemberUserId.trim(),
        role_in_series: newMemberRole,
      })
      setMemberSuccess('Thêm thành viên vào dự án thành công!')
      setNewMemberUserId('')
      const mems = await seriesService.getMembers(seriesId!)
      setMembers(mems)
    } catch (err) {
      setMemberError(getErrorMessage(err))
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleRemoveMember = async (seriesMemberId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa thành viên này khỏi Series?')) return
    try {
      await seriesService.removeMember(seriesId!, seriesMemberId)
      alert('Đã xóa thành viên thành công!')
      const mems = await seriesService.getMembers(seriesId!)
      setMembers(mems)
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  const getSeriesStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'under_review': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'in_production': return 'bg-green-100 text-green-700 border-green-300'
      case 'draft': return 'bg-gray-100 text-gray-500 border-gray-300'
      default: return 'bg-gray-100 text-gray-500 border-gray-300'
    }
  }

  const getSeriesStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      draft: 'Bản nháp',
      in_production: 'Đang vẽ',
      under_review: 'Chờ duyệt',
      published: 'Đã xuất bản',
    }
    return map[status] ?? status
  }

  const getChapterStatusClasses = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'under_review': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'in_progress': return 'bg-green-100 text-green-700 border-green-300'
      case 'draft': return 'bg-gray-100 text-gray-500 border-gray-300'
      case 'need_fix': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-500 border-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-manga-ink border-t-manga-red rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-500 uppercase text-sm">Đang tải dữ liệu series...</p>
      </div>
    )
  }

  if (error || !series) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-manga-red mx-auto mb-3" />
        <p className="font-bold text-manga-red text-lg">{error || 'Không tìm thấy series này!'}</p>
        <button
          onClick={() => navigate('/dashboard/mangaka/series')}
          className="mt-4 px-6 py-2 border-2 border-manga-ink font-bold text-sm uppercase hover:bg-gray-50"
        >
          ← Quay lại danh sách
        </button>
      </div>
    )
  }

  const tags = series.genre ? series.genre.split(', ').filter(Boolean) : []

  return (
    <div className="pb-16">
      {/* Title block */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-manga-red" />
            {series.title}
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-1">Chi tiết tác phẩm & trạng thái Board Review</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Cover & Info */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white border-4 border-manga-ink manga-shadow overflow-hidden">
            <div className="aspect-[3/4] bg-gray-200 border-b-4 border-manga-ink relative">
              {series.cover_image ? (
                <img src={series.cover_image} alt={series.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <BookOpen className="w-16 h-16 mb-2" />
                  <span className="font-bold text-sm">NO COVER</span>
                </div>
              )}
            </div>
            <div className="p-5 space-y-3">
              <h2 className="text-xl font-black uppercase tracking-tight leading-none">{series.title}</h2>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 border border-manga-ink text-[10px] font-bold uppercase bg-gray-50">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-4">{series.description}</p>

              <div className="pt-2 space-y-2 border-t-2 border-dashed border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold text-xs uppercase">Trạng thái:</span>
                  <span className={`px-2 py-0.5 font-bold uppercase text-[10px] border-2 ${getSeriesStatusColor(series.status)}`}>
                    {getSeriesStatusLabel(series.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold text-xs uppercase">Tạo ngày:</span>
                  <span className="font-bold text-xs">{new Date(series.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 space-y-2">
                <Link
                  to={`/dashboard/mangaka/series/${series._id}/create-chapter`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-manga-red text-white font-manga font-bold text-xs uppercase border-2 border-manga-ink hover:bg-red-700 transition-colors"
                >
                  <PlusSquare className="w-4 h-4" /> Tạo Chapter
                </Link>
                <Link
                  to={`/dashboard/mangaka/assign-task?seriesId=${series._id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-manga-ink font-bold text-xs uppercase border-2 border-manga-ink hover:bg-gray-50 transition-colors"
                >
                  <ClipboardList className="w-4 h-4" /> Giao việc trợ lý
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Chapter', value: chapters.length, icon: Layers },
              { label: 'Đang vẽ', value: chapters.filter(c => c.status === 'in_progress').length, icon: Clock },
              { label: 'Hoàn thành', value: chapters.filter(c => c.status === 'completed').length, icon: CheckCircle },
            ].map(stat => (
              <div key={stat.label} className="bg-white border-2 border-manga-ink p-3 text-center">
                <stat.icon className="w-4 h-4 mx-auto mb-1 text-manga-red" />
                <div className="font-manga text-2xl font-bold leading-none">{stat.value}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Tabbed Content */}
        <div className="flex-1 min-w-0">
          {/* Tab headers */}
          <div className="flex border-b-4 border-manga-ink mb-0">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`px-5 py-3 font-manga font-bold text-sm uppercase border-2 border-b-0 transition-colors flex items-center gap-2 ${
                  activeTab === idx
                    ? 'bg-manga-ink text-white border-manga-ink'
                    : 'bg-white text-manga-ink border-manga-ink hover:bg-gray-50'
                }`}
              >
                {idx === 0 ? <Layers className="w-4 h-4" /> : idx === 1 ? <BarChart2 className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white border-4 border-t-0 border-manga-ink manga-shadow">

            {/* ── TAB 0: Chapter list ── */}
            {activeTab === 0 && (
              <>
                <div className="p-4 border-b-2 border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-500 uppercase">{chapters.length} chapter</span>
                  <Link
                    to={`/dashboard/mangaka/series/${series._id}/create-chapter`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-manga-red text-white font-bold text-xs uppercase border-2 border-manga-ink hover:bg-red-700 transition-colors"
                  >
                    <PlusSquare className="w-3.5 h-3.5" /> Thêm chapter
                  </Link>
                </div>
                <div className="divide-y-2 divide-gray-100">
                  {chapters.map(chapter => (
                    <div key={chapter._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-red-50/20 transition-colors">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-manga text-2xl font-bold text-manga-red">CH.{chapter.chapter_number}</span>
                          <h3 className="font-bold text-base">{chapter.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Tạo: {new Date(chapter.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 font-bold uppercase text-[10px] border-2 ${getChapterStatusClasses(chapter.status)}`}>
                          {chapter.status}
                        </span>
                        <button
                          onClick={() => navigate('/dashboard/mangaka/manuscripts')}
                          className="p-2 border-2 border-manga-ink bg-white hover:bg-manga-ink hover:text-white transition-colors"
                          title="Xem bản thảo"
                        >
                          <FileCheck className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {chapters.length === 0 && (
                    <div className="p-12 text-center text-gray-400 font-bold">
                      Series này chưa có chapter nào.
                      <br />
                      <Link
                        to={`/dashboard/mangaka/series/${series._id}/create-chapter`}
                        className="mt-3 inline-block text-manga-red hover:underline text-sm"
                      >
                        + Tạo chapter đầu tiên
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── TAB 1: Board Review Status ── */}
            {activeTab === 1 && (
              <div className="p-6">
                <div className="py-12 text-center border-2 border-dashed border-gray-200">
                  <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-bold text-gray-400 text-sm">Chưa có lần trình duyệt nào cho series này.</p>
                  <p className="text-xs text-gray-400 font-bold mt-1 uppercase">
                    Trạng thái xét duyệt sẽ xuất hiện ở đây sau khi bạn nộp hồ sơ lên Hội đồng.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB 2: Series Members ── */}
            {activeTab === 2 && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Add Member Form */}
                  <div className="lg:col-span-1 border-2 border-manga-ink p-5 bg-gray-50">
                    <h3 className="font-manga text-xl font-bold uppercase mb-4 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-manga-red" />
                      Thêm thành viên
                    </h3>

                    <form onSubmit={handleAddMember} className="space-y-4 font-bold text-sm text-manga-ink">
                      {memberError && (
                        <div className="bg-red-50 border border-manga-red p-2.5 text-xs text-manga-red uppercase flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {memberError}
                        </div>
                      )}
                      {memberSuccess && (
                        <div className="bg-green-50 border border-green-500 p-2.5 text-xs text-green-700 uppercase flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {memberSuccess}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs uppercase tracking-widest mb-1.5">User ID Trợ lý (UUID) *</label>
                        <input
                          type="text"
                          required
                          value={newMemberUserId}
                          onChange={e => setNewMemberUserId(e.target.value)}
                          placeholder="Nhập UUID từ Supabase..."
                          className="w-full border-2 border-manga-ink px-3 py-2 text-sm focus:outline-none focus:border-manga-red bg-white"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Copy mã UUID (User ID) của tài khoản trợ lý</p>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-widest mb-1.5">Vai trò trong dự án *</label>
                        <select
                          value={newMemberRole}
                          onChange={e => setNewMemberRole(e.target.value)}
                          className="w-full border-2 border-manga-ink px-3 py-2 text-sm focus:outline-none focus:border-manga-red bg-white"
                        >
                          <option value="assistant">Assistant (Trợ lý vẽ)</option>
                          <option value="mangaka">Mangaka (Đồng tác giả)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isAddingMember}
                        className="w-full bg-manga-red hover:bg-red-700 text-white font-manga font-bold text-xs uppercase py-3 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
                      >
                        {isAddingMember ? 'Đang xử lý...' : 'Thêm thành viên'}
                      </button>
                    </form>
                  </div>

                  {/* Right: Members List */}
                  <div className="lg:col-span-2">
                    <h3 className="font-manga text-xl font-bold uppercase mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-manga-red" />
                      Danh sách trợ lý tham gia ({members.length})
                    </h3>

                    <div className="border-2 border-manga-ink overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-manga-ink text-white font-bold text-[11px] uppercase tracking-wider">
                            <th className="p-3 border-r border-manga-ink/20">Thành viên</th>
                            <th className="p-3 border-r border-manga-ink/20">Vai trò chính</th>
                            <th className="p-3 border-r border-manga-ink/20">Vai trò Series</th>
                            <th className="p-3 text-center">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-gray-100">
                          {members.map((m) => (
                            <tr key={m.series_member_id} className="font-semibold text-xs text-manga-ink hover:bg-red-50/20 transition-colors">
                              <td className="p-4 border-r border-gray-100 align-middle">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-manga-ink/20">
                                    {m.users?.avatar_url ? (
                                      <img src={m.users.avatar_url} alt={m.users.username} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 bg-gray-100 uppercase">{m.users?.username?.[0] ?? '?'}</div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-sm">{m.users?.name || m.users?.username || 'Chưa đặt tên'}</div>
                                    <div className="text-[10px] text-gray-400 font-bold">{m.users?.email || 'Không có email'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 border-r border-gray-100 align-middle text-gray-500 uppercase font-bold text-[10px]">
                                {m.users?.role || 'N/A'}
                              </td>
                              <td className="p-4 border-r border-gray-100 align-middle">
                                <span className="px-2 py-0.5 border border-manga-ink bg-gray-50 font-bold uppercase text-[10px]">
                                  {m.role_in_series}
                                </span>
                              </td>
                              <td className="p-4 align-middle text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(m.series_member_id)}
                                  className="text-manga-red hover:underline font-bold text-xs uppercase"
                                >
                                  Xóa khỏi Series
                                </button>
                              </td>
                            </tr>
                          ))}

                          {members.length === 0 && (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-gray-400 font-bold uppercase text-xs">
                                Chưa có trợ lý nào được thêm vào dự án này.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
