import React, { useState, useEffect } from 'react'
import { TrendingUp, Clock, AlertTriangle, Layers, BookOpen, Loader2 } from 'lucide-react'
import assistantService, {
  DashboardOverview,
  DashboardPerformance,
  PerformanceBySeriesItem,
  PerformanceByChapterItem
} from '@/services/assistant.service'

export default function PerformanceCharts() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [performance, setPerformance] = useState<DashboardPerformance | null>(null)
  const [bySeries, setBySeries] = useState<PerformanceBySeriesItem[]>([])
  const [byChapter, setByChapter] = useState<PerformanceByChapterItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [overviewData, perfData, seriesData, chapterData] = await Promise.all([
        assistantService.getOverview(),
        assistantService.getPerformance(),
        assistantService.getBySeries(),
        assistantService.getByChapter()
      ])
      setOverview(overviewData)
      setPerformance(perfData)
      setBySeries(seriesData || [])
      setByChapter(chapterData || [])
    } catch (err: any) {
      console.error('Lỗi lấy thống kê hiệu suất:', err)
      setError('Không thể tải dữ liệu thống kê hiệu suất. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center flex-col gap-2">
        <Loader2 className="w-10 h-10 animate-spin text-[#E63946]" />
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Đang tính toán hiệu suất...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-4 border-black p-6 text-center shadow-[6px_6px_0px_rgba(0,0,0,1)] max-w-lg mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-[#E63946] mx-auto mb-3 stroke-[2.5]" />
        <h3 className="font-manga text-xl font-bold uppercase text-black mb-2">Đã xảy ra lỗi</h3>
        <p className="text-xs font-semibold text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchPerformanceData}
          className="bg-black text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider border-2 border-black hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
        >
          Tải lại dữ liệu
        </button>
      </div>
    )
  }

  const completionRate = performance?.completion_rate_pct ?? 0
  const avgHours = performance?.avg_completion_hours ?? 'N/A'

  // Colors mapping for status bars
  const statusColors: Record<string, { bg: string; text: string }> = {
    completed: { bg: 'bg-[#2A9D8F]', text: 'text-white' },
    in_progress: { bg: 'bg-[#457B9D]', text: 'text-white' },
    needs_revision: { bg: 'bg-[#E63946]', text: 'text-white' },
    submitted: { bg: 'bg-[#E9C46A]', text: 'text-black' },
    assigned: { bg: 'bg-[#A0AEC0]', text: 'text-white' },
    rejected: { bg: 'bg-zinc-800', text: 'text-white' },
    cancelled: { bg: 'bg-zinc-400', text: 'text-white' },
  }

  const statusLabels: Record<string, string> = {
    completed: 'ĐÃ DUYỆT',
    in_progress: 'ĐANG LÀM',
    needs_revision: 'CẦN SỬA',
    submitted: 'CHỜ DUYỆT',
    assigned: 'CHỜ NHẬN',
    rejected: 'BỊ TỪ CHỐI',
    cancelled: 'ĐÃ HỦY',
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 3 Core Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completion Rate Card */}
        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-[#2A9D8F] border-b-4 border-l-4 border-black px-3 py-1 font-black text-[10px] text-white uppercase tracking-wider">
            Tỉ lệ hoàn thành
          </div>
          <div>
            <div className="flex items-center gap-2 text-[#2A9D8F] mb-4">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
              <h3 className="font-manga font-bold text-xs uppercase tracking-wider text-black">TỈ LỆ ĐẠT</h3>
            </div>
            <div className="font-manga text-[72px] leading-none font-bold text-black flex items-baseline gap-1">
              {completionRate}
              <span className="text-2xl font-black">%</span>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full h-4 bg-gray-100 border-2 border-black relative rounded-none overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-[#2A9D8F]"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase mt-2">
              Đã duyệt {performance?.completed_tasks} / {performance?.total_tasks} tổng nhiệm vụ
            </p>
          </div>
        </div>

        {/* Avg Completion Time Card */}
        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-[#457B9D] border-b-4 border-l-4 border-black px-3 py-1 font-black text-[10px] text-white uppercase tracking-wider">
            Thời gian TB
          </div>
          <div>
            <div className="flex items-center gap-2 text-[#457B9D] mb-4">
              <Clock className="w-6 h-6 stroke-[2.5]" />
              <h3 className="font-manga font-bold text-xs uppercase tracking-wider text-black">THỜI GIAN HOÀN THÀNH</h3>
            </div>
            <div className="font-manga text-[72px] leading-none font-bold text-black flex items-baseline gap-1">
              {avgHours}
              {avgHours !== 'N/A' && <span className="text-2xl font-black">GIỜ</span>}
            </div>
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase mt-6">
            Tính từ lúc nhấn "Bắt đầu" đến khi Mangaka "Phê duyệt"
          </p>
        </div>

        {/* Overdue Card */}
        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-[#E63946] border-b-4 border-l-4 border-black px-3 py-1 font-black text-[10px] text-white uppercase tracking-wider">
            Quá hạn
          </div>
          <div>
            <div className="flex items-center gap-2 text-[#E63946] mb-4">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
              <h3 className="font-manga font-bold text-xs uppercase tracking-wider text-black">Nhiệm vụ quá hạn</h3>
            </div>
            <div className="font-manga text-[72px] leading-none font-bold text-[#E63946]">
              {overview?.overdue_tasks ?? 0}
            </div>
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase mt-6">
            Cần hoàn thành gấp để tránh ảnh hưởng lịch xuất bản
          </p>
        </div>
      </div>

      {/* Task Status Breakdown Section */}
      <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
        <h3 className="font-manga font-bold text-sm uppercase tracking-wider text-black mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 stroke-[2.5]" /> PHÂN BỐ TRẠNG THÁI NHIỆM VỤ
        </h3>

        {/* Breakdown bar */}
        <div className="w-full h-8 bg-gray-100 border-2 border-black flex overflow-hidden mb-6">
          {Object.entries(overview || {}).map(([key, value]) => {
            if (
              [
                'assistant_id',
                'total_tasks',
                'overdue_tasks',
                'created_at',
                'updated_at'
              ].includes(key)
            )
              return null
            const count = value as number
            if (!count || count <= 0) return null
            const pct = overview?.total_tasks ? (count / overview.total_tasks) * 100 : 0
            const style = statusColors[key] || { bg: 'bg-gray-400', text: 'text-white' }

            return (
              <div
                key={key}
                className={`${style.bg} h-full flex items-center justify-center`}
                style={{ width: `${pct}%` }}
                title={`${statusLabels[key] || key}: ${count} (${pct.toFixed(1)}%)`}
              >
                {pct > 8 && (
                  <span className={`text-[10px] font-black uppercase ${style.text}`}>
                    {count}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Object.entries(statusLabels).map(([statusKey, label]) => {
            const count = (overview as any)?.[statusKey] || 0
            const colors = statusColors[statusKey]
            return (
              <div key={statusKey} className="flex items-center gap-2 border border-gray-200 p-2 bg-zinc-50">
                <span className={`w-3 h-3 border border-black ${colors.bg}`} />
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-black truncate">{label}</p>
                  <p className="text-xs font-black text-gray-500 leading-none">{count} task</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Series & Chapters Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Series Breakdown */}
        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <h3 className="font-manga font-bold text-sm uppercase tracking-wider text-black mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-manga-red stroke-[2.5]" /> TIẾN ĐỘ THEO SERIES (BỘ TRUYỆN)
          </h3>

          {bySeries.length === 0 ? (
            <p className="text-xs font-bold text-gray-400 uppercase text-center py-6">Chưa tham gia dự án nào</p>
          ) : (
            <div className="space-y-4">
              {bySeries.map((item) => {
                const pct = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0
                return (
                  <div key={item.series_id} className="border-2 border-black p-4 bg-zinc-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-sm font-black text-black leading-tight truncate max-w-[200px]" title={item.title}>
                          {item.title}
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                          Đã duyệt {item.completed} / {item.total} nhiệm vụ
                        </p>
                      </div>
                      <span className="bg-[#FFEBEB] text-[#E63946] border border-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                        {pct}%
                      </span>
                    </div>

                    <div className="w-full h-3 bg-gray-200 border-2 border-black rounded-none overflow-hidden relative">
                      <div
                        className="absolute top-0 left-0 h-full bg-[#E63946]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Chapter Breakdown */}
        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <h3 className="font-manga font-bold text-sm uppercase tracking-wider text-black mb-6 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#457B9D] stroke-[2.5]" /> TIẾN ĐỘ THEO CHAPTER (CHƯƠNG)
          </h3>

          {byChapter.length === 0 ? (
            <p className="text-xs font-bold text-gray-400 uppercase text-center py-6">Chưa có thông tin chương truyện</p>
          ) : (
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {byChapter.map((item) => {
                const pct = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0
                return (
                  <div key={item.chapter_id} className="border-2 border-black p-3 bg-zinc-50 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-black truncate" title={item.title}>
                        {item.title}
                      </h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">
                        Hoàn thành {item.completed} / {item.total}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-200 border border-black rounded-none overflow-hidden relative hidden sm:block">
                        <div
                          className="absolute top-0 left-0 h-full bg-[#457B9D]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-black bg-[#EBF8FF] px-2 py-0.5 border border-[#4299E1] rounded-sm">
                        {pct}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
