import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Star, Heart, Award } from 'lucide-react'
import { readerService } from '@/services/reader.service'
import { SeriesDetail, PublishedChapter } from '@/types/reader.types'

export default function SeriesDetailPage() {
  const { seriesId } = useParams()
  const [series, setSeries] = useState<SeriesDetail | null>(null)
  const [chapters, setChapters] = useState<PublishedChapter[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'chapters' | 'comments'>('chapters')
  const [lastReadChapterId, setLastReadChapterId] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(1205)

  const handleFollow = () => {
    const userStr = localStorage.getItem('mangaflow_user');
    if (!userStr) {
      alert('Vui lòng đăng nhập để theo dõi truyện!');
      return;
    }
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
    } else {
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
    }
  }

  useEffect(() => {
    if (seriesId) {
      readerService.getSeriesDetail(seriesId).then(setSeries)
      readerService.getPublishedChapters(seriesId).then(setChapters)
      readerService.getSeriesComments(seriesId).then(setComments)
      readerService.getReadingHistory().then(history => {
        const bookmark = history.find(h => h.seriesId === seriesId)
        if (bookmark && bookmark.lastChapterId) {
          setLastReadChapterId(bookmark.lastChapterId)
        }
      })
    }
  }, [seriesId])

  if (!series) return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#F5F5F5] dark:bg-zinc-900 transition-colors">
      <div className="font-manga text-2xl animate-pulse text-manga-ink uppercase dark:text-white">Đang tải dữ liệu...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8 relative dark:bg-zinc-900 transition-colors"
         style={{ backgroundImage: 'radial-gradient(#d1d5db 2px, transparent 2px)', backgroundSize: '32px 32px' }}>
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Top Banner (Hero) */}
        <div className="bg-white border-[4px] border-black mb-8 relative overflow-hidden dark:bg-zinc-800 dark:border-black">
          {/* Subtle Blurred Background */}
          <div 
            className="absolute inset-0 opacity-10 bg-cover bg-center filter blur-xl"
            style={{ backgroundImage: `url(${series.coverImageUrl})` }}
          />

          <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-8 lg:gap-16 items-center md:items-start z-10">
            
            {/* Slanted Cover Image (Cuốn truyện) */}
            <div className="w-[200px] md:w-[240px] flex-shrink-0 relative" style={{ perspective: '1000px' }}>
              <div 
                className="relative transition-transform duration-500 ease-out"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: 'rotateY(15deg) rotateX(5deg)',
                  boxShadow: '-15px 20px 15px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(15deg) rotateX(5deg)'}
              >
                {/* Book Spine (Gáy sách) */}
                <div 
                  className="absolute top-0 left-0 bottom-0 w-6 bg-[#e0e0e0] border-y-[3px] border-l-[3px] border-black flex items-center justify-center overflow-hidden dark:bg-zinc-700 dark:border-black"
                  style={{
                    transformOrigin: 'left center',
                    transform: 'rotateY(-90deg) translateX(-100%)'
                  }}
                >
                  <span className="text-[10px] font-bold text-gray-500 -rotate-90 whitespace-nowrap dark:text-gray-300">MANGAFLOW</span>
                </div>
                
                {/* Front Cover */}
                <img 
                  src={series.coverImageUrl || ''} 
                  alt={series.title} 
                  className="w-full h-auto aspect-[3/4] object-cover border-[3px] border-black relative z-10 bg-white dark:border-black" 
                  style={{ transform: 'translateZ(1px)' }}
                />
              </div>
            </div>

            {/* Series Info */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-manga-red text-white font-bold uppercase px-2 py-0.5 text-xs border-2 border-manga-red">
                  {series.status === 'PUBLISHING' ? 'Đang xuất bản' : 'Hoàn thành'}
                </span>
                <span className="font-bold text-gray-700 uppercase tracking-widest text-xs dark:text-gray-300">
                  {series.genres.slice(0, 2).join(' / ')}
                </span>
              </div>

              <h1 className="font-manga text-5xl md:text-6xl font-bold uppercase text-black mb-2 leading-none dark:text-white">
                {series.title}
              </h1>
              
              <div className="flex flex-col gap-1 mb-6">
                <p className="font-bold text-gray-700 text-lg dark:text-gray-300">
                  Tác giả: {series.authorName}
                </p>
                {series.editorName && (
                  <p className="font-bold text-gray-700 text-lg dark:text-gray-300">
                    Biên tập viên: {series.editorName}
                  </p>
                )}
              </div>

              <div className="border-t-2 border-gray-300 w-full mb-6 dark:border-zinc-700"></div>

              <div className="flex flex-wrap gap-8 mb-8">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 dark:text-gray-400">Chương</p>
                  <p className="font-manga text-3xl font-bold dark:text-white">{series.totalChapters}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 dark:text-gray-400">Lượt đọc</p>
                  <p className="font-manga text-3xl font-bold dark:text-white">
                    {series.viewCount < 1000 
                      ? series.viewCount 
                      : `${Math.floor(series.viewCount / 1000)}K${Math.floor((series.viewCount % 1000) / 100) > 0 ? Math.floor((series.viewCount % 1000) / 100) : ''}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 dark:text-gray-400">Đánh giá</p>
                  <p className="font-manga text-3xl font-bold flex items-center dark:text-white">
                    {series.rating.toFixed(1)} <Star className="w-5 h-5 fill-manga-red text-manga-red ml-1 -mt-1" />
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 dark:text-gray-400">Theo dõi</p>
                  <p className="font-manga text-3xl font-bold dark:text-white">
                    {followerCount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link 
                  to={`/series/${series.id}/chapter/${chapters.length > 0 ? chapters[chapters.length - 1].id : ''}`}
                  className="bg-manga-red text-white font-bold uppercase text-lg px-8 py-3 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all dark:border-black dark:shadow-[4px_4px_0px_#000]"
                >
                  ĐỌC TỪ ĐẦU
                </Link>
                <Link 
                  to={`/series/${series.id}/chapter/${lastReadChapterId ? lastReadChapterId : (chapters.length > 0 ? chapters[chapters.length - 1].id : '')}`}
                  className="bg-black text-white font-bold uppercase text-lg px-8 py-3 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all dark:bg-white dark:text-black dark:border-black dark:shadow-[4px_4px_0px_#000]"
                >
                  ĐỌC TIẾP
                </Link>
                <button 
                  onClick={handleFollow}
                  className={`${isFollowing ? 'bg-manga-red text-white border-manga-red' : 'bg-white text-black border-black dark:bg-zinc-800 dark:text-white'} font-bold uppercase text-lg px-6 py-3 border-[3px] shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex items-center gap-2 dark:shadow-[4px_4px_0px_#000]`}
                >
                  <Heart className={`w-5 h-5 ${isFollowing ? 'fill-white' : ''}`} /> 
                  {isFollowing ? 'ĐANG THEO DÕI' : 'THEO DÕI'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Layout: 2 Columns */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Chapters / Tabs */}
          <div className="lg:w-2/3">
            {/* Tabs */}
            <div className="flex border-b-[3px] border-black mb-6">
              <button 
                onClick={() => setActiveTab('info')}
                className={`px-6 py-3 font-manga text-xl font-bold uppercase transition-colors ${activeTab === 'info' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'}`}
              >
                Giới thiệu
              </button>
              <button 
                onClick={() => setActiveTab('chapters')}
                className={`px-6 py-3 font-manga text-xl font-bold uppercase transition-colors ${activeTab === 'chapters' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'}`}
              >
                Danh sách chương
              </button>
              <button 
                onClick={() => setActiveTab('comments')}
                className={`px-6 py-3 font-manga text-xl font-bold uppercase transition-colors ${activeTab === 'comments' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'}`}
              >
                Bình luận
              </button>
            </div>

            {/* Tab Content: Chapters */}
            {activeTab === 'chapters' && (
              <div className="space-y-4">
                {chapters.map((chapter, index) => (
                  <Link 
                    key={chapter.id}
                    to={`/series/${series.id}/chapter/${chapter.id}`}
                    className="flex items-center gap-4 bg-white border-[3px] border-black p-4 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all group dark:bg-zinc-800 dark:border-black dark:shadow-[4px_4px_0px_#000]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-manga text-xl font-bold uppercase text-black truncate dark:text-white">
                          CHƯƠNG {chapter.chapterNumber} - {chapter.title}
                        </h4>
                        {chapter.isNew && (
                          <span className="bg-manga-red text-white text-[10px] font-bold px-1.5 py-0.5 uppercase">Mới</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate dark:text-gray-400">Khởi đầu của sự kết thúc</p>
                      <p className="text-xs text-gray-400 font-bold mt-1">
                        {index === 0 ? 'Hôm nay' : index === 1 ? '3 ngày trước' : '1 tuần trước'}
                      </p>
                    </div>

                    {/* Read Status Badge */}
                    {lastReadChapterId && chapters.findIndex(c => c.id === lastReadChapterId) !== -1 && index >= chapters.findIndex(c => c.id === lastReadChapterId) && (
                      <div className="hidden sm:block px-3 py-1 border-[2px] border-green-500 text-green-500 text-xs font-bold uppercase mr-2">
                        Đã đọc
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="bg-white border-[3px] border-black p-6 font-bold dark:bg-zinc-800 dark:border-black dark:text-white">
                Mô tả chi tiết về series sẽ hiển thị ở đây.
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div key={index} className="bg-white border-[3px] border-black p-4 dark:bg-zinc-800 dark:border-black">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-manga-red overflow-hidden dark:border-manga-red flex-shrink-0">
                          {comment.user?.avatar_url ? (
                            <img src={comment.user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-manga-red flex items-center justify-center text-white font-bold text-xs uppercase">
                              {(comment.user?.name || comment.user?.username || 'U')[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm dark:text-white">{comment.user?.name || comment.user?.username || 'Người dùng ẩn danh'}</p>
                            {comment.chapter?.chapter_number && (
                              <span className="bg-manga-red text-white text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-sm shadow-[2px_2px_0px_#000]">
                                Chương {comment.chapter.chapter_number}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase dark:text-gray-400 mt-0.5">
                            {comment.created_at ? new Date(comment.created_at).toLocaleString('vi-VN') : 'Vừa xong'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border-[3px] border-black p-6 font-bold text-gray-500 text-center dark:bg-zinc-800 dark:border-black dark:text-gray-400">
                    Chưa có bình luận nào.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: About Series & Support */}
          <div className="lg:w-1/3 space-y-6">
            
            {/* Box 1: Về Series Này */}
            <div className="bg-white border-[4px] border-black p-6 dark:bg-zinc-800 dark:border-black">
              <h3 className="font-manga text-2xl font-bold uppercase mb-4 dark:text-white">Về Series Này</h3>
              <p className="text-sm font-bold text-gray-700 leading-relaxed mb-6 dark:text-gray-300">
                {series.description || 'Trong một tương lai dystopian, nơi công nghệ sinh học và tội phạm mạng đan xen, một cựu cảnh sát đã được cấy ghép máy móc buộc phải trở lại thế giới ngầm để tìm kiếm em gái mất tích. Cuộc hành trình đầy máu và neon bắt đầu.'}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {series.genres.map(g => (
                  <span key={g} className="px-2 py-1 border-[2px] border-black text-xs font-bold uppercase bg-gray-50 dark:bg-zinc-700 dark:text-white dark:border-black">
                    {g}
                  </span>
                ))}
              </div>

              <div className="border-t-[2px] border-dashed border-gray-300 mb-4 dark:border-zinc-600"></div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1 dark:text-gray-400">Họa sĩ</p>
                  <p className="font-bold text-black dark:text-white">{series.authorName || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1 dark:text-gray-400">Editor</p>
                  <p className="font-bold text-black dark:text-white">{series.editorName || 'Chưa cập nhật'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1 dark:text-gray-400">Phát hành</p>
                  <p className="font-bold text-black dark:text-white">Thứ 3 hàng tuần</p>
                </div>
              </div>
            </div>

            {/* Box 2: Ủng hộ tác giả */}
            <div className="bg-manga-ink border-[4px] border-black p-8 text-center text-white dark:bg-zinc-950 dark:border-black">
              <Award className="w-12 h-12 text-manga-red mx-auto mb-4" />
              <h3 className="font-manga text-3xl font-bold uppercase mb-2">Ủng Hộ Tác Giả</h3>
              <p className="text-sm font-bold text-gray-400 mb-6 px-4">
                Mở khóa chương sớm và đọc không quảng cáo với gói Premium.
              </p>
              <button className="w-full bg-manga-red text-white font-bold uppercase py-3 border-[2px] border-manga-red hover:bg-white hover:text-manga-red transition-colors tracking-widest">
                NÂNG CẤP NGAY
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
