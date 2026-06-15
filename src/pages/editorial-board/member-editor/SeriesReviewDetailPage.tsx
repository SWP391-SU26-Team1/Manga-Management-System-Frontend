import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { ArrowLeft, User, Calendar, BookOpen, CheckCircle, Send, Plus } from 'lucide-react'
import { boardStore, ReviewedSeries } from '@/data/boardMockData'
import { boardService } from '@/services/board.service'
import { useNotifications } from '@/contexts/NotificationContext'

export default function SeriesReviewDetailPage() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const navigate = useNavigate()
  const { addNotification } = useNotifications()

  // User checking
  const storedUser = localStorage.getItem('mangaflow_user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const isChief = user?.isChief || user?.email === 'chiefeditor@mangaflow.com'

  const [series, setSeries] = useState<ReviewedSeries | undefined>(undefined)
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE')
  const [note, setNote] = useState('')
  const [showSavedToast, setShowSavedToast] = useState(false)
  const [certify, setCertify] = useState(false)

  const [comments, setComments] = useState<any[]>([
    { id: 1, author: 'MINH K. (ART DIRECTOR)', text: 'Cốt truyện cổ trang này có hướng khai thác mới lạ, nét vẽ minh họa của tác giả rất vững.', time: '2 giờ trước', isChief: false },
    { id: 2, author: 'LAN PHƯƠNG (EDITOR)', text: 'Tôi đồng tình với đề xuất chạy thử Pilot của Biên tập viên phụ trách. Bản thảo có tiềm năng đạt lượng đọc cao.', time: '1 giờ trước', isChief: false }
  ])
  const [newComment, setNewComment] = useState('')

  // Mock member voting stats for this series
  const mockVotingStats = seriesId === 'phoenix-legend' ? {
    totalVotes: 8,
    maxVotes: 12,
    approveVotes: 6,
    rejectVotes: 2,
    percentApprove: 75,
    percentReject: 25,
    details: [
      { name: 'Minh K.', role: 'Art Director', vote: 'APPROVE', comment: 'Cốt truyện cổ trang này có hướng khai thác mới lạ, nét vẽ minh họa của tác giả rất vững.' },
      { name: 'Lan Phương', role: 'Editor', vote: 'APPROVE', comment: 'Tôi đồng tình với đề xuất chạy thử Pilot của Biên tập viên phụ trách. Bản thảo có tiềm năng đạt lượng đọc cao.' },
      { name: 'Tuấn A.', role: 'Senior Editor', vote: 'REJECT', comment: 'Cốt truyện có phần hơi kén độc giả đại chúng, cần chú ý nhịp truyện.' },
      { name: 'Bình Minh', role: 'Producer', vote: 'APPROVE', comment: 'Phù hợp định hướng phát hành thử nghiệm.' },
      { name: 'Mỹ Linh', role: 'Marketing Manager', vote: 'APPROVE', comment: 'Độc giả nữ rất thích thể loại cổ trang drama này.' },
      { name: 'Hoàng Long', role: 'Lead Editor', vote: 'REJECT', comment: 'Phần kết chương 1 cần đẩy kịch tính lên cao hơn nữa.' },
      { name: 'Thu Thảo', role: 'Editor', vote: 'APPROVE', comment: 'Lineart vẽ tay rất chất lượng, các mảng đen dùng hợp lý.' },
      { name: 'Quốc Bảo', role: 'Editorial staff', vote: 'APPROVE', comment: 'Ủng hộ duyệt Pilot 3 chương đầu.' }
    ]
  } : {
    totalVotes: 10,
    maxVotes: 12,
    approveVotes: 8,
    rejectVotes: 2,
    percentApprove: 80,
    percentReject: 20,
    details: [
      { name: 'Minh K.', role: 'Art Director', vote: 'APPROVE', comment: 'Phong cách năng động, thể hiện chuyển động cơ thể rất tốt.' },
      { name: 'Lan Phương', role: 'Editor', vote: 'APPROVE', comment: 'Truyện thể thao truyền cảm hứng, độc giả trẻ sẽ đón nhận tốt.' },
      { name: 'Tuấn A.', role: 'Senior Editor', vote: 'REJECT', comment: 'Nhân vật chính hơi mờ nhạt ở những trang đầu.' },
      { name: 'Bình Minh', role: 'Producer', vote: 'APPROVE', comment: 'Thị trường truyện thể thao đang thiếu những bộ chất lượng như thế này.' },
      { name: 'Mỹ Linh', role: 'Marketing Manager', vote: 'APPROVE', comment: 'Chiến dịch marketing sẽ tập trung vào ý chí vươn lên của nhân vật.' },
      { name: 'Hoàng Long', role: 'Lead Editor', vote: 'APPROVE', comment: 'Đã chỉnh sửa thoại theo góp ý, bản mới nhất rất tốt.' },
      { name: 'Thu Thảo', role: 'Editor', vote: 'APPROVE', comment: 'Phân cảnh thi đấu điền kinh vẽ rất cuốn hút, kịch tính.' },
      { name: 'Quốc Bảo', role: 'Editorial staff', vote: 'APPROVE', comment: 'Duyệt thử nghiệm ngay.' },
      { name: 'Duy Mạnh', role: 'Art Consultant', vote: 'REJECT', comment: 'Tỉ lệ giải phẫu chân tay ở một số phân cảnh chạy hơi lỗi.' },
      { name: 'Ánh Tuyết', role: 'Editor', vote: 'APPROVE', comment: 'Thoại ngắn gọn, súc tích.' }
    ]
  }

  useEffect(() => {
    const loadDetail = async () => {
      if (!seriesId) return
      try {
        const res = await boardService.getSeriesById(seriesId)
        if (res) {
          setSeries({
            id: res.id || res.series_id || seriesId,
            title: res.title,
            authorName: res.authorName || res.author_name || 'Tác giả',
            coverUrl: res.coverUrl || res.cover_image_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300&auto=format&fit=crop',
            genre: res.genre,
            synopsis: res.synopsis || res.description || '',
            submittedAt: res.submittedAt || res.created_at || new Date().toISOString(),
            tantouName: res.tantouName || res.editor_name || 'Biên tập viên',
            tantouOpinion: res.tantouOpinion || res.note || '',
            vote: res.vote ? {
              decision: res.vote.decision,
              note: res.vote.note || '',
              submittedAt: res.vote.submittedAt || res.vote.created_at
            } : undefined
          })
          if (res.vote) {
            setDecision(res.vote.decision)
            setNote(res.vote.note || '')
          }
        } else {
          setSeries(boardStore.getReviewedSeriesById(seriesId))
        }
      } catch (err) {
        console.warn('API error fetching series details, falling back to mock:', err)
        const mockItem = boardStore.getReviewedSeriesById(seriesId)
        setSeries(mockItem)
        if (mockItem && mockItem.vote) {
          setDecision(mockItem.vote.decision)
          setNote(mockItem.vote.note || '')
        }
      }
    }
    loadDetail()
  }, [seriesId])

  const handleSubmitVote = async () => {
    if (!seriesId || !series) return
    try {
      await boardService.saveSeriesVote({
        series_id: seriesId,
        decision,
        note
      })
    } catch (err) {
      console.warn('API error submitting series vote, falling back to mock store:', err)
    }

    boardStore.saveSeriesVote(seriesId, decision, note)
    const updated = boardStore.getReviewedSeriesById(seriesId)
    setSeries(updated)
    
    // Trigger sliding Neo-brutalist Toast Notification
    addNotification(
      'VOTING SUCCESSFUL',
      `Phiếu biểu quyết bộ truyện '${series.title}' đã được gửi thành công`,
      'VOTE',
      'voting_success'
    )
    
    setShowSavedToast(true)
    setTimeout(() => {
      setShowSavedToast(false)
      navigate('/dashboard/editorial-board/series-approval')
    }, 2500)
  }

  const handleSubmitChiefDecision = async () => {
    if (!seriesId || !series || !certify) return
    
    // Call real API with fallback
    try {
      await boardService.saveSeriesDecision(seriesId, decision === 'APPROVE' ? 'APPROVED' : 'REJECTED', note)
    } catch (err) {
      console.warn('API error saving chief series decision, falling back to local storage:', err)
    }

    // Save to store
    boardStore.updateSeriesStatus(seriesId, decision === 'APPROVE' ? 'APPROVED' : 'REJECTED')
    
    // Trigger toast
    setShowSavedToast(true)
    
    // Dispatch custom event to notify update
    window.dispatchEvent(new Event('mangaflow_vote_submitted'));

    addNotification(
      'DECISION SUBMITTED',
      `Phán quyết cuối cùng của Trưởng ban cho bộ truyện '${series.title}' đã được ban hành thành công`,
      'VOTE',
      'voting_success'
    )
    
    setTimeout(() => {
      setShowSavedToast(false)
      // Redirect to Screen 4 (Send Notification) with pre-filled state
      navigate('/dashboard/editorial-board/send-notification', {
        state: {
          templateType: decision === 'APPROVE' ? 'APPROVAL' : 'CANCELLATION',
          projectName: `${series.title} (Series)`,
          resolution: `Quyết định phán quyết của Trưởng ban: ${
            decision === 'APPROVE' 
              ? 'PHÊ DUYỆT XUẤT BẢN THỬ NGHIỆM (PILOT APPROVED)' 
              : 'BÁC BỎ / TỪ CHỐI ĐẦU TRUYỆN (REJECTED/CANCELLED)'
          }. Ghi chú chỉ đạo: ${note}`
        }
      })
    }, 2000)
  }

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    const storedUser = localStorage.getItem('mangaflow_user')
    const userObj = storedUser ? JSON.parse(storedUser) : { fullName: 'Minamoto Shizuka', role: 'BOARD' }
    const isChiefUser = userObj.isChief || userObj.email === 'chiefeditor@mangaflow.com'
    
    setComments([...comments, {
      id: Date.now(),
      author: userObj.fullName.toUpperCase() + (isChiefUser ? ' (TRƯỞNG BAN)' : ' (MEMBER EDITOR)'),
      text: newComment,
      time: 'Vừa xong',
      isChief: isChiefUser
    }])
    setNewComment('')
  }

  const handlePinComment = (id: number) => {
    const commentToPin = comments.find(c => c.id === id)
    if (commentToPin) {
      const remaining = comments.filter(c => c.id !== id)
      setComments([{ ...commentToPin, pinned: true, author: commentToPin.author.includes('📌') ? commentToPin.author : `📌 ${commentToPin.author}` }, ...remaining])
    }
  }

  const handleDeleteComment = (id: number) => {
    setComments(comments.filter(c => c.id !== id))
  }

  if (!series) {
    return (
      <div className="max-w-md mx-auto py-16 text-center font-sans">
        <p className="text-red-500 font-bold uppercase">Không tìm thấy tác phẩm này trên hệ thống.</p>
        <Link to="/dashboard/editorial-board/series-approval" className="mt-4 text-xs font-bold underline uppercase block text-gray-500">Quay lại danh sách</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans relative text-manga-ink">
      {/* Back button */}
      <div className="mb-4">
        <Link 
          to="/dashboard/editorial-board/series-approval" 
          className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-manga-red transition-colors uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách tác phẩm</span>
        </Link>
      </div>

      {/* Header section */}
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          <span className="bg-manga-red text-white font-bold text-[9px] px-2 py-0.5 border-2 border-manga-ink uppercase">
            XÉT DUYỆT TÁC PHẨM MỚI
          </span>
          <span className="bg-manga-ink text-white font-bold text-[9px] px-2 py-0.5 border-2 border-manga-ink uppercase">
            ID: {series.id.toUpperCase()}
          </span>
        </div>
        <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase text-manga-ink">
          {isChief ? 'TRƯỞNG BAN PHÁN QUYẾT SERIES' : 'XEM CHI TIẾT & BIỂU QUYẾT SERIES'}
        </h1>
        <div className="h-1.5 w-24 bg-manga-red mt-2" />
      </div>

      {/* Split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
        {/* Left Col (2 cols): Series Metadata & Storyboard Info + Member Votes Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)] flex flex-col md:flex-row gap-6">
            {/* Cover image */}
            <div className="w-full md:w-44 h-64 md:h-auto border-4 border-manga-ink overflow-hidden bg-zinc-50 flex-shrink-0 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <img src={series.coverUrl} alt={series.title} className="w-full h-full object-cover" />
            </div>

            {/* Core metadata details */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-manga text-3xl font-black text-manga-ink uppercase leading-none mb-1">
                  {series.title}
                </h3>
                <span className="text-[10px] font-black uppercase bg-manga-ink text-white px-2 py-0.5 border border-manga-ink">
                  {series.genre}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold text-gray-700">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">Tác giả:</span>
                  <span className="text-manga-ink">{series.authorName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">Ngày nộp bản thảo:</span>
                  <span className="text-manga-ink">{new Date(series.submittedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <div>
                <h5 className="text-[10px] font-black uppercase text-gray-400 mb-1">Cốt truyện tóm tắt</h5>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  {series.synopsis}
                </p>
              </div>

              {/* Tantou Editor reviews */}
              <div className="border-t-2 border-dashed border-gray-200 pt-3">
                <h5 className="text-[10px] font-black uppercase text-manga-red mb-1.5">Nhận xét từ BTV phụ trách (Tantou Editor)</h5>
                <blockquote className="border-l-4 border-manga-ink bg-[#f9f9f9] p-3 text-xs font-bold text-zinc-600 leading-relaxed italic">
                  <strong>{series.tantouName}:</strong> "{series.tantouOpinion}"
                </blockquote>
              </div>
            </div>
          </div>

          {/* Member Voting Summary (Chief Only) */}
          {isChief && (
            <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
              <div className="flex justify-between items-center border-b-2 border-manga-ink pb-3 mb-6">
                <h3 className="font-manga text-lg font-black uppercase text-manga-ink">
                  TỔNG HỢP BIỂU QUYẾT CỦA THÀNH VIÊN
                </h3>
                <span className="bg-[#fff1f2] text-manga-red font-manga font-bold text-[10px] px-2.5 py-1 border-2 border-manga-ink uppercase shadow-sm">
                  SỐ LIỆU HỘI ĐỒNG
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border-2 border-manga-ink p-3 bg-zinc-50 shadow-sm text-center">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Tổng số phiếu bầu</span>
                  <strong className="font-manga text-3xl text-manga-ink">
                    {mockVotingStats.totalVotes} / {mockVotingStats.maxVotes}
                  </strong>
                </div>
                <div className="border-2 border-manga-ink p-3 bg-[#e8f5e9] shadow-sm text-center">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Tỉ lệ Phê Duyệt</span>
                  <strong className="font-manga text-3xl text-emerald-600">
                    {mockVotingStats.percentApprove}%
                  </strong>
                </div>
                <div className="border-2 border-manga-ink p-3 bg-zinc-50 shadow-sm text-center">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Quorum tối thiểu</span>
                  <strong className="font-manga text-3xl text-emerald-600">ĐẠT</strong>
                </div>
              </div>

              {/* Bar charts distribution */}
              <div className="space-y-4 mb-6">
                <h4 className="text-xs font-black uppercase text-gray-400">Biểu đồ phân bố phiếu bầu</h4>
                
                {/* Phê duyệt */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-600">✔ ĐỒNG Ý PHÁT HÀNH (APPROVE)</span>
                    <span>{mockVotingStats.approveVotes} phiếu ({mockVotingStats.percentApprove}%)</span>
                  </div>
                  <div className="w-full h-4 bg-gray-100 border-2 border-manga-ink rounded-none overflow-hidden relative">
                    <div 
                      className="h-full bg-emerald-500 border-r-2 border-manga-ink" 
                      style={{ width: `${mockVotingStats.percentApprove}%` }} 
                    />
                  </div>
                </div>

                {/* Bác bỏ */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-manga-red">✖ BÁC BỎ / TỪ CHỐI (REJECT)</span>
                    <span>{mockVotingStats.rejectVotes} phiếu ({mockVotingStats.percentReject}%)</span>
                  </div>
                  <div className="w-full h-4 bg-gray-100 border-2 border-manga-ink rounded-none overflow-hidden relative">
                    <div 
                      className="h-full bg-manga-red border-r-2 border-manga-ink" 
                      style={{ width: `${mockVotingStats.percentReject}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Detailed remarks */}
              <div className="border-t-2 border-manga-ink pt-4">
                <h4 className="text-xs font-black uppercase text-gray-500 mb-3">Ý kiến đóng góp từ các thành viên</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockVotingStats.details.map((item, idx) => (
                    <div key={idx} className="border-2 border-manga-ink p-3 bg-zinc-50 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-black uppercase text-manga-ink">
                          {item.name} <span className="text-[9px] text-gray-400 font-bold">({item.role})</span>
                        </span>
                        <span className={`text-[9px] font-black border-2 px-1.5 py-0.2 uppercase ${
                          item.vote === 'APPROVE' 
                            ? 'border-emerald-500 text-emerald-600 bg-emerald-50' 
                            : 'border-manga-red text-manga-red bg-red-50'
                        }`}>
                          {item.vote === 'APPROVE' ? 'Duyệt' : 'Bác bỏ'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-gray-600 italic">
                        "{item.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Decision / Vote Box */}
        {isChief ? (
          /* Trưởng ban Phán Quyết panel */
          <div className="bg-[#fff1f2] border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <div className="inline-block px-3 py-1 bg-manga-red text-white font-bold uppercase text-[9px] border-2 border-manga-ink shadow-sm mb-4">
              QUYẾT ĐỊNH CỦA TRƯỞNG BAN
            </div>

            <div className="space-y-5">
              <p className="text-xs font-bold leading-relaxed text-gray-700">
                Trưởng ban biên tập có quyền đưa ra phán quyết phê duyệt xuất bản hoặc bác bỏ đầu truyện pilot này.
              </p>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Quyết định phê duyệt</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVE')}
                    className={`py-2.5 font-manga font-bold text-xs uppercase transition-all border-2 cursor-pointer text-center ${
                      decision === 'APPROVE'
                        ? 'bg-emerald-500 text-white border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black border-gray-300 hover:bg-zinc-50'
                    }`}
                  >
                    Phê duyệt (Pilot)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECT')}
                    className={`py-2.5 font-manga font-bold text-xs uppercase transition-all border-2 cursor-pointer text-center ${
                      decision === 'REJECT'
                        ? 'bg-manga-red text-white border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black border-gray-300 hover:bg-zinc-50'
                    }`}
                  >
                    Bác bỏ / Từ chối
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Ghi chú / Nhận xét lý do quyết định</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Nhập lý do phán quyết và chỉ đạo chuyên môn..."
                  className="w-full border-2 border-manga-ink p-3 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50 h-28"
                />
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

              <div className="border-t-2 border-dashed border-gray-200 pt-4 flex flex-col gap-2">
                {showSavedToast && (
                  <div className="bg-emerald-50 text-emerald-600 border border-emerald-500 p-2 text-center text-[10px] font-bold uppercase animate-fade-in flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Quyết định đã được ban hành. Đang chuẩn bị gửi thông báo...</span>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={handleSubmitChiefDecision}
                  disabled={!certify}
                  className="w-full bg-manga-ink text-white font-manga font-bold text-xs uppercase py-3 border-2 border-manga-ink shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-manga-ink disabled:shadow-[3px_3px_0px_rgba(0,0,0,1)] disabled:translate-y-0 transition-all cursor-pointer text-center animate-pulse"
                >
                  BAN HÀNH QUYẾT ĐỊNH &gt;
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Member Editor Vote panel */
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <div className="inline-block px-3 py-1 bg-manga-ink text-white font-bold uppercase text-[9px] border-2 border-manga-ink shadow-sm mb-4">
              BỎ PHIẾU HỘI ĐỒNG
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Quyết định phê duyệt</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVE')}
                    className={`py-2.5 font-manga font-bold text-xs uppercase transition-all border-2 cursor-pointer text-center ${
                      decision === 'APPROVE'
                        ? 'bg-emerald-500 text-white border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black border-gray-300 hover:bg-zinc-50'
                    }`}
                  >
                    Đồng ý (Pass)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECT')}
                    className={`py-2.5 font-manga font-bold text-xs uppercase transition-all border-2 cursor-pointer text-center ${
                      decision === 'REJECT'
                        ? 'bg-manga-red text-white border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black border-gray-300 hover:bg-zinc-50'
                    }`}
                  >
                    Bác bỏ (Fail)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Ghi chú / Nhận xét lý do phê duyệt</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Nhập nhận định của bạn về tiềm năng bộ truyện..."
                  className="w-full border-2 border-manga-ink p-3 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50 h-28"
                />
              </div>

              <div className="border-t-2 border-dashed border-gray-200 pt-4 flex flex-col gap-2">
                {showSavedToast && (
                  <div className="bg-emerald-50 text-emerald-600 border border-emerald-500 p-2 text-center text-[10px] font-bold uppercase animate-fade-in flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Ý kiến đã được lưu. Đang điều hướng...</span>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={handleSubmitVote}
                  className="w-full bg-manga-ink text-white font-manga font-bold text-xs uppercase py-3 border-2 border-manga-ink shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer text-center"
                >
                  Gửi phiếu biểu quyết
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Discussion forum (Board comments thread) */}
      <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
        <h3 className="font-manga text-xl font-black uppercase border-b-4 border-manga-ink pb-3 mb-6">
          THẢO LUẬN NỘI BỘ VỀ DỰ ÁN (BOARD DISCUSSION)
        </h3>

        <div className="space-y-4 mb-6">
          {comments.map((comment) => {
            const commentIsChief = comment.isChief || comment.author.includes('CHIEF') || comment.author.includes('TRƯỞNG BAN')
            return (
              <div 
                key={comment.id} 
                className={`pl-4 py-2 border-l-4 flex justify-between items-start ${
                  commentIsChief ? 'border-manga-red bg-[#fff5f5]' : 'border-manga-ink bg-zinc-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase ${commentIsChief ? 'text-manga-red' : 'text-manga-ink'}`}>
                      {comment.author}
                    </span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase">{comment.time}</span>
                    {comment.pinned && (
                      <span className="bg-manga-red text-white text-[8px] font-black px-1.5 py-0.2 border border-black uppercase ml-1">
                        ĐÃ GHIM
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-zinc-700 leading-normal">{comment.text}</p>
                </div>

                {isChief && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handlePinComment(comment.id)}
                      className="text-gray-400 hover:text-manga-ink text-[10px] font-bold uppercase bg-transparent border-0 cursor-pointer"
                    >
                      📌 Ghim
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-400 hover:text-manga-red text-[10px] font-bold uppercase bg-transparent border-0 cursor-pointer"
                    >
                      ✕ Xóa
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <form onSubmit={handleSendComment} className="flex gap-2 border-t-2 border-manga-ink pt-4">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Nhập ý kiến thảo luận về dự án truyện này..."
            className="flex-1 border-2 border-manga-ink px-4 py-2.5 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50"
          />
          <button 
            type="submit" 
            className="bg-manga-ink text-white border-2 border-manga-ink px-5 py-2.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
