import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, AlertTriangle, Send, Save, User, BookOpen, Tag, Calendar, FileText, Info } from 'lucide-react'
import { mangakaStore } from '@/data/mangakaMockData'

const MOCK_EDITORS = [
  { id: 'ed-001', name: 'Nakamura Hiroshi' },
  { id: 'ed-002', name: 'Suzuki Yuki' },
  { id: 'ed-003', name: 'Tanaka Rei' },
  { id: 'ed-004', name: 'Watanabe Jun' },
]

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Shonen',
  'Shojo', 'Seinen', 'Josei', 'Slice of Life', 'Sports',
  'Supernatural', 'Thriller',
]

export default function CreateSeriesPage() {
  const navigate = useNavigate()

  // Form fields
  const [title, setTitle] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [publishSchedule, setPublishSchedule] = useState('Weekly')
  const [proposedStartDate, setProposedStartDate] = useState('')
  const [tantouEditorId, setTantouEditorId] = useState('')
  const [editorNote, setEditorNote] = useState('')

  // UI state
  const [errors, setErrors] = useState<{ title?: string; genres?: string; description?: string; tantouEditorId?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeStep, setActiveStep] = useState(1)

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  const validateForm = () => {
    const tempErrors: typeof errors = {}
    if (!title.trim()) tempErrors.title = 'Tên tác phẩm không được để trống'
    if (selectedGenres.length === 0) tempErrors.genres = 'Chọn ít nhất một thể loại'
    if (!description.trim() || description.trim().length < 20)
      tempErrors.description = 'Mô tả phải tối thiểu 20 ký tự'
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const validateForSubmit = () => {
    const tempErrors: typeof errors = {}
    if (!title.trim()) tempErrors.title = 'Tên tác phẩm không được để trống'
    if (selectedGenres.length === 0) tempErrors.genres = 'Chọn ít nhất một thể loại'
    if (!description.trim() || description.trim().length < 20)
      tempErrors.description = 'Mô tả phải tối thiểu 20 ký tự'
    if (!tantouEditorId) tempErrors.tantouEditorId = 'Vui lòng chọn Tantou Editor phụ trách'
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  // Save as Draft
  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    mangakaStore.addSeries({
      title: title.trim(),
      description: description.trim(),
      tags: selectedGenres,
      coverUrl: coverUrl.trim() || null,
      status: 'Draft',
      nextDeadline: proposedStartDate || 'Chưa thiết lập',
    })

    alert('Đã lưu bản nháp thành công!')
    navigate('/dashboard/mangaka/series')
  }

  // Submit to Editorial Board for review
  const handleSubmitToBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForSubmit()) return

    setIsSubmitting(true)
    await new Promise(res => setTimeout(res, 1200))

    mangakaStore.addSeries({
      title: title.trim(),
      description: description.trim(),
      tags: selectedGenres,
      coverUrl: coverUrl.trim() || null,
      status: 'Waiting Review',
      nextDeadline: proposedStartDate || 'Chưa thiết lập',
    })

    setIsSubmitting(false)
    alert('Hồ sơ đã được nộp lên Hội đồng biên tập! Trạng thái: Đang xét duyệt (Under Review). Bạn sẽ nhận thông báo khi có kết quả.')
    navigate('/dashboard/mangaka/series')
  }

  const steps = [
    { num: 1, label: 'Thông tin cơ bản' },
    { num: 2, label: 'Nội dung & Lịch phát hành' },
    { num: 3, label: 'Phân công & Gửi duyệt' },
  ]

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none">
          TẠO TÁC PHẨM MỚI
        </h1>
        <div className="h-1.5 w-24 bg-manga-red mt-3" />
        <p className="text-sm font-bold text-gray-500 mt-2">
          Tạo hồ sơ series và nộp lên Hội đồng biên tập để xét duyệt xuất bản
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((step, idx) => (
          <React.Fragment key={step.num}>
            <button
              onClick={() => setActiveStep(step.num)}
              className={`flex items-center gap-2 px-4 py-2.5 border-2 text-xs font-black uppercase transition-all ${
                activeStep === step.num
                  ? 'bg-manga-red text-white border-manga-red'
                  : activeStep > step.num
                  ? 'bg-manga-ink text-white border-manga-ink'
                  : 'bg-white text-manga-ink border-manga-ink hover:bg-red-50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                activeStep === step.num ? 'bg-white text-manga-red border-white' :
                activeStep > step.num ? 'bg-manga-red text-white border-manga-red' :
                'border-manga-ink'
              }`}>
                {activeStep > step.num ? '✓' : step.num}
              </span>
              <span className="hidden md:inline">{step.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 w-6 ${activeStep > step.num ? 'bg-manga-ink' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Alert Info */}
      <div className="bg-blue-50 border-2 border-blue-400 p-4 flex gap-3 mb-6">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-manga text-sm font-bold uppercase tracking-wider text-blue-700">
            QUY TRÌNH XÉT DUYỆT
          </h4>
          <p className="text-xs font-bold text-blue-800 leading-relaxed">
            Series mới được <strong>Lưu nháp</strong> (Draft) trước, sau đó bạn có thể <strong>Nộp lên Hội đồng</strong> để xét duyệt.
            Sau khi nộp, trạng thái chuyển sang <strong className="text-orange-600">Đang xét duyệt (Under Review)</strong>.
            Hội đồng sẽ bỏ phiếu thông qua và Tantou Editor được phân công sẽ liên hệ với bạn.
          </p>
        </div>
      </div>

      <div className="bg-white border-4 border-manga-ink manga-shadow">
        <form>
          {/* ─── STEP 1: Thông tin cơ bản ─── */}
          {activeStep === 1 && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b-2 border-dashed border-gray-200 pb-4 mb-2">
                <h2 className="font-manga text-xl font-bold uppercase flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-manga-red" />
                  Thông tin cơ bản
                </h2>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-manga-ink">
                  TÊN TÁC PHẨM (SERIES TITLE) <span className="text-manga-red">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ví dụ: Ánh Sáng Nơi Chân Trời"
                  className={`w-full px-4 py-3 border-2 focus:outline-none focus:border-manga-red font-bold text-sm bg-transparent transition-colors ${
                    errors.title ? 'border-manga-red bg-red-50/30' : 'border-manga-ink'
                  }`}
                />
                {errors.title && <p className="text-xs font-bold text-manga-red">{errors.title}</p>}
              </div>

              {/* Genre Tags */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-manga-ink flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  THỂ LOẠI <span className="text-manga-red">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 border-2 text-xs font-black uppercase transition-all ${
                        selectedGenres.includes(genre)
                          ? 'bg-manga-red text-white border-manga-red'
                          : 'bg-white text-manga-ink border-manga-ink hover:bg-red-50 hover:border-manga-red'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
                {selectedGenres.length > 0 && (
                  <p className="text-[10px] font-bold text-gray-500 uppercase">
                    Đã chọn: {selectedGenres.join(', ')}
                  </p>
                )}
                {errors.genres && <p className="text-xs font-bold text-manga-red">{errors.genres}</p>}
              </div>

              {/* Cover URL */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-manga-ink">
                  ẢNH BÌA MOCKUP (IMAGE URL - TÙY CHỌN)
                </label>
                <input
                  type="text"
                  value={coverUrl}
                  onChange={e => setCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-3 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-transparent"
                />
                {coverUrl && (
                  <div className="w-24 h-32 border-2 border-manga-ink overflow-hidden mt-2">
                    <img src={coverUrl} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { if (validateForm()) setActiveStep(2) }}
                  className="px-8 py-3 bg-manga-ink text-white font-manga font-bold text-sm uppercase border-2 border-manga-ink hover:bg-gray-800 transition-colors"
                >
                  Tiếp theo →
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Nội dung & Lịch phát hành ─── */}
          {activeStep === 2 && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b-2 border-dashed border-gray-200 pb-4 mb-2">
                <h2 className="font-manga text-xl font-bold uppercase flex items-center gap-2">
                  <FileText className="w-5 h-5 text-manga-red" />
                  Nội dung & Lịch phát hành
                </h2>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-manga-ink">
                  TÓM TẮT CỐT TRUYỆN (TỐI THIỂU 20 KÝ TỰ) <span className="text-manga-red">*</span>
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Mô tả tóm tắt nội dung chính, tuyến nhân vật chính, xung đột chính trong tác phẩm..."
                  className={`w-full px-4 py-3 border-2 focus:outline-none focus:border-manga-red font-bold text-sm bg-transparent resize-y transition-colors ${
                    errors.description ? 'border-manga-red bg-red-50/30' : 'border-manga-ink'
                  }`}
                />
                <div className="flex justify-between items-center">
                  {errors.description
                    ? <p className="text-xs font-bold text-manga-red">{errors.description}</p>
                    : <span />
                  }
                  <span className={`text-[10px] font-bold uppercase ${description.length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
                    {description.length} / 20+ ký tự
                  </span>
                </div>
              </div>

              {/* Publish Schedule & Proposed Start Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-manga-ink flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    LỊCH PHÁT HÀNH ĐỀ XUẤT
                  </label>
                  <select
                    value={publishSchedule}
                    onChange={e => setPublishSchedule(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-white"
                  >
                    <option value="Weekly">Hàng tuần (Weekly)</option>
                    <option value="Monthly">Hàng tháng (Monthly)</option>
                    <option value="Special">Đặc biệt (Special)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-manga-ink">
                    NGÀY BẮT ĐẦU DỰ KIẾN
                  </label>
                  <input
                    type="date"
                    value={proposedStartDate}
                    onChange={e => setProposedStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-white"
                  />
                </div>
              </div>

              {/* Editor Note */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-manga-ink">
                  GHI CHÚ KÈM HỒ SƠ (GỬI ĐẾN EDITOR)
                </label>
                <textarea
                  rows={3}
                  value={editorNote}
                  onChange={e => setEditorNote(e.target.value)}
                  placeholder="Yêu cầu riêng về phong cách nghệ thuật, tone màu chủ đạo, tần suất chương mong muốn..."
                  className="w-full px-4 py-3 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-transparent resize-y"
                />
              </div>

              <div className="flex gap-3 justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-6 py-3 border-2 border-manga-ink bg-white text-manga-ink font-manga font-bold text-sm uppercase hover:bg-gray-50 transition-colors"
                >
                  ← Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => { if (validateForm()) setActiveStep(3) }}
                  className="px-8 py-3 bg-manga-ink text-white font-manga font-bold text-sm uppercase border-2 border-manga-ink hover:bg-gray-800 transition-colors"
                >
                  Tiếp theo →
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Phân công & Gửi duyệt ─── */}
          {activeStep === 3 && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b-2 border-dashed border-gray-200 pb-4 mb-2">
                <h2 className="font-manga text-xl font-bold uppercase flex items-center gap-2">
                  <User className="w-5 h-5 text-manga-red" />
                  Phân công & Gửi duyệt
                </h2>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 border-2 border-gray-200 p-4 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">Tóm tắt hồ sơ sẽ nộp</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Tên tác phẩm</span>
                    <span className="font-bold text-manga-ink">{title || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Thể loại</span>
                    <span className="font-bold text-manga-ink">{selectedGenres.length > 0 ? selectedGenres.join(', ') : '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Lịch phát hành</span>
                    <span className="font-bold text-manga-ink">{publishSchedule}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Bắt đầu dự kiến</span>
                    <span className="font-bold text-manga-ink">{proposedStartDate || 'Chưa xác định'}</span>
                  </div>
                </div>
              </div>

              {/* Tantou Editor Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-manga-ink flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  TANTOU EDITOR PHỤ TRÁCH <span className="text-manga-red">*</span>
                </label>
                <p className="text-[10px] text-gray-500 font-bold uppercase">
                  Chọn biên tập viên sẽ phụ trách series này. Editor sẽ nhận thông báo và liên hệ sau khi Board xét duyệt.
                </p>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {MOCK_EDITORS.map(editor => (
                    <label
                      key={editor.id}
                      className={`flex items-center gap-3 px-4 py-3 border-2 cursor-pointer transition-all ${
                        tantouEditorId === editor.id
                          ? 'border-manga-red bg-red-50 text-manga-red'
                          : 'border-manga-ink bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tantouEditor"
                        value={editor.id}
                        checked={tantouEditorId === editor.id}
                        onChange={() => setTantouEditorId(editor.id)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border-2 rounded-full flex-shrink-0 flex items-center justify-center ${
                        tantouEditorId === editor.id ? 'border-manga-red' : 'border-manga-ink'
                      }`}>
                        {tantouEditorId === editor.id && (
                          <div className="w-2 h-2 rounded-full bg-manga-red" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-manga-ink text-white flex items-center justify-center font-manga font-bold text-sm">
                          {editor.name.charAt(0)}
                        </div>
                        <span className="font-bold text-sm">{editor.name}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Tantou Editor</span>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.tantouEditorId && (
                  <p className="text-xs font-bold text-manga-red flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {errors.tantouEditorId}
                  </p>
                )}
              </div>

              {/* Warning */}
              <div className="bg-orange-50 border-2 border-orange-400 p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-orange-700 mb-1">LƯU Ý KHI NỘP LÊN HỘI ĐỒNG</h4>
                  <p className="text-xs font-bold text-orange-800 leading-relaxed">
                    Sau khi nộp, trạng thái series sẽ chuyển sang <strong>Đang xét duyệt</strong>.
                    Hội đồng biên tập sẽ xem xét và bỏ phiếu thông qua.
                    Bạn không thể chỉnh sửa hồ sơ trong thời gian đang xét duyệt.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t-2 border-dashed border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="sm:w-auto px-6 py-3 border-2 border-manga-ink bg-white text-manga-ink font-manga font-bold text-sm uppercase hover:bg-gray-50 transition-colors"
                >
                  ← Quay lại
                </button>

                <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:justify-end">
                  {/* Save Draft */}
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-manga-ink bg-white text-manga-ink font-manga font-bold text-sm uppercase hover:bg-gray-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Lưu nháp
                  </button>

                  {/* Submit to Board */}
                  <button
                    type="button"
                    onClick={handleSubmitToBoard}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-manga-red text-white font-manga font-bold text-sm uppercase border-2 border-manga-red hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed manga-shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Nộp lên Hội đồng
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
