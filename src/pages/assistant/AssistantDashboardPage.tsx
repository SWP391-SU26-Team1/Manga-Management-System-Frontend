import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, CheckCircle2, TrendingUp, Bell, ArrowRight, Activity, ArrowUpRight, Loader2, Check, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import assistantService, { DashboardOverview, DashboardPerformance, PerformanceBySeriesItem, AssistantNotification } from '@/services/assistant.service'

export default function AssistantDashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [performance, setPerformance] = useState<DashboardPerformance | null>(null)
  const [seriesList, setSeriesList] = useState<PerformanceBySeriesItem[]>([])
  const [notifications, setNotifications] = useState<AssistantNotification[]>([])
  const [weeklyCompleted, setWeeklyCompleted] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [overData, perfData, seriesData, notifsRes, tasksRes] = await Promise.all([
        assistantService.getOverview(),
        assistantService.getPerformance(),
        assistantService.getBySeries(),
        assistantService.listNotifications({ limit: 6 }),
        assistantService.listMyTasks({ status: 'completed' })
      ])

      setOverview(overData)
      setPerformance(perfData)
      setSeriesList(seriesData || [])
      setNotifications(notifsRes?.data || [])

      // Calculate weekly completed count (last 7 days)
      const last7Days = new Date()
      last7Days.setDate(last7Days.getDate() - 7)
      const weeklyCount = (tasksRes?.data || []).filter(task => {
        if (!task.updated_at) return false
        const updatedAt = new Date(task.updated_at)
        return updatedAt >= last7Days
      }).length
      setWeeklyCompleted(weeklyCount)
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError('Không thể kết nối máy chủ để tải dữ liệu trang chủ.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('mangaflow_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
    loadUser()
    window.addEventListener('mangaflow_profile_updated', loadUser)
    return () => window.removeEventListener('mangaflow_profile_updated', loadUser)
  }, [])

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await assistantService.markRead(id)
      const notifsRes = await assistantService.listNotifications({ limit: 6 })
      setNotifications(notifsRes?.data || [])
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return
    try {
      await assistantService.deleteNotification(id)
      const notifsRes = await assistantService.listNotifications({ limit: 6 })
      setNotifications(notifsRes?.data || [])
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 3600000)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays === 1) return 'Hôm qua'
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getNotificationStyle = (type: string, content: string) => {
    const t = (type || '').toLowerCase()
    const c = (content || '').toLowerCase()

    if (t.includes('urgent') || t.includes('deadline') || c.includes('hạn chót') || c.includes('khẩn cấp') || c.includes('hết hạn') || c.includes('quá hạn')) {
      return {
        bg: 'bg-[#FFF5F5] border-l-4 border-l-[#E63946] border-y-2 border-r-2 border-manga-ink p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
        label: 'Khẩn cấp',
        textColor: 'text-[#E63946]',
        icon: AlertTriangle
      }
    }
    if (t.includes('approved') || t.includes('success') || c.includes('duyệt') || c.includes('thành công')) {
      return {
        bg: 'bg-[#F2FDF5] border-l-4 border-l-[#2A9D8F] border-y-2 border-r-2 border-manga-ink p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
        label: 'Nhiệm vụ được duyệt',
        textColor: 'text-[#2A9D8F]',
        icon: CheckCircle2
      }
    }
    if (t.includes('feedback') || t.includes('comment') || c.includes('phản hồi') || c.includes('góp ý')) {
      return {
        bg: 'bg-[#F0F7FF] border-l-4 border-l-[#457B9D] border-y-2 border-r-2 border-manga-ink p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
        label: 'Phản hồi mới',
        textColor: 'text-[#457B9D]',
        icon: Bell
      }
    }
    return {
      bg: 'bg-white border-l-4 border-l-gray-400 border-y-2 border-r-2 border-manga-ink p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
      label: 'Thông báo',
      textColor: 'text-gray-600',
      icon: Bell
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-manga-red" />
        <p className="font-manga text-lg font-bold text-manga-ink uppercase">Đang tải dữ liệu trang chủ...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto p-8 text-center bg-[#FFF5F5] border-4 border-manga-ink shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <AlertTriangle className="w-16 h-16 mx-auto text-[#E63946] mb-4" />
        <h2 className="font-manga text-2xl font-bold uppercase text-manga-ink mb-2">Đã xảy ra lỗi</h2>
        <p className="text-gray-700 font-bold mb-6">{error}</p>
        <button
          onClick={loadData}
          className="bg-[#E63946] text-white px-6 py-3 font-bold uppercase text-sm border-2 border-manga-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-white hover:text-[#E63946] transition-colors"
        >
          Thử lại
        </button>
      </div>
    )
  }

  const displayName = user?.fullName || 'NGUYỄN MINH KHÔI'
  const urgentCount = overview?.overdue_tasks || 0

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-manga text-4xl md:text-[40px] font-bold uppercase text-manga-ink leading-tight">
            CHÀO BUỔI SÁNG, <span className="text-[#E63946]">{displayName}</span>
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-1">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Đây là tổng quan hệ thống của bạn hôm nay
          </p>
        </div>
        {urgentCount > 0 ? (
          <button className="bg-[#E63946] text-white px-5 py-2.5 font-bold uppercase text-xs flex items-center gap-2 border-2 border-[#E63946] hover:bg-white hover:text-[#E63946] transition-colors whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <AlertTriangle className="w-4 h-4" />
            {urgentCount} HẠN CHÓT KHẨN CẤP
          </button>
        ) : (
          <div className="bg-[#2A9D8F] text-white px-5 py-2.5 font-bold uppercase text-xs flex items-center gap-2 border-2 border-[#2A9D8F] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4" />
            0 HẠN CHÓT QUÁ HẠN
          </div>
        )}
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
            <div className="font-manga text-[80px] leading-none font-bold text-[#E63946]">
              {performance?.completed_tasks || 0}
            </div>
            <p className="text-sm font-semibold text-gray-400 mt-2">Tất cả thời gian tích lũy</p>
          </div>
          <div className="flex justify-between items-end mt-8 border-t-2 border-gray-100 pt-4">
            <span className="text-sm font-semibold text-gray-500">Tỷ lệ hoàn thành</span>
            <span className="text-sm font-bold text-[#2A9D8F] flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> {performance?.completion_rate_pct || 0}%
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
            <div className="font-manga text-[42px] leading-none font-bold text-[#457B9D]">
              {seriesList.length}
            </div>
            <p className="text-[13px] font-semibold text-gray-400 mt-2 truncate">
              {seriesList.map(s => s.title).join(', ') || 'Không có dự án nào'}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-[#2A9D8F] mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <h3 className="font-bold text-[11px] uppercase tracking-wider text-manga-ink">ĐÃ DUYỆT TUẦN NÀY</h3>
            </div>
            <div className="font-manga text-[42px] leading-none font-bold text-[#2A9D8F]">
              {weeklyCompleted}
            </div>
            <p className="text-[13px] font-semibold text-gray-400 mt-2">Hoàn thành trong 7 ngày qua</p>
          </div>

          {/* Card 3 (Dark) */}
          <div className="bg-[#1A1A1A] border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-[#E63946] mb-3">
              <Clock className="w-4 h-4" />
              <h3 className="font-bold text-[11px] uppercase tracking-wider text-white">NHIỆM VỤ ĐANG LÀM</h3>
            </div>
            <div className="font-manga text-[42px] leading-none font-bold text-white">
              {overview?.in_progress || 0}
            </div>
            <p className="text-[13px] font-semibold text-gray-400 mt-2">
              {overview?.needs_revision || 0} cần sửa, {overview?.assigned || 0} được giao
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-manga-ink mb-3">
              <TrendingUp className="w-4 h-4" />
              <h3 className="font-bold text-[11px] uppercase tracking-wider text-manga-ink">NHIỆM VỤ THÁNG NÀY</h3>
            </div>
            <div className="font-manga text-[42px] leading-none font-bold text-manga-ink">
              {performance?.total_tasks || 0}
            </div>
            <p className="text-[13px] font-semibold text-gray-400 mt-2">
              Thời gian TB: {performance?.avg_completion_hours ? `${Math.round(performance.avg_completion_hours)} giờ` : 'Chưa thống kê'}
            </p>
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
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="bg-[#E63946] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                  {notifications.filter(n => !n.is_read).length} Chưa đọc
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                const style = getNotificationStyle(notif.type, notif.content)
                const Icon = style.icon
                return (
                  <div key={notif.notification_id} className={style.bg}>
                    <div className="flex justify-between items-start mb-2">
                      <div className={`flex items-center gap-2 ${style.textColor}`}>
                        <Icon className="w-4 h-4" />
                        <span className="font-bold text-[11px] uppercase tracking-wider">{style.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notif.is_read && <span className="w-2 h-2 rounded-full bg-red-500" title="Chưa đọc"></span>}
                        <span className="text-[11px] font-semibold text-gray-400">{formatTimeAgo(notif.created_at)}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-manga-ink mb-1">{notif.title}</h4>
                    <p className="text-[13px] font-medium text-gray-800 leading-relaxed">
                      {notif.content}
                    </p>
                    <div className="flex justify-end gap-3 mt-3 pt-2 border-t border-gray-100">
                      {!notif.is_read && (
                        <button
                          onClick={(e) => handleMarkRead(notif.notification_id, e)}
                          className="text-[11px] font-bold text-gray-500 hover:text-manga-ink flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Đọc
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteNotification(notif.notification_id, e)}
                        className="text-[11px] font-bold text-gray-500 hover:text-[#E63946] flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="bg-white border-2 border-manga-ink p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 font-bold uppercase text-sm">Không có thông báo nào</p>
              </div>
            )}
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
              {seriesList.length > 0 ? (
                seriesList.map((series, idx) => {
                  const pct = series.total > 0 ? Math.round((series.completed / series.total) * 100) : 0
                  return (
                    <div key={series.series_id || idx} className="bg-white border-2 border-manga-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-base text-manga-ink">{series.title}</h3>
                          <p className="text-xs font-semibold text-gray-400 mt-0.5">{series.completed}/{series.total} nhiệm vụ</p>
                        </div>
                        <span className="bg-[#EBF5FF] text-[#457B9D] px-2 py-1 text-[10px] font-bold uppercase rounded-sm border border-[#457B9D]/30">Active</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 bg-gray-100 border-2 border-manga-ink relative overflow-hidden">
                          <div className="absolute top-0 left-0 h-full bg-[#E63946]" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Hoàn thành</span>
                        <span className="text-sm font-bold text-[#E63946]">{pct}%</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="bg-white border-2 border-manga-ink p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                  <Activity className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 font-bold uppercase text-sm">Chưa tham gia dự án nào</p>
                </div>
              )}
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
                <span className="text-sm font-bold text-manga-ink">Xem báo cáo hiệu suất</span>
                <ArrowRight className="w-4 h-4 text-[#E63946] group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/dashboard/assistant/feedback" className="flex items-center justify-between p-3 bg-white border-2 border-gray-200 hover:border-manga-ink hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all group">
                <span className="text-sm font-bold text-manga-ink">Phản hồi và nộp lại</span>
                <ArrowRight className="w-4 h-4 text-[#E63946] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

