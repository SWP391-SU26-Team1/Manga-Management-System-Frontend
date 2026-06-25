import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { CheckSquare, Square, TrendingUp, TrendingDown, Clock, ArrowRight, AlertCircle, FileText, CheckCircle, Activity, Star } from 'lucide-react'
import { QueueChapter, WeeklyRanking } from '@/types/board.types'
import { boardService } from '@/services/board.service'
import { rankingService } from '@/services/ranking.service'

export default function BoardDashboardPage() {
  const [chapters, setChapters] = useState<QueueChapter[]>([])
  const [rankings, setRankings] = useState<WeeklyRanking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // 1. Fetch queue chapters from real API
      try {
        const queueRes = await boardService.getQueueChapters()
        if (queueRes && queueRes.length > 0) {
          const adapted = queueRes.map((c: any) => ({
            id: c.chapter_id || c.id,
            title: c.series?.title || c.title || 'Unknown Title',
            chapterNumber: c.chapter_number,
            genre: c.series?.genre || c.genre || 'ACTION / SHONEN',
            progressLabel: c.progressLabel || 'EDIT',
            progressPercent: c.progressPercent || 75,
            timeLeftLabel: c.timeLeftLabel || '4h left',
            isUrgent: c.isUrgent || false,
            isNewSeries: c.isNewSeries || false,
            coverUrl: (c.thumbnail_image_url && c.thumbnail_image_url !== 'null' && c.thumbnail_image_url !== 'undefined') ? c.thumbnail_image_url : 
                      (c.series?.cover_image_url && c.series?.cover_image_url !== 'null' && c.series?.cover_image_url !== 'undefined') ? c.series.cover_image_url : 
                      c.coverUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop'
          }))
          setChapters(adapted)
        } else {
          setChapters([])
        }
      } catch (err) {
        console.warn('API error fetching chapters:', err)
        setChapters([])
      }

      // 2. Fetch weekly rankings from real API
      try {
        const rankingRes = await rankingService.getWeekly()
        if (rankingRes && rankingRes.length > 0) {
          const adapted = rankingRes.map((r: any, idx: number) => ({
            id: r.series_ranking_id || r.id || `rank-${idx}`,
            rank: r.rank_position || r.rank,
            title: r.series?.title || r.title || 'Unknown Title',
            votes: r.total_vote || r.views || r.votes || 12000,
            changePercent: r.score ? Math.floor((r.score % 10) + 1) : 4,
            trend: r.trend === 'down' ? 'down' as const : 'up' as const,
            coverUrl: (r.series?.cover_image_url && r.series?.cover_image_url !== 'null' && r.series?.cover_image_url !== 'undefined') ? r.series.cover_image_url : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop'
          }))
          setRankings(adapted)
        } else {
          setRankings([])
        }
      } catch (err) {
        console.warn('API error fetching rankings:', err)
        setRankings([])
      }
      
      setLoading(false)
    }

    loadData()
  }, [])

  // Derived metrics
  const urgentCount = chapters.filter(c => c.isUrgent || c.timeLeftLabel === 'URGENT').length
  const totalPending = chapters.length

  return (
    <div className="max-w-7xl mx-auto pb-12 font-sans px-4 sm:px-6 lg:px-8 mt-6">
      {/* Welcome Banner */}
      <div className="bg-[#fcf5f5] border-4 border-manga-ink p-8 mb-10 relative overflow-hidden shadow-[8px_8px_0px_rgba(15,15,15,1)] hover:shadow-[12px_12px_0px_rgba(15,15,15,1)] transition-all duration-300 group">
        {/* Halftone pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '10px 10px' }}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-8 h-8 text-manga-red animate-spin-slow" />
              <h1 className="font-manga text-4xl md:text-5xl font-black uppercase text-manga-ink leading-none tracking-tight">
                TỔNG QUAN BIÊN TẬP
              </h1>
            </div>
            <p className="text-sm font-bold text-gray-700 max-w-2xl leading-relaxed mt-4 border-l-4 border-manga-red pl-4">
              Theo dõi biến động xuất bản, phân tích xu hướng độc giả và quản lý tiến độ phê duyệt bản thảo. Hiệu suất quyết định của bạn định hình tương lai của nền tảng.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Link 
              to="/dashboard/editorial-board/proposals"
              className="bg-manga-ink text-white font-manga font-bold text-lg tracking-wider px-8 py-4 border-4 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase hover:bg-manga-red hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3"
            >
              <span>VÀO PHÒNG DUYỆT</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard 
          title="CHỜ PHÊ DUYỆT" 
          value={totalPending.toString()} 
          icon={<FileText className="w-6 h-6" />}
          trend="+3 từ hôm qua"
          isAlert={totalPending > 10}
        />
        <MetricCard 
          title="KHẨN CẤP" 
          value={urgentCount.toString()} 
          icon={<AlertCircle className="w-6 h-6" />}
          trend="Cần duyệt ngay"
          isAlert={urgentCount > 0}
          alertColor="text-manga-red"
        />
        <MetricCard 
          title="ĐÃ DUYỆT TUẦN NÀY" 
          value="128" 
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          trend="Đạt 95% mục tiêu"
        />
        <MetricCard 
          title="HOẠT ĐỘNG HỆ THỐNG" 
          value="BÌNH THƯỜNG" 
          icon={<Activity className="w-6 h-6 text-blue-600" />}
          trend="Uptime 99.9%"
          valueSize="text-2xl"
        />
      </div>

      {/* Main Grid Layout for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Weekly Ranking Widget */}
        <div className="bg-white border-4 border-manga-ink p-6 shadow-[8px_8px_0px_rgba(15,15,15,1)] flex flex-col h-full">
          <div className="flex items-center justify-between border-b-4 border-manga-ink pb-4 mb-6">
            <h3 className="font-manga text-2xl font-black uppercase text-manga-ink tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-manga-red" />
              XẾP HẠNG TUẦN
            </h3>
            <span className="bg-manga-ink text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
              TOP 5 SERIES
            </span>
          </div>
          
          <div className="space-y-4 flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-manga-red"></div>
              </div>
            ) : rankings.slice(0, 5).map((rank: any) => (
              <div 
                key={rank.id || rank.title}
                className="group flex items-center justify-between p-3 border-2 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-zinc-50 hover:translate-x-1 hover:bg-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="font-manga text-3xl font-black text-manga-red leading-none w-8 text-center drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {String(rank.rank).padStart(2, '0')}
                  </span>
                  
                  <div className="w-10 h-10 border-2 border-manga-ink rounded-full overflow-hidden flex-shrink-0 hidden sm:block">
                    <img src={rank.coverUrl} alt="cover" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  </div>

                  <div>
                    <h4 className="font-manga text-lg font-bold text-manga-ink truncate max-w-[200px] group-hover:text-manga-red transition-colors">
                      {rank.title}
                    </h4>
                    <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">
                      {rank.votes.toLocaleString()} LƯỢT ĐỌC
                    </p>
                  </div>
                </div>
                
                <div className={`flex flex-col items-end gap-1 font-black ${rank.trend === 'up' ? 'text-emerald-600' : 'text-manga-red'}`}>
                  <div className="flex items-center gap-1 text-sm bg-white border-2 border-current px-2 py-0.5 rounded-full shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    {rank.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{rank.trend === 'up' ? '+' : '-'}{rank.changePercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => alert('Đang tải báo cáo đầy đủ...')}
            className="w-full mt-6 py-3 bg-manga-ink text-white font-manga font-bold text-sm uppercase border-4 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all"
          >
            XEM BÁO CÁO TOÀN BỘ
          </button>
        </div>

        {/* Right Column: Analytics & Retention */}
        <div className="flex flex-col gap-8 h-full">
          {/* Reader Retention Bar Chart Widget */}
          <div className="bg-white border-4 border-manga-ink p-6 shadow-[8px_8px_0px_rgba(15,15,15,1)] flex-1">
            <h3 className="font-manga text-2xl font-black uppercase border-b-4 border-manga-ink pb-4 mb-6 tracking-tight flex items-center justify-between">
              <span>TỈ LỆ GIỮ CHÂN</span>
              <span className="text-sm bg-zinc-200 px-3 py-1 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]">7 NGÀY QUA</span>
            </h3>
            
            {/* Inline SVG Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-3 border-b-4 border-manga-ink pb-2 mb-4 relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 z-0">
                <div className="border-b-2 border-dashed border-manga-ink w-full"></div>
                <div className="border-b-2 border-dashed border-manga-ink w-full"></div>
                <div className="border-b-2 border-dashed border-manga-ink w-full"></div>
                <div className="border-b-2 border-dashed border-manga-ink w-full"></div>
              </div>

              {[45, 62, 55, 71, 85, 50, 58].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end z-10">
                  <span className="absolute -top-8 bg-manga-ink text-white text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none border-2 border-manga-ink">
                    {val}% ĐỘC GIẢ
                  </span>
                  <div 
                    className={`w-full border-4 border-manga-ink border-b-0 transition-all duration-300 origin-bottom ${
                      idx === 4 ? 'bg-manga-red' : 'bg-zinc-800 group-hover:bg-manga-red'
                    }`}
                    style={{ height: `${val}%` }}
                  />
                  {/* Day Label */}
                  <span className="text-[10px] font-black mt-2 uppercase">T{idx + 2}</span>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 font-extrabold uppercase text-center leading-tight tracking-wider mt-4">
              BIỂU ĐỒ HOẠT ĐỘNG CỦA ĐỘC GIẢ TOÀN NỀN TẢNG
            </p>
          </div>

          {/* Quick Notice Widget */}
          <div className="bg-manga-red border-4 border-manga-ink p-6 shadow-[8px_8px_0px_rgba(15,15,15,1)] text-white relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-20">
              <AlertCircle className="w-48 h-48" />
            </div>
            <h3 className="font-manga text-xl font-black uppercase mb-2 relative z-10 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              THÔNG BÁO NỘI BỘ
            </h3>
            <p className="font-bold text-sm relative z-10 mb-4 opacity-90">
              Cuộc họp giao ban tuần này sẽ tập trung vào chiến lược phát triển nội dung mới. Tất cả biên tập viên vui lòng hoàn thành duyệt các bản thảo tồn đọng trước thứ Sáu.
            </p>
            <button className="bg-white text-manga-red font-manga font-bold text-sm px-4 py-2 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase hover:bg-zinc-100 transition-colors relative z-10">
              XÁC NHẬN ĐÃ ĐỌC
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// Reusable Metric Card Component
function MetricCard({ title, value, icon, trend, isAlert = false, alertColor = 'text-manga-red', valueSize = 'text-5xl' }: any) {
  return (
    <div className={`bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_rgba(15,15,15,1)] transition-all flex flex-col justify-between group cursor-default relative overflow-hidden ${isAlert ? 'animate-pulse-slow' : ''}`}>
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
        {React.cloneElement(icon, { className: 'w-24 h-24' })}
      </div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="font-manga text-sm font-black uppercase text-gray-500 tracking-wider w-2/3 leading-tight group-hover:text-manga-ink transition-colors">
          {title}
        </h3>
        <div className={`p-2 border-2 border-manga-ink rounded-lg bg-zinc-50 shadow-[2px_2px_0px_rgba(0,0,0,1)] ${isAlert ? alertColor : 'text-manga-ink'}`}>
          {icon}
        </div>
      </div>
      
      <div className="relative z-10">
        <div className={`font-manga font-black ${valueSize} tracking-tighter mb-1 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)] ${isAlert ? alertColor : 'text-manga-ink'}`}>
          {value}
        </div>
        <div className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      </div>
    </div>
  )
}
