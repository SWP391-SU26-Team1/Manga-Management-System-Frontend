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

  const [series, setSeries] = useState<ReviewedSeries | undefined>(undefined)
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE')
  const [note, setNote] = useState('')
  const [showSavedToast, setShowSavedToast] = useState(false)
  const [comments, setComments] = useState<any[]>([
    { id: 1, author: 'MINH K. (ART DIRECTOR)', text: 'Cốt truyện cổ trang này có hướng khai thác mới lạ, nét vẽ minh họa của tác giả rất vững.', time: '2 giờ trước' },
    { id: 2, author: 'LAN PHƯƠNG (EDITOR)', text: 'Tôi đồng tình với đề xuất chạy thử Pilot của Biên tập viên phụ trách. Bản thảo có tiềm năng đạt lượng đọc cao.', time: '1 giờ trước' }
  ])
  const [newComment, setNewComment] = useState('')

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

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    const storedUser = localStorage.getItem('mangaflow_user')
    const userObj = storedUser ? JSON.parse(storedUser) : { fullName: 'Minamoto Shizuka', role: 'BOARD' }
    
    setComments([...comments, {
      id: Date.now(),
      author: userObj.fullName.toUpperCase() + ' (MEMBER EDITOR)',
      text: newComment,
      time: 'Vừa xong'
    }])
    setNewComment('')
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
    <div className="max-w-6xl mx-auto pb-12 font-sans relative">
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

      {/* Split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
        {/* Left Col (2 cols): Series Metadata & Storyboard Info */}
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
                  <span>{series.authorName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">Ngày nộp bản thảo:</span>
                  <span>{new Date(series.submittedAt).toLocaleDateString('vi-VN')}</span>
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

        {/* Right Col (1 col): Bỏ phiếu biểu quyết (SERIES_VOTE) */}
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
      </div>

      {/* Discussion forum (Board comments thread) */}
      <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
        <h3 className="font-manga text-xl font-black uppercase border-b-4 border-manga-ink pb-3 mb-6">
          THẢO LUẬN NỘI BỘ VỀ DỰ ÁN (BOARD DISCUSSION)
        </h3>

        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-l-4 border-manga-red pl-4 py-1 bg-zinc-50/50">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[10px] font-black uppercase text-manga-ink">{comment.author}</span>
                <span className="text-[8px] text-gray-400 font-bold uppercase">{comment.time}</span>
              </div>
              <p className="text-xs font-bold text-zinc-700 leading-normal">{comment.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendComment} className="flex gap-2 border-t-2 border-manga-ink pt-4">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Nhập bình luận tham gia thảo luận vụ việc tranh chấp..."
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
