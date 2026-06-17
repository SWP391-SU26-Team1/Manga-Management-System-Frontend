import React, { useEffect, useState } from 'react'
import { Eye, Star, ArrowUp, ArrowDown, Minus, Loader2, TrendingUp } from 'lucide-react'
import { SeriesAPI } from '@/services/series.service'
import { rankingService, BackendSeriesRanking } from '@/services/ranking.service'

interface InteractionStatsProps {
  seriesList?: SeriesAPI[]
}

export function InteractionStats({ seriesList = [] }: InteractionStatsProps) {
  const [rankingData, setRankingData] = useState<BackendSeriesRanking | null>(null)
  const [trend, setTrend] = useState<{ change: number; periodName: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true)
      try {
        // Lấy top rankings
        const topList = await rankingService.getTopSeries(50)

        // Tìm series của mangaka hiện tại trong danh sách ranking
        const mySeriesIds = seriesList.map((s) => s._id)
        const myRanking = topList.find((r) => mySeriesIds.includes(r.series_id)) || topList[0]

        if (myRanking) {
          setRankingData(myRanking)

          // Lấy trend của series đó
          try {
            const trendData = await rankingService.getSeriesTrend(myRanking.series_id)
            if (trendData?.trend?.length > 0) {
              const latest = trendData.trend[trendData.trend.length - 1]
              setTrend({ change: latest.change, periodName: latest.period_name })
            }
          } catch {
            // trend optional
          }
        }
      } catch (err) {
        console.error('Ranking fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [seriesList])

  if (loading) {
    return (
      <div className="bg-white manga-border manga-shadow-sm flex flex-col justify-center items-center p-8 min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-manga-red mb-2" />
        <span className="text-sm font-bold text-gray-400 uppercase">Đang tải xếp hạng...</span>
      </div>
    )
  }

  if (!rankingData) {
    return (
      <div className="bg-white manga-border manga-shadow-sm flex flex-col justify-center items-center p-8 min-h-[200px]">
        <TrendingUp className="w-10 h-10 text-gray-300 mb-3" />
        <span className="text-sm font-bold text-gray-400 uppercase text-center">
          Chưa có dữ liệu xếp hạng.<br />Series của bạn chưa được xếp hạng.
        </span>
      </div>
    )
  }

  const rankChange = trend?.change ?? 0
  const seriesTitle = rankingData.series?.title || 'Series của bạn'

  return (
    <div className="bg-white manga-border manga-shadow-sm flex flex-col">
      {/* Header */}
      <div className="bg-manga-ink text-white p-4">
        <h2 className="font-manga text-2xl font-bold uppercase tracking-wider text-center">
          Chỉ số tương tác
        </h2>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col items-center">
        <h3 className="font-manga text-xl font-bold uppercase tracking-widest text-manga-ink mb-1">
          Xếp hạng tuần
        </h3>
        <p className="text-xs text-gray-400 font-bold mb-4 text-center truncate w-full px-2">
          {seriesTitle}
        </p>

        {/* Rank Badge */}
        <div className="relative mb-4 transform -rotate-3 hover:rotate-0 transition-transform">
          <div className="absolute inset-0 bg-manga-ink translate-x-1 translate-y-1" />
          <div className="relative bg-white border-4 border-manga-ink px-8 py-2 flex items-center justify-center">
            <span className="font-manga text-6xl font-bold text-manga-red italic">
              #{rankingData.rank_position}
            </span>
          </div>
        </div>

        {/* Rank Change */}
        <div className="text-manga-ink font-bold text-sm text-center mb-6">
          {rankChange > 0 ? (
            <span className="text-green-600 flex items-center gap-0.5 justify-center">
              <ArrowUp className="w-4 h-4" /> Tăng {rankChange} bậc so với kỳ trước!
            </span>
          ) : rankChange < 0 ? (
            <span className="text-manga-red flex items-center gap-0.5 justify-center">
              <ArrowDown className="w-4 h-4" /> Giảm {Math.abs(rankChange)} bậc so với kỳ trước.
            </span>
          ) : (
            <span className="text-gray-500 flex items-center gap-0.5 justify-center">
              <Minus className="w-4 h-4" /> Giữ nguyên thứ hạng so với kỳ trước.
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6 border-t-2 border-dashed border-manga-ink pt-4">
          <div className="flex items-center gap-2 border border-manga-ink p-2 bg-gray-50">
            <Eye className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-[9px] font-bold text-gray-400 block uppercase leading-none">Views</span>
              <span className="font-manga text-sm font-bold text-manga-ink">
                {(rankingData.series?.view_count ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 border border-manga-ink p-2 bg-gray-50">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
            <div>
              <span className="text-[9px] font-bold text-gray-400 block uppercase leading-none">Score</span>
              <span className="font-manga text-sm font-bold text-manga-ink">
                {rankingData.score?.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="col-span-2 flex items-center gap-2 border border-manga-ink p-2 bg-gray-50">
            <TrendingUp className="w-4 h-4 text-manga-red" />
            <div>
              <span className="text-[9px] font-bold text-gray-400 block uppercase leading-none">Tổng Votes</span>
              <span className="font-manga text-sm font-bold text-manga-ink">
                {rankingData.total_vote?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Period info */}
        {rankingData.ranking_period && (
          <p className="text-[10px] text-gray-400 font-bold uppercase text-center">
            {rankingData.ranking_period.name}
          </p>
        )}
      </div>
    </div>
  )
}
