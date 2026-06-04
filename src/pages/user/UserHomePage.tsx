import React from 'react'
import { Link } from 'react-router'
import { Search, Bell, User, Edit3, Users, Send } from 'lucide-react'

export default function UserHomePage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-manga-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link to="/" className="font-manga text-3xl font-bold tracking-tight text-manga-ink">
              MangaFlow
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link to="/projects" className="text-sm font-bold uppercase tracking-wider text-manga-ink hover:text-manga-red transition-colors">
              Dự án
            </Link>
            <Link to="/rankings" className="text-sm font-bold uppercase tracking-wider text-manga-ink hover:text-manga-red transition-colors">
              Bảng xếp hạng
            </Link>
            <Link to="/community" className="text-sm font-bold uppercase tracking-wider text-manga-ink hover:text-manga-red transition-colors">
              Cộng đồng
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-manga-ink" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-manga-ink" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-manga-red rounded-full" />
            </button>
            <Link to="/register" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <User className="w-5 h-5 text-manga-ink" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* 2. Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="font-manga text-5xl md:text-7xl font-bold uppercase leading-none">
                Sáng tác Manga <br />
                <span className="text-manga-red">Không Giới Hạn</span>
              </h1>
              <p className="text-lg text-gray-700 max-w-lg">
                MangaFlow cùng tác giả và trợ lý quản lý quy trình sáng tác, theo dõi tiến độ và xuất bản truyện hiệu quả.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-manga-red text-white font-bold uppercase tracking-widest py-3 px-8 manga-border manga-shadow hover:translate-y-1 hover:manga-shadow-sm transition-all">
                  Bắt đầu ngay
                </button>
                <button className="bg-white text-manga-ink font-bold uppercase tracking-widest py-3 px-8 manga-border manga-shadow hover:translate-y-1 hover:manga-shadow-sm transition-all">
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="manga-border manga-shadow bg-gray-100 aspect-[4/3] relative overflow-hidden">
                <img
                  src="/images/hero.png"
                  alt="Manga Studio"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <span className="font-manga text-4xl font-bold text-gray-300 uppercase">MangaFlow</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Section "Quy trình sáng tác" */}
        <section className="bg-gray-50 border-y-2 border-manga-ink py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-manga text-3xl font-bold uppercase mb-12 text-center md:text-left inline-block border-b-4 border-manga-ink pb-2">
              Quy trình sáng tác
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-manga-ink z-0" />

              {/* Card 1 */}
              <div className="bg-white manga-border manga-shadow p-8 flex flex-col items-center text-center relative z-10 hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 rounded-full bg-manga-red manga-border text-white flex items-center justify-center mb-6 z-10">
                  <Edit3 className="w-8 h-8" />
                </div>
                <h3 className="font-manga text-2xl font-bold uppercase mb-4">1. Sáng tạo</h3>
                <p className="text-gray-600">
                  Xây dựng ý tưởng, kịch bản, nhân vật và storyboard.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white manga-border manga-shadow p-8 flex flex-col items-center text-center relative z-10 hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 rounded-full bg-manga-ink manga-border text-white flex items-center justify-center mb-6 z-10">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-manga text-2xl font-bold uppercase mb-4">2. Hợp tác</h3>
                <p className="text-gray-600">
                  Phân công công việc cho trợ lý, theo dõi từng trang và khung hình.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white manga-border manga-shadow p-8 flex flex-col items-center text-center relative z-10 hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 rounded-full bg-manga-ink manga-border text-white flex items-center justify-center mb-6 z-10">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="font-manga text-2xl font-bold uppercase mb-4">3. Xuất bản</h3>
                <p className="text-gray-600">
                  Gửi bản thảo cho biên tập viên, nhận đánh giá và quyết định xuất bản.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Section "Dự án nổi bật" */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex justify-between items-end mb-8 border-b-4 border-manga-ink pb-2">
            <div>
              <h2 className="font-manga text-3xl font-bold uppercase mb-2">Dự án nổi bật</h2>
              <p className="text-gray-600">Những tác phẩm được cộng đồng yêu thích nhất tuần qua.</p>
            </div>
            <Link to="/projects" className="hidden md:inline-block font-bold text-manga-red hover:underline uppercase text-sm tracking-wider">
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Project 1 */}
            <div className="group cursor-pointer">
              <div className="manga-border manga-shadow aspect-[3/4] relative overflow-hidden mb-4 bg-gray-200 group-hover:-translate-y-1 transition-transform">
                <img src="/images/cover-1.png" alt="Ánh Sáng Nơi Chân Trời" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-white manga-border px-2 py-1 text-xs font-bold uppercase shadow-sm">
                  Đang làm
                </div>
              </div>
              <h3 className="font-manga text-xl font-bold uppercase group-hover:text-manga-red transition-colors">Ánh Sáng Nơi Chân Trời</h3>
              <p className="text-sm text-gray-500 font-bold mb-1">Kim Dung · Fantasy</p>
            </div>

            {/* Project 2 */}
            <div className="group cursor-pointer">
              <div className="manga-border manga-shadow aspect-[3/4] relative overflow-hidden mb-4 bg-gray-200 group-hover:-translate-y-1 transition-transform">
                <img src="/images/cover-2.png" alt="Thành Phố Tương Lai" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-yellow-400 manga-border px-2 py-1 text-xs font-bold uppercase shadow-sm">
                  Chờ duyệt
                </div>
              </div>
              <h3 className="font-manga text-xl font-bold uppercase group-hover:text-manga-red transition-colors">Thành Phố Tương Lai</h3>
              <p className="text-sm text-gray-500 font-bold mb-1">Bảo Khang · Sci-Fi</p>
            </div>

            {/* Project 3 */}
            <div className="group cursor-pointer">
              <div className="manga-border manga-shadow aspect-[3/4] relative overflow-hidden mb-4 bg-gray-200 group-hover:-translate-y-1 transition-transform">
                <img src="/images/cover-3.png" alt="Học Viện Phép Thuật" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-manga-red text-white manga-border border-white px-2 py-1 text-xs font-bold uppercase shadow-sm">
                  Đã xuất bản
                </div>
              </div>
              <h3 className="font-manga text-xl font-bold uppercase group-hover:text-manga-red transition-colors">Học Viện Phép Thuật</h3>
              <p className="text-sm text-gray-500 font-bold mb-1">Nhật Hạ · Magic</p>
            </div>

            {/* Project 4 */}
            <div className="group cursor-pointer">
              <div className="manga-border manga-shadow aspect-[3/4] relative overflow-hidden mb-4 bg-gray-200 group-hover:-translate-y-1 transition-transform">
                <img src="/images/cover-4.png" alt="Cú Đập Bầu Trời" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-white manga-border px-2 py-1 text-xs font-bold uppercase shadow-sm">
                  Đang làm
                </div>
              </div>
              <h3 className="font-manga text-xl font-bold uppercase group-hover:text-manga-red transition-colors">Cú Đập Bầu Trời</h3>
              <p className="text-sm text-gray-500 font-bold mb-1">Hoàng Long · Sports</p>
            </div>
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/projects" className="inline-block font-bold text-manga-red hover:underline uppercase text-sm tracking-wider">
              Xem tất cả
            </Link>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="bg-gray-100 border-t-2 border-manga-ink pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-manga text-2xl font-bold uppercase tracking-tight text-manga-ink mb-4">
                MangaFlow
              </h3>
              <p className="text-sm text-gray-600 mb-4 pr-4">
                Nền tảng xuất bản manga thế hệ mới, kết nối tác giả và độc giả toàn cầu.
              </p>
              <p className="text-xs text-gray-500 font-bold">
                &copy; 2026 MangaFlow. Editorial Grade Publishing.
              </p>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4 border-b-2 border-manga-ink inline-block pb-1">Khám phá</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><Link to="/projects" className="hover:text-manga-red font-bold transition-colors">Dự án</Link></li>
                <li><Link to="/rankings" className="hover:text-manga-red font-bold transition-colors">Bảng xếp hạng</Link></li>
                <li><Link to="/library" className="hover:text-manga-red font-bold transition-colors">Thư viện</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4 border-b-2 border-manga-ink inline-block pb-1">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><Link to="/help" className="hover:text-manga-red font-bold transition-colors">Trợ giúp</Link></li>
                <li><Link to="/jobs" className="hover:text-manga-red font-bold transition-colors">Công việc (Trợ lý)</Link></li>
                <li><Link to="/guide" className="hover:text-manga-red font-bold transition-colors">Hướng dẫn sáng tác</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4 border-b-2 border-manga-ink inline-block pb-1">Về chúng tôi</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><Link to="/about" className="hover:text-manga-red font-bold transition-colors">Công ty</Link></li>
                <li><Link to="/careers" className="hover:text-manga-red font-bold transition-colors">Tuyển dụng</Link></li>
                <li><Link to="/contact" className="hover:text-manga-red font-bold transition-colors">Liên hệ</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
