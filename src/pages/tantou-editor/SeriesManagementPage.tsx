import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, Filter, ChevronDown, ChevronRight, FileText, BookOpen, Edit, CheckCircle2, X, Loader2, AlertCircle } from 'lucide-react'
import { editorService, ApiSeries } from '@/services/editor.service'

// Map backend status to display status
type DisplayStatus = 'PUBLISHING' | 'IN REVIEW' | 'AT RISK' | 'PAUSED' | 'ARCHIVED' | 'DRAFT'

const mapApiStatusToDisplay = (apiStatus: string): DisplayStatus => {
  switch (apiStatus) {
    case 'published': return 'PUBLISHING'
    case 'pending_review': return 'IN REVIEW'
    case 'approved': return 'PUBLISHING'
    case 'draft': return 'DRAFT'
    case 'hidden':
    case 'archived':
    case 'deleted': return 'ARCHIVED'
    case 'rejected':
    case 'banned': return 'AT RISK'
    default: return 'DRAFT'
  }
}

const mapDisplayStatusToApi = (displayStatus: string): string => {
  switch (displayStatus) {
    case 'PUBLISHING': return 'published'
    case 'IN REVIEW': return 'pending_review'
    case 'AT RISK': return 'rejected'
    case 'PAUSED': return 'hidden'
    case 'ARCHIVED': return 'archived'
    case 'DRAFT': return 'draft'
    default: return 'draft'
  }
}

interface DisplaySeries {
  id: string
  title: string
  genre: string
  status: DisplayStatus
  description?: string
  coverImageUrl?: string
  viewCount: number
  createdAt: string
  // These fields may not be available from API
  mangaka?: string
  chapter?: number
  schedule?: string
  ranking?: number
  rankingChange?: number
  riskLevel?: string
  lastMeeting?: string
}

const mapApiToDisplay = (s: ApiSeries): DisplaySeries => ({
  id: s.series_id,
  title: s.title,
  genre: s.genre || '—',
  status: mapApiStatusToDisplay(s.status),
  description: s.description,
  coverImageUrl: s.cover_image_url,
  viewCount: s.view_count || 0,
  createdAt: s.created_at || '',
  mangaka: '—',
  chapter: 0,
  schedule: '—',
  ranking: 0,
  rankingChange: 0,
  riskLevel: 'NONE',
  lastMeeting: '—',
})

export default function SeriesManagementPage() {
  const navigate = useNavigate()
  const [seriesList, setSeriesList] = useState<DisplaySeries[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeries, setSelectedSeries] = useState<DisplaySeries | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSeries, setEditingSeries] = useState<DisplaySeries | null>(null)
  
  // Edit Form inputs
  const [formTitle, setFormTitle] = useState('')
  const [formGenre, setFormGenre] = useState('')
  const [formDescription, setFormDescription] = useState('')
  
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchSeries()
  }, [])

  const fetchSeries = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await editorService.getSeries()
      const data = res.data || res
      const list = Array.isArray(data) ? data : (data.series || data.items || [])
      setSeriesList(list.map(mapApiToDisplay))
    } catch (err: any) {
      console.error('Failed to load series:', err)
      setError('Không thể tải danh sách series.')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const filteredSeries = seriesList.filter(
    (s) =>
      (s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.mangaka || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'ALL' || s.status === filterStatus)
  )

  const getStatusBadge = (status: DisplayStatus) => {
    switch (status) {
      case 'PUBLISHING':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold border border-green-700">ĐANG XUẤT BẢN</span>
      case 'IN REVIEW':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold border border-blue-700">ĐANG DUYỆT</span>
      case 'AT RISK':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold border border-red-700">RỦI RO CAO</span>
      case 'PAUSED':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold border border-gray-700">TẠM NGƯNG</span>
      case 'ARCHIVED':
        return <span className="px-2 py-1 bg-red-800 text-white text-xs font-bold border border-red-950">ĐÃ LƯU TRỮ</span>
      case 'DRAFT':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-700">BẢN NHÁP</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold border border-gray-700">{status}</span>
    }
  }

  const handleOpenDetail = (series: DisplaySeries) => {
    setSelectedSeries(series)
  }

  // Handle Edit Click
  const handleOpenEditModal = (series: DisplaySeries) => {
    setEditingSeries(series)
    setFormTitle(series.title)
    setFormGenre(series.genre)
    setFormDescription(series.description || '')
    setIsEditModalOpen(true)
  }

  const handleSaveSeriesEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSeries) return

    try {
      await editorService.updateSeries(editingSeries.id, {
        title: formTitle,
        description: formDescription,
      })

      setSeriesList(prev => prev.map(s => {
        if (s.id === editingSeries.id) {
          return {
            ...s,
            title: formTitle,
            genre: formGenre,
            description: formDescription
          }
        }
        return s
      }))

      setIsEditModalOpen(false)
      showToast(`Đã lưu thay đổi thông tin truyện ${formTitle}!`)
    } catch (err: any) {
      console.error('Failed to update series:', err)
      showToast('Lỗi khi cập nhật thông tin series!')
    }
  }

  // Handle status update
  const handleStatusChange = async (id: string, newDisplayStatus: DisplayStatus) => {
    try {
      const apiStatus = mapDisplayStatusToApi(newDisplayStatus)
      await editorService.updateSeriesStatus(id, apiStatus)
      
      setSeriesList(prev => prev.map(s => {
        if (s.id === id) {
          return { ...s, status: newDisplayStatus }
        }
        return s
      }))
      showToast(`Đã thay đổi trạng thái của truyện sang: ${newDisplayStatus}!`)
    } catch (err: any) {
      console.error('Failed to update status:', err)
      showToast('Lỗi khi thay đổi trạng thái!')
    }
  }

  const handleAction = async (action: 'hide' | 'archive' | 'republish') => {
    if (!selectedSeries) return
    try {
      if (action === 'hide') {
        await editorService.hideSeries(selectedSeries.id)
        showToast('Đã ẩn series thành công!')
      } else if (action === 'archive') {
        await editorService.archiveSeries(selectedSeries.id)
        showToast('Đã lưu trữ series thành công!')
        setSelectedSeries({ ...selectedSeries, status: 'ARCHIVED' })
        setSeriesList(prev => prev.map(s => s.id === selectedSeries.id ? { ...s, status: 'ARCHIVED' } : s))
      } else if (action === 'republish') {
        await editorService.republishSeries(selectedSeries.id)
        showToast('Đã tái xuất bản series thành công!')
        setSelectedSeries({ ...selectedSeries, status: 'PUBLISHING' })
        setSeriesList(prev => prev.map(s => s.id === selectedSeries.id ? { ...s, status: 'PUBLISHING' } : s))
      }
    } catch (err: any) {
      console.error(`Failed to ${action} series:`, err)
      showToast(`Lỗi khi thực hiện hành động: ${action}!`)
    }
  }

  const handleSubmitToBoard = async () => {
    if (!selectedSeries) return
    try {
      await editorService.updateSeriesStatus(selectedSeries.id, 'approved')
      showToast(`✅ Đã phê duyệt '${selectedSeries.title}' thành công!`)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Lỗi khi phê duyệt Series!'
      showToast(`❌ ${msg}`)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-manga-red mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">Đang tải danh sách series...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center border-4 border-red-500 p-8 bg-white">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
          <button onClick={fetchSeries} className="bg-manga-ink text-white font-bold text-xs uppercase px-4 py-2 hover:bg-black transition-colors">
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-manga-ink text-white px-6 py-3 border-4 border-manga-red shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          {toastMessage}
        </div>
      )}

      <div>
        {/* Header */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none">
              SERIES PHỤ TRÁCH
            </h1>
            <p className="text-sm font-bold text-gray-500 mt-2">
              Quản lý các bộ truyện đang phụ trách · Tantou Editor
            </p>
          </div>
          <div className="text-sm font-bold">
            <span className="text-green-600">{seriesList.filter(s => s.status === 'PUBLISHING').length} Đang xuất bản</span> 
            <span className="text-gray-300 mx-2">|</span>{' '}
            <span className="text-red-600">{seriesList.filter(s => s.status === 'AT RISK').length} Rủi ro</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border-2 border-manga-ink focus:outline-none focus:border-red-600 text-sm font-bold transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-2 border-manga-ink py-2 px-3 text-sm font-bold bg-white focus:outline-none"
            >
              <option value="ALL">Tất cả</option>
              <option value="PUBLISHING">Đang xuất bản</option>
              <option value="IN REVIEW">Đang duyệt</option>
              <option value="AT RISK">Rủi ro</option>
              <option value="PAUSED">Tạm ngưng</option>
              <option value="ARCHIVED">Đã lưu trữ</option>
              <option value="DRAFT">Bản nháp</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="border-4 border-manga-ink bg-white mb-6">
          <div className="bg-manga-ink text-white px-4 py-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-wider">Danh Sách Series ({filteredSeries.length})</span>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tên Series</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Thể Loại</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lượt Xem</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ngày Tạo</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSeries.map((series) => (
                <tr 
                  key={series.id} 
                  onClick={() => handleOpenDetail(series)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-4">
                    <span className="font-bold text-sm text-manga-ink">{series.title}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500">{series.genre}</td>
                  <td className="px-4 py-4">{getStatusBadge(series.status)}</td>
                  <td className="px-4 py-4 font-bold text-sm">{series.viewCount.toLocaleString()}</td>
                  <td className="px-4 py-4 text-xs text-gray-400">
                    {series.createdAt ? new Date(series.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-4 py-4 text-gray-400">
                    <ChevronRight className="w-4 h-4" />
                  </td>
                </tr>
              ))}
              {filteredSeries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm font-bold">
                    Không tìm thấy series nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSeries && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSeries(null)}>
          <div className="bg-white border-4 border-manga-ink w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-manga-ink text-white p-6 relative">
              <button onClick={() => setSelectedSeries(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Chi Tiết Series</div>
              <h2 className="text-2xl font-manga font-bold leading-tight mb-2">{selectedSeries.title}</h2>
              <p className="text-xs text-gray-300 mb-4">{selectedSeries.genre}</p>
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedSeries.status)}
                <span className="font-bold">{selectedSeries.viewCount.toLocaleString()} views</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status Change */}
              <div className="border-2 border-gray-200 p-4">
                <h3 className="font-bold uppercase text-xs mb-3 text-manga-ink border-b-2 border-gray-100 pb-2">
                  Trạng Thái Hoạt Động
                </h3>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Thay Đổi Trạng Thái</label>
                  <select
                    value={selectedSeries.status}
                    onChange={(e) => {
                      handleStatusChange(selectedSeries.id, e.target.value as any)
                      setSelectedSeries({ ...selectedSeries, status: e.target.value as DisplayStatus })
                    }}
                    className="w-full border-2 border-manga-ink p-2 text-xs font-bold focus:outline-none"
                  >
                    <option value="PUBLISHING">PUBLISHING (Đang Xuất Bản)</option>
                    <option value="IN REVIEW">IN REVIEW (Đang Duyệt)</option>
                    <option value="AT RISK">AT RISK (Rủi Ro Hủy)</option>
                    <option value="PAUSED">PAUSED (Tạm Ngừng)</option>
                    <option value="ARCHIVED">ARCHIVED (Lưu Trữ)</option>
                    <option value="DRAFT">DRAFT (Bản Nháp)</option>
                  </select>
                </div>
              </div>

              {/* Info */}
              <div className="border-2 border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 pb-2">
                  <h3 className="font-bold uppercase text-xs text-manga-ink">Thông Tin</h3>
                  <button 
                    onClick={() => handleOpenEditModal(selectedSeries)}
                    className="text-xs font-bold text-manga-red hover:text-red-700 flex items-center gap-0.5"
                  >
                    <Edit className="w-3.5 h-3.5" /> Sửa
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Lượt Xem</div>
                    <div className="font-bold text-lg">{selectedSeries.viewCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Ngày Tạo</div>
                    <div className="font-bold text-sm mt-1">
                      {selectedSeries.createdAt ? new Date(selectedSeries.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Mô tả cốt truyện</div>
                  <p className="text-xs text-gray-600 leading-normal font-medium bg-gray-50 p-3 border border-gray-100">
                    {selectedSeries.description || 'Chưa có mô tả chi tiết cho bộ truyện này.'}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-2 border-gray-200 p-4">
                <h3 className="font-bold uppercase text-xs mb-4 text-manga-ink border-b-2 border-gray-100 pb-2">Hành Động Nhanh</h3>
                {/* If series is IN REVIEW, highlight the review manuscript button */}
                {selectedSeries.status === 'IN REVIEW' && (
                  <div className="mb-3 p-3 bg-blue-50 border-2 border-blue-400 text-xs font-bold text-blue-700">
                    📋 Series này đang chờ Tantou duyệt bản thảo. Hãy vào <span className="underline">Review Bản Thảo</span> để xem xét và phê duyệt.
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <button
                    onClick={() => { setSelectedSeries(null); navigate('/dashboard/tantou-editor/manuscript-review') }}
                    className={`px-3 py-3 text-sm font-bold border-2 flex items-center justify-center gap-2 transition-colors ${
                      selectedSeries.status === 'IN REVIEW'
                        ? 'bg-manga-red text-white border-manga-ink hover:bg-red-700 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                        : 'hover:bg-gray-50 border-gray-200 hover:border-manga-ink'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> Review bản thảo
                  </button>
                  <button onClick={() => { setSelectedSeries(null); navigate('/dashboard/tantou-editor/chapters') }} className="px-3 py-3 text-sm font-bold hover:bg-gray-50 border-2 border-gray-200 hover:border-manga-ink flex items-center justify-center gap-2 transition-colors">
                    <BookOpen className="w-4 h-4 text-manga-red" /> Chapter/Page
                  </button>
                  <button onClick={() => { setSelectedSeries(null); navigate('/dashboard/tantou-editor/ranking') }} className="px-3 py-3 text-sm font-bold hover:bg-gray-50 border-2 border-gray-200 hover:border-manga-ink flex items-center justify-center gap-2 transition-colors">
                    <ChevronRight className="w-4 h-4 text-manga-red" /> Ranking
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => handleAction('hide')} className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 border-2 border-transparent transition-colors">
                    Ẩn tác phẩm
                  </button>
                  <button onClick={() => handleAction('archive')} className="px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border-2 border-transparent transition-colors">
                    Lưu trữ
                  </button>
                  <button onClick={() => handleAction('republish')} className="px-3 py-2 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 border-2 border-transparent transition-colors">
                    Tái xuất bản
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t-2 border-gray-200 p-4 flex justify-end">
              <button onClick={() => setSelectedSeries(null)} className="px-6 py-2 bg-manga-ink text-white font-bold text-sm uppercase hover:bg-black transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Series Modal */}
      {isEditModalOpen && editingSeries && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveSeriesEdit} className="bg-white border-4 border-manga-ink p-6 max-w-md w-full animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b-2 border-gray-100 pb-3 mb-4">
              <h2 className="font-manga text-xl font-bold uppercase text-manga-ink">Chỉnh Sửa Thông Tin Truyện</h2>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-manga-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên Truyện (Series Title)</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none focus:border-red-500 font-bold" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Thể Loại</label>
                <input 
                  type="text" 
                  value={formGenre}
                  onChange={(e) => setFormGenre(e.target.value)}
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mô tả cốt truyện</label>
                <textarea 
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none resize-none font-medium" 
                  placeholder="Nhập mô tả cốt truyện chính..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t-2 border-gray-100 pt-4">
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border-2 border-gray-300 font-bold text-sm uppercase hover:bg-gray-50"
              >
                Hủy
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-manga-ink text-white font-bold text-sm uppercase hover:bg-black"
              >
                Lưu lại
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
