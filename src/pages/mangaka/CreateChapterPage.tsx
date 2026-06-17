import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { FilePlus, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { seriesService, SeriesAPI, getErrorMessage } from '@/services/series.service'
import { chapterService, ChapterAPI } from '@/services/chapter.service'

export default function CreateChapterPage() {
  const { seriesId } = useParams()
  const navigate = useNavigate()

  const [series, setSeries] = useState<SeriesAPI | null>(null)
  const [existingChapters, setExistingChapters] = useState<ChapterAPI[]>([])

  const [chapterNumber, setChapterNumber] = useState(1)
  const [title, setTitle] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [apiError, setApiError] = useState('')

  // Load series + existing chapters để tính chapter_number kế tiếp
  useEffect(() => {
    if (!seriesId) return
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [s, chs] = await Promise.all([
          seriesService.getById(seriesId),
          chapterService.getBySeriesId(seriesId),
        ])
        setSeries(s)
        setExistingChapters(chs)
        if (chs.length > 0) {
          const maxNum = Math.max(...chs.map(c => c.chapter_number))
          setChapterNumber(maxNum + 1)
        }
      } catch (err) {
        setApiError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [seriesId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!seriesId || !title.trim()) return

    setIsSubmitting(true)
    setApiError('')
    try {
      await chapterService.create(seriesId, {
        title: title.trim(),
        chapter_number: chapterNumber,
      })
      setSuccessMsg(`✅ Đã tạo thành công Chương ${chapterNumber}: ${title}!`)
      setTimeout(() => navigate(`/dashboard/mangaka/series/${seriesId}`), 1500)
    } catch (err) {
      setApiError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-manga-ink border-t-manga-red rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-500 uppercase text-sm">Đang tải thông tin series...</p>
      </div>
    )
  }

  if (!series) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-manga-red mx-auto mb-3" />
        <p className="font-bold text-manga-red text-lg">Không tìm thấy series này!</p>
      </div>
    )
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
          <p className="text-xs text-gray-400 font-bold uppercase mt-0.5">
            Đã có {existingChapters.length} chapter
          </p>
        </div>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="bg-green-50 border-2 border-green-500 p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="font-bold text-green-700 text-sm">{successMsg}</p>
        </div>
      )}

      {/* Error */}
      {apiError && (
        <div className="bg-red-50 border-2 border-manga-red p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-manga-red shrink-0" />
          <p className="font-bold text-manga-red text-sm">{apiError}</p>
        </div>
      )}

      <div className="bg-white border-4 border-manga-ink manga-shadow">
        <div className="p-6 border-b-4 border-manga-ink bg-gray-50 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-manga-red shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 font-bold">
            Khi tạo chapter mới, hệ thống sẽ tự động chuẩn bị không gian lưu trữ cho trang bản thảo.
            Bạn có thể thêm trang và giao task cho trợ lý sau khi chapter được tạo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-2">
                Số Chapter <span className="text-manga-red">*</span>
              </label>
              <input
                type="number"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)}
                min="1"
                required
                className="w-full border-2 border-manga-ink p-3 text-lg font-manga font-bold focus:ring-2 focus:ring-manga-red text-center bg-gray-50 focus:outline-none"
              />
            </div>
            <div className="flex flex-col justify-center bg-gray-50 border-2 border-dashed border-gray-300 p-3 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Chapter tiếp theo dự kiến</span>
              <span className="font-manga text-3xl font-bold text-manga-red">#{chapterNumber}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-2">
              Tiêu đề Chapter <span className="text-manga-red">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-2 border-manga-ink p-3 text-lg font-bold focus:ring-2 focus:ring-manga-red focus:outline-none"
              placeholder="VD: Cậu bé đá..."
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
              disabled={isSubmitting || !title.trim()}
              className={`flex items-center gap-2 bg-manga-red text-white font-manga font-bold px-8 py-3 border-2 border-manga-ink hover:bg-red-700 transition-colors uppercase text-lg ${
                (isSubmitting || !title.trim()) ? 'opacity-50 cursor-not-allowed' : 'manga-shadow-sm hover:translate-y-0.5 hover:shadow-none'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ĐANG TẠO...
                </>
              ) : (
                <>TẠO CHAPTER <FilePlus className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
