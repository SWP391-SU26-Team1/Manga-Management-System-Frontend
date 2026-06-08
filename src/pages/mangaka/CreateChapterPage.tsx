import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Save, FilePlus, AlertCircle } from 'lucide-react'
import { mangakaStore, Series } from '@/data/mangakaMockData'

export default function CreateChapterPage() {
  const { seriesId } = useParams()
  const navigate = useNavigate()

  const [series, setSeries] = useState<Series | null>(null)
  
  const [chapterNumber, setChapterNumber] = useState(1)
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [totalPages, setTotalPages] = useState(20)
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (seriesId) {
      const s = mangakaStore.getSeries().find(s => s.id === seriesId)
      if (s) {
        setSeries(s)
        const chapters = mangakaStore.getChapters().filter(c => c.seriesId === seriesId)
        if (chapters.length > 0) {
          const maxNum = Math.max(...chapters.map(c => c.chapterNumber))
          setChapterNumber(maxNum + 1)
        }
      }
    }
  }, [seriesId])

  if (!series) {
    return <div className="p-8 text-center font-bold text-red-500">Đang tải hoặc Không tìm thấy Series!</div>
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!seriesId || !title || !deadline || totalPages < 1) return

    setIsSubmitting(true)
    
    setTimeout(() => {
      mangakaStore.addChapter({
        seriesId,
        chapterNumber,
        title,
        deadline,
        totalPages,
        status: "Draft",
      })
      navigate(`/dashboard/mangaka/series/${seriesId}`)
    }, 600)
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-red tracking-wide flex items-center gap-3">
            <FilePlus className="w-8 h-8" />
            TẠO CHAPTER MỚI
          </h1>
          <p className="text-gray-600 font-bold">Series: {series.title}</p>
        </div>
      </div>

      <div className="bg-white border-4 border-manga-ink manga-shadow">
        <div className="p-6 border-b-4 border-manga-ink bg-gray-50 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-manga-red shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 font-bold">
            Khi tạo chapter mới, hệ thống sẽ tự động tạo {totalPages} trang nháp (Draft) đi kèm. Bạn có thể thay đổi thiết lập của từng trang sau này trong phần quản lý Chapter / Page.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Số Chapter</label>
              <input 
                type="number" 
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)}
                min="1"
                className="w-full border-2 border-manga-ink p-3 text-lg font-manga font-bold focus:ring-2 focus:ring-manga-red text-center bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Số trang dự kiến</label>
              <input 
                type="number" 
                value={totalPages}
                onChange={(e) => setTotalPages(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                className="w-full border-2 border-manga-ink p-3 text-lg font-bold focus:ring-2 focus:ring-manga-red text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Tiêu đề Chapter</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-2 border-manga-ink p-3 text-lg font-bold focus:ring-2 focus:ring-manga-red"
              placeholder="VD: Cậu bé đá..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Deadline nộp bản thảo</label>
            <input 
              type="date" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border-2 border-manga-ink p-3 font-bold focus:ring-2 focus:ring-manga-red uppercase"
              required
            />
          </div>

          <div className="pt-6 mt-6 border-t-2 border-dashed border-gray-300 flex justify-end gap-4">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border-2 border-manga-ink font-bold hover:bg-gray-100 uppercase text-sm"
            >
              Hủy
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !title || !deadline}
              className={`flex items-center gap-2 bg-manga-red text-white font-manga font-bold px-8 py-3 border-2 border-manga-ink hover:bg-red-700 transition-colors uppercase text-lg ${
                (isSubmitting || !title || !deadline) ? 'opacity-50 cursor-not-allowed' : 'manga-shadow-sm hover:translate-y-0.5 hover:shadow-none'
              }`}
            >
              {isSubmitting ? 'ĐANG TẠO...' : (
                <>
                  TẠO CHAPTER <Save className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
