import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { ZoomIn, Maximize2, Send, Save, ArrowRight, ArrowLeft, Star, CheckCircle } from 'lucide-react'
import { boardStore, BoardComment, ChapterGrade } from '@/data/boardMockData'
import { useNotifications } from '@/contexts/NotificationContext'
import { boardService } from '@/services/board.service'

// Helper to load current user
const getStoredUser = () => {
  const data = localStorage.getItem('mangaflow_user')
  return data ? JSON.parse(data) : { fullName: 'Trần K.', role: 'BOARD', isChief: true }
}

// ==========================================
// 1. CHIEF READ DRAFT PAGE
// ==========================================
export function ChiefReadDraftPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState(12)
  const totalPages = 45
  const [comments, setComments] = useState<BoardComment[]>([])
  const [newComment, setNewComment] = useState('')
  const currentUser = getStoredUser()

  const mangaPages = [
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'
  ]
  const mockImage = mangaPages[(page - 1) % mangaPages.length]

  const loadComments = async () => {
    if (!chapterId) return
    try {
      const res = await boardService.getComments(chapterId)
      if (res && res.length > 0) {
        setComments(res.map((c: any) => ({
          id: c.comment_id || c.id,
          author: c.username || c.author || 'USER',
          role: c.role || 'Member Editor',
          isChief: c.role === 'CHIEF' || c.isChief || c.username?.includes('CHIEF'),
          time: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : c.time,
          content: c.content
        })))
      } else {
        setComments(boardStore.getComments(chapterId))
      }
    } catch (err) {
      setComments(boardStore.getComments(chapterId))
    }
  }

  useEffect(() => {
    loadComments()
  }, [chapterId])

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !chapterId) return
    const added: BoardComment = {
      id: `comment_${Date.now()}`,
      author: 'TRẦN K. (CHIEF EDITOR)',
      role: 'Chief Editor',
      isChief: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: newComment
    }
    const updated = [...comments, added]
    setComments(updated)
    // Save to local storage mock store
    localStorage.setItem(`board_comments_${chapterId}`, JSON.stringify(updated))
    setNewComment('')
  }

  const handleDeleteComment = (commentId: string) => {
    const updated = comments.filter(c => c.id !== commentId)
    setComments(updated)
    localStorage.setItem(`board_comments_${chapterId}`, JSON.stringify(updated))
  }

  const handlePinComment = (commentId: string) => {
    alert('Bình luận đã được ghim lên đầu cuộc thảo luận của hội đồng!')
  }

  const chapterTitleDisplay = chapterId === 'cyber-ronin' 
    ? 'CYBER RONIN: ZERO' 
    : chapterId === 'crimson-petal' 
    ? 'CRIMSON PETAL' 
    : chapterId === 'pitch-black' 
    ? 'PITCH BLACK' 
    : 'WHISPERS OF MANA'

  const chapterNumberDisplay = chapterId === 'cyber-ronin' ? 65 : chapterId === 'pitch-black' ? 12 : chapterId === 'whispers-of-mana' ? 45 : 1

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans text-manga-ink">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="bg-manga-red text-white font-bold text-[10px] px-2 py-0.5 border-2 border-manga-ink uppercase">
            XÉT DUYỆT TẬP SỐ - CHIEF
          </span>
          <span className="bg-manga-ink text-white font-bold text-[10px] px-2 py-0.5 border-2 border-manga-ink uppercase">
            DEADLINE: 24H
          </span>
        </div>
        <button 
          onClick={() => alert('Đang tải lịch sử chỉnh sửa bản thảo...')}
          className="text-xs font-bold bg-white border-2 border-manga-ink px-4 py-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 active:translate-y-[1px] cursor-pointer"
        >
          ⏱ Lịch Sử Chỉnh Sửa
        </button>
      </div>

      <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase mb-6">
        ĐỌC BẢN THẢO & BIỂU QUYẾT (CHIEF)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <div className="flex justify-between items-center border-b-2 border-manga-ink pb-3 mb-4">
              <div>
                <h2 className="font-manga text-xl font-bold uppercase">
                  DỰ ÁN: {chapterTitleDisplay}
                </h2>
                <p className="text-xs font-bold text-gray-500 mt-1 uppercase">
                  Chương {chapterNumberDisplay}: Bản Thảo Review | Tác giả: Nhóm MangaFlow Studio
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 border-2 border-manga-ink hover:bg-zinc-100"><ZoomIn className="w-4 h-4" /></button>
                <button className="p-1.5 border-2 border-manga-ink hover:bg-zinc-100"><Maximize2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="border-4 border-manga-ink bg-zinc-200 aspect-[3/4] max-w-lg mx-auto relative overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-4">
              <img 
                src={mockImage} 
                alt={`Trang ${page}`} 
                className="w-full h-full object-cover select-none"
              />
            </div>

            <div className="flex items-center justify-between border-t-2 border-dashed border-gray-300 pt-4 px-2">
              <button 
                onClick={() => page > 1 && setPage(page - 1)}
                disabled={page <= 1}
                className="px-4 py-1.5 bg-white border-2 border-manga-ink font-bold text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 disabled:opacity-40 cursor-pointer"
              >
                ← TRANG TRƯỚC
              </button>
              <span className="font-manga text-xl font-black">{page} / {totalPages}</span>
              <button 
                onClick={() => page < totalPages && setPage(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-1.5 bg-white border-2 border-manga-ink font-bold text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 disabled:opacity-40 cursor-pointer"
              >
                TRANG TIẾP →
              </button>
            </div>
          </div>

          <div className="bg-white border-4 border-manga-ink p-6 shadow-[4px_4px_0px_rgba(15,15,15,1)]">
            <div className="inline-block px-3 py-1 bg-manga-ink text-white font-bold uppercase text-[10px] -mt-10 mb-4 border-2 border-manga-ink">
              GHI CHÚ ĐÍNH KÈM
            </div>
            <h3 className="font-manga text-lg font-bold uppercase mb-2">
              LÝ GIẢI CỦA EDITOR/MANGAKA
            </h3>
            <p className="text-gray-700 italic font-medium text-xs leading-relaxed border-l-4 border-manga-red pl-4 py-1 mb-4 bg-zinc-50/50">
              "Chúng tôi chọn phương pháp vẽ nét thô để tả sự căng thẳng nội tâm của nhân vật. Việc chuyển động khung truyện lệch trục sẽ giúp độc giả cảm nhận được sự giằng xé rõ nét hơn."
            </p>
          </div>
        </div>

        {/* Right: Comments + Navigation */}
        <div className="space-y-6">
          <div className="bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)] flex flex-col h-[520px]">
            <h3 className="font-manga text-lg font-black uppercase border-b-4 border-manga-ink pb-2 mb-4 flex items-center justify-between">
              <span>BOARD DISCUSSION</span>
              <span className="bg-manga-red text-white font-bold text-xs px-2 py-0.5 border-2 border-manga-ink">
                {comments.length}
              </span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
              {comments.map((comment) => {
                const commentIsChief = comment.isChief || comment.author.includes('CHIEF') || comment.role?.includes('Chief')
                return (
                  <div 
                    key={comment.id}
                    className={`p-3 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] flex flex-col justify-between ${
                      commentIsChief ? 'bg-[#fff5f5] border-manga-red' : 'bg-zinc-50'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${commentIsChief ? 'text-manga-red' : 'text-gray-800'}`}>
                          {commentIsChief ? '★ TRƯỞNG BAN BIÊN TẬP' : comment.author}
                        </span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase">{comment.time}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-700 leading-normal break-words">
                        {comment.content}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-dashed border-gray-200 pt-2 mt-2">
                      <button 
                        onClick={() => handlePinComment(comment.id)}
                        className="text-[9px] font-black text-gray-400 hover:text-manga-ink uppercase bg-transparent border-0 cursor-pointer"
                      >
                        📌 Pin
                      </button>
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-[9px] font-black text-gray-400 hover:text-manga-red uppercase bg-transparent border-0 cursor-pointer"
                      >
                        ✕ Xóa
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <form onSubmit={handleSendComment} className="border-t-2 border-manga-ink pt-3 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Thêm bình luận với quyền Chief..."
                className="flex-1 border-2 border-manga-ink px-3 py-2 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50"
              />
              <button 
                type="submit"
                className="bg-manga-ink text-white border-2 border-manga-ink p-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          <Link
            to={`/dashboard/editorial-board/review/${chapterId}/analysis`}
            className="flex items-center justify-center gap-2 w-full py-4 bg-manga-ink text-white font-manga font-bold text-sm uppercase border-4 border-manga-ink shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:translate-y-[2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all text-center block"
          >
            <span>Xem Vote & Quyết định</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 2. CHIEF SCORE PAGE
// ==========================================
export function ChiefScorePage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  
  const [grade, setGrade] = useState<ChapterGrade>({
    chapterId: chapterId || '',
    drawing: 0,
    pacing: 0,
    layout: 0,
    dialogue: 0,
    finish: 0,
    note: ''
  })
  const [success, setSuccess] = useState(false)

  const chapterTitleDisplay = chapterId === 'cyber-ronin' 
    ? 'CYBER RONIN: ZERO' 
    : chapterId === 'crimson-petal' 
    ? 'CRIMSON PETAL' 
    : chapterId === 'pitch-black' 
    ? 'PITCH BLACK' 
    : 'WHISPERS OF MANA'

  const chapterNumberDisplay = chapterId === 'cyber-ronin' ? 65 : chapterId === 'pitch-black' ? 12 : chapterId === 'whispers-of-mana' ? 45 : 1

  useEffect(() => {
    const loadGrade = async () => {
      if (!chapterId) return
      setGrade(boardStore.getGrade(chapterId))
    }
    loadGrade()
  }, [chapterId])

  const handleSelectScore = (metric: keyof Omit<ChapterGrade, 'chapterId' | 'note'>, val: number) => {
    setGrade(prev => ({ ...prev, [metric]: val }))
  }

  const handleSaveScore = () => {
    if (grade.drawing === 0 || grade.pacing === 0 || grade.layout === 0 || grade.dialogue === 0 || grade.finish === 0) {
      addNotification('RATING FAILED', 'Vui lòng hoàn thành điểm số cho tất cả tiêu chí.', 'RATING', 'rating_failed')
      return
    }
    boardStore.saveGrade(grade)
    addNotification('RATING SUCCESSFUL', `Đã lưu điểm số thẩm định của Trưởng ban cho tác phẩm: ${chapterTitleDisplay}`, 'RATING', 'rating_success')
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      navigate(`/dashboard/editorial-board/review/${chapterId}/analysis`)
    }, 1200)
  }

  const criteriaList = [
    { key: 'drawing' as const, label: 'Chất lượng nét vẽ (Drawing)', desc: 'Tỷ lệ giải phẫu, chi tiết nét vẽ nhân vật và độ sắc nét bối cảnh.' },
    { key: 'pacing' as const, label: 'Nhịp truyện (Pacing)', desc: 'Tốc độ diễn tiến cốt truyện, độ giật gân/kịch tính của phân cảnh.' },
    { key: 'layout' as const, label: 'Bố cục khung tranh (Layout)', desc: 'Sắp xếp panel, tính động góc quay và góc nhìn nghệ thuật.' },
    { key: 'dialogue' as const, label: 'Lời thoại & Bong bóng (Dialogue)', desc: 'Tính chắt lọc của câu chữ, vị trí bong bóng thoại và SFX.' },
    { key: 'finish' as const, label: 'Độ hoàn thiện tổng thể (Finish)', desc: 'Đánh bóng (shading), áp screentone và mức độ tinh gọn tổng thể.' }
  ]

  return (
    <div className="max-w-4xl mx-auto pb-12 font-sans text-manga-ink">
      <div className="mb-4 flex items-center justify-between">
        <Link 
          to={`/dashboard/editorial-board/review/${chapterId}/draft`}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-manga-ink hover:text-manga-red"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Xem bản thảo</span>
        </Link>
        <span className="bg-manga-ink text-white font-bold text-[10px] px-2.5 py-1 border-2 border-manga-ink uppercase">
          BƯỚC 2 / 4
        </span>
      </div>

      <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase mb-2">
        BẢNG ĐIỂM THẨM ĐỊNH CHI TIẾT
      </h1>
      <p className="text-xs font-bold text-gray-500 uppercase mb-8">
        Đánh giá chuyên môn của Trưởng ban cho: {chapterTitleDisplay} — Chương {chapterNumberDisplay}
      </p>

      <div className="bg-white border-4 border-manga-ink p-6 shadow-[8px_8px_0px_rgba(15,15,15,1)] space-y-8 mb-8">
        <div className="space-y-6">
          {criteriaList.map((crit) => (
            <div key={crit.key} className="border-b-2 border-gray-100 pb-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                  <h4 className="text-sm font-black uppercase leading-tight">{crit.label}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{crit.desc}</p>
                </div>
                <div className="flex items-center gap-1 bg-zinc-50 border-2 border-manga-ink p-1 shadow-sm">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleSelectScore(crit.key, star)}
                      className="text-manga-ink hover:scale-110 active:scale-95 cursor-pointer bg-transparent border-0 p-0.5"
                    >
                      <Star className={`w-4.5 h-4.5 ${star <= grade[crit.key] ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                  <span className="font-manga text-sm font-black ml-2 w-6 text-center">{grade[crit.key]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-black uppercase mb-2">Ý KIẾN / NHẬN XÉT CỦA TRƯỞNG BAN</label>
          <textarea
            value={grade.note}
            onChange={e => setGrade(prev => ({ ...prev, note: e.target.value }))}
            placeholder="Nhập nhận xét chi tiết về bản thảo này để thông báo kết quả chính thức..."
            className="w-full border-2 border-manga-ink p-3 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50 h-28"
          />
        </div>

        <div className="flex justify-between items-center border-t-4 border-manga-ink pt-6">
          <div>
            {success && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>✓ Đang ghi nhận điểm số và chuyển sang biểu quyết chung...</span>
              </span>
            )}
          </div>
          
          <button
            onClick={handleSaveScore}
            className="flex items-center gap-2 bg-manga-ink text-white font-manga font-bold text-xs uppercase px-6 py-3 border-2 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[2px] transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>LƯU ĐIỂM SỐ & XEM TỔNG HỢP VOTE</span>
          </button>
        </div>
      </div>
    </div>
  )
}
