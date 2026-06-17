import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Layers, Image as ImageIcon, ClipboardList, Eye, Settings, FileCheck } from 'lucide-react'
import { seriesService } from '@/services/series.service'
import { chapterService } from '@/services/chapter.service'
import { pageService } from '@/services/page.service'
import { taskService } from '@/services/task.service'

interface DerivedPage {
  id: string
  pageNumber: number
  thumbnailUrl: string
  panelFrameStatus: string
  lineArtStatus: string
  speechBalloonStatus: string
  backgroundStatus: string
  assetStatus: string
  overallStatus: string
}

export default function PageViewerPage() {
  const { pageId } = useParams()
  const navigate = useNavigate()

  const [page, setPage] = useState<DerivedPage | null>(null)
  const [chapter, setChapter] = useState<any | null>(null)
  const [series, setSeries] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pageId) return

    const fetchPageData = async () => {
      try {
        setLoading(true)
        // 1. Fetch page detail
        const pageData = await pageService.getPageById(pageId)
        
        // 2. Fetch chapter details
        const chapterData = await chapterService.getById(pageData.chapter_id)
        setChapter(chapterData)

        // 3. Fetch series details
        const seriesData = await seriesService.getById(chapterData.series_id)
        setSeries(seriesData)

        // 4. Fetch tasks of page
        const tasks = await taskService.getByPage(seriesData._id, chapterData._id, pageId)

        const getLayerStatus = (type: string) => {
          const t = tasks.find(x => x.task_type === type)
          if (!t) return 'Not Started'
          if (t.status === 'in_progress') return 'Doing'
          if (t.status === 'submitted') return 'Submitted'
          if (t.status === 'needs_revision') return 'Need Fix'
          if (t.status === 'approved') return 'Approved'
          return 'Not Started'
        }

        const mapOverallStatus = (status: string) => {
          if (status === 'approved' || status === 'published') return 'Approved'
          if (status === 'in_review') return 'Submitted'
          if (status === 'draft') return 'Doing'
          return 'Not Started'
        }

        setPage({
          id: pageId,
          pageNumber: pageData.page_number,
          thumbnailUrl: pageData.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
          panelFrameStatus: getLayerStatus('cleaning'), // Panel Frame mapped to cleaning
          lineArtStatus: getLayerStatus('inking'), // Line Art mapped to inking
          backgroundStatus: getLayerStatus('background'),
          speechBalloonStatus: getLayerStatus('lettering'),
          assetStatus: getLayerStatus('coloring'),
          overallStatus: mapOverallStatus(pageData.status)
        })
      } catch (err) {
        console.error('Lỗi khi tải chi tiết trang:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPageData()
  }, [pageId])

  if (loading) {
    return <div className="p-8 h-screen flex items-center justify-center font-bold text-manga-ink">Đang tải chi tiết trang bản thảo...</div>
  }

  if (!page || !chapter || !series) {
    return <div className="p-8 text-center font-bold text-red-500">Không tìm thấy trang bản thảo hoặc có lỗi xảy ra!</div>
  }

  const layers = [
    { name: "Panel Frame", status: page.panelFrameStatus },
    { name: "Line Art", status: page.lineArtStatus },
    { name: "Background", status: page.backgroundStatus },
    { name: "Speech Balloon", status: page.speechBalloonStatus },
    { name: "Reference Asset", status: page.assetStatus },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700 border-green-300'
      case 'Need Fix': return 'bg-red-100 text-red-700 border-red-300'
      case 'Submitted': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Doing': return 'bg-orange-100 text-orange-700 border-orange-300'
      default: return 'bg-gray-100 text-gray-500 border-gray-300'
    }
  }

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-manga text-2xl font-bold uppercase text-manga-red tracking-wide flex items-center gap-2">
              {series.title} - Ch.{chapter.chapter_number} - Page {page.pageNumber}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/dashboard/mangaka/assign-task?seriesId=${series._id}&chapterId=${chapter._id}&pageId=${page.id}`)}
            className="flex items-center gap-2 bg-white px-4 py-2 border-2 border-manga-ink font-bold hover:bg-gray-100 text-sm uppercase"
          >
            <ClipboardList className="w-4 h-4" /> Giao Task
          </button>
          <button 
            onClick={() => navigate(`/dashboard/mangaka/submission?seriesId=${series._id}&chapterId=${chapter._id}&pageId=${page.id}`)}
            className="flex items-center gap-2 bg-manga-ink text-white px-4 py-2 border-2 border-manga-ink font-bold hover:bg-gray-800 text-sm uppercase"
          >
            <FileCheck className="w-4 h-4" /> Nộp / Duyệt bài
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Main Viewer */}
        <div className="flex-1 bg-gray-100 border-4 border-manga-ink manga-shadow relative overflow-hidden flex items-center justify-center p-4">
          <img 
            src={page.thumbnailUrl} 
            alt={`Page ${page.pageNumber}`} 
            className="max-w-full max-h-full object-contain border-2 border-dashed border-gray-400 bg-white"
          />
          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
            <button className="bg-white/80 backdrop-blur p-2 border-2 border-manga-ink hover:bg-white"><Eye className="w-5 h-5" /></button>
            <button className="bg-white/80 backdrop-blur p-2 border-2 border-manga-ink hover:bg-white"><ImageIcon className="w-5 h-5" /></button>
            <button className="bg-white/80 backdrop-blur p-2 border-2 border-manga-ink hover:bg-white"><Settings className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Layers Panel */}
        <div className="w-80 bg-white border-4 border-manga-ink manga-shadow shrink-0 flex flex-col">
          <div className="p-4 border-b-4 border-manga-ink bg-manga-ink text-white flex items-center gap-2">
            <Layers className="w-5 h-5" />
            <h2 className="font-manga font-bold text-lg uppercase">Lớp bản thảo</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {layers.map(layer => (
              <div key={layer.name} className="border-2 border-gray-200 p-3">
                <p className="font-bold text-sm uppercase text-gray-800 mb-2">{layer.name}</p>
                <div className={`px-3 py-1 font-bold text-xs uppercase border-2 text-center ${getStatusColor(layer.status)}`}>
                  {layer.status}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t-4 border-manga-ink bg-gray-50 text-center">
            <p className="text-sm font-bold text-gray-500 uppercase">Trạng thái chung</p>
            <div className={`mt-2 p-2 font-bold uppercase text-lg border-2 ${getStatusColor(page.overallStatus)}`}>
              {page.overallStatus}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
