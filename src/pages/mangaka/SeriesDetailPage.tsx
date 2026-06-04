import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { ArrowLeft, BookOpen, Clock, Layers, PlusSquare, FileCheck } from 'lucide-react'
import { mangakaStore, Series, Chapter } from '@/data/mangakaMockData'

export default function SeriesDetailPage() {
  const { seriesId } = useParams()
  const navigate = useNavigate()

  const [series, setSeries] = useState<Series | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])

  useEffect(() => {
    if (seriesId) {
      const s = mangakaStore.getSeries().find(s => s.id === seriesId)
      if (s) {
        setSeries(s)
        setChapters(mangakaStore.getChapters().filter(c => c.seriesId === seriesId).sort((a,b) => b.chapterNumber - a.chapterNumber))
      }
    }
  }, [seriesId])

  if (!series) {
    return <div className="p-8 text-center font-bold text-red-500">Đang tải hoặc Không tìm thấy Series!</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Waiting Review': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'In Production': return 'bg-green-100 text-green-700 border-green-300'
      case 'Draft': return 'bg-gray-100 text-gray-500 border-gray-300'
      default: return 'bg-gray-100 text-gray-500 border-gray-300'
    }
  }

  const getChapterStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Waiting Review': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'Drawing': return 'bg-green-100 text-green-700 border-green-300'
      case 'Sketching': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'Draft': return 'bg-gray-100 text-gray-500 border-gray-300'
      default: return 'bg-gray-100 text-gray-500 border-gray-300'
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/dashboard/mangaka/series')} className="p-2 border-2 border-manga-ink hover:bg-gray-100 bg-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="font-manga text-4xl font-bold uppercase text-manga-red tracking-wide flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            CHI TIẾT SERIES
          </h1>
          <p className="text-gray-600 font-bold">Quản lý tổng quan và các chapter của {series.title}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        {/* Cover & General Info */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white border-4 border-manga-ink manga-shadow overflow-hidden">
            <div className="aspect-[3/4] bg-gray-200 border-b-4 border-manga-ink relative">
               {series.coverUrl ? (
                <img src={series.coverUrl} alt={series.title} className="w-full h-full object-cover" />
               ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <BookOpen className="w-16 h-16 mb-2" />
                  <span className="font-bold">NO COVER</span>
                </div>
               )}
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2 leading-none">{series.title}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {series.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 border border-manga-ink text-[10px] font-bold uppercase bg-gray-100">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-700 font-medium mb-4 line-clamp-4">{series.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold uppercase">Trạng thái:</span>
                  <span className={`px-2 py-0.5 font-bold uppercase text-xs border ${getStatusColor(series.status)}`}>
                    {series.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold uppercase">Tạo ngày:</span>
                  <span className="font-bold">{new Date(series.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold uppercase">Deadline tiếp:</span>
                  <span className="font-bold text-red-600">{new Date(series.nextDeadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="flex-1">
          <div className="bg-white border-4 border-manga-ink manga-shadow">
            <div className="p-4 border-b-4 border-manga-ink bg-gray-50 flex justify-between items-center">
              <h2 className="font-manga font-bold text-xl uppercase flex items-center gap-2">
                <Layers className="w-6 h-6 text-manga-red" />
                Danh sách Chapter ({chapters.length})
              </h2>
              <Link 
                to={`/dashboard/mangaka/series/${series.id}/create-chapter`}
                className="bg-manga-red text-white font-manga font-bold px-4 py-2 border-2 border-manga-ink hover:bg-red-700 uppercase flex items-center gap-2 text-sm"
              >
                <PlusSquare className="w-4 h-4" /> Tạo Chapter
              </Link>
            </div>
            <div className="divide-y-2 divide-gray-100">
              {chapters.map(chapter => (
                <div key={chapter.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-red-50/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-manga text-2xl font-bold text-manga-red">CH.{chapter.chapterNumber}</span>
                      <h3 className="font-bold text-lg">{chapter.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 font-bold">
                      <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {chapter.totalPages} trang</span>
                      <span className="flex items-center gap-1 text-red-600"><Clock className="w-4 h-4" /> Deadline: {new Date(chapter.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 font-bold uppercase text-xs border-2 ${getChapterStatusColor(chapter.status)}`}>
                      {chapter.status}
                    </span>
                    <button onClick={() => navigate('/dashboard/mangaka/chapters')} className="p-2 border-2 border-manga-ink bg-white hover:bg-manga-ink hover:text-white transition-colors">
                      <FileCheck className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {chapters.length === 0 && (
                <div className="p-12 text-center text-gray-500 font-bold">
                  Series này chưa có chapter nào.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
