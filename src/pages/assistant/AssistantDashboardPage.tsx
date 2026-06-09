import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, CheckCircle2, TrendingUp, Bell, ArrowRight, Activity, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { assistantStore } from '@/data/assistantMockData'

export default function AssistantDashboardPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('mangaflow_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const displayName = user?.fullName || 'NGUYỄN MINH KHÔI'

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-manga text-4xl md:text-[40px] font-bold uppercase text-manga-ink leading-tight">
            CHÀO BUỔI SÁNG, <span className="text-[#E63946]">{displayName}</span>
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-1">
            Thứ Bảy, 16 tháng 5 năm 2026 · Đây là tổng quan hệ thống của bạn hôm nay
          </p>
        </div>
        <button className="bg-[#E63946] text-white px-5 py-2.5 font-bold uppercase text-xs flex items-center gap-2 border-2 border-[#E63946] hover:bg-white hover:text-[#E63946] transition-colors whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <AlertTriangle className="w-4 h-4" />
          2 HẠN CHÓT KHẨN CẤP
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Big Card Left */}
        <div className="md:col-span-1 bg-white border-2 border-manga-ink p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-manga-red mb-2">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-manga-ink">TỔNG SỐ NHIỆM VỤ ĐÃ DUYỆT</h3>
            </div>
            <div className="font-manga text-[80px] leading-none font-bold text-[#E63946]">260</div>
            <p className="text-sm font-semibold text-gray-400 mt-2">Tất cả thời gian · +12 nhiệm vụ tháng này</p>
          </div>
          <div className="flex justify-between items-end mt-8 border-t-2 border-gray-100 pt-4">
            <span className="text-sm font-semibold text-gray-500">Tháng này: 68</span>
            <span className="text-sm font-bold text-[#2A9D8F] flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> +14%
            </span>
          </div>
        </div>

        {/* 4 Small Cards Right */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-[#457B9D] mb-3">
              <Activity className="w-4 h-4" />
              <h3 className="font-bold text-[11px] uppercase tracking-wider text-manga-ink">DỰ ÁN ĐANG THỰC HIỆN</h3>
            </div>
            <div className="font-manga text-[42px] leading-none font-bold text-[#457B9D]">3</div>
            <p className="text-[13px] font-semibold text-gray-400 mt-2">Dark Rising, Moonlight, Steel</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-[#2A9D8F] mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <h3 className="font-bold text-[11px] uppercase tracking-wider text-manga-ink">ĐÃ DUYỆT TUẦN NÀY</h3>
            </div>
            <div className="font-manga text-[42px] leading-none font-bold text-[#2A9D8F]">8</div>
            <p className="text-[13px] font-semibold text-gray-400 mt-2">+3 so với tuần trước</p>
          </div>

          {/* Card 3 (Dark) */}
          <div className="bg-[#1A1A1A] border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-[#E63946] mb-3">
              <Clock className="w-4 h-4" />
              <h3 className="font-bold text-[11px] uppercase tracking-wider text-white">NHIỆM VỤ ĐANG LÀM</h3>
            </div>
            <div className="font-manga text-[42px] leading-none font-bold text-white">6</div>
            <p className="text-[13px] font-semibold text-gray-400 mt-2">2 sắp đến hạn</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-manga-ink mb-3">
              <TrendingUp className="w-4 h-4" />
              <h3 className="font-bold text-[11px] uppercase tracking-wider text-manga-ink">NHIỆM VỤ THÁNG NÀY</h3>
            </div>
            <div className="font-manga text-[42px] leading-none font-bold text-manga-ink">68</div>
            <p className="text-[13px] font-semibold text-gray-400 mt-2">+11% so với tháng trước</p>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notifications */}
        <div>
          <div className="flex items-center justify-between mb-4 bg-[#1A1A1A] text-white p-3 border-2 border-manga-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-sm uppercase tracking-wider">THÔNG BÁO GẦN ĐÂY</h2>
              <span className="bg-[#E63946] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">2 Khẩn cấp</span>
            </div>
            <Link to="/dashboard/assistant/notifications" className="text-[11px] font-bold uppercase text-gray-300 hover:text-white flex items-center gap-1 transition-colors">
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {/* Urgent Notification 1 */}
            <div className="bg-[#FFF5F5] border-l-4 border-l-[#E63946] border-y-2 border-r-2 border-manga-ink p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-[#E63946]">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Hạn chót sắp đến</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-400">30 phút trước</span>
              </div>
              <p className="text-[13px] font-medium text-gray-800 leading-relaxed">
                <span className="font-bold">Task #1038 – Dark Rising Chronicles</span> sẽ hết hạn trong 2 ngày (18/05/2026). Vui lòng hoàn thành và nộp bài ngay.
              </p>
            </div>

            {/* Urgent Notification 2 */}
            <div className="bg-[#FFF5F5] border-l-4 border-l-[#E63946] border-y-2 border-r-2 border-manga-ink p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-[#E63946]">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Hạn chót sắp đến</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-400">1 giờ trước</span>
              </div>
              <p className="text-[13px] font-medium text-gray-800 leading-relaxed">
                Task #1039 – Moonlight Academy deadline 20/05/2026. Bạn chưa nộp bài.
              </p>
            </div>

            {/* Success Notification */}
            <div className="bg-[#F2FDF5] border-l-4 border-l-[#2A9D8F] border-y-2 border-r-2 border-manga-ink p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-[#2A9D8F]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Nhiệm vụ được duyệt</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-400">3 giờ trước</span>
              </div>
              <p className="text-[13px] font-medium text-gray-800 leading-relaxed">
                Task #1035 – Steel Warriors Lineart đã được Mangaka Akira Tanaka duyệt thành công!
              </p>
            </div>

            {/* Info Notification */}
            <div className="bg-[#F0F7FF] border-l-4 border-l-[#457B9D] border-y-2 border-r-2 border-manga-ink p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-[#457B9D]">
                  <Bell className="w-4 h-4" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Phản hồi mới</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-400">5 giờ trước</span>
              </div>
              <p className="text-[13px] font-medium text-gray-800 leading-relaxed">
                Akira Tanaka đã gửi phản hồi cho Task #1042 – Character Lineart. Có 1 yêu cầu chỉnh sửa khẩn cấp.
              </p>
            </div>

            {/* Success Notification 2 */}
            <div className="bg-[#F2FDF5] border-l-4 border-l-[#2A9D8F] border-y-2 border-r-2 border-manga-ink p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-[#2A9D8F]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Báo cáo tháng 4 sẵn sàng</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-400">1 ngày trước</span>
              </div>
              <p className="text-[13px] font-medium text-gray-800 leading-relaxed">
                Báo cáo hiệu suất tháng 4/2026 đã được tổng hợp xong. Bạn có thể tải xuống ngay.
              </p>
            </div>

            {/* Info Notification 2 */}
            <div className="bg-[#F0F7FF] border-l-4 border-l-[#457B9D] border-y-2 border-r-2 border-manga-ink p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-[#457B9D]">
                  <Bell className="w-4 h-4" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Phản hồi mới</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-400">2 ngày trước</span>
              </div>
              <p className="text-[13px] font-medium text-gray-800 leading-relaxed">
                Sarah Chen (Editor) đã góp ý cho Task #1041 – Tone & Effect. Vui lòng kiểm tra và cập nhật.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Progress & Quick Access */}
        <div className="flex flex-col gap-8">
          {/* Project Progress */}
          <div>
            <div className="mb-4 bg-[#1A1A1A] text-white p-3 border-2 border-manga-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="font-bold text-sm uppercase tracking-wider">TIẾN ĐỘ DỰ ÁN</h2>
            </div>

            <div className="space-y-4">
              {/* Project 1 */}
              <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-base text-manga-ink">Dark Rising Chronicles</h3>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">15/20 nhiệm vụ</p>
                  </div>
                  <span className="bg-[#EBF5FF] text-[#457B9D] px-2 py-1 text-[10px] font-bold uppercase rounded-sm border border-[#457B9D]/30">Active</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-gray-100 border-2 border-manga-ink relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-[#E63946]" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Hoàn thành</span>
                  <span className="text-sm font-bold text-[#E63946]">75%</span>
                </div>
              </div>

              {/* Project 2 */}
              <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-base text-manga-ink">Moonlight Academy</h3>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">12/20 nhiệm vụ</p>
                  </div>
                  <span className="bg-[#EBF5FF] text-[#457B9D] px-2 py-1 text-[10px] font-bold uppercase rounded-sm border border-[#457B9D]/30">Active</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-gray-100 border-2 border-manga-ink relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-[#E63946]" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Hoàn thành</span>
                  <span className="text-sm font-bold text-[#E63946]">60%</span>
                </div>
              </div>

              {/* Project 3 */}
              <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-base text-manga-ink">Steel Warriors</h3>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">17/20 nhiệm vụ</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-gray-100 border-2 border-manga-ink relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-[#E63946]" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Hoàn thành</span>
                  <span className="text-sm font-bold text-[#E63946]">85%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="bg-[#FAFAFA] border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-bold text-sm uppercase tracking-wider mb-4 text-manga-ink">TRUY CẬP NHANH</h2>
            <div className="space-y-3">
              <Link to="/dashboard/assistant/tasks" className="flex items-center justify-between p-3 bg-white border-2 border-gray-200 hover:border-manga-ink hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all group">
                <span className="text-sm font-bold text-manga-ink">Xem tất cả nhiệm vụ</span>
                <ArrowRight className="w-4 h-4 text-[#E63946] group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/dashboard/assistant/reports" className="flex items-center justify-between p-3 bg-white border-2 border-gray-200 hover:border-manga-ink hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all group">
                <span className="text-sm font-bold text-manga-ink">Báo cáo hiệu suất tháng 5</span>
                <ArrowRight className="w-4 h-4 text-[#E63946] group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/dashboard/assistant/feedback" className="flex items-center justify-between p-3 bg-white border-2 border-gray-200 hover:border-manga-ink hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all group">
                <span className="text-sm font-bold text-manga-ink">Phản hồi đang chờ xử lý</span>
                <ArrowRight className="w-4 h-4 text-[#E63946] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
