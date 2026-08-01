import React, { useState } from 'react'
import { BookOpen, FileText, ArrowRight, HelpCircle, ChevronDown, CheckCircle2, AlertTriangle, Cpu, Terminal, UploadCloud, Info, Download, RefreshCw, Layers } from 'lucide-react'

export default function SubmissionGuidelinesPage() {
  const [openStep, setOpenStep] = useState<number | null>(0)

  const steps = [
    {
      title: 'Bước 1: Chuẩn bị & Tải lên Kịch bản',
      desc: 'Tác giả truy cập vào màn hình Quản lý Chương (Chapter Management) trong Phòng làm việc Mangaka. Tải lên tệp kịch bản chữ thô (định dạng .txt, .pdf, hoặc .docx) để chốt cốt truyện gốc và phân cảnh hội thoại của chương truyện trước khi bắt đầu rải trang bản vẽ.',
      mockup: '📁 Quản lý chương ➔ 📄 Tải kịch bản (.docx) ➔ Click [Upload Script]'
    },
    {
      title: 'Bước 2: Khởi tạo Trang & Phân phối công việc (Assign Task Studio)',
      desc: 'Tác giả tạo số lượng trang vẽ trống cho chương truyện tương ứng. Sử dụng công cụ Assign Task Studio để chọn từng trang và giao nhiệm vụ cụ thể cho từng Trợ lý (Assistant) trong studio (ví dụ: Giao Page 1 - Vẽ thô cho Trợ lý A, Page 2 - Tô nền cho Trợ lý B).',
      mockup: '🎨 Assign Task Studio ➔ Giao Task: Vẽ thô (Name) / Vẽ nền (Background) ➔ Chọn Trợ lý'
    },
    {
      title: 'Bước 3: Trợ lý làm việc & Sử dụng AI Workspace',
      desc: 'Trợ lý nhận được thông báo task mới, truy cập vào Workspace của mình để thực hiện vẽ tranh. Trợ lý có thể sử dụng AI Manga Workspace tích hợp sẵn để vẽ nhanh bố cục phác thảo hoặc chỉnh sửa nét vẽ tự động nhằm tối ưu hóa thời gian. Sau khi xong, nhấn [Nộp Trang Vẽ].',
      mockup: '🤖 AI Workspace ➔ Click [Generate Background Assist] ➔ Click [Nộp Trang Vẽ]'
    },
    {
      title: 'Bước 4: Tổng hợp trang vẽ & Nộp Biên Tập (Submitted)',
      desc: 'Tác giả duyệt lại toàn bộ các trang vẽ riêng biệt do các Trợ lý đã hoàn thiện nộp lên. Khi mọi trang vẽ đạt chuẩn, Mangaka tiến hành ghép trang thành chương hoàn chỉnh và bấm [Nộp Bản Thảo]. Trạng thái chương chuyển từ Draft (Bản nháp) sang Submitted (Đã nộp).',
      mockup: '📦 Kiểm tra Preview toàn bộ chương ➔ Click [Nộp Bản Thảo] ➔ Trạng thái: Submitted'
    }
  ]

  const templates = [
    { title: 'PSD Template (Manga Standard)', size: '12.4 MB', format: 'PSD (Photoshop)' },
    { title: 'Clip Studio Paint Storyboard Template', size: '8.1 MB', format: 'CLIP' },
    { title: 'Manga Script Word Template', size: '240 KB', format: 'DOCX (Word)' },
    { title: 'Cover Art Guidelines Template', size: '4.5 MB', format: 'ZIP / PNG' }
  ]

  const errorCodes = [
    { code: 'Error 101', title: 'Ảnh vượt quá dung lượng', desc: 'Dung lượng một trang ảnh tải lên vượt quá giới hạn 10MB.' },
    { code: 'Error 102', title: 'Sai định dạng tệp', desc: 'Tệp bản vẽ tải lên không thuộc định dạng JPG hoặc PNG.' },
    { code: 'Error 201', title: 'Thiếu thông tin chương (Metadata)', desc: 'Tác giả chưa điền Tên chương hoặc thiếu kịch bản gốc đính kèm.' },
    { code: 'Error 301', title: 'Quá hạn deadline nộp bản thảo', desc: 'Chương truyện bị trễ hạn nộp mà chưa có Đề xuất khắc phục (Recovery Proposal).' }
  ]

  const aiFeatures = [
    { title: 'Generate Background', desc: 'Hỗ trợ trợ lý vẽ nhanh phác thảo khung nền cảnh quan dựa trên mô tả văn bản.' },
    { title: 'Perspective Assist', desc: 'Tự động tính toán điểm tụ và kẻ đường gióng tỷ lệ không gian cảnh nền.' },
    { title: 'Line Correction', desc: 'Tự động nắn thẳng nét vẽ rung tay của trợ lý cho sạch sẽ, chuyên nghiệp.' },
    { title: 'Color Palette Generator', desc: 'Đề xuất bảng màu hài hòa phù hợp với phong cách tô của nhân vật.' }
  ]

  return (
    <div className="min-h-screen bg-[#F9F9FB] dark:bg-zinc-900 text-manga-ink dark:text-zinc-100 transition-colors py-12 px-4 md:px-8">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="bg-[#E63946] text-white p-8 md:p-12 manga-border manga-shadow relative overflow-hidden rounded-lg">
          <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-6">
            <Terminal className="w-96 h-96" />
          </div>
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="uppercase tracking-widest font-bold bg-white text-manga-red px-3 py-1 text-xs rounded-full">
              Creator Manual
            </span>
            <h1 className="font-manga text-4xl md:text-6xl font-black uppercase tracking-tight">
              Cẩm Nang Nộp Bản Thảo
            </h1>
            <p className="text-sm md:text-base font-semibold opacity-90 leading-relaxed max-w-xl">
              Hướng dẫn chi tiết thao tác trên Workspace, quy cách chuẩn hóa tệp tin hình ảnh kịch bản và cách phối hợp mượt mà giữa Mangaka, Trợ lý và AI.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold bg-[#b51724] inline-block px-4 py-2 rounded-md">
              <span>Cập nhật ngày: 01/08/2026</span>
              <span className="opacity-60">|</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Phiên bản 1.1</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Row 1: Checklist & Tech Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Checklist trước khi Submit */}
          <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-4">
            <h3 className="font-manga text-xl font-black uppercase text-manga-red border-b-2 border-manga-ink pb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Checklist Trước Khi Submit
            </h3>
            <p className="text-xs font-semibold text-gray-500">
              Hãy kiểm tra kỹ các tiêu chí dưới đây để tránh bị hệ thống báo lỗi hoặc biên tập viên trả về (tương tự như PR GitHub):
            </p>
            <div className="space-y-2 text-xs font-bold text-gray-700 dark:text-zinc-300">
              {[
                'Đã tải lên tệp kịch bản chữ gốc của chương truyện.',
                'Ảnh bìa (Cover) của chương hiển thị đúng, đúng tỷ lệ.',
                'Tất cả các trang vẽ đã được đi nét chính thức (Lineart) đầy đủ.',
                'Không còn trang vẽ nào bị bỏ trống hoặc hiển thị lỗi phác thảo thô.',
                'Toàn bộ bong bóng thoại thoại đã được gắn font chữ tiếng Việt chuẩn.',
                'Đã phân loại và gắn tag thể loại tương ứng đầy đủ.',
                'Trợ lý đã nhấn xác nhận hoàn tất 100% các task được giao.'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg border">
                  <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center font-bold">✓</div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specs */}
          <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h3 className="font-manga text-xl font-black uppercase text-manga-red border-b-2 border-manga-ink pb-2 flex items-center gap-2">
              <Layers className="w-5 h-5" /> Quy Cách Kỹ Thuật Bản Thảo (Specs)
            </h3>
            <div className="space-y-4 font-semibold text-xs leading-relaxed">
              <div className="p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg border-l-4 border-manga-ink">
                <h4 className="font-bold text-manga-ink dark:text-white uppercase">📄 Định dạng văn bản kịch bản</h4>
                <p className="text-gray-500 dark:text-zinc-300 mt-1">Chấp nhận định dạng .docx (Word), .pdf, hoặc .txt dung lượng tối đa 10MB.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg border-l-4 border-manga-red">
                <h4 className="font-bold text-manga-ink dark:text-white uppercase">🖼️ Định dạng tệp tin hình ảnh</h4>
                <p className="text-gray-500 dark:text-zinc-300 mt-1">Chỉ chấp nhận ảnh PNG hoặc JPG chất lượng cao. Dung lượng tối đa 10MB cho mỗi trang ảnh vẽ lẻ.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg border-l-4 border-amber-500">
                <h4 className="font-bold text-manga-ink dark:text-white uppercase">📐 Kích thước trang vẽ tiêu chuẩn</h4>
                <p className="text-gray-500 dark:text-zinc-300 mt-1">Manga truyền thống: Tỷ lệ B5 hoặc A4 (độ phân giải 350-600 DPI). Webtoon dạng cuộn: Chiều rộng tối thiểu 800px.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Naming Convention & Directory Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* File Structure Tree Diagram */}
          <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-4">
            <h3 className="font-manga text-xl font-black uppercase text-manga-red border-b-2 border-manga-ink pb-2">
              Cấu Trúc Thư Mục Chuẩn (File Structure)
            </h3>
            <p className="text-xs font-semibold text-gray-500">
              Đề xuất tổ chức thư mục lưu trữ cục bộ của tác giả để dễ dàng quản lý trước khi nộp hệ thống:
            </p>
            <div className="bg-[#111115] text-emerald-400 p-5 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto">
              <pre>{`MyMangaProject/
├── Cover.png (Bìa Series chính)
├── Chapter_01/
│   ├── Script.docx (Kịch bản chữ chương 1)
│   ├── Page_001.png (Trang vẽ 1)
│   ├── Page_002.png (Trang vẽ 2)
│   └── Metadata.json (Tệp dữ liệu chương)
└── Chapter_02/
    ├── Script.docx
    └── Page_001.png`}</pre>
            </div>
          </div>

          {/* Naming Conventions */}
          <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-4">
            <h3 className="font-manga text-xl font-black uppercase text-manga-red border-b-2 border-manga-ink pb-2">
              Quy Tắc Đặt Tên File (Naming Convention)
            </h3>
            <p className="text-xs font-semibold text-gray-500">
              Để hệ thống tự động nhận diện đúng số thứ tự trang khi upload hàng loạt, tác giả đặt tên tệp theo định dạng:
            </p>
            <div className="space-y-3 font-semibold text-xs">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-700 rounded-lg manga-border">
                <span className="text-manga-red font-bold font-mono text-sm block">SeriesName_CH[Số chương]_P[Số trang].[Định dạng]</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border space-y-2">
                <p className="text-gray-500"><strong>Ví dụ thực tế:</strong></p>
                <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-zinc-300">
                  <li><code>LuaDemDong_CH01_P001.png</code> (Trang 1 chương 1 bộ LuaDemDong)</li>
                  <li><code>LuaDemDong_CH01_P002.png</code> (Trang 2 chương 1 bộ LuaDemDong)</li>
                  <li><code>LuaDemDong_CH02_P015.jpg</code> (Trang 15 chương 2 bộ LuaDemDong)</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Step-by-Step Manual with Mockups Accordion */}
        <section className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
          <h3 className="font-manga text-2xl font-black uppercase text-manga-red text-center">
            Hướng Dẫn Các Bước Thao Tác Trực Quan
          </h3>
          <div className="space-y-3 max-w-4xl mx-auto">
            {steps.map((step, idx) => (
              <div key={idx} className="manga-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenStep(openStep === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700 font-bold text-left transition-colors hover:bg-gray-100"
                >
                  <span className="text-sm">{step.title}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openStep === idx ? 'rotate-180' : ''}`} />
                </button>
                {openStep === idx && (
                  <div className="p-4 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 space-y-3 text-xs font-semibold leading-relaxed">
                    <p className="text-gray-600 dark:text-zinc-300">{step.desc}</p>
                    <div className="bg-gray-100 dark:bg-zinc-900 p-3 rounded border font-mono text-[11px] text-manga-red flex items-center gap-2">
                      <span className="text-gray-400">Mockup thao tác:</span>
                      <span>{step.mockup}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Upload Progress & Submission Statuses Mockups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upload Progress Mockup */}
          <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-4">
            <h3 className="font-manga text-xl font-black uppercase text-manga-red border-b-2 border-manga-ink pb-2">
              Tiến Trình Tải Lên Hệ Thống (Mockup Progress)
            </h3>
            <p className="text-xs font-semibold text-gray-500">
              Giao diện hệ thống giả lập khi tác giả kéo thả hàng loạt trang bản vẽ:
            </p>
            <div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg border space-y-4 font-semibold text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Uploading LuaDemDong_CH01_P008.png</span>
                  <span className="text-manga-red">68%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden border">
                  <div className="bg-manga-red h-full w-[68%]"></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 dark:border-zinc-800 pt-2">
                <span>Tốc độ tải lên: 4.2 MB/s</span>
                <span>Thời gian còn lại: 3 giây</span>
              </div>
            </div>
          </div>

          {/* Submission Status Badges */}
          <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-4">
            <h3 className="font-manga text-xl font-black uppercase text-manga-red border-b-2 border-manga-ink pb-2">
              Các Trạng Thái Bản Thảo (Submission Statuses)
            </h3>
            <p className="text-xs font-semibold text-gray-500">
              Theo dõi vòng đời kiểm duyệt của chương truyện qua hệ thống tag màu đặc trưng:
            </p>
            <div className="grid grid-cols-2 gap-3 text-[11px] font-bold">
              {[
                { name: 'Draft (Bản nháp)', color: 'bg-gray-100 text-gray-800 border-gray-300' },
                { name: 'In Progress (Đang vẽ)', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                { name: 'Submitted (Đã nộp)', color: 'bg-purple-100 text-purple-800 border-purple-300' },
                { name: 'Reviewing (Đang duyệt)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
                { name: 'Revision (Cần sửa)', color: 'bg-red-100 text-red-800 border-red-300' },
                { name: 'Approved (Đã duyệt)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                { name: 'Published (Xuất bản)', color: 'bg-pink-100 text-pink-800 border-pink-300' }
              ].map((badge, idx) => (
                <div key={idx} className={`p-2.5 rounded-lg border text-center ${badge.color}`}>
                  {badge.name}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* AI Workspace Details */}
        <section className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-manga text-2xl font-black uppercase text-manga-red flex items-center justify-center gap-2">
              <Cpu className="w-6 h-6 animate-pulse" /> Trợ Lý Đắc Lực: AI Manga Workspace
            </h2>
            <p className="text-xs font-semibold text-gray-500">
              MangaFlow tích hợp sâu AI giúp tối ưu hóa thời gian vẽ của trợ lý và họa sĩ:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
            {aiFeatures.map((feat, idx) => (
              <div key={idx} className="bg-zinc-50 dark:bg-zinc-700 p-4 rounded-lg manga-border space-y-2">
                <span className="text-lg">🤖</span>
                <h4 className="font-bold text-manga-ink dark:text-white uppercase">{feat.title}</h4>
                <p className="text-gray-500 dark:text-zinc-300 leading-relaxed text-[11px]">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Notifications & Warning Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Notification Feed Mockup */}
          <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-4">
            <h3 className="font-manga text-xl font-black uppercase text-manga-red border-b-2 border-manga-ink pb-2">
              Thông Báo Nhận Được (Notification Feed)
            </h3>
            <p className="text-xs font-semibold text-gray-500">
              Các thông báo đẩy tự động từ hệ thống trong quá trình làm việc:
            </p>
            <div className="space-y-2 text-xs font-semibold">
              {[
                { text: '⚠️ Deadline nộp bản thảo chương 4 của bạn còn lại 2 ngày!', color: 'border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300' },
                { text: '💬 Biên tập viên Tantou vừa gửi đánh giá sửa đổi trên Page 12.', color: 'border-blue-300 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300' },
                { text: '✓ Trợ lý Nguyễn Văn A đã hoàn thành vẽ thô cho Page 8.', color: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300' },
                { text: '🎉 Chúc mừng! Chương 3 bộ truyện "Lửa Đêm Đông" đã được xuất bản.', color: 'border-pink-300 bg-pink-50 dark:bg-pink-950/20 text-pink-800 dark:text-pink-300' }
              ].map((notif, idx) => (
                <div key={idx} className={`p-3 rounded-lg border-2 ${notif.color}`}>
                  {notif.text}
                </div>
              ))}
            </div>
          </div>

          {/* Risk Warning & Recovery Plan */}
          <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-900 p-6 md:p-8 rounded-lg space-y-4">
            <h3 className="font-manga text-xl font-black uppercase text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 animate-bounce text-red-600" /> Quản Trị Rủi Ro Trễ Hạn (Risk Alert)
            </h3>
            <div className="space-y-3 font-semibold text-xs text-red-800 dark:text-zinc-300 leading-relaxed">
              <p>
                🚨 <strong>Hệ thống cảnh báo đỏ:</strong> Khi chương truyện của bạn đến gần sát deadline nộp hoặc quá hạn mà chưa được chuyển sang trạng thái <em>Submitted</em>, hệ thống sẽ chớp cảnh báo đỏ trên Dashboard Mangaka và gửi email khẩn cấp.
              </p>
              <p>
                📝 <strong>Nộp Đề Xuất Khắc Phục (Recovery Proposal):</strong> Tác giả bắt buộc phải phản hồi và gửi đơn đề xuất xin dời lịch hoặc gia hạn deadline trực tiếp trên hệ thống làm việc với Tantou Editor. <em>MangaFlow nghiêm cấm hành vi bỏ trốn, không phản hồi của các Mangaka đối với ban biên tập.</em>
              </p>
            </div>
          </div>

        </div>

        {/* Error Codes & Best Practices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Error Codes Grid */}
          <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-4">
            <h3 className="font-manga text-xl font-black uppercase text-manga-red border-b-2 border-manga-ink pb-2">
              Mã Lỗi Hệ Thống Thường Gặp (Error Codes)
            </h3>
            <div className="space-y-3">
              {errorCodes.map((err, idx) => (
                <div key={idx} className="flex gap-4 p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg border">
                  <span className="font-mono font-bold text-manga-red flex-shrink-0 text-xs w-20">{err.code}</span>
                  <div className="text-xs font-semibold">
                    <h5 className="font-bold text-manga-ink dark:text-white">{err.title}</h5>
                    <p className="text-gray-500 dark:text-zinc-300 mt-0.5">{err.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-4">
            <h3 className="font-manga text-xl font-black uppercase text-manga-red border-b-2 border-manga-ink pb-2">
              Khuyên dùng (Best Practices)
            </h3>
            <div className="space-y-2 text-xs font-bold text-gray-700 dark:text-zinc-300">
              {[
                'Nên tải lên từng chương một để tránh quá tải băng thông.',
                'Luôn giữ file vẽ gốc (PSD/Clip Studio) dự phòng trên ổ cứng cục bộ.',
                'Đảm bảo tuân thủ đúng quy tắc đặt tên file ảnh theo số thứ tự.',
                'Không sửa hoặc thay thế tệp tin bản vẽ khi đã đổi sang trạng thái Submitted.',
                'Sử dụng tính năng [Preview Chapter] trên Mobile để kiểm tra trước bố cục.'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg border">
                  <div className="w-5 h-5 rounded-full bg-manga-red text-white flex items-center justify-center font-bold">✓</div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Download Resources / Templates */}
        <section className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
          <h3 className="font-manga text-2xl font-black uppercase text-manga-red text-center">
            Tải Về Tài Nguyên / Mẫu Bản Thảo (Templates)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
            {templates.map((tpl, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg manga-border flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-manga-ink dark:text-white uppercase leading-tight font-black">{tpl.title}</h4>
                  <div className="flex gap-2 text-[10px] text-gray-400 mt-1 font-semibold">
                    <span>{tpl.size}</span>
                    <span>•</span>
                    <span>{tpl.format}</span>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Bắt đầu tải về mẫu ${tpl.title}...`)}
                  className="w-full bg-manga-ink hover:bg-zinc-800 text-white py-2.5 rounded border border-manga-red flex items-center justify-center gap-2 hover:translate-y-0.5 transition-transform"
                >
                  <Download className="w-4 h-4 text-manga-red" /> Tải Xuống
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA to Dashboard */}
        <section className="bg-manga-ink text-white p-8 rounded-lg manga-border manga-shadow text-center space-y-4">
          <h3 className="font-manga text-2xl font-bold uppercase tracking-wider">
            Sẵn sàng điều phối bản vẽ của bạn?
          </h3>
          <p className="text-zinc-400 text-sm font-semibold max-w-lg mx-auto">
            Hãy truy cập ngay vào hệ thống Assign Task Studio hoặc AI Workspace để hoàn thành trang vẽ của bạn hôm nay.
          </p>
          <div className="pt-2">
            <button className="bg-manga-red hover:bg-red-600 text-white font-bold uppercase py-3.5 px-8 tracking-widest manga-border hover:translate-y-1 transition-all">
              Truy Cập Assign Task Studio
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}
