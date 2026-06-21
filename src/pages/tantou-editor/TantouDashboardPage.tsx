import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { FileText, AlertTriangle, RefreshCw, MessageSquareText, TrendingUp, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { editorService } from '@/services/editor.service'

export default function TantouDashboardPage() {
  const navigate = useNavigate()

  // Get user from localStorage
  const storedUser = localStorage.getItem('mangaflow_user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const userName = user?.fullName || user?.username || user?.user?.fullName || user?.user?.username || 'Editor'

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await editorService.getDashboardOverview()
      setDashboardData(res.data || res)
    } catch (err: any) {
      console.error('Failed to load dashboard:', err)
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Extract stats from dashboard data with fallbacks
  const stats = {
    managingSeries: {
      total: dashboardData?.managingSeries?.total ?? dashboardData?.managing_series ?? 0,
      publishing: dashboardData?.managingSeries?.publishing ?? dashboardData?.publishing_count ?? 0,
      atRisk: dashboardData?.managingSeries?.atRisk ?? dashboardData?.at_risk_count ?? 0,
      paused: dashboardData?.managingSeries?.paused ?? dashboardData?.paused_count ?? 0,
    },
    pendingReview: {
      total: dashboardData?.pendingReview?.total ?? dashboardData?.pending_review ?? 0,
      deadlineThisWeek: dashboardData?.pendingReview?.deadlineThisWeek ?? dashboardData?.deadline_this_week ?? 0,
    },
    needRevision: {
      total: dashboardData?.needRevision?.total ?? dashboardData?.need_revision ?? 0,
    },
    approvedThisMonth: {
      total: dashboardData?.approvedThisMonth?.total ?? dashboardData?.approved_this_month ?? 0,
      changeFromLastMonth: dashboardData?.approvedThisMonth?.changeFromLastMonth ?? dashboardData?.change_from_last_month ?? 0,
    },
    overdue: {
      total: dashboardData?.overdue?.total ?? dashboardData?.overdue_count ?? 0,
    },
    atRiskSeries: {
      total: dashboardData?.atRiskSeries?.total ?? dashboardData?.at_risk_series_count ?? 0,
      seriesName: dashboardData?.atRiskSeries?.seriesName ?? dashboardData?.at_risk_series_name ?? '—',
      ranking: dashboardData?.atRiskSeries?.ranking ?? dashboardData?.at_risk_series_ranking ?? 0,
    },
    todayOverview: {
      chaptersToReview: dashboardData?.todayOverview?.chaptersToReview ?? dashboardData?.chapters_to_review ?? 0,
      newResubmissions: dashboardData?.todayOverview?.newResubmissions ?? dashboardData?.new_resubmissions ?? 0,
      riskAlerts: dashboardData?.todayOverview?.riskAlerts ?? dashboardData?.risk_alerts ?? 0,
      reportsToSend: dashboardData?.todayOverview?.reportsToSend ?? dashboardData?.reports_to_send ?? 0,
    }
  }

  const { managingSeries, pendingReview, needRevision, approvedThisMonth, overdue, atRiskSeries, todayOverview } = stats

  const recentNotifications = dashboardData?.recentNotifications || dashboardData?.recent_notifications || []

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-manga-red mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center border-4 border-red-500 p-8 bg-white">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
          <button onClick={fetchDashboard} className="bg-manga-ink text-white font-bold text-xs uppercase px-4 py-2 hover:bg-black transition-colors">
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 flex gap-6">
      <div className="flex-1 space-y-6">
        
        {/* Header Greeting */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none">
              CHÀO BUỔI SÁNG, <span className="text-manga-red">{userName.toUpperCase()}</span>
            </h1>
            <p className="text-sm font-bold text-gray-500 mt-1">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Tantou Editor – MangaFlow System
            </p>
          </div>
          {atRiskSeries.total > 0 && (
            <button onClick={() => navigate('/dashboard/tantou-editor/alerts')} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 hover:bg-red-100 transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" />
              {atRiskSeries.total} SERIES AT RISK
            </button>
          )}
        </div>

        {/* 6 Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-2 border-manga-ink bg-white p-4">
            <div className="flex items-center gap-2 text-manga-red font-bold text-[10px] uppercase mb-2">
              <FileText className="w-3.5 h-3.5" /> Series Đang Phụ Trách
            </div>
            <div className="text-4xl font-black text-manga-ink leading-none mb-2">{managingSeries.total}</div>
            <div className="text-xs text-gray-500 font-medium">
              {managingSeries.publishing} Publishing · {managingSeries.atRisk} At Risk · {managingSeries.paused} Paused
            </div>
          </div>

          <div className="border-2 border-manga-ink bg-white p-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase mb-2">
              <RefreshCw className="w-3.5 h-3.5" /> Đang Chờ Review
            </div>
            <div className="text-4xl font-black text-blue-600 leading-none mb-2">{pendingReview.total}</div>
            <div className="text-xs text-gray-500 font-medium">
              {pendingReview.deadlineThisWeek} deadline tuần này
            </div>
          </div>

          <div className="border-2 border-manga-ink bg-white p-4">
            <div className="flex items-center gap-2 text-orange-500 font-bold text-[10px] uppercase mb-2">
              <MessageSquareText className="w-3.5 h-3.5" /> Bản Thảo Cần Sửa
            </div>
            <div className="text-4xl font-black text-orange-500 leading-none mb-2">{needRevision.total}</div>
            <div className="text-xs text-gray-500 font-medium">
              Mangaka chờ feedback của bạn
            </div>
          </div>

          <div className="border-4 border-manga-ink bg-manga-ink text-white p-4 relative overflow-hidden">
            <div className="flex items-center gap-2 text-green-400 font-bold text-[10px] uppercase mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã Duyệt Tháng Này
            </div>
            <div className="text-4xl font-black leading-none mb-2">{approvedThisMonth.total}</div>
            <div className="text-xs text-gray-300 font-medium">
              {approvedThisMonth.changeFromLastMonth > 0 ? '+' : ''}{approvedThisMonth.changeFromLastMonth} so với tháng trước
            </div>
          </div>

          <div className="border-2 border-manga-ink bg-white p-4">
            <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase mb-2">
              <AlertCircle className="w-3.5 h-3.5" /> Trễ Deadline
            </div>
            <div className="text-4xl font-black text-red-600 leading-none mb-2">{overdue.total}</div>
            <div className="text-xs text-red-500 font-bold">
              {overdue.total > 0 ? 'Cần xử lý ngay!' : 'Không có trễ hạn'}
            </div>
          </div>

          <div className="border-2 border-manga-ink bg-white p-4">
            <div className="flex items-center gap-2 text-orange-600 font-bold text-[10px] uppercase mb-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Series At Risk
            </div>
            <div className="text-4xl font-black text-orange-600 leading-none mb-2">{atRiskSeries.total}</div>
            <div className="text-xs text-orange-500 font-bold">
              {atRiskSeries.seriesName !== '—' ? `${atRiskSeries.seriesName} – hạng #${atRiskSeries.ranking}` : 'Không có series at risk'}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold uppercase text-manga-ink text-sm">Thông Báo Gần Đây</h2>
            <div className="flex items-center gap-3">
              {recentNotifications.length > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">{recentNotifications.filter((n: any) => !n.is_read).length || recentNotifications.length} CHƯA ĐỌC</span>
              )}
              <button onClick={() => navigate('/dashboard/tantou-editor/alerts')} className="text-xs font-bold text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors">
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="border-2 border-manga-ink bg-white divide-y-2 divide-gray-100">
            {recentNotifications.length > 0 ? recentNotifications.slice(0, 6).map((notif: any, idx: number) => (
              <div key={notif.notification_id || notif.id || idx} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold text-xs uppercase flex items-center gap-2 ${
                    notif.type === 'urgent' ? 'text-red-600' :
                    notif.type === 'warning' ? 'text-orange-500' :
                    notif.type === 'info' ? 'text-blue-500' : 'text-blue-600'
                  }`}>
                    {notif.type === 'urgent' || notif.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5" /> : 
                     notif.type === 'info' ? <RefreshCw className="w-3.5 h-3.5" /> : <BellIcon className="w-3.5 h-3.5" />}
                    {notif.title}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-red-500 transition-colors">
                    {notif.time || (notif.created_at ? new Date(notif.created_at).toLocaleDateString('vi-VN') : '')}
                  </span>
                </div>
                <p className={`text-sm ${notif.type === 'urgent' ? 'text-red-600' : 'text-blue-600'} pl-5.5 ml-1`}>
                  {notif.text || notif.content || notif.description}
                </p>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-400 text-sm font-bold">
                Không có thông báo mới
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Column */}
      <div className="w-80 flex-shrink-0 space-y-6">
        
        {/* Quick Access */}
        <div className="border-2 border-manga-ink bg-white p-5">
          <h2 className="font-bold uppercase text-manga-ink text-sm mb-4 border-b-2 border-gray-100 pb-2">Truy Cập Nhanh</h2>
          <div className="space-y-1">
            <Link to="/dashboard/tantou-editor/manuscript-review" className="flex items-center justify-between p-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors group rounded">
              <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-red-500" /> Review bản thảo mới nhất</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link to="/dashboard/tantou-editor/feedback" className="flex items-center justify-between p-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors group rounded">
              <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-green-500" /> Phản hồi & bản nộp lại</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link to="/dashboard/tantou-editor/studio-progress" className="flex items-center justify-between p-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors group rounded">
              <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500" /> Giám sát tiến độ chương</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link to="/dashboard/tantou-editor/reports" className="flex items-center justify-between p-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors group rounded">
              <span className="flex items-center gap-2"><MessageSquareText className="w-4 h-4 text-purple-500" /> Tạo báo cáo Editorial Board</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>

        {/* Today's Overview */}
        <div className="border-4 border-manga-ink bg-manga-ink text-white p-5">
          <h2 className="font-bold uppercase text-white text-sm mb-4 border-b border-white/20 pb-2">Tổng Quan Hôm Nay</h2>
          <div className="space-y-3 text-sm font-bold">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Chapter chờ review</span>
              <span className="text-blue-400">{todayOverview.chaptersToReview} chapter</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Bản nộp lại mới</span>
              <span className="text-green-400">{todayOverview.newResubmissions} bản</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Cảnh báo rủi ro</span>
              <span className="text-red-400">{todayOverview.riskAlerts} cảnh báo</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Báo cáo chờ gửi</span>
              <span className="text-yellow-400">{todayOverview.reportsToSend} báo cáo</span>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard/tantou-editor/reports')} className="w-full mt-6 bg-transparent border-2 border-white text-white font-bold text-xs uppercase py-2 hover:bg-white hover:text-manga-ink transition-colors flex items-center justify-center gap-2">
            TẠO BÁO CÁO EDITORIAL BOARD <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  )
}

function BellIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}
