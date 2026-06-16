import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { CheckSquare, Square, TrendingUp, TrendingDown, Clock, ArrowRight, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { boardStore, QueueChapter, TodayTask, WeeklyRanking } from '@/data/boardMockData'
import { boardService } from '@/services/board.service'
import { rankingService } from '@/services/ranking.service'

export default function ChiefDashboardPage() {
  const [chapters, setChapters] = useState<QueueChapter[]>([])
  const [tasks, setTasks] = useState<TodayTask[]>([])
  const [rankings, setRankings] = useState<WeeklyRanking[]>([])
  const [newTask, setNewTask] = useState('')

  useEffect(() => {
    const loadData = async () => {
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
        setChapters(boardStore.getQueueChapters())
      }

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
        setTasks(boardStore.getTodayTasks())
      }

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
        setRankings(boardStore.getWeeklyRankings())
      }
    }
    loadData()
  }, [])

  const handleToggleTask = async (taskId: string) => {
    try {
      await boardService.toggleTask(taskId)
    } catch (err) {
      console.warn('API error toggling task, using fallback:', err)
    }
    boardStore.toggleTask(taskId)
    setTasks(boardStore.getTodayTasks())
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return
    const updated = [...tasks, { id: `t_${Date.now()}`, content: newTask.trim(), done: false }]
    setTasks(updated)
    boardStore.setTodayTasks(updated)
    setNewTask('')
  }

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = tasks.filter(t => t.id !== taskId)
    setTasks(updated)
    boardStore.setTodayTasks(updated)
  }

  const urgentCount = chapters.filter(c => c.isUrgent || c.timeLeftLabel === 'URGENT').length

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans text-manga-ink">
      {/* Welcome Banner */}
      <div className="bg-[#fcf5f5] border-4 border-manga-ink p-8 mb-8 relative overflow-hidden shadow-[8px_8px_0px_rgba(15,15,15,1)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none mb-3">
              ĐIỀU HÀNH BIÊN TẬP (CHIEF)
            </h1>
            <p className="text-sm font-bold text-gray-700 max-w-2xl leading-relaxed">
              Cổng quản trị tối cao của Trưởng ban Biên tập. Phê duyệt các chương truyện chờ duyệt, giám sát xếp hạng, quản lý giao thức và xử lý các cảnh báo toàn hệ thống.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Waiting Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b-4 border-manga-ink pb-3">
            <h2 className="font-manga text-2xl font-black uppercase tracking-tight">
              DANH SÁCH CHỜ DUYỆT (12 CHAPTER)
            </h2>
            <span className="bg-manga-red text-white font-bold text-xs px-3 py-1 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              {chapters.length} CHAPTERS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chapters.map((chapter) => (
              <div 
                key={chapter.id} 
                className="bg-white border-4 border-manga-ink p-4 shadow-[6px_6px_0px_rgba(15,15,15,1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_rgba(15,15,15,1)] transition-all flex flex-col justify-between"
              >
                <div>
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

                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-24 border-2 border-manga-ink overflow-hidden bg-zinc-100 flex-shrink-0 shadow-[2px_2px_0px_rgba(15,15,15,1)]">
                      <img 
                        src={chapter.coverUrl} 
                        alt={chapter.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-manga text-xl font-bold uppercase truncate leading-none mb-1 text-manga-ink" title={chapter.title}>
                        {chapter.title}
                      </h3>
                      <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wide mb-3">
                        {chapter.genre}
                      </p>

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

        {/* Right Column: Chief-Only and General Widgets */}
        <div className="space-y-8">
          {/* CẢNH BÁO HỆ THỐNG Widget (Chief Only) */}
          <div className="bg-[#fff1f2] border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <h3 className="font-manga text-xl font-black uppercase border-b-4 border-manga-ink pb-2 mb-4 text-manga-red flex items-center gap-2">
              <span>CẢNH BÁO HỆ THỐNG</span>
            </h3>
            
            <div className="space-y-4">
              <div className="border-2 border-manga-ink bg-white p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-manga text-xs font-black uppercase text-manga-ink">SHADOW PROTOCOL</span>
                  <span className="bg-manga-red text-white text-[8px] font-black border-2 border-manga-ink px-1.5 py-0.5 uppercase tracking-tighter">RPI RO</span>
                </div>
                <p className="text-[10px] text-gray-600 font-bold leading-normal">
                  3 tuần liên tiếp dưới hạng 40. Đang chờ xem xét phục hồi.
                </p>
              </div>
              
              <div className="border-2 border-manga-ink bg-white p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-manga text-xs font-black uppercase text-manga-ink">INK & DAGGERS</span>
                  <span className="bg-zinc-800 text-white text-[8px] font-black border-2 border-manga-ink px-1.5 py-0.5 uppercase tracking-tighter">TẠM NGƯNG</span>
                </div>
                <p className="text-[10px] text-gray-600 font-bold leading-normal">
                  Chương 104 bị trì hoãn xuất bản. Đang đóng băng lịch.
                </p>
              </div>

              <Link to="/dashboard/editorial-board/disputes/MF-8492" className="border-2 border-manga-ink bg-white p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)] block hover:bg-red-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-manga text-xs font-black uppercase text-manga-ink">BÓNG ĐÊM VÔ TẬN</span>
                  <span className="bg-amber-500 text-white text-[8px] font-black border-2 border-manga-ink px-1.5 py-0.5 uppercase tracking-tighter">TRANH CHẤP</span>
                </div>
                <p className="text-[10px] text-gray-600 font-bold leading-normal">
                  Mâu thuẫn kịch bản chương 45 giữa Mangaka & BTV. Cần phán quyết tối hậu.
                </p>
              </Link>
            </div>

            <Link
              to="/dashboard/editorial-board/recovery"
              className="w-full mt-4 py-2 bg-manga-red text-white border-2 border-black font-manga font-bold text-xs uppercase text-center block shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-red-700 hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all"
            >
              XEM TẤT CẢ NHBT KỲ
            </Link>
          </div>

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
              className="w-full mt-4 py-2 bg-manga-ink text-white font-manga font-bold text-xs uppercase border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-manga-red hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              Báo cáo phân tích độc giả
            </button>
          </div>

          {/* Reader Retention Bar Chart Widget */}
          <div className="bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <h3 className="font-manga text-xl font-black uppercase border-b-4 border-manga-ink pb-2 mb-4">
              TỈ LỆ GIỮ CHÂN ĐỘC GIẢ
            </h3>
            
            <div className="h-32 flex items-end justify-between gap-2 border-b-2 border-manga-ink pb-2 mb-3">
              {[45, 62, 55, 71, 85, 50, 58].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
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

          {/* Checklist Task Widget: Chief Managed */}
          <div className="bg-white border-4 border-manga-ink p-5 shadow-[6px_6px_0px_rgba(15,15,15,1)]">
            <h3 className="font-manga text-xl font-black uppercase border-b-4 border-manga-ink pb-2 mb-4">
              XỬ LÝ GIAO THỨC HÔM NAY
            </h3>

            {/* Input form to add new tasks */}
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                placeholder="Thêm nhiệm vụ cụ thể..."
                className="flex-1 border-2 border-manga-ink px-3 py-1.5 text-xs font-bold bg-zinc-50 outline-none focus:border-manga-red"
              />
              <button
                type="submit"
                className="bg-manga-ink hover:bg-manga-red text-white border-2 border-manga-ink px-4 py-1 font-manga font-bold text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5"
              >
                +
              </button>
            </form>
            
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`flex items-start justify-between gap-2.5 p-2.5 border-2 border-manga-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer select-none transition-colors group ${
                    task.done ? 'bg-zinc-100 border-gray-400 text-gray-400' : 'bg-white text-manga-ink hover:bg-red-50/50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
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

                  <button
                    onClick={(e) => handleDeleteTask(task.id, e)}
                    className="text-gray-400 hover:text-manga-red bg-transparent border-0 cursor-pointer font-bold text-xs px-1 select-none focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xóa đầu việc"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
