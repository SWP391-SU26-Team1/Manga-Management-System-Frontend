import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { AlertTriangle, AlertCircle, Info, ChevronRight, X, FileWarning } from 'lucide-react'
import { RiskAlert } from '@/data/mangakaMockData'
import { seriesService } from '@/services/series.service'
import { rankingService } from '@/services/ranking.service'

export default function RiskAlertsPage() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null)
  const [loading, setLoading] = useState(true)
  const [readAlerts, setReadAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const mySeries = await seriesService.getAll()
      if (mySeries.length === 0) {
        setAlerts([])
        return
      }

      // Get system notifications (cảnh báo rủi ro hệ thống)
      const notifications = await rankingService.getNotifications()
      const warningNotifs = notifications.filter(n => n.type === 'ranking_warning')

      const notificationAlerts: RiskAlert[] = warningNotifs.map(n => {
        const matched = mySeries.find(s => n.content.includes(s.title) || n.title.includes(s.title))
        return {
          id: n.notification_id,
          seriesId: matched ? matched.title : 'Tác phẩm',
          seriesIdRaw: matched ? matched._id : '',
          level: (n.content.toLowerCase().includes('high') || n.title.toLowerCase().includes('nguy cơ') || n.content.toLowerCase().includes('rủi ro')) ? 'High' : 'Medium',
          message: n.content,
          createdAt: n.created_at,
          isRead: n.is_read
        } as any
      })

      // Check dynamic series risk (tự động phân tích)
      const dynamicRiskAlerts: RiskAlert[] = []
      await Promise.all(
        mySeries.map(async (series) => {
          try {
            const riskData = await rankingService.checkSeriesRisk(series._id)
            if (riskData && riskData.at_risk) {
              const level = riskData.low_score ? 'High' : 'Medium'
              dynamicRiskAlerts.push({
                id: `dynamic_${series._id}`,
                seriesId: series.title,
                seriesIdRaw: series._id,
                level,
                message: `Tác phẩm "${series.title}" đang gặp rủi ro ${level === 'High' ? 'cao' : 'trung bình'}. ${riskData.declining ? 'Xếp hạng đang giảm liên tiếp.' : ''} ${riskData.low_score ? 'Điểm tương tác thấp (< 5).' : ''}`,
                createdAt: new Date().toISOString(),
                isRead: false
              } as any)
            }
          } catch (e) {
            console.error('Error checking risk for series:', series.title, e)
          }
        })
      )

      setAlerts([...notificationAlerts, ...dynamicRiskAlerts])
    } catch (err) {
      console.error('Lỗi khi tải cảnh báo rủi ro:', err)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: "Tổng cảnh báo", value: alerts.length, icon: AlertCircle, color: "text-gray-600" },
    { label: "Rủi ro Cao", value: alerts.filter(a => a.level === 'High').length, icon: AlertTriangle, color: "text-red-600" },
    { label: "Chưa đọc", value: alerts.filter(a => !a.isRead && !readAlerts.has(a.id)).length, icon: Info, color: "text-orange-500" },
  ]

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // UI update
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
    setReadAlerts(prev => new Set([...prev, id]));

    if (!id.startsWith('dynamic_')) {
      try {
        await rankingService.markAsRead(id)
      } catch (err) {
        console.error('Lỗi khi đánh dấu thông báo đã đọc:', err)
      }
    }
  }

  const handleCreateProposal = (seriesIdRaw: string) => {
    navigate(`/dashboard/mangaka/recovery-proposal?seriesId=${seriesIdRaw}`);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-red tracking-wide mb-2 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8" />
            CẢNH BÁO RỦI RO
          </h1>
          <p className="text-gray-600 font-bold">Theo dõi các nguy cơ tụt hạng và đánh giá thấp</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border-4 border-manga-ink manga-shadow p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">{stat.label}</p>
              <p className={`text-3xl font-manga font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <stat.icon className={`w-10 h-10 ${stat.color} opacity-50`} />
          </div>
        ))}
      </div>

      <div className="bg-white border-4 border-manga-ink manga-shadow">
        <div className="p-4 border-b-4 border-manga-ink bg-gray-50">
          <h2 className="font-manga font-bold text-xl uppercase">Danh sách cảnh báo</h2>
        </div>
        <div className="divide-y-2 divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-bold">Đang phân tích và tải cảnh báo rủi ro từ hệ thống...</div>
          ) : (
            <>
              {alerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`p-6 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 transition-colors cursor-pointer ${
                    (!alert.isRead && !readAlerts.has(alert.id)) ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 flex items-center justify-center border-2 border-manga-ink shrink-0 ${
                      alert.level === 'High' ? 'bg-red-100 text-red-600' : 
                      alert.level === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {alert.seriesId}
                        {(!alert.isRead && !readAlerts.has(alert.id)) && <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>}
                      </h3>
                      <p className="text-sm text-gray-700 font-bold mb-1">{alert.message}</p>
                      <p className="text-[11px] text-gray-400 font-bold uppercase">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span className={`px-3 py-1 border-2 border-manga-ink font-bold text-xs uppercase ${
                      alert.level === 'High' ? 'bg-red-600 text-white' : 
                      alert.level === 'Medium' ? 'bg-orange-500 text-white' : 'bg-yellow-400 text-black'
                    }`}>
                      {alert.level}
                    </span>
                    <button 
                      className="p-2 border-2 border-manga-ink bg-white hover:bg-manga-ink hover:text-white transition-colors"
                      title="Xem chi tiết"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="p-8 text-center text-gray-500 font-bold">Không có cảnh báo rủi ro nào.</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink manga-shadow max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="p-4 border-b-4 border-manga-ink flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="font-manga font-bold text-xl uppercase flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Chi tiết Cảnh báo
              </h2>
              <button onClick={() => {
                if(!selectedAlert.isRead) handleMarkAsRead(selectedAlert.id);
                setSelectedAlert(null);
              }} className="hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex gap-4 mb-6">
                 <span className={`px-4 py-1.5 border-2 border-manga-ink font-bold uppercase ${
                  selectedAlert.level === 'High' ? 'bg-red-600 text-white' : 
                  selectedAlert.level === 'Medium' ? 'bg-orange-500 text-white' : 'bg-yellow-400 text-black'
                }`}>
                  Mức độ: {selectedAlert.level}
                </span>
                <span className="px-4 py-1.5 border-2 border-gray-200 bg-gray-100 font-bold text-gray-600">
                  {new Date(selectedAlert.createdAt).toLocaleString()}
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-1">Series liên quan</h3>
                <p className="text-xl font-bold">{selectedAlert.seriesId}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Nội dung cảnh báo</h3>
                <div className="p-4 border-l-4 border-red-500 bg-red-50 text-gray-800 font-bold">
                  {selectedAlert.message}
                </div>
              </div>

              <div className="bg-orange-50 p-4 border-2 border-orange-200 mb-6 flex gap-4">
                <FileWarning className="w-6 h-6 text-orange-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-orange-800">Cần hành động ngay</h4>
                  <p className="text-sm text-orange-700">Hãy lập Đề xuất cứu vãn (Recovery Proposal) để trình bày giải pháp cải thiện tình hình với Tantou Editor.</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t-4 border-manga-ink bg-gray-50 flex justify-between items-center shrink-0">
              <button 
                onClick={() => { handleMarkAsRead(selectedAlert.id); setSelectedAlert(null); }}
                className="px-6 py-2 border-2 border-manga-ink font-bold hover:bg-gray-100 uppercase bg-white text-sm"
              >
                Đóng & Đánh dấu đã đọc
              </button>
              
              <button 
                onClick={() => handleCreateProposal((selectedAlert as any).seriesIdRaw || selectedAlert.seriesId)}
                className="bg-manga-red text-white font-manga font-bold px-6 py-2 border-2 border-manga-ink hover:bg-red-700 uppercase flex items-center gap-2"
              >
                <FileWarning className="w-5 h-5" />
                Lập Đề xuất cứu vãn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
