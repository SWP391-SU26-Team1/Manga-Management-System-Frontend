import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router'
import { ArrowLeft, User, Calendar, BookOpen, CheckCircle, Send, Plus, Star } from 'lucide-react'
import { boardService } from '@/services/board.service'
import { useNotifications } from '@/contexts/NotificationContext'

export default function SeriesReviewDetailPage() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlSessionId = searchParams.get('sessionId')
  const { addNotification } = useNotifications()

  // User checking
  const storedUser = sessionStorage.getItem('mangaflow_user')
  const currentUser = storedUser ? JSON.parse(storedUser) : { id: '', fullName: 'Unknown', email: '' }

  const [series, setSeries] = useState<any | undefined>(undefined)
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE')
  const [note, setNote] = useState('')
  const [certify, setCertify] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)
  const [existingVoteId, setExistingVoteId] = useState<string | null>(null)



  const [sessionStatus, setSessionStatus] = useState<string>('open')
  const [comments, setComments] = useState<any[]>([])

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
    const loadDetailAndVote = async () => {
      if (!seriesId) return
      try {
        const res = await boardService.getSeriesById(seriesId)
        if (res && res.title) {
          setSeries({
            id: res.id || res.series_id || seriesId,
            title: res.title,
            authorName: res.authorName || res.author_name || 'Tác giả',
            coverUrl: res.coverUrl || res.cover_image_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300&auto=format&fit=crop',
            genre: res.genre || 'UNKNOWN',
            synopsis: res.synopsis || res.description || '',
            submittedAt: res.submittedAt || res.created_at || new Date().toISOString(),
            tantouName: res.tantouName || res.editor_name || 'Biên tập viên',
            tantouOpinion: res.tantouOpinion || res.note || ''
          })
        } else {
          setSeries(undefined)
        }
      } catch (err) {
        console.warn('API error fetching series details:', err)
        setSeries(undefined)
      }

      try {
        if (urlSessionId) {
          try {
            const proposal = await boardService.getProposalById(urlSessionId)
            if (proposal && proposal.status) {
              setSessionStatus(proposal.status)
            }
          } catch (err) {
            console.warn('API error fetching proposal status:', err)
          }

          const resList = await boardService.getVote(urlSessionId)
          const userVote = resList && resList.length > 0 ? resList.find(v => v.voter_id === currentUser.id || v.users?.username === currentUser.fullName) : null
          
          if (userVote) {
            setExistingVoteId(userVote.vote_id)
            setDecision(userVote.decision === 'APPROVE' || userVote.decision === 'APPROVED' ? 'APPROVE' : 'REJECT')
            setNote(userVote.note || '')
          }

          const boardComments = resList
            .filter((v: any) => v.note && v.note.trim() !== '')
            .map((v: any) => ({
              id: v.vote_id,
              author: (v.users?.fullName || v.users?.username || 'MEMBER').toUpperCase() + ' (EDITOR)',
              text: v.note,
              time: new Date(v.created_at || new Date()).toLocaleString('vi-VN')
            }))
          setComments(boardComments)
        }
      } catch (err) {
        console.warn('API error fetching user votes:', err)
      }
    }
    loadDetailAndVote()
  }, [seriesId, urlSessionId, currentUser.id, currentUser.fullName])

  const handleSubmitVote = async () => {
    if (!seriesId || !series) return
    try {
      if (!urlSessionId) {
        throw new Error("Missing official Review Session. Cannot vote.");
      }
      if (sessionStatus !== 'open' && sessionStatus !== 'pending' && sessionStatus !== 'in_progress') {
        addNotification(
          'VOTE FAILED',
          'Phiên duyệt này đã đóng, bạn không thể gửi hoặc sửa phiếu biểu quyết nữa!',
          'RISK',
          'voting_failed'
        )
        return
      }
      const sessionId = urlSessionId
      const payload = {
        decision,
        note
      }
      if (existingVoteId) {
        await boardService.updateVote(existingVoteId, payload)
      } else {
        await boardService.saveVote(sessionId, payload)
      }

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
      }, 1500)

    } catch (err) {
      console.warn('API error submitting series vote:', err)
      addNotification(
        'VOTE FAILED',
        'Tác phẩm này chưa được Admin / Tantou tạo Phiên duyệt chính thức nên không thể lưu phiếu biểu quyết!',
        'RISK',
        'voting_failed'
      )
    }
  }

  const handleUpdateSeriesStatus = async (action: 'publish' | 'archive' | 'hide' | 'ban') => {
    if (!seriesId) return
    try {
      await boardService.updateSeriesBoardStatus(seriesId, action)
      addNotification(
        'STATUS UPDATED',
        `Bộ truyện đã được đổi trạng thái thành ${action.toUpperCase()} thành công.`,
        'FEEDBACK',
        'voting_success'
      )
      // Navigate back after a delay
      setTimeout(() => navigate('/dashboard/editorial-board/series-approval'), 2000)
    } catch (err) {
      console.error('API error updating series status:', err)
      addNotification(
        'UPDATE FAILED',
        `Lỗi hệ thống khi cố gắng thay đổi trạng thái gốc.`,
        'RISK',
        'voting_failed'
      )
    }
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
          XEM CHI TIẾT & BIỂU QUYẾT SERIES
        </h1>
        <div className="h-1.5 w-24 bg-manga-red mt-2" />
      </div>



      {/* Main Review Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-start">
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
        </div>

        {/* Normal Member Editor Vote panel */}
        <div className="lg:col-span-1">
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
                  disabled={sessionStatus !== 'open' && sessionStatus !== 'pending' && sessionStatus !== 'in_progress'}
                  className={`w-full font-manga font-bold text-xs uppercase py-3 border-2 transition-all text-center ${
                    sessionStatus !== 'open' && sessionStatus !== 'pending' && sessionStatus !== 'in_progress'
                      ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed shadow-none'
                      : 'bg-manga-ink text-white border-manga-ink shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer'
                  }`}
                >
                  {sessionStatus !== 'open' && sessionStatus !== 'pending' && sessionStatus !== 'in_progress'
                    ? 'PHIÊN DUYỆT ĐÃ ĐÓNG'
                    : existingVoteId ? 'SỬA PHIẾU CỦA BẠN' : 'GỬI PHIẾU BIỂU QUYẾT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discussion forum (Board comments thread) */}
      <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
        <h3 className="font-manga text-xl font-black uppercase border-b-4 border-manga-ink pb-3 mb-6">
          THẢO LUẬN NỘI BỘ VỀ DỰ ÁN (BOARD DISCUSSION)
        </h3>

        <div className="space-y-4 mb-6">
          {comments.map((comment) => {
            return (
              <div 
                key={comment.id} 
                className="pl-4 py-2 border-l-4 flex justify-between items-start border-manga-ink bg-zinc-50/50"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-manga-ink">
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
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
