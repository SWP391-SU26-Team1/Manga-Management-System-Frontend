import React, { useState, useEffect } from 'react'
import { FileText, Plus, CheckCircle2, Clock, Send, Eye, Loader2, AlertCircle } from 'lucide-react'
import { editorService, ApiReport } from '../../services/editor.service'

export default function EditorialReportsPage() {
  const [reports, setReports] = useState<ApiReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('ALL')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [viewingReport, setViewingReport] = useState<ApiReport | null>(null)

  // Report Form Modal States
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [modalTitle, setModalTitle] = useState('')
  const [modalType, setModalType] = useState<'MONTHLY' | 'CHAPTER' | 'ALERT'>('MONTHLY')
  const [modalContent, setModalContent] = useState('')

  const loadReports = async () => {
    try {
      setLoading(true)
      const res = await editorService.getReports()
      if (res.success && Array.isArray(res.data)) {
        setReports(res.data)
      } else {
        setReports(res.data || [])
      }
      setError(null)
    } catch (err: any) {
      console.error(err)
      setError('Không thể tải danh sách báo cáo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleCreateReportClick = () => {
    setModalMode('create')
    setModalTitle('')
    setModalType('MONTHLY')
    setModalContent('')
    setReportModalOpen(true)
  }

  const handleEditReport = (report: ApiReport) => {
    setModalMode('edit')
    setSelectedReportId(report.report_id)
    setModalTitle(report.title)
    setModalContent(report.content)
    setReportModalOpen(true)
  }

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (modalMode === 'create') {
        await editorService.createReport({
          title: modalTitle,
          type: modalType,
          content: modalContent
        })
        showToast('Đã tạo báo cáo mới thành công!')
      } else {
        await editorService.updateReport(selectedReportId!, {
          title: modalTitle,
          content: modalContent
        })
        showToast('Đã cập nhật báo cáo thành công!')
      }
      setReportModalOpen(false)
      loadReports()
    } catch (err: any) {
      console.error(err)
      showToast(`Lỗi: ${err.message || 'Không thể lưu báo cáo'}`)
    }
  }

  const handleSendReport = async (id: string) => {
    try {
      await editorService.submitReport(id)
      setReports(prev => prev.map(r => r.report_id === id ? { ...r, status: 'PENDING_REVIEW' as const } : r))
      showToast('Đã gửi báo cáo lên Ban Biên Tập để duyệt!')
    } catch (err: any) {
      console.error(err)
      showToast(`Lỗi khi gửi báo cáo: ${err.message || 'Không xác định'}`)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return date.toLocaleDateString('vi-VN')
    } catch {
      return dateStr
    }
  }

  const draftCount = reports.filter(r => r.status === 'DRAFT').length
  const pendingCount = reports.filter(r => r.status === 'PENDING_REVIEW').length
  const approvedCount = reports.filter(r => r.status === 'APPROVED').length

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-manga-ink text-white px-6 py-3 border-4 border-manga-red shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          {toastMessage}
        </div>
      )}

      {/* View Report Modal */}
      {viewingReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink p-6 max-w-lg w-full animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b-2 border-gray-100 pb-3 mb-4">
              <h2 className="font-manga text-xl font-bold uppercase text-manga-ink">Chi Tiết Báo Cáo</h2>
              <button onClick={() => setViewingReport(null)} className="text-gray-400 hover:text-manga-ink">
                <span className="font-bold text-xl">&times;</span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Tên báo cáo</div>
                <div className="font-bold text-manga-ink">{viewingReport.title}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase mb-1">Phân loại</div>
                  <div className="text-sm font-bold">{viewingReport.type}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase mb-1">Ngày</div>
                  <div className="text-sm font-bold">{formatDate(viewingReport.updated_at || viewingReport.created_at)}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase mb-1">Series</div>
                  <div className="text-sm font-bold">{viewingReport.series_count || 0} series</div>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Nội dung</div>
                <div className="bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {viewingReport.content}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setViewingReport(null)} className="px-4 py-2 bg-manga-ink text-white font-bold text-sm uppercase hover:bg-black">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-manga-ink p-6 max-w-lg w-full animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b-2 border-gray-100 pb-3 mb-4">
              <h2 className="font-manga text-xl font-bold uppercase text-manga-ink">
                {modalMode === 'create' ? 'Tạo Báo Cáo Mới' : 'Chỉnh Sửa Báo Cáo'}
              </h2>
              <button onClick={() => setReportModalOpen(false)} className="text-gray-400 hover:text-manga-ink">
                <span className="font-bold text-xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên báo cáo</label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-manga-ink text-sm focus:outline-none"
                  placeholder="Nhập tên báo cáo..."
                />
              </div>
              
              {modalMode === 'create' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phân loại</label>
                  <select
                    value={modalType}
                    onChange={(e) => setModalType(e.target.value as any)}
                    className="w-full px-3 py-2 border-2 border-manga-ink text-sm focus:outline-none bg-white"
                  >
                    <option value="MONTHLY">Định Kỳ Tháng (MONTHLY)</option>
                    <option value="CHAPTER">Đánh Giá Chương (CHAPTER)</option>
                    <option value="ALERT">Cảnh Báo Rủi Ro (ALERT)</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nội dung báo cáo</label>
                <textarea
                  required
                  rows={6}
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-manga-ink text-sm focus:outline-none"
                  placeholder="Nhập nội dung báo cáo chi tiết..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 border-2 border-gray-200 text-gray-500 font-bold text-sm uppercase hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-manga-ink text-white font-bold text-sm uppercase hover:bg-black transition-colors"
                >
                  {modalMode === 'create' ? 'Tạo Mới' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none">
            BÁO CÁO BIÊN TẬP
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-2">
            Quản lý báo cáo định kỳ và gửi đánh giá lên Editorial Board
          </p>
        </div>
        <button onClick={handleCreateReportClick} className="bg-manga-red text-white px-6 py-3 font-bold uppercase tracking-wider text-sm flex items-center gap-2 hover:bg-red-700 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none hover:translate-x-1">
          <Plus className="w-5 h-5" /> TẠO BÁO CÁO MỚI
        </button>
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`w-full text-left px-4 py-3 font-bold text-sm uppercase transition-colors border-2 ${activeTab === 'ALL' ? 'bg-manga-ink text-white border-manga-ink' : 'bg-white text-gray-500 border-gray-200 hover:border-manga-ink'}`}
          >
            Tất Cả Báo Cáo
          </button>
          <button 
            onClick={() => setActiveTab('DRAFT')}
            className={`w-full text-left px-4 py-3 font-bold text-sm uppercase transition-colors border-2 ${activeTab === 'DRAFT' ? 'bg-manga-ink text-white border-manga-ink' : 'bg-white text-gray-500 border-gray-200 hover:border-manga-ink'}`}
          >
            Bản Nháp ({loading ? '...' : draftCount})
          </button>
          <button 
            onClick={() => setActiveTab('PENDING_REVIEW')}
            className={`w-full text-left px-4 py-3 font-bold text-sm uppercase transition-colors border-2 ${activeTab === 'PENDING_REVIEW' ? 'bg-manga-ink text-white border-manga-ink' : 'bg-white text-gray-500 border-gray-200 hover:border-manga-ink'}`}
          >
            Chờ Board Duyệt ({loading ? '...' : pendingCount})
          </button>
          <button 
            onClick={() => setActiveTab('APPROVED')}
            className={`w-full text-left px-4 py-3 font-bold text-sm uppercase transition-colors border-2 ${activeTab === 'APPROVED' ? 'bg-manga-ink text-white border-manga-ink' : 'bg-white text-gray-500 border-gray-200 hover:border-manga-ink'}`}
          >
            Đã Phê Duyệt ({loading ? '...' : approvedCount})
          </button>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="bg-white border-4 border-manga-ink p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-manga-ink animate-spin" />
              <p className="font-bold text-manga-ink">Đang tải danh sách báo cáo...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-4 border-red-600 p-6 text-center">
              <p className="font-bold text-lg text-red-600">{error}</p>
              <button
                onClick={loadReports}
                className="mt-4 px-4 py-2 bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-700"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="bg-white border-4 border-manga-ink">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-4 border-manga-ink bg-gray-50">
                    <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider">Tên Báo Cáo</th>
                    <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider">Phân Loại</th>
                    <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider">Trạng Thái</th>
                    <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider">Ngày Cập Nhật</th>
                    <th className="px-6 py-4 text-xs font-black text-manga-ink uppercase tracking-wider text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-100">
                  {reports.filter(r => activeTab === 'ALL' || r.status === activeTab).map((report) => (
                    <tr key={report.report_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-manga-ink mb-1">{report.title}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">{report.series_count || 0} Series liên quan</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase border border-gray-300">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {report.status === 'DRAFT' && <span className="flex items-center gap-1 text-gray-500 font-bold text-xs uppercase"><FileText className="w-4 h-4" /> Bản nháp</span>}
                        {report.status === 'PENDING_REVIEW' && <span className="flex items-center gap-1 text-blue-600 font-bold text-xs uppercase"><Clock className="w-4 h-4" /> Chờ duyệt</span>}
                        {report.status === 'APPROVED' && <span className="flex items-center gap-1 text-green-600 font-bold text-xs uppercase"><CheckCircle2 className="w-4 h-4" /> Đã duyệt</span>}
                      </td>
                      <td className="px-6 py-4 font-bold text-sm text-gray-600">{formatDate(report.updated_at || report.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        {report.status === 'DRAFT' ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditReport(report)} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 font-bold text-[10px] uppercase hover:bg-gray-50">Sửa</button>
                            <button onClick={() => handleSendReport(report.report_id)} className="px-3 py-1.5 bg-blue-50 border border-blue-500 text-blue-600 font-bold text-[10px] uppercase hover:bg-blue-100 flex items-center gap-1">
                              <Send className="w-3 h-3" /> Gửi
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setViewingReport(report)} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 font-bold text-[10px] uppercase hover:bg-gray-50 flex items-center gap-1 ml-auto">
                            <Eye className="w-3 h-3" /> Xem
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {reports.filter(r => activeTab === 'ALL' || r.status === activeTab).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-bold">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        Không có báo cáo nào trong phân loại này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
