import React from 'react'
import { FileText, Link } from 'lucide-react'
import { Link as RouterLink } from 'react-router'

export default function TantouDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="bg-[#fcf5f5] border-4 border-manga-ink p-8 mb-8 relative overflow-hidden manga-shadow">
        <div className="relative z-10">
          <div className="inline-block bg-manga-ink text-white font-manga font-bold tracking-wider px-4 py-1 text-xs uppercase -rotate-2 mb-4">
            Bảng điều khiển Tantou Editor
          </div>
          <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none mb-3">
            CHÀO MỪNG,<br />
            <span className="text-manga-red mt-1 block">BIÊN TẬP VIÊN</span>
          </h1>
          <p className="text-base font-bold text-gray-700">Xem xét bản thảo, theo dõi tiến độ studio và đề xuất phục hồi series.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Xem xét bản thảo', href: '/dashboard/tantou-editor/manuscript-review' },
          { label: 'Tiến độ Studio', href: '/dashboard/tantou-editor/studio-progress' },
          { label: 'Đề xuất phục hồi', href: '/dashboard/tantou-editor/recovery-proposal' },
        ].map((item) => (
          <RouterLink
            key={item.href}
            to={item.href}
            className="bg-white border-2 border-manga-ink p-6 flex items-center justify-between manga-shadow-sm hover:translate-y-[-2px] hover:manga-shadow transition-all"
          >
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{item.label}</span>
              <FileText className="w-8 h-8 text-manga-ink mt-2" />
            </div>
          </RouterLink>
        ))}
      </div>
    </div>
  )
}
