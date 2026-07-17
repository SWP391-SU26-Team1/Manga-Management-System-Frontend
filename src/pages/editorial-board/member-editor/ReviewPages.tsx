import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams, Link, useLocation } from 'react-router'
import { ZoomIn, Maximize2, Send, Save, ArrowRight, ArrowLeft, Star, StarOff, CheckCircle, X } from 'lucide-react'
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

  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomScale, setZoomScale] = useState(1)
  const [transformOrigin, setTransformOrigin] = useState('50% 50%')

  const [isFullscreen, setIsFullscreen] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      imageContainerRef.current?.requestFullscreen().catch(err => console.error(err))
    } else {
      document.exitFullscreen()
    }
  }

  const toggleZoom = () => {
    setIsZoomed(true)
    setZoomScale(1)
    setTransformOrigin('50% 50%')
  }

  const closeZoom = () => {
    setIsZoomed(false)
  }

  const handleLightboxImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (zoomScale === 1) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setTransformOrigin(`${x}% ${y}%`)
      setZoomScale(2.5) // Magnify
    } else {
      setZoomScale(1) // Reset
    }
  }

  const [pages, setPages] = useState<any[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [chapterInfo, setChapterInfo] = useState<any>(null)
  const [sessionInfo, setSessionInfo] = useState<any>(null)

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

      if (urlSessionId) {
        try {
          const sessionData = await boardService.getProposalDetail(urlSessionId)
          if (sessionData) setSessionInfo(sessionData)
        } catch (e) {
          console.error('Error loading session detail:', e)
        }
      }

      // Load true draft pages
      const chapterPages = await pageService.getByChapterId(chapterId)
      if (chapterPages && chapterPages.length > 0) {
        // Sort by page_number
        const sortedPages = chapterPages.sort((a, b) => a.page_number - b.page_number)
        setPages(sortedPages)
      }
    } catch (err) {
      console.error('Error loading manuscripts or chapter info:', err)
    } finally {
      setLoadingFiles(false)
    }
  }

  useEffect(() => {
    loadManuscriptsAndFiles()
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
            THUỘC DIỆN XÉT DUYỆT
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

      <h1 className="font-manga text-3xl md:text-4xl font-bold uppercase text-manga-ink mb-6">
        ĐỌC BẢN THẢO & BIỂU QUYẾT
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Col: Manga viewer + Ghi chú đính kèm */}
        <div className="lg:col-span-2 space-y-8">
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
                <button
                  onClick={toggleZoom}
                  className={`p-1.5 border-2 border-manga-ink hover:bg-zinc-100 cursor-pointer`}
                  title="Thu phóng ảnh"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className={`p-1.5 border-2 border-manga-ink hover:bg-zinc-100 cursor-pointer ${isFullscreen ? 'bg-manga-red text-white hover:bg-red-700' : ''}`}
                  title="Toàn màn hình"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image display */}
            <div
              ref={imageContainerRef}
              className={`border-4 border-manga-ink bg-zinc-200 relative overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-4 flex items-center justify-center ${isFullscreen ? 'w-full h-full max-w-none bg-black border-none' : 'aspect-[3/4] max-w-2xl mx-auto'
                }`}
            >
              <div className={`w-full h-full flex items-center justify-center overflow-hidden`}>
                <img
                  src={mockImage}
                  alt={`Trang ${page}`}
                  className={`transition-all duration-300 select-none w-full h-full ${isFullscreen ? 'object-contain' : 'object-cover'}`}
                />
              </div>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t-2 border-dashed border-gray-300 pt-4 px-2 max-w-2xl mx-auto">
              <button
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="px-4 py-1.5 bg-white border-2 border-manga-ink font-bold text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 cursor-pointer"
              >
                ← TRANG TRƯỚC
              </button>

              <span className="font-manga text-xl font-black text-manga-ink">
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
            <p className="text-gray-700 italic font-medium text-xs leading-relaxed border-l-4 border-manga-red pl-4 py-1 mb-4 bg-zinc-50/50 whitespace-pre-wrap">
              {sessionInfo?.description || chapterInfo?.description || 'Không có ghi chú nào đính kèm cho bản thảo này.'}
            </p>
            <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
              <span>✍ {sessionInfo?.created_by?.username || sessionInfo?.created_by?.fullName || chapterInfo?.author_name || 'LEAD MANGAKA / EDITOR'}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Editor Panel */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Box 1: Thông tin nhanh */}
          <div className="bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <h3 className="font-manga font-black text-lg border-b-4 border-manga-ink pb-2 mb-4 uppercase">
              THÔNG TIN CHUNG
            </h3>
            <ul className="space-y-3 text-[11px] font-bold text-gray-700">
              <li className="flex justify-between border-b-2 border-dashed border-gray-200 pb-2">
                <span className="uppercase text-gray-400">Dự án</span>
                <span className="text-manga-ink">{chapterTitleDisplay}</span>
              </li>
              <li className="flex justify-between border-b-2 border-dashed border-gray-200 pb-2">
                <span className="uppercase text-gray-400">Tiến độ</span>
                <span className="text-manga-ink">BƯỚC 1/3 (ĐỌC)</span>
              </li>
              <li className="flex justify-between border-b-2 border-dashed border-gray-200 pb-2">
                <span className="uppercase text-gray-400">Tác giả</span>
                <span className="text-manga-ink uppercase">{chapterInfo?.author_name || 'MangaFlow Studio'}</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="uppercase text-gray-400">Deadline biểu quyết</span>
                <span className="text-manga-red font-black text-sm">CÒN LẠI 24H 00M</span>
              </li>
            </ul>
          </div>

          {/* Box 2: Tiêu chí Đánh giá */}
          <div className="bg-zinc-900 text-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <h3 className="font-manga font-black text-lg border-b-4 border-white pb-2 mb-4 uppercase text-manga-red">
              HƯỚNG DẪN REVIEW
            </h3>
            <div className="space-y-4 text-[11px] font-bold leading-relaxed">
              <div>
                <strong className="text-manga-red uppercase block mb-1">1. Mỹ thuật (Art)</strong>
                <p className="text-zinc-300">Nét vẽ, đổ bóng, background, cảm xúc nhân vật và tính nhất quán.</p>
              </div>
              <div>
                <strong className="text-manga-red uppercase block mb-1">2. Nhịp độ (Pacing)</strong>
                <p className="text-zinc-300">Phân bổ khung tranh, dòng chảy thị giác, các đoạn chuyển cảnh có mượt không.</p>
              </div>
              <div>
                <strong className="text-manga-red uppercase block mb-1">3. Bố cục (Layout)</strong>
                <p className="text-zinc-300">Độ dễ đọc của thoại, bong bóng thoại có đè lên nhân vật hay chi tiết quan trọng không.</p>
              </div>
              <div>
                <strong className="text-manga-red uppercase block mb-1">4. Cốt truyện (Story)</strong>
                <p className="text-zinc-300">Sự phát triển của nhân vật, hội thoại, mức độ thu hút của diễn biến trong chương.</p>
              </div>
            </div>
          </div>

          {/* Next Flow Step Button */}
          <Link
            to={`/dashboard/editorial-board/review/${chapterId}/score${urlSessionId ? `?sessionId=${urlSessionId}` : ''}`}
            className="flex items-center justify-center gap-2 w-full py-4 bg-manga-ink text-white font-manga font-bold text-sm uppercase tracking-wider border-4 border-manga-ink shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:translate-y-[2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all text-center"
          >
            <span>Đến bước chấm điểm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in p-4 md:p-12">
          {/* Close button */}
          <button
            onClick={closeZoom}
            className="absolute top-6 right-6 text-white hover:text-manga-red bg-zinc-800 hover:bg-zinc-700 rounded-full p-2 transition-colors z-50 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={mockImage}
              alt="Zoomed Manga Page"
              onClick={handleLightboxImageClick}
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: transformOrigin
              }}
              className={`h-[95vh] w-auto max-w-[95vw] object-contain transition-transform duration-300 ${zoomScale === 1 ? 'cursor-zoom-in' : 'cursor-zoom-out'}`}
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-xs font-bold pointer-events-none">
            {zoomScale === 1 ? 'Bấm vào vùng bất kỳ để phóng to' : 'Bấm lại để thu nhỏ'}
          </div>
        </div>
      )}
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
      const currentAvgScore = (grade.drawing + grade.pacing + grade.layout + grade.dialogue + grade.finish) / 5
      navigate(`/dashboard/editorial-board/review/${chapterId}/vote${urlSessionId ? '?sessionId=' + urlSessionId : ''}`, { state: { avgScore: currentAvgScore } })
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
        state={{ avgScore: (grade.drawing + grade.pacing + grade.layout + grade.dialogue + grade.finish) / 5 }}
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
  const location = useLocation()
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

  const chapterTitleDisplay = chapterId === 'cyber-ronin'
    ? 'CYBER RONIN: ZERO'
    : chapterId === 'crimson-petal'
      ? 'CRIMSON PETAL'
      : chapterId === 'pitch-black'
        ? 'PITCH BLACK'
        : 'WHISPERS OF MANA'

  const chapterNumberDisplay = chapterId === 'cyber-ronin' ? 65 : chapterId === 'pitch-black' ? 12 : chapterId === 'whispers-of-mana' ? 45 : 1

  const [pages, setPages] = useState<any[]>([])
  const [pageIndex, setPageIndex] = useState(1)

  useEffect(() => {
    const loadPages = async () => {
      if (!chapterId) return
      try {
        const chapterPages = await pageService.getByChapterId(chapterId)
        if (chapterPages && chapterPages.length > 0) {
          const sortedPages = chapterPages.sort((a: any, b: any) => a.page_number - b.page_number)
          setPages(sortedPages)
        }
      } catch (err) {
        console.error('Error loading pages:', err)
      }
    }
    loadPages()
  }, [chapterId])

  const [totalMembers, setTotalMembers] = useState(3)
  const [votedMembersCount, setVotedMembersCount] = useState(0)

  useEffect(() => {
    const loadVote = async () => {
      if (!chapterId) return
      try {
        const sessionId = urlSessionId || chapterId
        
        if (urlSessionId) {
          try {
            const sessionData = await boardService.getProposalDetail(urlSessionId)
            // if API provides required_votes or members length, use it. Otherwise default to 3
            if (sessionData && sessionData.required_votes) {
               setTotalMembers(sessionData.required_votes)
            }
          } catch(e) {}
        }

        const resList = await boardService.getVote(sessionId)
        if (resList) {
          setVotedMembersCount(resList.length)
        }

        // Find if this user already voted
        const res = resList && resList.length > 0 ? resList.find((v: any) => v.voter_id === currentUser.id || v.users?.username === currentUser.fullName) : null
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

  const fallbackPages = ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop']
  const displayPages = pages.length > 0 ? pages : fallbackPages
  const totalPagesCount = displayPages.length
  const targetPage = displayPages[(pageIndex - 1) % totalPagesCount]
  const currentImage = typeof targetPage === 'string' ? targetPage : targetPage?.image_url || targetPage?.file_url || fallbackPages[0]

  const handleNextPage = () => {
    if (pageIndex < totalPagesCount) setPageIndex(pageIndex + 1)
  }

  const handlePrevPage = () => {
    if (pageIndex > 1) setPageIndex(pageIndex - 1)
  }

  const handleVoteSubmit = async () => {
    try {
      const sessionId = urlSessionId || vote.chapterId
      const tempAvgScore = location.state?.avgScore || 0
      
      const payload = {
        decision: vote.decision,
        note: vote.note,
        score: tempAvgScore > 0 ? Math.round(tempAvgScore) : undefined
      }
      
      if (existingVoteId) {
        await boardService.updateVote(existingVoteId, payload)
        addNotification(
          'UPDATE SUCCESSFUL',
          `Phiếu bầu của bạn cho '${chapterTitleDisplay}' đã được CẬP NHẬT thành công!`,
          'VOTE',
          'voting_success'
        )
      } else {
        await boardService.saveVote(sessionId, payload)
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
            <div className="border-4 border-manga-ink aspect-[3/4] max-w-sm mx-auto overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] relative bg-zinc-900 flex items-center justify-center">
              <img
                src={currentImage}
                alt={`Draft Page ${pageIndex}`}
                className="w-full h-full object-contain select-none"
              />
            </div>

            {/* Footer Navigation */}
            <div className="flex justify-between items-center max-w-sm mx-auto mt-4 px-2">
              <button
                onClick={handlePrevPage}
                disabled={pageIndex <= 1}
                className="px-3 py-1 bg-white border-2 border-manga-ink text-[10px] font-bold uppercase hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] disabled:shadow-none"
              >
                TRANG TRƯỚC
              </button>

              <span className="font-manga text-sm font-bold text-manga-ink uppercase">
                {pageIndex} / {totalPagesCount}
              </span>

              <button
                onClick={handleNextPage}
                disabled={pageIndex >= totalPagesCount}
                className="px-3 py-1 bg-white border-2 border-manga-ink text-[10px] font-bold uppercase hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] disabled:shadow-none"
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
                <span className="text-manga-red font-black">{votedMembersCount} / X THÀNH VIÊN</span>
              </div>
              <div className="w-full h-3 bg-gray-200 border-2 border-manga-ink rounded-none overflow-hidden">
                <div className="h-full bg-manga-red transition-all duration-500" style={{ width: `${Math.min(100, (votedMembersCount / 3) * 100)}%` }} />
              </div>
            </div>

            {/* Decision selector list */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setVote(prev => ({ ...prev, decision: 'APPROVE' }))}
                className={`w-full py-3 border-3 font-manga font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${vote.decision === 'APPROVE'
                  ? 'bg-manga-red text-white border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-manga-ink border-gray-300 hover:bg-red-50/30'
                  }`}
              >
                ✔ ĐỒNG Ý XUẤT BẢN
              </button>
              <button
                onClick={() => setVote(prev => ({ ...prev, decision: 'REJECT' }))}
                className={`w-full py-3 border-3 font-manga font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${vote.decision === 'REJECT'
                  ? 'bg-manga-ink text-white border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-manga-ink border-gray-300 hover:bg-zinc-50'
                  }`}
              >
                ✖ HỦY BẢN THẢO
              </button>
              <button
                onClick={() => setVote(prev => ({ ...prev, decision: 'REVISE' }))}
                className={`w-full py-3 border-3 font-manga font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${vote.decision === 'REVISE'
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
        </div>
      </div>
    </div>
  )
}
