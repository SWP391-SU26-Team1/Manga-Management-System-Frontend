import React from 'react'
import { ClipboardList, CheckSquare, DollarSign, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router'

export default function AssistantDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="bg-[#fcf5f5] border-4 border-manga-ink p-8 mb-8 relative overflow-hidden manga-shadow">
        <div className="absolute top-0 right-0 w-64 h-full bg-manga-red/5 skew-x-12 translate-x-20 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-block bg-manga-ink text-white font-manga font-bold tracking-wider px-4 py-1 text-xs uppercase -rotate-2 mb-4">
            Bảng điều khiển trợ lý
          </div>
          <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none mb-3">
            CHÀO MỪNG,<br />
            <span className="text-manga-red mt-1 block">ASSISTANT</span>
          </h1>
          <p className="text-base font-bold text-gray-700">Theo dõi nhiệm vụ, nộp bản vẽ và quản lý thu nhập của bạn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Nhiệm vụ của tôi', icon: ClipboardList, href: '/dashboard/assistant/tasks', count: 5 },
          { label: 'Bản vẽ đã nộp', icon: CheckSquare, href: '/dashboard/assistant/submissions', count: 12 },
          { label: 'Thu nhập', icon: DollarSign, href: '/dashboard/assistant/income', count: null },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} to={item.href} className="bg-white border-2 border-manga-ink p-6 flex items-center justify-between manga-shadow-sm hover:translate-y-[-2px] hover:manga-shadow transition-all">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{item.label}</span>
                {item.count !== null && <span className="font-manga text-3xl font-bold text-manga-ink">{item.count}</span>}
              </div>
              <div className="p-2 border-2 border-manga-ink bg-gray-100">
                <Icon className="w-6 h-6 text-manga-ink" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
