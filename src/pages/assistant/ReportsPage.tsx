import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Calendar,
  TrendingUp,
  FileDown,
  ChevronDown,
  CheckCircle2
} from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface MonthlyReport {
  month: string
  date: string
  pages: number
  tasks: number
  approved: number
  pending: number
  income: number
  rate: number
  isCurrent?: boolean
}

const mockMonthlyReports: MonthlyReport[] = [
  {
    month: 'Tháng 5, 2026',
    date: '18/05/2026',
    pages: 68,
    tasks: 65,
    approved: 62,
    pending: 6,
    income: 3060,
    rate: 45,
    isCurrent: true
  },
  {
    month: 'Tháng 4, 2026',
    date: '30/04/2026',
    pages: 61,
    tasks: 61,
    approved: 58,
    pending: 3,
    income: 2745,
    rate: 45
  },
  {
    month: 'Tháng 3, 2026',
    date: '31/03/2026',
    pages: 55,
    tasks: 55,
    approved: 53,
    pending: 2,
    income: 2475,
    rate: 45
  },
  {
    month: 'Tháng 2, 2026',
    date: '28/02/2026',
    pages: 48,
    tasks: 48,
    approved: 47,
    pending: 1,
    income: 2160,
    rate: 45
  },
  {
    month: 'Tháng 1, 2026',
    date: '31/01/2026',
    pages: 42,
    tasks: 42,
    approved: 42,
    pending: 0,
    income: 1890,
    rate: 45
  }
]

export default function ReportsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [selectedMonth, setSelectedMonth] = useState('Tháng 5, 2026')
  const [selectedWeek, setSelectedWeek] = useState('Tuần 3')

  const handleDownloadPDF = (report: MonthlyReport) => {
    showToast(`Đang khởi tạo tải xuống báo cáo hiệu suất dạng PDF cho "${report.month}"...`)
  }

  // Weekly data for bar chart (mockup values)
  const weeklyData = [
    { day: 'T2', value: 8 },
    { day: 'T3', value: 17 },
    { day: 'T4', value: 10 },
    { day: 'T5', value: 15 },
    { day: 'T6', value: 6 },
    { day: 'T7', value: 5 },
    { day: 'CN', value: 12 }
  ]

  // Formatted currencies helper
  const formatCurrency = (val: number) => {
    return `$${val.toLocaleString('en-US').replace(',', '.')}`
  }

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-gray-900">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-xs font-extrabold text-[#E63946] hover:text-black transition-colors uppercase mb-3 bg-transparent border-0 p-0 cursor-pointer"
      >
        &larr; Quay lại
      </button>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">
            BÁO CÁO HIỆU SUẤT
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Thống kê trang đã duyệt và thu nhập theo từng tháng
          </p>
        </div>

        {/* Month Dropdown selector */}
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none pl-10 pr-10 py-2 border-2 border-black font-extrabold text-xs bg-white text-gray-700 rounded-none cursor-pointer focus:outline-none"
          >
            <option value="Tháng 5, 2026">Tháng 5, 2026</option>
            <option value="Tháng 4, 2026">Tháng 4, 2026</option>
            <option value="Tháng 3, 2026">Tháng 3, 2026</option>
          </select>
          <Calendar className="w-4 h-4 text-gray-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-4 h-4 text-gray-700 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Grid of 2 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Card 1: Tổng trang đã duyệt (5 tháng) */}
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs">
          <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-4 h-4 text-rose-500" />
            TỔNG TRANG ĐÃ DUYỆT (5 THÁNG)
          </span>
          <span className="text-4xl font-extrabold text-[#E63946] block mt-1">
            274
          </span>
          <p className="text-[10px] font-bold text-gray-400 mt-3">
            Tất cả thời gian • 5 tháng gần nhất
          </p>
        </div>

        {/* Card 2: Trang duyệt tháng 5 */}
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs">
          <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            TRANG DUYỆT — THÁNG 5, 2026
          </span>
          <span className="text-4xl font-extrabold text-blue-600 block mt-1">
            68
          </span>
          <p className="text-[10px] font-bold text-emerald-600 mt-3">
            +11% so với tháng trước
          </p>
        </div>

      </div>


      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        
        {/* Weekly Bar Chart (Full Width) */}
        <div className="bg-white border-2 border-black rounded-none p-6 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
            <div>
              <h2 className="text-sm font-extrabold tracking-wider text-gray-900 uppercase">
                TRANG DUYỆT HÀNG TUẦN
              </h2>
              <span className="text-[11px] font-bold text-gray-400 block mt-0.5">Tháng 5, 2026 - Tuần 3 (15 - 21/05)</span>
            </div>
            
            {/* Week Dropdown */}
            <div className="relative">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 text-[11px] font-extrabold border border-gray-200 rounded bg-white text-gray-600 cursor-pointer focus:outline-none"
              >
                <option value="Tuần 1">Tuần 1</option>
                <option value="Tuần 2">Tuần 2</option>
                <option value="Tuần 3">Tuần 3</option>
                <option value="Tuần 4">Tuần 4</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Bar Chart Container using Flexbox column structures */}
          <div className="relative h-64 flex flex-col justify-between pt-4">
            
            {/* Chart Grid Lines & Y-Axis Labels */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4">
              {[20, 15, 10, 5, 0].map((labelVal) => (
                <div key={labelVal} className="flex items-center gap-4 w-full">
                  <span className="text-[10px] font-bold text-gray-400 w-4 text-right">{labelVal}</span>
                  <div className="flex-1 border-t border-dashed border-gray-100" />
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="relative z-10 flex-1 flex items-end justify-around pl-8 pr-4 pb-8 h-full max-w-4xl mx-auto w-full">
              {weeklyData.map((bar, idx) => {
                // Height calculate percent (Max height 20 pages)
                const heightPct = (bar.value / 20) * 100
                return (
                  <div key={idx} className="flex flex-col items-center group w-12">
                    {/* Tooltip value */}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[9px] font-bold py-1 px-1.5 rounded -mt-6 absolute translate-y-[-10px] pointer-events-none">
                      {bar.value} trang
                    </span>
                    
                    {/* Bar track wrapper to resolve percentage height bug */}
                    <div className="h-[160px] w-8 flex items-end bg-transparent mb-2">
                      <div
                        className="w-full bg-[#E63946] hover:bg-red-600 transition-all duration-300 rounded-t-sm cursor-pointer shadow-xs animate-bar-grow"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    
                    {/* Weekday label */}
                    <span className="text-[11px] font-black text-gray-400 uppercase">
                      {bar.day}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>

      {/* PDF Monthly Reports Table */}
      <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-4">
        BÁO CÁO HÀNG THÁNG (PDF)
      </h3>
      
      <div className="bg-white border-2 border-black rounded-none shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white text-[10px] font-black uppercase tracking-wider border-b-2 border-black">
                <th className="py-4 px-6 text-white">BÁO CÁO</th>
                <th className="py-4 px-6 text-white">NGÀY CÔNG BỐ</th>
                <th className="py-4 px-6 text-white">TRANG DUYỆT</th>
                <th className="py-4 px-6 text-white text-center">NHIỆM VỤ</th>
                <th className="py-4 px-6 text-white text-center">ĐÃ DUYỆT</th>
                <th className="py-4 px-6 text-white text-center">CHỜ DUYỆT</th>
                <th className="py-4 px-6 text-white text-center">TẢI XUỐNG</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100 text-sm font-semibold text-gray-700 bg-white">
              {mockMonthlyReports.map((report, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  
                  {/* Monthly report card link */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center flex-shrink-0 text-[#E63946] border border-red-100">
                        <FileDown className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-900 leading-tight">
                          {report.month}
                        </h4>
                        <span className={`text-[9px] font-bold uppercase mt-0.5 block ${report.isCurrent ? 'text-[#E63946] animate-pulse' : 'text-gray-400'}`}>
                          {report.isCurrent ? 'Đang xem' : 'Tải xuống PDF'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Publish date */}
                  <td className="py-4 px-6 text-gray-500 text-xs font-bold">
                    {report.date}
                  </td>

                  {/* Total pages approved */}
                  <td className="py-4 px-6 text-[#E63946] font-black text-xs">
                    {report.pages} trang
                  </td>

                  {/* Total Tasks count */}
                  <td className="py-4 px-6 text-center text-gray-900">
                    {report.tasks}
                  </td>

                  {/* Approved tasks */}
                  <td className="py-4 px-6 text-center text-emerald-600 font-extrabold">
                    {report.approved}
                  </td>

                  {/* Pending tasks */}
                  <td className="py-4 px-6 text-center text-amber-500 font-extrabold">
                    {report.pending}
                  </td>

                  {/* PDF Download Action Button */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleDownloadPDF(report)}
                      className="bg-[#E63946] text-white font-extrabold text-[9px] px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-1.5 mx-auto hover:bg-red-600 transition-colors border border-[#E63946]"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
            
            {/* Total / Summary black footer row */}
            <tfoot>
              <tr className="bg-[#1c1c1f] text-white text-xs font-extrabold border-t-2 border-black">
                <td className="py-4 px-6 text-white uppercase tracking-wider">
                  TỔNG CỘNG (5 THÁNG)
                </td>
                <td className="py-4 px-6 text-zinc-400">
                  —
                </td>
                <td className="py-4 px-6 text-[#E63946] font-black">
                  274 trang
                </td>
                <td className="py-4 px-6 text-center text-white font-black">
                  276
                </td>
                <td className="py-4 px-6 text-center text-emerald-500 font-black">
                  262
                </td>
                <td className="py-4 px-6 text-center text-amber-500 font-black">
                  12
                </td>
                <td className="py-4 px-6">
                  {/* Empty cell spacer */}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  )
}
