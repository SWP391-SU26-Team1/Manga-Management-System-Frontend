import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router'
import { ArrowLeft, Check, Send, FileText, Calendar, User, Plus } from 'lucide-react'

export default function SendNotificationPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()
  const locationState = useLocation().state as any

  // Pre-filled state values from previous screen redirection
  const initialTemplate = locationState?.templateType || 'APPROVAL'
  const initialProject = locationState?.projectName || 'Bóng Đêm Vô Tận - Chương 45'
  const resolutionText = locationState?.resolution || ''

  // Form State
  const [template, setTemplate] = useState<'APPROVAL' | 'CANCELLATION' | 'SCHEDULE_CHANGE' | 'REVISION'>(initialTemplate)
  const [recipients, setRecipients] = useState<string[]>(['TÁC GIẢ A', 'BIÊN TẬP VIÊN B'])
  const [searchRecipient, setSearchRecipient] = useState('')
  const [projectName, setProjectName] = useState(initialProject)
  const [effectiveDate, setEffectiveDate] = useState('2026-06-18')
  const [extraNote, setExtraNote] = useState(resolutionText ? `Phán quyết từ Trưởng ban: ${resolutionText}` : '')
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // Recipient database for simple search autocomplete
  const recipientList = ['Tác giả Nguyễn Văn A', 'Biên tập viên Trần Thị B', 'Minh K. (Art Director)', 'Lan Phương (Editor)', 'Tuấn A. (Senior Editor)']

  const handleAddRecipient = (name: string) => {
    const cleanName = name.toUpperCase()
    if (!recipients.includes(cleanName)) {
      setRecipients([...recipients, cleanName])
    }
    setSearchRecipient('')
  }

  const handleRemoveRecipient = (name: string) => {
    setRecipients(recipients.filter(r => r !== name))
  }

  const handleSaveDraft = () => {
    alert('Đã lưu bản nháp thông báo thành công!')
  }

  const handleSendNotification = () => {
    setShowSuccessToast(true)
    setTimeout(() => {
      setShowSuccessToast(false)
      navigate('/dashboard/editorial-board')
    }, 2000)
  }

  // Dynamic preview content rendering
  const getPreviewContent = () => {
    const dateStr = new Date(effectiveDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
    switch (template) {
      case 'APPROVAL':
        return {
          title: 'THÔNG BÁO: PHÊ DUYỆT XUẤT BẢN CHÍNH THỨC',
          body: (
            <div className="space-y-4">
              <p>Kính gửi quý tác giả và nhóm biên tập phụ trách dự án <strong>{projectName}</strong>,</p>
              <p>Sau khi tiến hành đọc bản thảo chi tiết và tổng hợp điểm số đánh giá từ Hội đồng Biên tập MangaFlow Board, Trưởng ban Biên tập tối cao quyết định:</p>
              <div className="border-l-4 border-emerald-500 bg-emerald-50/50 p-3 font-bold">
                ✓ PHÊ DUYỆT PHÁT HÀNH/XUẤT BẢN CHAPTER DRAFT MỚI NHẤT
              </div>
              <p>Chương truyện này đáp ứng đầy đủ tiêu chí chất lượng chuyên môn về lineart, kịch bản phân cảnh và nhịp độ. Lịch phát hành chính thức được ấn định vào ngày <strong>{dateStr}</strong>.</p>
              {extraNote && (
                <div className="bg-zinc-50 border border-manga-ink p-2.5 italic">
                  <strong>Ghi chú bổ sung:</strong> "{extraNote}"
                </div>
              )}
            </div>
          )
        }
      case 'CANCELLATION':
        return {
          title: 'QUYẾT ĐỊNH: ĐÌNH CHỈ / HỦY BỎ BẢN THẢO',
          body: (
            <div className="space-y-4">
              <p>Kính gửi quý tác giả và biên tập viên dự án <strong>{projectName}</strong>,</p>
              <p>Căn cứ trên xếp hạng phản hồi của độc giả và biên bản đánh giá chuyên môn của Hội đồng thẩm định Serialization, Trưởng ban quyết định:</p>
              <div className="border-l-4 border-manga-red bg-red-50/50 p-3 font-bold text-manga-red">
                ⚠️ HỦY BỎ BẢN THẢO / NGƯNG SERIALIZATION TẠM THỜI
              </div>
              <p>Tác phẩm có chỉ số sụt giảm quá hạn mức quy định. Mọi hoạt động sản xuất liên quan sẽ tạm dừng kể từ ngày <strong>{dateStr}</strong> để tiến hành tái cơ cấu creativo hoặc dừng hẳn.</p>
              {extraNote && (
                <div className="bg-zinc-50 border border-manga-ink p-2.5 italic">
                  <strong>Ghi chú phán quyết/lý do:</strong> "{extraNote}"
                </div>
              )}
            </div>
          )
        }
      case 'SCHEDULE_CHANGE':
        return {
          title: 'THÔNG BÁO: THAY ĐỔI LỊCH PHÁT HÀNH CHIẾN LƯỢC',
          body: (
            <div className="space-y-4">
              <p>Kính gửi ban biên tập và nhóm họa sĩ dự án <strong>{projectName}</strong>,</p>
              <p>Nhằm đảm bảo sức khỏe sáng tạo cho Mangaka và tối ưu hóa hiệu ứng truyền thông, Trưởng ban quyết định điều chỉnh lịch trình:</p>
              <div className="border-l-4 border-yellow-500 bg-yellow-50/50 p-3 font-bold text-yellow-700">
                📅 THAY ĐỔI TẦN SUẤT / LỊCH TRÌNH PHÁT HÀNH
              </div>
              <p>Thời gian thay đổi có hiệu lực chính thức kể từ ngày <strong>{dateStr}</strong>. Yêu cầu nhóm tác giả phối hợp chuẩn bị storyboard điều chỉnh.</p>
              {extraNote && (
                <div className="bg-zinc-50 border border-manga-ink p-2.5 italic">
                  <strong>Ghi chú điều phối:</strong> "{extraNote}"
                </div>
              )}
            </div>
          )
        }
      case 'REVISION':
        return {
          title: 'YÊU CẦU: CHỈNH SỬA / BIÊN TẬP LẠI BẢN THẢO',
          body: (
            <div className="space-y-4">
              <p>Kính gửi quý tác giả và biên tập viên phụ trách dự án <strong>{projectName}</strong>,</p>
              <p>Sau khi tiến hành thẩm định bản thảo chương mới nhất và tổng hợp ý kiến đánh giá từ Hội đồng Biên tập MangaFlow Board, Trưởng ban Biên tập tối cao quyết định:</p>
              <div className="border-l-4 border-yellow-500 bg-yellow-50/50 p-3 font-bold text-yellow-700">
                📅 YÊU CẦU CHỈNH SỬA & BIÊN TẬP LẠI BẢN THẢO DRAFT
              </div>
              <p>Bản thảo hiện tại chưa đạt yêu cầu về chất lượng hoặc tiến độ. Yêu cầu nhóm tác giả phối hợp sửa lại theo các ý kiến phản hồi và nộp lại bản thảo chỉnh sửa trước ngày hiệu lực.</p>
              {extraNote && (
                <div className="bg-zinc-50 border border-manga-ink p-2.5 italic">
                  <strong>Ghi chú yêu cầu sửa đổi:</strong> "{extraNote}"
                </div>
              )}
            </div>
          )
        }
    }
  }

  const preview = getPreviewContent()

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans text-manga-ink relative">
      
      {/* Toast Alert Success */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white font-sans font-bold border-4 border-manga-ink p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-fade-in flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>✓ Thông báo đã gửi tới các bên liên quan. [Xem lịch sử &gt;]</span>
        </div>
      )}

      {/* Navigation breadcrumb */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-manga-ink hover:text-manga-red cursor-pointer bg-transparent border-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
      </div>

      <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase mb-2">
        GỬI THÔNG BÁO QUYẾT ĐỊNH (CHIEF)
      </h1>
      <p className="text-xs font-bold text-gray-500 uppercase mb-8">
        Soạn thảo văn bản thông tri chính thức gửi tới Tác giả và Biên tập viên phụ trách
      </p>

      {/* Form and Preview Split Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Form Configuration */}
        <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] space-y-6">
          
          {/* Step 1: Template Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-gray-500 border-b-2 border-gray-100 pb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Bước 1 — CHỌN MẪU THÔNG BÁO</span>
            </h3>
            
            <div className="flex flex-col md:flex-row gap-3">
              <label className={`flex-1 border-2 p-3 font-bold text-xs uppercase cursor-pointer select-none transition-all flex items-center justify-between ${
                template === 'APPROVAL' ? 'bg-[#fff5f5] border-manga-red shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white border-gray-200 hover:bg-zinc-50'
              }`}>
                <input 
                  type="radio" 
                  name="template" 
                  checked={template === 'APPROVAL'} 
                  onChange={() => setTemplate('APPROVAL')} 
                  className="hidden" 
                />
                <span>PHÊ DUYỆT</span>
                {template === 'APPROVAL' && <span className="text-manga-red">✓</span>}
              </label>

              <label className={`flex-1 border-2 p-3 font-bold text-xs uppercase cursor-pointer select-none transition-all flex items-center justify-between ${
                template === 'CANCELLATION' ? 'bg-[#fff5f5] border-manga-red shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white border-gray-200 hover:bg-zinc-50'
              }`}>
                <input 
                  type="radio" 
                  name="template" 
                  checked={template === 'CANCELLATION'} 
                  onChange={() => setTemplate('CANCELLATION')} 
                  className="hidden" 
                />
                <span>HỦY BỎ / TẠM DỪNG</span>
                {template === 'CANCELLATION' && <span className="text-manga-red">✓</span>}
              </label>

              <label className={`flex-1 border-2 p-3 font-bold text-xs uppercase cursor-pointer select-none transition-all flex items-center justify-between ${
                template === 'SCHEDULE_CHANGE' ? 'bg-[#fff5f5] border-manga-red shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white border-gray-200 hover:bg-zinc-50'
              }`}>
                <input 
                  type="radio" 
                  name="template" 
                  checked={template === 'SCHEDULE_CHANGE'} 
                  onChange={() => setTemplate('SCHEDULE_CHANGE')} 
                  className="hidden" 
                />
                <span>THAY ĐỔI LỊCH</span>
                {template === 'SCHEDULE_CHANGE' && <span className="text-manga-red">✓</span>}
              </label>

              <label className={`flex-1 border-2 p-3 font-bold text-xs uppercase cursor-pointer select-none transition-all flex items-center justify-between ${
                template === 'REVISION' ? 'bg-[#fff5f5] border-manga-red shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white border-gray-200 hover:bg-zinc-50'
              }`}>
                <input 
                  type="radio" 
                  name="template" 
                  checked={template === 'REVISION'} 
                  onChange={() => setTemplate('REVISION')} 
                  className="hidden" 
                />
                <span>YÊU CẦU SỬA</span>
                {template === 'REVISION' && <span className="text-manga-red">✓</span>}
              </label>
            </div>
          </div>

          {/* Step 2: Recipients Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-gray-500 border-b-2 border-gray-100 pb-1 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Bước 2 — THÀNH VIÊN NHẬN TIN</span>
            </h3>

            {/* Recipient Search */}
            <div className="relative">
              <input
                type="text"
                value={searchRecipient}
                onChange={e => setSearchRecipient(e.target.value)}
                placeholder="Tìm kiếm tác giả, biên tập viên theo tên..."
                className="w-full border-2 border-manga-ink px-3 py-2 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50"
              />
              {searchRecipient && (
                <div className="absolute left-0 right-0 bg-white border-2 border-manga-ink mt-1 max-h-32 overflow-y-auto z-10 shadow-md">
                  {recipientList
                    .filter(name => name.toLowerCase().includes(searchRecipient.toLowerCase()))
                    .map(name => (
                      <button
                        key={name}
                        onClick={() => handleAddRecipient(name)}
                        className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-red-50 hover:text-manga-red cursor-pointer border-0 bg-transparent block"
                      >
                        + {name}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Recipient tag chips */}
            <div className="flex flex-wrap gap-2 pt-1.5">
              {recipients.map(recipient => (
                <div 
                  key={recipient}
                  className="bg-zinc-100 border-2 border-manga-ink px-2.5 py-1 text-xs font-black uppercase flex items-center gap-1.5 shadow-sm"
                >
                  <span>{recipient}</span>
                  <button 
                    onClick={() => handleRemoveRecipient(recipient)}
                    className="text-gray-400 hover:text-manga-red font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
              {recipients.length === 0 && (
                <span className="text-xs font-bold text-gray-400">Vui lòng thêm ít nhất một người nhận.</span>
              )}
            </div>
          </div>

          {/* Step 3: Additional Form Fields */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-gray-500 border-b-2 border-gray-100 pb-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Bước 3 — THÔNG TIN BỔ SUNG</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Dự án / Chương</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full border-2 border-manga-ink px-3 py-2 text-xs font-bold bg-zinc-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Ngày hiệu lực</label>
                <input
                  type="date"
                  required
                  value={effectiveDate}
                  onChange={e => setEffectiveDate(e.target.value)}
                  className="w-full border-2 border-manga-ink px-3 py-2 text-xs font-bold bg-zinc-50"
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="block text-[10px] font-black uppercase text-gray-500">Lời nhắn / Cá nhân hóa thông báo</label>
              <textarea
                value={extraNote}
                onChange={e => setExtraNote(e.target.value)}
                placeholder="Nhập ghi chú thêm hoặc lưu ý chi tiết..."
                className="w-full border-2 border-manga-ink p-3 text-xs font-bold bg-zinc-50 h-24 outline-none focus:border-manga-red"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-dashed border-gray-200">
            <button
              onClick={handleSaveDraft}
              className="flex-1 py-3 bg-white border-2 border-manga-ink font-manga font-bold text-xs uppercase hover:bg-zinc-50 cursor-pointer"
            >
              LƯU BẢN NHÁP
            </button>
            <button
              onClick={handleSendNotification}
              disabled={recipients.length === 0}
              className="flex-1 py-3 bg-manga-red text-white border-2 border-black font-manga font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-red-700 hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-manga-red transition-all cursor-pointer"
            >
              GỬI THÔNG BÁO &gt;
            </button>
          </div>
        </div>

        {/* Right Column: Live rendering preview panel (designed exactly like Screen 4 figma) */}
        <div className="bg-[#fdfdfd] border-4 border-manga-ink p-8 shadow-[6px_6px_0px_rgba(15,15,15,1)] relative min-h-[500px] flex flex-col justify-between">
          <div className="absolute top-4 right-4 bg-manga-ink text-white font-sans font-extrabold text-[9px] uppercase px-2 py-0.5 border border-black shadow-sm">
            LIVE PREVIEW
          </div>

          <div className="space-y-6">
            <div className="border-b-2 border-manga-ink pb-4">
              <h3 className="font-manga text-xl font-black uppercase text-manga-ink leading-tight">
                {preview.title}
              </h3>
              <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">MangaFlow Board — Quyết định Biên tập tối cao</p>
            </div>

            {/* Recipient list inside preview */}
            <div className="text-[10px] font-bold text-gray-500 space-y-0.5">
              <p>NGƯỜI NHẬN: <span className="text-manga-ink">{recipients.join(', ')}</span></p>
              <p>NGÀY GỬI: <span className="text-manga-ink">{new Date().toLocaleDateString('vi-VN')}</span></p>
            </div>

            {/* Live Body */}
            <div className="text-xs font-semibold leading-relaxed text-zinc-700">
              {preview.body}
            </div>
          </div>

          {/* Signature Footer */}
          <div className="border-t border-gray-100 pt-6 mt-8 flex justify-between items-center text-[10px] font-bold text-gray-400">
            <div>
              <p>BỘ PHẬN THẨM ĐỊNH</p>
              <p className="text-zinc-500 font-extrabold uppercase mt-1">Hội đồng biên tập</p>
            </div>
            <div className="text-right">
              <p>TRƯỞNG BAN BIÊN TẬP</p>
              <p className="text-manga-red font-manga text-sm font-bold uppercase mt-1">TRẦN K. (CHIEF)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
