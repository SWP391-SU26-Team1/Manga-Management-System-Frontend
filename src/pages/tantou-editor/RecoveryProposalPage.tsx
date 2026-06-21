import React, { useState, useEffect } from 'react'
import { Shield, FileWarning, Plus, CheckCircle2, Clock, BookOpen, Calendar, RefreshCw, Send, ClipboardList, X, Loader2 } from 'lucide-react'
import { editorService, ApiProposal } from '../../services/editor.service'

export default function RecoveryProposalPage() {
  const [activeTab, setActiveTab] = useState<'RECOVERY' | 'NEW_SERIES' | 'PUBLISH_CHAPTER' | 'SCHEDULE_CHANGE'>('RECOVERY')
  const [proposals, setProposals] = useState<ApiProposal[]>([])
  const [seriesList, setSeriesList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form states
  // 1. Recovery
  const [recSeries, setRecSeries] = useState('Neon City Runners')
  const [recTarget, setRecTarget] = useState('Hạng #12')
  const [recReason, setRecReason] = useState('')
  const [recPlan, setRecPlan] = useState('')

  // 2. New Series
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newGenre, setNewGenre] = useState('Fantasy')
  const [newSynopsis, setNewSynopsis] = useState('')
  const [newTarget, setNewTarget] = useState('')

  // 3. Publish Chapter
  const [pubSeries, setPubSeries] = useState('Shadow Realm Chronicles')
  const [pubChapter, setPubChapter] = useState('Ch.49')
  const [pubPages, setPubPages] = useState('18')
  const [pubDate, setPubDate] = useState('')

  // 4. Schedule Change
  const [schedSeries, setSchedSeries] = useState('Midnight Detective Agency')
  const [schedCurrent, setSchedCurrent] = useState('Hàng tháng')
  const [schedProposed, setSchedProposed] = useState('Hàng tuần')
  const [schedReason, setSchedReason] = useState('')

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
        setPubSeries(firstTitle)
        setSchedSeries(firstTitle)
      }
    } catch (err) {
      console.error('Không thể tải danh sách series', err)
    }
  }

  useEffect(() => {
    loadProposals()
    loadSeries()
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    let details = ''
    let title = ''
    let metadata: any = null

    try {
      if (activeTab === 'RECOVERY') {
        title = recSeries
        details = `Đề xuất phục hồi: Mục tiêu đạt ${recTarget}. Nguyên nhân: ${recReason}. Kế hoạch: ${recPlan}`
        metadata = {
          target_rank: recTarget,
          reason: recReason,
          plan: recPlan
        }
      } else if (activeTab === 'NEW_SERIES') {
        title = newTitle
        details = `Đề xuất truyện mới: Tác giả: ${newAuthor}. Thể loại: ${newGenre}. Tóm tắt: ${newSynopsis}. Mục tiêu độc giả: ${newTarget}`
        metadata = {
          author: newAuthor,
          genre: newGenre,
          synopsis: newSynopsis,
          target_audience: newTarget
        }
      } else if (activeTab === 'PUBLISH_CHAPTER') {
        title = pubSeries
        details = `Xin xuất bản chương mới: ${pubChapter} (${pubPages} trang). Ngày dự kiến: ${pubDate}`
        metadata = {
          chapter: pubChapter,
          pages: Number(pubPages),
          publish_date: pubDate
        }
      } else if (activeTab === 'SCHEDULE_CHANGE') {
        title = schedSeries
        details = `Đề xuất đổi lịch đăng: Từ [${schedCurrent}] sang [${schedProposed}]. Lý do: ${schedReason}`
        metadata = {
          current_schedule: schedCurrent,
          proposed_schedule: schedProposed,
          reason: schedReason
        }
      }

      if (!title) {
        alert('Vui lòng điền các thông tin bắt buộc!')
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
      } else if (activeTab === 'NEW_SERIES') {
        setNewTitle('')
        setNewAuthor('')
        setNewSynopsis('')
        setNewTarget('')
      } else if (activeTab === 'PUBLISH_CHAPTER') {
        setPubChapter('')
        setPubPages('18')
        setPubDate('')
      } else if (activeTab === 'SCHEDULE_CHANGE') {
        setSchedReason('')
      }

      showToast('Đã gửi đề xuất lên Ban Biên Tập thành công!')
      loadProposals()
    } catch (err: any) {
      console.error(err)
      alert(`Gửi đề xuất thất bại: ${err.response?.data?.message || err.message || 'Lỗi hệ thống'}`)
    }
  }

  const getProposalTypeLabel = (type: string) => {
    switch (type) {
      case 'RECOVERY': return 'Phục hồi Series'
      case 'NEW_SERIES': return 'Truyện mới'
      case 'PUBLISH_CHAPTER': return 'Xuất bản Chương'
      case 'SCHEDULE_CHANGE': return 'Đổi lịch đăng'
      default: return type
    }
  }

  const getProposalTypeColor = (type: string) => {
    switch (type) {
      case 'RECOVERY': return 'bg-red-100 text-red-700 border-red-300'
      case 'NEW_SERIES': return 'bg-green-100 text-green-700 border-green-300'
      case 'PUBLISH_CHAPTER': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'SCHEDULE_CHANGE': return 'bg-purple-100 text-purple-700 border-purple-300'
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
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap flex-1 text-center transition-colors ${
                activeTab === 'RECOVERY' ? 'bg-white text-manga-red' : 'text-gray-500 hover:bg-gray-50 hover:text-manga-ink'
              }`}
            >
              Phục hồi Series
            </button>
            <button
              onClick={() => setActiveTab('NEW_SERIES')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap flex-1 text-center transition-colors ${
                activeTab === 'NEW_SERIES' ? 'bg-white text-manga-red' : 'text-gray-500 hover:bg-gray-50 hover:text-manga-ink'
              }`}
            >
              Đề xuất Truyện mới
            </button>
            <button
              onClick={() => setActiveTab('PUBLISH_CHAPTER')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap flex-1 text-center transition-colors ${
                activeTab === 'PUBLISH_CHAPTER' ? 'bg-white text-manga-red' : 'text-gray-500 hover:bg-gray-50 hover:text-manga-ink'
              }`}
            >
              Xin Xuất bản Chương
            </button>
            <button
              onClick={() => setActiveTab('SCHEDULE_CHANGE')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap flex-1 text-center transition-colors ${
                activeTab === 'SCHEDULE_CHANGE' ? 'bg-white text-manga-red' : 'text-gray-500 hover:bg-gray-50 hover:text-manga-ink'
              }`}
            >
              Đổi lịch đăng
            </button>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSubmitProposal} className="p-6">
            {activeTab === 'RECOVERY' && (
              <div className="space-y-4">
                <div className="bg-red-50 border-2 border-red-500 p-4 mb-2 flex items-start gap-3 text-red-800">
                  <FileWarning className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-sm">Cảnh báo rớt hạng ranking cần khắc phục</h4>
                    <p className="text-xs font-medium mt-1">
                      Cần nộp đề xuất phục hồi chất lượng ngay lập tức để bảo vệ truyện trước nguy cơ bị Ban biên tập xem xét hạ rank hoặc dừng xuất bản.
                    </p>
                  </div>
                </div>

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

            {activeTab === 'NEW_SERIES' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên Truyện Đề Xuất</label>
                  <input 
                    type="text" 
                    placeholder="Nhập tên dự án truyện mới..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none focus:border-red-500 font-bold" 
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tác Giả (Mangaka)</label>
                    <input 
                      type="text" 
                      placeholder="Tên Mangaka..."
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Thể Loại Chính</label>
                    <select 
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none bg-white"
                    >
                      <option value="Fantasy">Fantasy (Giả Tưởng)</option>
                      <option value="Shounen Action">Shounen Action (Hành Động)</option>
                      <option value="Mystery">Mystery (Huyền Bí)</option>
                      <option value="Romance">Romance (Lãng Mạn)</option>
                      <option value="Sci-Fi">Sci-Fi (Khoa Học Viễn Tưởng)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tóm tắt cốt truyện sơ bộ (Synopsis)</label>
                  <textarea 
                    rows={4}
                    placeholder="Mô tả tóm tắt tuyến truyện chính, điểm hấp dẫn độc giả..."
                    value={newSynopsis}
                    onChange={(e) => setNewSynopsis(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none resize-none font-medium" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Đối tượng độc giả mục tiêu & Tiềm năng doanh thu</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Nam giới 15-25 tuổi, kế hoạch bán bản quyền merchandise..."
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none" 
                    required
                  />
                </div>
              </div>
            )}

            {activeTab === 'PUBLISH_CHAPTER' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chọn Series</label>
                    <select 
                      value={pubSeries}
                      onChange={(e) => setPubSeries(e.target.value)}
                      className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none bg-white"
                    >
                      {getSeriesOptions()}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chương số (Chapter)</label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Ch.49..."
                      value={pubChapter}
                      onChange={(e) => setPubChapter(e.target.value)}
                      className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none focus:border-red-500 font-bold" 
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số trang dự kiến</label>
                    <input 
                      type="number" 
                      value={pubPages}
                      onChange={(e) => setPubPages(e.target.value)}
                      className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày Phát Hành Dự Kiến</label>
                    <input 
                      type="date" 
                      value={pubDate}
                      onChange={(e) => setPubDate(e.target.value)}
                      className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none" 
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'SCHEDULE_CHANGE' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chọn Series</label>
                  <select 
                    value={schedSeries}
                    onChange={(e) => setSchedSeries(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none bg-white"
                  >
                    {getSeriesOptions()}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lịch đăng hiện tại</label>
                    <input 
                      type="text" 
                      value={schedCurrent}
                      onChange={(e) => setSchedCurrent(e.target.value)}
                      className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none bg-gray-50" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lịch đăng đề xuất mới</label>
                    <select 
                      value={schedProposed}
                      onChange={(e) => setSchedProposed(e.target.value)}
                      className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none bg-white"
                    >
                      <option value="Hàng tuần">Hàng tuần</option>
                      <option value="Hai tuần/lần">Hai tuần/lần</option>
                      <option value="Hàng tháng">Hàng tháng</option>
                      <option value="Tạm ngưng phát hành">Tạm ngưng phát hành (Hiatus)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lý do thay đổi lịch đăng</label>
                  <textarea 
                    rows={4}
                    placeholder="Giải trình lý do cụ thể (Tình hình sức khỏe tác giả, cần chuẩn bị thêm tư liệu cho arc mới...)"
                    value={schedReason}
                    onChange={(e) => setSchedReason(e.target.value)}
                    className="w-full border-2 border-manga-ink p-2 text-sm focus:outline-none resize-none font-medium" 
                    required
                  />
                </div>
              </div>
            )}

            <div className="mt-6 border-t-2 border-gray-100 pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-manga-ink hover:bg-black text-white font-bold text-sm uppercase tracking-wider px-6 py-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Gửi Đề Xuất Lên Ban Biên Tập
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
