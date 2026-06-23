import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import { ArrowLeft, Save, FileText, BookOpen, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { seriesService } from '@/services/series.service'
import { chapterService } from '@/services/chapter.service'
import { manuscriptService } from '@/services/manuscript.service'

export default function CreateManuscriptPage() {
  const navigate = useNavigate()

  // Form states
  const [seriesList, setSeriesList] = useState<any[]>([])
  const [chapters, setChapters] = useState<any[]>([])
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [selectedChapterId, setSelectedChapterId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // UI States
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [validationErrors, setValidationErrors] = useState<{ title?: string; content?: string; seriesId?: string }>({})

  // Fetch Series on mount
  useEffect(() => {
    const loadSeries = async () => {
      try {
        const list = await seriesService.getAll()
        setSeriesList(list)
        if (list.length > 0) {
          setSelectedSeriesId(list[0]._id)
        }
      } catch (err) {
        console.error(err)
        setErrorMsg('Không thể tải danh sách series truyện.')
      } finally {
        setIsLoading(false)
      }
    }
    loadSeries()
  }, [])

  // Fetch Chapters when selected Series changes
  useEffect(() => {
    if (!selectedSeriesId) {
      setChapters([])
      setSelectedChapterId('')
      return
    }
    const loadChapters = async () => {
      try {
        const list = await chapterService.getBySeriesId(selectedSeriesId)
        setChapters(list)
        if (list.length > 0) {
          setSelectedChapterId(list[0]._id)
        } else {
          setSelectedChapterId('')
        }
      } catch (err) {
        console.error(err)
        setChapters([])
        setSelectedChapterId('')
      }
    }
    loadChapters()
  }, [selectedSeriesId])

  const validateForm = () => {
    const errors: typeof validationErrors = {}
    if (!selectedSeriesId) errors.seriesId = 'Vui lòng chọn một tác phẩm (series)'
    if (!title.trim()) errors.title = 'Tiêu đề bản thảo không được để trống'
    if (!content.trim() || content.trim().length < 10) {
      errors.content = 'Nội dung bản thảo/kịch bản kịch bản phải dài từ 10 ký tự trở lên'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateManuscript = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // Get mangaka_id from localStorage
      const userStr = localStorage.getItem('mangaflow_user')
      let mangakaId = ''
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr)
          mangakaId = parsed.user?.id || parsed.id || ''
        } catch {
          // ignore
        }
      }

      if (!mangakaId) {
        throw new Error('Không tìm thấy thông tin tài khoản đăng nhập mangaka!')
      }

      await manuscriptService.create({
        mangaka_id: mangakaId,
        series_id: selectedSeriesId,
        chapter_id: selectedChapterId || undefined,
        title: title.trim(),
        content: content.trim(),
        status: 'submitted' // Create as submitted directly to Tantou Editor
      })

      setSuccessMsg('✅ Đã gửi bản thảo kịch bản cho Tantou Editor thành công!')
      setTimeout(() => navigate('/dashboard/mangaka/manuscripts'), 2000)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi không xác định khi tạo bản thảo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-black border-t-[#E63946] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-500 uppercase text-xs">Đang tải biểu mẫu tạo bản thảo...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-16 font-sans">
      {/* Header Title */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">
            GỬI BẢN THẢO CHO TANTOU EDITOR
          </h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3" />
          <p className="text-sm font-bold text-gray-500 mt-2">
            Tạo bản thảo kịch bản chữ để gửi cho Tantou Editor xem xét và duyệt
          </p>
        </div>
        <Link
          to="/dashboard/mangaka/manuscripts"
          className="flex items-center gap-1.5 border-2 border-black px-4 py-2 font-bold text-xs uppercase hover:bg-gray-50 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Link>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-green-50 border-2 border-green-500 p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="font-bold text-green-700 text-sm">{successMsg}</p>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-red-50 border-2 border-manga-red p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-manga-red shrink-0" />
          <p className="font-bold text-manga-red text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 border-2 border-blue-400 p-4 flex gap-3 mb-6">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-manga text-sm font-bold uppercase tracking-wider text-blue-700">
            QUY TRÌNH DUYỆT BẢN THẢO
          </h4>
          <p className="text-xs font-bold text-blue-800 leading-relaxed">
            Bản thảo sau khi tạo sẽ được gửi trực tiếp đến cho <strong>Tantou Editor (Biên tập viên phụ trách)</strong> dưới trạng thái Chờ duyệt. Biên tập viên sẽ xem xét, đánh giá và phản hồi ý kiến cho bạn.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border-4 border-manga-ink p-6 md:p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
        <form onSubmit={handleCreateManuscript} className="space-y-6">
          
          <div className="border-b-2 border-dashed border-gray-200 pb-4 mb-2">
            <h2 className="font-manga text-xl font-bold uppercase flex items-center gap-2">
              <FileText className="w-5 h-5 text-manga-red" />
              Thông tin bản thảo kịch bản
            </h2>
          </div>

          {/* Series Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-manga-ink">
              Tác phẩm (Series) <span className="text-manga-red">*</span>
            </label>
            <select
              value={selectedSeriesId}
              onChange={e => setSelectedSeriesId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-white"
            >
              {seriesList.length === 0 ? (
                <option value="">Không tìm thấy series nào</option>
              ) : (
                seriesList.map(s => (
                  <option key={s._id} value={s._id}>{s.title}</option>
                ))
              )}
            </select>
            {validationErrors.seriesId && <p className="text-xs font-bold text-manga-red">{validationErrors.seriesId}</p>}
          </div>

          {/* Chapter Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-manga-ink">
              Chương truyện (Chapter - Tùy chọn)
            </label>
            <select
              value={selectedChapterId}
              onChange={e => setSelectedChapterId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-white"
            >
              <option value="">-- Chọn Chương (Không bắt buộc) --</option>
              {chapters.map(ch => (
                <option key={ch._id} value={ch._id}>Chương {ch.chapter_number}: {ch.title}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-manga-ink">
              Tiêu đề bản thảo kịch bản <span className="text-manga-red">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ví dụ: Kịch bản Chương 1: Sự khởi đầu mới"
              className={`w-full px-4 py-3 border-2 focus:outline-none focus:border-manga-red font-bold text-sm bg-transparent transition-colors ${
                validationErrors.title ? 'border-manga-red bg-red-50/30' : 'border-manga-ink'
              }`}
            />
            {validationErrors.title && <p className="text-xs font-bold text-manga-red">{validationErrors.title}</p>}
          </div>

          {/* Script Content */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-manga-ink">
              Nội dung kịch bản chữ (Script Content) <span className="text-manga-red">*</span>
            </label>
            <textarea
              rows={10}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Nhập nội dung phác thảo kịch bản, các đoạn hội thoại hoặc phân cảnh nháp tại đây..."
              className={`w-full px-4 py-3 border-2 focus:outline-none focus:border-manga-red font-bold text-sm bg-transparent resize-y transition-colors ${
                validationErrors.content ? 'border-manga-red bg-red-50/30' : 'border-manga-ink'
              }`}
            />
            {validationErrors.content && <p className="text-xs font-bold text-manga-red">{validationErrors.content}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 border-t-2 border-dashed border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard/mangaka/manuscripts')}
              className="px-6 py-3 border-2 border-manga-ink bg-white text-manga-ink font-manga font-bold text-sm uppercase hover:bg-gray-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-[#E63946] text-white border-2 border-black font-manga font-bold text-sm uppercase hover:bg-red-750 transition-colors disabled:opacity-60 disabled:cursor-not-allowed manga-shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Gửi bản thảo cho Tantou Editor
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  )
}
