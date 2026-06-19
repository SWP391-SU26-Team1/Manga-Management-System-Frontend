import React, { useEffect, useState } from 'react'
import { Calendar, Download, FileText, BarChart2, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import assistantService, { DashboardPerformance, DashboardOverview } from '@/services/assistant.service'

interface MonthlyReport {
  month: string
  desc: string
  date: string
  pages: number
  tasks: number
  approved: number
  pending: number
}

export default function ReportsPage() {
  const [performance, setPerformance] = useState<DashboardPerformance | null>(null)
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [reports, setReports] = useState<MonthlyReport[]>([])
  const [weeklyPages, setWeeklyPages] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [perfData, overData, breakdownData] = await Promise.all([
          assistantService.getPerformance(),
          assistantService.getOverview(),
          assistantService.getBreakdown()
        ])

        setPerformance(perfData)
        setOverview(overData)

        // 1. Group tasks by month dynamically
        const monthlyGroups: Record<string, { tasks: number; approved: number; pending: number }> = {}
        const today = new Date()
        const weekCounts = [0, 0, 0, 0, 0, 0, 0] // index 0 = T2 (Monday), etc.

        breakdownData.forEach(task => {
          if (!task.deadline) return
          const date = new Date(task.deadline)
          if (isNaN(date.getTime())) return

          // Grouping by Month: YYYY-MM
          const year = date.getFullYear()
          const monthStr = String(date.getMonth() + 1).padStart(2, '0')
          const key = `${year}-${monthStr}`

          if (!monthlyGroups[key]) {
            monthlyGroups[key] = { tasks: 0, approved: 0, pending: 0 }
          }

          monthlyGroups[key].tasks++
          if (task.status === 'completed' || task.status === 'approved') {
            monthlyGroups[key].approved++
          } else if (['assigned', 'in_progress', 'submitted', 'needs_revision', 'rejected'].includes(task.status)) {
            monthlyGroups[key].pending++
          }

          // Calculate weekly completed tasks (pages) in last 7 days
          if (task.status === 'completed' || task.status === 'approved') {
            const diffTime = today.getTime() - date.getTime()
            const diffDays = diffTime / (1000 * 60 * 60 * 24)
            if (diffDays >= 0 && diffDays <= 7) {
              const day = date.getDay()
              const idx = day === 0 ? 6 : day - 1 // Sunday is index 6, Monday is index 0
              weekCounts[idx]++
            }
          }
        })

        // Parse reports array
        const reportsList: MonthlyReport[] = Object.keys(monthlyGroups)
          .sort((a, b) => b.localeCompare(a))
          .map(key => {
            const [year, month] = key.split('-')
            const monthNames = [
              'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
              'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
            ]
            const monthIndex = parseInt(month, 10) - 1
            const label = `${monthNames[monthIndex]}, ${year}`
            const val = monthlyGroups[key]

            return {
              month: label,
              desc: val.tasks > 0 ? 'Tải xuống PDF' : 'Đang cập nhật...',
              date: `28/${month}/${year}`,
              pages: val.approved, // each completed task counts as an approved page
              tasks: val.tasks,
              approved: val.approved,
              pending: val.pending
            }
          })

        // If no tasks exist, supply current month default empty report
        if (reportsList.length === 0) {
          const label = `Tháng ${today.getMonth() + 1}, ${today.getFullYear()}`
          setReports([{
            month: label,
            desc: 'Đang cập nhật...',
            date: `${today.getDate()}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`,
            pages: 0,
            tasks: 0,
            approved: 0,
            pending: 0
          }])
        } else {
          setReports(reportsList)
        }

        setWeeklyPages(weekCounts)
      } catch (err: any) {
        console.error('Lỗi tải dữ liệu báo cáo:', err)
        setError('Không thể kết nối danh sách báo cáo hiệu suất từ API.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-manga-red" />
        <p className="font-bold uppercase text-gray-500">Đang tải báo cáo hiệu suất...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 flex flex-col items-center gap-3">
        <AlertCircle className="w-12 h-12" />
        <p className="font-bold uppercase text-lg">{error}</p>
      </div>
    )
  }

  const totalPages = reports.reduce((acc, r) => acc + r.pages, 0)
  const totalTasks = reports.reduce((acc, r) => acc + r.tasks, 0)
  const totalApproved = reports.reduce((acc, r) => acc + r.approved, 0)
  const totalPending = reports.reduce((acc, r) => acc + r.pending, 0)

  // Monthly tasks chart data (up to last 5 months)
  const last5Reports = reports.slice(0, 5).reverse()
  const monthlyTasksValues = last5Reports.map(r => r.tasks)
  const monthlyTasksLabels = last5Reports.map(r => r.month.split(',')[0].replace('Tháng ', 'Th'))
  
  const maxWeeklyPages = Math.max(...weeklyPages, 1)
  const maxMonthlyTasks = Math.max(...monthlyTasksValues, 1)

  // Current month label helper
  const currentMonthLabel = reports[0]?.month || 'Tháng này'
  const currentMonthPages = reports[0]?.pages || 0
  const currentMonthTasks = reports[0]?.tasks || 0
  const currentMonthApproved = reports[0]?.approved || 0

  // Previous month label helper
  const prevMonthLabel = reports[1]?.month || 'Tháng trước'
  const prevMonthPages = reports[1]?.pages || 0
  const prevMonthTasks = reports[1]?.tasks || 0

  const pagesDiffText = reports[1] 
    ? `${currentMonthPages - prevMonthPages >= 0 ? '+' : ''}${currentMonthPages - prevMonthPages} trang so với tháng trước`
    : 'Tháng đầu tiên'

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-manga text-[32px] font-bold uppercase text-manga-ink leading-tight">
            BÁO CÁO HIỆU SUẤT
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Thống kê trang đã duyệt và nhiệm vụ theo từng tháng của trợ lý
          </p>
        </div>
        <div className="relative">
          <button className="flex items-center gap-2 bg-white border-2 border-manga-ink px-4 py-2 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
            <Calendar className="w-4 h-4" /> {reports[0]?.month || 'Tháng này'}
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            <FileText className="w-3 h-3 text-[#E63946]" /> TỔNG TRANG ĐÃ DUYỆT (TẤT CẢ)
          </div>
          <div>
            <div className="font-manga text-[40px] leading-none font-bold text-[#E63946]">{totalApproved}</div>
            <div className="text-[10px] font-semibold text-gray-400 mt-1 uppercase">{totalPages} trang / {reports.length} tháng hoạt động</div>
          </div>
        </div>

        <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            <CheckCircle className="w-3 h-3 text-[#48BB78]" /> TỔNG NHIỆM VỤ HOÀN THÀNH
          </div>
          <div>
            <div className="font-manga text-[40px] leading-none font-bold text-[#48BB78]">{performance?.completed_tasks ?? 0}</div>
            <div className="text-[10px] font-semibold text-gray-400 mt-1 uppercase">Trên tổng số {performance?.total_tasks ?? 0} nhiệm vụ</div>
          </div>
        </div>

        <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            <BarChart2 className="w-3 h-3 text-[#4299E1]" /> TRANG DUYỆT - {currentMonthLabel}
          </div>
          <div>
            <div className="font-manga text-[40px] leading-none font-bold text-[#4299E1]">{currentMonthPages}</div>
            <div className="text-[10px] font-semibold text-gray-400 mt-1 uppercase">{pagesDiffText}</div>
          </div>
        </div>

        <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            <CheckCircle className="w-3 h-3 text-[#F6AD55]" /> NHIỆM VỤ - {currentMonthLabel}
          </div>
          <div>
            <div className="font-manga text-[40px] leading-none font-bold text-[#F6AD55]">{currentMonthApproved}</div>
            <div className="text-[10px] font-semibold text-gray-400 mt-1 uppercase">HOÀN THÀNH / {currentMonthTasks} TỔNG SỐ</div>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-[#1A1A1A] text-white px-6 py-4 border-2 border-manga-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[#E63946] text-lg font-bold">⚡</span>
          <span className="font-bold text-sm tracking-wider uppercase">HIỆU SUẤT HIỆN TẠI</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
          <div className="flex flex-col text-right">
            <span className="text-gray-400 text-[10px]">{currentMonthLabel}</span>
            <span className="text-white">{currentMonthPages} TRANG ({currentMonthApproved} NHIỆM VỤ)</span>
          </div>
          <div className="w-px h-8 bg-gray-700"></div>
          <div className="flex flex-col text-right">
            <span className="text-gray-400 text-[10px]">{prevMonthLabel}</span>
            <span className="text-gray-300">{prevMonthPages} TRANG ({prevMonthTasks} NHIỆM VỤ)</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Weekly Pages Chart */}
        <div className="bg-white border-2 border-manga-ink p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-manga-ink">TRANG DUYỆT HÀNG TUẦN</h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Các trang đã hoàn thành trong 7 ngày gần nhất</p>
            </div>
            <span className="border border-gray-300 px-3 py-1 text-xs font-bold text-gray-600 bg-gray-50">7 ngày qua</span>
          </div>
          
          <div className="relative h-[200px] flex items-end justify-between gap-2 border-l border-b border-gray-200 pb-2 pl-2">
            {/* Y-axis labels */}
            <div className="absolute -left-6 bottom-0 top-0 flex flex-col justify-between text-[10px] text-gray-400 font-bold py-2">
              <span>{Math.round(maxWeeklyPages)}-</span>
              <span>{Math.round(maxWeeklyPages * 0.75)}-</span>
              <span>{Math.round(maxWeeklyPages * 0.5)}-</span>
              <span>{Math.round(maxWeeklyPages * 0.25)}-</span>
              <span>0-</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-0 right-0 bottom-[25%] h-px border-t border-dashed border-gray-200"></div>
            <div className="absolute left-0 right-0 bottom-[50%] h-px border-t border-dashed border-gray-200"></div>
            <div className="absolute left-0 right-0 bottom-[75%] h-px border-t border-dashed border-gray-200"></div>
            <div className="absolute left-0 right-0 top-0 h-px border-t border-dashed border-gray-200"></div>

            {/* Bars */}
            {weeklyPages.map((val, i) => (
              <div key={i} className="relative flex flex-col items-center flex-1 group z-10">
                <div 
                  className="w-full max-w-[40px] bg-[#E63946] border border-[#B02A35] transition-all group-hover:opacity-80 flex items-end justify-center"
                  style={{ height: `${(val / maxWeeklyPages) * 100}%` }}
                >
                  {val > 0 && <span className="text-[9px] font-bold text-white mb-1">{val}</span>}
                </div>
                <div className="absolute -bottom-6 text-[10px] font-bold text-gray-400">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Tasks Chart */}
        <div className="bg-white border-2 border-manga-ink p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-manga-ink">XU HƯỚNG NHIỆM VỤ</h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Xu hướng tổng số công việc theo từng tháng</p>
            </div>
          </div>
          
          <div className="relative h-[200px] flex items-end justify-between gap-2 border-l border-b border-gray-200 pb-2 pl-2">
            {/* Y-axis labels */}
            <div className="absolute -left-6 bottom-0 top-0 flex flex-col justify-between text-[10px] text-gray-400 font-bold py-2">
              <span>{Math.round(maxMonthlyTasks)}-</span>
              <span>{Math.round(maxMonthlyTasks * 0.75)}-</span>
              <span>{Math.round(maxMonthlyTasks * 0.5)}-</span>
              <span>{Math.round(maxMonthlyTasks * 0.25)}-</span>
              <span>0-</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-0 right-0 bottom-[25%] h-px border-t border-dashed border-gray-200"></div>
            <div className="absolute left-0 right-0 bottom-[50%] h-px border-t border-dashed border-gray-200"></div>
            <div className="absolute left-0 right-0 bottom-[75%] h-px border-t border-dashed border-gray-200"></div>
            <div className="absolute left-0 right-0 top-0 h-px border-t border-dashed border-gray-200"></div>

            {/* Bars */}
            {monthlyTasksValues.map((val, i) => (
              <div key={i} className="relative flex flex-col items-center flex-1 group z-10">
                <div 
                  className="w-full max-w-[40px] bg-[#48BB78] border border-[#38A169] transition-all group-hover:opacity-80 flex items-end justify-center"
                  style={{ height: `${(val / maxMonthlyTasks) * 100}%` }}
                >
                  {val > 0 && <span className="text-[9px] font-bold text-white mb-1">{val}</span>}
                </div>
                <div className="absolute -bottom-6 text-[10px] font-bold text-gray-400">
                  {monthlyTasksLabels[i] || 'Chưa rõ'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-manga-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-xs uppercase tracking-wider">BÁO CÁO HÀNG THÁNG (PDF)</h2>
          <span className="text-[10px] font-bold text-gray-400 uppercase">{reports.length} báo cáo hiệu suất từ API</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-manga-ink text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-4 px-6">BÁO CÁO</th>
                <th className="py-4 px-6 text-center">NGÀY</th>
                <th className="py-4 px-6 text-center">TRANG DUYỆT</th>
                <th className="py-4 px-6 text-center">NHIỆM VỤ</th>
                <th className="py-4 px-6 text-center">ĐÃ DUYỆT</th>
                <th className="py-4 px-6 text-center">CHỜ DUYỆT</th>
                <th className="py-4 px-6 text-right">TẢI XUỐNG</th>
              </tr>
            </thead>
            <tbody className="divide-y border-manga-ink">
              {reports.map((report, idx) => (
                <tr key={idx} className={`hover:bg-gray-50 transition-colors ${idx === 0 ? 'bg-[#FFF5F5]' : ''}`}>
                  <td className="py-5 px-6">
                    <div className="flex items-start gap-3">
                      <FileText className={`w-5 h-5 ${idx === 0 ? 'text-[#E63946]' : 'text-gray-400'}`} />
                      <div>
                        <div className="font-bold text-sm text-manga-ink">{report.month}</div>
                        <div className={`text-[10px] font-bold mt-1 uppercase ${idx === 0 ? 'text-[#E63946]' : 'text-gray-400'}`}>
                          {report.desc}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center text-xs font-semibold text-gray-500">{report.date}</td>
                  <td className="py-5 px-6 text-center font-bold text-[#E63946] text-sm">{report.pages} trang</td>
                  <td className="py-5 px-6 text-center font-bold text-manga-ink text-sm">{report.tasks}</td>
                  <td className="py-5 px-6 text-center font-bold text-[#48BB78] text-sm">{report.approved}</td>
                  <td className="py-5 px-6 text-center font-bold text-[#F6AD55] text-sm">{report.pending}</td>
                  <td className="py-5 px-6 text-right">
                    <button 
                      onClick={() => alert(`Đang chuẩn bị tạo file PDF báo cáo cho ${report.month}...`)}
                      className="bg-[#E63946] hover:bg-[#B02A35] transition-colors text-white px-4 py-2 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 text-[10px] font-bold ml-auto active:translate-y-[2px] active:shadow-none cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#1A1A1A] text-white">
                <td colSpan={2} className="py-4 px-6 font-bold text-xs uppercase tracking-wider">
                  TỔNG CỘNG ({reports.length} THÁNG)
                </td>
                <td className="py-4 px-6 text-center font-bold text-[#E63946] text-sm">{totalPages} trang</td>
                <td className="py-4 px-6 text-center font-bold text-sm">{totalTasks}</td>
                <td className="py-4 px-6 text-center font-bold text-[#48BB78] text-sm">{totalApproved}</td>
                <td className="py-4 px-6 text-center font-bold text-[#F6AD55] text-sm">{totalPending}</td>
                <td className="py-4 px-6"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
