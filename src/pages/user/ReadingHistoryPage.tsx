import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { readerService } from '@/services/reader.service'
import { ReadingHistoryItem } from '@/types/reader.types'

export default function ReadingHistoryPage() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('TẤT CẢ')
  const navigate = useNavigate()

  useEffect(() => {
    readerService.getReadingHistory().then(data => {
      setHistory(data)
      setLoading(false)
    })
  }, [])

  const tabs = ['TẤT CẢ', 'ĐANG ĐỌC', 'ĐÃ HOÀN THÀNH', 'YÊU THÍCH']

  // Split history into featured (first item) and the rest
  const featuredItem = history.length > 0 ? history[0] : null
  const recentItems = history.length > 1 ? history.slice(1) : []

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden dark:bg-zinc-900 transition-colors" style={{ backgroundImage: 'radial-gradient(#d1d5db 2px, transparent 2px)', backgroundSize: '32px 32px' }}>
      
      <div className="max-w-[1400px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Header & Tabs */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl md:text-5xl">📚</span>
              <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-black dark:text-white">
                LỊCH SỬ ĐỌC CỦA TÔI
              </h1>
            </div>
            
            {/* Custom bottom border resembling the mockup (partially styled) */}
            <div className="flex items-end h-[6px] mb-8">
              <div className="bg-black h-full w-48 mr-2 dark:bg-white"></div>
              <div className="bg-black h-full flex-1 dark:bg-white"></div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap border-[3px] border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] w-fit dark:bg-zinc-800 dark:border-black dark:shadow-[4px_4px_0px_#000]">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 font-bold uppercase transition-colors border-r-[3px] border-black last:border-r-0 dark:border-black ${
                    activeTab === tab 
                      ? 'bg-manga-red text-white' 
                      : 'bg-white text-black hover:bg-gray-100 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center font-bold uppercase animate-pulse text-gray-500">
              Đang tải lịch sử...
            </div>
          ) : history.length === 0 ? (
             <div className="bg-white border-[4px] border-black p-12 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:bg-zinc-800 dark:border-black dark:shadow-[8px_8px_0px_#000]">
              <h3 className="font-manga text-2xl font-bold uppercase mb-2 dark:text-white">Chưa có lịch sử đọc</h3>
              <p className="text-gray-500 font-bold mb-6 dark:text-gray-400">Bạn chưa đọc bộ truyện nào. Hãy khám phá ngay!</p>
              <Link to="/search" className="inline-block bg-manga-red text-white font-bold uppercase border-[3px] border-black px-8 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none">
                Khám phá truyện
              </Link>
            </div>
          ) : (
            <>
              {/* Featured Item (Continue Reading) */}
              {featuredItem && (
                <div className="bg-white border-[4px] border-black p-6 flex flex-col md:flex-row gap-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] animate-slide-up dark:bg-zinc-800 dark:border-black dark:shadow-[8px_8px_0px_#000]">
                  {/* Cover */}
                  <div className="w-full md:w-48 flex-shrink-0 relative" style={{ perspective: '1000px' }}>
                    <Link 
                      to={`/series/${featuredItem.seriesId}`} 
                      className="relative block transition-transform duration-500 ease-out"
                      style={{ 
                        transformStyle: 'preserve-3d',
                        transform: 'rotateY(15deg) rotateX(5deg)',
                        boxShadow: '-10px 15px 15px rgba(0,0,0,0.3)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(15deg) rotateX(5deg)'}
                    >
                      {/* Book Spine */}
                      <div 
                        className="absolute top-0 left-0 bottom-0 w-4 bg-[#e0e0e0] border-y-[3px] border-l-[3px] border-black flex items-center justify-center overflow-hidden dark:bg-zinc-700 dark:border-black"
                        style={{
                          transformOrigin: 'left center',
                          transform: 'rotateY(-90deg) translateX(-100%)'
                        }}
                      >
                        <span className="text-[8px] font-bold text-gray-500 -rotate-90 whitespace-nowrap dark:text-gray-300">MANGAFLOW</span>
                      </div>
                      
                      {/* Front Cover */}
                      <img 
                        src={featuredItem.seriesCoverUrl || ''} 
                        alt={featuredItem.seriesTitle} 
                        className="w-full aspect-[2/3] object-cover border-[3px] border-black relative z-10 bg-white dark:border-black" 
                        style={{ transform: 'translateZ(1px)' }}
                      />
                    </Link>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-1 justify-center">
                    <div className="bg-black text-white px-3 py-1 text-xs font-bold uppercase w-fit mb-3 border-[2px] border-black dark:bg-white dark:text-black dark:border-black">
                      Tiếp tục đọc
                    </div>
                    <Link to={`/series/${featuredItem.seriesId}`}>
                      <h2 className="font-manga text-3xl md:text-4xl font-bold uppercase text-black leading-tight hover:text-manga-red transition-colors line-clamp-2 dark:text-white dark:hover:text-manga-red">
                        {featuredItem.seriesTitle}
                      </h2>
                    </Link>
                    <p className="text-gray-600 font-bold mt-2 uppercase dark:text-gray-400">
                      Chương {featuredItem.lastChapterNumber} - {featuredItem.lastChapterTitle}
                    </p>

                    <div className="mt-8 mb-6">
                      <div className="flex justify-between text-sm font-bold uppercase mb-2 dark:text-gray-300">
                        <span>Tiến độ</span>
                        <span className="text-manga-red">Trang {featuredItem.lastPageNumber}/{featuredItem.totalPages}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 border-[2px] border-black dark:bg-zinc-700 dark:border-black">
                        <div className="h-full bg-manga-red border-r-[2px] border-black" style={{ width: `${featuredItem.progressPercent}%` }}></div>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/series/${featuredItem.seriesId}/chapter/${featuredItem.lastChapterId}`)}
                      className="bg-manga-red text-white font-bold uppercase text-lg px-6 py-3 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all w-fit flex items-center gap-2 dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none"
                    >
                      Tiếp tục đọc <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Recently Read Grid */}
              {recentItems.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-manga text-2xl font-bold uppercase border-b-[4px] border-black pb-2 mb-6 w-fit pr-8 dark:text-white dark:border-white">
                    Đã đọc gần đây
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {recentItems.map((item, idx) => (
                      <div key={`${item.seriesId}-${item.lastChapterId}`} className="bg-white border-[4px] border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col h-full animate-slide-up dark:bg-zinc-800 dark:border-black dark:shadow-[6px_6px_0px_#000]" style={{ animationDelay: `${(idx + 1) * 0.1}s` }}>
                        <div className="relative aspect-[2/3] p-4 pb-0 flex justify-center" style={{ perspective: '800px' }}>
                          <Link 
                            to={`/series/${item.seriesId}`} 
                            className="relative block w-[85%] transition-transform duration-500 ease-out"
                            style={{ 
                              transformStyle: 'preserve-3d',
                              transform: 'rotateY(15deg) rotateX(5deg)',
                              boxShadow: '-8px 12px 10px rgba(0,0,0,0.2)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(15deg) rotateX(5deg)'}
                          >
                            {/* Book Spine */}
                            <div 
                              className="absolute top-0 left-0 bottom-0 w-3 bg-[#e0e0e0] border-y-[2px] border-l-[2px] border-black flex items-center justify-center overflow-hidden dark:bg-zinc-700 dark:border-black"
                              style={{
                                transformOrigin: 'left center',
                                transform: 'rotateY(-90deg) translateX(-100%)'
                              }}
                            ></div>
                            <img 
                              src={item.seriesCoverUrl || ''} 
                              alt={item.seriesTitle} 
                              className="w-full h-full object-cover border-[3px] border-black relative z-10 bg-white dark:border-black" 
                              style={{ transform: 'translateZ(1px)' }}
                            />
                            <div className="absolute top-0 left-0 bg-manga-red text-white text-[10px] font-bold uppercase px-2 py-1 border-r-[2px] border-b-[2px] border-black z-20 dark:border-black" style={{ transform: 'translateZ(2px)' }}>
                              {item.isCompleted ? `Hoàn thành` : `Ch.${item.lastChapterNumber} - Tr.${item.lastPageNumber}`}
                            </div>
                          </Link>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-manga text-xl font-bold uppercase line-clamp-1 dark:text-white">{item.seriesTitle}</h3>
                          <p className="text-gray-500 font-bold text-sm uppercase mt-1 mb-4 dark:text-gray-400">{item.seriesGenre}</p>
                          
                          <div className="w-full h-1 bg-gray-200 border border-black mb-4 mt-auto dark:bg-zinc-700 dark:border-black">
                            <div className="h-full bg-manga-red" style={{ width: `${item.progressPercent}%` }}></div>
                          </div>

                          <button 
                            onClick={() => navigate(`/series/${item.seriesId}/chapter/${item.lastChapterId}`)}
                            className="w-full bg-black text-white font-bold uppercase py-2 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2 dark:bg-white dark:text-black dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-none"
                          >
                            {item.isCompleted ? 'Đọc lại' : 'Đọc tiếp'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* New Chapters Box */}
          <div className="border-[4px] border-black bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)] animate-slide-up dark:bg-zinc-800 dark:border-black dark:shadow-[8px_8px_0px_#000]" style={{ animationDelay: '0.4s' }}>
            <div className="bg-black text-white font-manga text-xl font-bold uppercase p-4 flex items-center gap-2 dark:bg-white dark:text-black">
              <RotateCcw className="w-6 h-6" /> Sắp có chương mới
            </div>
            <div className="flex flex-col">
              {[
                { title: 'Neon Samurai', date: 'NGÀY MAI', chapter: 'Chương 43', img: 'https://fakeimg.pl/100x150/282828/eae0d0/?text=NS' },
                { title: 'Whispers of Mana', date: 'THỨ 6, 24/10', chapter: 'Chương 89', img: 'https://fakeimg.pl/100x150/282828/eae0d0/?text=WM' }
              ].map((update, idx) => (
                <div key={idx} className="flex gap-4 p-4 border-b-[3px] border-black last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer dark:border-black dark:hover:bg-zinc-700">
                  <div className="w-16 h-16 border-[2px] border-black overflow-hidden shrink-0 dark:border-black">
                    <img src={update.img} alt={update.title} className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-manga-red font-bold text-xs uppercase mb-1">{update.date}</p>
                    <h4 className="font-manga font-bold uppercase leading-tight line-clamp-1 dark:text-white">{update.title}</h4>
                    <p className="text-gray-600 font-bold text-sm dark:text-gray-400">{update.chapter}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Box */}
          <div className="border-[4px] border-black bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 animate-slide-up dark:bg-zinc-800 dark:border-black dark:shadow-[8px_8px_0px_#000] dark:text-white" style={{ animationDelay: '0.5s' }}>
            <h3 className="font-manga text-xl font-bold uppercase mb-4 text-center">Thống kê đọc (Tuần này)</h3>
            
            <div className="flex gap-4">
              <div className="flex-1 border-[4px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 flex flex-col items-center justify-center bg-white hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all dark:bg-zinc-700 dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-[8px_8px_0px_#000]">
                <span className="font-manga text-5xl font-bold text-manga-red">42</span>
                <span className="font-bold text-[10px] uppercase text-gray-500 mt-2 text-center dark:text-gray-300">Chương đã đọc</span>
              </div>
              <div className="flex-1 border-[4px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 flex flex-col items-center justify-center bg-white hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all dark:bg-zinc-700 dark:border-black dark:shadow-[4px_4px_0px_#000] dark:hover:shadow-[8px_8px_0px_#000]">
                <span className="font-manga text-5xl font-bold text-black dark:text-white">12</span>
                <span className="font-bold text-[10px] uppercase text-gray-500 mt-2 text-center dark:text-gray-300">Giờ đọc</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Global styles for slide-up animation if not already defined */}
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          opacity: 0;
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}
