import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Trophy, Star, MessageSquare, Loader2, AlertCircle, Search, X, Eye } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { editorService, ApiRankingEntry, ApiRankingPeriod } from '@/services/editor.service'

interface DisplayRanking {
  rank: number
  globalViewRank: number
  globalLikeRank: number
  prevRank: number
  series: string
  seriesId: string
  mangaka: string
  score: number
  likes: number
  views: number
  isMine?: boolean
}

export default function RankingPerformancePage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MINE'>('MINE')
  const [rankingType, setRankingType] = useState<'view' | 'like'>('view')
  const [rankings, setRankings] = useState<DisplayRanking[]>([])
  const [periods, setPeriods] = useState<ApiRankingPeriod[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedSeriesForTrend, setSelectedSeriesForTrend] = useState<DisplayRanking | null>(null)
  const [trendData, setTrendData] = useState<any[]>([])
  const [trendLoading, setTrendLoading] = useState(false)
  const [selectedSeriesChapters, setSelectedSeriesChapters] = useState<any[]>([])
  const [modalTab, setModalTab] = useState<'TREND' | 'CHAPTERS'>('CHAPTERS')

  // Get user's managed series (from local storage or series API)
  const [mySeriesIds, setMySeriesIds] = useState<string[]>([])

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedPeriod) {
      fetchRankings(selectedPeriod)
    }
  }, [selectedPeriod])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch ranking periods and user's series in parallel
      const [periodsRes, seriesRes] = await Promise.all([
        editorService.getRankingPeriods(),
        editorService.getSeries(),
      ])

      // Periods
      const periodsData = periodsRes.data || periodsRes
      let periodsList: ApiRankingPeriod[] = Array.isArray(periodsData) ? periodsData : (periodsData.periods || periodsData.items || [])
      
      // Filter out future periods (start_date > today)
      const todayStr = new Date().toISOString().split('T')[0]
      periodsList = periodsList.filter(p => p.start_date <= todayStr)
      
      setPeriods(periodsList)

      // My series IDs
      const seriesData = seriesRes.data || seriesRes
      const seriesList = Array.isArray(seriesData) ? seriesData : (seriesData.series || seriesData.items || [])
      const myIds = seriesList.map((s: any) => s.series_id)
      setMySeriesIds(myIds)

      // Set default period: find the one that covers today's date
      let defaultPeriod = ''
      if (periodsList.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0] // e.g., '2026-07-21'
        const matchedPeriod = periodsList.find(p => p.start_date <= todayStr && p.end_date >= todayStr)
        defaultPeriod = matchedPeriod ? matchedPeriod.period_id : periodsList[0].period_id
        setSelectedPeriod(defaultPeriod)
      }

      // Fetch rankings for first period
      await fetchRankings(defaultPeriod, myIds)
    } catch (err: any) {
      console.error('Failed to load ranking data:', err)
      setError('Không thể tải dữ liệu xếp hạng.')
    } finally {
      setLoading(false)
    }
  }

  const fetchRankings = async (periodId: string, currentMySeriesIds?: string[]) => {
    try {
      const params: any = { limit: 50, status: 'published' }
      if (periodId) params.period_id = periodId

      const res = await editorService.getTopSeriesRankings(params)
      const data = res.data || res
      let list = Array.isArray(data) ? data : (data.rankings || data.items || [])
      
      // Filter out any non-published series just to be completely safe
      list = list.filter((r: any) => r.series && r.series.status === 'published')

      const myIds = currentMySeriesIds || mySeriesIds
      const mapped: DisplayRanking[] = list.map((r: any, idx: number) => {
        const sId = r.series_id || r.series?.series_id || ''
        const gViewRank = r.global_view_rank || r.rank_position || idx + 1
        const gLikeRank = r.global_like_rank || r.rank_position || idx + 1
        return {
          rank: gViewRank,
          globalViewRank: gViewRank,
          globalLikeRank: gLikeRank,
          prevRank: r.prev_rank || r.rank_position || idx + 1,
          series: r.series?.title || r.title || '—',
          seriesId: sId,
          mangaka: r.series?.owner?.username || r.series?.owner?.fullName || r.mangaka || '—',
          score: r.score || 0,
          likes: r.series?.like_count || 0,
          views: r.series?.view_count || r.views || 0,
          isMine: myIds.includes(sId),
        }
      })

      setRankings(mapped)
    } catch (err: any) {
      console.error('Failed to load rankings:', err)
    }
  }

  const handleSeriesClick = async (series: DisplayRanking) => {
    setSelectedSeriesForTrend(series)
    setTrendLoading(true)
    setTrendData([])
    setSelectedSeriesChapters([])
    setModalTab('CHAPTERS')
    try {
      // Fetch ranking history and series details in parallel
      const [historyRes, detailRes] = await Promise.all([
        editorService.getSeriesHistory(series.seriesId).catch(err => {
          console.error('Failed to load series history:', err)
          return []
        }),
        editorService.getSeriesDetail(series.seriesId).catch(err => {
          console.error('Failed to load series detail:', err)
          return null
        })
      ])

      // 1. Process history data
      const historyData = historyRes.data || historyRes || []
      const historyList = Array.isArray(historyData) ? [...historyData] : []
      historyList.sort((a: any, b: any) => {
        const dateA = a.ranking_period?.start_date ? new Date(a.ranking_period.start_date).getTime() : 0
        const dateB = b.ranking_period?.start_date ? new Date(b.ranking_period.start_date).getTime() : 0
        return dateA - dateB
      })

      const historyTrend = historyList.map((h: any, idx: number) => {
        const prev = historyList[idx - 1]
        return {
          period_name: h.ranking_period?.name || `Kỳ ${idx + 1}`,
          rank: h.rank_position,
          change: prev ? prev.rank_position - h.rank_position : 0
        }
      })
      setTrendData(historyTrend)

      // 2. Process series details (chapters)
      const detailData = detailRes?.data || detailRes
      if (detailData && detailData.chapter) {
        const chaps = Array.isArray(detailData.chapter) ? detailData.chapter : []
        chaps.sort((a: any, b: any) => (a.chapter_number || 0) - (b.chapter_number || 0))
        setSelectedSeriesChapters(chaps)
      }
    } catch (err) {
      console.error('Failed to load series details or history:', err)
    } finally {
      setTrendLoading(false)
    }
  }

  const displayRankings = [...rankings]
    .filter(r =>
      r.series.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mangaka.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (rankingType === 'view') {
        return b.views - a.views
      } else {
        return b.likes - a.likes
      }
    })

  // Compute overview stats from data
  const myRankings = rankings.filter(r => r.isMine)
  const getActiveRank = (r: DisplayRanking) => rankingType === 'view' ? r.globalViewRank : r.globalLikeRank
  const bestSeries = myRankings.length > 0 ? myRankings.reduce((best, r) => getActiveRank(r) < getActiveRank(best) ? r : best, myRankings[0]) : null
  const worstSeries = myRankings.length > 0 ? myRankings.reduce((worst, r) => getActiveRank(r) > getActiveRank(worst) ? r : worst, myRankings[0]) : null
  const totalViews = myRankings.reduce((sum, r) => sum + r.views, 0)
  const totalLikes = myRankings.reduce((sum, r) => sum + r.likes, 0)

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-manga-red mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">Đang tải dữ liệu xếp hạng...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center border-4 border-red-500 p-8 bg-white">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
          <button onClick={fetchInitialData} className="bg-manga-ink text-white font-bold text-xs uppercase px-4 py-2 hover:bg-black transition-colors">Thử lại</button>
        </div>
      </div>
    )
  }

  const currentPeriod = periods.find(p => p.period_id === selectedPeriod)

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none">
            RANKING & HIỆU SUẤT
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-2">
            {currentPeriod ? `Kỳ: ${currentPeriod.name}` : 'Bảng xếp hạng series'}
          </p>
        </div>
        {periods.length > 1 && (
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border-2 border-manga-ink py-2 px-3 text-sm font-bold bg-white focus:outline-none">
            {periods.map(p => (
              <option key={p.period_id} value={p.period_id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-manga-ink text-white p-6 border-4 border-manga-ink flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 text-gray-300 text-xs font-bold uppercase">
            <Trophy className="w-4 h-4 text-yellow-400" /> Series Hạng Cao Nhất (Phụ Trách)
          </div>
          <div>
            {bestSeries ? (
              <>
                <h2 className="font-manga text-3xl font-bold text-yellow-400 mb-1">{bestSeries.series}</h2>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-black">#{getActiveRank(bestSeries)}</span>
                </div>
              </>
            ) : (
              <p className="text-gray-400 font-bold">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        <div className="bg-white border-4 border-manga-ink p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 text-gray-500 text-xs font-bold uppercase">
            <TrendingDown className="w-4 h-4 text-red-500" /> Series Hạng Thấp Nhất (Phụ Trách)
          </div>
          <div>
            {worstSeries ? (
              <>
                <h2 className="font-manga text-xl font-bold text-manga-ink mb-2">{worstSeries.series}</h2>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black text-gray-700">#{getActiveRank(worstSeries)}</span>
                </div>
              </>
            ) : (
              <p className="text-gray-400 font-bold">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        <div className="bg-white border-4 border-manga-ink p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 text-gray-500 text-xs font-bold uppercase">
            {rankingType === 'view' ? (
              <>
                <Eye className="w-4 h-4 text-orange-500" /> Tổng Lượt Đọc
              </>
            ) : (
              <>
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Tổng Lượt Thích
              </>
            )}
          </div>
          <div>
            <div className="text-4xl font-black text-manga-ink mb-1">
              {rankingType === 'view' ? totalViews.toLocaleString() : totalLikes.toLocaleString()} 
              <span className="text-xl text-gray-400"> lượt</span>
            </div>
            <div className="text-sm font-bold text-gray-500">
              Tổng {myRankings.length} series đang phát hành
            </div>
          </div>
        </div>
      </div>



      {/* Toggles and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        {/* View/Like toggle buttons */}
        <div className="flex bg-white border-4 border-manga-ink shadow-[4px_4px_0px_#000] w-full sm:w-auto">
          <button
            onClick={() => setRankingType('view')}
            className={`flex-1 sm:flex-initial px-6 py-2.5 font-bold uppercase text-xs transition-colors border-r-4 border-manga-ink ${
              rankingType === 'view' ? 'bg-manga-ink text-white' : 'hover:bg-gray-100 text-manga-ink'
            }`}
          >
            Ranking theo View
          </button>
          <button
            onClick={() => setRankingType('like')}
            className={`flex-1 sm:flex-initial px-6 py-2.5 font-bold uppercase text-xs transition-colors ${
              rankingType === 'like' ? 'bg-manga-ink text-white' : 'hover:bg-gray-100 text-manga-ink'
            }`}
          >
            Ranking theo Like
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center bg-white border-4 border-manga-ink px-4 py-2 w-full sm:max-w-md shadow-[4px_4px_0px_#000]">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm series hoặc mangaka..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm font-bold focus:outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="bg-white border-4 border-manga-ink">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-4 border-manga-ink bg-gray-50">
              <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider whitespace-nowrap w-20">Hạng</th>
              <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider whitespace-nowrap">Series</th>
              <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider whitespace-nowrap">Mangaka</th>
              <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider whitespace-nowrap text-right">
                {rankingType === 'view' ? 'Lượt xem' : 'Lượt thích'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-100">
            {displayRankings.map((r, i) => {
              const activeRank = getActiveRank(r)
              return (
                <tr key={i} className={`hover:bg-gray-50 transition-colors cursor-pointer ${r.isMine && activeTab === 'ALL' ? 'bg-yellow-50/50' : ''}`} onClick={() => handleSeriesClick(r)}>
                  <td className="px-6 py-5">
                    <span className={`text-xl font-black ${activeRank <= 3 ? 'text-manga-red' : 'text-gray-700'}`}>#{activeRank}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-base text-manga-ink">{r.series}</div>
                    {r.isMine && activeTab === 'ALL' && <div className="text-[10px] font-bold text-blue-600 uppercase mt-1">Series phụ trách</div>}
                  </td>
                  <td className="px-6 py-5 font-bold text-gray-600">{r.mangaka}</td>
                  <td className="px-6 py-5 text-right text-sm font-bold text-gray-500">
                    {rankingType === 'view' ? r.views.toLocaleString() : r.likes.toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {displayRankings.length === 0 && (
          <div className="p-8 text-center text-gray-500 font-bold">
            {activeTab === 'MINE' ? 'Chưa có series nào bạn phụ trách trong bảng xếp hạng.' : 'Không có dữ liệu xếp hạng.'}
          </div>
        )}
      </div>

      {selectedSeriesForTrend && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black font-manga text-manga-ink uppercase">CHI TIẾT SERIES: {selectedSeriesForTrend.series}</h2>
              <button onClick={() => setSelectedSeriesForTrend(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>

            {/* Tab selector */}
            <div className="flex border-b-4 border-manga-ink mb-6">
              <button
                onClick={() => setModalTab('CHAPTERS')}
                className={`px-4 py-2 font-black text-sm uppercase transition-all border-t-4 border-x-4 ${
                  modalTab === 'CHAPTERS'
                    ? 'border-manga-ink bg-white text-manga-ink -mb-[4px] relative z-10'
                    : 'border-transparent text-gray-400 hover:text-manga-ink'
                }`}
              >
                Hiệu suất từng Chapter
              </button>
              <button
                onClick={() => setModalTab('TREND')}
                className={`px-4 py-2 font-black text-sm uppercase transition-all border-t-4 border-x-4 ${
                  modalTab === 'TREND'
                    ? 'border-manga-ink bg-white text-manga-ink -mb-[4px] relative z-10'
                    : 'border-transparent text-gray-400 hover:text-manga-ink'
                }`}
              >
                Xu hướng xếp hạng
              </button>
            </div>

            {trendLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-manga-red" /></div>
            ) : modalTab === 'CHAPTERS' ? (
              <div className="overflow-x-auto border-2 border-manga-ink">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-manga-ink">
                      <th className="px-4 py-3 text-xs font-black text-manga-ink uppercase">Chapter / Tên chương</th>
                      <th className="px-4 py-3 text-xs font-black text-manga-ink uppercase text-right">Lượt đọc</th>
                      <th className="px-4 py-3 text-xs font-black text-manga-ink uppercase text-right">Lượt thích</th>
                      <th className="px-4 py-3 text-xs font-black text-manga-ink uppercase text-right">Ngày đăng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedSeriesChapters.length > 0 ? (
                      selectedSeriesChapters.map((ch: any, index: number) => {
                        const likesCount = Array.isArray(ch.chapter_like) ? ch.chapter_like.length : 0;
                        return (
                          <tr key={ch.chapter_id || index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-bold text-sm text-manga-ink">
                              Chương {ch.chapter_number}: {ch.title}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-sm text-gray-500">
                              {(ch.view_count || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-sm text-gray-500">
                              {likesCount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-xs text-gray-400">
                              {new Date(ch.created_at).toLocaleDateString('vi-VN')}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500 font-bold">
                          Chưa có chapter nào được xuất bản cho series này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : trendData.length > 0 ? (
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period_name" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                    <YAxis reversed={true} domain={[1, 'dataMax + 2']} tick={{ fontSize: 12, fontWeight: 'bold' }} label={{ value: 'Hạng', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{ border: '2px solid #000', fontWeight: 'bold' }}
                      labelStyle={{ color: '#000' }}
                      formatter={(value: any, name: any, props: any) => {
                        const change = props.payload.change;
                        let changeText = 'Giữ nguyên';
                        if (change > 0) changeText = `Tăng ${change} hạng`;
                        if (change < 0) changeText = `Giảm ${Math.abs(change)} hạng`;
                        return [`Hạng ${value} (${changeText})`, 'Thứ hạng'];
                      }}
                    />
                    <Line type="monotone" dataKey="rank" stroke="#ef4444" strokeWidth={4} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-500 font-bold py-8">Chưa có dữ liệu lịch sử xếp hạng cho series này.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
