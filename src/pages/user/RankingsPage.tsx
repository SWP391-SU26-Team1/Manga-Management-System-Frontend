import React, { useState, useEffect } from 'react'
import { Trophy, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, BookOpen, Eye, Users } from 'lucide-react'
import { Link } from 'react-router'
import { rankingService, BackendSeriesRanking } from '@/services/ranking.service'

export default function RankingsPage() {
  const [rankingType, setRankingType] = useState<'view' | 'like'>('view')
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  
  const [rankings, setRankings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true)
      try {
        // Fetch periods to get the correct periodId
        const periods = await rankingService.getRankingPeriods()
        
        let targetPeriodId: string | undefined = undefined;
        if (periods && periods.length > 0) {
          // Find period by period_type ('week', 'month') or just the latest one
          const matched = periods.find(p => 
             p.period_type === period || 
             (period === 'week' && p.name.toLowerCase().includes('tuần')) ||
             (period === 'month' && p.name.toLowerCase().includes('tháng'))
          );
          if (matched) {
            targetPeriodId = matched.period_id;
          } else {
            // Fallback to the first period if not found
            targetPeriodId = periods[0].period_id;
          }
        }

        let data: BackendSeriesRanking[] = []
        data = await rankingService.getTopSeries(50, targetPeriodId)
        
        const sortedData = [...data].sort((a, b) => {
          if (rankingType === 'view') {
            return (b.series?.view_count || 0) - (a.series?.view_count || 0)
          }
          return (b.total_vote || 0) - (a.total_vote || 0)
        })

        const formatted = sortedData.map((item, index) => ({
          rankPosition: index + 1,
          previousRank: index + 1,
          trendDirection: 'same',
          trendChange: 0,
          seriesId: item.series_id,
          title: item.series?.title || 'Chưa rõ tên truyện',
          coverImageUrl: item.series?.cover_image_url || `https://i.pravatar.cc/300?u=rank_${item.series_id}`,
          genre: item.series?.genre || 'N/A',
          authorName: 'Đang cập nhật',
          score: rankingType === 'view' ? (item.series?.view_count || 0).toString() : (item.total_vote || 0).toString(),
          totalVotes: item.total_vote || 0,
          viewCount: item.series?.view_count || 0,
          totalChapters: 0
        }))
        setRankings(formatted)
      } catch (error) {
        console.error('Failed to fetch rankings', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRankings()
  }, [rankingType, period])

  const top3 = rankings.slice(0, 3)
  const top4to10 = rankings.slice(3)

  return (
    <div className="bg-gray-100 min-h-screen pb-12 font-sans">
      {/* Banner */}
      <div className="w-[95%] max-w-[1600px] mx-auto pt-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1e1e1e] border-[8px] border-[#111] p-12 text-center relative shadow-[8px_8px_0px_#000]">
          <Trophy className="w-12 h-12 mx-auto text-manga-red fill-manga-red mb-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
          <h1 className="font-manga text-5xl md:text-7xl font-bold uppercase text-white mb-4 drop-shadow-[4px_4px_0px_#000]">
            BẢNG XẾP HẠNG MANGAFLOW
          </h1>
          <div className="w-16 h-1 bg-manga-red mx-auto mb-4"></div>
          <p className="text-gray-300 font-bold max-w-2xl mx-auto">
            Cập nhật liên tục những tác phẩm xuất sắc nhất dựa trên lượt đọc, đánh giá và tương tác từ cộng đồng.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-[95%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column (Main Rankings) - 70% */}
        <div className="lg:w-[70%]">
          
          {/* Filter Bar: Side by side */}
          <div className="flex flex-col md:flex-row gap-6 mb-12">
            {/* Ranking Type Toggle */}
            <div className="flex w-full md:w-1/2 bg-white border-4 border-black shadow-[4px_4px_0px_#000]">
              <button 
                onClick={() => setRankingType('view')}
                className={`flex-1 py-3 font-bold uppercase text-sm md:text-base transition-colors border-r-4 border-black ${rankingType === 'view' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              >
                Ranking theo View
              </button>
              <button 
                onClick={() => setRankingType('like')}
                className={`flex-1 py-3 font-bold uppercase text-sm md:text-base transition-colors ${rankingType === 'like' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              >
                Ranking theo Like
              </button>
            </div>

            {/* Time Period Tabs */}
            <div className="flex w-full md:w-1/2 border-4 border-black shadow-[4px_4px_0px_#000]">
              <button 
                onClick={() => setPeriod('week')}
                className={`flex-1 py-3 font-bold uppercase text-sm md:text-base transition-colors border-r-4 border-black ${period === 'week' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-black hover:bg-gray-100'}`}
              >
                TOP TUẦN
              </button>
              <button 
                onClick={() => setPeriod('month')}
                className={`flex-1 py-3 font-bold uppercase text-sm md:text-base transition-colors ${period === 'month' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-black hover:bg-gray-100'}`}
              >
                TOP THÁNG
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center font-bold text-xl uppercase tracking-widest text-gray-500 animate-pulse">
              ĐANG TẢI DỮ LIỆU...
            </div>
          ) : rankings.length === 0 ? (
            <div className="py-20 text-center font-bold text-xl uppercase tracking-widest text-gray-500">
              CHƯA CÓ BẢNG XẾP HẠNG NÀO
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              <div className="flex flex-col md:flex-row items-end justify-center gap-4 mt-28 mb-16 px-4">
                {/* Rank 2 */}
                {top3[1] && (
                  <div className="order-2 md:order-1 w-full md:w-[32%] flex flex-col items-center">
                    <div className="font-manga text-6xl font-bold mb-2">2</div>
                    <div className="bg-white border-2 border-gray-400 p-2 w-full shadow-[4px_4px_0px_#a3a3a3] relative transform hover:-translate-y-2 transition-transform">
                      <div className="bg-gray-100 text-center font-black uppercase text-sm py-1 mb-2 border-b border-gray-200">
                        BẢNG XẾP HẠNG
                      </div>
                      <Link to={`/series/${top3[1].seriesId}`}>
                        <div className="aspect-[3/4] overflow-hidden mb-3 border border-gray-200">
                          <img src={top3[1].coverImageUrl} alt={top3[1].title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                        </div>
                        <h3 className="font-bold text-center uppercase text-base truncate px-2 hover:text-manga-red">{top3[1].title}</h3>
                      </Link>
                      <div className="text-manga-red font-bold text-center mt-1">~ {top3[1].score}{rankingType === 'view' ? ' LƯỢT ĐỌC' : ' THEO DÕI'}</div>
                    </div>
                  </div>
                )}
                
                {/* Rank 1 */}
                {top3[0] && (
                  <div className="order-1 md:order-2 w-full md:w-[40%] flex flex-col items-center relative z-10 mb-8 md:mb-0">
                    <div className="absolute -top-16 text-yellow-400">
                      <Trophy className="w-12 h-12 fill-yellow-400 drop-shadow-[2px_2px_0px_#000]" />
                    </div>
                    <div className="bg-yellow-400 border-4 border-black text-black font-manga text-7xl font-bold px-6 py-2 shadow-[4px_4px_0px_#000] -mb-6 z-20 relative">
                      1
                    </div>
                    <div className="bg-white border-4 border-yellow-400 p-3 w-full shadow-[8px_8px_0px_rgba(250,204,21,1)] relative transform hover:-translate-y-2 transition-transform">
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 border border-black z-10">HOT</div>
                      <div className="bg-gray-100 text-center font-black uppercase text-xl py-2 mb-2 border-b-2 border-gray-200 tracking-wider">
                        BẢNG XẾP HẠNG
                      </div>
                      <Link to={`/series/${top3[0].seriesId}`}>
                        <div className="aspect-[3/4] overflow-hidden mb-3 border-2 border-black relative">
                          <img src={top3[0].coverImageUrl} alt={top3[0].title} className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[10px] font-bold py-1 px-2 flex justify-between items-center">
                            <span className="truncate">{top3[0].title}</span>
                            <span className="text-manga-red flex-shrink-0 ml-2">RANK 1</span>
                          </div>
                        </div>
                        <h3 className="font-manga text-xl text-center uppercase font-bold truncate px-2 mb-2 hover:text-manga-red">{top3[0].title}</h3>
                      </Link>
                      <div className="bg-manga-red text-white font-bold text-center py-2 text-lg border-2 border-black">
                        <Trophy className="w-4 h-4 inline-block mr-1 -mt-1" /> {top3[0].score}{rankingType === 'view' ? ' LƯỢT ĐỌC' : ' THEO DÕI'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rank 3 */}
                {top3[2] && (
                  <div className="order-3 md:order-3 w-full md:w-[28%] flex flex-col items-center">
                    <div className="font-manga text-5xl font-bold mb-2">3</div>
                    <div className="bg-white border-2 border-[#cd7f32] p-2 w-[95%] shadow-[4px_4px_0px_#cd7f32] relative transform hover:-translate-y-2 transition-transform">
                      <div className="bg-gray-100 text-center font-black uppercase text-xs py-1 mb-2 border-b border-gray-200">
                        BẢNG XẾP HẠNG
                      </div>
                      <Link to={`/series/${top3[2].seriesId}`}>
                        <div className="aspect-[3/4] overflow-hidden mb-3 border border-gray-200">
                          <img src={top3[2].coverImageUrl} alt={top3[2].title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                        </div>
                        <h3 className="font-bold text-center uppercase text-sm truncate px-2 hover:text-manga-red">{top3[2].title}</h3>
                      </Link>
                      <div className="text-manga-red font-bold text-center mt-1 text-sm">~ {top3[2].score}{rankingType === 'view' ? ' LƯỢT ĐỌC' : ' THEO DÕI'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Top 4 - 10 List */}
              {top4to10.length > 0 && (
                <div className="bg-gray-200 border-4 border-black p-1 shadow-[4px_4px_0px_#000]">
                  <div className="bg-gray-300 px-4 py-2 border-b-4 border-black font-black uppercase tracking-widest text-lg">
                    TOP 4 - {rankings.length}
                  </div>
                  <div className="bg-white divide-y-2 divide-gray-200">
                    {top4to10.map((item) => (
                      <Link to={`/series/${item.seriesId}`} key={item.seriesId} className="flex items-center p-4 hover:bg-gray-50 transition-colors group">
                        <div className="w-12 font-manga text-3xl font-bold text-center group-hover:text-manga-red transition-colors">
                          {item.rankPosition}
                        </div>
                        <div className="w-8 flex justify-center text-xs text-gray-400 font-bold">
                          -
                        </div>
                        <div className="w-12 h-12 border border-black overflow-hidden flex-shrink-0 bg-gray-200">
                          <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0" />
                        </div>
                        <div className="flex-1 min-w-0 ml-4">
                          <h4 className="font-bold uppercase text-sm truncate group-hover:text-manga-red transition-colors">{item.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {item.genre} • {rankingType === 'view' ? 'Lượt xem' : 'Lượt theo dõi'}: {rankingType === 'view' ? item.viewCount : item.totalVotes}
                          </p>
                        </div>
                        <div className="text-manga-red font-black text-xl ml-4 flex items-end">
                          {item.score} <span className="text-[10px] text-gray-500 uppercase ml-1 pb-1">{rankingType === 'view' ? 'LƯỢT ĐỌC' : 'THEO DÕI'}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="bg-white text-center py-3 border-t-2 border-gray-200">
                    <button className="text-xs font-bold uppercase tracking-wider hover:text-manga-red transition-colors border-b border-black hover:border-manga-red pb-0.5">
                      XEM TOÀN BỘ BẢNG XẾP HẠNG
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column (Sidebar) - 30% */}
        <div className="lg:w-[30%] space-y-6">
          
          {/* Stats Box 1 */}
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-4 border-black px-4 py-3 font-black uppercase tracking-wider text-lg">
              THỐNG KÊ TUẦN
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-dashed border-gray-200 pb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <div className="bg-black text-white p-1 rounded-sm"><BookOpen className="w-4 h-4" /></div>
                  TỔNG TÁC PHẨM
                </div>
                <div className="font-manga text-xl font-bold">1,402</div>
              </div>
              <div className="flex items-center justify-between border-b-2 border-dashed border-gray-200 pb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <div className="bg-manga-red text-white p-1 rounded-sm"><Eye className="w-4 h-4" /></div>
                  LƯỢT ĐỌC TUẦN NÀY
                </div>
                <div className="font-manga text-xl font-bold">845.2K</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <div className="bg-gray-300 text-black p-1 rounded-sm"><Users className="w-4 h-4" /></div>
                  ĐỘC GIẢ MỚI
                </div>
                <div className="font-manga text-xl font-bold text-manga-red">+12%</div>
              </div>
            </div>
          </div>

          {/* Stats Box 2: Genres */}
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-4 border-black px-4 py-3 font-black uppercase tracking-wider text-lg">
              THỂ LOẠI DẪN ĐẦU
            </div>
            <div className="p-5 space-y-5">
              {[
                { name: 'HÀNH ĐỘNG', percent: 45 },
                { name: 'VIỄN TƯỞNG', percent: 30 },
                { name: 'TÌNH CẢM', percent: 15 },
                { name: 'HÀI HƯỚC', percent: 10 },
              ].map((genre) => (
                <div key={genre.name}>
                  <div className="flex justify-between text-xs font-bold uppercase mb-1">
                    <span>{genre.name}</span>
                    <span>{genre.percent}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 border-2 border-black overflow-hidden">
                    <div 
                      className={`h-full border-r-2 border-black ${genre.percent > 40 ? 'bg-manga-red' : 'bg-gray-400'}`} 
                      style={{ width: `${genre.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to action box */}
          <div className="bg-manga-red border-4 border-black shadow-[4px_4px_0px_#000] p-2">
            <div className="border-2 border-black p-6 bg-[#111] text-white">
              <h3 className="font-manga text-3xl font-bold uppercase mb-2">TÁC PHẨM CỦA BẠN?</h3>
              <p className="text-xs text-gray-300 font-bold leading-relaxed mb-6">
                Ghi danh vào bảng xếp hạng và tiếp cận hàng ngàn độc giả ngay hôm nay.
              </p>
              <Link 
                to="/dashboard/mangaka" 
                className="block w-full text-center bg-manga-red text-white font-black uppercase py-3 border-2 border-manga-red hover:bg-red-700 transition-colors"
              >
                ĐĂNG TRUYỆN
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
