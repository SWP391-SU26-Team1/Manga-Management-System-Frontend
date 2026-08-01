import React from 'react'
import { Outlet, Link } from 'react-router'
import UserNavHeader from './UserNavHeader'
import { Globe, BookOpen, Sparkles, ShieldCheck, Mail, MessageCircle, Heart, ArrowUpRight } from 'lucide-react'

export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-manga-ink font-sans dark:bg-zinc-900 dark:text-white">
      <UserNavHeader />
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>

      {/* Professional MangaFlow Footer */}
      <footer className="border-t-4 border-manga-ink bg-[#111115] text-white pt-8 pb-4 px-6 md:px-12 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8 border-b border-zinc-800">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/images/b4bb9e75-401d-4a80-9f56-515cbab242fa.png"
                alt="MangaFlow"
                className="h-24 md:h-28 w-auto object-contain brightness-110"
              />
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md font-medium">
              Nền tảng quản lý quy trình sáng tác, kết nối Mangaka, Trợ lý và Hội đồng biên tập. Đưa tác phẩm Manga Việt Nam vươn tầm quốc tế.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-manga-red hover:text-white transition-all flex items-center justify-center border border-zinc-700">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-manga-red hover:text-white transition-all flex items-center justify-center border border-zinc-700">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-manga-red hover:text-white transition-all flex items-center justify-center border border-zinc-700">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Khám Phá */}
          <div className="space-y-3">
            <h4 className="font-manga text-lg font-bold uppercase tracking-wider text-manga-red flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Khám Phá
            </h4>
            <ul className="space-y-2 text-sm font-semibold text-zinc-400">
              <li><Link to="/" className="hover:text-white transition-colors flex items-center gap-1 group">Khám Phá Truyện <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
              <li><Link to="/rankings" className="hover:text-white transition-colors flex items-center gap-1 group">Bảng Xếp Hạng <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
              <li><Link to="/history" className="hover:text-white transition-colors flex items-center gap-1 group">Lịch Sử Đọc <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Thể Loại Nổi Bật</a></li>
            </ul>
          </div>

          {/* Col 3: Dành Cho Tác Giả */}
          <div className="space-y-3">
            <h4 className="font-manga text-lg font-bold uppercase tracking-wider text-manga-red flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Cổng Sáng Tác
            </h4>
            <ul className="space-y-2 text-sm font-semibold text-zinc-400">
              <li><Link to="/dashboard/mangaka" className="hover:text-white transition-colors">Phòng Làm Việc Mangaka</Link></li>
              <li><Link to="/dashboard/assistant" className="hover:text-white transition-colors">Góc Trợ Lý Sáng Tác</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Quy Trình Xuất Bản</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hướng Dẫn Nộp Bản Thảo</a></li>
            </ul>
          </div>

          {/* Col 4: Hỗ Trợ & Bản Quyền */}
          <div className="space-y-3">
            <h4 className="font-manga text-lg font-bold uppercase tracking-wider text-manga-red flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Chính Sách
            </h4>
            <ul className="space-y-2 text-sm font-semibold text-zinc-400">
              <li><a href="#" className="hover:text-white transition-colors">Điều Khoản Sử Dụng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bản Quyền Tác Phẩm</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính Sách Bảo Mật</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Liên Hệ Hợp Tác</a></li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-500">
          <div>
            © 2026 <span className="text-zinc-300 font-bold">MangaFlow</span>. Nền tảng sáng tác và đọc manga không giới hạn.
          </div>
        </div>
      </footer>
    </div>
  )
}
