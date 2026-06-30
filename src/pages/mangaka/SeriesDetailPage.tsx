import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import {
  BookOpen, Clock, Layers, PlusSquare,
  FileCheck, ClipboardList, CheckCircle, AlertCircle, BarChart2, AlertTriangle, Users, UserPlus
} from 'lucide-react'
import { seriesService, SeriesAPI, getErrorMessage } from '@/services/series.service'
import { chapterService, ChapterAPI } from '@/services/chapter.service'
import { pageService, PageAPI } from '@/services/page.service'
import { taskService } from '@/services/task.service'
import { MangaPage } from '@/data/mangakaMockData'
import { ChapterLayerTable } from '@/components/mangaka/ChapterLayerTable'

const TABS = ['Danh sách Chapter', 'Trạng thái Board Review', 'Thành viên Series']

export default function SeriesDetailPage() {
  const { seriesId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [series, setSeries] = useState<SeriesAPI | null>(null)
  const [chapters, setChapters] = useState<ChapterAPI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Member Management States
  const [members, setMembers] = useState<any[]>([])
  const [newMemberUserId, setNewMemberUserId] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('assistant')
  const [memberError, setMemberError] = useState('')
  const [memberSuccess, setMemberSuccess] = useState('')
  const [isAddingMember, setIsAddingMember] = useState(false)

  // Page Expansion & Manga Reader States
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null)
  const [chapterPages, setChapterPages] = useState<{ [chapterId: string]: PageAPI[] }>({})
  const [chapterMangaPages, setChapterMangaPages] = useState<{ [chapterId: string]: MangaPage[] }>({})
  const [loadingPages, setLoadingPages] = useState<{ [chapterId: string]: boolean }>({})
  const [chapterViewModes, setChapterViewModes] = useState<{ [chapterId: string]: 'grid' | 'table' }>({})
  
  const [activeReaderChapter, setActiveReaderChapter] = useState<ChapterAPI | null>(null)
  const [readerPages, setReaderPages] = useState<PageAPI[]>([])
  const [readerCurrentPageIndex, setReaderCurrentPageIndex] = useState<number>(0)

  const toggleExpandChapter = async (chapterId: string) => {
    if (expandedChapterId === chapterId) {
      setExpandedChapterId(null)
      return
    }
    setExpandedChapterId(chapterId)
    
    // Only load if not cached yet
    if (!chapterPages[chapterId] || !chapterMangaPages[chapterId]) {
      setLoadingPages(prev => ({ ...prev, [chapterId]: true }))
      try {
        const pages = await pageService.getByChapterId(chapterId)
        // Sort by page number ascending
        const sortedPages = [...pages].sort((a, b) => a.page_number - b.page_number)
        
        // Fetch tasks of all pages in parallel
        const pagesTasks = await Promise.all(
          sortedPages.map(p => taskService.getByPage(seriesId!, chapterId, p._id).catch(() => []))
        )
        
        const mappedPages: MangaPage[] = sortedPages.map((page, idx) => {
          const pageTasks = pagesTasks[idx] || []
          
          const getLayerStatus = (type: string) => {
            const t = pageTasks.find(x => x.task_type === type)
            if (!t) return 'Not Started'
            const status = t.status.toLowerCase()
            if (status === 'approved' || status === 'completed') return 'Approved'
            if (status === 'needs_revision' || status === 'need_fix' || status === 'rejected') return 'Need Fix'
            if (status === 'submitted' || status === 'in_review') return 'Submitted'
            if (status === 'in_progress' || status === 'doing' || status === 'assigned') return 'Doing'
            return 'Not Started'
          }

          const mapOverallStatus = (status: string) => {
            const s = status.toLowerCase()
            if (s === 'approved' || s === 'published' || s === 'completed') return 'Approved'
            if (s === 'in_review' || s === 'submitted') return 'Submitted'
            if (s === 'draft' || s === 'doing' || s === 'in_progress') return 'Doing'
            return 'Not Started'
          }

          return {
            id: page._id,
            chapterId: page.chapter_id,
            pageNumber: page.page_number,
            thumbnailUrl: page.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
            panelFrameStatus: getLayerStatus('cleaning'),
            lineArtStatus: getLayerStatus('inking'),
            speechBalloonStatus: getLayerStatus('lettering'),
            backgroundStatus: getLayerStatus('background'),
            assetStatus: getLayerStatus('coloring'),
            assistantSubmissionStatus: getLayerStatus('sfx'),
            overallStatus: mapOverallStatus(page.status)
          }
        })

        setChapterPages(prev => ({ ...prev, [chapterId]: sortedPages }))
        setChapterMangaPages(prev => ({ ...prev, [chapterId]: mappedPages }))
      } catch (err) {
        console.error('Error fetching pages of chapter:', err)
      } finally {
        setLoadingPages(prev => ({ ...prev, [chapterId]: false }))
      }
    }
  }

  const openReader = async (chapter: ChapterAPI, startPageId?: string) => {
    let pages = chapterPages[chapter._id] || []
    
    if (pages.length === 0) {
      // Fetch if not cached
      try {
        pages = await pageService.getByChapterId(chapter._id)
        pages = [...pages].sort((a, b) => a.page_number - b.page_number)
        setChapterPages(prev => ({ ...prev, [chapter._id]: pages }))
      } catch (err) {
        console.error('Error fetching pages for reader:', err)
        return
      }
    }

    setReaderPages(pages)
    
    let startIndex = 0
    if (startPageId) {
      const idx = pages.findIndex(p => p._id === startPageId)
      if (idx !== -1) startIndex = idx
    }
    
    setReaderCurrentPageIndex(startIndex)
    setActiveReaderChapter(chapter)
  }

  const handlePrevPage = () => {
    if (readerCurrentPageIndex > 0) {
      setReaderCurrentPageIndex(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (readerCurrentPageIndex < readerPages.length - 1) {
      setReaderCurrentPageIndex(prev => prev + 1)
    }
  }

  // Keyboard navigation for reader
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeReaderChapter) return
      if (e.key === 'ArrowLeft') {
        handlePrevPage()
      } else if (e.key === 'ArrowRight') {
        handleNextPage()
      } else if (e.key === 'Escape') {
        setActiveReaderChapter(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeReaderChapter, readerCurrentPageIndex, readerPages.length])

  useEffect(() => {
    if (!seriesId) return
    const fetchData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [s, chs, mems] = await Promise.all([
          seriesService.getById(seriesId),
          chapterService.getBySeriesId(seriesId),
          seriesService.getMembers(seriesId),
        ])
        setSeries(s)
        setChapters([...chs].sort((a, b) => b.chapter_number - a.chapter_number))
        setMembers(mems)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [seriesId])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setMemberError('')
    setMemberSuccess('')
    if (!newMemberUserId.trim()) return

    setIsAddingMember(true)
    try {
      await seriesService.addMember(seriesId!, {
        user_id: newMemberUserId.trim(),
        role_in_series: newMemberRole,
      })
      setMemberSuccess('Thêm thành viên vào dự án thành công!')
      setNewMemberUserId('')
      const mems = await seriesService.getMembers(seriesId!)
      setMembers(mems)
    } catch (err) {
      setMemberError(getErrorMessage(err))
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleRemoveMember = async (seriesMemberId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa thành viên này khỏi Series?')) return
    try {
      await seriesService.removeMember(seriesId!, seriesMemberId)
      alert('Đã xóa thành viên thành công!')
      const mems = await seriesService.getMembers(seriesId!)
      setMembers(mems)
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  const getSeriesStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'under_review': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'in_production': return 'bg-green-100 text-green-700 border-green-300'
      case 'draft': return 'bg-gray-100 text-gray-500 border-gray-300'
      default: return 'bg-gray-100 text-gray-500 border-gray-300'
    }
  }

  const getSeriesStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      draft: 'Bản nháp',
      in_production: 'Đang vẽ',
      under_review: 'Chờ duyệt',
      published: 'Đã xuất bản',
    }
    return map[status] ?? status
  }

  const getChapterStatusClasses = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'under_review': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'in_progress': return 'bg-green-100 text-green-700 border-green-300'
      case 'draft': return 'bg-gray-100 text-gray-500 border-gray-300'
      case 'need_fix': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-500 border-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-manga-ink border-t-manga-red rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-500 uppercase text-sm">Đang tải dữ liệu series...</p>
      </div>
    )
  }

  if (error || !series) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-manga-red mx-auto mb-3" />
        <p className="font-bold text-manga-red text-lg">{error || 'Không tìm thấy series này!'}</p>
        <button
          onClick={() => navigate('/dashboard/mangaka/series')}
          className="mt-4 px-6 py-2 border-2 border-manga-ink font-bold text-sm uppercase hover:bg-gray-50"
        >
          ← Quay lại danh sách
        </button>
      </div>
    )
  }

  const tags = series.genre ? series.genre.split(', ').filter(Boolean) : []

  return (
    <div className="pb-16">
      {/* Title block */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-ink leading-none flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-manga-red" />
            {series.title}
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-1">Chi tiết tác phẩm & trạng thái Board Review</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Cover & Info */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white border-4 border-manga-ink manga-shadow overflow-hidden">
            <div className="aspect-[3/4] bg-gray-200 border-b-4 border-manga-ink relative">
              {series.cover_image ? (
                <img src={series.cover_image} alt={series.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <BookOpen className="w-16 h-16 mb-2" />
                  <span className="font-bold text-sm">NO COVER</span>
                </div>
              )}
            </div>
            <div className="p-5 space-y-3">
              <h2 className="text-xl font-black uppercase tracking-tight leading-none">{series.title}</h2>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 border border-manga-ink text-[10px] font-bold uppercase bg-gray-50">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-4">{series.description}</p>

              <div className="pt-2 space-y-2 border-t-2 border-dashed border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold text-xs uppercase">Trạng thái:</span>
                  <span className={`px-2 py-0.5 font-bold uppercase text-[10px] border-2 ${getSeriesStatusColor(series.status)}`}>
                    {getSeriesStatusLabel(series.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold text-xs uppercase">Tạo ngày:</span>
                  <span className="font-bold text-xs">{new Date(series.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 space-y-2">
                <Link
                  to={`/dashboard/mangaka/series/${series._id}/create-chapter`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-manga-red text-white font-manga font-bold text-xs uppercase border-2 border-manga-ink hover:bg-red-700 transition-colors"
                >
                  <PlusSquare className="w-4 h-4" /> Tạo Chapter
                </Link>
                <Link
                  to={`/dashboard/mangaka/assign-task?seriesId=${series._id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-manga-ink font-bold text-xs uppercase border-2 border-manga-ink hover:bg-gray-50 transition-colors"
                >
                  <ClipboardList className="w-4 h-4" /> Giao việc trợ lý
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Chapter', value: chapters.length, icon: Layers },
              { label: 'Đang vẽ', value: chapters.filter(c => c.status === 'in_progress').length, icon: Clock },
              { label: 'Hoàn thành', value: chapters.filter(c => c.status === 'completed').length, icon: CheckCircle },
            ].map(stat => (
              <div key={stat.label} className="bg-white border-2 border-manga-ink p-3 text-center">
                <stat.icon className="w-4 h-4 mx-auto mb-1 text-manga-red" />
                <div className="font-manga text-2xl font-bold leading-none">{stat.value}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Tabbed Content */}
        <div className="flex-1 min-w-0">
          {/* Tab headers */}
          <div className="flex border-b-4 border-manga-ink mb-0">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`px-5 py-3 font-manga font-bold text-sm uppercase border-2 border-b-0 transition-colors flex items-center gap-2 ${
                  activeTab === idx
                    ? 'bg-manga-ink text-white border-manga-ink'
                    : 'bg-white text-manga-ink border-manga-ink hover:bg-gray-50'
                }`}
              >
                {idx === 0 ? <Layers className="w-4 h-4" /> : idx === 1 ? <BarChart2 className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white border-4 border-t-0 border-manga-ink manga-shadow">

            {/* ── TAB 0: Chapter list ── */}
            {activeTab === 0 && (
              <>
                <div className="p-4 border-b-2 border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-500 uppercase">{chapters.length} chapter</span>
                  <Link
                    to={`/dashboard/mangaka/series/${series._id}/create-chapter`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-manga-red text-white font-bold text-xs uppercase border-2 border-manga-ink hover:bg-red-700 transition-colors"
                  >
                    <PlusSquare className="w-3.5 h-3.5" /> Thêm chapter
                  </Link>
                </div>
                <div className="divide-y-2 divide-gray-100">
                  {chapters.map(chapter => (
                    <div key={chapter._id} className="flex flex-col">
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-red-50/20 transition-colors">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-manga text-2xl font-bold text-manga-red">CH.{chapter.chapter_number}</span>
                            <h3 className="font-bold text-base">{chapter.title}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                            <span className="flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Tạo: {new Date(chapter.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 font-bold uppercase text-[10px] border-2 ${getChapterStatusClasses(chapter.status)}`}>
                            {chapter.status}
                          </span>
                          
                          <button
                            onClick={() => toggleExpandChapter(chapter._id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-manga-ink font-bold text-xs uppercase transition-colors ${
                              expandedChapterId === chapter._id
                                ? 'bg-manga-ink text-white'
                                : 'bg-white text-manga-ink hover:bg-gray-100'
                            }`}
                            title="Chi tiết từng trang"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            {expandedChapterId === chapter._id ? 'Đóng chi tiết' : 'Chi tiết trang'}
                          </button>

                          <button
                            onClick={() => navigate('/dashboard/mangaka/manuscripts')}
                            className="p-2 border-2 border-manga-ink bg-white hover:bg-manga-ink hover:text-white transition-colors"
                            title="Xem bản thảo"
                          >
                            <FileCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expansion area */}
                      {expandedChapterId === chapter._id && (
                        <div className="p-5 bg-gray-50 border-t-2 border-manga-ink">
                          {loadingPages[chapter._id] ? (
                            <div className="py-8 text-center">
                              <div className="w-6 h-6 border-2 border-black border-t-[#E63946] rounded-full animate-spin mx-auto mb-2" />
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Đang tải chi tiết trang...</p>
                            </div>
                          ) : !chapterPages[chapter._id] || chapterPages[chapter._id].length === 0 ? (
                            <div className="py-6 text-center text-xs font-bold text-gray-400 uppercase">
                              Chưa có trang nào được tạo cho chapter này.
                            </div>
                          ) : (
                            <div>
                              {/* Header with Quick Read and View Toggle */}
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                    Danh sách {chapterPages[chapter._id].length} trang bản thảo
                                  </span>
                                  {/* View Switcher buttons */}
                                  <div className="flex border border-black text-[9px] font-bold">
                                    <button
                                      onClick={() => setChapterViewModes(prev => ({ ...prev, [chapter._id]: 'grid' }))}
                                      className={`px-2 py-1 uppercase transition-all ${
                                        (chapterViewModes[chapter._id] || 'grid') === 'grid'
                                          ? 'bg-black text-white'
                                          : 'bg-white text-black hover:bg-gray-100'
                                      }`}
                                    >
                                      Lưới ảnh
                                    </button>
                                    <button
                                      onClick={() => setChapterViewModes(prev => ({ ...prev, [chapter._id]: 'table' }))}
                                      className={`px-2 py-1 uppercase transition-all ${
                                        chapterViewModes[chapter._id] === 'table'
                                          ? 'bg-black text-white'
                                          : 'bg-white text-black hover:bg-gray-100'
                                      }`}
                                    >
                                      Bảng tiến độ
                                    </button>
                                  </div>
                                </div>
                                {chapterPages[chapter._id].some(p => p.image_url) && (
                                  <button
                                    onClick={() => openReader(chapter)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E63946] text-white border-2 border-black font-manga font-bold text-[10px] uppercase hover:bg-red-700 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none"
                                  >
                                    Đọc Chapter
                                  </button>
                                )}
                              </div>

                              {/* Render Grid View */}
                              {(chapterViewModes[chapter._id] || 'grid') === 'grid' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                  {chapterPages[chapter._id].map((page) => {
                                    const hasImage = !!page.image_url
                                    return (
                                      <div
                                        key={page._id}
                                        onClick={() => openReader(chapter, page._id)}
                                        className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex flex-col group"
                                      >
                                        {/* Thumbnail Container */}
                                        <div className="aspect-[3/4] border border-gray-200 bg-gray-50 overflow-hidden relative mb-2 flex items-center justify-center">
                                          {hasImage ? (
                                            <img
                                              src={page.image_url!}
                                              alt={`Trang ${page.page_number}`}
                                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 text-gray-400 bg-gray-50">
                                              <Layers className="w-5 h-5 mb-1 text-gray-300" />
                                              <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">Đang vẽ lớp</span>
                                            </div>
                                          )}
                                          
                                          {/* Overlay status badge */}
                                          {!(page.status === 'approved' || page.status === 'published' || hasImage) && (
                                            <div className="absolute top-1 right-1">
                                              <span className={`px-1.5 py-0.5 border text-[7px] font-black uppercase rounded-none leading-none inline-block ${
                                                page.status === 'in_review'
                                                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                                                  : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                              }`}>
                                                {page.status === 'in_review' ? 'Chờ duyệt' : 'Đang vẽ'}
                                              </span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Page info */}
                                        <div className="text-center mt-auto">
                                          <p className="font-manga text-xs font-bold text-manga-ink">Trang {page.page_number}</p>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                /* Render Progress Table View using ChapterLayerTable component */
                                <ChapterLayerTable
                                  pages={chapterMangaPages[chapter._id] || []}
                                  seriesId={series._id}
                                  chapterId={chapter._id}
                                  chapterNumber={chapter.chapter_number}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {chapters.length === 0 && (
                    <div className="p-12 text-center text-gray-400 font-bold">
                      Series này chưa có chapter nào.
                      <br />
                      <Link
                        to={`/dashboard/mangaka/series/${series._id}/create-chapter`}
                        className="mt-3 inline-block text-manga-red hover:underline text-sm"
                      >
                        + Tạo chapter đầu tiên
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── TAB 1: Board Review Status ── */}
            {activeTab === 1 && (
              <div className="p-6">
                <div className="py-12 text-center border-2 border-dashed border-gray-200">
                  <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-bold text-gray-400 text-sm">Chưa có lần trình duyệt nào cho series này.</p>
                  <p className="text-xs text-gray-400 font-bold mt-1 uppercase">
                    Trạng thái xét duyệt sẽ xuất hiện ở đây sau khi bạn nộp hồ sơ lên Hội đồng.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB 2: Series Members ── */}
            {activeTab === 2 && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Add Member Form */}
                  <div className="lg:col-span-1 border-2 border-manga-ink p-5 bg-gray-50">
                    <h3 className="font-manga text-xl font-bold uppercase mb-4 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-manga-red" />
                      Thêm thành viên
                    </h3>

                    <form onSubmit={handleAddMember} className="space-y-4 font-bold text-sm text-manga-ink">
                      {memberError && (
                        <div className="bg-red-50 border border-manga-red p-2.5 text-xs text-manga-red uppercase flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {memberError}
                        </div>
                      )}
                      {memberSuccess && (
                        <div className="bg-green-50 border border-green-500 p-2.5 text-xs text-green-700 uppercase flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {memberSuccess}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs uppercase tracking-widest mb-1.5">User ID Trợ lý (UUID) *</label>
                        <input
                          type="text"
                          required
                          value={newMemberUserId}
                          onChange={e => setNewMemberUserId(e.target.value)}
                          placeholder="Nhập UUID từ Supabase..."
                          className="w-full border-2 border-manga-ink px-3 py-2 text-sm focus:outline-none focus:border-manga-red bg-white"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Copy mã UUID (User ID) của tài khoản trợ lý</p>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-widest mb-1.5">Vai trò trong dự án *</label>
                        <select
                          value={newMemberRole}
                          onChange={e => setNewMemberRole(e.target.value)}
                          className="w-full border-2 border-manga-ink px-3 py-2 text-sm focus:outline-none focus:border-manga-red bg-white"
                        >
                          <option value="assistant">Assistant (Trợ lý vẽ)</option>
                          <option value="mangaka">Mangaka (Đồng tác giả)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isAddingMember}
                        className="w-full bg-manga-red hover:bg-red-700 text-white font-manga font-bold text-xs uppercase py-3 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
                      >
                        {isAddingMember ? 'Đang xử lý...' : 'Thêm thành viên'}
                      </button>
                    </form>
                  </div>

                  {/* Right: Members List */}
                  <div className="lg:col-span-2">
                    <h3 className="font-manga text-xl font-bold uppercase mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-manga-red" />
                      Danh sách trợ lý tham gia ({members.length})
                    </h3>

                    <div className="border-2 border-manga-ink overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-manga-ink text-white font-bold text-[11px] uppercase tracking-wider">
                            <th className="p-3 border-r border-manga-ink/20">Thành viên</th>
                            <th className="p-3 border-r border-manga-ink/20">Vai trò chính</th>
                            <th className="p-3 border-r border-manga-ink/20">Vai trò Series</th>
                            <th className="p-3 text-center">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-gray-100">
                          {members.map((m) => (
                            <tr key={m.series_member_id} className="font-semibold text-xs text-manga-ink hover:bg-red-50/20 transition-colors">
                              <td className="p-4 border-r border-gray-100 align-middle">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-manga-ink/20">
                                    {m.users?.avatar_url ? (
                                      <img src={m.users.avatar_url} alt={m.users.username} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 bg-gray-100 uppercase">{m.users?.username?.[0] ?? '?'}</div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-sm">{m.users?.name || m.users?.username || 'Chưa đặt tên'}</div>
                                    <div className="text-[10px] text-gray-400 font-bold">{m.users?.email || 'Không có email'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 border-r border-gray-100 align-middle text-gray-500 uppercase font-bold text-[10px]">
                                {m.users?.role || 'N/A'}
                              </td>
                              <td className="p-4 border-r border-gray-100 align-middle">
                                <span className="px-2 py-0.5 border border-manga-ink bg-gray-50 font-bold uppercase text-[10px]">
                                  {m.role_in_series}
                                </span>
                              </td>
                              <td className="p-4 align-middle text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(m.series_member_id)}
                                  className="text-manga-red hover:underline font-bold text-xs uppercase"
                                >
                                  Xóa khỏi Series
                                </button>
                              </td>
                            </tr>
                          ))}

                          {members.length === 0 && (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-gray-400 font-bold uppercase text-xs">
                                Chưa có trợ lý nào được thêm vào dự án này.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manga Reader Modal */}
      {activeReaderChapter && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center font-bold text-white select-none animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="w-full bg-manga-ink border-b-2 border-gray-800 px-6 py-4 flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-manga text-xl text-manga-red tracking-wide uppercase">
                {series.title}
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase mt-0.5">
                Chương {activeReaderChapter.chapter_number}: {activeReaderChapter.title}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono bg-gray-800 px-3 py-1 border border-gray-700 uppercase">
                Trang {readerCurrentPageIndex + 1} / {readerPages.length}
              </span>
              <button
                onClick={() => setActiveReaderChapter(null)}
                className="px-4 py-1.5 bg-[#E63946] border border-black hover:bg-red-700 text-xs font-black uppercase transition-all"
              >
                Đóng lại
              </button>
            </div>
          </div>

          {/* Reader Area */}
          <div className="flex-1 w-full max-w-4xl flex items-center justify-between p-4 relative min-h-0">
            {/* Prev Button */}
            <button
              onClick={handlePrevPage}
              disabled={readerCurrentPageIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#E63946] border border-gray-700 p-4 rounded-none hover:scale-105 transition-all disabled:opacity-30 disabled:pointer-events-none z-10 font-black text-lg"
            >
              ←
            </button>

            {/* Main Image Container */}
            <div className="w-full h-full flex items-center justify-center p-4">
              {readerPages.length > 0 ? (
                <div className="relative max-h-full max-w-full flex flex-col items-center justify-center">
                  {readerPages[readerCurrentPageIndex].image_url ? (
                    <img
                      src={readerPages[readerCurrentPageIndex].image_url!}
                      alt={`Trang ${readerPages[readerCurrentPageIndex].page_number}`}
                      className="max-h-[70vh] object-contain border-2 border-gray-800 bg-white"
                    />
                  ) : (
                    <div className="w-[300px] aspect-[3/4] border-2 border-dashed border-gray-600 flex flex-col items-center justify-center p-6 text-center text-gray-400 bg-gray-900">
                      <Layers className="w-12 h-12 mb-3 text-gray-600" />
                      <p className="text-sm font-bold uppercase text-gray-300">Trang chưa hoàn thiện</p>
                      <p className="text-xs mt-2 leading-relaxed">Trang này chưa được duyệt hoặc ghép các lớp ảnh vẽ.</p>
                    </div>
                  )}
                  <div className="mt-3 text-center">
                    <span className="text-xs bg-black/40 px-3 py-1 font-bold text-gray-400 border border-gray-800">
                      Bản thảo Trang {readerPages[readerCurrentPageIndex].page_number} ({readerPages[readerCurrentPageIndex].status.toUpperCase()})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 uppercase">
                  Không có trang truyện nào được tải.
                </div>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextPage}
              disabled={readerCurrentPageIndex === readerPages.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#E63946] border border-gray-700 p-4 rounded-none hover:scale-105 transition-all disabled:opacity-30 disabled:pointer-events-none z-10 font-black text-lg"
            >
              →
            </button>
          </div>

          {/* Bottom Thumbnail Navigator */}
          {readerPages.length > 1 && (
            <div className="w-full bg-manga-ink border-t border-gray-800 p-4 shrink-0 flex justify-center gap-2 overflow-x-auto min-h-0 select-none">
              {readerPages.map((p, idx) => (
                <button
                  key={p._id}
                  onClick={() => setReaderCurrentPageIndex(idx)}
                  className={`w-12 h-16 border-2 relative shrink-0 transition-all ${
                    readerCurrentPageIndex === idx
                      ? 'border-[#E63946] scale-105 shadow-md shadow-[#E63946]/20'
                      : 'border-gray-800 opacity-60 hover:opacity-100'
                  } bg-gray-900 overflow-hidden`}
                >
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-500">
                      P.{p.page_number}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[8px] text-center text-gray-300 font-mono">
                    {p.page_number}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
