import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { FileText, Clock, AlertTriangle, CheckCircle, Eye, Upload, Send, X, BookOpen } from 'lucide-react'
import { seriesService, SeriesAPI } from '@/services/series.service'
import { chapterService } from '@/services/chapter.service'
import { pageService } from '@/services/page.service'
import { uploadService } from '@/services/upload.service'
import { manuscriptService, ManuscriptAPI } from '@/services/manuscript.service'
import { rankingService } from '@/services/ranking.service'

const getChapterDisplayStatus = (ch: any, m?: any) => {
  if (m) {
    if (m.title && m.title.includes('[ĐÃ DUYỆT]')) {
      return 'ĐÃ DUYỆT'
    }
    switch (m.status) {
      case 'draft':
        return 'ĐANG SOẠN'
      case 'needs_revision':
        return 'NHẬN XÉT TỪ EDITOR'
      case 'rejected':
        return 'TỪ CHỐI'
      case 'submitted':
      case 'in_review':
        return 'CHỜ TANTOU DUYỆT'
      case 'approved':
        return 'ĐÃ DUYỆT'
      case 'published':
        return 'ĐÃ XUẤT BẢN'
      case 'archived':
        return 'LƯU TRỮ'
      case 'hidden':
        return 'ẨN'
      default:
        return m.status.toUpperCase()
    }
  }

  // No manuscript
  switch (ch.status) {
    case 'draft':
      return 'ĐANG SOẠN'
    case 'pending_review':
      return 'CHỜ TANTOU DUYỆT'
    case 'approved':
      return 'ĐÃ DUYỆT'
    case 'published':
      return 'ĐÃ XUẤT BẢN'
    case 'rejected':
      return 'TỪ CHỐI'
    default:
      return 'ĐANG VẼ LỚP'
  }
}

const getStatusDisplay = (displayStatus: string) => {
  switch (displayStatus) {
    case 'ĐANG SOẠN':
      return { label: 'ĐANG SOẠN', classes: 'bg-orange-500 text-white border-2 border-black font-extrabold' }
    case 'GỢI Ý TỪ TRỢ LÝ':
      return { label: 'GỢI Ý TỪ TRỢ LÝ', classes: 'bg-red-500 text-white border-2 border-black font-extrabold' }
    case 'NHẬN XÉT TỪ EDITOR':
      return { label: 'NHẬN XÉT TỪ EDITOR', classes: 'bg-red-500 text-white border-2 border-black font-extrabold' }
    case 'TỪ CHỐI':
      return { label: 'TỪ CHỐI', classes: 'bg-red-600 text-white border-2 border-black font-extrabold animate-pulse' }
    case 'CẦN CHỈNH SỬA':
      return { label: 'CẦN CHỈNH SỬA', classes: 'bg-red-500 text-white border-2 border-red-500 font-extrabold' }
    case 'ĐANG VẼ LỚP':
      return { label: 'ĐANG VẼ LỚP', classes: 'bg-black text-white border-2 border-black font-extrabold' }
    case 'CHỜ TANTOU DUYỆT':
      return { label: 'CHỜ TANTOU DUYỆT', classes: 'bg-yellow-400 text-black border-2 border-black font-extrabold' }
    case 'ĐÃ DUYỆT':
      return { label: 'ĐÃ DUYỆT', classes: 'bg-green-600 text-white border-2 border-black font-extrabold' }
    case 'ĐÃ XUẤT BẢN':
      return { label: 'ĐÃ XUẤT BẢN', classes: 'bg-green-600 text-white border-2 border-green-600' }
    default:
      return { label: displayStatus, classes: 'bg-white text-black border-2 border-black' }
  }
}

export default function ManuscriptsPage() {
  const [chapters, setChapters] = useState<any[]>([])
  const [manuscripts, setManuscripts] = useState<ManuscriptAPI[]>([])
  const [chapterPagesMap, setChapterPagesMap] = useState<{ [key: string]: number }>({})
  const [seriesList, setSeriesList] = useState<SeriesAPI[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  
  const [activeTab, setActiveTab] = useState('TẤT CẢ')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [newChapterNum, setNewChapterNum] = useState('')
  const [newChapterPages, setNewChapterPages] = useState('20')
  const [files, setFiles] = useState<File[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [viewingSuggestion, setViewingSuggestion] = useState<any | null>(null)
  const [viewingEditorComment, setViewingEditorComment] = useState<any | null>(null)

  // Load data from services
  const loadData = async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const sl = await seriesService.getAll()
      setSeriesList(sl)
      if (sl.length > 0 && !selectedSeriesId) {
        setSelectedSeriesId(sl[0]._id)
      }

      // Fetch chapters and manuscripts for all series in parallel
      const chsPromises = sl.map(s => chapterService.getBySeriesId(s._id).catch(() => []))
      const msPromises = sl.map(s => manuscriptService.getBySeriesId(s._id).catch(() => []))

      const chsResults = await Promise.all(chsPromises)
      const msResults = await Promise.all(msPromises)

      const allChs = chsResults.flat()
      const allMs = msResults.flat()

      setChapters(allChs)
      setManuscripts(allMs)

      // Fetch notifications to extract editor feedback notes
      try {
        const notifs = await rankingService.getNotifications()
        setNotifications(notifs)
      } catch (err) {
        console.error('Failed to load notifications:', err)
      }

      // Fetch page counts for all chapters in parallel
      const pageCountsMap: { [key: string]: number } = {}
      await Promise.all(
        allChs.map(async (ch) => {
          try {
            const pages = await pageService.getByChapterId(ch._id)
            pageCountsMap[ch._id] = pages.length
          } catch {
            pageCountsMap[ch._id] = 0
          }
        })
      )
      setChapterPagesMap(pageCountsMap)
    } catch (err) {
      console.error(err)
      setErrorMsg('Không thể tải dữ liệu bản thảo.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdateStatus = async (seriesId: string, manuscriptId: string) => {
    try {
      await manuscriptService.revise(seriesId, manuscriptId)
      alert('Đã chuyển bản thảo về trạng thái nháp thành công!')
      await loadData()
    } catch (err) {
      console.error(err)
      alert('Không thể thực hiện chỉnh sửa trạng thái.')
    }
  }

  const handlePublishChapter = async (seriesId: string, chapterId: string) => {
    try {
      await chapterService.publish(seriesId, chapterId)
      alert('Xuất bản chapter thành công!')
      await loadData()
    } catch (err) {
      console.error(err)
      alert('Không thể xuất bản chapter.')
    }
  }

  const handleCreateSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!selectedSeriesId) {
      setErrorMsg('Vui lòng chọn Series!')
      return
    }

    if (!selectedChapterId && (!newChapterTitle.trim() || !newChapterNum)) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin chapter!')
      return
    }

    setIsSubmitting(true)

    try {
      let chapterId = selectedChapterId
      let chapterTitle = newChapterTitle
      let chapterNumberStr = newChapterNum

      // 1. Nếu chưa có chapter, ta tạo chapter mới trước
      if (!chapterId) {
        const num = parseInt(chapterNumberStr, 10)
        if (isNaN(num)) {
          throw new Error('Số chapter không hợp lệ!')
        }
        const newCh = await chapterService.create(selectedSeriesId, {
          title: chapterTitle.trim(),
          chapter_number: num
        })
        chapterId = newCh._id
        chapterTitle = newCh.title
        chapterNumberStr = String(newCh.chapter_number)
      }

      // 2. Nếu người dùng chọn file tải lên, tiến hành tạo và submit manuscript
      if (files.length > 0) {
        // a. Upload files lên Cloudinary
        const uploadPromises = files.map(f => uploadService.uploadSingle(f, 'manuscripts'))
        const uploadResults = await Promise.all(uploadPromises)

        // b. Lấy mangaka_id từ localStorage
        const userStr = localStorage.getItem('mangaflow_user')
        let mangakaId = ''
        if (userStr) {
          try {
            const parsed = JSON.parse(userStr)
            mangakaId = parsed.user?.id || parsed.id || ''
          } catch {
            // ignore
          }
        }

        if (!mangakaId) {
          throw new Error('Không tìm thấy thông tin tài khoản đăng nhập!')
        }

        // c. Tạo manuscript
        const manuscript = await manuscriptService.create({
          mangaka_id: mangakaId,
          series_id: selectedSeriesId,
          chapter_id: chapterId,
          title: `Bản thảo Chương ${chapterNumberStr}: ${chapterTitle}`,
          file_url: uploadResults[0].secure_url
        })

        // d. Thêm file liên kết để backend/editor có thể đọc
        await Promise.all(
          uploadResults.map((res, index) => {
            const f = files[index]
            return manuscriptService.addFile({
              manuscript_id: manuscript._id,
              file_url: res.secure_url,
              file_name: f.name,
              file_type: f.name.split('.').pop() || 'psd'
            })
          })
        )

        // e. Submit manuscript lên Board
        await manuscriptService.submit(manuscript._id)
      }

      alert('Đã thực hiện thành công!')
      setShowSubmitModal(false)
      setNewChapterTitle('')
      setNewChapterNum('')
      setFiles([])
      setSelectedChapterId(null)
      
      // Reload page data
      await loadData()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.response?.data?.message || err.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Map series title to chapters
  const enrichedChapters = chapters.map(ch => {
    // Find matching manuscripts for this chapter, sort by created_at descending to get the latest one
    const matchingManuscripts = manuscripts.filter(m => m.chapter_id === ch._id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const latestManuscript = matchingManuscripts[0]

    // Count pages for this chapter
    const pageCount = chapterPagesMap[ch._id] || 0

    // Determine deadline (use chapter's publish_date, or format created_at + 7 days)
    const deadlineDate = ch.publish_date 
      ? new Date(ch.publish_date)
      : new Date(new Date(ch.created_at || Date.now()).getTime() + 7 * 24 * 60 * 60 * 1000)
    const deadlineStr = deadlineDate.toISOString().split('T')[0]

    // Determine display status and classes
    const displayStatus = getChapterDisplayStatus(ch, latestManuscript)
    const statusDisplay = getStatusDisplay(displayStatus)

    // Find editor feedback from notifications matching type ms_fb:<manuscriptId>
    let editorComment = ''
    if (latestManuscript) {
      const matchNotif = notifications.find(
        (n) => n.type === `ms_fb:${latestManuscript._id}`
      )
      if (matchNotif) {
        editorComment = matchNotif.content
      }
    }

    return {
      id: ch._id,
      seriesId: ch.series_id,
      seriesTitle: seriesList.find(s => s._id === ch.series_id)?.title || 'Không rõ',
      chapterNumber: ch.chapter_number,
      title: ch.title || 'Không có tiêu đề',
      deadline: deadlineStr,
      totalPages: pageCount,
      status: ch.status, // Database chapter status
      displayStatus: displayStatus,
      statusDisplay: statusDisplay,
      latestManuscript: latestManuscript,
      editorComment: editorComment,
      createdAt: ch.created_at
    }
  }).filter(ch => ch.status !== 'published')

  // Sort by created_at descending (newest first)
  const sortedChapters = enrichedChapters.sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  })

  // Filter based on active tab
  const filteredChapters = sortedChapters.filter(ch => {
    if (activeTab === 'TẤT CẢ') return true
    if (activeTab === 'NHẬN XÉT TỪ EDITOR') {
      return ch.displayStatus === 'NHẬN XÉT TỪ EDITOR' || ch.displayStatus === 'TỪ CHỐI'
    }
    return ch.displayStatus === activeTab
  })

  // Calculate stats
  const totalChapters = enrichedChapters.length
  const drawingCount = enrichedChapters.filter(ch => ch.displayStatus === 'ĐANG VẼ LỚP').length
  const needFixCount = enrichedChapters.filter(ch => ch.displayStatus === 'NHẬN XÉT TỪ EDITOR' || ch.displayStatus === 'TỪ CHỐI').length
  const completedCount = enrichedChapters.filter(ch => ch.displayStatus === 'ĐÃ DUYỆT').length

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-black border-t-[#E63946] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-500 uppercase text-xs">Đang tải dữ liệu bản thảo...</p>
      </div>
    )
  }

  return (
    <div className="p-2 max-w-7xl mx-auto flex flex-col">
      <div className="flex gap-8">
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
              Theo dõi danh sách các chương truyện đang thực hiện, tiến độ ghép file PSD và gửi bản thảo chính thức cho Tantou Editor.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setSelectedChapterId(null)
                setNewChapterTitle('')
                setNewChapterNum('')
                setFiles([])
                if (seriesList.length > 0) {
                  setSelectedSeriesId(seriesList[0]._id)
                }
                setShowSubmitModal(true)
              }}
              className="bg-[#E63946] text-white border-2 border-black font-bold uppercase py-2.5 px-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 text-xs cursor-pointer"
            >
              + TẠO CHAPTER MỚI
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-5 mb-8">
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
            <span className="text-[9px] font-extrabold text-[#E63946] mt-2 uppercase tracking-widest">NHẬN XÉT TỪ EDITOR</span>
          </div>
        </div>

        {/* Filters Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['TẤT CẢ', 'ĐANG SOẠN', 'GỢI Ý TỪ TRỢ LÝ', 'NHẬN XÉT TỪ EDITOR', 'CẦN CHỈNH SỬA', 'ĐANG VẼ LỚP', 'CHỜ TANTOU DUYỆT', 'ĐÃ DUYỆT'].map(tab => (
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
              {filteredChapters.map((ch) => {
                const statusDisplay = ch.statusDisplay
                const isNeedFix = statusDisplay.label === 'NHẬN XÉT TỪ EDITOR' || statusDisplay.label === 'TỪ CHỐI'

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
                          to={`/dashboard/mangaka/series/${ch.seriesId}`}
                          className="flex items-center gap-1.5 text-[10px] font-black text-black uppercase hover:underline whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                          XEM CHI TIẾT TRANG
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedSeriesId(ch.seriesId)
                            setSelectedChapterId(ch.id)
                            setNewChapterNum(String(ch.chapterNumber))
                            setNewChapterTitle(ch.title)
                            setFiles([])
                            setShowSubmitModal(true)
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-black text-black uppercase hover:underline text-left whitespace-nowrap"
                        >
                          <Upload className="w-3.5 h-3.5 flex-shrink-0" />
                          NỘP BẢN THẢO MỚI
                        </button>
                        {ch.displayStatus === 'GỢI Ý TỪ TRỢ LÝ' && ch.latestManuscript && (
                          <button
                            onClick={() => setViewingSuggestion(ch)}
                            className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase hover:underline text-left whitespace-nowrap cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-red-650" />
                            XEM GỢI Ý TỪ TRỢ LÝ
                          </button>
                        )}
                        {(ch.displayStatus === 'NHẬN XÉT TỪ EDITOR' || ch.displayStatus === 'TỪ CHỐI') && ch.latestManuscript && (
                          <button
                            onClick={() => setViewingEditorComment(ch)}
                            className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase hover:underline text-left whitespace-nowrap cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-red-650" />
                            XEM NHẬN XÉT TỪ EDITOR
                          </button>
                        )}
                        {isNeedFix && ch.latestManuscript && (
                          <button
                            onClick={() => handleUpdateStatus(ch.seriesId, ch.latestManuscript._id)}
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
                Mangaka phác thảo kịch bản
              </p>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 border-2 border-black flex items-center justify-center font-bold text-[10px] bg-white rounded-none flex-shrink-0">
                2
              </div>
              <p className="text-xs font-bold leading-snug pt-0.5">
                Gửi kịch bản cho Tantou Editor duyệt
              </p>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 border-2 border-black flex items-center justify-center font-bold text-[10px] bg-white rounded-none flex-shrink-0">
                3
              </div>
              <p className="text-xs font-bold leading-snug pt-0.5">
                Mangaka vẽ và hoàn thiện bản thảo
              </p>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 border-2 border-black flex items-center justify-center font-bold text-[10px] bg-white rounded-none flex-shrink-0">
                4
              </div>
              <p className="text-xs font-bold leading-snug pt-0.5">
                Nộp bản thảo chính thức lên Tantou Editor
              </p>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 border-2 border-black flex items-center justify-center font-bold text-[10px] bg-white rounded-none flex-shrink-0">
                5
              </div>
              <p className="text-xs font-bold leading-snug pt-0.5">
                Tantou Editor phê duyệt xuất bản
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
            className="bg-white border-4 border-black p-6 w-full max-w-md shadow-[8px_8px_0px_rgba(0,0,0,1)] relative animate-in fade-in duration-200"
          >
            <h2 className="text-lg font-black uppercase mb-4 border-b-2 border-black pb-2 select-none">
              {selectedChapterId ? 'NỘP BẢN THẢO MỚI' : 'TẠO CHAPTER MỚI'}
            </h2>

            {errorMsg && (
              <div className="bg-red-50 border-2 border-[#E63946] p-3 text-xs font-bold text-[#E63946] mb-4">
                {errorMsg}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-[11px] font-black uppercase mb-1">Chọn Series</label>
              <select
                value={selectedSeriesId}
                onChange={e => setSelectedSeriesId(e.target.value)}
                disabled={!!selectedChapterId}
                className="w-full border-2 border-black p-2 text-xs font-bold focus:outline-none bg-white rounded-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {seriesList.map(s => (
                  <option key={s._id} value={s._id}>{s.title}</option>
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
                  disabled={!!selectedChapterId}
                  className="w-full border-2 border-black p-2 text-xs font-bold focus:outline-none rounded-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="VD: 46"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase mb-1">Số Trang dự kiến</label>
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
                disabled={!!selectedChapterId}
                className="w-full border-2 border-black p-2 text-xs font-bold focus:outline-none rounded-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="VD: Hắc phong hành"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-black uppercase mb-1">
                File đính kèm (PSD/ZIP/Ảnh) {!selectedChapterId && '(Tùy chọn)'}
              </label>
              <label className="border-2 border-dashed border-gray-400 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-black bg-gray-50 transition-all rounded-none block">
                <Upload className="w-7 h-7 mb-2 text-gray-500 mx-auto" />
                <p className="text-[10px] font-black text-gray-500 uppercase max-w-xs mx-auto break-all">
                  {files.length > 0 
                    ? `Đã chọn ${files.length} file: ${files.map(f => f.name).join(', ')}`
                    : 'Kéo thả file/ảnh hoặc click để tải lên'}
                </p>
                <input
                  type="file"
                  multiple
                  accept=".psd,.zip,.rar,.pdf,image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFiles(Array.from(e.target.files))
                    }
                  }}
                  required={!!selectedChapterId}
                />
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false)
                  setNewChapterTitle('')
                  setNewChapterNum('')
                  setFiles([])
                  setSelectedChapterId(null)
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border-2 border-black text-[10px] font-black uppercase hover:bg-gray-100 rounded-none transition-all disabled:opacity-50"
              >
                HỦY BỎ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#E63946] text-white border-2 border-black text-[10px] font-black uppercase hover:bg-red-700 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all rounded-none disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ĐANG XỬ LÝ...
                  </>
                ) : selectedChapterId ? (
                  'NỘP BẢN THẢO'
                ) : (
                  'TẠO CHAPTER'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Viewing Suggestion Modal */}
      {viewingSuggestion && viewingSuggestion.latestManuscript && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black w-full max-w-4xl shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
            <div className="bg-black text-white p-4 flex justify-between items-center border-b-2 border-black flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#E63946]" />
                <span className="font-manga text-lg font-bold uppercase tracking-wider">Xem Gợi Ý Từ Trợ Lý</span>
              </div>
              <button onClick={() => setViewingSuggestion(null)} className="text-white hover:text-[#E63946] cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-black">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-black text-white text-[9px] font-black uppercase px-2 py-0.5">
                  Tác phẩm: {viewingSuggestion.seriesTitle}
                </span>
                <span className="bg-gray-100 border border-black text-black text-[9px] font-black uppercase px-2 py-0.5">
                  Chương {viewingSuggestion.chapterNumber}: {viewingSuggestion.title}
                </span>
              </div>

              <h2 className="font-manga text-2xl font-black text-black border-b-2 border-dashed border-gray-250 pb-2 uppercase">
                {viewingSuggestion.latestManuscript.title.replace(/^\[ĐÃ DUYỆT\]\s*/i, '').replace(/^\[GỢI Ý\]\s*/i, '')}
              </h2>

              <div className="bg-red-50/50 border-2 border-red-250 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
                {viewingSuggestion.latestManuscript.content || <em className="text-gray-400">Không có nội dung gợi ý...</em>}
              </div>
            </div>

            <div className="p-4 border-t-2 border-dashed border-gray-200 flex gap-4 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => setViewingSuggestion(null)}
                className="flex-1 py-3 border-2 border-black font-bold text-xs uppercase hover:bg-gray-100 transition-colors bg-white cursor-pointer"
              >
                Quay lại
              </button>
              <Link
                to="/dashboard/mangaka/drafts"
                className="flex-1 py-3 bg-[#E63946] text-white border-2 border-black font-black uppercase text-center transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-red-650 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                Đến trang cộng tác kịch bản
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Editor Comment Modal */}
      {viewingEditorComment && viewingEditorComment.latestManuscript && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black w-full max-w-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
            <div className="bg-black text-white p-4 flex justify-between items-center border-b-2 border-black flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#E63946]" />
                <span className="font-manga text-lg font-bold uppercase tracking-wider">Xem Nhận Xét Từ Editor</span>
              </div>
              <button onClick={() => setViewingEditorComment(null)} className="text-white hover:text-[#E63946] cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-black">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-black text-white text-[9px] font-black uppercase px-2 py-0.5">
                  Tác phẩm: {viewingEditorComment.seriesTitle}
                </span>
                <span className="bg-gray-100 border border-black text-black text-[9px] font-black uppercase px-2 py-0.5">
                  Chương {viewingEditorComment.chapterNumber}: {viewingEditorComment.title}
                </span>
              </div>

              <h2 className="font-manga text-2xl font-black text-black border-b-2 border-dashed border-gray-250 pb-2 uppercase">
                {viewingEditorComment.latestManuscript.title}
              </h2>

              <div className="bg-red-50 border-2 border-red-500 p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
                {viewingEditorComment.editorComment || <em className="text-gray-400">Không có ý kiến nhận xét chi tiết...</em>}
              </div>
            </div>

            <div className="p-4 border-t-2 border-dashed border-gray-200 flex gap-4 bg-gray-50 flex-shrink-0">
              <button
                type="button"
                onClick={() => setViewingEditorComment(null)}
                className="w-full py-3 bg-[#E63946] text-white border-2 border-black font-black uppercase text-center transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-red-750 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                Đồng ý và Quay lại
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t-2 border-manga-ink flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-gray-500">
        <div className="font-manga text-2xl text-manga-red">MangaFlow</div>
        <div>© 2026 MangaFlow System. Gangan Press Co. Ltd. All rights reserved.</div>
        <div className="flex items-center gap-6">
          
          <a href="#" className="hover:text-manga-red transition-colors">Quy tắc xuất bản</a>
          <a href="#" className="hover:text-manga-red transition-colors">Hỗ trợ Mangaka</a>
        </div>
      </footer>
    </div>
  )
}
