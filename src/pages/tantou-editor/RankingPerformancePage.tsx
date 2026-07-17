import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Trophy, Star, MessageSquare, Loader2, AlertCircle } from 'lucide-react'
import { editorService, ApiRankingEntry, ApiRankingPeriod } from '@/services/editor.service'

interface DisplayRanking {
  rank: number
  prevRank: number
  series: string
  seriesId: string
  mangaka: string
  score: number
  votes: number
  isMine?: boolean
}

export default function RankingPerformancePage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MINE'>('MINE')
  const [rankings, setRankings] = useState<DisplayRanking[]>([])
  const [periods, setPeriods] = useState<ApiRankingPeriod[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      const periodsList: ApiRankingPeriod[] = Array.isArray(periodsData) ? periodsData : (periodsData.periods || periodsData.items || [])
      setPeriods(periodsList)

      // Set default period
      if (periodsList.length > 0) {
        setSelectedPeriod(periodsList[0].period_id)
      }

      // My series IDs
      const seriesData = seriesRes.data || seriesRes
      const seriesList = Array.isArray(seriesData) ? seriesData : (seriesData.series || seriesData.items || [])
      setMySeriesIds(seriesList.map((s: any) => s.series_id))

      // Fetch rankings for first period
      if (periodsList.length > 0) {
        await fetchRankings(periodsList[0].period_id)
      } else {
        // No periods, try fetching without period_id
        await fetchRankings('')
      }
    } catch (err: any) {
      console.error('Failed to load ranking data:', err)
      setError('Không thể tải dữ liệu xếp hạng.')
    } finally {
      setLoading(false)
    }
  }

  const fetchRankings = async (periodId: string) => {
    try {
      const params: any = { limit: 50 }
      if (periodId) params.period_id = periodId

      const res = await editorService.getTopSeriesRankings(params)
      const data = res.data || res
      const list = Array.isArray(data) ? data : (data.rankings || data.items || [])

      const mapped: DisplayRanking[] = list.map((r: any, idx: number) => ({
        rank: r.rank || idx + 1,
        prevRank: r.previous_rank || r.prevRank || r.rank || idx + 1,
        series: r.series?.title || r.title || '—',
        seriesId: r.series_id || r.series?.series_id || '',
        mangaka: r.series?.owner?.username || r.mangaka || '—',
        score: r.score || 0,
        votes: r.view_count || r.votes || 0,
        isMine: mySeriesIds.includes(r.series_id || r.series?.series_id || ''),
      }))

      setRankings(mapped)
    } catch (err: any) {
      console.error('Failed to load rankings:', err)
    }
  }

  const displayRankings = activeTab === 'MINE' ? rankings.filter(r => r.isMine) : rankings

  // Compute overview stats from data
  const myRankings = rankings.filter(r => r.isMine)
  const bestSeries = myRankings.length > 0 ? myRankings.reduce((best, r) => r.rank < best.rank ? r : best, myRankings[0]) : null
  const worstSeries = myRankings.length > 0 ? myRankings.reduce((worst, r) => r.rank > worst.rank ? r : worst, myRankings[0]) : null
  const avgScore = myRankings.length > 0 ? (myRankings.reduce((sum, r) => sum + r.score, 0) / myRankings.length).toFixed(2) : '0'

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
            <Trophy className="w-4 h-4 text-yellow-400" /> Series Hạng Cao Nhất (Của Bạn)
          </div>
          <div>
            {bestSeries ? (
              <>
                <h2 className="font-manga text-3xl font-bold text-yellow-400 mb-1">{bestSeries.series}</h2>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-black">#{bestSeries.rank}</span>
                  {(() => {
                    const diff = bestSeries.prevRank - bestSeries.rank
                    if (diff > 0) return <span className="text-green-400 font-bold flex items-center gap-1 text-sm mb-1"><TrendingUp className="w-4 h-4" /> Tăng {diff} hạng</span>
                    if (diff < 0) return <span className="text-red-400 font-bold flex items-center gap-1 text-sm mb-1"><TrendingDown className="w-4 h-4" /> Giảm {Math.abs(diff)} hạng</span>
                    return <span className="text-gray-400 font-bold flex items-center gap-1 text-sm mb-1"><Minus className="w-4 h-4" /> Giữ nguyên</span>
                  })()}
                </div>
              </>
            ) : (
              <p className="text-gray-400 font-bold">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        <div className="bg-white border-4 border-manga-ink p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 text-gray-500 text-xs font-bold uppercase">
            <TrendingDown className="w-4 h-4 text-red-500" /> Series Giảm Sâu Nhất
          </div>
          <div>
            {worstSeries ? (
              <>
                <h2 className="font-manga text-xl font-bold text-manga-ink mb-2">{worstSeries.series}</h2>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black text-gray-700">#{worstSeries.rank}</span>
                  {(() => {
                    const diff = worstSeries.prevRank - worstSeries.rank
                    if (diff < 0) return <span className="text-red-500 font-bold flex items-center gap-1 text-sm mb-1"><TrendingDown className="w-4 h-4" /> Tụt {Math.abs(diff)} hạng</span>
                    if (diff > 0) return <span className="text-green-500 font-bold flex items-center gap-1 text-sm mb-1"><TrendingUp className="w-4 h-4" /> Tăng {diff} hạng</span>
                    return <span className="text-gray-400 font-bold flex items-center gap-1 text-sm mb-1"><Minus className="w-4 h-4" /> Giữ nguyên</span>
                  })()}
                </div>
              </>
            ) : (
              <p className="text-gray-400 font-bold">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        <div className="bg-white border-4 border-manga-ink p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 text-gray-500 text-xs font-bold uppercase">
            <Star className="w-4 h-4 text-orange-500" /> Điểm Đánh Giá Trung Bình
          </div>
          <div>
            <div className="text-4xl font-black text-manga-ink mb-1">{avgScore} <span className="text-xl text-gray-400">/ 100</span></div>
            <div className="text-sm font-bold text-gray-500">
              Tổng {myRankings.length} series đang phát hành
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex bg-gray-100 p-1 border-4 border-manga-ink w-fit mb-6">
        <button onClick={() => setActiveTab('MINE')}
          className={`px-8 py-2 text-xs font-bold uppercase transition-colors ${activeTab === 'MINE' ? 'bg-white border-2 border-manga-ink text-manga-ink shadow-sm' : 'text-gray-500 hover:text-manga-ink'}`}>
          Series Của Tôi
        </button>
        <button onClick={() => setActiveTab('ALL')}
          className={`px-8 py-2 text-xs font-bold uppercase transition-colors ${activeTab === 'ALL' ? 'bg-white border-2 border-manga-ink text-manga-ink shadow-sm' : 'text-gray-500 hover:text-manga-ink'}`}>
          Toàn Bộ Tạp Chí
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border-4 border-manga-ink">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-4 border-manga-ink bg-gray-50">
              <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider w-20">Hạng</th>
              <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider w-24">Xu Hướng</th>
              <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider">Series</th>
              <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider">Mangaka</th>
              <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider text-right">Điểm</th>
              <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider text-right">Lượt xem</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-100">
            {displayRankings.map((r, i) => {
              const diff = r.prevRank - r.rank
              return (
                <tr key={i} className={`hover:bg-gray-50 transition-colors ${r.isMine && activeTab === 'ALL' ? 'bg-yellow-50/50' : ''}`}>
                  <td className="px-6 py-5">
                    <span className={`text-xl font-black ${r.rank <= 3 ? 'text-manga-red' : 'text-gray-700'}`}>#{r.rank}</span>
                  </td>
                  <td className="px-6 py-5">
                    {diff > 0 ? (
                      <div className="flex items-center gap-1 text-green-500 font-bold text-sm"><TrendingUp className="w-4 h-4" /> +{diff}</div>
                    ) : diff < 0 ? (
                      <div className="flex items-center gap-1 text-red-500 font-bold text-sm"><TrendingDown className="w-4 h-4" /> {diff}</div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-400 font-bold text-sm"><Minus className="w-4 h-4" /> 0</div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-base text-manga-ink">{r.series}</div>
                    {r.isMine && activeTab === 'ALL' && <div className="text-[10px] font-bold text-blue-600 uppercase mt-1">Series của bạn</div>}
                  </td>
                  <td className="px-6 py-5 font-bold text-gray-600">{r.mangaka}</td>
                  <td className="px-6 py-5 text-right font-black text-lg text-manga-ink">{r.score}</td>
                  <td className="px-6 py-5 text-right text-sm font-bold text-gray-500">{r.votes.toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {displayRankings.length === 0 && (
          <div className="p-8 text-center text-gray-500 font-bold">
            {activeTab === 'MINE' ? 'Chưa có series nào của bạn trong bảng xếp hạng.' : 'Không có dữ liệu xếp hạng.'}
          </div>
        )}
      </div>
    </div>
  )
}
