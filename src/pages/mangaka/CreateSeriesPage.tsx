import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { ArrowLeft, AlertTriangle, Send, Save, BookOpen, Tag, Calendar, FileText, Info, CheckCircle, X, Upload, Trash2 } from 'lucide-react'
import { seriesService, getErrorMessage } from '@/services/series.service'
import { uploadService } from '@/services/upload.service'

export default function CreateSeriesPage() {
  const navigate = useNavigate()

  // Form fields
  const [title, setTitle] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [genreInput, setGenreInput] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [publishSchedule, setPublishSchedule] = useState('Weekly')
  const [proposedStartDate, setProposedStartDate] = useState('')
  const [editorNote, setEditorNote] = useState('')

  // UI state
  const [errors, setErrors] = useState<{ title?: string; genres?: string; description?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [successMsg, setSuccessMsg] = useState('')
  const [apiError, setApiError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    setIsUploading(true)
    setUploadError('')
    try {
      const res = await uploadService.uploadSingle(file, 'series_covers')
      setCoverUrl(res.secure_url)
    } catch (err) {
      setUploadError(getErrorMessage(err))
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveGenre = (genreToRemove: string) => {
    setSelectedGenres(prev => prev.filter(g => g !== genreToRemove))
  }

  const handleGenreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = genreInput.trim()
      if (val) {
        if (!selectedGenres.includes(val)) {
          setSelectedGenres(prev => [...prev, val])
        }
        setGenreInput('')
      }
    }
  }

  const addCustomGenre = () => {
    const val = genreInput.trim()
    if (val) {
      if (!selectedGenres.includes(val)) {
        setSelectedGenres(prev => [...prev, val])
      }
      setGenreInput('')
    }
  }

  const getFinalGenreString = () => {
    const finalGenres = [...selectedGenres]
    const trimmed = genreInput.trim()
    if (trimmed && !finalGenres.includes(trimmed)) {
      finalGenres.push(trimmed)
    }
    return finalGenres.join(', ')
  }

  const validateForm = () => {
    const tempErrors: typeof errors = {}
    if (!title.trim()) tempErrors.title = 'Tên tác phẩm không được để trống'
    if (!description.trim() || description.trim().length < 20)
      tempErrors.description = 'Mô tả phải tối thiểu 20 ký tự'
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  // Save as Draft → POST /api/mangaka/series
  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setApiError('')
    try {
      await seriesService.create({
        title: title.trim(),
        description: description.trim(),
        genre: getFinalGenreString(),
        cover_image: coverUrl.trim() || null,
      })
      setSuccessMsg('✅ Đã lưu bản nháp thành công!')
      setTimeout(() => navigate('/dashboard/mangaka/series'), 1500)
    } catch (err) {
      setApiError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit to Board → POST tạo series rồi PATCH submit-review
  const handleSubmitToBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setApiError('')
    try {
      // Bước 1: Tạo series
      const newSeries = await seriesService.create({
        title: title.trim(),
        description: description.trim(),
        genre: getFinalGenreString(),
        cover_image: coverUrl.trim() || null,
      })

      // Bước 2: Nộp lên Board
      await seriesService.submitReview(newSeries._id)

      setSuccessMsg('✅ Hồ sơ đã được nộp lên Hội đồng biên tập! Trạng thái: Đang xét duyệt.')
      setTimeout(() => navigate('/dashboard/mangaka/series'), 2000)
    } catch (err) {
      setApiError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { num: 1, label: 'Thông tin cơ bản' },
    { num: 2, label: 'Nội dung & Lịch phát hành' },
    { num: 3, label: 'Xem lại & Gửi' },
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

      {/* Success Message */}
      {successMsg && (
        <div className="bg-green-50 border-2 border-green-500 p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="font-bold text-green-700 text-sm">{successMsg}</p>
        </div>
      )}

      {/* API Error */}
      {apiError && (
        <div className="bg-red-50 border-2 border-manga-red p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-manga-red shrink-0" />
          <p className="font-bold text-manga-red text-sm">{apiError}</p>
        </div>
      )}

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
                  THỂ LOẠI
                </label>
                
                {/* Tag Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={genreInput}
                    onChange={e => setGenreInput(e.target.value)}
                    onKeyDown={handleGenreKeyDown}
                    placeholder="Nhập thể loại tự do (ví dụ: Isekai, Harem) rồi nhấn Enter..."
                    className="flex-1 px-4 py-3 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addCustomGenre}
                    className="px-4 py-3 bg-manga-ink text-white font-manga font-bold text-sm uppercase border-2 border-manga-ink hover:bg-gray-800 transition-colors"
                  >
                    Thêm
                  </button>
                </div>

                {/* Selected Tags list */}
                {selectedGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2 py-1">
                    {selectedGenres.map(genre => (
                      <span
                        key={genre}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-manga-red text-white text-xs font-black uppercase border-2 border-manga-red"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => handleRemoveGenre(genre)}
                          className="hover:text-gray-200 focus:outline-none ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}


                {errors.genres && <p className="text-xs font-bold text-manga-red">{errors.genres}</p>}
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-manga-ink">
                  ẢNH BÌA MOCKUP (ẢNH TẢI LÊN - TÙY CHỌN)
                </label>
                
                {coverUrl ? (
                  <div className="relative w-40 h-52 border-4 border-manga-ink manga-shadow overflow-hidden group bg-gray-100 mt-2">
                    <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-manga-red text-white border-2 border-manga-ink hover:bg-red-700 transition-colors shadow"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative mt-2">
                    <label className={`flex flex-col items-center justify-center w-full h-40 border-4 border-dashed border-manga-ink bg-gray-50/50 hover:bg-red-50/20 transition-all cursor-pointer ${
                      isUploading ? 'opacity-70 pointer-events-none' : ''
                    }`}>
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <span className="w-7 h-7 border-4 border-manga-ink border-t-manga-red rounded-full animate-spin" />
                          <span className="text-xs font-bold text-gray-500 uppercase">Đang tải ảnh lên...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 p-4 text-center">
                          <Upload className="w-7 h-7 text-manga-ink animate-bounce" />
                          <span className="text-xs font-black uppercase text-manga-ink">Click để chọn file ảnh bìa</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Hỗ trợ JPG, PNG, WEBP tối đa 5MB</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                )}
                {uploadError && <p className="text-xs font-bold text-manga-red mt-1">{uploadError}</p>}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const tempErrors: typeof errors = {}
                    if (!title.trim()) {
                      tempErrors.title = 'Tên tác phẩm không được để trống'
                      setErrors(tempErrors)
                    } else {
                      // Tự động thêm thể loại đang gõ dở nếu quên bấm "Thêm"
                      const trimmedGenre = genreInput.trim()
                      if (trimmedGenre) {
                        if (!selectedGenres.includes(trimmedGenre)) {
                          setSelectedGenres(prev => [...prev, trimmedGenre])
                        }
                        setGenreInput('')
                      }
                      setErrors({})
                      setActiveStep(2)
                    }
                  }}
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
                  onClick={() => {
                    const tempErrors: typeof errors = {}
                    if (!description.trim() || description.trim().length < 20) {
                      tempErrors.description = 'Mô tả phải tối thiểu 20 ký tự'
                      setErrors(tempErrors)
                    } else {
                      setErrors({})
                      setActiveStep(3)
                    }
                  }}
                  className="px-8 py-3 bg-manga-ink text-white font-manga font-bold text-sm uppercase border-2 border-manga-ink hover:bg-gray-800 transition-colors"
                >
                  Tiếp theo →
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Xem lại & Gửi ─── */}
          {activeStep === 3 && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b-2 border-dashed border-gray-200 pb-4 mb-2">
                <h2 className="font-manga text-xl font-bold uppercase flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-manga-red" />
                  Xem lại & Gửi
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
                    <span className="font-bold text-manga-ink">
                      {getFinalGenreString() || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Lịch phát hành</span>
                    <span className="font-bold text-manga-ink">{publishSchedule}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Bắt đầu dự kiến</span>
                    <span className="font-bold text-manga-ink">{proposedStartDate || 'Chưa xác định'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Mô tả</span>
                    <span className="font-bold text-manga-ink text-sm whitespace-pre-wrap break-words block">{description || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-orange-50 border-2 border-orange-400 p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-orange-700 mb-1">LƯU Ý KHI NỘP LÊN HỘI ĐỒNG</h4>
                  <p className="text-xs font-bold text-orange-800 leading-relaxed">
                    Sau khi nộp, trạng thái series sẽ chuyển sang <strong>Đang xét duyệt</strong>.
                    Hội đồng biên tập sẽ xem xét và bỏ phiếu thông qua.
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
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-manga-ink bg-white text-manga-ink font-manga font-bold text-sm uppercase hover:bg-gray-50 transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-manga-ink border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
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
      {/* Footer */}
      <footer className="mt-16 pt-8 border-t-2 border-manga-ink flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-gray-500">
        <div className="font-manga text-2xl text-manga-red">MangaFlow</div>
        <div>© 2026 MangaFlow System. Gangan Press Co. Ltd. All rights reserved.</div>
        <div className="flex items-center gap-6">
          
          <a href="#" className="hover:text-manga-red transition-colors">Quy tắc xuất bản</a>
          <a href="#" className="hover:text-manga-red transition-colors">Hỗ trợ Mangaka</a>
        </div>
      </footer>
    </div>
  )
}
