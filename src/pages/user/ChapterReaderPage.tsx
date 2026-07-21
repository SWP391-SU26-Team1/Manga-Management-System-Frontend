import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { MessageSquare, MessageCircle, Heart, Share2, ArrowLeft, ChevronLeft, ChevronRight, Settings, Menu, X } from 'lucide-react'
import { readerService } from '@/services/reader.service'
import { MangaPage, PublishedChapter } from '@/types/reader.types'
import ChapterCommentsPanel from '@/components/user/ChapterCommentsPanel'
import { useToast } from '@/contexts/ToastContext'

const getLikeKey = () => {
  try {
    const userStr = sessionStorage.getItem('mangaflow_user') || localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.id) return `mangaflow_liked_chapters_${user.id}`;
    }
  } catch (e) {}
  return 'mangaflow_liked_chapters_guest';
}

export default function ChapterReaderPage() {
  const { seriesId, chapterId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [pages, setPages] = useState<MangaPage[]>([])
  const [chapter, setChapter] = useState<PublishedChapter | null>(null)
  const [allChapters, setAllChapters] = useState<PublishedChapter[]>([])
  const [showNav, setShowNav] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [showChapterList, setShowChapterList] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [imageWidth, setImageWidth] = useState<'full' | 'original'>('full')
  const [bgColor, setBgColor] = useState<'dark' | 'light'>('dark')
  const [readDirection, setReadDirection] = useState<'vertical' | 'horizontal'>('vertical')
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(() => {
    try {
      const stored = localStorage.getItem(getLikeKey());
      const parsed = stored ? JSON.parse(stored) : {};
      return false; // will update in useEffect
    } catch {
      return false;
    }
  })
  
  const bottomRef = useRef<HTMLDivElement>(null)
  const viewLoggedRef = useRef<string | null>(null)

  useEffect(() => {
    if (chapterId && seriesId) {
      // Scroll to top when chapter changes
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

      readerService.getChapterPages(chapterId).then(setPages)
      readerService.getPublishedChapters(seriesId).then(chapters => {
        setAllChapters(chapters)
        const current = chapters.find(c => c.id === chapterId)
        if (current) setChapter(current)
      })
      
      // Chống StrictMode double-mount: chỉ log view 1 lần mỗi chapterId
      if (viewLoggedRef.current !== chapterId) {
        viewLoggedRef.current = chapterId
        readerService.logView(seriesId, chapterId)
      }
      
      // Immediately mark as read when user opens the chapter
      readerService.saveReadingProgress({ series_id: seriesId, chapter_id: chapterId, page_number: 1 });

      
      try {
        const stored = localStorage.getItem(getLikeKey());
        const parsed = stored ? JSON.parse(stored) : {};
        setIsLiked(!!parsed[chapterId]);
        
        // Sync with API
        const userStr = sessionStorage.getItem('mangaflow_user') || localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.id) {
            readerService.getSeriesDetail(seriesId).then(detail => {
              if (detail && detail.chaptersData) {
                const currentCh = detail.chaptersData.find((c: any) => c.chapter_id === chapterId);
                if (currentCh && currentCh.chapter_like) {
                  const hasLiked = currentCh.chapter_like.includes(user.id);
                  setIsLiked(hasLiked);
                  if (hasLiked) {
                    parsed[chapterId] = true;
                  } else {
                    delete parsed[chapterId];
                  }
                  localStorage.setItem(getLikeKey(), JSON.stringify(parsed));
                }
              }
            });
          }
        }
      } catch (err) {}
      
      setCurrentPageIndex(0);
    }
  }, [chapterId, seriesId])

  const currentChapterIndex = allChapters.findIndex(c => c.id === chapterId)
  
  // Array is descending (newest first). 
  // Next chapter (newer) has a smaller index.
  // Prev chapter (older) has a larger index.
  const hasPrev = currentChapterIndex < allChapters.length - 1
  const hasNext = currentChapterIndex > 0

  const handlePrevChapter = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (hasPrev) {
      navigate(`/series/${seriesId}/chapter/${allChapters[currentChapterIndex + 1].id}`)
    }
  }

  const handleNextChapter = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (hasNext) {
      navigate(`/series/${seriesId}/chapter/${allChapters[currentChapterIndex - 1].id}`)
    }
  }

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea (like comments)
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        if (readDirection === 'horizontal') {
          if (currentPageIndex > 0) {
            setCurrentPageIndex(p => p - 1);
          } else {
            handlePrevChapter();
          }
        } else {
          handlePrevChapter();
        }
      } else if (e.key === 'ArrowRight') {
        if (readDirection === 'horizontal') {
          if (currentPageIndex < pages.length - 1) {
            setCurrentPageIndex(p => p + 1);
          } else {
            handleNextChapter();
          }
        } else {
          handleNextChapter();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readDirection, currentPageIndex, pages.length, hasPrev, hasNext, seriesId, allChapters, currentChapterIndex, navigate]);

  // Toggle nav bars on click
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readDirection === 'vertical') {
      setShowNav(!showNav)
      return
    }
    
    // Horizontal mode
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x < rect.width * 0.3) {
      if (currentPageIndex > 0) {
         setCurrentPageIndex(p => p - 1)
      } else {
         handlePrevChapter(e)
      }
    } else if (x > rect.width * 0.7) {
      if (currentPageIndex < pages.length - 1) {
         setCurrentPageIndex(p => p + 1)
      } else {
         handleNextChapter(e)
      }
    } else {
      setShowNav(!showNav)
    }
  }

  const handleChapterLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const userStr = sessionStorage.getItem('mangaflow_user') || localStorage.getItem('user');
    if (!userStr) {
      showToast('Vui lòng đăng nhập để theo dõi (like) chương này!', 'error');
      return;
    }
    if (chapterId) {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      try {
        const stored = localStorage.getItem(getLikeKey());
        const parsed = stored ? JSON.parse(stored) : {};
        if (newIsLiked) {
          parsed[chapterId] = true;
        } else {
          delete parsed[chapterId];
        }
        localStorage.setItem(getLikeKey(), JSON.stringify(parsed));
        window.dispatchEvent(new Event('mangaflow_like_update'));
        
        await readerService.toggleChapterLike(chapterId);
      } catch (err) {}
    }
  }

  if (!chapter) return <div className={`min-h-screen ${bgColor === 'dark' ? 'bg-[#121212] text-white' : 'bg-[#fafafa] text-black'} flex items-center justify-center`}>Đang tải chương...</div>

  return (
    <div className={`min-h-screen relative font-sans ${bgColor === 'dark' ? 'bg-[#121212] text-gray-300' : 'bg-[#fafafa] text-manga-ink'}`}>
      {/* Top Navbar */}
      <div className={`fixed top-0 left-0 right-0 ${bgColor === 'dark' ? 'bg-[#1a1a1a] border-black' : 'bg-white border-manga-ink'} border-b-2 z-50 transition-transform duration-300 flex items-center justify-between px-4 h-16 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/series/${seriesId}`)} className={`p-2 rounded-full transition-colors ${bgColor === 'dark' ? 'hover:bg-black' : 'hover:bg-gray-200'}`}>
            <ArrowLeft className={`w-6 h-6 ${bgColor === 'dark' ? 'text-white' : 'text-black'}`} />
          </button>
          <div>
            <h1 className={`font-bold uppercase truncate max-w-[200px] sm:max-w-md ${bgColor === 'dark' ? 'text-white' : 'text-black'}`}>
              {chapter.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowChapterList(true)} className={`p-2 rounded-full transition-colors ${bgColor === 'dark' ? 'hover:bg-black text-white' : 'hover:bg-gray-200 text-black'}`}>
            <Menu className="w-6 h-6" />
          </button>
          <button onClick={() => setShowSettings(true)} className={`p-2 rounded-full transition-colors ${bgColor === 'dark' ? 'hover:bg-black text-white' : 'hover:bg-gray-200 text-black'}`}>
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Pages Container */}
      <div className={`max-w-[800px] mx-auto w-full pt-16 pb-24 cursor-pointer flex flex-col items-center ${readDirection === 'horizontal' ? 'h-screen justify-center' : 'min-h-[80vh]'}`} onClick={handlePageClick}>
        {readDirection === 'vertical' ? (
          <>
            {pages.map((page, index) => (
              <img 
                key={page.id} 
                src={page.imageUrl} 
                alt={`Page ${page.pageNumber}`}
                className={`block select-none ${bgColor === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-200'} min-h-[300px] ${imageWidth === 'full' ? 'w-full h-auto' : 'max-w-full h-auto'}`}
                loading={index < 3 ? "eager" : "lazy"}
              />
            ))}
            
            <div ref={bottomRef} className={`w-full p-12 text-center border-t-2 mt-8 ${bgColor === 'dark' ? 'border-[#333] bg-[#1a1a1a]' : 'border-gray-300 bg-white'}`}>
              <h3 className={`font-manga text-2xl uppercase mb-6 ${bgColor === 'dark' ? 'text-white' : 'text-black'}`}>Hết chương</h3>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={handlePrevChapter}
                  disabled={!hasPrev}
                  className={`px-6 py-3 border-2 font-bold uppercase transition-colors flex items-center gap-2 ${hasPrev ? (bgColor === 'dark' ? 'border-[#555] hover:bg-white hover:text-black cursor-pointer' : 'border-black hover:bg-black hover:text-white cursor-pointer') : 'border-gray-500 text-gray-500 opacity-50 cursor-not-allowed'}`}
                >
                  <ChevronLeft className="w-5 h-5" /> Chương trước
                </button>
                <button 
                  onClick={handleNextChapter}
                  disabled={!hasNext}
                  className={`px-6 py-3 border-2 font-bold uppercase transition-colors flex items-center gap-2 ${hasNext ? 'bg-manga-red text-white border-manga-red hover:bg-red-600 cursor-pointer' : 'bg-gray-700 text-gray-500 border-gray-700 cursor-not-allowed'}`}
                >
                  Chương sau <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          pages.length > 0 && (
            <div className="relative w-full h-[85vh] flex flex-col items-center justify-center">
              <img 
                src={pages[currentPageIndex]?.imageUrl} 
                alt={`Page ${pages[currentPageIndex]?.pageNumber}`} 
                className={`select-none max-h-full ${imageWidth === 'full' ? 'w-full object-contain' : 'max-w-full object-contain'}`} 
              />
              <div className="absolute bottom-4 right-4 bg-black text-white px-3 py-1 text-sm font-bold border-2 border-white shadow-[2px_2px_0px_#fff]">
                {currentPageIndex + 1} / {pages.length}
              </div>
            </div>
          )
        )}
      </div>

      {/* Bottom Navbar */}
      <div className={`fixed bottom-0 left-0 right-0 ${bgColor === 'dark' ? 'bg-[#1a1a1a] border-black' : 'bg-white border-manga-ink'} border-t-2 z-50 transition-transform duration-300 flex items-center justify-center px-4 h-16 ${showNav ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center gap-8 w-full max-w-[800px] justify-between">
          <button 
            onClick={handlePrevChapter}
            disabled={!hasPrev}
            className={`flex items-center gap-2 font-bold uppercase text-sm ${hasPrev ? (bgColor === 'dark' ? 'text-gray-400 hover:text-white cursor-pointer' : 'text-gray-600 hover:text-black cursor-pointer') : 'text-gray-500 cursor-not-allowed'}`}
          >
            <ChevronLeft className="w-5 h-5" /> Trước
          </button>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={handleChapterLike}
              className="text-gray-400 hover:text-white flex flex-col items-center gap-1 group"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-manga-red text-manga-red' : 'group-hover:text-manga-red'}`} />
              <span className={`text-[10px] uppercase font-bold ${isLiked ? 'text-manga-red' : ''}`}>{isLiked ? 'Đã theo dõi' : 'Theo dõi'}</span>
            </button>
            
            <button 
              onClick={() => setShowComments(true)}
              className={`flex flex-col items-center gap-1 group transition-colors ${bgColor === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold">Bình luận</span>
            </button>
          </div>
          
          <button 
            onClick={handleNextChapter}
            disabled={!hasNext}
            className={`flex items-center gap-2 font-bold uppercase text-sm ${hasNext ? (bgColor === 'dark' ? 'text-gray-400 hover:text-white cursor-pointer' : 'text-gray-600 hover:text-black cursor-pointer') : 'text-gray-500 cursor-not-allowed'}`}
          >
            Sau <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <ChapterCommentsPanel 
        isOpen={showComments} 
        onClose={() => setShowComments(false)} 
        chapterId={chapterId || ''} 
        chapterTitle={chapter ? `Chương ${chapter.chapterNumber}` : ''}
      />
      {/* Chapter List Modal */}
      {showChapterList && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowChapterList(false)}></div>
          <div className="relative w-96 max-w-full bg-[#1a1a1a] h-full flex flex-col border-l-2 border-black animate-slide-in-right">
            <div className="p-4 border-b-2 border-black flex justify-between items-center">
              <h2 className="font-manga text-xl text-white">Danh sách chương</h2>
              <button onClick={() => setShowChapterList(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {allChapters.map((c, index) => (
                <button
                  key={c.id}
                  onClick={() => {
                    navigate(`/series/${seriesId}/chapter/${c.id}`);
                    setShowChapterList(false);
                  }}
                  className={`flex flex-col text-left border-[3px] border-black p-3 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all group ${c.id === chapterId ? 'bg-manga-red text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] -translate-y-1 -translate-x-1' : 'bg-[#2a2a2a] text-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#333]'}`}
                >
                  <div className="flex items-center gap-2 mb-1 w-full">
                    <h4 className="font-manga text-sm font-bold uppercase truncate w-full">
                      CHƯƠNG {c.chapterNumber} - {c.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between w-full mt-2">
                    <p className={`text-[10px] font-bold ${c.id === chapterId ? 'text-white/80' : 'text-gray-500'}`}>
                      {index === 0 ? 'Hôm nay' : index === 1 ? '3 ngày trước' : '1 tuần trước'}
                    </p>
                    <div className="flex items-center gap-2">
                      {/* Badge */}
                      {c.id === chapterId && (
                        <div className="px-2 py-0.5 border-2 border-white text-white text-[10px] font-bold uppercase">
                          Đang đọc
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setShowSettings(false)}></div>
          <div className="relative w-full max-w-md z-10 flex flex-col mt-8">
            <div className="absolute -top-[34px] left-0 bg-black text-white px-6 py-2 font-manga text-xl font-bold uppercase z-10" style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0% 100%)', paddingRight: '2rem' }}>
              CÀI ĐẶT
            </div>
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute -top-[22px] -right-[10px] bg-manga-red text-white border-4 border-black p-2 hover:bg-red-700 transition-colors z-20 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
            
            <div className="bg-white border-[6px] border-black p-6 relative shadow-[12px_12px_0px_rgba(0,0,0,1)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase mb-3">Chiều đọc</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setReadDirection('vertical')}
                      className={`py-3 px-4 font-bold text-sm border-2 transition-all ${readDirection === 'vertical' ? 'bg-manga-red text-white border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] -translate-y-[2px]' : 'bg-gray-100 text-black border-transparent hover:border-black'}`}
                    >
                      Cuộn dọc
                    </button>
                    <button 
                      onClick={() => setReadDirection('horizontal')}
                      className={`py-3 px-4 font-bold text-sm border-2 transition-all ${readDirection === 'horizontal' ? 'bg-manga-red text-white border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] -translate-y-[2px]' : 'bg-gray-100 text-black border-transparent hover:border-black'}`}
                    >
                      Lật ngang
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase mb-3">Kích cỡ ảnh</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setImageWidth('full')}
                      className={`py-3 px-4 font-bold text-sm border-2 transition-all ${imageWidth === 'full' ? 'bg-manga-red text-white border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] -translate-y-[2px]' : 'bg-gray-100 text-black border-transparent hover:border-black'}`}
                    >
                      Vừa màn hình
                    </button>
                    <button 
                      onClick={() => setImageWidth('original')}
                      className={`py-3 px-4 font-bold text-sm border-2 transition-all ${imageWidth === 'original' ? 'bg-manga-red text-white border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] -translate-y-[2px]' : 'bg-gray-100 text-black border-transparent hover:border-black'}`}
                    >
                      Kích thước gốc
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase mb-3">Màu nền</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setBgColor('dark')}
                      className={`py-3 px-4 font-bold text-sm border-2 transition-all ${bgColor === 'dark' ? 'bg-[#1a1a1a] text-white border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] -translate-y-[2px]' : 'bg-gray-100 text-black border-transparent hover:border-black'}`}
                    >
                      Tối
                    </button>
                    <button 
                      onClick={() => setBgColor('light')}
                      className={`py-3 px-4 font-bold text-sm border-2 transition-all ${bgColor === 'light' ? 'bg-white text-black border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] -translate-y-[2px]' : 'bg-gray-100 text-black border-transparent hover:border-black'}`}
                    >
                      Sáng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
