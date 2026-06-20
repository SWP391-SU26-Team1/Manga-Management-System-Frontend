import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { PenTool, Layers, Clock, Eye, AlertTriangle, Loader2, BookOpen, ChevronRight } from 'lucide-react'
import assistantService from '@/services/assistant.service'

interface DrawingPageAPI {
  page_id: string
  page_number: number
  chapter_id: string
  status: string
  created_at: string
  updated_at: string
  chapter?: {
    chapter_id: string
    chapter_number: number
    title: string
    series_id: string
  }
  page_version?: Array<{
    version_id: string
    version_number: number
    version_type: string
    image_url: string
    created_at: string
  }>
  page_task?: Array<{
    task_id: string
    task_type: string
    status: string
    deadline: string
    content: string
    assistant_id: string
  }>
}

export default function DrawingPage() {
  const navigate = useNavigate()
  const [pages, setPages] = useState<DrawingPageAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    loadDrawingPages()
  }, [])

  const loadDrawingPages = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await assistantService.listDrawingPages()
      setPages(data)
    } catch (err: any) {
      console.error(err)
      setError('Không thể kết nối máy chủ để tải danh sách trang đang vẽ.')
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop'
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    return `${apiURL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  // Filter pages
  const filteredPages = pages.filter(page => {
    if (statusFilter === 'ALL') return true
    if (statusFilter === 'in_progress') return page.status === 'in_progress'
    if (statusFilter === 'review') return page.status === 'review'
    return true
  })

  return (
    <div className="max-w-[1200px] mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">VẼ & CHỈNH SỬA</h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3 mb-2" />
          <p className="text-sm font-semibold text-gray-500">
            Quản lý các trang phân cảnh đang vẽ nháp, sửa nét hoặc tô màu do Mangaka phân công
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 text-xs font-bold uppercase border-2 transition-colors cursor-pointer ${
            statusFilter === 'ALL' ? 'bg-manga-ink text-white border-manga-ink' : 'bg-white text-gray-500 border-gray-200 hover:border-manga-ink'
          }`}
        >
          Tất cả ({pages.length})
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`px-4 py-2 text-xs font-bold uppercase border-2 transition-colors cursor-pointer ${
            statusFilter === 'in_progress' ? 'bg-manga-ink text-white border-manga-ink' : 'bg-white text-gray-500 border-gray-200 hover:border-manga-ink'
          }`}
        >
          Đang thực hiện ({pages.filter(p => p.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setStatusFilter('review')}
          className={`px-4 py-2 text-xs font-bold uppercase border-2 transition-colors cursor-pointer ${
            statusFilter === 'review' ? 'bg-manga-ink text-white border-manga-ink' : 'bg-white text-gray-500 border-gray-200 hover:border-manga-ink'
          }`}
        >
          Chờ duyệt ({pages.filter(p => p.status === 'review').length})
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex items-center justify-center flex-col gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-manga-red" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải danh sách trang vẽ...</span>
        </div>
      ) : error ? (
        <div className="bg-[#FFF5F5] border-4 border-manga-ink p-8 text-center manga-shadow-sm">
          <AlertTriangle className="w-12 h-12 text-[#E63946] mx-auto mb-3" />
          <h3 className="font-bold text-[#E63946]">{error}</h3>
          <button
            onClick={loadDrawingPages}
            className="mt-4 bg-[#E63946] text-white px-4 py-2 border-2 border-black font-bold uppercase text-xs hover:bg-white hover:text-[#E63946] transition-colors"
          >
            Tải lại
          </button>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="bg-white border-4 border-manga-ink p-12 text-center manga-shadow-sm">
          <PenTool className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="font-manga text-2xl font-bold uppercase text-gray-500">Không có trang nào đang vẽ</h3>
          <p className="text-sm text-gray-400 mt-2 font-medium">Bạn sẽ nhận được phân công vẽ phác thảo hoặc tô màu từ Mangaka chính.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => {
            const sortedVersions = [...(page.page_version || [])].sort((a, b) => b.version_number - a.version_number)
            const latestImage = sortedVersions[0]?.image_url || ''
            
            const myTasksOnPage = page.page_task || []
            
            return (
              <div
                key={page.page_id}
                className="bg-white border-4 border-manga-ink manga-shadow hover:translate-y-[-2px] transition-all flex flex-col group overflow-hidden"
              >
                <div className="relative aspect-[4/5] bg-zinc-100 border-b-4 border-manga-ink overflow-hidden flex items-center justify-center">
                  {latestImage ? (
                    <img
                      src={getImageUrl(latestImage)}
                      alt={`Page ${page.page_number}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Layers className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Chưa có bản vẽ phác thảo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => navigate(`/dashboard/assistant/drawing-studio?pageId=${page.page_id}`)}
                      className="bg-white text-manga-ink px-4 py-2.5 font-bold uppercase text-xs flex items-center gap-2 hover:bg-manga-red hover:text-white transition-colors border-2 border-manga-ink shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer"
                    >
                      <Eye className="w-4 h-4" /> Vào Không Gian Vẽ
                    </button>
                  </div>
                  
                  <div className="absolute top-3 left-3 bg-white border-2 border-manga-ink px-2.5 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    Trang {page.page_number}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-0.5 border text-[9px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                      page.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700 border-blue-400'
                        : 'bg-purple-100 text-purple-700 border-purple-400'
                    }`}>
                      {page.status === 'in_progress' ? 'Đang vẽ' : 'Chờ duyệt'}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-manga text-xl font-bold text-manga-ink uppercase leading-tight truncate">
                      {page.chapter?.title || `Chương ${page.chapter?.chapter_number}`}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Mã phân cảnh: {page.page_id.slice(0, 8)}
                    </p>
                  </div>

                  <div className="space-y-2 border-t-2 border-dashed border-gray-200 pt-3">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                      Nhiệm vụ của bạn ({myTasksOnPage.length}):
                    </p>
                    <div className="space-y-1 max-h-[80px] overflow-y-auto pr-1">
                      {myTasksOnPage.map((task, idx) => (
                        <div key={task.task_id || idx} className="flex items-center justify-between text-xs font-semibold text-gray-700">
                          <span className="truncate">• {task.task_type.toUpperCase()}</span>
                          <span className={`text-[9px] font-bold px-1.5 uppercase border ${
                            (task.status === 'completed' || task.status === 'approved') ? 'text-green-600 bg-green-50 border-green-300' :
                            task.status === 'submitted' ? 'text-purple-600 bg-purple-50 border-purple-300' :
                            (task.status === 'needs_revision' || task.status === 'rejected') ? 'text-red-600 bg-red-50 border-red-300' :
                            'text-blue-600 bg-blue-50 border-blue-300'
                          }`}>
                            {task.status === 'approved' ? 'approved' : task.status === 'rejected' ? 'needs_revision' : task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/dashboard/assistant/drawing-studio?pageId=${page.page_id}`)}
                    className="w-full mt-2 py-2.5 bg-manga-ink hover:bg-[#E63946] text-white font-bold text-xs uppercase border-2 border-manga-ink hover:border-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Vẽ ngay</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
