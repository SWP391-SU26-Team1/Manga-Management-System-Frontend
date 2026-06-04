import React, { useEffect, useState } from 'react'
import { AlertCircle, TrendingUp } from 'lucide-react'
import { RankingPanel } from '@/components/mangaka/RankingPanel'
import { mangakaStore, RankingStat, RiskAlert } from '@/data/mangakaMockData'

export default function RankingPage() {
  const [stats, setStats] = useState<RankingStat[]>([])
  const [alerts, setAlerts] = useState<RiskAlert[]>([])

  useEffect(() => {
    setStats(mangakaStore.getRankingStats())
    setAlerts(mangakaStore.getRiskAlerts())
  }, [])

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none">
          CHỈ SỐ & XẾP HẠNG
        </h1>
        <div className="h-1.5 w-24 bg-manga-red mt-3" />
        <p className="text-sm font-bold text-gray-500 mt-2">
          Theo dõi tương tác thực tế từ độc giả trên nền tảng đọc truyện (lượt xem, lượt thích, bình luận) và xếp hạng tuần.
        </p>
      </div>

      {/* Risk Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className={`p-4 border-2 flex items-start gap-3 ${
              alert.level === 'High' ? 'bg-red-50 border-manga-red text-red-900' :
              alert.level === 'Medium' ? 'bg-orange-50 border-orange-500 text-orange-900' :
              'bg-yellow-50 border-yellow-500 text-yellow-900'
            }`}>
              <AlertCircle className={`w-6 h-6 flex-shrink-0 ${
                alert.level === 'High' ? 'text-manga-red' :
                alert.level === 'Medium' ? 'text-orange-500' :
                'text-yellow-600'
              }`} />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wide">Cảnh báo rủi ro</h4>
                <p className="text-sm font-semibold mt-1">{alert.message}</p>
                <div className="text-[10px] uppercase font-bold mt-2 opacity-70">
                  {new Date(alert.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Ranking Panel */}
      {stats.length > 0 ? (
        <RankingPanel stats={stats} />
      ) : (
        <div className="bg-white border-4 border-manga-ink p-12 text-center">
          Đang tải dữ liệu xếp hạng...
        </div>
      )}

      {/* Regulatory Guidelines */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 font-bold text-sm text-manga-ink">
        <div className="bg-yellow-50/30 border-2 border-yellow-400 p-5">
          <h4 className="font-manga text-lg uppercase text-yellow-800 mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5" /> Cơ chế xếp hạng tự động
          </h4>
          <p className="text-xs text-yellow-700 leading-relaxed font-semibold">
            Bảng xếp hạng (Weekly Rank) được cập nhật tự động vào 00:00 mỗi Thứ Hai dựa trên điểm số tương tác tổng hợp (70% lượt xem, 20% lượt thích/theo dõi và 10% bình luận thực tế). Các tác phẩm duy trì top 3 liên tiếp 4 tuần sẽ nhận được huy hiệu "Hot Series" trên trang chủ Reader.
          </p>
        </div>

        <div className="bg-red-50/50 border-2 border-manga-red p-5">
          <h4 className="font-manga text-lg uppercase text-manga-red mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-5 h-5" /> Quy định cảnh báo & Đóng series
          </h4>
          <p className="text-xs text-red-700 leading-relaxed font-semibold">
            Nếu một tác phẩm rơi xuống vị trí ngoài top 20 liên tiếp trong 3 kỳ xuất bản, hệ thống sẽ gửi thông báo cảnh báo đến tác giả. Hội đồng biên tập có quyền đình chỉ xuất bản hoặc yêu cầu tác giả rút ngắn cốt truyện để hoàn thành tác phẩm (đóng series sớm) nếu chỉ số tiếp tục sụt giảm.
          </p>
        </div>
      </div>
    </div>
  )
}
