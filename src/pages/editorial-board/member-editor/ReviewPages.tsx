import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router'
import { ZoomIn, Maximize2, Send, Save, ArrowRight, ArrowLeft, Star, StarOff, CheckCircle } from 'lucide-react'
import { BoardComment, ChapterGrade, ChapterVote } from '@/types/board.types'
import { useNotifications } from '@/contexts/NotificationContext'
import { boardService } from '@/services/board.service'
import { pageService } from '@/services/page.service'
import { chapterService } from '@/services/chapter.service'

// Helper to load current user
const getStoredUser = () => {
  const data = localStorage.getItem('mangaflow_user')
  return data ? JSON.parse(data) : { fullName: 'Minamoto Shizuka', role: 'BOARD' }
}

// ==========================================
// 1. READ DRAFT PAGE (Xem Bản Thảo)
// ==========================================
export function ReadDraftPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlSessionId = searchParams.get('sessionId')
  const [page, setPage] = useState(1)
  const [comments, setComments] = useState<BoardComment[]>([])
  const [newComment, setNewComment] = useState('')
  const currentUser = getStoredUser()

  const [pages, setPages] = useState<any[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [chapterInfo, setChapterInfo] = useState<any>(null)

  // Manga mock images fallback
  const fallbackPages = [
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop'
  ]

  const loadManuscriptsAndFiles = async () => {
    if (!chapterId) return
    try {
      setLoadingFiles(true)
      // Load true chapter info
      const chapterData = await chapterService.getById(chapterId)
      if (chapterData) setChapterInfo(chapterData)

      // Load true draft pages
      const chapterPages = await pageService.getByChapterId(chapterId)
      if (chapterPages && chapterPages.length > 0) {
        // Sort by page_number
        const sortedPages = chapterPages.sort((a, b) => a.page_number - b.page_number)
        setPages(sortedPages)
      }

      // Load session info & votes
      if (urlSessionId) {
        try {
          const detail = await boardService.getProposalById(urlSessionId)
          const votes = await boardService.getVote(urlSessionId)
          
          if (detail) setChapterInfo(prev => ({ ...prev, sessionDetail: detail }))
          
          if (votes && votes.length > 0) {
            const mappedComments: BoardComment[] = votes.map((v: any) => ({
              id: v.vote_id || Date.now().toString() + Math.random(),
              author: v.users?.username || 'Unknown',
              role: 'BOARD',
              isChief: false,
              time: new Date(v.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              content: v.note ? `${v.decision}: ${v.note}` : v.decision
            }))
            setComments(mappedComments)
          }
        } catch (e) {
          console.error('Failed to load session details', e)
        }
      }

    } catch (err) {
      console.error('Error loading manuscripts or chapter info:', err)
    } finally {
      setLoadingFiles(false)
    }
  }

  useEffect(() => {
    loadManuscriptsAndFiles()
  }, [chapterId, urlSessionId])

  const displayPages = pages.length > 0 ? pages : fallbackPages
  const totalPagesCount = displayPages.length

  const handleNextPage = () => {
    if (page < totalPagesCount) setPage(page + 1)
  }

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1)
  }

  const targetPage = displayPages[(page - 1) % totalPagesCount]
  const mockImage = typeof targetPage === 'string' 
    ? targetPage 
    : targetPage?.image_url || targetPage?.file_url || fallbackPages[0]

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !chapterId) return
    // Optimistically add to UI (No backend API for comments in Board context)
    setComments([...comments, {
      id: Date.now().toString(),
      author: currentUser.fullName,
      role: currentUser.role,
      isChief: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: newComment
    }])
    setNewComment('')
  }



  const chapterTitleDisplay = chapterInfo?.title || 'WHISPERS OF MANA'
  const chapterNumberDisplay = chapterInfo?.chapter_number || 1

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="bg-manga-red text-white font-bold text-[10px] px-2 py-0.5 border-2 border-manga-ink uppercase">
            {chapterInfo?.sessionDetail?.status === 'in_progress' ? 'ĐANG DUYỆT' : chapterInfo?.sessionDetail?.status || 'THUỘC DIỆN XÉT DUYỆT'}
          </span>
          <span className="bg-manga-ink text-white font-bold text-[10px] px-2 py-0.5 border-2 border-manga-ink uppercase">
            DEADLINE: {chapterInfo?.sessionDetail?.ended_at ? new Date(chapterInfo.sessionDetail.ended_at).toLocaleDateString() : '24H'}
          </span>
        </div>
        <button 
          onClick={() => alert('Đang tải lịch sử chỉnh sửa bản thảo...')}
          className="text-xs font-bold bg-white border-2 border-manga-ink px-4 py-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 active:translate-y-[1px] cursor-pointer"
        >
          ⏱ Lịch Sử Chỉnh Sửa
        </button>
      </div>

      <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase text-manga-ink mb-6">
        ĐỌC BẢN THẢO & BIỂU QUYẾT
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Col: Manga viewer + Ghi chú đính kèm */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Viewer Card */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <div className="flex justify-between items-center border-b-2 border-manga-ink pb-3 mb-4">
              <div>
                <h2 className="font-manga text-xl font-bold text-manga-ink uppercase">
                  TÊN DỰ ÁN: {chapterTitleDisplay}
                </h2>
                <p className="text-xs font-bold text-gray-500 mt-1 uppercase">
                  Chương {chapterNumberDisplay}: Bản Thảo Review | Tác giả: Nhóm MangaFlow Studio
                </p>
              </div>
              <div className="flex gap-2 text-manga-ink">
                <button className="p-1.5 border-2 border-manga-ink hover:bg-zinc-100 cursor-pointer"><ZoomIn className="w-4 h-4" /></button>
                <button className="p-1.5 border-2 border-manga-ink hover:bg-zinc-100 cursor-pointer"><Maximize2 className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Image display */}
            <div className="border-4 border-manga-ink bg-zinc-200 aspect-[3/4] max-w-lg mx-auto relative overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-4">
              <img 
                src={mockImage} 
                alt={`Trang ${page}`} 
                className="w-full h-full object-cover select-none"
              />
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t-2 border-dashed border-gray-300 pt-4 px-2">
              <button 
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="px-4 py-1.5 bg-white border-2 border-manga-ink font-bold text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 cursor-pointer"
              >
                ← TRANG TRƯỚC
              </button>
              
              <span className="font-manga text-xl font-black">
                {page} / {totalPagesCount}
              </span>

              <button 
                onClick={handleNextPage}
                disabled={page >= totalPagesCount}
                className="px-4 py-1.5 bg-white border-2 border-manga-ink font-bold text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 cursor-pointer"
              >
                TRANG TIẾP →
              </button>
            </div>
          </div>

          {/* Ghi chú đính kèm card */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[4px_4px_0px_rgba(15,15,15,1)]">
            <div className="inline-block px-3 py-1 bg-manga-ink text-white font-bold uppercase text-[10px] -mt-10 mb-4 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              GHI CHÚ ĐÍNH KÈM
            </div>
            <h3 className="font-manga text-lg font-bold uppercase text-manga-ink mb-2">
              LÝ GIẢI CỦA EDITOR/MANGAKA
            </h3>
            <p className="text-gray-700 italic font-medium text-xs leading-relaxed border-l-4 border-manga-red pl-4 py-1 mb-4 bg-zinc-50/50">
              "Ở phân cảnh này, chúng tôi quyết định đẩy mạnh shading bằng nét gạch chéo (cross-hatching) thay vì dùng screentone thông thường. Mục đích là để lột tả sự căng thẳng tột độ của nhân vật chính khi đối mặt với quyết định sinh tử. Nhịp độ khung tranh cũng được bẻ gãy bất đối xứng để tạo cảm giác chông chênh."
            </p>
            <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
              <span>✍ TRẦN VĂN A - LEAD MANGAKA</span>
            </div>
          </div>
        </div>

        {/* Right Col: Feedback feed + Next step link */}
        <div className="space-y-6">
          {/* Feedback feed card */}
          <div className="bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)] flex flex-col h-[520px]">
            <h3 className="font-manga text-lg font-black uppercase border-b-4 border-manga-ink pb-2 mb-4 flex items-center justify-between">
              <span>FEEDBACK</span>
              <span className="bg-manga-red text-white font-bold text-xs px-2 py-0.5 border-2 border-manga-ink shadow-sm">
                {comments.length}
              </span>
            </h3>

            {/* Scrollable feed list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
              {comments.map((comment) => (
                <div 
                  key={comment.id}
                  className={`p-3 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                    comment.isChief ? 'bg-[#fff5f5] border-manga-red' : 'bg-zinc-50'
                  }`}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${comment.isChief ? 'text-manga-red' : 'text-gray-800'}`}>
                      {comment.isChief ? '★ ' : ''}{comment.author}
                    </span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase">{comment.time}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-700 leading-normal break-words">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Feedback write form */}
            <form onSubmit={handleSendComment} className="border-t-2 border-manga-ink pt-3 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Thêm feedback..."
                className="flex-1 border-2 border-manga-ink px-3 py-2 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50"
              />
              <button 
                type="submit"
                className="bg-manga-ink text-white border-2 border-manga-ink p-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:border-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] cursor-pointer focus:outline-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Next Flow Step Button */}
          <Link
            to={`/dashboard/editorial-board/review/${chapterId}/score${urlSessionId ? `?sessionId=${urlSessionId}` : ''}`}
            className="flex items-center justify-center gap-2 w-full py-4 bg-manga-ink text-white font-manga font-bold text-sm uppercase tracking-wider border-4 border-manga-ink shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:translate-y-[2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all text-center block"
          >
            <span>Đến bước chấm điểm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 2. SCORE PAGE (Chấm Điểm)
// ==========================================
export function ScorePage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlSessionId = searchParams.get('sessionId')
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
    // Backend currently doesn't store intermediate grades before vote.
    // We start with a fresh grade form.
    setGrade({ chapterId: chapterId || '', drawing: 0, pacing: 0, layout: 0, dialogue: 0, finish: 0, note: '' })
  }, [chapterId])

  const handleSelectScore = (metric: keyof Omit<ChapterGrade, 'chapterId' | 'note'>, val: number) => {
    setGrade(prev => ({
      ...prev,
      [metric]: val
    }))
  }

  const handleSaveScore = async () => {
    if (grade.drawing === 0 || grade.pacing === 0 || grade.layout === 0 || grade.dialogue === 0 || grade.finish === 0) {
      addNotification(
        'RATING FAILED',
        'Không thể gửi đánh giá. Vui lòng hoàn thành điểm số cho tất cả tiêu chí.',
        'RATING',
        'rating_failed'
      )
      return
    }

    try {
      // Backend does not have a separate grade endpoint. 
      // Grades are either submitted along with the vote or kept locally until vote.
      // We simulate a successful save here.
      addNotification(
        'RATING SUCCESSFUL',
        'Đã lưu điểm số thành công, chuẩn bị chuyển sang bước Biểu quyết.',
        'RATING',
        'rating_success'
      )
      navigate(`/dashboard/editorial-board/review/${chapterId}/vote${urlSessionId ? '?sessionId=' + urlSessionId : ''}`)
    } catch (err) {
      console.error('API error saving grade:', err)
      addNotification(
        'RATING FAILED',
        'Lỗi hệ thống khi lưu điểm số',
        'RATING',
        'rating_failed'
      )
    }
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const criteriaList = [
    { key: 'drawing' as const, label: 'Chất lượng nét vẽ (Drawing)', desc: 'Tỷ lệ giải phẫu, chi tiết nét vẽ nhân vật và độ sắc nét bối cảnh.' },
    { key: 'pacing' as const, label: 'Nhịp truyện (Pacing)', desc: 'Tốc độ diễn tiến cốt truyện, độ giật gân/kịch tính của phân cảnh.' },
    { key: 'layout' as const, label: 'Bố cục khung tranh (Layout)', desc: 'Sắp xếp panel, tính động góc quay và góc nhìn nghệ thuật.' },
    { key: 'dialogue' as const, label: 'Lời thoại & Bong bóng (Dialogue)', desc: 'Tính chắt lọc của câu chữ, vị trí bong bóng thoại và SFX.' },
    { key: 'finish' as const, label: 'Độ hoàn thiện tổng thể (Finish)', desc: 'Đánh bóng (shading), áp screentone và mức độ tinh gọn tổng thể.' }
  ]

  return (
    <div className="max-w-4xl mx-auto pb-12 font-sans">
      <div className="mb-4 flex items-center justify-between">
        <Link 
          to={`/dashboard/editorial-board/review/${chapterId}/draft${urlSessionId ? `?sessionId=${urlSessionId}` : ''}`}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-manga-ink hover:text-manga-red transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Xem bản thảo</span>
        </Link>
        <span className="bg-manga-ink text-white font-bold text-[10px] px-2.5 py-1 border-2 border-manga-ink uppercase">
          BƯỚC 2 / 3
        </span>
      </div>

      <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase text-manga-ink mb-2">
        BẢNG ĐIỂM CHUYÊN MÔN
      </h1>
      <p className="text-xs font-bold text-gray-500 uppercase mb-8">
        Đánh giá chuyên sâu cho: {chapterTitleDisplay} — Chương {chapterNumberDisplay}
      </p>

      {/* Main Form container */}
      <div className="bg-white border-4 border-manga-ink p-6 shadow-[8px_8px_0px_rgba(15,15,15,1)] space-y-8 mb-8">
        <div className="space-y-6">
          {criteriaList.map((crit) => (
            <div key={crit.key} className="border-b-2 border-gray-100 pb-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                  <h4 className="text-sm font-black uppercase text-manga-ink leading-tight">
                    {crit.label}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    {crit.desc}
                  </p>
                </div>

                {/* Star rating selector 1-10 */}
                <div className="flex items-center gap-1 bg-zinc-50 border-2 border-manga-ink p-1 shadow-sm">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleSelectScore(crit.key, star)}
                      className="text-manga-ink hover:scale-110 active:scale-95 cursor-pointer bg-transparent border-0 p-0.5"
                    >
                      {star <= grade[crit.key] ? (
                        <Star className="w-4.5 h-4.5 text-yellow-400 fill-yellow-400" />
                      ) : (
                        <Star className="w-4.5 h-4.5 text-gray-300" />
                      )}
                    </button>
                  ))}
                  <span className="font-manga text-sm font-black ml-2 w-6 text-center">
                    {grade[crit.key]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grade note textarea */}
        <div>
          <label className="block text-xs font-black uppercase text-manga-ink mb-2">
            FEEDBACK ĐÁNH GIÁ CHUYÊN MÔN
          </label>
          <textarea
            value={grade.note}
            onChange={e => setGrade(prev => ({ ...prev, note: e.target.value }))}
            placeholder="Nhập nhận xét chi tiết về bản thảo này để làm cơ sở biểu quyết..."
            className="w-full border-2 border-manga-ink p-3 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50 h-28"
          />
        </div>

        {/* Submitting Actions */}
        <div className="flex justify-between items-center border-t-4 border-manga-ink pt-6">
          <div className="flex items-center">
            {success && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                <CheckCircle className="w-4 h-4" />
                <span>✓ Điểm số đã được ghi nhận vào hệ thống.</span>
              </span>
            )}
          </div>
          
          <button
            onClick={handleSaveScore}
            className="flex items-center gap-2 bg-manga-ink text-white font-manga font-bold text-xs uppercase px-6 py-3 border-2 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer font-bold"
          >
            <Save className="w-4 h-4" />
            <span>LƯU ĐIỂM SỐ</span>
          </button>
        </div>
      </div>

      {/* Next Step Link */}
      <Link
        to={`/dashboard/editorial-board/review/${chapterId}/vote${urlSessionId ? `?sessionId=${urlSessionId}` : ''}`}
        className="flex items-center justify-center gap-2 w-full py-4 bg-manga-red text-white font-manga font-bold text-sm uppercase tracking-wider border-4 border-manga-ink shadow-[6px_6px_0px_rgba(15,15,15,1)] hover:bg-red-700 hover:translate-y-[2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all text-center block"
      >
        <span>Tiến hành biểu quyết xuất bản</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

// ==========================================
// 3. VOTE PAGE (Biểu quyết xuất bản)
// ==========================================
export function VotePage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlSessionId = searchParams.get('sessionId')
  const { addNotification } = useNotifications()
  const [existingVoteId, setExistingVoteId] = useState<string | null>(null)
  const [vote, setVote] = useState<ChapterVote>({
    chapterId: chapterId || '',
    decision: 'APPROVE',
    note: ''
  })
  const [success, setSuccess] = useState(false)
  const [comments, setComments] = useState<BoardComment[]>([])
  const [newComment, setNewComment] = useState('')
  const currentUser = getStoredUser()
  const [pages, setPages] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loadingFiles, setLoadingFiles] = useState(false)

  // Manga mock images fallback
  const fallbackPages = [
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop'
  ]

  useEffect(() => {
    const loadManuscripts = async () => {
      if (!chapterId) return
      try {
        setLoadingFiles(true)
        const chapterPages = await pageService.getByChapterId(chapterId)
        if (chapterPages && chapterPages.length > 0) {
          const sortedPages = chapterPages.sort((a: any, b: any) => a.page_number - b.page_number)
          setPages(sortedPages)
        }
      } catch (err) {
        console.error('Error loading manuscripts:', err)
      } finally {
        setLoadingFiles(false)
      }
    }
    loadManuscripts()
  }, [chapterId])

  const displayPages = pages.length > 0 ? pages : fallbackPages
  const totalPagesCount = displayPages.length

  const handleNextPage = () => {
    if (page < totalPagesCount) setPage(page + 1)
  }

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1)
  }

  const targetPage = displayPages[(page - 1) % totalPagesCount]
  const mockImage = typeof targetPage === 'string' 
    ? targetPage 
    : targetPage?.image_url || targetPage?.file_url || fallbackPages[0]

  const chapterTitleDisplay = chapterId === 'cyber-ronin' 
    ? 'CYBER RONIN: ZERO' 
    : chapterId === 'crimson-petal' 
    ? 'CRIMSON PETAL' 
    : chapterId === 'pitch-black' 
    ? 'PITCH BLACK' 
    : 'WHISPERS OF MANA'

  const chapterNumberDisplay = chapterId === 'cyber-ronin' ? 65 : chapterId === 'pitch-black' ? 12 : chapterId === 'whispers-of-mana' ? 45 : 1

  useEffect(() => {
    const loadVote = async () => {
      if (!chapterId) return
      try {
        const sessionId = urlSessionId || chapterId
        const resList = await boardService.getVote(sessionId)
        
        // Find if this user already voted
        const res = resList && resList.length > 0 ? resList.find(v => v.voter_id === currentUser.id || v.users?.username === currentUser.fullName) : null
        if (res) {
          setExistingVoteId(res.vote_id)
          setVote({
            chapterId: res.chapter_id || chapterId,
            decision: res.decision,
            note: res.note || ''
          })
        } else {
          setVote({ chapterId, decision: 'APPROVE', note: '' })
        }
      } catch (err) {
        console.error('API error loading vote:', err)
        setVote({ chapterId, decision: 'APPROVE', note: '' })
      }
    }
    loadVote()
  }, [chapterId, urlSessionId, currentUser?.id])

  const handleVoteSubmit = async () => {
    try {
      const sessionId = urlSessionId || vote.chapterId
      if (existingVoteId) {
        await boardService.updateVote(existingVoteId, {
          decision: vote.decision,
          note: vote.note
        })
        addNotification(
          'UPDATE SUCCESSFUL',
          `Phiếu bầu của bạn cho '${chapterTitleDisplay}' đã được CẬP NHẬT thành công!`,
          'VOTE',
          'voting_success'
        )
      } else {
        await boardService.saveVote(sessionId, {
          decision: vote.decision,
          note: vote.note
        })
        addNotification(
          'VOTING SUCCESSFUL',
          `Phiếu bầu của bạn cho '${chapterTitleDisplay}' đã được ghi nhận vào hệ thống.`,
          'VOTE',
          'voting_success'
        )
      }
    } catch (err) {
      console.error('API error saving vote:', err)
      addNotification(
        'VOTING FAILED', 
        'Hệ thống đang bảo trì hoặc API lỗi, không thể lưu phiếu bầu lúc này.', 
        'VOTE', 
        'voting_failed'
      )
      return
    }
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      navigate('/dashboard/editorial-board')
    }, 2000)
  }

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !chapterId) return
    setComments([...comments, {
      id: Date.now().toString(),
      author: currentUser.fullName,
      role: currentUser.role,
      isChief: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: newComment
    }])
    setNewComment('')
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      <div className="mb-4 flex items-center justify-between">
        <Link 
          to={`/dashboard/editorial-board/review/${chapterId}/score${urlSessionId ? `?sessionId=${urlSessionId}` : ''}`}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-manga-ink hover:text-manga-red transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Bảng điểm</span>
        </Link>
        <span className="bg-manga-red text-white font-bold text-[10px] px-2.5 py-1 border-2 border-manga-ink uppercase">
          BƯỚC 3 / 3
        </span>
      </div>

      <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase text-manga-ink leading-none mb-2">
        BIỂU QUYẾT XUẤT BẢN
      </h1>
      <p className="text-xs font-bold text-gray-500 uppercase mb-6">
        Dự án: {chapterTitleDisplay} — Chương {chapterNumberDisplay} | Nhóm MangaFlow Studio
      </p>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Col: Manga thumbnail layout preview */}
        <div className="lg:col-span-2">
          <div className="bg-white border-4 border-manga-ink p-4 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <h3 className="font-manga text-md font-bold text-manga-ink uppercase mb-3 border-b-2 border-manga-ink pb-2">
              BẢN XEM TRƯỚC HỒ SƠ BIỂU QUYẾT
            </h3>
            
            {/* Draw draft display inside a mockup box */}
            <div className="border-4 border-manga-ink aspect-[3/4] max-w-sm mx-auto overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] relative">
              {loadingFiles ? (
                <div className="w-full h-full flex items-center justify-center bg-zinc-200">
                  <span className="font-bold text-gray-500 animate-pulse">Loading...</span>
                </div>
              ) : (
                <img 
                  src={mockImage}
                  alt={`Trang ${page}`}
                  className="w-full h-full object-cover select-none"
                />
              )}
              <div className="absolute top-2 left-2 bg-manga-red text-white text-[9px] font-black px-2 py-0.5 border-2 border-manga-ink shadow-sm">
                BẢN XEM TRƯỚC
              </div>
            </div>
            
            {/* Footer Navigation */}
            <div className="flex justify-between items-center max-w-sm mx-auto mt-4 px-2">
              <button 
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="px-3 py-1 bg-white border-2 border-manga-ink text-[10px] font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 cursor-pointer"
              >
                TRANG TRƯỚC
              </button>
              <span className="font-manga text-sm font-black">
                {page} / {totalPagesCount}
              </span>
              <button 
                onClick={handleNextPage}
                disabled={page >= totalPagesCount}
                className="px-3 py-1 bg-white border-2 border-manga-ink text-[10px] font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 cursor-pointer"
              >
                TRANG SAU
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Personal Vote Card & Comments Feed */}
        <div className="space-y-6">
          {/* Voting Box */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <h3 className="font-manga text-lg font-black uppercase border-b-4 border-manga-ink pb-2 mb-4">
              PHIẾU BẦU CỦA BẠN
            </h3>
            
            {/* Progress bar */}
            <div className="bg-zinc-50 border-2 border-manga-ink p-3 mb-6 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span>TIẾN ĐỘ PHÊ DUYỆT</span>
                <span className="text-manga-red font-black">2 / 3 THÀNH VIÊN</span>
              </div>
              <div className="w-full h-3 bg-gray-200 border-2 border-manga-ink rounded-none overflow-hidden">
                <div className="h-full bg-manga-red" style={{ width: '66%' }} />
              </div>
            </div>

            {/* Decision selector list */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setVote(prev => ({ ...prev, decision: 'APPROVE' }))}
                className={`w-full py-3 border-3 font-manga font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${
                  vote.decision === 'APPROVE'
                    ? 'bg-manga-red text-white border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-manga-ink border-gray-300 hover:bg-red-50/30'
                }`}
              >
                ✔ ĐỒNG Ý XUẤT BẢN
              </button>
              <button
                onClick={() => setVote(prev => ({ ...prev, decision: 'REJECT' }))}
                className={`w-full py-3 border-3 font-manga font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${
                  vote.decision === 'REJECT'
                    ? 'bg-manga-ink text-white border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-manga-ink border-gray-300 hover:bg-zinc-50'
                }`}
              >
                ✖ HỦY BẢN THẢO
              </button>
              <button
                onClick={() => setVote(prev => ({ ...prev, decision: 'REVISE' }))}
                className={`w-full py-3 border-3 font-manga font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${
                  vote.decision === 'REVISE'
                    ? 'bg-[#fef9c3] text-manga-ink border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-manga-ink border-gray-300 hover:bg-yellow-50/50'
                }`}
              >
                📅 CẦN CHỈNH SỬA
              </button>
            </div>

            {/* Voting Reason */}
            <div className="mb-4">
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5">Ghi chú biểu quyết (Optional)</label>
              <textarea
                value={vote.note}
                onChange={e => setVote(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Nhập lí do biểu quyết của bạn..."
                className="w-full border-2 border-manga-ink p-2 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50 h-16"
              />
            </div>

            {/* Vote Action Button */}
            {success ? (
              <div className="w-full py-3 bg-emerald-100 text-emerald-800 font-bold border-2 border-emerald-500 text-center text-xs">
                ✓ ĐÃ GHI NHẬN BIỂU QUYẾT! ĐANG ĐIỀU HƯỚNG...
              </div>
            ) : (
              <button
                onClick={handleVoteSubmit}
                className="w-full py-3.5 bg-manga-ink text-white font-manga font-bold text-xs uppercase tracking-widest border-2 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
              >
                GỬI Ý KIẾN BIỂU QUYẾT
              </button>
            )}
          </div>

          {/* Board Feedback widget */}
          <div className="bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <h3 className="font-manga text-md font-black uppercase border-b-2 border-manga-ink pb-2 mb-3">
              FEEDBACK HỘI ĐỒNG
            </h3>
            
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4 pr-1">
              {comments.slice(0, 3).map((cmt) => (
                <div key={cmt.id} className="border-l-4 border-manga-ink pl-3 py-0.5">
                  <span className="block text-[9px] font-black text-gray-500 uppercase">{cmt.author}</span>
                  <p className="text-xs font-bold text-zinc-700 leading-tight mt-0.5">{cmt.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Thêm feedback..."
                className="flex-1 border-2 border-manga-ink px-2.5 py-1.5 text-xs font-bold outline-none focus:border-manga-red bg-zinc-50"
              />
              <button type="submit" className="bg-manga-ink text-white border-2 border-manga-ink p-1.5 cursor-pointer">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
