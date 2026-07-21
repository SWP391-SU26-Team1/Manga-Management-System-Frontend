import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { Shield, FileWarning, Plus, CheckCircle2, Clock, BookOpen, Calendar, RefreshCw, Send, ClipboardList, X, Loader2 } from 'lucide-react'
import { editorService, ApiProposal } from '../../services/editor.service'

export default function RecoveryProposalPage() {
  const [activeTab, setActiveTab] = useState<'RECOVERY' | 'DEADLINE_REMINDER'>('RECOVERY')
  const [remindSeries, setRemindSeries] = useState('')
  const [remindChapter, setRemindChapter] = useState('')
  const [chapterList, setChapterList] = useState<any[]>([])
  const [remindMessage, setRemindMessage] = useState('')
  const [proposals, setProposals] = useState<ApiProposal[]>([])
  const [seriesList, setSeriesList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchParams] = useSearchParams()
  const submittingRef = useRef(false)

  // Form states
  // 1. Recovery
  const [recSeries, setRecSeries] = useState('Neon City Runners')
  const [recTarget, setRecTarget] = useState('Hạng #12')
  const [recReason, setRecReason] = useState('')
  const [recPlan, setRecPlan] = useState('')



  const [alerts, setAlerts] = useState<any[]>([])

  const loadProposals = async () => {
    try {
      setLoading(true)
      const res = await editorService.getProposals()
      if (res.success && Array.isArray(res.data)) {
        setProposals(res.data)
      } else {
        setProposals(res.data || [])
      }
      setError(null)
    } catch (err: any) {
      console.error(err)
      setError('Không thể tải lịch sử đề xuất.')
    } finally {
      setLoading(false)
    }
  }

  const loadSeries = async () => {
    try {
      const res = await editorService.getSeries()
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setSeriesList(res.data)
        const firstTitle = res.data[0].title
        setRecSeries(firstTitle)
        setRemindSeries(firstTitle)
      }
    } catch (err) {
      console.error('Không thể tải danh sách series', err)
    }
  }

  const loadAlerts = async () => {
    try {
      const res = await editorService.getAlerts()
      if (res.success && Array.isArray(res.data)) {
        setAlerts(res.data)
      }
    } catch (err) {
      console.error('Không thể tải danh sách cảnh báo', err)
    }
  }

  useEffect(() => {
    loadProposals()
    loadSeries()
    loadAlerts()

    const tabParam = searchParams.get('tab')
    if (tabParam === 'deadline') {
      setActiveTab('DEADLINE_REMINDER')
      const seriesParam = searchParams.get('series')
      if (seriesParam) {
        setRemindSeries(seriesParam)
      }
      const chapterParam = searchParams.get('chapter')
      if (chapterParam) {
        setRemindChapter(chapterParam)
      }
      const msgParam = searchParams.get('msg')
      if (msgParam === 'late') {
        const daysLateParam = searchParams.get('daysLate') || 'vài'
        const chapterStr = chapterParam ? `chương ${chapterParam}` : 'chương mới'
        const seriesStr = seriesParam ? `truyện "${seriesParam}"` : 'truyện'
        setRemindMessage(`Gửi tác giả, hiện tại bản thảo ${chapterStr} của ${seriesStr} đã quá hạn nộp ${daysLateParam} ngày so với lịch trình dự kiến. Vui lòng phản hồi về tình hình tiến độ và ưu tiên hoàn thành sớm nhé!`)
      }
    } else if (tabParam === 'recovery') {
      setActiveTab('RECOVERY')
      const seriesParam = searchParams.get('series')
      if (seriesParam) {
        setRecSeries(seriesParam)
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (remindSeries && activeTab === 'DEADLINE_REMINDER') {
      const selectedSeriesObj = seriesList.find((s: any) => s.title === remindSeries)
      if (selectedSeriesObj) {
        editorService.getChapters({ seriesId: selectedSeriesObj.series_id }).then(res => {
          if (res.success && res.data) {
            setChapterList(res.data)
          } else {
            setChapterList([])
          }
        })
      } else {
        setChapterList([])
      }
    }
  }, [remindSeries, activeTab, seriesList])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const isDuplicate = () => {
    if (activeTab === 'DEADLINE_REMINDER') {
      return proposals.some(p => p.type === 'DEADLINE_REMINDER' && p.series_title === remindSeries && p.metadata?.chapter === remindChapter && p.status === 'PENDING')
    }
    if (activeTab === 'RECOVERY') {
      return proposals.some(p => p.type === 'RECOVERY' && p.series_title === recSeries && p.status === 'PENDING')
    }
    return false
  }

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()

    if (submittingRef.current) return
    if (isDuplicate()) {
      showToast('Yêu cầu này đã được gửi đi')
      return
    }

    let details = ''
    let title = ''
    let metadata: any = null

    submittingRef.current = true
    setIsSubmitting(true)
    try {
      if (activeTab === 'RECOVERY') {
        title = recSeries
        details = `Đề xuất phục hồi: Mục tiêu đạt ${recTarget}. Nguyên nhân: ${recReason}. Kế hoạch: ${recPlan}`
        metadata = {
          target_rank: recTarget,
          reason: recReason,
          plan: recPlan
        }
      } else if (activeTab === 'DEADLINE_REMINDER') {
        title = remindSeries
        let finalMessage = remindMessage

        const selectedChap = chapterList.find(c => c.title === remindChapter)
        if (selectedChap && selectedChap.scheduled_date) {
          const schedDate = new Date(selectedChap.scheduled_date)
          const now = new Date()
          if (now > schedDate) {
            const diffTime = Math.abs(now.getTime() - schedDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            const autoMsg = `Gửi tác giả, hiện tại bản thảo chương ${selectedChap.title} của truyện "${remindSeries}" đã quá hạn nộp ${diffDays} ngày so với lịch trình dự kiến. Vui lòng phản hồi về tình hình tiến độ và ưu tiên hoàn thành sớm nhé!`
            if (!remindMessage) {
              finalMessage = autoMsg
            }
          }
        }
        if (!finalMessage) {
          finalMessage = `Gửi tác giả, hiện tại bản thảo chương ${remindChapter || 'mới'} của truyện "${remindSeries}" đang có dấu hiệu trễ so với lịch trình dự kiến.`
        }

        details = `Nhắc nhở Deadline cho series ${remindSeries}${remindChapter ? ` - Chương: ${remindChapter}` : ''}. Lời nhắn: ${finalMessage}`
        metadata = {
          message: finalMessage,
          chapter: remindChapter
        }
      }

      if (!title) {
        showToast('Vui lòng điền các thông tin bắt buộc!')
        return
      }

      await editorService.createProposal({
        type: activeTab,
        series_title: title,
        details,
        metadata
      })

      // Reset forms
      if (activeTab === 'RECOVERY') {
        setRecReason('')
        setRecPlan('')
      }

      showToast('Đã gửi đề xuất lên Ban Biên Tập thành công!')
      await loadProposals()
    } catch (err: any) {
      console.error(err)
      showToast(`Gửi đề xuất thất bại: ${err.response?.data?.message || err.message || 'Lỗi hệ thống'}`)
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  const getProposalTypeLabel = (type: string) => {
    switch (type) {
      case 'RECOVERY': return 'Khắc phục tụt hạng'

      case 'DEADLINE_REMINDER': return 'Nhắc Deadline'
      default: return type
    }
  }

  const getProposalTypeColor = (type: string) => {
    switch (type) {
      case 'RECOVERY': return 'bg-red-100 text-red-700 border-red-300'

      case 'DEADLINE_REMINDER': return 'bg-orange-100 text-orange-700 border-orange-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getSeriesOptions = () => {
    if (seriesList.length > 0) {
      return seriesList.map((s: any) => (
        <option key={s.series_id} value={s.title}>{s.title}</option>
      ))
    }
    return (
      <>
        <option value="Neon City Runners">Neon City Runners</option>
        <option value="Shadow Realm Chronicles">Shadow Realm Chronicles</option>
        <option value="Midnight Detective Agency">Midnight Detective Agency</option>
        <option value="Dragon's Blood Legacy">Dragon's Blood Legacy</option>
        <option value="Sakura High Chronicles">Sakura High Chronicles</option>
      </>
    )
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

  const selectedSeriesObj = seriesList.find((s: any) => s.title === recSeries)
  const hasRankDropAlert = selectedSeriesObj && alerts.some(a => 
    a.alert_id === `rank_drop_${selectedSeriesObj.series_id}` && !a.is_resolved
  )

  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-manga-ink text-white px-6 py-3 border-4 border-manga-red shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          {toastMessage}
        </div>
      )}

      <div className="mb-6">
        <h1 className="font-manga text-3xl font-bold uppercase text-manga-ink leading-none">
          BẢO VỆ SERIES & QUẢN LÝ ĐỀ XUẤT (PROPOSALS)
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-2">
          Khởi tạo và quản lý các đề xuất chất lượng, lịch đăng truyện và đăng ký tác phẩm mới gửi Ban Biên Tập
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Tabs and Form */}
        <div className="lg:col-span-2 flex flex-col bg-white border-4 border-manga-ink">
          {/* Tab Buttons bar */}
          <div className="flex bg-gray-100 border-b-4 border-manga-ink overflow-x-auto divide-x-2 divide-manga-ink">
            <button
              onClick={() => setActiveTab('RECOVERY')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap flex-1 text-center transition-colors ${activeTab === 'RECOVERY' ? 'bg-white text-manga-red' : 'text-gray-500 hover:bg-gray-50 hover:text-manga-ink'
                }`}
            >
              Khắc phục tụt hạng
            </button>
            <button
              onClick={() => setActiveTab('DEADLINE_REMINDER')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap flex-1 text-center transition-colors ${activeTab === 'DEADLINE_REMINDER' ? 'bg-white text-manga-red' : 'text-gray-500 hover:bg-gray-50 hover:text-manga-ink'
                }`}
            >
              Nhắc Deadline
            </button>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSubmitProposal} className="p-6">
            {activeTab === 'RECOVERY' && (
              <div className="space-y-4">
                {hasRankDropAlert && (
                  <div className="bg-red-50 border-2 border-red-500 p-4 mb-2 flex items-start gap-3 text-red-800">
                    <FileWarning className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-sm">Cảnh báo rớt hạng ranking cần khắc phục</h4>
                      <p className="text-xs font-medium mt-1">
                        Cần nộp đề xuất phục hồi chất lượng ngay lập tức để bảo vệ truyện trước nguy cơ bị Ban biên tập xem xét hạ rank hoặc dừng xuất bản.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Series Cần Bảo Vệ</label>
                    <select
                      value={recSeries}
                      onChange={(e) => setRecSeries(e.target.value)}
                      className="w-full border-2 border-manga-ink p-2 text-sm bg-gray-50 focus:outline-none"
                    >
                      {getSeriesOptions()}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mục Tiêu Thăng Hạng</label>
                    <input
                      type="text"
                      value={recTarget}
                      onChange={(e) => setRecTarget(e.target.value)}
                      className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nguyên nhân giảm hạng tuần qua</label>
                  <textarea
                    rows={3}
                    placeholder="Phân tích lý do (nhịp truyện chậm, art không đều, kịch bản thiếu cao trào...)"
                    value={recReason}
                    onChange={(e) => setRecReason(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none resize-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kế hoạch cải thiện chi tiết</label>
                  <textarea
                    rows={4}
                    placeholder="Mô tả cụ thể hướng đi cốt truyện mới, bổ sung thêm trợ lý vẽ background hoặc cải tiến nét vẽ nhân vật chính..."
                    value={recPlan}
                    onChange={(e) => setRecPlan(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none resize-none font-medium"
                    required
                  />
                </div>
              </div>
            )}

            {activeTab === 'DEADLINE_REMINDER' && (
              <div className="space-y-4">
                <div className="bg-orange-50 border-2 border-orange-500 p-4 mb-2 flex items-start gap-3 text-orange-800">
                  <FileWarning className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Gửi Nhắc nhở Trễ Hạn</h4>
                    <p className="text-xs font-medium mt-1">
                      Gửi thông báo khẩn cấp đến tác giả để yêu cầu đẩy nhanh tiến độ hoàn thành chương truyện bị chậm.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Series đang trễ hạn</label>
                  <select
                    value={remindSeries}
                    onChange={(e) => { setRemindSeries(e.target.value); setRemindChapter(''); }}
                    className="w-full border-2 border-manga-ink p-2 text-sm bg-white focus:outline-none"
                  >
                    {getSeriesOptions()}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chương đang trễ hạn (Tùy chọn)</label>
                  <select
                    value={remindChapter}
                    onChange={(e) => setRemindChapter(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm bg-white focus:outline-none"
                  >
                    <option value="">-- Áp dụng cho toàn bộ Series --</option>
                    {chapterList.map((chap: any) => (
                      <option key={chap.chapter_id} value={chap.title}>{chap.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nội dung nhắc nhở</label>
                  <textarea
                    rows={4}
                    placeholder="Nhập nội dung nhắc nhở..."
                    value={remindMessage}
                    onChange={(e) => setRemindMessage(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none resize-none font-medium"
                    required
                  />
                </div>
              </div>
            )}



            <div className="mt-6 border-t-2 border-gray-100 pt-4 flex flex-col">
              <button
                type="submit"
                disabled={isSubmitting || isDuplicate()}
                className={`w-full font-bold py-3 px-4 transition-colors flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 ${(isSubmitting || isDuplicate()) ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-manga-ink hover:bg-black text-white'
                  }`}
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'ĐANG GỬI...' : (activeTab === 'RECOVERY' ? 'GỬI ĐỀ XUẤT PHỤC HỒI' : (activeTab === 'DEADLINE_REMINDER' ? 'GỬI CHO MANGAKA' : 'GỬI ĐỀ XUẤT LÊN BAN BIÊN TẬP'))}
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Column: History list */}
        <div className="bg-white border-4 border-manga-ink flex flex-col h-[525px] overflow-hidden">
          <div className="p-4 border-b-4 border-manga-ink bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-manga-ink" />
              <h3 className="font-bold uppercase text-manga-ink text-sm">Lịch Sử Đề Xuất</h3>
            </div>
            <span className="bg-manga-ink text-white font-black text-xs px-2 py-0.5 rounded-full">
              {loading ? '...' : proposals.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loading ? (
              <div className="h-full flex flex-col justify-center items-center text-center py-12 gap-2">
                <Loader2 className="w-8 h-8 text-manga-ink animate-spin" />
                <p className="text-xs font-bold text-gray-500">Đang tải lịch sử...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-4">
                <p className="text-xs font-bold text-red-600 mb-2">{error}</p>
                <button onClick={loadProposals} className="px-3 py-1 bg-red-600 text-white font-bold text-[10px] uppercase">Thử lại</button>
              </div>
            ) : proposals.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center py-12">
                <Shield className="w-16 h-16 text-gray-200 mb-3" />
                <p className="text-sm font-bold text-gray-500">Chưa có đề xuất nào được tạo trước đây.</p>
              </div>
            ) : (
              proposals.map((prop) => (
                <div key={prop.proposal_id} className="bg-white border-2 border-manga-ink p-3 relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase rounded-sm ${getProposalTypeColor(prop.type)}`}>
                      {getProposalTypeLabel(prop.type)}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">{formatDate(prop.created_at)}</span>
                  </div>

                  <h4 className="font-bold text-sm text-manga-ink mb-1 truncate">{prop.series_title}</h4>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed mb-3 break-words bg-gray-50 p-2 border border-gray-100">
                    {prop.details}
                  </p>

                  <div className="flex flex-col gap-1 border-t border-dotted border-gray-200 pt-2 text-[10px] font-bold uppercase">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Trạng thái:</span>
                      {prop.status === 'PENDING' && (
                        <span className="text-orange-600 flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-pulse" /> Đang chờ duyệt
                        </span>
                      )}
                      {prop.status === 'APPROVED' && (
                        <span className="text-green-600 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Đã thông qua
                        </span>
                      )}
                      {prop.status === 'REJECTED' && (
                        <span className="text-red-600 flex items-center gap-0.5">
                          <X className="w-3 h-3" /> Bị từ chối
                        </span>
                      )}
                    </div>
                    {prop.rejection_reason && (
                      <div className="text-[10px] font-bold text-red-500 normal-case bg-red-50 p-1.5 mt-1 border border-red-100">
                        Lý do từ chối: {prop.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
