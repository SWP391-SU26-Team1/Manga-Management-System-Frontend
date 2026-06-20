import React, { useState, useRef } from 'react'
import { Upload, X, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import uploadService from '@/services/upload.service'
import assistantService from '@/services/assistant.service'

interface SubmissionFormProps {
  taskId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function SubmissionForm({ taskId, onSuccess, onCancel }: SubmissionFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  
  // Status states
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Standard validations
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('Dung lượng file không được vượt quá 20MB.')
      return
    }

    setFile(selectedFile)
    setError(null)
    setFileUrl('')
    
    // Auto start uploading to Cloudinary
    setIsUploading(true)
    try {
      const response = await uploadService.uploadSingle(selectedFile, 'submissions')
      if (response && response.secure_url) {
        setFileUrl(response.secure_url)
      } else {
        throw new Error('Không lấy được link file từ Cloudinary')
      }
    } catch (err: any) {
      console.error('Lỗi upload file:', err)
      setError('Tải file lên máy chủ thất bại. Vui lòng thử lại.')
      setFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile) return

    if (droppedFile.size > 20 * 1024 * 1024) {
      setError('Dung lượng file không được vượt quá 20MB.')
      return
    }

    setFile(droppedFile)
    setError(null)
    setFileUrl('')
    
    setIsUploading(true)
    try {
      const response = await uploadService.uploadSingle(droppedFile, 'submissions')
      if (response && response.secure_url) {
        setFileUrl(response.secure_url)
      } else {
        throw new Error('Không lấy được link file từ Cloudinary')
      }
    } catch (err: any) {
      console.error('Lỗi upload file:', err)
      setError('Tải file lên máy chủ thất bại. Vui lòng thử lại.')
      setFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setFileUrl('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileUrl) {
      setError('Vui lòng chọn và chờ tải file lên hoàn tất trước khi nộp.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await assistantService.createSubmission(taskId, {
        file_url: fileUrl,
        submission_notes: notes.trim(),
      })
      setSuccess(true)
      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err: any) {
      console.error('Lỗi nộp bài:', err)
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-lg w-full font-sans">
      <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-3">
        <h2 className="font-manga text-2xl font-bold uppercase tracking-wider text-black">
          NỘP BÀI VẼ MỚI
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-black hover:scale-110 transition-transform p-1"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        )}
      </div>

      {success ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
          <h3 className="text-xl font-bold uppercase text-black mb-2">Nộp bài thành công!</h3>
          <p className="text-sm text-gray-500 font-semibold">Hệ thống đang chuyển hướng...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-[#E63946] text-[#E63946] p-3 font-bold text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Area */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
              File nguồn hoặc ảnh nộp bài *
            </label>
            
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-400 hover:border-black bg-gray-50 hover:bg-gray-100/50 py-10 px-4 flex flex-col items-center justify-center cursor-pointer transition-colors group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.psd,.clip,.zip,.pdf"
                />
                <Upload className="w-10 h-10 text-gray-400 group-hover:text-black mb-3 transition-colors stroke-[2]" />
                <span className="text-xs font-black text-black uppercase tracking-wide mb-1">
                  Kéo thả file hoặc Click để chọn
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  Hỗ trợ PNG, JPG, PSD, CLIP, ZIP (Tối đa 20MB)
                </span>
              </div>
            ) : (
              <div className="border-2 border-black bg-gray-50 p-4 flex items-center justify-between shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-8 h-8 text-black flex-shrink-0 stroke-[2]" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-black truncate pr-2" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {isUploading ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase">
                    <Loader2 className="w-4 h-4 animate-spin text-[#E63946]" />
                    <span>Đang tải lên...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {fileUrl && (
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 border border-emerald-200 text-[9px] font-black uppercase tracking-wider rounded-sm">
                        Sẵn sàng
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-[#E63946] hover:bg-red-50 p-1 border border-transparent hover:border-red-200 rounded-md transition-colors"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Thumbnail Preview for Images */}
            {fileUrl && file?.type.startsWith('image/') && (
              <div className="mt-3 border-2 border-black aspect-video max-h-40 overflow-hidden bg-zinc-100 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                <img
                  src={fileUrl}
                  alt="Submission Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
              Ghi chú gửi kèm (Không bắt buộc)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú hoặc lời nhắn gửi tới Mangaka..."
              className="w-full border-2 border-black p-3 text-xs placeholder-gray-400 focus:outline-none focus:bg-gray-50/50 resize-none font-sans"
              maxLength={500}
            />
            <div className="text-right text-[10px] text-gray-400 font-bold mt-1">
              {notes.length}/500 ký tự
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-3 border-t-2 border-gray-100">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-white text-black font-bold uppercase text-xs py-3 border-2 border-black hover:bg-gray-50 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer"
                disabled={isSubmitting || isUploading}
              >
                HỦY
              </button>
            )}
            <button
              type="submit"
              disabled={isUploading || isSubmitting || !fileUrl}
              className={`flex-1 font-bold uppercase text-xs py-3 border-2 border-black flex items-center justify-center gap-2 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer ${
                isUploading || isSubmitting || !fileUrl
                  ? 'bg-gray-100 text-gray-400 border-gray-300 shadow-none translate-y-[2px] translate-x-[2px] cursor-not-allowed'
                  : 'bg-[#E63946] text-white hover:bg-white hover:text-[#E63946]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ĐANG NỘP BÀI...</span>
                </>
              ) : (
                <span>NỘP BẢN VẼ</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
