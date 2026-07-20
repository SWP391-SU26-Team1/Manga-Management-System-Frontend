import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Search, Bell, User, Edit3, Users, Send, TrendingUp, BookOpen, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { readerService } from '@/services/reader.service'
import { PublishedSeries, GENRES } from '@/types/reader.types'
import SeriesCard from '@/components/user/SeriesCard'

export default function UserHomePage() {
  const [featured, setFeatured] = useState<PublishedSeries[]>([])
  const [latestUpdates, setLatestUpdates] = useState<PublishedSeries[]>([])
  const [topViews, setTopViews] = useState<PublishedSeries[]>([])
  const [topLikes, setTopLikes] = useState<PublishedSeries[]>([])

  useEffect(() => {
    readerService.getFeatured().then(setFeatured)
    readerService.getLatestUpdates(5).then(setLatestUpdates)
    readerService.getTopViews(5).then(setTopViews)
    readerService.getTopLikes(5).then(setTopLikes)
  }, [])

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-manga-red selection:text-white">
      <main className="flex-1 bg-white dark:bg-zinc-900 transition-colors">
        {/* 2. Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="font-manga text-5xl md:text-7xl font-bold uppercase leading-none animate-slide-up dark:text-white" style={{ animationDelay: '0.1s' }}>
                Sáng tác Manga <br />
                <span className="text-manga-red">Không Giới Hạn</span>
              </h1>
              <p className="text-lg text-gray-700 max-w-lg animate-slide-up dark:text-gray-300" style={{ animationDelay: '0.2s' }}>
                MangaFlow cùng tác giả và trợ lý quản lý quy trình sáng tác, theo dõi tiến độ và xuất bản truyện hiệu quả.
              </p>
              <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <button className="bg-manga-red text-white font-bold uppercase tracking-widest py-3 px-8 manga-border manga-shadow hover:translate-y-1 hover:manga-shadow-sm transition-all dark:border-black">
                  Bắt đầu ngay
                </button>
                <button className="bg-white text-manga-ink font-bold uppercase tracking-widest py-3 px-8 manga-border manga-shadow hover:translate-y-1 hover:manga-shadow-sm transition-all dark:bg-zinc-800 dark:text-white dark:border-black">
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
            <div className="relative animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="manga-border manga-shadow bg-gray-100 aspect-[4/3] relative overflow-hidden dark:bg-zinc-800 dark:border-black">
                <img
                  src="/images/hero.png"
                  alt="Manga Studio"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-zinc-800">
                  <span className="font-manga text-4xl font-bold text-gray-300 uppercase dark:text-gray-600">MangaFlow</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Section "Quy trình sáng tác" */}
        <section className="bg-gray-50 border-y-2 border-manga-ink py-16 dark:bg-zinc-900/50 dark:border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-manga text-3xl font-bold uppercase mb-12 text-center md:text-left inline-block border-b-4 border-manga-ink pb-2 animate-slide-up dark:text-white dark:border-zinc-700" style={{ animationDelay: '0.2s' }}>
              Quy trình sáng tác
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-manga-ink z-0 animate-slide-up dark:bg-zinc-700" style={{ animationDelay: '0.3s' }} />

              {/* Card 1 */}
              <div className="bg-white manga-border manga-shadow p-8 flex flex-col items-center text-center relative z-10 hover:-translate-y-2 transition-transform animate-slide-up dark:bg-zinc-800 dark:border-black" style={{ animationDelay: '0.4s' }}>
                <div className="w-16 h-16 rounded-full bg-manga-red manga-border text-white flex items-center justify-center mb-6 z-10 dark:border-black">
                  <Edit3 className="w-8 h-8" />
                </div>
                <h3 className="font-manga text-2xl font-bold uppercase mb-4 dark:text-white">1. Sáng tạo</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Xây dựng ý tưởng, kịch bản, nhân vật và storyboard.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white manga-border manga-shadow p-8 flex flex-col items-center text-center relative z-10 hover:-translate-y-2 transition-transform animate-slide-up dark:bg-zinc-800 dark:border-black" style={{ animationDelay: '0.5s' }}>
                <div className="w-16 h-16 rounded-full bg-manga-ink manga-border text-white flex items-center justify-center mb-6 z-10 dark:bg-zinc-700 dark:border-black">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-manga text-2xl font-bold uppercase mb-4 dark:text-white">2. Hợp tác</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Phân công công việc cho trợ lý, theo dõi từng trang và khung hình.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white manga-border manga-shadow p-8 flex flex-col items-center text-center relative z-10 hover:-translate-y-2 transition-transform animate-slide-up dark:bg-zinc-800 dark:border-black" style={{ animationDelay: '0.6s' }}>
                <div className="w-16 h-16 rounded-full bg-manga-ink manga-border text-white flex items-center justify-center mb-6 z-10 dark:bg-zinc-700 dark:border-black">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="font-manga text-2xl font-bold uppercase mb-4 dark:text-white">3. Xuất bản</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Gửi bản thảo cho biên tập viên, nhận đánh giá và quyết định xuất bản.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Section "Dự án nổi bật" */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-end mb-8 border-b-4 border-manga-ink pb-2 animate-slide-up dark:border-zinc-700" style={{ animationDelay: '0.2s' }}>
            <div>
              <h2 className="font-manga text-3xl font-bold uppercase mb-2 flex items-center gap-2 dark:text-white">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" /> Dự án nổi bật
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Những tác phẩm được cộng đồng yêu thích nhất tuần qua.</p>
            </div>
            <Link to="/search" className="hidden md:inline-block font-bold text-manga-red hover:underline uppercase text-sm tracking-wider">
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((series, idx) => (
              <div key={`featured-${series.id}`} className="animate-slide-up" style={{ animationDelay: `${0.3 + idx * 0.1}s` }}>
                <SeriesCard series={series} />
              </div>
            ))}
          </div>
        </section>

        {/* 5. Section "Mới cập nhật" */}
        <section className="bg-gray-50 border-y-2 border-manga-ink py-16 dark:bg-zinc-900/50 dark:border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8 border-b-4 border-manga-ink pb-2 animate-slide-up dark:border-zinc-700" style={{ animationDelay: '0.2s' }}>
              <div>
                <h2 className="font-manga text-3xl font-bold uppercase mb-2 flex items-center gap-2 dark:text-white">
                  <TrendingUp className="w-6 h-6 text-manga-red" /> Mới cập nhật
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Các chương truyện vừa được xuất bản nóng hổi.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {latestUpdates.map((series, idx) => (
                <div key={`latest-${series.id}`} className="animate-slide-up" style={{ animationDelay: `${0.3 + idx * 0.1}s` }}>
                  <SeriesCard series={series} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Section "Lượt xem cao nhất" */}
        <section className="bg-white border-b-2 border-manga-ink py-16 dark:bg-zinc-800 dark:border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8 border-b-4 border-manga-ink pb-2 animate-slide-up dark:border-zinc-700" style={{ animationDelay: '0.2s' }}>
              <div>
                <h2 className="font-manga text-3xl font-bold uppercase mb-2 flex items-center gap-2 dark:text-white">
                  <BookOpen className="w-6 h-6 text-manga-red" /> Lượt xem cao nhất
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Những tác phẩm thu hút sự chú ý lớn từ cộng đồng.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {topViews.map((series, idx) => (
                <div key={`views-${series.id}`} className="animate-slide-up" style={{ animationDelay: `${0.3 + idx * 0.1}s` }}>
                  <SeriesCard series={series} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Section "Được yêu thích nhất" */}
        <section className="bg-gray-50 border-b-2 border-manga-ink py-16 dark:bg-zinc-900/50 dark:border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8 border-b-4 border-manga-ink pb-2 animate-slide-up dark:border-zinc-700" style={{ animationDelay: '0.2s' }}>
              <div>
                <h2 className="font-manga text-3xl font-bold uppercase mb-2 flex items-center gap-2 dark:text-white">
                  <Star className="w-6 h-6 text-manga-red" /> Được yêu thích nhất
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Các tác phẩm có lượng theo dõi và đánh giá tuyệt vời.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {topLikes.map((series, idx) => (
                <div key={`likes-${series.id}`} className="animate-slide-up" style={{ animationDelay: `${0.3 + idx * 0.1}s` }}>
                  <SeriesCard series={series} />
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          opacity: 0;
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}
