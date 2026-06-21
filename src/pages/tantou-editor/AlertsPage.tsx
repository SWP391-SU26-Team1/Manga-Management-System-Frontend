import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { AlertTriangle, AlertCircle, ShieldAlert, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { editorService, ApiAlert } from '../../services/editor.service'

export default function AlertsPage() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<ApiAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const res = await editorService.getAlerts()
      if (res.success && Array.isArray(res.data)) {
        setAlerts(res.data)
      } else {
        setAlerts(res.data || [])
      }
      setError(null)
    } catch (err: any) {
      console.error(err)
      setError('Không thể tải danh sách cảnh báo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleResolve = async (id: string, title: string) => {
    try {
      await editorService.resolveAlert(id)
      setAlerts(prev => prev.filter(a => a.alert_id !== id))
      showToast(`Đã đánh dấu "${title}" là đã giải quyết!`)
    } catch (err: any) {
      console.error(err)
      showToast(`Lỗi khi giải quyết cảnh báo: ${err.message || 'Không xác định'}`)
    }
  }

  const criticalCount = alerts.filter(a => a.type === 'CRITICAL').length
  const highCount = alerts.filter(a => a.type === 'HIGH').length
  const mediumCount = alerts.filter(a => a.type === 'MEDIUM').length

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-manga-ink text-white px-6 py-3 border-4 border-manga-red shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          {toastMessage}
        </div>
      )}

      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none">
            CẢNH BÁO RỦI RO
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-2">
            Hệ thống phát hiện các rủi ro về tiến độ và chất lượng
          </p>
        </div>
        {!loading && criticalCount > 0 && (
          <div className="bg-red-50 px-4 py-2 border-2 border-red-600 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
            <span className="text-red-700 font-bold text-sm">CÓ {criticalCount} RỦI RO NGHIÊM TRỌNG</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border-2 border-red-600 p-4 relative overflow-hidden">
          <ShieldAlert className="w-16 h-16 text-red-100 absolute -right-2 -bottom-2" />
          <div className="relative z-10">
            <h3 className="font-bold text-red-600 text-xs uppercase mb-1">Nghiêm Trọng</h3>
            <div className="text-4xl font-black text-manga-ink">{loading ? '...' : criticalCount}</div>
            <p className="text-[10px] font-bold text-gray-500 mt-2">Cần xử lý trong 24h</p>
          </div>
        </div>
        <div className="bg-white border-2 border-orange-500 p-4 relative overflow-hidden">
          <AlertCircle className="w-16 h-16 text-orange-100 absolute -right-2 -bottom-2" />
          <div className="relative z-10">
            <h3 className="font-bold text-orange-600 text-xs uppercase mb-1">Rủi Ro Cao</h3>
            <div className="text-4xl font-black text-manga-ink">{loading ? '...' : highCount}</div>
            <p className="text-[10px] font-bold text-gray-500 mt-2">Cần xử lý trong 48h</p>
          </div>
        </div>
        <div className="bg-white border-2 border-yellow-400 p-4 relative overflow-hidden">
          <AlertTriangle className="w-16 h-16 text-yellow-100 absolute -right-2 -bottom-2" />
          <div className="relative z-10">
            <h3 className="font-bold text-yellow-600 text-xs uppercase mb-1">Cảnh Cáo</h3>
            <div className="text-4xl font-black text-manga-ink">{loading ? '...' : mediumCount}</div>
            <p className="text-[10px] font-bold text-gray-500 mt-2">Nên theo dõi thêm</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border-4 border-manga-ink p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-manga-ink animate-spin" />
          <p className="font-bold text-manga-ink">Đang tải danh sách cảnh báo...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-4 border-red-600 p-6 text-center">
          <p className="font-bold text-lg text-red-600">{error}</p>
          <button
            onClick={loadAlerts}
            className="mt-4 px-4 py-2 bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.length === 0 && (
            <div className="bg-white border-4 border-manga-ink p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="font-bold text-lg text-manga-ink">Không có cảnh báo nào!</p>
              <p className="text-sm text-gray-500 mt-1">Tất cả các rủi ro đã được giải quyết.</p>
            </div>
          )}
          {alerts.map(alert => (
            <div key={alert.alert_id} className={`bg-white border-l-8 p-6 flex items-start gap-6 shadow-sm ${
              alert.type === 'CRITICAL' ? 'border-red-600 border-y-2 border-r-2 border-y-gray-200 border-r-gray-200' :
              alert.type === 'HIGH' ? 'border-orange-500 border-y-2 border-r-2 border-y-gray-200 border-r-gray-200' :
              'border-yellow-400 border-y-2 border-r-2 border-y-gray-200 border-r-gray-200'
            }`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase text-white ${
                    alert.type === 'CRITICAL' ? 'bg-red-600' :
                    alert.type === 'HIGH' ? 'bg-orange-500' :
                    'bg-yellow-400 text-yellow-900'
                  }`}>
                    {alert.type}
                  </span>
                  <span className="text-xs font-bold text-gray-400">{formatDate(alert.time)}</span>
                </div>
                <h2 className="font-bold text-lg text-manga-ink mb-1">{alert.title}</h2>
                <div className="text-sm font-bold text-manga-red mb-3">Series: {alert.series_title}</div>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 border border-gray-100">
                  {alert.detail}
                </p>
              </div>
              
              <div className="w-48 flex-shrink-0 flex flex-col gap-2 pt-6">
                {alert.action && alert.action_path && (
                  <button 
                    onClick={() => navigate(alert.action_path || '#')}
                    className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                      alert.type === 'CRITICAL' ? 'bg-red-600 text-white hover:bg-red-700' :
                      'bg-manga-ink text-white hover:bg-black'
                    }`}
                  >
                    {alert.action} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button 
                  onClick={() => handleResolve(alert.alert_id, alert.title)}
                  className="w-full py-2 bg-white text-gray-500 hover:text-green-600 hover:bg-green-50 border border-gray-200 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã Giải Quyết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
