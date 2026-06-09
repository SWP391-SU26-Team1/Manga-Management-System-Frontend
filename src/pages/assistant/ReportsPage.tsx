import React from 'react'
import { Calendar, Download, FileText, BarChart2, CheckCircle } from 'lucide-react'

export default function ReportsPage() {
  // Using static data to perfectly match the requested design structure while removing income

  const reports = [
    { month: 'Tháng 5, 2026', desc: 'Đang cập nhật...', date: '15/05/2026', pages: 68, tasks: 68, approved: 62, pending: 6 },
    { month: 'Tháng 4, 2026', desc: 'Tải xuống PDF', date: '30/04/2026', pages: 61, tasks: 61, approved: 58, pending: 3 },
    { month: 'Tháng 3, 2026', desc: 'Tải xuống PDF', date: '31/03/2026', pages: 55, tasks: 55, approved: 53, pending: 2 },
    { month: 'Tháng 2, 2026', desc: 'Tải xuống PDF', date: '28/02/2026', pages: 48, tasks: 48, approved: 47, pending: 1 },
    { month: 'Tháng 1, 2026', desc: 'Tải xuống PDF', date: '31/01/2026', pages: 42, tasks: 42, approved: 42, pending: 0 },
  ]

  const totalPages = reports.reduce((acc, r) => acc + r.pages, 0)
  const totalTasks = reports.reduce((acc, r) => acc + r.tasks, 0)
  const totalApproved = reports.reduce((acc, r) => acc + r.approved, 0)
  const totalPending = reports.reduce((acc, r) => acc + r.pending, 0)

  // Chart data for visual representation
  const weeklyPages = [14, 9, 19, 11, 16, 7, 5]
  const maxWeeklyPages = Math.max(...weeklyPages)

  const monthlyTasks = [42, 48, 55, 61, 68]
  const maxMonthlyTasks = Math.max(...monthlyTasks)

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-manga text-[32px] font-bold uppercase text-manga-ink leading-tight">
            BÁO CÁO HIỆU SUẤT
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Thống kê trang đã duyệt và nhiệm vụ theo từng tháng
          </p>
        </div>
        <div className="relative">
          <button className="flex items-center gap-2 bg-white border-2 border-manga-ink px-4 py-2 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
            <Calendar className="w-4 h-4" /> Tháng 5, 2026 <span className="ml-2 text-[10px]">▼</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            <FileText className="w-3 h-3 text-[#E63946]" /> TỔNG TRANG ĐÃ DUYỆT (5 THÁNG)
          </div>
          <div>
            <div className="font-manga text-[40px] leading-none font-bold text-[#E63946]">{totalPages}</div>
            <div className="text-[10px] font-semibold text-gray-400 mt-1 uppercase">68 trang / 5 tháng gần nhất</div>
          </div>
        </div>

        <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            <CheckCircle className="w-3 h-3 text-[#48BB78]" /> TỔNG NHIỆM VỤ HOÀN THÀNH
          </div>
          <div>
            <div className="font-manga text-[40px] leading-none font-bold text-[#48BB78]">{totalApproved}</div>
            <div className="text-[10px] font-semibold text-gray-400 mt-1 uppercase">Trên tổng số {totalTasks} nhiệm vụ</div>
          </div>
        </div>

        <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            <BarChart2 className="w-3 h-3 text-[#4299E1]" /> TRANG DUYỆT - THÁNG 5, 2026
          </div>
          <div>
            <div className="font-manga text-[40px] leading-none font-bold text-[#4299E1]">68</div>
            <div className="text-[10px] font-semibold text-gray-400 mt-1 uppercase">+7 trang so với tháng trước</div>
          </div>
        </div>

        <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            <CheckCircle className="w-3 h-3 text-[#F6AD55]" /> NHIỆM VỤ - THÁNG 5, 2026
          </div>
          <div>
            <div className="font-manga text-[40px] leading-none font-bold text-[#F6AD55]">62</div>
            <div className="text-[10px] font-semibold text-gray-400 mt-1 uppercase">HOÀN THÀNH / 68 TỔNG SỐ</div>
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
            <span className="text-gray-400 text-[10px]">Tháng 5, 2026</span>
            <span className="text-white">68 TRANG (62 NHIỆM VỤ)</span>
          </div>
          <div className="w-px h-8 bg-gray-700"></div>
          <div className="flex flex-col text-right">
            <span className="text-gray-400 text-[10px]">Tháng trước</span>
            <span className="text-gray-300">61 TRANG (58 NHIỆM VỤ)</span>
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
              <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Tháng 5, 2026 - Tuần 2 (08/05 - 15/05)</p>
            </div>
            <button className="border border-gray-300 px-3 py-1 text-xs font-bold text-gray-600">Tuần 2 ▾</button>
          </div>
          
          <div className="relative h-[200px] flex items-end justify-between gap-2 border-l border-b border-gray-200 pb-2 pl-2">
            {/* Y-axis labels */}
            <div className="absolute -left-6 bottom-0 top-0 flex flex-col justify-between text-[10px] text-gray-400 font-bold py-2">
              <span>20-</span>
              <span>15-</span>
              <span>10-</span>
              <span>5-</span>
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
                  className="w-full max-w-[40px] bg-[#E63946] border border-[#B02A35] transition-all group-hover:opacity-80"
                  style={{ height: `${(val / 20) * 100}%` }}
                ></div>
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
              <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">5 tháng gần nhất (2026)</p>
            </div>
          </div>
          
          <div className="relative h-[200px] flex items-end justify-between gap-2 border-l border-b border-gray-200 pb-2 pl-2">
            {/* Y-axis labels */}
            <div className="absolute -left-6 bottom-0 top-0 flex flex-col justify-between text-[10px] text-gray-400 font-bold py-2">
              <span>80-</span>
              <span>60-</span>
              <span>40-</span>
              <span>20-</span>
              <span>0-</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-0 right-0 bottom-[25%] h-px border-t border-dashed border-gray-200"></div>
            <div className="absolute left-0 right-0 bottom-[50%] h-px border-t border-dashed border-gray-200"></div>
            <div className="absolute left-0 right-0 bottom-[75%] h-px border-t border-dashed border-gray-200"></div>
            <div className="absolute left-0 right-0 top-0 h-px border-t border-dashed border-gray-200"></div>

            {/* Bars */}
            {monthlyTasks.map((val, i) => (
              <div key={i} className="relative flex flex-col items-center flex-1 group z-10">
                <div 
                  className="w-full max-w-[40px] bg-[#48BB78] border border-[#38A169] transition-all group-hover:opacity-80"
                  style={{ height: `${(val / 80) * 100}%` }}
                ></div>
                <div className="absolute -bottom-6 text-[10px] font-bold text-gray-400">
                  {['Th1', 'Th2', 'Th3', 'Th4', 'Th5'][i]}
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
          <span className="text-[10px] font-bold text-gray-400 uppercase">5 báo cáo - Chỉ hiển thị hiệu suất</span>
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
                    <button className="bg-[#E63946] hover:bg-[#B02A35] transition-colors text-white px-4 py-2 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 text-[10px] font-bold ml-auto active:translate-y-[2px] active:shadow-none">
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#1A1A1A] text-white">
                <td colSpan={2} className="py-4 px-6 font-bold text-xs uppercase tracking-wider">
                  TỔNG CỘNG (5 THÁNG)
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

