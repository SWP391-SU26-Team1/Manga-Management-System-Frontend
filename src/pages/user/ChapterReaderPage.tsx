import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Menu, Settings, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { readerService } from '@/services/reader.service'
import { MangaPage, PublishedChapter } from '@/types/reader.types'
import ChapterCommentsPanel from '@/components/user/ChapterCommentsPanel'

export default function ChapterReaderPage() {
  const { seriesId, chapterId } = useParams()
  const navigate = useNavigate()
  
  const [pages, setPages] = useState<MangaPage[]>([])
  const [chapter, setChapter] = useState<PublishedChapter | null>(null)
  const [allChapters, setAllChapters] = useState<PublishedChapter[]>([])
  const [showNav, setShowNav] = useState(true)
  const [showComments, setShowComments] = useState(false)
  
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chapterId && seriesId) {
      readerService.getChapterPages(chapterId).then(setPages)
      readerService.getPublishedChapters(seriesId).then(chapters => {
        setAllChapters(chapters)
        const current = chapters.find(c => c.id === chapterId)
        if (current) setChapter(current)
      })
      readerService.logView(seriesId, chapterId)
    }
  }, [chapterId, seriesId])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && chapterId && seriesId) {
        readerService.saveReadingProgress({ series_id: seriesId, chapter_id: chapterId, page_number: 1 });
      }
    }, { threshold: 0.1 });

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, [chapterId, seriesId, pages.length]);

  const currentChapterIndex = allChapters.findIndex(c => c.id === chapterId)
  
  // Array is descending (newest first). 
  // Next chapter (newer) has a smaller index.
  // Prev chapter (older) has a larger index.
  const hasPrev = currentChapterIndex < allChapters.length - 1
  const hasNext = currentChapterIndex > 0

  const handlePrevChapter = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasPrev) {
      navigate(`/series/${seriesId}/chapter/${allChapters[currentChapterIndex + 1].id}`)
    }
  }

  const handleNextChapter = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasNext) {
      navigate(`/series/${seriesId}/chapter/${allChapters[currentChapterIndex - 1].id}`)
    }
  }

  // Toggle nav bars on click
  const handleViewClick = () => {
    setShowNav(!showNav)
  }

  if (!chapter) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">Đang tải chương...</div>

  return (
    <div className="min-h-screen bg-[#121212] relative font-sans text-gray-300">
      {/* Top Navbar */}
      <div className={`fixed top-0 left-0 right-0 bg-[#1a1a1a] border-b-2 border-black z-50 transition-transform duration-300 flex items-center justify-between px-4 h-16 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/series/${seriesId}`)} className="p-2 hover:bg-black rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="font-bold text-white uppercase truncate max-w-[200px] sm:max-w-md">
              {chapter.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-black rounded-full text-white">
            <Menu className="w-6 h-6" />
          </button>
          <button className="p-2 hover:bg-black rounded-full text-white">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Pages Container */}
      <div className="max-w-[800px] mx-auto w-full pt-16 pb-24 cursor-pointer" onClick={handleViewClick}>
        <div className="flex flex-col items-center min-h-[80vh]">
          {pages.map((page, index) => (
            <img 
              key={page.id} 
              src={page.imageUrl} 
              alt={`Page ${page.pageNumber}`}
              className="w-full h-auto block select-none bg-[#2a2a2a] min-h-[300px]"
              loading={index < 3 ? "eager" : "lazy"}
            />
          ))}
          
          <div ref={bottomRef} className="w-full p-12 text-center border-t-2 border-[#333] mt-8 bg-[#1a1a1a]">
            <h3 className="font-manga text-2xl text-white uppercase mb-6">Hết chương</h3>
            <div className="flex justify-center gap-4">
              <button 
                onClick={handlePrevChapter}
                disabled={!hasPrev}
                className={`px-6 py-3 border-2 border-[#555] font-bold uppercase transition-colors flex items-center gap-2 ${hasPrev ? 'hover:bg-white hover:text-black cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
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
        </div>
      </div>

      {/* Bottom Navbar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t-2 border-black z-50 transition-transform duration-300 flex items-center justify-center px-4 h-16 ${showNav ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center gap-8 w-full max-w-[800px] justify-between">
          <button 
            onClick={handlePrevChapter}
            disabled={!hasPrev}
            className={`flex items-center gap-2 font-bold uppercase text-sm ${hasPrev ? 'text-gray-400 hover:text-white cursor-pointer' : 'text-gray-600 cursor-not-allowed'}`}
          >
            <ChevronLeft className="w-5 h-5" /> Trước
          </button>
          
          <button 
            onClick={() => setShowComments(true)}
            className="text-gray-400 hover:text-white flex flex-col items-center gap-1 group"
          >
            <MessageCircle className="w-5 h-5 group-hover:text-manga-red" />
            <span className="text-[10px] uppercase font-bold">Bình luận</span>
          </button>
          
          <button 
            onClick={handleNextChapter}
            disabled={!hasNext}
            className={`flex items-center gap-2 font-bold uppercase text-sm ${hasNext ? 'text-gray-400 hover:text-white cursor-pointer' : 'text-gray-600 cursor-not-allowed'}`}
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
    </div>
  )
}
