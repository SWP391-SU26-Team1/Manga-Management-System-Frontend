import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AlertCircle, TrendingUp, Bell, AlertTriangle, Info, ChevronDown, ChevronUp, CalendarDays } from 'lucide-react'
import { RankingPanel } from '@/components/mangaka/RankingPanel'
import { RankingStat, RiskAlert } from '@/data/mangakaMockData'
import { rankingService } from '@/services/ranking.service'
import { seriesService } from '@/services/series.service'
import { chapterService } from '@/services/chapter.service'

const RISK_LEVEL_CONFIG = {
  High: {
    border: 'border-manga-red',
    bg: 'bg-red-50',
    text: 'text-red-900',
    badge: 'bg-manga-red text-white',
    icon: AlertTriangle,
    iconColor: 'text-manga-red',
    label: 'Rủi ro Cao',
  },
  Medium: {
    border: 'border-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    badge: 'bg-orange-500 text-white',
    icon: AlertCircle,
    iconColor: 'text-orange-500',
    label: 'Rủi ro Trung bình',
  },
  Low: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-50',
    text: 'text-yellow-900',
    badge: 'bg-yellow-500 text-white',
    icon: Info,
    iconColor: 'text-yellow-600',
    label: 'Cảnh báo',
  },
} as const

export default function RankingPage() {
  const [stats, setStats] = useState<RankingStat[]>([])
  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [activeTab, setActiveTab] = useState<'ranking' | 'alerts'>('ranking')
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null)
  const [readAlerts, setReadAlerts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRankingData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Fetch Mangaka's series
      const mySeries = await seriesService.getAll()
      if (mySeries.length === 0) {
        setStats([])
        setAlerts([])
        setLoading(false)
        return
      }

      // 2. Fetch Top rankings from system (to get rank positions)
      const topRankings = await rankingService.getTopSeries(100)

      // 3. For each series, fetch trend, chapters, risk in parallel
      const statsPromises = mySeries.map(async (series) => {
        try {
          const trendData = await rankingService.getSeriesTrend(series._id)
          const chapters = await chapterService.getBySeriesId(series._id)
          const riskData = await rankingService.checkSeriesRisk(series._id)

          // Find ranking from top rankings
          const matchedRanking = topRankings.find(r => r.series_id === series._id)

          const latestTrend = trendData?.trend && trendData.trend.length > 0
            ? trendData.trend[trendData.trend.length - 1]
            : null

          const rankWeekly = matchedRanking
            ? matchedRanking.rank_position
            : (latestTrend ? latestTrend.rank : 99)

          const rating = matchedRanking
            ? matchedRanking.score
            : (latestTrend ? latestTrend.score : 0)

          const rankChange = latestTrend ? latestTrend.change : 0

          // Format numbers
          const formatNum = (val: number) => {
            if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
            if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
            return val.toString()
          }

          const viewCount = series.view_count || 0
          const views = formatNum(viewCount)
          const likes = formatNum(Math.floor(viewCount * 0.08))
          const comments = formatNum(Math.floor(viewCount * 0.02))
          const followers = formatNum(Math.floor(viewCount * 0.12))

          let hotChapter = 'N/A'
          if (chapters.length > 0) {
            const maxChNum = Math.max(...chapters.map(c => c.chapter_number))
            hotChapter = `CH.${maxChNum}`
          }

          const statItem: RankingStat = {
            id: matchedRanking?.series_ranking_id || `rank_${series._id}`,
            seriesId: series._id,
            seriesTitle: series.title,
            rankWeekly,
            views,
            likes,
            comments,
            followers,
            rating,
            rankChange,
            hotChapter,
          }

          return { statItem, riskData }
        } catch (e) {
          console.error(`Error loading stats for series ${series.title}:`, e)
          return null
        }
      })

      const statsResults = await Promise.all(statsPromises)
      const validStats = statsResults.map(r => r?.statItem).filter((item): item is RankingStat => !!item)
      setStats(validStats)

      // 4. Fetch notifications and build alerts list
      const notifications = await rankingService.getNotifications()
      const warningNotifications = notifications.filter(n => n.type === 'ranking_warning')

      const notificationAlerts: RiskAlert[] = warningNotifications.map(n => {
        const matched = mySeries.find(s => n.content.includes(s.title) || n.title.includes(s.title))
        return {
          id: n.notification_id,
          seriesId: matched ? matched._id : '',
          level: (n.content.toLowerCase().includes('high') || n.title.toLowerCase().includes('nguy cơ') || n.content.toLowerCase().includes('rủi ro')) ? 'High' : 'Medium',
          message: n.content,
          createdAt: n.created_at,
          isRead: n.is_read,
        }
      })

      // Build dynamic alerts based on checkSeriesRisk
      const dynamicRiskAlerts: RiskAlert[] = []
      statsResults.forEach((r, idx) => {
        if (r && r.riskData && r.riskData.at_risk) {
          const series = mySeries[idx]
          const level = r.riskData.low_score ? 'High' : 'Medium'
          dynamicRiskAlerts.push({
            id: `dynamic_${series._id}`,
            seriesId: series._id,
            level,
            message: `Tác phẩm "${series.title}" đang gặp rủi ro ${level === 'High' ? 'cao' : 'trung bình'}. ${r.riskData.declining ? 'Xếp hạng đang giảm liên tiếp.' : ''} ${r.riskData.low_score ? 'Điểm tương tác thấp (< 5).' : ''}`,
            createdAt: new Date().toISOString(),
            isRead: false,
          })
        }
      })

      const mergedAlerts = [...notificationAlerts, ...dynamicRiskAlerts]
      setAlerts(mergedAlerts)

      // Auto switch to alerts tab if there are unread high-risk alerts
      if (mergedAlerts.some(al => al.level === 'High' && !al.isRead)) {
        setActiveTab('alerts')
      }

    } catch (err: any) {
      console.error("Error loading ranking data:", err)
      setError("Không thể tải dữ liệu xếp hạng và cảnh báo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRankingData()
  }, [])

  const unreadCount = alerts.filter(a => !a.isRead && !readAlerts.has(a.id)).length
  const highRiskCount = alerts.filter(a => a.level === 'High').length

  const markRead = async (id: string) => {
    if (!id.startsWith('dynamic_')) {
      try {
        await rankingService.markAsRead(id)
      } catch (err) {
        console.error("Lỗi khi đánh dấu thông báo đã đọc:", err)
      }
    }
    setReadAlerts(prev => new Set([...prev, id]))
  }

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none">
            XẾP HẠNG & CẢNH BÁO
          </h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3" />
          <p className="text-sm font-bold text-gray-500 mt-2">
            Theo dõi tương tác từ độc giả và xếp hạng tuần. Nhận cảnh báo sớm khi series có nguy cơ bị huỷ.
          </p>
        </div>

        {/* Alert summary pill */}
        {alerts.length > 0 && (
          <div
            className={`flex items-center gap-3 px-4 py-2.5 border-2 cursor-pointer transition-all ${
              highRiskCount > 0
                ? 'border-manga-red bg-red-50 text-manga-red'
                : 'border-orange-400 bg-orange-50 text-orange-700'
            }`}
            onClick={() => setActiveTab('alerts')}
          >
            <Bell className="w-5 h-5" />
            <div>
              <div className="font-black text-sm uppercase leading-none">
                {unreadCount > 0 ? `${unreadCount} chưa đọc` : `${alerts.length} cảnh báo`}
              </div>
              {highRiskCount > 0 && (
                <div className="text-[10px] font-bold uppercase opacity-80">
                  {highRiskCount} rủi ro cao
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tab Selector */}
      <div className="flex border-b-4 border-manga-ink mb-6">
        <button
          onClick={() => setActiveTab('ranking')}
          className={`px-6 py-3 font-manga font-bold text-sm uppercase border-2 border-b-0 flex items-center gap-2 transition-colors ${
            activeTab === 'ranking'
              ? 'bg-manga-ink text-white border-manga-ink'
              : 'bg-white text-manga-ink border-manga-ink hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Bảng xếp hạng
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-6 py-3 font-manga font-bold text-sm uppercase border-2 border-b-0 border-l-0 flex items-center gap-2 transition-colors relative ${
            activeTab === 'alerts'
              ? 'bg-manga-ink text-white border-manga-ink'
              : 'bg-white text-manga-ink border-manga-ink hover:bg-gray-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Cảnh báo rủi ro
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-manga-red text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB: Ranking ── */}
      {activeTab === 'ranking' && (
        <>
          {/* Quick alert banner if any High alerts */}
          {highRiskCount > 0 && (
            <div
              className="mb-4 p-3 border-2 border-manga-red bg-red-50 flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => setActiveTab('alerts')}
            >
              <div className="flex items-center gap-2 text-manga-red font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                {highRiskCount} series đang có nguy cơ bị huỷ! Nhấn để xem chi tiết.
              </div>
              <ChevronDown className="w-4 h-4 text-manga-red" />
            </div>
          )}

          {loading ? (
            <div className="bg-white border-4 border-manga-ink p-12 text-center font-bold text-gray-400">
              Đang tải dữ liệu xếp hạng...
            </div>
          ) : error ? (
            <div className="bg-white border-4 border-manga-red text-manga-red p-12 text-center font-bold">
              Có lỗi xảy ra: {error}
            </div>
          ) : stats.length > 0 ? (
            <RankingPanel stats={stats} />
          ) : (
            <div className="bg-white border-4 border-manga-ink p-12 text-center font-bold text-gray-400">
              Bạn chưa có tác phẩm nào hoặc chưa có dữ liệu xếp hạng.
            </div>
          )}

          {/* Info panels */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 font-bold text-sm text-manga-ink">
            <div className="bg-yellow-50/30 border-2 border-yellow-400 p-5">
              <h4 className="font-manga text-base uppercase text-yellow-800 mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Cơ chế xếp hạng tự động
              </h4>
              <p className="text-xs text-yellow-700 leading-relaxed font-semibold">
                Bảng xếp hạng (Weekly Rank) được cập nhật tự động vào 00:00 mỗi Thứ Hai dựa trên điểm số tương tác tổng hợp (70% lượt xem, 20% lượt thích/theo dõi và 10% bình luận thực tế). Các tác phẩm duy trì top 3 liên tiếp 4 tuần sẽ nhận được huy hiệu "Hot Series".
              </p>
            </div>

            <div className="bg-red-50/50 border-2 border-manga-red p-5">
              <h4 className="font-manga text-base uppercase text-manga-red mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Quy định cảnh báo & Đóng series
              </h4>
              <p className="text-xs text-red-700 leading-relaxed font-semibold">
                Nếu một tác phẩm rơi xuống ngoài top 20 liên tiếp trong 3 kỳ xuất bản, hệ thống gửi cảnh báo đến tác giả. Hội đồng biên tập có quyền đình chỉ xuất bản hoặc yêu cầu tác giả rút ngắn cốt truyện để hoàn thành sớm.
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── TAB: Risk Alerts ── */}
      {activeTab === 'alerts' && (
        <div>
          {/* Alert Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Tổng cảnh báo', value: alerts.length, color: 'text-manga-ink' },
              { label: 'Rủi ro Cao', value: alerts.filter(a => a.level === 'High').length, color: 'text-manga-red' },
              { label: 'Chưa đọc', value: unreadCount, color: 'text-orange-500' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border-2 border-manga-ink p-4 text-center">
                <div className={`font-manga text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="bg-white border-4 border-manga-ink p-12 text-center font-bold text-gray-400">
              Đang tải dữ liệu cảnh báo...
            </div>
          ) : error ? (
            <div className="bg-white border-4 border-manga-red text-manga-red p-12 text-center font-bold">
              Có lỗi xảy ra: {error}
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map(alert => {
                const config = RISK_LEVEL_CONFIG[alert.level as keyof typeof RISK_LEVEL_CONFIG] || RISK_LEVEL_CONFIG.Low
                const Icon = config.icon
                const isRead = alert.isRead || readAlerts.has(alert.id)
                const isExpanded = expandedAlertId === alert.id
                return (
                  <div
                    key={alert.id}
                    className={`border-2 ${config.border} ${config.bg} transition-all ${!isRead ? 'ring-2 ring-offset-1 ring-current/20' : 'opacity-80'}`}
                  >
                    <div
                      className="p-4 flex items-start gap-3 cursor-pointer"
                      onClick={() => {
                        setExpandedAlertId(isExpanded ? null : alert.id)
                        markRead(alert.id)
                      }}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 ${config.badge}`}>
                            {config.label}
                          </span>
                          {!isRead && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-manga-ink text-white">
                              Mới
                            </span>
                          )}
                        </div>
                        <p className={`text-sm font-bold leading-snug ${config.text}`}>{alert.message}</p>
                        <div className="text-[10px] uppercase font-bold mt-1 opacity-60">
                          {new Date(alert.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 mt-1" />}
                    </div>

                    {isExpanded && (
                      <div className={`px-4 pb-4 pt-0 border-t ${config.border}`}>
                        <div className="bg-white/70 p-3 mt-3">
                          <h4 className="text-[10px] font-black uppercase text-gray-500 mb-2">Khuyến nghị hành động</h4>
                          {alert.level === 'High' ? (
                            <ul className="text-xs font-bold text-gray-700 space-y-1">
                              <li>• Xem lại dữ liệu xếp hạng chi tiết trong tab "Bảng xếp hạng"</li>
                              <li>• Cân nhắc điều chỉnh nội dung, nhịp độ cốt truyện của các chapter tiếp theo</li>
                              <li>• Liên hệ Tantou Editor để được tư vấn chiến lược cải thiện</li>
                            </ul>
                          ) : alert.level === 'Medium' ? (
                            <ul className="text-xs font-bold text-gray-700 space-y-1">
                              <li>• Theo dõi sát chỉ số trong 2 kỳ phát hành tiếp theo</li>
                              <li>• Thảo luận với Editor về hướng cải thiện nội dung</li>
                            </ul>
                          ) : (
                            <ul className="text-xs font-bold text-gray-700 space-y-1">
                              <li>• Chú ý xu hướng chỉ số trong các kỳ tới</li>
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-16 text-center border-4 border-dashed border-gray-200 bg-white">
              <AlertCircle className="w-16 h-16 text-gray-200 mx-auto mb-3" />
              <h3 className="font-manga text-xl font-bold uppercase text-gray-400">Không có cảnh báo nào</h3>
              <p className="text-sm font-bold text-gray-400 mt-1">
                Tất cả series của bạn đang có chỉ số tốt!
              </p>
            </div>
          )}
        </div>
      )}
      {/* Footer */}
      <footer className="mt-16 pt-8 border-t-2 border-manga-ink flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-gray-500">
        <div className="font-manga text-2xl text-manga-red">MangaFlow</div>
        <div>© 2026 MangaFlow System. Gangan Press Co. Ltd. All rights reserved.</div>
        <div className="flex items-center gap-6">
          <Link to="/dashboard/mangaka" className="hover:text-manga-red transition-colors flex items-center gap-1">
            <CalendarDays className="w-4 h-4" /> Lịch trình
          </Link>
          <a href="#" className="hover:text-manga-red transition-colors">Quy tắc xuất bản</a>
          <a href="#" className="hover:text-manga-red transition-colors">Hỗ trợ Mangaka</a>
        </div>
      </footer>
    </div>
  )
}
