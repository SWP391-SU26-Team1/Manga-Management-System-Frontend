import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { ArrowLeft, CheckCircle, AlertCircle, Trash2, Send } from 'lucide-react'
import { boardStore } from '@/data/boardMockData'
import { boardService } from '@/services/board.service'

export default function SeriesDecisionPage() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const navigate = useNavigate()

  // Form State
  const [certify, setCertify] = useState(false)
  const [decision, setDecision] = useState<'CONTINUE_WEEKLY' | 'MOVE_TO_MONTHLY' | 'ON_HIATUS' | 'CANCEL_SERIES'>('CONTINUE_WEEKLY')
  const [showConfirm, setShowConfirm] = useState(false)

  // Dynamic series detail state
  const [seriesData, setSeriesData] = useState<any>(null)

  useEffect(() => {
    const fetchSeries = async () => {
      if (!seriesId) return
      try {
        const data = await boardService.getSeriesById(seriesId)
        if (data) {
          setSeriesData(data)
        } else {
          setSeriesData(boardStore.getReviewedSeriesById(seriesId))
        }
      } catch (err) {
        console.warn('API error fetching series data:', err)
        setSeriesData(boardStore.getReviewedSeriesById(seriesId))
      }
    }
    fetchSeries()
  }, [seriesId])

  // Discussion State
  const [comments, setComments] = useState<any[]>([
    { id: 1, author: 'Jun Tanaka (Art Editor)', role: 'Art Editor', text: 'Chất lượng nét vẽ đã được cải thiện rõ rệt, có thể chuyển sang phát hành theo tháng (Monthly) sẽ tốt hơn cho sức khỏe của tác giả chăng?', time: '1 giờ trước' },
    { id: 2, author: 'Aya Mori (Producer)', role: 'Producer', text: 'Tôi lo lắng về việc On Hiatus. Chúng ta đã có quá nhiều tác phẩm tạm dừng trong quý này rồi, độc giả sẽ bỏ đi.', time: '40 phút trước' }
  ])
  const [newComment, setNewComment] = useState('')

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setComments([...comments, {
      id: Date.now(),
      author: 'Trần K. (Trưởng ban Biên tập)',
      role: 'Chief Editor',
      text: newComment,
      time: 'Vừa xong',
      isChief: true
    }])
    setNewComment('')
  }

  const handleDeleteComment = (commentId: number) => {
    setComments(comments.filter(c => c.id !== commentId))
  }

  const handleSubmitFinalDecision = () => {
    if (!certify) return
    setShowConfirm(true)
  }

  const confirmFinalDecision = async () => {
    setShowConfirm(false)
    
    // Map decision to status
    let statusLabel: 'APPROVED' | 'REJECTED' | 'MONTHLY' | 'HIATUS' = 'APPROVED'
    if (decision === 'CANCEL_SERIES') {
      statusLabel = 'REJECTED'
    } else if (decision === 'MOVE_TO_MONTHLY') {
      statusLabel = 'MONTHLY'
    } else if (decision === 'ON_HIATUS') {
      statusLabel = 'HIATUS'
    }
    
    // Call real API with fallback
    const targetId = seriesId || 'void-walker'
    try {
      await boardService.saveSeriesDecision(
        targetId,
        statusLabel,
        `Quyết định chính thức của Trưởng ban: ${
          decision === 'CONTINUE_WEEKLY' ? 'Tiếp tục phát hành Hàng Tuần' : 
          decision === 'MOVE_TO_MONTHLY' ? 'Chuyển sang tạp chí Hàng Tháng (Monthly)' : 
          decision === 'ON_HIATUS' ? 'Tạm ngưng sáng tác 3 tháng (On Hiatus)' : 
          'HỦY BỎ/ĐÌNH CHỈ PHÁT HÀNH SERIES VĨNH VIỄN'
        }`
      )
    } catch (err) {
      console.warn('API error saving series decision, falling back to local storage:', err)
    }
    boardStore.updateSeriesStatus(targetId, statusLabel)

    // Redirect to Screen 4 (Send Notification) with pre-filled state
    navigate('/dashboard/editorial-board/send-notification', {
      state: {
        templateType: decision === 'CANCEL_SERIES' ? 'CANCELLATION' : 'SCHEDULE_CHANGE',
        projectName: `${seriesData?.title || 'Void Walker'} (Series)`,
        resolution: `Quyết định chính thức của Trưởng ban: ${
          decision === 'CONTINUE_WEEKLY' ? 'Tiếp tục phát hành Hàng Tuần' : 
          decision === 'MOVE_TO_MONTHLY' ? 'Chuyển sang tạp chí Hàng Tháng (Monthly)' : 
          decision === 'ON_HIATUS' ? 'Tạm ngưng sáng tác 3 tháng (On Hiatus)' : 
          'HỦY BỎ/ĐÌNH CHỈ PHÁT HÀNH SERIES VĨNH VIỄN'
        }`
      }
    })
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans text-manga-ink relative">
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-manga-ink p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <div className="bg-manga-ink text-white p-3 font-manga font-bold text-sm tracking-wide uppercase border-b-2 border-black -mx-6 -mt-6 mb-6">
              XÁC NHẬN PHÁN QUYẾT SERIES CHÍNH THỨC
            </div>

            <p className="text-xs font-bold leading-relaxed text-gray-700 mb-6">
              Bạn đang đưa ra quyết định chiến lược cho tác phẩm <strong>{seriesData?.title || 'VOID WALKER'}</strong> là:{' '}
              <strong className="text-manga-red uppercase text-sm">
                {decision === 'CONTINUE_WEEKLY' && 'TIẾP TỤC TUẦN (CONTINUE WEEKLY)'}
                {decision === 'MOVE_TO_MONTHLY' && 'CHUYỂN SANG THÁNG (MOVE TO MONTHLY)'}
                {decision === 'ON_HIATUS' && 'TẠM NGƯNG 3 THÁNG (ON HIATUS)'}
                {decision === 'CANCEL_SERIES' && 'HỦY BỎ ĐẦU TRUYỆN (CANCEL SERIES)'}
              </strong>. 
              Quyết định này có hiệu lực ngay lập tức đối với hệ thống xuất bản.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-white border-2 border-manga-ink font-manga font-bold text-xs uppercase hover:bg-zinc-50 cursor-pointer"
              >
                HỦY BỎ
              </button>
              <button
                onClick={confirmFinalDecision}
                className="flex-1 py-3 bg-manga-red text-white border-2 border-black font-manga font-bold text-xs uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-red-700 transition-all cursor-pointer"
              >
                TÔI PHÊ DUYỆT QUYẾT ĐỊNH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Back Button */}
      <div className="mb-4">
        <Link 
          to="/dashboard/editorial-board"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-manga-ink hover:text-manga-red"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Trang Chủ</span>
        </Link>
      </div>

      {/* Header section with Stats widgets */}
      <div className="bg-[#fff1f2] border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex gap-2 mb-2">
            <span className="bg-manga-red text-white font-bold text-[9px] px-2 py-0.5 border-2 border-manga-ink uppercase">
              CRITICAL EVALUATION
            </span>
            <span className="bg-manga-ink text-white font-bold text-[9px] px-2 py-0.5 border-2 border-manga-ink uppercase">
              SERIES: {seriesData?.title || 'VOID WALKER'}
            </span>
          </div>
          <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase">
            DECISION PENDING: {seriesData?.title || 'VOID WALKER'}
          </h1>
          <p className="text-xs font-bold text-gray-500 uppercase mt-1">
            Mục tiêu đánh giá: Tương lai phát hành do phản ứng độc giả sụt giảm trong Arc 'Cursed Realm'.
          </p>
        </div>

        <div className="flex gap-4 font-manga shrink-0">
          <div className="bg-white border-2 border-manga-ink px-4 py-2 text-center shadow-sm">
            <span className="block text-[8px] text-gray-400 font-bold uppercase font-sans">Weekly Rank</span>
            <span className="text-xl text-manga-red font-black">#14</span>
          </div>
          <div className="bg-white border-2 border-manga-ink px-4 py-2 text-center shadow-sm">
            <span className="block text-[8px] text-gray-400 font-bold uppercase font-sans">Retention Rate</span>
            <span className="text-xl text-manga-ink font-black">82%</span>
          </div>
        </div>
      </div>

      {/* Grid: Left - Data & Arguments, Right - Preview & Decision */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
        
        {/* Data Analysis & Arguments (Col span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Data Analysis Card */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <h3 className="font-manga text-lg font-black uppercase border-b-2 border-manga-ink pb-2 mb-4">
              PHÂN TÍCH DỮ LIỆU (DATA ANALYSIS - 10 WEEKS)
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-6 text-center font-manga">
              <div className="border border-manga-ink p-2.5 bg-zinc-50 shadow-sm">
                <span className="block text-[9px] text-gray-400 font-sans font-bold">AVG WEEKLY RANK</span>
                <span className="text-lg font-black">11.4</span>
              </div>
              <div className="border border-manga-ink p-2.5 bg-zinc-50 shadow-sm">
                <span className="block text-[9px] text-gray-400 font-sans font-bold">TOTAL VOTE COUNT</span>
                <span className="text-lg font-black text-manga-red">1.2M</span>
              </div>
              <div className="border border-manga-ink p-2.5 bg-zinc-50 shadow-sm">
                <span className="block text-[9px] text-gray-400 font-sans font-bold">SERIALIZATION AGE</span>
                <span className="text-lg font-black">95 CHs</span>
              </div>
            </div>

            {/* Line chart (SVG graphic) */}
            <div className="h-44 border-2 border-manga-ink p-3 bg-zinc-50 flex flex-col justify-between mb-4">
              <div className="flex-1 relative w-full flex items-end">
                {/* SVG lines */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                  
                  {/* Trend line */}
                  <path
                    d="M 10,25 Q 50,30 100,28 T 200,32 T 300,35 T 400,90 T 450,95 T 490,92"
                    fill="none"
                    stroke="#E63946"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />

                  {/* Trend Breaking Marker on W8 */}
                  <circle cx="400" cy="90" r="6" fill="#18181b" stroke="#fff" strokeWidth="2" />
                  <text x="365" y="80" className="font-sans font-black text-[9px] fill-zinc-950 uppercase">Tuần 8 (Sụt hạng)</text>
                </svg>
              </div>
              <div className="flex justify-between font-manga text-[9px] text-gray-400 font-bold border-t border-gray-200 pt-2 px-1">
                <span>WEEK 1</span>
                <span>WEEK 2</span>
                <span>WEEK 3</span>
                <span>WEEK 4</span>
                <span>WEEK 5</span>
                <span>WEEK 6</span>
                <span>WEEK 7</span>
                <span className="text-zinc-900 font-black">WEEK 8</span>
                <span>WEEK 9</span>
                <span>WEEK 10</span>
              </div>
            </div>

            <div className="bg-[#fffbeb] border-2 border-[#f59e0b] p-3 text-xs font-bold text-amber-800 leading-snug">
              ℹ <strong>Insight tự động:</strong> Xu hướng xếp hạng sụt giảm mạnh kể từ khi đưa vào bối cảnh 'Void Citadel' (Tuần 8). Kịch bản phân đoạn này đang nhận lượng phản hồi tiêu cực lớn từ độc giả trực tuyến.
            </div>
          </div>

          {/* Core Arguments Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Editor's Defense */}
            <div className="bg-white border-4 border-manga-ink p-5 shadow-[4px_4px_0px_rgba(15,15,15,1)]">
              <div className="inline-block px-2.5 py-0.5 bg-manga-ink text-white font-sans font-bold text-[9px] border border-black mb-3">
                EDITOR'S DEFENSE
              </div>
              <h4 className="font-manga text-sm font-black uppercase text-manga-ink mb-1.5">Kenta Sato (Lead Editor)</h4>
              <blockquote className="border-l-4 border-manga-ink pl-3.5 py-1 text-xs italic font-semibold text-gray-600 leading-relaxed">
                "Dự án có nền tảng digital engagement vẫn nằm trong top 20%. Mặc dù độc giả tạp chí giấy sụt giảm do nhịp truyện chững lại, kịch bản chương 96-100 sẽ có một payoff cực kỳ lớn giải quyết mâu thuẫn chính. Chúng tôi đề xuất giữ lịch phát hành thêm 5 tuần."
              </blockquote>
            </div>

            {/* Mangaka's Report */}
            <div className="bg-white border-4 border-manga-ink p-5 shadow-[4px_4px_0px_rgba(15,15,15,1)]">
              <div className="inline-block px-2.5 py-0.5 bg-manga-ink text-white font-sans font-bold text-[9px] border border-black mb-3">
                MANGAKA'S REPORT
              </div>
              <h4 className="font-manga text-sm font-black uppercase text-manga-ink mb-1.5">Haru Yoshida (Mangaka)</h4>
              <blockquote className="border-l-4 border-manga-red pl-3.5 py-1 text-xs italic font-semibold text-gray-600 leading-relaxed">
                "Tôi đã thiết kế chương 88 đến 92 là giai đoạn bắc cầu bắt buộc để xây dựng động lực nhân vật trước trận chiến lớn. Tôi hiểu độc giả nôn nóng nhưng chất lượng câu chuyện cần sự tỉ mỉ này. Cam kết sẽ lấy lại vị trí top 10 vào tháng tới."
              </blockquote>
            </div>
          </div>
        </div>

        {/* Latest Draft & Decision Panel (Col span 1) */}
        <div className="space-y-6">
          
          {/* Latest draft thumbnail preview with filmstrip */}
          <div className="bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <h3 className="font-manga text-xs font-black uppercase text-gray-400 border-b-2 border-gray-100 pb-1.5 mb-3">
              BẢN THẢO MỚI NHẤT (CH. 95)
            </h3>

            {/* Core Thumbnail */}
            <div className="border-2 border-manga-ink aspect-[3/4] overflow-hidden bg-zinc-100 shadow-md relative mb-3">
              <img 
                src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop" 
                alt="Ch. 95 cover page" 
                className="w-full h-full object-cover select-none"
              />
              <span className="absolute bottom-2 left-2 bg-manga-ink text-white font-sans font-bold text-[9px] px-2 py-0.5">TRANG 1/18</span>
            </div>

            {/* Filmstrip */}
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="w-12 h-16 border border-manga-ink bg-zinc-200 overflow-hidden relative shadow-sm cursor-pointer hover:border-manga-red transition-all">
                  <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover opacity-70" alt="filmstrip" />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-manga-ink bg-white/40">+{idx}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Board Final Action Form */}
          <div className="bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)] space-y-4">
            <h3 className="font-manga text-md font-black uppercase border-b-2 border-manga-ink pb-2">
              BOARD FINAL ACTION
            </h3>

            <div className="space-y-2">
              <label className={`w-full py-2.5 px-3 border-2 font-bold text-xs uppercase cursor-pointer select-none transition-all flex items-center justify-between ${
                decision === 'CONTINUE_WEEKLY' ? 'bg-[#fff5f5] border-manga-red shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white border-gray-200 hover:bg-zinc-50'
              }`}>
                <input type="radio" checked={decision === 'CONTINUE_WEEKLY'} onChange={() => setDecision('CONTINUE_WEEKLY')} className="hidden" />
                <span>CONTINUE WEEKLY</span>
              </label>

              <label className={`w-full py-2.5 px-3 border-2 font-bold text-xs uppercase cursor-pointer select-none transition-all flex items-center justify-between ${
                decision === 'MOVE_TO_MONTHLY' ? 'bg-[#fff5f5] border-manga-red shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white border-gray-200 hover:bg-zinc-50'
              }`}>
                <input type="radio" checked={decision === 'MOVE_TO_MONTHLY'} onChange={() => setDecision('MOVE_TO_MONTHLY')} className="hidden" />
                <span>MOVE TO MONTHLY</span>
              </label>

              <label className={`w-full py-2.5 px-3 border-2 font-bold text-xs uppercase cursor-pointer select-none transition-all flex items-center justify-between ${
                decision === 'ON_HIATUS' ? 'bg-[#fff5f5] border-manga-red shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white border-gray-200 hover:bg-zinc-50'
              }`}>
                <input type="radio" checked={decision === 'ON_HIATUS'} onChange={() => setDecision('ON_HIATUS')} className="hidden" />
                <span>ON HIATUS (3 MONTHS)</span>
              </label>

              <label className={`w-full py-2.5 px-3 border-2 border-dashed font-bold text-xs uppercase cursor-pointer select-none transition-all flex items-center justify-between ${
                decision === 'CANCEL_SERIES' ? 'bg-manga-red text-white border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white border-gray-200 hover:bg-red-50 text-manga-red'
              }`}>
                <input type="radio" checked={decision === 'CANCEL_SERIES'} onChange={() => setDecision('CANCEL_SERIES')} className="hidden" />
                <span>CANCEL SERIES (HỦY BỎ)</span>
              </label>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-start gap-2 text-[10px] font-bold text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={certify}
                  onChange={e => setCertify(e.target.checked)}
                  className="w-4 h-4 shrink-0 border-2 border-manga-ink"
                />
                <span>TÔI XÁC NHẬN ĐÂY LÀ QUYẾT ĐỊNH CUỐI CÙNG THAY MẶT BAN BIÊN TẬP.</span>
              </label>
            </div>

            <button
              onClick={handleSubmitFinalDecision}
              disabled={!certify}
              className="w-full py-3 bg-manga-ink text-white font-manga font-bold text-xs uppercase tracking-widest border-2 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-manga-ink disabled:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              SUBMIT FINAL VOTE
            </button>
          </div>
        </div>
      </div>

      {/* Board discussion feed comments */}
      <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
        <h3 className="font-manga text-xl font-black uppercase border-b-4 border-manga-ink pb-3 mb-6">
          THẢO LUẬN HỘI ĐỒNG CHI CHIẾT (BOARD COMMENTS)
        </h3>

        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div 
              key={comment.id}
              className={`pl-4 py-2 border-l-4 bg-zinc-50/50 flex justify-between items-start ${
                comment.isChief ? 'border-manga-red bg-[#fff5f5]' : 'border-manga-ink'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase ${comment.isChief ? 'text-manga-red' : 'text-manga-ink'}`}>
                    {comment.isChief ? '★ TRƯỞNG BAN' : comment.author}
                  </span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase">{comment.time}</span>
                </div>
                <p className="text-xs font-bold text-zinc-700 leading-normal">{comment.text}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => alert('Đã ghim bình luận thảo luận!')}
                  className="text-gray-400 hover:text-manga-ink text-[10px] font-bold uppercase bg-transparent border-0 cursor-pointer"
                >
                  📌 Ghim
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-400 hover:text-manga-red text-[10px] font-bold uppercase bg-transparent border-0 cursor-pointer"
                >
                  ✕ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendComment} className="flex gap-2 border-t-2 border-manga-ink pt-4">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Nhập ý kiến chỉ đạo thảo luận chiến lược..."
            className="flex-1 border-2 border-manga-ink px-4 py-2.5 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50"
          />
          <button 
            type="submit" 
            className="bg-manga-ink text-white border-2 border-manga-ink px-5 py-2.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
