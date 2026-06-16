import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { CheckSquare, Square, TrendingUp, TrendingDown, Clock, ArrowRight, AlertCircle } from 'lucide-react'
import { boardStore, QueueChapter, TodayTask, WeeklyRanking } from '@/data/boardMockData'
import { boardService } from '@/services/board.service'
import { rankingService } from '@/services/ranking.service'

export default function BoardDashboardPage() {
  const [chapters, setChapters] = useState<QueueChapter[]>([])
  const [tasks, setTasks] = useState<TodayTask[]>([])
  const [rankings, setRankings] = useState<WeeklyRanking[]>([])

  useEffect(() => {
    const loadData = async () => {
      // 1. Fetch queue chapters from real API
      try {
        const queueRes = await boardService.getQueueChapters()
        if (queueRes && queueRes.length > 0) {
          const adapted = queueRes.map((c: any) => ({
            id: c.chapter_id || c.id,
            title: c.title,
            chapterNumber: c.chapter_number,
            genre: c.genre || 'ACTION / SHONEN',
            progressLabel: c.progressLabel || 'EDIT',
            progressPercent: c.progressPercent || 75,
            timeLeftLabel: c.timeLeftLabel || '4h left',
            isUrgent: c.isUrgent || false,
            isNewSeries: c.isNewSeries || false,
            coverUrl: c.thumbnail_image_url || c.coverUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop'
          }))
          setChapters(adapted)
        } else {
          setChapters(boardStore.getQueueChapters())
        }
      } catch (err) {
        console.warn('API error fetching chapters, falling back to mock:', err)
        setChapters(boardStore.getQueueChapters())
      }

      // 2. Fetch tasks from real API
      try {
        const tasksRes = await boardService.getTodayTasks()
        if (tasksRes && tasksRes.length > 0) {
          setTasks(tasksRes.map((t: any) => ({
            id: t.id || t.task_id,
            content: t.content || t.description || 'Task',
            done: t.done || t.status === 'DONE'
          })))
        } else {
          setTasks(boardStore.getTodayTasks())
        }
      } catch (err) {
        console.warn('API error fetching tasks, falling back to mock:', err)
        setTasks(boardStore.getTodayTasks())
      }

      // 3. Fetch weekly rankings from real API
      try {
        const rankingRes = await rankingService.getWeekly()
        if (rankingRes && rankingRes.length > 0) {
          const adapted = rankingRes.map((r: any) => ({
            rank: r.rank,
            title: r.title,
            votes: r.views || r.votes || 12000,
            changePercent: r.score ? Math.floor((r.score % 10) + 1) : 4,
            trend: r.trend === 'down' ? 'down' as const : 'up' as const
          }))
          setRankings(adapted)
        } else {
          setRankings(boardStore.getWeeklyRankings())
        }
      } catch (err) {
        console.warn('API error fetching rankings, falling back to mock:', err)
        setRankings(boardStore.getWeeklyRankings())
      }
    }

    loadData()
  }, [])

  const handleToggleTask = async (taskId: string) => {
    try {
      await boardService.toggleTask(taskId)
    } catch (err) {
      console.warn('API error toggling task, toggling on mock store:', err)
    }
    boardStore.toggleTask(taskId)
    setTasks(boardStore.getTodayTasks())
  }

  // Calculate unread urgent reviews count
  const urgentCount = chapters.filter(c => c.isUrgent || c.timeLeftLabel === 'URGENT').length

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      {/* Welcome Banner */}
      <div className="bg-[#fcf5f5] border-4 border-manga-ink p-8 mb-8 relative overflow-hidden shadow-[8px_8px_0px_rgba(15,15,15,1)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none mb-3">
              ĐIỀU HÀNH BIÊN TẬP
            </h1>
            <p className="text-sm font-bold text-gray-700 max-w-2xl leading-relaxed">
              Cái nhìn tổng quan về bối cảnh xuất bản. Đánh giá các bản thảo mới, theo dõi biến động thứ hạng và can thiệp kịp thời vào các đầu truyện đang hoạt động kém hiệu quả.
            </p>
          </div>
          {urgentCount > 0 && (
            <div className="bg-manga-red text-white font-manga font-bold tracking-wider px-6 py-3 border-2 border-manga-ink shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase text-xs rotate-1 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{urgentCount} Hạn chốt khẩn cấp</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Waiting Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b-4 border-manga-ink pb-3">
            <h2 className="font-manga text-2xl font-black uppercase text-manga-ink tracking-tight">
              DANH SÁCH DUYỆT CHAPTER
            </h2>
            <span className="bg-manga-red text-white font-bold text-xs px-3 py-1 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              {chapters.length} ĐANG CHỜ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chapters.map((chapter) => (
              <div 
                key={chapter.id} 
                className="bg-white border-4 border-manga-ink p-4 shadow-[6px_6px_0px_rgba(15,15,15,1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_rgba(15,15,15,1)] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Badge Header */}
                  <div className="flex justify-between items-start mb-3">
                    {chapter.isNewSeries ? (
                      <span className="bg-manga-red text-white text-[9px] font-extrabold px-2 py-0.5 border-2 border-manga-ink uppercase tracking-wider">
                        NEW SERIES
                      </span>
                    ) : (
                      <span className="bg-manga-ink text-white text-[9px] font-extrabold px-2 py-0.5 border-2 border-manga-ink uppercase tracking-wider">
                        CH. {chapter.chapterNumber}
                      </span>
                    )}
                    
                    {chapter.isUrgent && (
                      <span className="text-[10px] text-manga-red font-black uppercase flex items-center gap-1 animate-pulse">
                        ⚠️ URGENT
                      </span>
                    )}
                  </div>

                  {/* Card Content Row */}
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-24 border-2 border-manga-ink overflow-hidden bg-zinc-100 flex-shrink-0 shadow-[2px_2px_0px_rgba(15,15,15,1)]">
                      <img 
                        src={chapter.coverUrl} 
                        alt={chapter.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-manga text-xl font-bold uppercase truncate leading-none text-manga-ink mb-1" title={chapter.title}>
                        {chapter.title}
                      </h3>
                      <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wide mb-3">
                        {chapter.genre}
                      </p>

                      {/* Custom Manga-style Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="uppercase text-gray-600">{chapter.progressLabel}</span>
                          <span>{chapter.progressPercent}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 border-2 border-manga-ink rounded-none overflow-hidden relative">
                          <div 
                            className="h-full bg-manga-red border-r-2 border-manga-ink" 
                            style={{ width: `${chapter.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between border-t-2 border-dashed border-gray-300 pt-3 mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span>{chapter.timeLeftLabel}</span>
                  </div>
                  <Link 
                    to={`/dashboard/editorial-board/review/${chapter.id}/draft`}
                    className="flex items-center gap-1 bg-manga-ink text-white font-manga font-bold text-xs uppercase px-4 py-1.5 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] transition-all cursor-pointer"
                  >
                    <span>REVIEW</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-8">
          {/* Weekly Ranking Widget */}
          <div className="bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <h3 className="font-manga text-xl font-black uppercase border-b-4 border-manga-ink pb-2 mb-4 flex items-center justify-between">
              <span>XẾP HẠNG TUẦN</span>
              <TrendingUp className="w-5 h-5 text-manga-red" />
            </h3>
            
            <div className="space-y-3">
              {rankings.map((rank) => (
                <div 
                  key={rank.rank}
                  className="flex items-center justify-between p-3 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-zinc-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-manga text-2xl font-black text-manga-red leading-none w-6">
                      {String(rank.rank).padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="font-manga text-sm font-bold text-manga-ink truncate max-w-[120px]">
                        {rank.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-bold">
                        {rank.votes.toLocaleString()} PHIẾU
                      </p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-0.5 text-xs font-black ${rank.trend === 'up' ? 'text-emerald-600' : 'text-manga-red'}`}>
                    {rank.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{rank.trend === 'up' ? '+' : '-'}{rank.changePercent}%</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => alert('Đang tải báo cáo phân tích độc giả...')}
              className="w-full mt-4 py-2 bg-manga-ink text-white font-manga font-bold text-xs uppercase border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              BÁO CÁO PHÂN TÍCH ĐỘC GIẢ
            </button>
          </div>

          {/* Reader Retention Bar Chart Widget */}
          <div className="bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <h3 className="font-manga text-xl font-black uppercase border-b-4 border-manga-ink pb-2 mb-4">
              TỈ LỆ GIỮ CHÂN ĐỘC GIẢ
            </h3>
            
            {/* Inline SVG Bar Chart */}
            <div className="h-32 flex items-end justify-between gap-2 border-b-2 border-manga-ink pb-2 mb-3">
              {[45, 62, 55, 71, 85, 50, 58].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <span className="absolute -top-6 bg-manga-ink text-white text-[9px] font-bold px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}%
                  </span>
                  <div 
                    className={`w-full border-2 border-manga-ink border-b-0 transition-colors shadow-sm ${
                      idx === 4 ? 'bg-manga-red group-hover:bg-red-700' : 'bg-zinc-800 group-hover:bg-manga-red'
                    }`}
                    style={{ height: `${val}%` }}
                  />
                </div>
              ))}
            </div>
            
            <p className="text-[10px] text-gray-500 font-extrabold uppercase text-center leading-tight tracking-wider">
              NGƯỜI ĐỌC HOẠT ĐỘNG HÀNG NGÀY (7 NGÀY QUA)
            </p>
          </div>

          {/* Checklist Task Widget */}
          <div className="bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <h3 className="font-manga text-xl font-black uppercase border-b-4 border-manga-ink pb-2 mb-4">
              VIỆC CẦN LÀM HÔM NAY
            </h3>
            
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`flex items-start gap-3 p-2.5 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer select-none transition-colors ${
                    task.done ? 'bg-zinc-100 border-gray-400 text-gray-400' : 'bg-white text-manga-ink hover:bg-red-50/50'
                  }`}
                >
                  <button className="shrink-0 mt-0.5 text-manga-red bg-transparent border-0 p-0 focus:outline-none cursor-pointer">
                    {task.done ? (
                      <CheckSquare className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Square className="w-4 h-4 text-manga-ink" />
                    )}
                  </button>
                  <span className={`text-xs font-bold leading-snug ${task.done ? 'line-through' : ''}`}>
                    {task.content}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
