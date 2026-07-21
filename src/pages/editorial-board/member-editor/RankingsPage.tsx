import React, { useState, useEffect } from 'react'
import { Award, Trophy, TrendingUp, Calendar, ChevronDown, Eye } from 'lucide-react'
import { boardService } from '@/services/board.service'
import { rankingService, BackendSeriesRanking } from '@/services/ranking.service'

export default function RankingsPage() {
  const [periods, setPeriods] = useState<any[]>([])
  const [activePeriod, setActivePeriod] = useState<string>('')
  const [rankings, setRankings] = useState<BackendSeriesRanking[]>([])
  const [activeTab, setActiveTab] = useState<'VIEW' | 'LIKE'>('VIEW')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const periodRes = await boardService.getRankingPeriods()
        setPeriods(periodRes || [])
        if (periodRes && periodRes.length > 0) {
          // Setting activePeriod will trigger the other useEffect
          setActivePeriod(periodRes[0].id || periodRes[0].period_id || '')
        } else {
          // If no periods, try fetching latest anyway
          fetchRankingsForPeriod('')
        }
      } catch (error) {
        console.error('Failed to load periods:', error)
        setLoading(false)
      }
    }
    fetchPeriods()
  }, [])

  const fetchRankingsForPeriod = async (periodId: string) => {
    setLoading(true)
    try {
      const data = await rankingService.getTopSeries(50, periodId)
      setRankings(data || [])
    } catch (error) {
      console.error('Failed to load rankings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activePeriod) {
      fetchRankingsForPeriod(activePeriod)
    }
  }, [activePeriod])

  const currentRankings = [...rankings].sort((a, b) => {
    if (activeTab === 'VIEW') {
      return (b.series?.view_count || 0) - (a.series?.view_count || 0)
    }
    return (b.total_vote || 0) - (a.total_vote || 0)
  })

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-manga text-4xl md:text-5xl font-black uppercase tracking-tight text-manga-ink flex items-center gap-3">
            <Trophy className="w-10 h-10 text-manga-red" />
            BẢNG XẾP HẠNG
          </h1>
          <p className="text-sm font-bold text-gray-500 uppercase mt-2">
            Theo dõi thành tích Series và Chapter toàn nền tảng
          </p>
        </div>
        
        <div className="relative">
          <select 
            value={activePeriod}
            onChange={(e) => setActivePeriod(e.target.value)}
            className="appearance-none bg-manga-red text-white border-4 border-manga-ink font-bold text-sm uppercase px-4 py-2 pr-10 shadow-[4px_4px_0px_rgba(0,0,0,1)] outline-none cursor-pointer focus:bg-manga-ink transition-colors"
          >
            {periods.length === 0 && <option>Kỳ xếp hạng hiện tại</option>}
            {periods.map(p => (
              <option key={p.id || p.period_id} value={p.id || p.period_id}>
                {p.name || 'Kỳ xếp hạng tháng này'}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-4 border-manga-ink mb-8">
        <button
          onClick={() => setActiveTab('VIEW')}
          className={`flex-1 py-4 font-manga text-xl font-bold uppercase transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'VIEW'
              ? 'bg-manga-ink text-white border-t-4 border-l-4 border-r-4 border-manga-ink'
              : 'bg-white text-gray-400 hover:bg-gray-50 border-t-4 border-l-4 border-r-4 border-transparent hover:border-gray-200'
          }`}
        >
          <Eye className="w-6 h-6" />
          TOP VIEW
        </button>
        <button
          onClick={() => setActiveTab('LIKE')}
          className={`flex-1 py-4 font-manga text-xl font-bold uppercase transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'LIKE'
              ? 'bg-manga-ink text-white border-t-4 border-l-4 border-r-4 border-manga-ink'
              : 'bg-white text-gray-400 hover:bg-gray-50 border-t-4 border-l-4 border-r-4 border-transparent hover:border-gray-200'
          }`}
        >
          <TrendingUp className="w-6 h-6" />
          TOP LIKE
        </button>
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="h-64 flex items-center justify-center border-4 border-manga-ink bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-manga-red"></div>
        </div>
      ) : currentRankings.length === 0 ? (
        <div className="text-center py-16 border-4 border-manga-ink bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-black uppercase text-gray-400">Chưa có dữ liệu xếp hạng</h3>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {currentRankings.map((item, index) => {
            const isTop1 = index === 0
            const isTop2 = index === 1
            const isTop3 = index === 2
            
            let rankColor = 'bg-white border-manga-ink'
            let numberColor = 'text-gray-400'
            let shadow = 'shadow-[4px_4px_0px_rgba(0,0,0,1)]'
            
            if (isTop1) {
              rankColor = 'bg-[#fefce8] border-yellow-500'
              numberColor = 'text-yellow-500'
              shadow = 'shadow-[6px_6px_0px_rgba(234,179,8,1)]'
            } else if (isTop2) {
              rankColor = 'bg-gray-50 border-gray-400'
              numberColor = 'text-gray-400'
              shadow = 'shadow-[6px_6px_0px_rgba(156,163,175,1)]'
            } else if (isTop3) {
              rankColor = 'bg-[#fff7ed] border-orange-500'
              numberColor = 'text-orange-500'
              shadow = 'shadow-[6px_6px_0px_rgba(249,115,22,1)]'
            }

            return (
                <div 
                  key={item.series_id || index}
                  className={`flex items-center p-4 border-4 transition-transform hover:-translate-y-1 ${rankColor} ${shadow}`}
                >
                  {/* Rank Number */}
                  <div className={`w-16 font-manga text-4xl font-black ${numberColor} flex justify-center items-center`}>
                    #{index + 1}
                  </div>
                  
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-gray-200 border-2 border-manga-ink flex-shrink-0 mx-4 overflow-hidden">
                    <img 
                      src={item.series?.cover_image_url || `https://i.pravatar.cc/300?u=rank_${item.series_id}`} 
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-manga text-xl font-bold uppercase text-manga-ink truncate">
                      {item.series?.title || 'Unknown Title'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded-sm border border-gray-300 whitespace-nowrap shrink-0">
                      Tác giả: {(item.series as any)?.author || 'Đang cập nhật'}
                    </span>
                      <span className="text-xs font-bold text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded-sm border border-gray-300 truncate max-w-full">
                        Thể loại: {item.series?.genre || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Score */}
                  <div className="text-right">
                    <div className="text-3xl font-black text-manga-red font-manga">
                      {activeTab === 'VIEW' ? (item.series?.view_count || 0).toLocaleString() : (item.total_vote || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase">
                      {activeTab === 'VIEW' ? 'LƯỢT VIEW' : 'LƯỢT LIKE'}
                    </div>
                  </div>
                </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
