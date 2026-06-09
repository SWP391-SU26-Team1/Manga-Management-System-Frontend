import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Layers, Image as ImageIcon, ClipboardList, Eye, Settings, FileCheck } from 'lucide-react'
import { mangakaStore, MangaPage, Chapter, Series } from '@/data/mangakaMockData'

export default function PageViewerPage() {
  const { pageId } = useParams()
  const navigate = useNavigate()

  const [page, setPage] = useState<MangaPage | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [series, setSeries] = useState<Series | null>(null)

  useEffect(() => {
    if (pageId) {
      const p = mangakaStore.getPages().find(p => p.id === pageId)
      if (p) {
        setPage(p)
        const c = mangakaStore.getChapters().find(c => c.id === p.chapterId)
        if (c) {
          setChapter(c)
          const s = mangakaStore.getSeries().find(s => s.id === c.seriesId)
          if (s) setSeries(s)
        }
      }
    }
  }, [pageId])

  if (!page || !chapter || !series) {
    return <div className="p-8 text-center font-bold text-red-500">Đang tải hoặc Không tìm thấy trang!</div>
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
              {series.title} - Ch.{chapter.chapterNumber} - Page {page.pageNumber}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/dashboard/mangaka/assign-task?pageId=${page.id}`)}
            className="flex items-center gap-2 bg-white px-4 py-2 border-2 border-manga-ink font-bold hover:bg-gray-100 text-sm uppercase"
          >
            <ClipboardList className="w-4 h-4" /> Giao Task
          </button>
          <button 
            onClick={() => navigate(`/dashboard/mangaka/submission?pageId=${page.id}`)}
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
