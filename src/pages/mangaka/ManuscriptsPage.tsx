import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { FileText, Clock, AlertTriangle, CheckCircle, Eye, Upload, Send } from 'lucide-react'
import { mangakaStore, Chapter } from '@/data/mangakaMockData'

const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'Draft':
      return { label: 'ĐANG SOẠN', classes: 'bg-white text-black border-2 border-black' }
    case 'Sketching':
    case 'Need Fix':
      return { label: 'CẦN CHỈNH SỬA', classes: 'bg-[#E63946] text-white border-2 border-[#E63946]' }
    case 'Drawing':
      return { label: 'ĐANG VẼ LỚP', classes: 'bg-black text-white border-2 border-black' }
    case 'Waiting Review':
      return { label: 'CHỜ DUYỆT', classes: 'bg-yellow-400 text-black border-2 border-black' }
    case 'Completed':
    case 'Approved':
      return { label: 'ĐÃ DUYỆT', classes: 'bg-white text-black border-2 border-black' }
    default:
      return { label: status.toUpperCase(), classes: 'bg-white text-black border-2 border-black' }
  }
}

export default function ManuscriptsPage() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [seriesList, setSeriesList] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('TẤT CẢ')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [newChapterNum, setNewChapterNum] = useState('')
  const [newChapterPages, setNewChapterPages] = useState('20')

  // Load data from store
  useEffect(() => {
    setChapters(mangakaStore.getChapters())
    const sl = mangakaStore.getSeries()
    setSeriesList(sl)
    if (sl.length > 0) {
      setSelectedSeriesId(sl[0].id)
    }
  }, [])

  const handleUpdateStatus = (chapterId: string, newStatus: Chapter['status']) => {
    mangakaStore.updateChapterStatus(chapterId, newStatus)
    setChapters(mangakaStore.getChapters())
  }

  const handleCreateSubmission = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChapterTitle || !newChapterNum) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    const num = parseInt(newChapterNum, 10)
    const pages = parseInt(newChapterPages, 10)

    if (isNaN(num) || isNaN(pages)) {
      alert('Vui lòng nhập số hợp lệ!')
      return
    }

    mangakaStore.addChapter({
      seriesId: selectedSeriesId,
      chapterNumber: num,
      title: newChapterTitle,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalPages: pages,
      status: 'Drawing' // Start at drawing layer stage
    })

    alert('Nộp bản thảo mới thành công!')
    setChapters(mangakaStore.getChapters())
    setShowSubmitModal(false)
    setNewChapterTitle('')
    setNewChapterNum('')
  }

  // Map series title to chapters
  const enrichedChapters = chapters.map(ch => ({
    ...ch,
    seriesTitle: seriesList.find(s => s.id === ch.seriesId)?.title || 'Không rõ',
  }))

  // Filter based on active tab
  const filteredChapters = enrichedChapters.filter(ch => {
    if (activeTab === 'TẤT CẢ') return true
    const display = getStatusDisplay(ch.status).label
    return display === activeTab
  })

  // Calculate stats
  const totalChapters = enrichedChapters.length
  const drawingCount = enrichedChapters.filter(ch => getStatusDisplay(ch.status).label === 'ĐANG VẼ LỚP').length
  const needFixCount = enrichedChapters.filter(ch => getStatusDisplay(ch.status).label === 'CẦN CHỈNH SỬA').length
  const completedCount = enrichedChapters.filter(ch => getStatusDisplay(ch.status).label === 'ĐÃ DUYỆT').length

  return (
    <div className="p-2 max-w-7xl mx-auto flex gap-8">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-black uppercase select-none">
              QUẢN LÝ BẢN THẢO
            </h1>
            {/* Retro Manga Underline */}
            <div className="w-28 h-2 bg-[#E63946] mt-2 mb-4"></div>
            <p className="text-[13px] text-gray-500 font-bold leading-normal">
              Theo dõi danh sách các chương truyện đang thực hiện, tiến độ ghép file PSD và gửi bản thảo chính thức cho ban biên tập.
            </p>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-[#E63946] text-white border-2 border-black font-bold uppercase py-2.5 px-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 text-xs"
          >
            + NỘP BẢN THẢO MỚI
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          <div className="border-2 border-black bg-white p-5 flex flex-col items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <FileText className="w-6 h-6 mb-2 text-black" />
            <span className="text-3xl font-black font-mono leading-none">{totalChapters}</span>
            <span className="text-[9px] font-extrabold text-gray-400 mt-2 uppercase tracking-widest">TỔNG SỐ CHAPTER</span>
          </div>

          <div className="border-2 border-black bg-white p-5 flex flex-col items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <Clock className="w-6 h-6 mb-2 text-black" />
            <span className="text-3xl font-black font-mono leading-none">{drawingCount}</span>
            <span className="text-[9px] font-extrabold text-gray-400 mt-2 uppercase tracking-widest">ĐANG VẼ LỚP</span>
          </div>

          <div className="border-2 border-[#E63946] bg-white p-5 flex flex-col items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <AlertTriangle className="w-6 h-6 mb-2 text-[#E63946]" />
            <span className="text-3xl font-black font-mono text-[#E63946] leading-none">{needFixCount}</span>
            <span className="text-[9px] font-extrabold text-[#E63946] mt-2 uppercase tracking-widest">CẦN CHỈNH SỬA</span>
          </div>

          <div className="border-2 border-black bg-white p-5 flex flex-col items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <CheckCircle className="w-6 h-6 mb-2 text-black" />
            <span className="text-3xl font-black font-mono leading-none">{completedCount}</span>
            <span className="text-[9px] font-extrabold text-gray-400 mt-2 uppercase tracking-widest">ĐÃ HOÀN THÀNH</span>
          </div>
        </div>

        {/* Filters Tabs */}
        <div className="flex gap-2 mb-6">
          {['TẤT CẢ', 'ĐANG SOẠN', 'CẦN CHỈNH SỬA', 'ĐANG VẼ LỚP', 'ĐÃ DUYỆT'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-2 border-black px-4 py-1.5 text-[11px] font-black uppercase transition-all rounded-none ${
                activeTab === tab
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div className="bg-white border-2 border-black overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white font-bold text-[11px] uppercase tracking-wider text-left">
                <th className="p-3 border-r-2 border-black w-[15%]">TÁC PHẨM (SERIES)</th>
                <th className="p-3 border-r-2 border-black w-[20%]">CHƯƠNG</th>
                <th className="p-3 border-r-2 border-black text-center w-[10%]">SỐ TRANG</th>
                <th className="p-3 border-r-2 border-black text-center w-[10%]">HẠN CHÓT</th>
                <th className="p-3 border-r-2 border-black text-center w-[12%]">TRẠNG THÁI</th>
                <th className="p-3 text-left w-[33%]">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {filteredChapters.map((ch, idx) => {
                const statusDisplay = getStatusDisplay(ch.status)
                const isNeedFix = statusDisplay.label === 'CẦN CHỈNH SỬA'

                return (
                  <tr key={ch.id} className="border-b-2 border-black font-semibold text-xs text-black">
                    <td className="p-4 border-r-2 border-black align-middle font-bold">
                      {ch.seriesTitle}
                    </td>
                    <td className="p-4 border-r-2 border-black align-middle">
                      Chương {ch.chapterNumber}: {ch.title}
                    </td>
                    <td className="p-4 border-r-2 border-black text-center align-middle">
                      {ch.totalPages} trang
                    </td>
                    <td className="p-4 border-r-2 border-black text-center align-middle text-[#E63946] font-bold">
                      {ch.deadline.split('-').reverse().join('/')}
                    </td>
                    <td className="p-4 border-r-2 border-black text-center align-middle">
                      <span className={`px-3 py-1 font-bold text-[9px] rounded-none inline-block ${statusDisplay.classes}`}>
                        {statusDisplay.label}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-row flex-wrap gap-4 items-center">
                        <Link
                          to={`/dashboard/mangaka/chapters`}
                          className="flex items-center gap-1.5 text-[10px] font-black text-black uppercase hover:underline whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                          XEM CHI TIẾT TRANG
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedSeriesId(ch.seriesId)
                            setNewChapterNum(String(ch.chapterNumber))
                            setNewChapterTitle(ch.title)
                            setShowSubmitModal(true)
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-black text-black uppercase hover:underline text-left whitespace-nowrap"
                        >
                          <Upload className="w-3.5 h-3.5 flex-shrink-0" />
                          NỘP BẢN THẢO MỚI
                        </button>
                        {isNeedFix && (
                          <button
                            onClick={() => handleUpdateStatus(ch.id, 'Drawing')}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-[#E63946] hover:underline text-left whitespace-nowrap"
                          >
                            <Send className="w-3.5 h-3.5 flex-shrink-0" />
                            Đánh dấu đang vẽ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredChapters.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 font-bold text-xs uppercase">
                    Không có chương truyện nào trong danh sách.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[280px] flex-shrink-0">
        <div className="border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="bg-black text-white p-3.5 font-bold text-xs uppercase text-center border-b-2 border-black">
            QUY TRÌNH BẢN THẢO
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 border-2 border-black flex items-center justify-center font-bold text-[10px] bg-white rounded-none flex-shrink-0">
                1
              </div>
              <p className="text-xs font-bold leading-snug pt-0.5">
                Mangaka chia khung & giao task
              </p>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 border-2 border-black flex items-center justify-center font-bold text-[10px] bg-white rounded-none flex-shrink-0">
                2
              </div>
              <p className="text-xs font-bold leading-snug pt-0.5">
                Trợ lý vẽ và nộp lớp layer
              </p>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 border-2 border-black flex items-center justify-center font-bold text-[10px] bg-white rounded-none flex-shrink-0">
                3
              </div>
              <p className="text-xs font-bold leading-snug pt-0.5">
                Mangaka phê duyệt & ghép file
              </p>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 border-2 border-black flex items-center justify-center font-bold text-[10px] bg-white rounded-none flex-shrink-0">
                4
              </div>
              <p className="text-xs font-bold leading-snug pt-0.5">
                Nộp bản thảo tổng hợp lên Editor
              </p>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 border-2 border-black flex items-center justify-center font-bold text-[10px] bg-white rounded-none flex-shrink-0">
                5
              </div>
              <p className="text-xs font-bold leading-snug pt-0.5">
                Ban biên tập phê duyệt xuất bản
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Usable */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-[2px]">
          <form
            onSubmit={handleCreateSubmission}
            className="bg-white border-4 border-black p-6 w-full max-w-md shadow-[8px_8px_0px_rgba(0,0,0,1)] relative"
          >
            <h2 className="text-lg font-black font-manga uppercase mb-4 border-b-2 border-black pb-2 select-none">
              NỘP BẢN THẢO MỚI
            </h2>

            <div className="mb-4">
              <label className="block text-[11px] font-black uppercase mb-1">Chọn Series</label>
              <select
                value={selectedSeriesId}
                onChange={e => setSelectedSeriesId(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-bold focus:outline-none bg-white rounded-none"
              >
                {seriesList.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[11px] font-black uppercase mb-1">Số Chapter</label>
                <input
                  type="number"
                  value={newChapterNum}
                  onChange={e => setNewChapterNum(e.target.value)}
                  className="w-full border-2 border-black p-2 text-xs font-bold focus:outline-none rounded-none"
                  placeholder="VD: 46"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase mb-1">Số Trang</label>
                <input
                  type="number"
                  value={newChapterPages}
                  onChange={e => setNewChapterPages(e.target.value)}
                  className="w-full border-2 border-black p-2 text-xs font-bold focus:outline-none rounded-none"
                  placeholder="20"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-black uppercase mb-1">Tên Chương</label>
              <input
                type="text"
                value={newChapterTitle}
                onChange={e => setNewChapterTitle(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-bold focus:outline-none rounded-none"
                placeholder="VD: Hắc phong hành"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-black uppercase mb-1">File đính kèm (PSD/ZIP)</label>
              <div className="border-2 border-dashed border-gray-400 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-black bg-gray-50 transition-all rounded-none">
                <Upload className="w-7 h-7 mb-2 text-gray-500" />
                <p className="text-[10px] font-black text-gray-500 uppercase">Kéo thả file hoặc click để tải lên</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false)
                  setNewChapterTitle('')
                  setNewChapterNum('')
                }}
                className="px-4 py-2 border-2 border-black text-[10px] font-black uppercase hover:bg-gray-100 rounded-none transition-all"
              >
                HỦY BỎ
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#E63946] text-white border-2 border-black text-[10px] font-black uppercase hover:bg-red-700 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all rounded-none"
              >
                GỬI BẢN THẢO
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
