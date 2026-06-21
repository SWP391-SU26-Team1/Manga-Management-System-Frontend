import React, { useState, useEffect } from 'react'
import { Search, Filter, AlertTriangle, Send, Mail, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react'
import { editorService } from '@/services/editor.service'

interface ChapterProgress {
  id: string
  series: string
  chapter: string
  status: string
  mangaka: string
  progress: number
  deadline: string
  isLate: boolean
}

const mapChapterStatus = (apiStatus: string): string => {
  switch (apiStatus?.toLowerCase()) {
    case 'in_progress': case 'drafting': return 'Đang vẽ'
    case 'submitted': case 'pending_review': return 'Đang chờ duyệt'
    case 'needs_revision': case 'revision': return 'Cần chỉnh sửa'
    case 'overdue': case 'late': return 'Trễ hạn'
    case 'approved': case 'completed': return 'Đã duyệt'
    default: return apiStatus || 'Đang vẽ'
  }
}

export default function StudioProgressPage() {
  const [chapters, setChapters] = useState<ChapterProgress[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChapters()
  }, [])

  const fetchChapters = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await editorService.getChapters()
      const data = res.data || res
      const list = Array.isArray(data) ? data : (data.chapters || data.items || [])

      const mapped: ChapterProgress[] = list.map((ch: any) => ({
        id: ch.chapter_id || ch.id,
        series: ch.series?.title || '—',
        chapter: ch.title || `Chapter ${ch.chapter_number || ''}`,
        status: mapChapterStatus(ch.status),
        mangaka: ch.series?.owner?.username || ch.mangaka || '—',
        progress: ch.progress ?? 0,
        deadline: ch.deadline ? new Date(ch.deadline).toLocaleDateString('vi-VN') : '—',
        isLate: ch.is_overdue || ch.isLate || false,
      }))

      setChapters(mapped)
    } catch (err: any) {
      console.error('Failed to load chapters:', err)
      setError('Không thể tải dữ liệu tiến độ chương.')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleNudge = (chapter: ChapterProgress) => {
    showToast(`Đã gửi thông báo nhắc deadline ${chapter.chapter} tới Mangaka ${chapter.mangaka}!`)
  }

  const filteredChapters = chapters.filter((c) => {
    const matchSearch = c.series.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.mangaka.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.chapter.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Trễ hạn': return 'bg-red-100 text-red-700 border-red-700'
      case 'Cần chỉnh sửa': return 'bg-orange-100 text-orange-700 border-orange-700'
      case 'Đang chờ duyệt': return 'bg-blue-100 text-blue-700 border-blue-700'
      case 'Đang vẽ': return 'bg-purple-100 text-purple-700 border-purple-700'
      case 'Đã duyệt': return 'bg-green-100 text-green-700 border-green-700'
      default: return 'bg-gray-100 text-gray-700 border-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-manga-red mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">Đang tải tiến độ chương...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center border-4 border-red-500 p-8 bg-white">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
          <button onClick={fetchChapters} className="bg-manga-ink text-white font-bold text-xs uppercase px-4 py-2 hover:bg-black transition-colors">Thử lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-manga-ink text-white px-6 py-3 border-4 border-manga-red shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle className="w-5 h-5 text-green-400" />
          {toastMessage}
        </div>
      )}

      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none">
            GIÁM SÁT TIẾN ĐỘ CHƯƠNG (CHAPTER MONITOR)
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-2">
            Theo dõi tiến độ tổng thể của các Chương truyện đang sáng tác
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-4 py-2 border-2 border-manga-ink bg-white">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Tổng số chương</div>
            <div className="text-xl font-black">{chapters.length}</div>
          </div>
          <div className="text-center px-4 py-2 border-2 border-red-600 bg-red-50 text-red-600">
            <div className="text-[10px] font-bold uppercase flex items-center gap-1 justify-center"><AlertTriangle className="w-3 h-3 animate-pulse" /> Trễ hạn</div>
            <div className="text-xl font-black">{chapters.filter(c => c.isLate).length}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 bg-white p-4 border-4 border-manga-ink flex-wrap items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Tìm kiếm series, mangaka, chương..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 focus:outline-none focus:border-manga-ink text-sm font-bold transition-colors bg-gray-50" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase">Trạng thái chương:</span>
          <select className="border-2 border-gray-200 py-2 px-3 text-sm font-bold bg-gray-50 focus:outline-none focus:border-manga-ink"
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">Tất cả</option>
            <option value="Đang vẽ">Đang vẽ</option>
            <option value="Đang chờ duyệt">Đang chờ duyệt</option>
            <option value="Cần chỉnh sửa">Cần chỉnh sửa</option>
            <option value="Trễ hạn">Trễ hạn</option>
            <option value="Đã duyệt">Đã duyệt</option>
          </select>
        </div>
      </div>

      <div className="border-4 border-manga-ink bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-4 border-manga-ink bg-gray-50">
              <th className="px-6 py-3 text-[10px] font-black text-manga-ink uppercase tracking-wider">Series / Chương</th>
              <th className="px-6 py-3 text-[10px] font-black text-manga-ink uppercase tracking-wider">Mangaka</th>
              <th className="px-6 py-3 text-[10px] font-black text-manga-ink uppercase tracking-wider">Trạng Thái Chương</th>
              <th className="px-6 py-3 text-[10px] font-black text-manga-ink uppercase tracking-wider">Deadline</th>
              <th className="px-6 py-3 text-[10px] font-black text-manga-ink uppercase tracking-wider w-48">Tiến Độ Sáng Tác</th>
              <th className="px-6 py-3 text-[10px] font-black text-manga-ink uppercase tracking-wider text-center">Hành động nhanh</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-100">
            {filteredChapters.map((chapter) => (
              <tr key={chapter.id} className="hover:bg-red-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-sm text-manga-ink">{chapter.series}</div>
                  <div className="text-[10px] font-bold text-gray-400 mt-0.5">{chapter.chapter}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-manga-ink flex items-center justify-center text-white text-[10px] font-bold">
                      {chapter.mangaka.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-manga-ink">{chapter.mangaka}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase whitespace-nowrap ${getStatusStyle(chapter.status)}`}>
                    {chapter.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-bold ${chapter.isLate ? 'text-red-600' : 'text-gray-600'}`}>
                    {chapter.deadline}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                    <span className="text-gray-400 uppercase">Hoàn thành</span>
                    <span className={chapter.progress === 100 ? 'text-green-600' : 'text-manga-ink'}>{chapter.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 border border-gray-200">
                    <div className={`h-full ${chapter.progress === 100 ? 'bg-green-500' : chapter.isLate ? 'bg-red-500' : 'bg-manga-ink'}`} 
                      style={{ width: `${chapter.progress}%` }} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleNudge(chapter)}
                      className="px-3 py-1.5 border-2 border-manga-ink hover:bg-manga-ink hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all">
                      <Send className="w-3 h-3" /> Nhắc deadline
                    </button>
                    <button onClick={() => showToast(`Đã mở email liên hệ với Mangaka ${chapter.mangaka}!`)} className="p-1.5 border-2 border-gray-200 hover:border-manga-ink text-gray-500 hover:text-manga-ink transition-colors">
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredChapters.length === 0 && (
          <div className="p-8 text-center text-gray-500 font-bold">
            Không tìm thấy chương truyện nào phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  )
}
