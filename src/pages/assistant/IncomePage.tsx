import React from 'react'
import { DollarSign, Download, Calendar, TrendingUp, CreditCard } from 'lucide-react'

export default function IncomePage() {
  const transactions = [
    { id: 'TRX-001', date: '2026-05-30', description: 'Thanh toán nhiệm vụ Phantom Guild Ch.12', amount: 450, status: 'Hoàn thành' },
    { id: 'TRX-002', date: '2026-05-15', description: 'Thanh toán nhiệm vụ Steel Warriors Ch.11', amount: 320, status: 'Hoàn thành' },
    { id: 'TRX-003', date: '2026-04-30', description: 'Thanh toán nhiệm vụ Sakura High Ch.2', amount: 280, status: 'Hoàn thành' },
    { id: 'TRX-004', date: '2026-06-15', description: 'Thanh toán dự kiến tháng 6', amount: 500, status: 'Đang xử lý' }
  ]

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none">THU NHẬP</h1>
          <div className="h-1.5 w-24 bg-manga-red mt-3" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border-2 border-manga-ink bg-manga-ink text-white font-bold text-sm hover:bg-manga-red transition-colors manga-shadow-sm hover:translate-y-[-2px]">
          <Download className="w-4 h-4" /> Xuất báo cáo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border-4 border-manga-ink p-6 manga-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Tổng Thu Nhập (Năm)</h3>
            <div className="font-manga text-4xl font-bold text-manga-ink">$1,050</div>
            <div className="mt-4 flex items-center gap-1.5 text-sm font-bold text-green-600">
              <TrendingUp className="w-4 h-4" /> +15% so với tháng trước
            </div>
          </div>
        </div>

        <div className="bg-manga-ink border-4 border-manga-ink p-6 manga-shadow text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CreditCard className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Số dư khả dụng</h3>
            <div className="font-manga text-4xl font-bold text-white">$450</div>
            <button className="mt-4 bg-white text-manga-ink px-4 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-manga-red hover:text-white transition-colors border-2 border-transparent">
              Rút Tiền Ngay
            </button>
          </div>
        </div>

        <div className="bg-manga-red border-4 border-manga-ink p-6 manga-shadow text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Calendar className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2">Kỳ thanh toán tới</h3>
            <div className="font-manga text-3xl font-bold text-white mb-1">15/06/2026</div>
            <div className="text-sm font-bold text-white/90">
              Dự kiến: $500
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-manga-ink manga-shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b-2 border-manga-ink px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-manga-ink uppercase tracking-wider">Lịch sử giao dịch</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã GD</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nội dung</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Số tiền</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-gray-600">{trx.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{trx.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{trx.description}</td>
                  <td className="px-6 py-4 text-sm font-bold text-manga-ink text-right">+${trx.amount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-sm ${trx.status === 'Hoàn thành' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300'}`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
