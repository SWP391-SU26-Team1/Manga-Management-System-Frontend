import React from 'react'
import { Link } from 'react-router'
import { CheckCircle, Vote, BarChart2 } from 'lucide-react'

export default function BoardDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="bg-[#fcf5f5] border-4 border-manga-ink p-8 mb-8 relative overflow-hidden manga-shadow">
        <div className="relative z-10">
          <div className="inline-block bg-manga-ink text-white font-manga font-bold tracking-wider px-4 py-1 text-xs uppercase -rotate-2 mb-4">
            Hội đồng biên tập
          </div>
          <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none mb-3">
            HỘI ĐỒNG<br />
            <span className="text-manga-red mt-1 block">BIÊN TẬP</span>
          </h1>
          <p className="text-base font-bold text-gray-700">Phê duyệt series, bỏ phiếu và xem dữ liệu xếp hạng.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Phê duyệt Series', icon: CheckCircle, href: '/dashboard/editorial-board/series-approval' },
          { label: 'Bỏ phiếu', icon: Vote, href: '/dashboard/editorial-board/voting' },
          { label: 'Dữ liệu xếp hạng', icon: BarChart2, href: '/dashboard/editorial-board/ranking-data' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              to={item.href}
              className="bg-white border-2 border-manga-ink p-6 flex items-center justify-between manga-shadow-sm hover:translate-y-[-2px] hover:manga-shadow transition-all"
            >
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{item.label}</span>
                <Icon className="w-8 h-8 text-manga-ink mt-2" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
